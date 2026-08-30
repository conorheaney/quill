import type {} from "node:assert/strict";

const persistenceAssert = require("node:assert/strict");

interface PersistenceState {
  documentId: string;
  filePath: string;
  content: string;
  revision: number;
  dirty: boolean;
}

interface PersistenceSnapshot extends PersistenceState {
  sessionVersion: number;
  pathVersion: number;
}

interface DraftSnapshot {
  documentId: string;
  filePath: string;
  content: string;
  revision: number;
  savedAt: number;
  sequence: number;
}

interface WriteResult {
  status?: string;
}

interface Deferred<T> {
  promise: Promise<T>;
  reject(reason?: unknown): void;
  resolve(value: T): void;
}

interface ControlledWriter {
  calls: Array<{
    snapshot: Readonly<PersistenceSnapshot>;
    reject(reason?: unknown): void;
    resolve(value: WriteResult): void;
  }>;
  write(snapshot: PersistenceSnapshot): Promise<WriteResult>;
}

interface DraftStore {
  entries: DraftSnapshot[];
  persist(snapshot: Omit<DraftSnapshot, "sequence">): void;
  recover(documentId: string): DraftSnapshot | null;
}

interface PersistenceSessionOptions {
  writer?: ControlledWriter;
  draftStore?: DraftStore;
  documentId?: string;
  filePath?: string;
  content?: string;
  revision?: number;
  dirty?: boolean;
}

interface OpenDocument {
  documentId: string;
  filePath?: string;
  content?: string;
  revision?: number;
  dirty?: boolean;
}

interface PersistenceSession {
  draftStore: DraftStore;
  edit(content: string): PersistenceState;
  getState(): PersistenceState;
  openDocument(document: OpenDocument): PersistenceState;
  persistDraft(savedAt: number): Omit<DraftSnapshot, "sequence">;
  restoreLatestDraft(documentId: string): PersistenceState | null;
  save(): Promise<{ error?: unknown; snapshot: PersistenceSnapshot; status: string }>;
  setPath(filePath: string): PersistenceState;
  writer: ControlledWriter;
}

function createDeferred<T = WriteResult>(): Deferred<T> {
  let resolve: (value: T) => void = () => undefined;
  let reject: (reason?: unknown) => void = () => undefined;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, reject, resolve };
}

function createControlledWriter(): ControlledWriter {
  const calls: ControlledWriter["calls"] = [];

  return {
    calls,
    write(snapshot: PersistenceSnapshot): Promise<WriteResult> {
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

function createDraftStore(): DraftStore {
  const entries: DraftSnapshot[] = [];
  let sequence = 0;

  return {
    entries,
    persist(snapshot: Omit<DraftSnapshot, "sequence">): void {
      entries.push(Object.freeze({ ...snapshot, sequence: sequence++ }));
    },
    recover(documentId: string): DraftSnapshot | null {
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

function createPersistenceSession(options: PersistenceSessionOptions = {}): PersistenceSession {
  const writer = options.writer || createControlledWriter();
  const draftStore = options.draftStore || createDraftStore();
  let sessionVersion = 0;
  let pathVersion = 0;
  let state: PersistenceState = {
    documentId: options.documentId || "document-1",
    filePath: options.filePath || "",
    content: options.content || "",
    revision: options.revision || 0,
    dirty: Boolean(options.dirty)
  };

  function getState(): PersistenceState {
    return { ...state };
  }

  function edit(content: string): PersistenceState {
    state = {
      ...state,
      content,
      revision: state.revision + 1,
      dirty: true
    };
    return getState();
  }

  function setPath(filePath: string): PersistenceState {
    if (filePath !== state.filePath) {
      pathVersion += 1;
      state = { ...state, filePath };
    }
    return getState();
  }

  function openDocument(document: OpenDocument): PersistenceState {
    persistenceAssert.ok(document && document.documentId, "opened documents require an identity");
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

  function captureSnapshot(): PersistenceSnapshot {
    return {
      ...state,
      sessionVersion,
      pathVersion
    };
  }

  function isCurrent(snapshot: PersistenceSnapshot): boolean {
    return snapshot.sessionVersion === sessionVersion
      && snapshot.pathVersion === pathVersion
      && snapshot.documentId === state.documentId
      && snapshot.filePath === state.filePath
      && snapshot.revision === state.revision;
  }

  async function save(): Promise<{ error?: unknown; snapshot: PersistenceSnapshot; status: string }> {
    const snapshot = captureSnapshot();
    let result: WriteResult | null;

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

  function persistDraft(savedAt: number): Omit<DraftSnapshot, "sequence"> {
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

  function restoreLatestDraft(documentId: string): PersistenceState | null {
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
