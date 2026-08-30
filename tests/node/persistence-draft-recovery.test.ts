import type {} from "node:test";

const assert = require("node:assert/strict");
const test = require("node:test");

const {
  createControlledWriter,
  createDraftStore,
  createPersistenceSession
} = require("./helpers/persistence-contract.ts");

test("draft recovery selects the highest revision for the requested document", () => {
  const draftStore = createDraftStore();
  const session = createPersistenceSession({
    draftStore,
    documentId: "document-a",
    filePath: "C:/notes/a.md",
    content: "initial"
  });

  session.edit("revision one");
  session.persistDraft(100);
  session.edit("revision two");
  session.persistDraft(200);

  draftStore.persist({
    documentId: "document-a",
    filePath: "C:/notes/a.md",
    content: "late completion of revision one",
    revision: 1,
    savedAt: 300
  });
  draftStore.persist({
    documentId: "document-b",
    filePath: "C:/notes/b.md",
    content: "other document",
    revision: 99,
    savedAt: 400
  });

  session.openDocument({ documentId: "temporary", content: "temporary" });
  assert.deepEqual(session.restoreLatestDraft("document-a"), {
    documentId: "document-a",
    filePath: "C:/notes/a.md",
    content: "revision two",
    revision: 2,
    dirty: true
  });
});

test("a failed disk save does not remove the newest recoverable draft", async () => {
  const writer = createControlledWriter();
  const draftStore = createDraftStore();
  const session = createPersistenceSession({
    writer,
    draftStore,
    documentId: "document-a",
    filePath: "C:/notes/a.md",
    content: "initial"
  });

  session.edit("recover me");
  session.persistDraft(100);
  const pendingSave = session.save();
  writer.calls[0].reject(new Error("write failed"));

  assert.equal((await pendingSave).status, "failed");
  session.openDocument({ documentId: "temporary", content: "temporary" });
  assert.equal(session.restoreLatestDraft("document-a").content, "recover me");
  assert.equal(session.getState().dirty, true);
});
