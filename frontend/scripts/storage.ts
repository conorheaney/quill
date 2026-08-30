/**
 * WebView persistence for Quill preferences, drafts, and recent paths.
 */

import type { RecentFileEntry, ThemeName } from "./contracts";

window.QuillStorage = (() => {
  const STORAGE_KEY = "quill-markdown";
  const THEME_KEY = "quill-theme";
  const AUTOSAVE_KEY = "quill-autosave-enabled";
  const RECENT_FILES_KEY = "quill-recent-files";
  const storage = window.localStorage;
  const recentFilesLimit = 10;

  function saveDraft(content: string): void {
    storage.setItem(STORAGE_KEY, content);
  }

  function getTheme(fallback: ThemeName = "dark"): ThemeName {
    return storage.getItem(THEME_KEY) || fallback;
  }

  function saveTheme(theme: ThemeName): void {
    storage.setItem(THEME_KEY, theme);
  }

  function getAutosavePreference(): string | null {
    return storage.getItem(AUTOSAVE_KEY);
  }

  function saveAutosavePreference(enabled: boolean): void {
    storage.setItem(AUTOSAVE_KEY, enabled ? "true" : "false");
  }

  function parseRecentFilesMetadata(): unknown[] {
    try {
      const rawValue = storage.getItem(RECENT_FILES_KEY);
      const parsed: unknown = rawValue ? JSON.parse(rawValue) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn("Unable to parse recent files", error);
      return [];
    }
  }

  async function getRecentFiles(): Promise<RecentFileEntry[]> {
    return parseRecentFilesMetadata()
      .map((entry: unknown): RecentFileEntry | null => {
        const metadata = entry && typeof entry === "object" ? entry as Record<string, unknown> : {};
        const filePath = typeof metadata.filePath === "string" ? metadata.filePath.trim() : "";
        if (!filePath) {
          return null;
        }

        return {
          filePath,
          fileName: typeof metadata.fileName === "string" ? metadata.fileName.trim() : ""
        };
      })
      .filter((entry): entry is RecentFileEntry => entry !== null)
      .slice(0, recentFilesLimit);
  }

  async function saveRecentFiles(entries: RecentFileEntry[]): Promise<void> {
    const metadata = (Array.isArray(entries) ? entries : [])
      .map((entry: RecentFileEntry) => ({
        filePath: typeof entry.filePath === "string" ? entry.filePath.trim() : "",
        fileName: typeof entry.fileName === "string" ? entry.fileName.trim() : ""
      }))
      .filter((entry) => entry.filePath)
      .slice(0, recentFilesLimit);

    storage.setItem(RECENT_FILES_KEY, JSON.stringify(metadata));
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
