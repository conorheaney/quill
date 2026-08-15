const assert = require("node:assert/strict");

function createDeferred() {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, reject, resolve };
}

function createControlledWriter() {
  const calls = [];

  return {
    calls,
    write(snapshot) {
      const deferred = createDeferred();
      calls.push({
        snapshot: Object.freeze({ ...snapshot }),
        reject: deferred.reject,
        resolve: deferred.resolve
      });
      return deferred.promise;
    }
  };
}

function createDraftStore() {
  const entries = [];
  let sequence = 0;

  return {
    entries,
    persist(snapshot) {
      entries.push(Object.freeze({ ...snapshot, sequence: sequence++ }));
    },
    recover(documentId) {
      const candidates = entries.filter((entry) => entry.documentId === documentId);
      if (!candidates.length) return null;

      const latest = candidates.reduce((current, candidate) => {
        if (candidate.revision !== current.revision) {
          return candidate.revision > current.revision ? candidate : current;
        }
        if (candidate.savedAt !== current.savedAt) {
          return candidate.savedAt > current.savedAt ? candidate : current;
        }
        return candidate.sequence > current.sequence ? candidate : current;
      });

      return { ...latest };
    }
  };
}

function createPersistenceSession(options = {}) {
  const writer = options.writer || createControlledWriter();
  const draftStore = options.draftStore || createDraftStore();
  let sessionVersion = 0;
  let pathVersion = 0;
  let state = {
    documentId: options.documentId || "document-1",
    filePath: options.filePath || "",
    content: options.content || "",
    revision: options.revision || 0,
    dirty: Boolean(options.dirty)
  };

  function getState() {
    return { ...state };
  }

  function edit(content) {
    state = {
      ...state,
      content,
      revision: state.revision + 1,
      dirty: true
    };
    return getState();
  }

  function setPath(filePath) {
    if (filePath !== state.filePath) {
      pathVersion += 1;
      state = { ...state, filePath };
    }
    return getState();
  }

  function openDocument(document) {
    assert.ok(document && document.documentId, "opened documents require an identity");
    sessionVersion += 1;
    pathVersion += 1;
    state = {
      documentId: document.documentId,
      filePath: document.filePath || "",
      content: document.content || "",
      revision: document.revision || 0,
      dirty: Boolean(document.dirty)
    };
    return getState();
  }

  function captureSnapshot() {
    return {
      ...state,
      sessionVersion,
      pathVersion
    };
  }

  function isCurrent(snapshot) {
    return snapshot.sessionVersion === sessionVersion
      && snapshot.pathVersion === pathVersion
      && snapshot.documentId === state.documentId
      && snapshot.filePath === state.filePath
      && snapshot.revision === state.revision;
  }

  async function save() {
    const snapshot = captureSnapshot();
    let result;

    try {
      result = await writer.write(snapshot);
    } catch (error) {
      return { error, snapshot, status: "failed" };
    }

    if (!result || result.status === "cancelled") {
      return { snapshot, status: "cancelled" };
    }

    if (!isCurrent(snapshot)) {
      return { snapshot, status: "stale" };
    }

    state = { ...state, dirty: false };
    return { snapshot, status: "saved" };
  }

  function persistDraft(savedAt) {
    const snapshot = {
      documentId: state.documentId,
      filePath: state.filePath,
      content: state.content,
      revision: state.revision,
      savedAt
    };
    draftStore.persist(snapshot);
    return { ...snapshot };
  }

  function restoreLatestDraft(documentId) {
    const draft = draftStore.recover(documentId);
    if (!draft) return null;
    openDocument({ ...draft, dirty: true });
    return getState();
  }

  return {
    draftStore,
    edit,
    getState,
    openDocument,
    persistDraft,
    restoreLatestDraft,
    save,
    setPath,
    writer
  };
}

module.exports = {
  createControlledWriter,
  createDeferred,
  createDraftStore,
  createPersistenceSession
};
