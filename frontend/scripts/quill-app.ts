import type { ControllerOutcome, FileState } from "./contracts";

const {
  blocksToMarkdown,
  escapeHtml
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
const codeImageTool = window.QuillCodeImageTool.create({
  escapeHtml,
  languageMeta: LANGUAGE_META
});

async function initialiseQuill(): Promise<void> {
  interface DocumentResult {
    content: string;
    fileName?: string;
    filePath?: string;
    fileState?: FileState | null;
  }

  interface DocumentContentOptions {
    fileName?: string;
    filePath?: string;
    dirty?: boolean;
    showStatusToast?: boolean;
  }

  function requireElement<T extends HTMLElement>(id: string): T {
    const element = document.getElementById(id);
    if (!element) throw new Error(`Unable to find element ${id}`);
    return element as T;
  }

  function requireSelector<T extends Element>(selector: string): T {
    const element = document.querySelector(selector);
    if (!element) throw new Error(`Unable to find element ${selector}`);
    return element as T;
  }

  function mountPaneTemplate(mountId: string, templateId: string): void {
    const mountElement = requireElement(mountId);
    const templateElement = requireElement<HTMLTemplateElement>(templateId);
    if (!mountElement || !templateElement) {
      throw new Error(`Unable to mount ${templateId}`);
    }

    mountElement.replaceChildren(templateElement.content.cloneNode(true));
  }

  async function mountHtmlFragment(mountId: string, path: string): Promise<void> {
    const mountElement = requireElement(mountId);
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
  await window.QuillThemeSelector.mount(requireElement("themeSelectorMount"));

  const workspace = requireSelector<HTMLElement>(".workspace");
  const toggleMarkdownPaneButton = requireElement<HTMLButtonElement>("toggleMarkdownPaneButton");
  const toggleAutoSaveButton = requireElement<HTMLButtonElement>("toggleAutoSaveButton");
  const togglePreviewEditingButton = requireElement<HTMLButtonElement>("togglePreviewEditingButton");
  const createDocumentButton = requireElement<HTMLButtonElement>("createDocumentButton");
  const loadDocumentButton = requireElement<HTMLButtonElement>("loadDocumentButton");
  const saveDocumentButton = requireElement<HTMLButtonElement>("saveDocumentButton");
  const saveDocumentAsButton = requireElement<HTMLButtonElement>("saveDocumentAsButton");
  const recentFilesButton = requireElement<HTMLButtonElement>("recentFilesButton");
  const recentFilesPanel = requireElement("recentFilesPanel");
  const recentFilesList = requireElement("recentFilesList");
  const sidebarVersionLabel = requireElement("sidebarVersionLabel");
  const documentFileLabel = requireElement("documentFileLabel");
  const markdownWordCount = requireElement("markdownWordCount");
  const toastStack = requireElement("toastStack");
  const confirmDialog = requireElement<HTMLDialogElement>("confirmDialog");
  const confirmDialogTitle = requireElement("confirmDialogTitle");
  const confirmDialogMessage = requireElement("confirmDialogMessage");
  const confirmDialogCancel = requireElement<HTMLButtonElement>("confirmDialogCancel");
  const confirmDialogAccept = requireElement<HTMLButtonElement>("confirmDialogAccept");
  const externalChangeDialog = requireElement<HTMLDialogElement>("externalChangeDialog");
  const externalChangeKeep = requireElement<HTMLButtonElement>("externalChangeKeep");
  const externalChangeReload = requireElement<HTMLButtonElement>("externalChangeReload");
  const codeDialog = requireElement<HTMLDialogElement>("codeDialog");
  const codeSnippetLanguage = requireElement<HTMLSelectElement>("codeSnippetLanguage");
  const codeSnippetInput = requireElement<HTMLTextAreaElement>("codeSnippetInput");
  const codeSnippetPreview = requireElement("codeSnippetPreview");
  const codeSnippetPreviewLanguage = requireElement("codeSnippetPreviewLanguage");
  const codeDialogCancel = requireElement<HTMLButtonElement>("codeDialogCancel");
  const codeDialogAccept = requireElement<HTMLButtonElement>("codeDialogAccept");
  const toastController = window.QuillToast.create({
    toastStack,
    escapeHtml
  });
  const documentStatus = window.QuillDocumentStatus.create({
    documentFileLabel,
    saveDocumentButton
  });
  const desktopBridge = window.QuillDesktop || null;
  const desktopShellController = window.QuillDesktopShell.create({
    desktopBridge,
    fileButtons: [loadDocumentButton, saveDocumentButton, saveDocumentAsButton, recentFilesButton],
    versionLabel: sidebarVersionLabel,
    showToast: toastController.show.bind(toastController)
  });

  const outlinePane = createOutlinePane({
    navElement: requireElement("outlinePaneNav"),
    escapeHtml,
    onSelectHeading: (headingId) => {
      if (headingId) previewPane.scrollToHeading(headingId);
    }
  });

  function getFileNameFromPath(filePath: string): string {
    if (!filePath) return "";
    const pathSegments = String(filePath).split(/[\\/]+/).filter(Boolean);
    return pathSegments.length ? pathSegments[pathSegments.length - 1] : filePath;
  }

  function persistDraft(showStatusToast: boolean): ControllerOutcome {
    return documentController.persistDraft(showStatusToast);
  }

  function scheduleSave(showStatusToast: boolean): ControllerOutcome {
    return documentController.scheduleDraftSave(showStatusToast);
  }

  const dialogController = window.QuillDialogs.createDialogController({
    confirmDialog,
    confirmDialogTitle,
    confirmDialogMessage,
    confirmDialogAccept,
    externalChangeDialog,
    externalChangeKeep,
    externalChangeReload
  });

  function openConfirmDialog(title: string, message: string, acceptLabel: string): Promise<boolean> {
    return dialogController.open(title, message, acceptLabel);
  }

  function closeConfirmDialog(result: boolean): void {
    dialogController.close(result);
  }

  async function confirmIfDirty(title: string, message: string, acceptLabel: string): Promise<boolean> {
    if (!documentStatus.isDirty) return true;
    return openConfirmDialog(title, message, acceptLabel);
  }

  function confirmExternalChange() {
    return dialogController.confirmExternalChange();
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
    showToast: toastController.show.bind(toastController)
  });

  function handleMarkdownInput(showStatusToast: boolean): void {
    const markdown = markdownPane.getValue();
    previewRenderer.render(markdown);
    scrollSync.updateCaretPosition(markdown, markdownPane.getCaretOffset());
    documentStatus.setDirty(true);
    scheduleSave(showStatusToast);
  }

  function handleMarkdownCaretChange() {
    const markdown = markdownPane.getValue();
    scrollSync.updateCaretPosition(markdown, markdownPane.getCaretOffset());
  }

  function setDocumentContent(content: string, options: DocumentContentOptions): void {
    const settings = options || {};
    markdownPane.setValue(content);

    documentStatus.setIdentity({
      fileName: settings.fileName,
      filePath: settings.filePath
    });

    previewRenderer.render(content);
    scrollSync.resetDocumentScrollPositions();
    persistDraft(Boolean(settings.showStatusToast));
    documentStatus.setDirty(Boolean(settings.dirty));
  }

  function normaliseLanguage(language: string): string {
    const value = (language || "").toLowerCase();
    if (!value || value === "text" || value === "plain" || value === "plaintext") return "text";
    if (value === "js" || value === "javascript") return "javascript";
    if (value === "py" || value === "python") return "python";
    if (value === "c#" || value === "cs" || value === "csharp") return "csharp";
    return "text";
  }

  async function loadMarkdownFromDesktopResult(result: unknown, options: { showLoadedToast?: boolean; showPathWarning?: boolean } = {}): Promise<void> {
    const settings = options || {};
    if (!result || typeof result !== "object" || !("content" in result) || typeof result.content !== "string") {
      return;
    }
    const loaded = result as DocumentResult;
    let recentEntry = null;

    setDocumentContent(loaded.content, {
      fileName: loaded.fileName || getFileNameFromPath(loaded.filePath || ""),
      filePath: loaded.filePath || "",
      dirty: false,
      showStatusToast: false
    });
    documentController?.setFileBaseline(loaded.fileState || null);

    if (loaded.filePath) {
      recentEntry = recentFilesController.recordRecentFile(loaded.filePath, loaded.fileName);
    } else if (settings.showPathWarning !== false) {
      toastController.show("Recent file not tracked", "This file was opened without a reusable full path, so it cannot appear in Recent.");
    }

    if (recentEntry) {
      recentFilesController.setCurrentRecentFile(recentEntry);
    } else {
      recentFilesController.clearCurrentRecentFile();
    }

    if (settings.showLoadedToast !== false) {
      toastController.show("Loaded", `${loaded.fileName || "Document"} is now open.`);
    }
  }

  const documentController = createDocumentController({
    clock: {
      clearTimeout: (timer) => window.clearTimeout(timer as number),
      setTimeout: (callback, delay) => window.setTimeout(callback, delay)
    },
    desktopBridge: desktopShellController.isReady ? desktopBridge || undefined : undefined,
    dialogs: { confirmAction: openConfirmDialog, confirmExternalChange, confirmIfDirty },
    document: {
      getContent: () => markdownPane.getValue(),
      setContent: (content) => markdownPane.setValue(content),
      getFileIdentity: () => ({
        fileName: documentStatus.getSuggestedFilename(),
        filePath: documentStatus.currentFilePath
      })
    },
    events: {
      onError: (operation, error) => {
        const labels: Record<string, string> = {
          createNewDocument: "Unable to create a new document",
          loadDocument: "Unable to load markdown file",
          persistDraft: "Unable to persist the local draft",
          saveDocument: "Unable to save markdown file"
        };
        console.error(labels[operation] || `Document operation failed: ${operation}`, error);
      },
      onLoaded: (result) => loadMarkdownFromDesktopResult(result),
      onExternalReloaded: (result) => loadMarkdownFromDesktopResult(result, { showLoadedToast: false }),
      onExternalKept: () => toastController.show("External change kept out", "Your Quill version remains open; the disk version will not prompt again until it changes."),
      onNewDocument: () => {
        documentStatus.setIdentity({ fileName: "", filePath: "" });
        recentFilesController.clearCurrentRecentFile();
        setDocumentContent(NEW_DOCUMENT_CONTENT, {
          fileName: "",
          filePath: "",
          dirty: false,
          showStatusToast: false
        });
        toastController.show("New document", "Started a fresh Markdown document.");
      },
      onSaved: (result, context) => {
        const saved = result as DocumentResult;
        documentStatus.setIdentity({ filePath: saved.filePath || "" });
        documentStatus.setIdentity({ fileName: saved.fileName || documentStatus.currentFileName });
        markdownPane.setValue(saved.content || markdownPane.getValue());
        previewRenderer.render(markdownPane.getValue());

        if (documentStatus.currentFilePath) {
          const recentEntry = recentFilesController.recordRecentFile(documentStatus.currentFilePath, documentStatus.currentFileName);
          recentFilesController.setCurrentRecentFile(recentEntry);
        } else {
          toastController.show("Recent file not tracked", "This save target did not provide a reusable full path, so it cannot appear in Recent.");
        }

        documentStatus.setDirty(false);
        documentController.setFileBaseline(saved.fileState || null);
        toastController.show("SAVED TO FILE", "", { id: "save-status", duration: 1600 });
        toastController.show(context.saveAs ? "Saved as" : "Saved", `${documentStatus.currentFileName || "Document"} was written to disk.`);
      },
      showToast: toastController.show.bind(toastController)
    },
    isAutosaveEnabled: () => autosaveController.isEnabled,
    storage: { saveDraft }
  });

  const autosaveController = window.QuillAutosave.create({
    toggleButton: toggleAutoSaveButton,
    getPreference: getAutosavePreference,
    savePreference: saveAutosavePreference,
    cancelDraftSave: () => documentController.cancelDraftSave(),
    persistDraft: () => persistDraft(false),
    showToast: toastController.show.bind(toastController)
  });

  window.QuillWindowChrome?.initialise({
    desktopBridge,
    onRequestClose: () => confirmIfDirty(
      "Close Quill?",
      "You have unsaved changes in the current document. Closing Quill will discard those changes.",
      "Close Quill"
    ),
    title: "Quill Markdown Editor"
  });

  async function handleLoadDocument() {
    return documentController.loadDocument();
  }

  async function handleSaveDocument(saveAs: boolean): Promise<ControllerOutcome> {
    return documentController.saveDocument(saveAs);
  }

  async function handleNewDocument() {
    return documentController.createNewDocument();
  }

  const markdownPane = createMarkdownPane({
    rootElement: requireSelector<HTMLElement>('[data-pane-name="markdownPane"]'),
    inputElement: requireElement<HTMLTextAreaElement>("markdownPaneInput"),
    onAction: (action) => markdownActionController.handle(action),
    onDroppedFiles: (files) => {
      fileDropController.handle(files).catch((error) => {
        console.error("Unable to handle dropped files", error);
      });
    },
    onInput: handleMarkdownInput,
    onCaretChange: handleMarkdownCaretChange,
    onScroll: () => scrollSync.handleMarkdownScroll(),
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

  const codeDialogController = window.QuillCodeDialog.create({
    dialog: codeDialog,
    languageInput: codeSnippetLanguage,
    codeInput: codeSnippetInput,
    preview: codeSnippetPreview,
    previewLanguage: codeSnippetPreviewLanguage,
    markdownPane,
    codeImageTool,
    languageMeta: LANGUAGE_META,
    normaliseLanguage,
    onAccepted: () => handleMarkdownInput(false)
  });

  const markdownActionController = window.QuillMarkdownActions.create({
    markdownPane,
    onInput: () => handleMarkdownInput(false),
    openCodeDialog: () => codeDialogController.open()
  });

  const fileDropController = window.QuillFileDrop.create({
    markdownPane,
    onInput: () => handleMarkdownInput(false)
  });

  const previewPane = createPreviewPane({
    rootElement: requireElement("previewPane"),
    contentElement: requireElement("previewPaneContent"),
    escapeHtml,
    normaliseLanguage,
    onBlocksCommitted: (blocks, toastTitle, toastMessage, editedBlockIndex) => {
      const nextMarkdown = blocksToMarkdown(blocks);
      markdownPane.setValue(nextMarkdown);
      previewRenderer.render(nextMarkdown);
      if (editedBlockIndex !== undefined) {
        scrollSync.updateActiveBlock(editedBlockIndex);
        scrollSync.scrollMarkdownToBlock(nextMarkdown, editedBlockIndex);
      }
      documentStatus.setDirty(true);
      scheduleSave(false);
      if (toastTitle) {
        toastController.show(toastTitle, toastMessage || "");
      }
    },
    onHeadingStateChange: (headings, activeHeadingId) => {
      outlinePane.render(headings, activeHeadingId);
    },
    onScroll: (blockIndex) => scrollSync.handlePreviewScroll(blockIndex),
    onToast: toastController.show.bind(toastController),
    renderBlockContent: window.QuillMarkdown.renderBlockContent,
    requestConfirm: openConfirmDialog,
    splitTableCells: window.QuillMarkdown.splitTableCells,
    tableRowsToMarkdown: window.QuillMarkdown.tableRowsToMarkdown
  });

  const previewRenderer = window.QuillPreviewRenderer.create({
    markdown: window.QuillMarkdown,
    previewPane,
    desktopBridge: desktopShellController.isReady ? desktopBridge : null,
    isDesktop: desktopShellController.isReady,
    getDocumentPath: () => documentStatus.currentFilePath,
    wordCountElement: markdownWordCount,
    syncWorkspaceHeight: () => layoutController.syncWorkspaceHeight()
  });

  const layoutController = window.QuillShellLayout.create({
    workspace,
    toggleMarkdownPaneButton,
    togglePreviewEditingButton,
    markdownPane,
    previewPane
  });

  const scrollSync = window.QuillScrollSync.create({
    markdown: window.QuillMarkdown,
    markdownPane,
    previewPane
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
  toggleMarkdownPaneButton.addEventListener("click", () => layoutController.toggleMarkdownPaneCollapsed());
  toggleAutoSaveButton.addEventListener("click", () => autosaveController.toggle());
  togglePreviewEditingButton.addEventListener("click", () => layoutController.togglePreviewEditingEnabled());

  codeSnippetLanguage.addEventListener("change", () => codeDialogController.updatePreview());
  codeSnippetInput.addEventListener("input", () => codeDialogController.updatePreview());
  codeDialogCancel.addEventListener("click", () => codeDialogController.close());
  codeDialogAccept.addEventListener("click", () => codeDialogController.accept());
  codeDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    codeDialogController.close();
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
  window.addEventListener("resize", () => layoutController.syncWorkspaceHeight());
  window.addEventListener("beforeunload", (event) => {
    if (!documentStatus.isDirty) return;
    event.preventDefault();
    event.returnValue = "";
  });

  autosaveController.initialise();
  desktopShellController.configureFileControls();
  recentFilesController.render();
  recentFilesController.hydrate();
  setDocumentContent(DEFAULT_CONTENT, {
    fileName: "quill.md",
    filePath: "",
    dirty: false,
    showStatusToast: false
  });
  if (autosaveController.isEnabled) {
    persistDraft(false);
  }
  layoutController.setMarkdownPaneCollapsed(false);
  layoutController.setPreviewEditingEnabled(false);
  desktopShellController.loadProductVersion();
  await desktopBridge?.completeStartup();
}

initialiseQuill().catch((error: unknown) => {
  console.error("Unable to initialise Quill", error);
  void window.QuillDesktop?.showStartupFailure();
});
