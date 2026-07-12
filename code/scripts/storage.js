/**
 * Browser persistence for Quill preferences and local drafts.
 */

window.QuillStorage = (() => {

const STORAGE_KEY = "quill-markdown";
const THEME_KEY = "quill-theme";
const AUTOSAVE_KEY = "quill-autosave-enabled";
const RECENT_FILES_KEY = "quill-recent-files";
const RECENT_FILES_LIMIT = 10;
const RECENT_FILES_DB = "quill-recent-files-db";
const RECENT_FILES_STORE = "handles";
let recentFilesWriteQueue = Promise.resolve();

function saveDraft(content) {
  localStorage.setItem(STORAGE_KEY, content);
}

function getTheme(fallback = "dark") {
  return localStorage.getItem(THEME_KEY) || fallback;
}

function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
}

function getAutosavePreference() {
  return localStorage.getItem(AUTOSAVE_KEY);
}

function saveAutosavePreference(enabled) {
  localStorage.setItem(AUTOSAVE_KEY, enabled ? "true" : "false");
}

function openRecentFilesDb() {
  if (!window.indexedDB) {
    return Promise.resolve(null);
  }

  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(RECENT_FILES_DB, 1);

    request.addEventListener("upgradeneeded", () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(RECENT_FILES_STORE)) {
        db.createObjectStore(RECENT_FILES_STORE, { keyPath: "key" });
      }
    });

    request.addEventListener("success", () => resolve(request.result));
    request.addEventListener("error", () => reject(request.error));
  });
}

async function readHandleRecords(db, keys) {
  if (!db || !keys.length) {
    return new Map();
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(RECENT_FILES_STORE, "readonly");
    const store = transaction.objectStore(RECENT_FILES_STORE);
    const results = new Map();
    let remaining = keys.length;

    keys.forEach((key) => {
      const request = store.get(key);
      request.addEventListener("success", () => {
        if (request.result && request.result.handle) {
          results.set(key, request.result.handle);
        }
        remaining -= 1;
        if (remaining === 0) {
          resolve(results);
        }
      });
      request.addEventListener("error", () => reject(request.error));
    });
  });
}

async function replaceHandleRecords(db, entries) {
  if (!db) {
    return;
  }

  await new Promise((resolve, reject) => {
    const transaction = db.transaction(RECENT_FILES_STORE, "readwrite");
    const store = transaction.objectStore(RECENT_FILES_STORE);
    const currentHandleKeys = new Set(
      entries
        .filter((entry) => entry.type === "handle" && entry.handleKey && entry.handle)
        .map((entry) => entry.handleKey)
    );
    const getAllKeysRequest = store.getAllKeys();

    getAllKeysRequest.addEventListener("success", () => {
      const storedKeys = Array.isArray(getAllKeysRequest.result) ? getAllKeysRequest.result : [];

      storedKeys.forEach((key) => {
        if (!currentHandleKeys.has(key)) {
          store.delete(key);
        }
      });

      entries.forEach((entry) => {
        if (entry.type === "handle" && entry.handleKey && entry.handle) {
          store.put({
            key: entry.handleKey,
            handle: entry.handle
          });
        }
      });
    });

    getAllKeysRequest.addEventListener("error", () => reject(getAllKeysRequest.error));

    transaction.addEventListener("complete", resolve);
    transaction.addEventListener("error", () => reject(transaction.error));
    transaction.addEventListener("abort", () => reject(transaction.error));
  });
}

function parseRecentFilesMetadata() {
  try {
    const rawValue = localStorage.getItem(RECENT_FILES_KEY);
    if (!rawValue) {
      return [];
    }

    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Unable to parse recent files", error);
    return [];
  }
}

async function getRecentFiles() {
  const metadata = parseRecentFilesMetadata().slice(0, RECENT_FILES_LIMIT);
  const handleKeys = metadata
    .filter((entry) => entry && entry.type === "handle" && typeof entry.handleKey === "string" && entry.handleKey)
    .map((entry) => entry.handleKey);

  try {
    const db = await openRecentFilesDb();
    const handleMap = await readHandleRecords(db, handleKeys);

    return metadata
      .map((entry) => {
        if (!entry || typeof entry.type !== "string") {
          return null;
        }

        if (entry.type === "path") {
          if (typeof entry.filePath !== "string" || !entry.filePath.trim()) {
            return null;
          }

          return {
            type: "path",
            filePath: entry.filePath.trim(),
            fileName: typeof entry.fileName === "string" && entry.fileName.trim() ? entry.fileName.trim() : "",
            isAvailable: entry.isAvailable !== false
          };
        }

        if (entry.type === "handle") {
          if (typeof entry.handleKey !== "string" || !entry.handleKey) {
            return null;
          }

          const handle = handleMap.get(entry.handleKey) || null;
          return {
            type: "handle",
            handleKey: entry.handleKey,
            handle,
            fileName: typeof entry.fileName === "string" && entry.fileName.trim() ? entry.fileName.trim() : "",
            isAvailable: entry.isAvailable !== false && Boolean(handle)
          };
        }

        return null;
      })
      .filter(Boolean);
  } catch (error) {
    console.warn("Unable to load recent files", error);
    return [];
  }
}

async function saveRecentFiles(entries) {
  const list = Array.isArray(entries) ? entries.slice(0, RECENT_FILES_LIMIT) : [];
  const metadata = list.map((entry) => {
    if (entry.type === "handle") {
      return {
        type: "handle",
        handleKey: entry.handleKey || "",
        fileName: entry.fileName || "",
        isAvailable: entry.isAvailable !== false
      };
    }

    return {
      type: "path",
      filePath: entry.filePath || "",
      fileName: entry.fileName || "",
      isAvailable: entry.isAvailable !== false
    };
  });

  localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(metadata));

  recentFilesWriteQueue = recentFilesWriteQueue
    .catch(() => {})
    .then(async () => {
      try {
        const db = await openRecentFilesDb();
        await replaceHandleRecords(db, list);
      } catch (error) {
        console.warn("Unable to save recent file handles", error);
      }
    });

  return recentFilesWriteQueue;
}

  return {
    getAutosavePreference,
    getRecentFiles,
    getTheme,
    saveAutosavePreference,
    saveDraft,
    saveRecentFiles,
    saveTheme
  };
})();
