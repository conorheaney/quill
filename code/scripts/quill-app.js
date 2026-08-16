const {
  blocksToMarkdown,
  escapeHtml,
  getMarkdownBlockRanges,
  parseMarkdownBlocks
} = window.QuillMarkdown;
const { DEFAULT_CONTENT, LANGUAGE_META, NEW_DOCUMENT_CONTENT } = window.QuillConfig;
const {
  getAutosavePreference,
  getRecentFiles,
  saveAutosavePreference,
  saveDraft,
  saveRecentFiles
} = window.QuillStorage;

const { createOutlinePane } = window.QuillOutlinePane;
const { createMarkdownPane } = window.QuillMarkdownPane;
const { createPreviewPane } = window.QuillPreviewPane;
const { createRecentFilesController } = window.QuillRecentFiles;
const { createDocumentController } = window.QuillDocumentController;

(async function () {
  function mountPaneTemplate(mountId, templateId) {
    const mountElement = document.getElementById(mountId);
    const templateElement = document.getElementById(templateId);
    if (!mountElement || !templateElement) {
      throw new Error(`Unable to mount ${templateId}`);
    }

    mountElement.replaceChildren(templateElement.content.cloneNode(true));
  }

  async function mountHtmlFragment(mountId, path) {
    const mountElement = document.getElementById(mountId);
    if (!mountElement) {
      throw new Error(`Unable to mount ${path}`);
    }

    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Unable to load ${path} (${response.status})`);
    }

    mountElement.innerHTML = await response.text();
  }

  mountPaneTemplate("outlinePaneMount", "outlinePaneTemplate");
  mountPaneTemplate("markdownPaneMount", "markdownPaneTemplate");
  mountPaneTemplate("previewPaneMount", "previewPaneTemplate");
  await mountHtmlFragment("recentFilesMount", "./html/recent-files.html");
  await window.QuillThemeSelector.mount(document.getElementById("themeSelectorMount"));

  const workspace = document.querySelector(".workspace");
  const contentArea = document.querySelector(".content-area");
  const contentHeader = document.querySelector(".content-header");
  const contentFooter = document.querySelector(".content-area > .shell-footer");
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
  const sidebarVersionLabel = document.getElementById("sidebarVersionLabel");
  const documentFileLabel = document.getElementById("documentFileLabel");
  const markdownWordCount = document.getElementById("markdownWordCount");
  const toastStack = document.getElementById("toastStack");
  const confirmDialog = document.getElementById("confirmDialog");
  const confirmDialogTitle = document.getElementById("confirmDialogTitle");
  const confirmDialogMessage = document.getElementById("confirmDialogMessage");
  const confirmDialogCancel = document.getElementById("confirmDialogCancel");
  const confirmDialogAccept = document.getElementById("confirmDialogAccept");
  const externalChangeDialog = document.getElementById("externalChangeDialog");
  const externalChangeKeep = document.getElementById("externalChangeKeep");
  const externalChangeReload = document.getElementById("externalChangeReload");
  const codeDialog = document.getElementById("codeDialog");
  const codeSnippetLanguage = document.getElementById("codeSnippetLanguage");
  const codeSnippetInput = document.getElementById("codeSnippetInput");
  const codeSnippetPreview = document.getElementById("codeSnippetPreview");
  const codeSnippetPreviewLanguage = document.getElementById("codeSnippetPreviewLanguage");
  const codeDialogCancel = document.getElementById("codeDialogCancel");
  const codeDialogAccept = document.getElementById("codeDialogAccept");
  const desktopBridge = window.QuillDesktop || null;
  const requiredDesktopMethods = [
    "getAppVersion",
    "inspectMarkdownFile",
    "openMarkdownFile",
    "readImageDataUrl",
    "reopenMarkdownFile",
    "revealInExplorer",
    "saveMarkdownFile"
  ];
  const missingDesktopMethods = requiredDesktopMethods.filter((methodName) => !desktopBridge || typeof desktopBridge[methodName] !== "function");
  const isDesktopBridgeReady = missingDesktopMethods.length === 0;

  const outlinePane = createOutlinePane({
    navElement: document.getElementById("outlinePaneNav"),
    escapeHtml,
    onSelectHeading: (headingId) => {
      previewPane.scrollToHeading(headingId);
    }
  });

  const shellState = {
    confirmResolver: null,
    currentFileName: "",
    currentFilePath: "",
    dialogSelection: { start: 0, end: 0 },
    isAutoSaveEnabled: true,
    isDirty: false,
    isMarkdownPaneCollapsed: false,
    isPreviewEditingEnabled: false,
    isSyncingScroll: false
  };

  function getFileNameFromPath(filePath) {
    if (!filePath) return "";
    const pathSegments = String(filePath).split(/[\\/]+/).filter(Boolean);
    return pathSegments.length ? pathSegments[pathSegments.length - 1] : filePath;
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

  function configureDesktopFileControls() {
    [loadDocumentButton, saveDocumentButton, saveDocumentAsButton, recentFilesButton].forEach((button) => {
      button.disabled = !isDesktopBridgeReady;
    });

    if (!isDesktopBridgeReady) {
      showToast("Quill desktop app required", "File actions are unavailable outside the packaged desktop app.", { duration: 0 });
      console.error("Quill desktop bridge is incomplete", missingDesktopMethods);
    }
  }

  function updateDocumentFileLabel() {
    const label = shellState.currentFileName || "Untitled draft";
    documentFileLabel.textContent = shellState.isDirty ? `${label} *` : label;
  }

  async function loadDesktopProductVersion() {
    if (!sidebarVersionLabel) {
      return;
    }

    if (!isDesktopBridgeReady) {
      sidebarVersionLabel.hidden = true;
      return;
    }

    try {
      const version = await desktopBridge.getAppVersion();
      if (!version) {
        sidebarVersionLabel.hidden = true;
        return;
      }

      sidebarVersionLabel.textContent = `Version ${version}`;
      sidebarVersionLabel.hidden = false;
    } catch (error) {
      console.error("Unable to load the desktop product version", error);
      sidebarVersionLabel.hidden = true;
    }
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
    return documentController.persistDraft(showStatusToast);
  }

  function scheduleSave(showStatusToast) {
    return documentController.scheduleDraftSave(showStatusToast);
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

  function confirmExternalChange() {
    return new Promise((resolve) => {
      const finish = (choice) => {
        if (typeof externalChangeDialog.close === "function") externalChangeDialog.close();
        externalChangeDialog.removeAttribute("open");
        resolve(choice);
      };
      externalChangeKeep.onclick = () => finish("keep");
      externalChangeReload.onclick = () => finish("reload");
      if (typeof externalChangeDialog.showModal === "function") {
        externalChangeDialog.showModal();
      } else {
        externalChangeDialog.setAttribute("open", "open");
      }
    });
  }

  const recentFilesController = createRecentFilesController({
    button: recentFilesButton,
    panel: recentFilesPanel,
    list: recentFilesList,
    desktopBridge,
    escapeHtml,
    getFileNameFromPath,
    getRecentFiles,
    saveRecentFiles,
    confirmIfDirty,
    confirmAction: openConfirmDialog,
    loadRecentResult: (result) => loadMarkdownFromDesktopResult(result, { showLoadedToast: false }),
    showToast
  });

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
      documentController.cancelDraftSave();
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

  function getDocumentBaseUrl(filePath) {
    const rawPath = String(filePath || "").trim();
    if (!rawPath) {
      return "";
    }

    const normalizedPath = rawPath.replace(/\\/g, "/");
    try {
      if (/^[A-Za-z]:\//.test(normalizedPath)) {
        return new URL(`file:///${normalizedPath}`).href;
      }
      if (normalizedPath.startsWith("/")) {
        return new URL(`file://${normalizedPath}`).href;
      }
    } catch (error) {
      console.warn("Unable to derive a document base URL", error);
    }

    return "";
  }

  function renderPreviewFromMarkdown(markdown) {
    window.QuillMarkdown.setRenderContext({
      documentBasePath: shellState.currentFilePath,
      documentBaseUrl: getDocumentBaseUrl(shellState.currentFilePath),
      isDesktop: isDesktopBridgeReady
    });
    const blocks = parseMarkdownBlocks(markdown);
    previewPane.setBlocks(blocks);
    hydrateDesktopPreviewImages();
    updateWordCount(markdown);
    syncWorkspaceHeight();
  }

  let previewImageHydrationRun = 0;

  async function hydrateDesktopPreviewImages() {
    if (!isDesktopBridgeReady) {
      return;
    }

    const currentRun = ++previewImageHydrationRun;
    const contentElement = previewPane.getContentElement();
    const previewImages = [...contentElement.querySelectorAll("img[data-local-image-path]")];

    await Promise.all(previewImages.map(async (imageElement) => {
      const localImagePath = imageElement.getAttribute("data-local-image-path") || "";
      if (!localImagePath) {
        return;
      }

      try {
        const dataUrl = await desktopBridge.readImageDataUrl(localImagePath);
        if (currentRun !== previewImageHydrationRun || !imageElement.isConnected) {
          return;
        }
        imageElement.src = dataUrl;
        imageElement.removeAttribute("data-local-image-path");
      } catch (error) {
        if (currentRun !== previewImageHydrationRun || !imageElement.isConnected) {
          return;
        }
        console.error("Unable to hydrate preview image", error);
        imageElement.outerHTML = `<span class="preview-image-placeholder" data-preview-image-placeholder="true" title="Unable to load local image"><span class="preview-image-placeholder-label">${escapeHtml(imageElement.alt || "Image")}</span><span class="preview-image-placeholder-path">${escapeHtml(localImagePath)}</span></span>`;
      }
    }));
  }

  function handleMarkdownInput(showStatusToast) {
    const markdown = markdownPane.getValue();
    const editPosition = getMarkdownEditPosition(markdown, markdownPane.getCaretOffset());
    renderPreviewFromMarkdown(markdown);
    updateActiveBlock(editPosition.index, editPosition.viewportTop);
    scrollPreviewToBlock(editPosition.index, editPosition.viewportTop);
    markDirty(true);
    scheduleSave(showStatusToast);
  }

  function handleMarkdownCaretChange() {
    const markdown = markdownPane.getValue();
    const editPosition = getMarkdownEditPosition(markdown, markdownPane.getCaretOffset());
    updateActiveBlock(editPosition.index, editPosition.viewportTop);
    scrollPreviewToBlock(editPosition.index, editPosition.viewportTop);
  }

  function getBlockIndexAtOffset(markdown, offset) {
    const ranges = getMarkdownBlockRanges(markdown);
    if (!ranges.length) return -1;

    const safeOffset = Math.max(0, Math.min(Number(offset) || 0, markdown.length));
    const containingIndex = ranges.findIndex((range) => safeOffset >= range.start && safeOffset <= range.end);
    if (containingIndex >= 0) return containingIndex;
    if (safeOffset < ranges[0].start) return 0;
    return ranges.length - 1;
  }

  function getMarkdownEditPosition(markdown, offset) {
    const index = getBlockIndexAtOffset(markdown, offset);
    const markdownScrollElement = markdownPane.getScrollElement();
    if (index < 0 || !markdownScrollElement) return { index, viewportTop: 0 };

    return {
      index,
      viewportTop: markdownPane.getCaretViewportTop()
    };
  }

  function scrollPreviewToBlock(index, viewportTop) {
    if (index < 0) return;
    window.requestAnimationFrame(() => {
      shellState.isSyncingScroll = true;
      previewPane.scrollToBlock(index, viewportTop);
      window.requestAnimationFrame(() => {
        shellState.isSyncingScroll = false;
      });
    });
  }

  function scrollMarkdownToBlock(markdown, index) {
    const ranges = getMarkdownBlockRanges(markdown);
    const target = ranges[index];
    const markdownScrollElement = markdownPane.getScrollElement();
    if (!target || !markdownScrollElement) return;

    const lineHeight = parseFloat(window.getComputedStyle(markdownScrollElement).lineHeight) || 27;
    const lineNumber = markdown.slice(0, target.start).split("\n").length - 1;
    markdownScrollElement.scrollTop = Math.max(0, lineNumber * lineHeight - markdownScrollElement.clientHeight * 0.3);
  }

  function updateActiveBlock(index, viewportTop) {
    const totalBlocks = getMarkdownBlockRanges(markdownPane.getValue()).length;
    markdownPane.setActiveBlock(index, totalBlocks, viewportTop);
    previewPane.setActiveBlock(index, totalBlocks, viewportTop);
  }

  function getBlockIndexForMarkdownScroll(markdown) {
    const markdownScrollElement = markdownPane.getScrollElement();
    const ranges = getMarkdownBlockRanges(markdown);
    if (!ranges.length || !markdownScrollElement) return -1;
    const lineHeight = parseFloat(window.getComputedStyle(markdownScrollElement).lineHeight) || 27;
    const lineNumber = Math.max(0, Math.floor(markdownScrollElement.scrollTop / lineHeight));
    let activeIndex = 0;
    ranges.forEach((range, index) => {
      const rangeLine = markdown.slice(0, range.start).split("\n").length - 1;
      if (rangeLine <= lineNumber) activeIndex = index;
    });
    return activeIndex;
  }

  function handleMarkdownScroll() {
    if (shellState.isSyncingScroll) return;
    const markdown = markdownPane.getValue();
    if (document.activeElement === markdownPane.getScrollElement()) {
      handleMarkdownCaretChange();
      return;
    }
    const blockIndex = getBlockIndexForMarkdownScroll(markdown);
    updateActiveBlock(blockIndex);
    shellState.isSyncingScroll = true;
    previewPane.scrollToBlock(blockIndex);
    window.requestAnimationFrame(() => {
      shellState.isSyncingScroll = false;
    });
  }

  function handlePreviewScroll(blockIndex) {
    if (shellState.isSyncingScroll) return;
    const markdown = markdownPane.getValue();
    updateActiveBlock(blockIndex);
    shellState.isSyncingScroll = true;
    scrollMarkdownToBlock(markdown, blockIndex);
    window.requestAnimationFrame(() => {
      shellState.isSyncingScroll = false;
    });
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
    if (settings.filePath !== undefined) {
      shellState.currentFilePath = settings.filePath || "";
    }

    renderPreviewFromMarkdown(content);
    resetDocumentScrollPositions();
    persistDraft(Boolean(settings.showStatusToast));
    markDirty(Boolean(settings.dirty));
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

  function getSuggestedMarkdownFilename() {
    return shellState.currentFileName || "document.md";
  }

  async function loadMarkdownFromDesktopResult(result, options) {
    const settings = options || {};
    if (!result) {
      return;
    }
    let recentEntry = null;

    setDocumentContent(result.content, {
      fileName: result.fileName || getFileNameFromPath(result.filePath),
      filePath: result.filePath || "",
      dirty: false,
      showStatusToast: false
    });
    documentController?.setFileBaseline(result.fileState);

    if (result.filePath) {
      recentEntry = recentFilesController.recordRecentFile(result.filePath, result.fileName);
    } else if (settings.showPathWarning !== false) {
      showToast("Recent file not tracked", "This file was opened without a reusable full path, so it cannot appear in Recent.");
    }

    if (recentEntry) {
      recentFilesController.setCurrentRecentFile(recentEntry);
    } else {
      recentFilesController.clearCurrentRecentFile();
    }

    if (settings.showLoadedToast !== false) {
      showToast("Loaded", `${result.fileName || "Document"} is now open.`);
    }
  }

  const documentController = createDocumentController({
    clock: {
      clearTimeout: (timer) => window.clearTimeout(timer),
      setTimeout: (callback, delay) => window.setTimeout(callback, delay)
    },
    desktopBridge: isDesktopBridgeReady ? desktopBridge : null,
    dialogs: { confirmExternalChange, confirmIfDirty },
    document: {
      getContent: () => markdownPane.getValue(),
      getFileIdentity: () => ({
        fileName: getSuggestedMarkdownFilename(),
        filePath: shellState.currentFilePath
      })
    },
    events: {
      onError: (operation, error) => {
        const labels = {
          createNewDocument: "Unable to create a new document",
          loadDocument: "Unable to load markdown file",
          persistDraft: "Unable to persist the local draft",
          saveDocument: "Unable to save markdown file"
        };
        console.error(labels[operation] || `Document operation failed: ${operation}`, error);
      },
      onLoaded: (result) => loadMarkdownFromDesktopResult(result),
      onExternalReloaded: (result) => loadMarkdownFromDesktopResult(result, { showLoadedToast: false }),
      onExternalKept: () => showToast("External change kept out", "Your Quill version remains open; the disk version will not prompt again until it changes."),
      onNewDocument: () => {
        shellState.currentFileName = "";
        shellState.currentFilePath = "";
        recentFilesController.clearCurrentRecentFile();
        setDocumentContent(NEW_DOCUMENT_CONTENT, {
          fileName: "",
          filePath: "",
          dirty: false,
          showStatusToast: false
        });
        showToast("New document", "Started a fresh Markdown document.");
      },
      onSaved: (result, context) => {
        shellState.currentFilePath = result.filePath || "";
        shellState.currentFileName = result.fileName || shellState.currentFileName;

        if (shellState.currentFilePath) {
          const recentEntry = recentFilesController.recordRecentFile(shellState.currentFilePath, shellState.currentFileName);
          recentFilesController.setCurrentRecentFile(recentEntry);
        } else {
          showToast("Recent file not tracked", "This save target did not provide a reusable full path, so it cannot appear in Recent.");
        }

        markDirty(false);
        documentController.setFileBaseline(result.fileState);
        showToast("SAVED TO FILE", "", { id: "save-status", duration: 1600 });
        showToast(context.saveAs ? "Saved as" : "Saved", `${shellState.currentFileName || "Document"} was written to disk.`);
      },
      showToast
    },
    isAutosaveEnabled: () => shellState.isAutoSaveEnabled,
    storage: { saveDraft }
  });

  async function handleLoadDocument() {
    return documentController.loadDocument();
  }

  async function handleSaveDocument(saveAs) {
    return documentController.saveDocument(saveAs);
  }

  async function handleNewDocument() {
    return documentController.createNewDocument();
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
    onCaretChange: handleMarkdownCaretChange,
    onScroll: handleMarkdownScroll,
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
    onBlocksCommitted: (blocks, toastTitle, toastMessage, editedBlockIndex) => {
      const nextMarkdown = blocksToMarkdown(blocks);
      markdownPane.setValue(nextMarkdown);
      renderPreviewFromMarkdown(nextMarkdown);
      updateActiveBlock(editedBlockIndex);
      shellState.isSyncingScroll = true;
      scrollMarkdownToBlock(nextMarkdown, editedBlockIndex);
      window.requestAnimationFrame(() => {
        shellState.isSyncingScroll = false;
      });
      markDirty(true);
      scheduleSave(false);
      if (toastTitle) {
        showToast(toastTitle, toastMessage || "");
      }
    },
    onHeadingStateChange: (headings, activeHeadingId) => {
      outlinePane.render(headings, activeHeadingId);
    },
    onScroll: handlePreviewScroll,
    onToast: showToast,
    renderBlockContent: window.QuillMarkdown.renderBlockContent,
    requestConfirm: openConfirmDialog,
    splitTableCells: window.QuillMarkdown.splitTableCells,
    tableRowsToMarkdown: window.QuillMarkdown.tableRowsToMarkdown
  });

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
  toggleMarkdownPaneButton.addEventListener("click", toggleMarkdownPaneCollapsed);
  toggleAutoSaveButton.addEventListener("click", toggleAutoSave);
  togglePreviewEditingButton.addEventListener("click", togglePreviewEditingEnabled);

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
  externalChangeDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
  });
  window.addEventListener("focus", () => {
    documentController.checkExternalChange();
  });
  window.addEventListener("resize", syncWorkspaceHeight);
  window.addEventListener("beforeunload", (event) => {
    if (!shellState.isDirty) return;
    event.preventDefault();
    event.returnValue = "";
  });

  const savedAutoSave = getAutosavePreference();

  setAutoSave(savedAutoSave !== "false");
  configureDesktopFileControls();
  recentFilesController.render();
  recentFilesController.hydrate();
  setDocumentContent(DEFAULT_CONTENT, {
    fileName: "quill.md",
    filePath: "",
    dirty: false,
    showStatusToast: false
  });
  if (shellState.isAutoSaveEnabled) {
    persistDraft(false);
  }
  setMarkdownPaneCollapsed(false);
  setPreviewEditingEnabled(false);
  loadDesktopProductVersion();
})();
