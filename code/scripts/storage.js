/**
 * WebView persistence for Quill preferences, drafts, and recent paths.
 */

window.QuillStorage = (() => {
  const STORAGE_KEY = "quill-markdown";
  const THEME_KEY = "quill-theme";
  const AUTOSAVE_KEY = "quill-autosave-enabled";
  const RECENT_FILES_KEY = "quill-recent-files";
  const RECENT_FILES_LIMIT = 10;

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

  function parseRecentFilesMetadata() {
    try {
      const rawValue = localStorage.getItem(RECENT_FILES_KEY);
      const parsed = rawValue ? JSON.parse(rawValue) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn("Unable to parse recent files", error);
      return [];
    }
  }

  async function getRecentFiles() {
    return parseRecentFilesMetadata()
      .map((entry) => {
        const filePath = entry && typeof entry.filePath === "string" ? entry.filePath.trim() : "";
        if (!filePath) {
          return null;
        }

        return {
          filePath,
          fileName: typeof entry.fileName === "string" ? entry.fileName.trim() : "",
          isAvailable: entry.isAvailable !== false
        };
      })
      .filter(Boolean)
      .slice(0, RECENT_FILES_LIMIT);
  }

  async function saveRecentFiles(entries) {
    const metadata = (Array.isArray(entries) ? entries : [])
      .map((entry) => ({
        filePath: entry && typeof entry.filePath === "string" ? entry.filePath.trim() : "",
        fileName: entry && typeof entry.fileName === "string" ? entry.fileName.trim() : "",
        isAvailable: !entry || entry.isAvailable !== false
      }))
      .filter((entry) => entry.filePath)
      .slice(0, RECENT_FILES_LIMIT);

    localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(metadata));
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
