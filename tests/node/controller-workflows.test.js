const assert = require("node:assert/strict");
const test = require("node:test");

const { createDocumentController } = require("../../frontend/scripts/document-controller");
const {
  createControllerEvents,
  createFakeClock
} = require("./helpers/controller-fakes");

function createDocumentPort(state) {
  return {
    getContent: () => state.content,
    getFileIdentity: () => ({
      fileName: state.fileName,
      filePath: state.filePath
    })
  };
}

test("controller workflows apply successful load, save, and new-document results", async () => {
  const state = {
    content: "# Current",
    fileName: "current.md",
    filePath: "C:/notes/current.md"
  };
  const opened = {
    content: "# Loaded",
    fileName: "loaded.md",
    filePath: "C:/notes/loaded.md"
  };
  const saved = {
    fileName: "current.md",
    filePath: "C:/notes/current.md"
  };
  const bridgeCalls = [];
  const { calls, events } = createControllerEvents();
  const controller = createDocumentController({
    desktopBridge: {
      async openMarkdownFile() {
        bridgeCalls.push({ operation: "load" });
        return opened;
      },
      async saveMarkdownFile(payload) {
        bridgeCalls.push({ operation: "save", payload });
        return saved;
      }
    },
    dialogs: { confirmIfDirty: async () => true },
    document: createDocumentPort(state),
    events
  });

  assert.equal((await controller.loadDocument()).status, "loaded");
  assert.deepEqual(calls.loaded, [opened]);

  assert.equal((await controller.saveDocument(false)).status, "saved");
  assert.deepEqual(bridgeCalls[1].payload, {
    content: "# Current",
    filePath: "C:/notes/current.md",
    saveAs: false,
    suggestedName: "current.md"
  });
  assert.deepEqual(calls.saved, [{ context: { saveAs: false }, result: saved }]);

  assert.equal((await controller.createNewDocument()).status, "created");
  assert.equal(calls.newDocuments, 1);
});

test("dialog and desktop cancellations leave controller callbacks untouched", async () => {
  let openCalls = 0;
  const { calls, events } = createControllerEvents();
  const controller = createDocumentController({
    desktopBridge: {
      async openMarkdownFile() {
        openCalls += 1;
        return { content: "not reached" };
      },
      async saveMarkdownFile() {
        return null;
      }
    },
    dialogs: { confirmIfDirty: async () => false },
    document: createDocumentPort({ content: "draft", fileName: "draft.md", filePath: "" }),
    events
  });

  assert.equal((await controller.loadDocument()).status, "cancelled");
  assert.equal((await controller.createNewDocument()).status, "cancelled");
  assert.equal((await controller.saveDocument(true)).status, "cancelled");
  assert.equal(openCalls, 0);
  assert.deepEqual(calls.loaded, []);
  assert.deepEqual(calls.saved, []);
  assert.equal(calls.newDocuments, 0);
});

test("desktop failures are reported without applying a document result", async () => {
  const failure = new Error("disk unavailable");
  const { calls, events } = createControllerEvents();
  const controller = createDocumentController({
    desktopBridge: {
      async openMarkdownFile() {
        throw failure;
      }
    },
    dialogs: { confirmIfDirty: async () => true },
    events
  });

  const result = await controller.loadDocument();
  assert.equal(result.status, "failed");
  assert.equal(result.error, failure);
  assert.deepEqual(calls.loaded, []);
  assert.deepEqual(calls.errors, [{ error: failure, operation: "loadDocument" }]);
  assert.equal(calls.toasts.at(-1).title, "Load failed");
});

test("rescheduling a draft clears the stale timer and persists only the latest content", () => {
  const state = { content: "first revision", fileName: "", filePath: "" };
  const clock = createFakeClock();
  const persisted = [];
  const { events } = createControllerEvents();
  const controller = createDocumentController({
    clock,
    document: createDocumentPort(state),
    events,
    isAutosaveEnabled: () => true,
    storage: { saveDraft: (content) => persisted.push(content) }
  });

  const first = controller.scheduleDraftSave(false);
  state.content = "latest revision";
  const second = controller.scheduleDraftSave(false);

  assert.equal(first.status, "scheduled");
  assert.equal(second.status, "scheduled");
  assert.deepEqual(clock.cleared, [first.timer]);
  assert.equal(clock.pendingCount(), 1);

  clock.runAll();
  assert.deepEqual(persisted, ["latest revision"]);
});

test("missing controller dependencies return unavailable outcomes", async () => {
  const { calls, events } = createControllerEvents();
  const controller = createDocumentController({ events });

  assert.deepEqual(await controller.loadDocument(), {
    dependency: "desktopBridge.openMarkdownFile",
    status: "unavailable"
  });
  assert.deepEqual(await controller.saveDocument(false), {
    dependency: "desktopBridge.saveMarkdownFile",
    status: "unavailable"
  });
  assert.deepEqual(await controller.createNewDocument(), {
    dependency: "dialogs.confirmIfDirty",
    status: "unavailable"
  });
  assert.deepEqual(controller.persistDraft(false), {
    dependency: "storage.saveDraft",
    status: "unavailable"
  });
  assert.deepEqual(controller.scheduleDraftSave(false), {
    dependency: "clock",
    status: "unavailable"
  });
  assert.deepEqual(calls.missing, [
    "desktopBridge.openMarkdownFile",
    "desktopBridge.saveMarkdownFile",
    "dialogs.confirmIfDirty",
    "storage.saveDraft",
    "clock"
  ]);
});

function createFileState(overrides = {}) {
  return {
    contentHash: "hash-1",
    exists: true,
    filePath: "C:/notes/current.md",
    modifiedAt: 1,
    size: 10,
    ...overrides
  };
}

test("external changes can be reloaded without discarding the decision flow", async () => {
  const state = { content: "Quill draft", fileName: "current.md", filePath: "C:/notes/current.md" };
  const baseline = createFileState();
  const external = createFileState({ contentHash: "hash-2", modifiedAt: 2 });
  const reloaded = {
    content: "External version",
    fileName: "current.md",
    filePath: state.filePath,
    fileState: external
  };
  const decisions = [];
  const reloads = [];
  const controller = createDocumentController({
    desktopBridge: {
      async inspectMarkdownFile() { return external; },
      async verifyMarkdownFile() { return external; },
      async reopenMarkdownFile() { return reloaded; }
    },
    dialogs: { confirmExternalChange: async () => "reload" },
    document: createDocumentPort(state),
    events: {
      onExternalReloaded(result) { reloads.push(result); },
      onExternalKept() { decisions.push("keep"); }
    }
  });

  controller.setFileBaseline(baseline);
  assert.equal((await controller.checkExternalChange()).status, "reloaded");
  assert.deepEqual(reloads, [reloaded]);
  assert.deepEqual(decisions, []);
});

test("keeping an external change preserves the Quill version and suppresses repeat prompts", async () => {
  const baseline = createFileState();
  const external = createFileState({ contentHash: "hash-2", modifiedAt: 2 });
  let prompts = 0;
  const controller = createDocumentController({
    desktopBridge: {
      async inspectMarkdownFile() { return external; },
      async verifyMarkdownFile() { return external; }
    },
    dialogs: { confirmExternalChange: async () => { prompts += 1; return "keep"; } },
    document: createDocumentPort({ content: "Quill draft", fileName: "current.md", filePath: baseline.filePath }),
    events: {}
  });

  controller.setFileBaseline(baseline);
  assert.equal((await controller.checkExternalChange()).status, "kept");
  assert.equal((await controller.checkExternalChange()).status, "unchanged");
  assert.equal(prompts, 1);
});
