const {
  blocksToMarkdown,
  escapeHtml,
  parseMarkdownBlocks
} = window.QuillMarkdown;
const { DEFAULT_CONTENT, LANGUAGE_META, NEW_DOCUMENT_CONTENT } = window.QuillConfig;
const {
  getAutosavePreference,
  getRecentFiles,
  getTheme,
  saveAutosavePreference,
  saveDraft,
  saveRecentFiles,
  saveTheme
} = window.QuillStorage;

const { createOutlinePane } = window.QuillOutlinePane;
const { createMarkdownPane } = window.QuillMarkdownPane;
const { createPreviewPane } = window.QuillPreviewPane;

(function () {
  function mountPaneTemplate(mountId, templateId) {
    const mountElement = document.getElementById(mountId);
    const templateElement = document.getElementById(templateId);
    if (!mountElement || !templateElement) {
      throw new Error(`Unable to mount ${templateId}`);
    }

    mountElement.replaceChildren(templateElement.content.cloneNode(true));
  }

  mountPaneTemplate("outlinePaneMount", "outlinePaneTemplate");
  mountPaneTemplate("markdownPaneMount", "markdownPaneTemplate");
  mountPaneTemplate("previewPaneMount", "previewPaneTemplate");

  const workspace = document.querySelector(".workspace");
  const contentArea = document.querySelector(".content-area");
  const contentHeader = document.querySelector(".content-header");
  const contentFooter = document.querySelector(".content-area > .shell-footer");
  const cycleThemeButton = document.getElementById("cycleThemeButton");
  const toggleMarkdownPaneButton = document.getElementById("toggleMarkdownPaneButton");
  const toggleAutoSaveButton = document.getElementById("toggleAutoSaveButton");
  const togglePreviewEditingButton = document.getElementById("togglePreviewEditingButton");
  const createDocumentButton = document.getElementById("createDocumentButton");
  const loadDocumentButton = document.getElementById("loadDocumentButton");
  const saveDocumentButton = document.getElementById("saveDocumentButton");
  const saveDocumentAsButton = document.getElementById("saveDocumentAsButton");
  const recentFilesButton = document.getElementById("recentFilesButton");
  const recentFilesPanel = document.getElementById("recentFilesPanel");
  const recentFilesList = document.getElementById("recentFilesList");
  const documentFileLabel = document.getElementById("documentFileLabel");
  const markdownWordCount = document.getElementById("markdownWordCount");
  const documentFileInput = document.getElementById("documentFileInput");
  const toastStack = document.getElementById("toastStack");
  const confirmDialog = document.getElementById("confirmDialog");
  const confirmDialogTitle = document.getElementById("confirmDialogTitle");
  const confirmDialogMessage = document.getElementById("confirmDialogMessage");
  const confirmDialogCancel = document.getElementById("confirmDialogCancel");
  const confirmDialogAccept = document.getElementById("confirmDialogAccept");
  const codeDialog = document.getElementById("codeDialog");
  const codeSnippetLanguage = document.getElementById("codeSnippetLanguage");
  const codeSnippetInput = document.getElementById("codeSnippetInput");
  const codeSnippetPreview = document.getElementById("codeSnippetPreview");
  const codeSnippetPreviewLanguage = document.getElementById("codeSnippetPreviewLanguage");
  const codeDialogCancel = document.getElementById("codeDialogCancel");
  const codeDialogAccept = document.getElementById("codeDialogAccept");

  const outlinePane = createOutlinePane({
    navElement: document.getElementById("outlinePaneNav"),
    escapeHtml,
    onSelectHeading: (headingId) => {
      previewPane.scrollToHeading(headingId);
    }
  });

  const shellState = {
    confirmResolver: null,
    currentFileHandle: null,
    currentFileName: "",
    currentFilePath: "",
    currentRecentFileKey: "",
    currentSourceFile: null,
    dialogSelection: { start: 0, end: 0 },
    isAutoSaveEnabled: true,
    isDirty: false,
    isMarkdownPaneCollapsed: false,
    isPreviewEditingEnabled: false,
    isRecentFilesMenuOpen: false,
    isRecentFilesHydrated: false,
    isSyncingScroll: false,
    recentFiles: [],
    saveTimer: null
  };

  function getFileNameFromPath(filePath) {
    if (!filePath) return "";
    const pathSegments = String(filePath).split(/[\\/]+/).filter(Boolean);
    return pathSegments.length ? pathSegments[pathSegments.length - 1] : filePath;
  }

  function normaliseRecentEntry(entry) {
    if (!entry || !entry.type) {
      return null;
    }

    if (entry.type === "handle") {
      const handleKey = entry.handleKey ? String(entry.handleKey).trim() : "";
      const handle = entry.handle || null;
      const fileName = entry.fileName ? String(entry.fileName).trim() : (handle && handle.name ? handle.name : "");
      if (!handleKey) {
        return null;
      }

      return {
        type: "handle",
        handleKey,
        handle,
        fileName,
        isAvailable: entry.isAvailable !== false && Boolean(handle)
      };
    }

    const filePath = entry.filePath ? String(entry.filePath).trim() : "";
    if (!filePath) {
      return null;
    }

    return {
      type: "path",
      filePath,
      fileName: entry.fileName ? String(entry.fileName).trim() : getFileNameFromPath(filePath),
      isAvailable: entry.isAvailable !== false
    };
  }

  function setRecentFiles(entries) {
    shellState.recentFiles = (entries || []).map(normaliseRecentEntry).filter(Boolean).slice(0, 10);
    saveRecentFiles(shellState.recentFiles).catch((error) => {
      console.error("Unable to persist recent files", error);
    });
    renderRecentFiles();
  }

  function getRecentEntryKey(entry) {
    if (!entry) return "";
    if (entry.type === "handle") {
      return entry.handleKey ? `handle:${entry.handleKey}` : "";
    }
    if (entry.type === "path") {
      return entry.filePath ? `path:${entry.filePath}` : "";
    }
    return "";
  }

  function setCurrentRecentFile(entry) {
    shellState.currentRecentFileKey = getRecentEntryKey(entry);
  }

  function isCurrentRecentFile(entry) {
    return Boolean(shellState.currentRecentFileKey) && shellState.currentRecentFileKey === getRecentEntryKey(entry);
  }

  function findMatchingPathEntryIndex(filePath) {
    return shellState.recentFiles.findIndex((entry) => entry.type === "path" && entry.filePath === filePath);
  }

  async function findMatchingHandleEntryIndex(handle) {
    if (!handle || typeof handle.isSameEntry !== "function") {
      return -1;
    }

    for (let index = 0; index < shellState.recentFiles.length; index += 1) {
      const entry = shellState.recentFiles[index];
      if (entry.type !== "handle" || !entry.handle || typeof entry.handle.isSameEntry !== "function") {
        continue;
      }

      try {
        if (await entry.handle.isSameEntry(handle)) {
          return index;
        }
      } catch (error) {
        console.warn("Unable to compare recent file handles", error);
      }
    }

    return -1;
  }

  function createHandleKey() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }

    return `recent-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function recordRecentFile(filePath, fileName) {
    if (!filePath) {
      return null;
    }

    const nextEntry = normaliseRecentEntry({
      type: "path",
      filePath,
      fileName,
      isAvailable: true
    });
    const nextRecentFiles = [nextEntry].concat(shellState.recentFiles.filter((entry) => !(entry.type === "path" && entry.filePath === nextEntry.filePath)));
    setRecentFiles(nextRecentFiles);
    return nextEntry;
  }

  async function recordRecentFileHandle(handle, fileName) {
    if (!handle) {
      return null;
    }

    const existingIndex = await findMatchingHandleEntryIndex(handle);
    const existingEntry = existingIndex >= 0 ? shellState.recentFiles[existingIndex] : null;
    const nextEntry = normaliseRecentEntry({
      type: "handle",
      handleKey: existingEntry ? existingEntry.handleKey : createHandleKey(),
      handle,
      fileName: fileName || handle.name || "",
      isAvailable: true
    });

    const nextRecentFiles = [nextEntry].concat(shellState.recentFiles.filter((_, index) => index !== existingIndex));
    setRecentFiles(nextRecentFiles);
    return nextEntry;
  }

  function updateRecentFileAvailability(entryToUpdate, isAvailable) {
    setRecentFiles(shellState.recentFiles.map((entry) => {
      if (entry.type === "path" && entryToUpdate.type === "path" && entry.filePath === entryToUpdate.filePath) {
        return {
          ...entry,
          isAvailable
        };
      }

      if (entry.type === "handle" && entryToUpdate.type === "handle" && entry.handleKey === entryToUpdate.handleKey) {
        return {
          ...entry,
          isAvailable
        };
      }

      if ((entry.type === "path") !== (entryToUpdate.type === "path")) {
        return entry;
      }
      return entry;
    }));
  }

  function setRecentFilesMenuOpen(isOpen) {
    shellState.isRecentFilesMenuOpen = isOpen;
    recentFilesButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
    recentFilesPanel.hidden = !isOpen;
  }

  function isDesktopRecentFilesSupported() {
    return Boolean(window.QuillDesktop);
  }

  function renderRecentFiles() {
    recentFilesList.replaceChildren();
    recentFilesButton.disabled = false;

    if (!isDesktopRecentFilesSupported()) {
      const unavailableState = document.createElement("div");
      unavailableState.className = "recent-file-empty";
      unavailableState.textContent = "Recent Files is unavailable in a standard web browser.";
      recentFilesList.appendChild(unavailableState);
      return;
    }

    if (!shellState.recentFiles.length) {
      const emptyState = document.createElement("div");
      emptyState.className = "recent-file-empty";
      emptyState.textContent = "No recent files yet. Open a Markdown file from disk to populate this list.";
      recentFilesList.appendChild(emptyState);
      return;
    }

    shellState.recentFiles.forEach((entry) => {
      const item = document.createElement("div");
      const isCurrent = isCurrentRecentFile(entry);
      item.className = "recent-file-entry";
      item.dataset.available = entry.isAvailable ? "true" : "false";
      item.dataset.current = isCurrent ? "true" : "false";

      const itemMain = document.createElement("button");
      itemMain.type = "button";
      itemMain.className = "recent-file-open";
      itemMain.title = entry.type === "path" ? entry.filePath : entry.fileName;
      itemMain.innerHTML = `
        <span class="recent-file-entry-main">
          <span class="recent-file-title-group">
            <span class="recent-file-name">${escapeHtml(entry.fileName || (entry.type === "path" ? getFileNameFromPath(entry.filePath) : "Recent file"))}</span>
            ${isCurrent ? '<span class="recent-file-current-indicator">Current</span>' : ""}
          </span>
          ${entry.isAvailable ? "" : '<span class="recent-file-status">Unavailable</span>'}
        </span>
        <span class="recent-file-path">${escapeHtml(entry.type === "path" ? entry.filePath : "Browser file access handle")}</span>
      `;
      itemMain.addEventListener("click", () => {
        handleRecentFileOpen(entry).catch((error) => {
          console.error("Unable to reopen recent file", error);
        });
      });

      item.appendChild(itemMain);

        if (!isCurrent) {
          const removeButton = document.createElement("button");
          removeButton.type = "button";
          removeButton.className = "recent-file-remove";
          removeButton.setAttribute("aria-label", `Remove ${entry.fileName || "recent file"} from recent files`);
          removeButton.title = "Remove from recent files";
          removeButton.textContent = "X";
          removeButton.addEventListener("click", (event) => {
            event.stopPropagation();
            removeRecentFile(entry);
          });
          item.appendChild(removeButton);
      }

      recentFilesList.appendChild(item);
    });
  }

  function removeRecentFile(entryToRemove) {
    const keyToRemove = getRecentEntryKey(entryToRemove);
    if (!keyToRemove || keyToRemove === shellState.currentRecentFileKey) {
      return;
    }

    setRecentFiles(shellState.recentFiles.filter((entry) => getRecentEntryKey(entry) !== keyToRemove));
    showToast("Removed from Recent", `${entryToRemove.fileName || "File"} was removed from the list.`, { duration: 1800 });
  }

  function syncWorkspaceHeight() {
    workspace.style.minHeight = "0";
    workspace.style.height = "100%";
  }

  function showToast(title, message, options) {
    const settings = options || {};
    const duration = settings.duration === undefined ? 2600 : settings.duration;
    const toastId = settings.id || "";
    let toast = toastId ? toastStack.querySelector(`[data-toast-id="${toastId}"]`) : null;

    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      if (toastId) {
        toast.dataset.toastId = toastId;
      }
      toastStack.appendChild(toast);
    }

    window.clearTimeout(toast._hideTimer);
    toast.innerHTML = `<strong class="toast-title">${escapeHtml(title)}</strong>${message ? `<span>${escapeHtml(message)}</span>` : ""}`;
    toast.classList.remove("is-visible");
    window.requestAnimationFrame(() => toast.classList.add("is-visible"));

    if (duration > 0) {
      toast._hideTimer = window.setTimeout(() => {
        toast.classList.remove("is-visible");
        window.setTimeout(() => {
          if (toast.parentElement) {
            toast.remove();
          }
        }, 220);
      }, duration);
    }
  }

  function updateDocumentFileLabel() {
    const label = shellState.currentFileName || "Untitled draft";
    documentFileLabel.textContent = shellState.isDirty ? `${label} *` : label;
  }

  function markDirty(nextDirty) {
    shellState.isDirty = nextDirty;
    saveDocumentButton.dataset.accent = nextDirty ? "true" : "false";
    updateDocumentFileLabel();
  }

  function updateWordCount(text) {
    const count = text.trim() ? text.trim().split(/\s+/).length : 0;
    markdownWordCount.textContent = `${count} word${count === 1 ? "" : "s"}`;
  }

  function persistDraft(showStatusToast) {
    const showToastStatus = showStatusToast !== false;
    saveDraft(markdownPane.getValue());
    if (showToastStatus) {
      showToast("SAVED LOCALLY", "", { id: "save-status", duration: 1600 });
    }
  }

  function scheduleSave(showStatusToast) {
    if (!shellState.isAutoSaveEnabled) {
      window.clearTimeout(shellState.saveTimer);
      return;
    }

    if (showStatusToast) {
      showToast("SAVING...", "", { id: "save-status", duration: 0 });
    }

    window.clearTimeout(shellState.saveTimer);
    shellState.saveTimer = window.setTimeout(() => persistDraft(showStatusToast), 220);
  }

  function openConfirmDialog(title, message, acceptLabel) {
    confirmDialogTitle.textContent = title;
    confirmDialogMessage.textContent = message;
    confirmDialogAccept.textContent = (acceptLabel || "Continue").toUpperCase();

    return new Promise((resolve) => {
      shellState.confirmResolver = resolve;
      if (typeof confirmDialog.showModal === "function") {
        confirmDialog.showModal();
      } else {
        confirmDialog.setAttribute("open", "open");
      }
    });
  }

  function closeConfirmDialog(result) {
    if (shellState.confirmResolver) {
      shellState.confirmResolver(result);
      shellState.confirmResolver = null;
    }

    if (typeof confirmDialog.close === "function") {
      confirmDialog.close();
    } else {
      confirmDialog.removeAttribute("open");
    }
  }

  async function confirmIfDirty(title, message, acceptLabel) {
    if (!shellState.isDirty) return true;
    return openConfirmDialog(title, message, acceptLabel);
  }

  function updateAutoSaveUi() {
    toggleAutoSaveButton.setAttribute("aria-checked", shellState.isAutoSaveEnabled ? "true" : "false");
    toggleAutoSaveButton.setAttribute("title", shellState.isAutoSaveEnabled ? "AUTOSAVE ENABLED" : "AUTOSAVE DISABLED");
  }

  function setAutoSave(enabled, options) {
    const settings = options || {};
    shellState.isAutoSaveEnabled = enabled;
    saveAutosavePreference(enabled);
    updateAutoSaveUi();

    if (!enabled) {
      window.clearTimeout(shellState.saveTimer);
      return;
    }

    if (settings.persistImmediately) {
      persistDraft(false);
    }
  }

  function toggleAutoSave() {
    const nextEnabled = !shellState.isAutoSaveEnabled;
    setAutoSave(nextEnabled, { persistImmediately: nextEnabled });
    showToast(
      nextEnabled ? "Autosave on" : "Autosave off",
      nextEnabled ? "Local draft saving has resumed." : "Local draft saving is paused until you turn it back on."
    );
  }

  function setTheme(theme) {
    document.body.classList.toggle("dark", theme === "dark");
    saveTheme(theme);
  }

  function cycleTheme() {
    setTheme(document.body.classList.contains("dark") ? "light" : "dark");
  }

  function setMarkdownPaneCollapsed(collapsed) {
    shellState.isMarkdownPaneCollapsed = collapsed;
    workspace.classList.toggle("editor-collapsed", collapsed);
    toggleMarkdownPaneButton.setAttribute("aria-checked", collapsed ? "false" : "true");
    toggleMarkdownPaneButton.setAttribute("title", collapsed ? "EDITOR HIDDEN" : "EDITOR VISIBLE");
    syncWorkspaceHeight();

    if (collapsed) {
      previewPane.focus({ preventScroll: true });
    } else {
      markdownPane.focus({ preventScroll: true });
    }
  }

  function toggleMarkdownPaneCollapsed() {
    setMarkdownPaneCollapsed(!shellState.isMarkdownPaneCollapsed);
  }

  function setPreviewEditingEnabled(enabled) {
    shellState.isPreviewEditingEnabled = enabled;
    togglePreviewEditingButton.setAttribute("aria-checked", enabled ? "true" : "false");
    togglePreviewEditingButton.setAttribute("title", enabled ? "INLINE EDITING ENABLED" : "INLINE EDITING DISABLED");
    previewPane.setReadOnly(!enabled);
  }

  function togglePreviewEditingEnabled() {
    setPreviewEditingEnabled(!shellState.isPreviewEditingEnabled);
  }

  function renderPreviewFromMarkdown(markdown) {
    const blocks = parseMarkdownBlocks(markdown);
    previewPane.setBlocks(blocks);
    updateWordCount(markdown);
    syncWorkspaceHeight();
  }

  function handleMarkdownInput(showStatusToast) {
    renderPreviewFromMarkdown(markdownPane.getValue());
    markDirty(true);
    scheduleSave(showStatusToast);
  }

  function resetDocumentScrollPositions() {
    const markdownScrollElement = markdownPane.getScrollElement();
    const previewScrollElement = previewPane.getScrollElement();
    if (!markdownScrollElement || !previewScrollElement) {
      return;
    }

    shellState.isSyncingScroll = true;
    markdownScrollElement.scrollTop = 0;
    previewScrollElement.scrollTop = 0;
    window.requestAnimationFrame(() => {
      shellState.isSyncingScroll = false;
    });
  }

  function setDocumentContent(content, options) {
    const settings = options || {};
    markdownPane.setValue(content);

    if (settings.fileName !== undefined) {
      shellState.currentFileName = settings.fileName;
    }
    if (settings.fileHandle !== undefined) {
      shellState.currentFileHandle = settings.fileHandle;
    }
    if (settings.filePath !== undefined) {
      shellState.currentFilePath = settings.filePath || "";
    }
    if (settings.sourceFile !== undefined) {
      shellState.currentSourceFile = settings.sourceFile;
    }

    renderPreviewFromMarkdown(content);
    resetDocumentScrollPositions();
    persistDraft(Boolean(settings.showStatusToast));
    markDirty(Boolean(settings.dirty));
  }

  function syncScroll(source, target) {
    if (shellState.isSyncingScroll) return;
    const ratio = source.scrollTop / Math.max(source.scrollHeight - source.clientHeight, 1);
    shellState.isSyncingScroll = true;
    target.scrollTop = ratio * Math.max(target.scrollHeight - target.clientHeight, 0);
    window.requestAnimationFrame(() => {
      shellState.isSyncingScroll = false;
    });
  }

  function normaliseLanguage(language) {
    const value = (language || "").toLowerCase();
    if (!value || value === "text" || value === "plain" || value === "plaintext") return "text";
    if (value === "js" || value === "javascript") return "javascript";
    if (value === "py" || value === "python") return "python";
    if (value === "c#" || value === "cs" || value === "csharp") return "csharp";
    return "text";
  }

  function parseSelectedCodeSnippet() {
    const selectedText = markdownPane.getSelectedText().trim();
    const fencedMatch = selectedText.match(/^```([\w-]+)?\n([\s\S]*?)\n```$/);

    if (fencedMatch) {
      return {
        language: normaliseLanguage(fencedMatch[1] || "javascript"),
        code: fencedMatch[2]
      };
    }

    return {
      language: "javascript",
      code: markdownPane.getSelectedText() || "const example = true;"
    };
  }

  function openCodeDialog() {
    const snippet = parseSelectedCodeSnippet();
    shellState.dialogSelection = markdownPane.getSelectionState();
    codeSnippetLanguage.value = snippet.language;
    codeSnippetInput.value = snippet.code;
    updateCodePreview();
    if (typeof codeDialog.showModal === "function") {
      codeDialog.showModal();
    } else {
      codeDialog.setAttribute("open", "open");
    }
    window.setTimeout(() => codeSnippetInput.focus(), 0);
  }

  function closeCodeDialog() {
    if (typeof codeDialog.close === "function") {
      codeDialog.close();
    } else {
      codeDialog.removeAttribute("open");
    }
  }

  function tokenizeLine(language, line) {
    const keywordSet = new Set(LANGUAGE_META[language].keywords);
    const tokens = [];
    let index = 0;

    while (index < line.length) {
      const rest = line.slice(index);
      const commentPattern = language === "python" ? /^#.*/ : /^\/\/.*/;
      const commentMatch = rest.match(commentPattern);
      if (commentMatch) {
        tokens.push({ type: "comment", value: commentMatch[0] });
        break;
      }

      const stringMatch = rest.match(/^("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)/);
      if (stringMatch) {
        tokens.push({ type: "string", value: stringMatch[0] });
        index += stringMatch[0].length;
        continue;
      }

      const numberMatch = rest.match(/^\b\d+(?:\.\d+)?\b/);
      if (numberMatch) {
        tokens.push({ type: "number", value: numberMatch[0] });
        index += numberMatch[0].length;
        continue;
      }

      const keywordMatch = rest.match(/^[A-Za-z_][A-Za-z0-9_]*/);
      if (keywordMatch) {
        const value = keywordMatch[0];
        tokens.push({ type: keywordSet.has(value) ? "keyword" : "plain", value });
        index += value.length;
        continue;
      }

      const operatorMatch = rest.match(/^(=>|==={0,1}|!==|!=|<=|>=|&&|\|\||[-+*/%=<>()[\]{}.,:;])/);
      if (operatorMatch) {
        tokens.push({ type: "operator", value: operatorMatch[0] });
        index += operatorMatch[0].length;
        continue;
      }

      tokens.push({ type: "plain", value: rest[0] });
      index += 1;
    }

    return tokens;
  }

  function tokenizeCode(language, code) {
    return code.split("\n").map((line) => tokenizeLine(language, line));
  }

  function highlightCodeHtml(language, code) {
    return tokenizeCode(language, code)
      .map((lineTokens) => lineTokens.map((token) => `<span class="token-${token.type}">${escapeHtml(token.value)}</span>`).join(""))
      .join("\n");
  }

  function updateCodePreview() {
    const language = codeSnippetLanguage.value;
    codeSnippetPreviewLanguage.textContent = LANGUAGE_META[language].label;
    codeSnippetPreview.innerHTML = highlightCodeHtml(language, codeSnippetInput.value || "");
  }

  function getTokenColor(type) {
    if (type === "keyword") return "#ff8f70";
    if (type === "string") return "#c3e88d";
    if (type === "number") return "#82aaff";
    if (type === "comment") return "#7f8da3";
    if (type === "operator") return "#89ddff";
    return "#dbe7f3";
  }

  function roundRect(context, x, y, width, height, radius, topOnly) {
    const bottomRadius = topOnly ? 0 : radius;
    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(x + width - radius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + radius);
    context.lineTo(x + width, y + height - bottomRadius);
    context.quadraticCurveTo(x + width, y + height, x + width - bottomRadius, y + height);
    context.lineTo(x + bottomRadius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - bottomRadius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.closePath();
  }

  function renderCodeImage(language, code) {
    const tokensByLine = tokenizeCode(language, code || "");
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const scale = window.devicePixelRatio || 1;
    const padding = 28;
    const headerHeight = 46;
    const lineHeight = 26;
    const fontSize = 18;
    const fontFamily = "Cascadia Code, Consolas, monospace";

    context.font = `${fontSize}px ${fontFamily}`;

    const lineStrings = tokensByLine.map((lineTokens) => lineTokens.map((token) => token.value).join(""));
    const widestLine = Math.max(...lineStrings.map((line) => context.measureText(line || " ").width), context.measureText(LANGUAGE_META[language].label).width + 48);
    const width = Math.ceil(widestLine + padding * 2);
    const height = Math.max(160, Math.ceil(headerHeight + padding + tokensByLine.length * lineHeight + padding));

    canvas.width = width * scale;
    canvas.height = height * scale;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.scale(scale, scale);

    context.fillStyle = "#0f172a";
    roundRect(context, 0, 0, width, height, 22, false);
    context.fill();

    context.fillStyle = "#162033";
    roundRect(context, 0, 0, width, headerHeight, 22, true);
    context.fill();

    context.fillStyle = "#ff8f70";
    context.beginPath();
    context.arc(24, 23, 5, 0, Math.PI * 2);
    context.arc(40, 23, 5, 0, Math.PI * 2);
    context.arc(56, 23, 5, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = "#dbe7f3";
    context.font = '600 14px "Segoe UI", sans-serif';
    context.fillText(LANGUAGE_META[language].label, width - padding - context.measureText(LANGUAGE_META[language].label).width, 28);

    context.font = `${fontSize}px ${fontFamily}`;
    let y = headerHeight + padding;

    tokensByLine.forEach((lineTokens) => {
      let x = padding;
      lineTokens.forEach((token) => {
        context.fillStyle = getTokenColor(token.type);
        context.fillText(token.value, x, y);
        x += context.measureText(token.value).width;
      });
      y += lineHeight;
    });

    return canvas.toDataURL("image/png");
  }

  function createCodeImageMarkdown(language, code) {
    const dataUrl = renderCodeImage(language, code.replace(/\r\n?/g, "\n"));
    const altText = `Code snippet (${LANGUAGE_META[language].label})`;
    return `![${altText}](${dataUrl})`;
  }

  function acceptCodeDialog() {
    const imageMarkdown = createCodeImageMarkdown(codeSnippetLanguage.value, codeSnippetInput.value);
    markdownPane.focus();
    markdownPane.setSelectionRange(shellState.dialogSelection.start, shellState.dialogSelection.end);
    markdownPane.replaceSelection(`\n${imageMarkdown}\n`, "end");
    handleMarkdownInput(false);
    closeCodeDialog();
  }

  function downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  function getSuggestedMarkdownFilename() {
    return shellState.currentFileName || "document.md";
  }

  async function loadMarkdownFromFile(file, fileHandle, options) {
    const settings = options || {};
    const content = await file.text();
    const filePath = typeof file.path === "string" ? file.path : "";
    let recentEntry = null;
    setDocumentContent(content, {
      fileName: file.name || shellState.currentFileName,
      fileHandle,
      filePath,
      sourceFile: file,
      dirty: false,
      showStatusToast: false
    });

    if (filePath) {
      recentEntry = recordRecentFile(filePath, file.name || getFileNameFromPath(filePath));
    } else if (fileHandle) {
      recentEntry = await recordRecentFileHandle(fileHandle, file.name || fileHandle.name || "");
    } else if (settings.showPathWarning !== false) {
      showToast("Recent file not tracked", "This file was opened without a reusable path or browser file handle, so it cannot appear in Recent.");
    }

    if (recentEntry) {
      setCurrentRecentFile(recentEntry);
    } else {
      shellState.currentRecentFileKey = "";
      renderRecentFiles();
    }

    if (settings.showLoadedToast !== false) {
      showToast("Loaded", `${file.name || "Document"} is now open.`);
    }
  }

  async function loadMarkdownFromDesktopResult(result, options) {
    const settings = options || {};
    if (!result) {
      return;
    }
    let recentEntry = null;

    setDocumentContent(result.content, {
      fileName: result.fileName || getFileNameFromPath(result.filePath),
      fileHandle: null,
      filePath: result.filePath || "",
      sourceFile: null,
      dirty: false,
      showStatusToast: false
    });

    if (result.filePath) {
      recentEntry = recordRecentFile(result.filePath, result.fileName);
    } else if (settings.showPathWarning !== false) {
      showToast("Recent file not tracked", "This file was opened without a reusable full path, so it cannot appear in Recent.");
    }

    if (recentEntry) {
      setCurrentRecentFile(recentEntry);
    } else {
      shellState.currentRecentFileKey = "";
      renderRecentFiles();
    }

    if (settings.showLoadedToast !== false) {
      showToast("Loaded", `${result.fileName || "Document"} is now open.`);
    }
  }

  async function handleLoadDocument() {
    try {
      const canContinue = await confirmIfDirty(
        "Load another file?",
        "You have unsaved changes in the current document. Loading a file will replace the editor contents.",
        "Load file"
      );
      if (!canContinue) return;

      if (window.QuillDesktop && typeof window.QuillDesktop.openMarkdownFile === "function") {
        const result = await window.QuillDesktop.openMarkdownFile();
        if (!result) return;
        await loadMarkdownFromDesktopResult(result);
        return;
      }

      if (window.showOpenFilePicker) {
        const [fileHandle] = await window.showOpenFilePicker({
          multiple: false,
          types: [
            {
              description: "Markdown files",
              accept: {
                "text/markdown": [".md", ".markdown"],
                "text/plain": [".txt"]
              }
            }
          ]
        });
        if (!fileHandle) return;
        const file = await fileHandle.getFile();
        await loadMarkdownFromFile(file, fileHandle);
        return;
      }

      documentFileInput.click();
    } catch (error) {
      if (error && error.name === "AbortError") return;
      console.error("Unable to load markdown file", error);
      showToast("Load failed", "The selected file could not be opened.");
    }
  }

  async function handleSaveDocument(saveAs) {
    const useSaveAs = Boolean(saveAs);
    const content = markdownPane.getValue();
    const previousFilePath = shellState.currentFilePath || "";

    try {
      if (window.QuillDesktop && typeof window.QuillDesktop.saveMarkdownFile === "function") {
        const result = await window.QuillDesktop.saveMarkdownFile({
          content,
          filePath: useSaveAs ? "" : shellState.currentFilePath,
          saveAs: useSaveAs,
          suggestedName: getSuggestedMarkdownFilename()
        });
        if (!result) return;

        shellState.currentFileHandle = null;
        shellState.currentSourceFile = null;
        shellState.currentFilePath = result.filePath || "";
        shellState.currentFileName = result.fileName || shellState.currentFileName;

        if (shellState.currentFilePath) {
          const recentEntry = recordRecentFile(shellState.currentFilePath, shellState.currentFileName);
          setCurrentRecentFile(recentEntry);
        } else {
          showToast("Recent file not tracked", "This save target did not provide a reusable full path, so it cannot appear in Recent.");
        }

        markDirty(false);
        showToast("SAVED TO FILE", "", { id: "save-status", duration: 1600 });
        showToast(useSaveAs ? "Saved as" : "Saved", `${shellState.currentFileName || "Document"} was written to disk.`);
        return;
      }

      if (window.showSaveFilePicker) {
        const fileHandle = !useSaveAs && shellState.currentFileHandle ? shellState.currentFileHandle : await window.showSaveFilePicker({
          suggestedName: getSuggestedMarkdownFilename(),
          types: [
            {
              description: "Markdown files",
              accept: {
                "text/markdown": [".md", ".markdown"],
                "text/plain": [".txt"]
              }
            }
          ]
        });
        if (!fileHandle) return;

        const writable = await fileHandle.createWritable();
        await writable.write(content);
        await writable.close();

        shellState.currentFileHandle = fileHandle;
        shellState.currentFilePath = "";
        shellState.currentFileName = fileHandle.name || shellState.currentFileName;
        shellState.currentSourceFile = null;
        const recentEntry = await recordRecentFileHandle(fileHandle, shellState.currentFileName);
        setCurrentRecentFile(recentEntry);
        markDirty(false);
        showToast("SAVED TO FILE", "", { id: "save-status", duration: 1600 });
        showToast(useSaveAs ? "Saved as" : "Saved", `${shellState.currentFileName || "Document"} was written to disk.`);
        return;
      }

      const fileName = useSaveAs || !shellState.currentFileName ? getSuggestedMarkdownFilename() : shellState.currentFileName;
      downloadFile(fileName, content, "text/markdown;charset=utf-8");
      shellState.currentFileName = fileName;
      shellState.currentFilePath = "";
      markDirty(false);
      showToast("DOWNLOADED MARKDOWN", "", { id: "save-status", duration: 1600 });
      showToast("Downloaded", `${fileName} was downloaded from the browser.`);
    } catch (error) {
      if (error && error.name === "AbortError") return;
      console.error("Unable to save markdown file", error);
      showToast("Save failed", "The document could not be saved.");
    }
  }

  async function handleNewDocument() {
    const canContinue = await confirmIfDirty(
      "Create a new document?",
      "You have unsaved changes in the current document. Creating a new document will replace the current contents.",
      "Create new"
    );
    if (!canContinue) return;

    shellState.currentFileHandle = null;
    shellState.currentFileName = "";
    shellState.currentFilePath = "";
    shellState.currentRecentFileKey = "";
    shellState.currentSourceFile = null;
    setDocumentContent(NEW_DOCUMENT_CONTENT, {
      fileName: "",
      fileHandle: null,
      filePath: "",
      sourceFile: null,
      dirty: false,
      showStatusToast: false
    });
    showToast("New document", "Started a fresh Markdown document.");
    renderRecentFiles();
  }

  async function handleDroppedFiles(files) {
    const images = [...files].filter((file) => file.type.startsWith("image/"));
    if (!images.length) return;

    const markdownSnippets = await Promise.all(images.map((file) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(`![${file.name}](${reader.result})`);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    })));
    markdownPane.replaceSelection(`\n${markdownSnippets.join("\n")}\n`, "end");
    handleMarkdownInput(false);
  }

  async function ensureRecentHandlePermission(handle) {
    if (!handle || typeof handle.queryPermission !== "function") {
      return true;
    }

    try {
      const currentPermission = await handle.queryPermission({ mode: "read" });
      if (currentPermission === "granted") {
        return true;
      }
      if (typeof handle.requestPermission === "function") {
        const nextPermission = await handle.requestPermission({ mode: "read" });
        return nextPermission === "granted";
      }
    } catch (error) {
      console.warn("Unable to verify handle permission", error);
    }

    return false;
  }

  async function handleRecentFileOpen(entry) {
    if (!entry) {
      return;
    }

    const canContinue = await confirmIfDirty(
      "Open recent file?",
      "You have unsaved changes in the current document. Opening a recent file will replace the editor contents.",
      "Open file"
    );
    if (!canContinue) return;

    try {
      if (entry.type === "handle" && entry.handle) {
        const hasPermission = await ensureRecentHandlePermission(entry.handle);
      if (!hasPermission) {
        throw new Error("Permission to reopen the selected file was denied.");
      }

        const file = await entry.handle.getFile();
        await loadMarkdownFromFile(file, entry.handle, {
          showLoadedToast: false,
          showPathWarning: false
        });
        updateRecentFileAvailability(entry, true);
        showToast("Recent file opened", `${file.name || "Document"} is now open.`);
        setRecentFilesMenuOpen(false);
        return;
      }

      if (entry.type === "path" && window.QuillDesktop && typeof window.QuillDesktop.reopenMarkdownFile === "function") {
        const result = await window.QuillDesktop.reopenMarkdownFile(entry.filePath);
        if (!result) return;
        await loadMarkdownFromDesktopResult(result, { showLoadedToast: false });
        updateRecentFileAvailability(entry, true);
        showToast("Recent file opened", `${result.fileName || "Document"} is now open.`);
        setRecentFilesMenuOpen(false);
        return;
      }

      showToast("Recent files unavailable", "This recent-file entry cannot be reopened in the current environment.");
    } catch (error) {
      console.error("Unable to reopen recent file", error);
      updateRecentFileAvailability(entry, false);
      showToast("Recent file unavailable", "Quill could not reopen that file. It will remain listed until it becomes available again.");
    }
  }

  function handleMarkdownPaneAction(action) {
    switch (action) {
      case "bold":
        markdownPane.wrapSelection("**");
        handleMarkdownInput(false);
        break;
      case "italic":
        markdownPane.wrapSelection("*");
        handleMarkdownInput(false);
        break;
      case "heading":
        markdownPane.prefixLines("# ");
        handleMarkdownInput(false);
        break;
      case "heading2":
        markdownPane.prefixLines("## ");
        handleMarkdownInput(false);
        break;
      case "heading3":
        markdownPane.prefixLines("### ");
        handleMarkdownInput(false);
        break;
      case "bulletList":
        markdownPane.prefixLines("- ");
        handleMarkdownInput(false);
        break;
      case "link":
        markdownPane.insertLink();
        handleMarkdownInput(false);
        break;
      case "codeBlock":
        openCodeDialog();
        break;
      default:
        break;
    }
  }

  const markdownPane = createMarkdownPane({
    rootElement: document.querySelector('[data-pane-name="markdownPane"]'),
    inputElement: document.getElementById("markdownPaneInput"),
    onAction: handleMarkdownPaneAction,
    onDroppedFiles: (files) => {
      handleDroppedFiles(files).catch((error) => {
        console.error("Unable to handle dropped files", error);
      });
    },
    onInput: handleMarkdownInput,
    onScroll: () => {
      syncScroll(markdownPane.getScrollElement(), previewPane.getScrollElement());
    },
    onShortcutCommand: (command) => {
      if (command === "save") {
        handleSaveDocument(false);
      } else if (command === "saveAs") {
        handleSaveDocument(true);
      } else if (command === "load") {
        handleLoadDocument();
      } else if (command === "new") {
        handleNewDocument();
      }
    }
  });

  const previewPane = createPreviewPane({
    rootElement: document.getElementById("previewPane"),
    contentElement: document.getElementById("previewPaneContent"),
    escapeHtml,
    normaliseLanguage,
    onBlocksCommitted: (blocks, toastTitle, toastMessage) => {
      const nextMarkdown = blocksToMarkdown(blocks);
      markdownPane.setValue(nextMarkdown);
      renderPreviewFromMarkdown(nextMarkdown);
      markDirty(true);
      scheduleSave(false);
      if (toastTitle) {
        showToast(toastTitle, toastMessage || "");
      }
    },
    onHeadingStateChange: (headings, activeHeadingId) => {
      outlinePane.render(headings, activeHeadingId);
    },
    onScroll: () => {
      syncScroll(previewPane.getScrollElement(), markdownPane.getScrollElement());
    },
    onToast: showToast,
    renderBlockContent: window.QuillMarkdown.renderBlockContent,
    requestConfirm: openConfirmDialog,
    splitTableCells: window.QuillMarkdown.splitTableCells,
    tableRowsToMarkdown: window.QuillMarkdown.tableRowsToMarkdown
  });

  cycleThemeButton.addEventListener("click", cycleTheme);
  createDocumentButton.addEventListener("click", () => {
    handleNewDocument().catch((error) => {
      console.error("Unable to create a new document", error);
    });
  });
  loadDocumentButton.addEventListener("click", () => {
    handleLoadDocument().catch((error) => {
      console.error("Unable to load a document", error);
    });
  });
  saveDocumentButton.addEventListener("click", () => {
    handleSaveDocument(false).catch((error) => {
      console.error("Unable to save the document", error);
    });
  });
  saveDocumentAsButton.addEventListener("click", () => {
    handleSaveDocument(true).catch((error) => {
      console.error("Unable to save the document as a new file", error);
    });
  });
  recentFilesButton.addEventListener("click", () => {
    setRecentFilesMenuOpen(!shellState.isRecentFilesMenuOpen);
  });
  toggleMarkdownPaneButton.addEventListener("click", toggleMarkdownPaneCollapsed);
  toggleAutoSaveButton.addEventListener("click", toggleAutoSave);
  togglePreviewEditingButton.addEventListener("click", togglePreviewEditingEnabled);
  documentFileInput.addEventListener("change", (event) => {
    const [file] = event.target.files || [];
    if (!file) return;
    shellState.currentFileHandle = null;
    loadMarkdownFromFile(file, null).catch((error) => {
      console.error("Unable to load markdown file", error);
      showToast("Load failed", "The selected file could not be opened.");
    });
    documentFileInput.value = "";
  });

  codeSnippetLanguage.addEventListener("change", updateCodePreview);
  codeSnippetInput.addEventListener("input", updateCodePreview);
  codeDialogCancel.addEventListener("click", closeCodeDialog);
  codeDialogAccept.addEventListener("click", acceptCodeDialog);
  codeDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeCodeDialog();
  });
  confirmDialogCancel.addEventListener("click", () => closeConfirmDialog(false));
  confirmDialogAccept.addEventListener("click", () => closeConfirmDialog(true));
  confirmDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeConfirmDialog(false);
  });
  document.addEventListener("click", (event) => {
    if (!shellState.isRecentFilesMenuOpen) return;
    if (recentFilesPanel.contains(event.target) || recentFilesButton.contains(event.target)) return;
    setRecentFilesMenuOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && shellState.isRecentFilesMenuOpen) {
      setRecentFilesMenuOpen(false);
    }
  });

  window.addEventListener("resize", syncWorkspaceHeight);
  window.addEventListener("beforeunload", (event) => {
    if (!shellState.isDirty) return;
    event.preventDefault();
    event.returnValue = "";
  });

  const savedTheme = getTheme();
  const savedAutoSave = getAutosavePreference();

  setTheme(savedTheme);
  setAutoSave(savedAutoSave !== "false");
  renderRecentFiles();
  getRecentFiles()
    .then((entries) => {
      if (shellState.isRecentFilesHydrated || shellState.recentFiles.length) {
        return;
      }
      shellState.recentFiles = (entries || []).map(normaliseRecentEntry).filter(Boolean).slice(0, 10);
      shellState.isRecentFilesHydrated = true;
      renderRecentFiles();
    })
    .catch((error) => {
      console.error("Unable to load recent files", error);
      shellState.isRecentFilesHydrated = true;
    });
  setDocumentContent(DEFAULT_CONTENT, {
    fileName: "quill.md",
    fileHandle: null,
    filePath: "",
    sourceFile: null,
    dirty: false,
    showStatusToast: false
  });
  if (shellState.isAutoSaveEnabled) {
    persistDraft(false);
  }
  setMarkdownPaneCollapsed(false);
  setPreviewEditingEnabled(false);
})();
