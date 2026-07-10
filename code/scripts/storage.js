/**
 * Browser persistence for Quill preferences and local drafts.
 */

window.QuillStorage = (() => {

const STORAGE_KEY = "quill-markdown";
const THEME_KEY = "quill-theme";
const AUTOSAVE_KEY = "quill-autosave-enabled";

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

  return {
    getAutosavePreference,
    getTheme,
    saveAutosavePreference,
    saveDraft,
    saveTheme
  };
})();
