export type ThemeName = "dark" | "light" | "sepia" | "nord" | string;

export interface HeadingBlock {
  type: "heading";
  level: number;
  content: string;
}

export interface TextBlock {
  type: "paragraph" | "html";
  content: string;
}

export interface ListBlock {
  type: "ul" | "ol";
  items: string[];
}

export interface BlockquoteBlock {
  type: "blockquote";
  lines: string[];
}

export interface CodeBlock {
  type: "code";
  language: string;
  content: string;
}

export interface TableBlock {
  type: "table";
  rows: string[][];
}

export type MarkdownBlock =
  | HeadingBlock
  | TextBlock
  | ListBlock
  | BlockquoteBlock
  | CodeBlock
  | TableBlock;

export interface MarkdownRange {
  start: number;
  end: number;
}

export interface MarkdownPort {
  parseMarkdownBlocks(markdown: string): MarkdownBlock[];
  getMarkdownBlockRanges(markdown: string): MarkdownRange[];
  blockToMarkdown(block: MarkdownBlock): string;
  blocksToMarkdown(blocks: MarkdownBlock[]): string;
  renderMarkdown(markdown: string): string;
  splitTableCells(line: string): string[];
}

export interface MarkdownApi extends MarkdownPort {
  escapeAttribute(value: string): string;
  escapeHtml(value: string): string;
  normaliseLanguage(language: string): string;
  renderBlockContent(block: MarkdownBlock): string;
  renderTableFromRows(rows: string[][]): string;
  rebaseRelativeImageReferences(content: string, sourceFilePath: string, targetFilePath: string): string;
  setRenderContext(context: RenderContext): void;
  tableRowsToMarkdown(rows: string[][]): string;
}

export interface RenderContext {
  documentBasePath: string;
  documentBaseUrl: string;
  isDesktop: boolean;
}

export interface InlineOptions {
  escapeText?: boolean;
  inputAlreadyEscaped?: boolean;
  useFencedCodeSpans?: boolean;
}

export interface FileIdentity {
  filePath: string;
  fileName: string;
}

export interface DocumentStatusOptions {
  documentFileLabel: HTMLElement;
  saveDocumentButton: HTMLButtonElement;
}

export interface DocumentStatusPort {
  readonly currentFileName: string;
  readonly currentFilePath: string;
  readonly isDirty: boolean;
  setIdentity(identity: Partial<FileIdentity>): void;
  setDirty(dirty: boolean): void;
  getSuggestedFilename(): string;
}

export interface AutosaveControllerOptions {
  toggleButton: HTMLButtonElement;
  getPreference(): string | null;
  savePreference(enabled: boolean): void;
  cancelDraftSave(): void;
  persistDraft(): unknown;
  showToast(title: string, message: string): void;
}

export interface AutosaveControllerPort {
  readonly isEnabled: boolean;
  initialise(): void;
  set(enabled: boolean, persistImmediately?: boolean): void;
  toggle(): void;
}

export interface DesktopShellControllerOptions {
  desktopBridge: Partial<DesktopBridgePort> | null;
  fileButtons: HTMLButtonElement[];
  versionLabel: HTMLElement | null;
  showToast(title: string, message: string, options?: ToastOptions): void;
}

export interface DesktopShellControllerPort {
  readonly isReady: boolean;
  configureFileControls(): void;
  loadProductVersion(): Promise<void>;
}

export interface FileDropControllerOptions {
  markdownPane: MarkdownPanePort;
  onInput(): void;
}

export interface FileDropControllerPort {
  handle(files: FileList | null): Promise<void>;
}

export interface FileState {
  filePath: string;
  exists: boolean;
  modifiedAt?: number | string | null;
  size?: number | null;
  contentHash?: string | null;
}

export interface RecentFileEntry extends FileIdentity {}

export interface DocumentSessionState {
  content: string;
  file: FileIdentity | null;
  fileState: FileState | null;
  dirty: boolean;
}

export interface DocumentPort {
  getContent(): string;
  setContent(content: string): void;
  getFileIdentity(): FileIdentity | null;
}

export interface PaneControllerPort {
  setContent(content: string): void;
  refresh(): void;
  destroy?(): void;
}

export interface OutlineHeading {
  id: string;
  level: number;
  text: string;
}

export interface OutlinePanePort {
  render(headings: OutlineHeading[], headingId?: string): void;
  setActiveHeading(headingId?: string): void;
}

export interface OutlinePaneOptions {
  navElement: HTMLElement;
  escapeHtml(value: string): string;
  onSelectHeading(headingId: string | undefined): void;
}

export type MarkdownPaneAction = "bold" | "italic" | "heading" | "heading2" | "heading3" | "bulletList" | "link" | "codeBlock";

export interface MarkdownActionControllerOptions {
  markdownPane: MarkdownPanePort;
  onInput(): void;
  openCodeDialog(): void;
}

export interface MarkdownActionControllerPort {
  handle(action: MarkdownPaneAction | string | undefined): void;
}
export type MarkdownPaneShortcut = "save" | "saveAs" | "load" | "new";

export interface SelectionState {
  start: number;
  end: number;
  direction: SelectionDirection | null;
}

export interface MarkdownPaneOptions {
  rootElement: HTMLElement;
  inputElement: HTMLTextAreaElement;
  onInput(userInitiated: boolean): void;
  onCaretChange?(): void;
  onScroll?(event: Event): void;
  onAction(action: MarkdownPaneAction | string | undefined): void;
  onShortcutCommand(command: MarkdownPaneShortcut): void;
  onDroppedFiles(files: FileList | null): void;
}

export interface MarkdownPanePort {
  focus(options?: FocusOptions): void;
  getCaretOffset(): number;
  getCaretViewportTop(): number;
  getScrollElement(): HTMLTextAreaElement;
  getSelectedText(): string;
  getSelectionState(): SelectionState;
  getValue(): string;
  prefixLines(prefix: string): void;
  replaceSelection(text: string, mode?: SelectionMode): void;
  insertLink(): void;
  setSelectionRange(start: number, end: number): void;
  setActiveBlock(index: number, totalBlocks: number, viewportTop?: number): void;
  setCaretPosition(viewportTop: number): void;
  setValue(value: string): void;
  wrapSelection(before: string, after?: string, placeholder?: string): void;
}

export interface ToastOptions {
  id?: string;
  duration?: number;
}

export interface ToastControllerOptions {
  toastStack: HTMLElement;
  escapeHtml(value: string): string;
}

export interface ToastControllerPort {
  show(title: string, message: string, options?: ToastOptions): void;
}

export interface RecentFilesOptions {
  button: HTMLButtonElement;
  panel: HTMLElement;
  list: HTMLElement;
  desktopBridge: Pick<DesktopBridgePort, "reopenMarkdownFile" | "revealInExplorer">;
  escapeHtml(value: string): string;
  getFileNameFromPath(filePath: string): string;
  getRecentFiles(): Promise<RecentFileEntry[]>;
  saveRecentFiles(entries: RecentFileEntry[]): Promise<void>;
  confirmIfDirty(title: string, message: string, acceptLabel: string): Promise<boolean>;
  confirmAction(title: string, message: string, acceptLabel: string): Promise<boolean>;
  loadRecentResult(result: unknown): Promise<void>;
  showToast(title: string, message: string, options?: ToastOptions): void;
}

export interface RecentFilesPort {
  clearCurrentRecentFile(): void;
  hydrate(): Promise<void>;
  recordRecentFile(filePath: string, fileName?: string): RecentFileEntry | null;
  render(options?: { animate?: boolean }): void;
  setCurrentRecentFile(entry: RecentFileEntry | null): void;
}

export type InlineEditorBlockType = "paragraph" | "heading-1" | "heading-2" | "heading-3" | "blockquote" | "ul" | "ol" | "code" | "table";

export interface InlineEditState {
  index: number;
  type: InlineEditorBlockType;
  content: string;
  language: string;
  isNewBlock: boolean;
}

export interface PreviewPaneOptions {
  rootElement: HTMLElement;
  contentElement: HTMLElement;
  escapeHtml(value: string): string;
  renderBlockContent(block: MarkdownBlock): string;
  splitTableCells(line: string): string[];
  tableRowsToMarkdown(rows: string[][]): string;
  normaliseLanguage(language: string): string;
  onBlocksCommitted(blocks: MarkdownBlock[], messageTitle: string, messageBody: string, editedBlockIndex?: number): void;
  onHeadingStateChange(headings: OutlineHeading[], activeHeadingId: string): void;
  onScroll?(blockIndex: number): void;
  onToast(title: string, message: string): void;
  requestConfirm(title: string, message: string, acceptLabel: string): Promise<boolean>;
}

export interface PreviewPanePort {
  focus(options?: FocusOptions): void;
  getContentElement(): HTMLElement;
  getScrollElement(): HTMLElement;
  getVisibleBlockIndex(): number;
  ensureBlockVisible(index: number, blockProgress?: number): void;
  setActiveBlock(index: number, totalBlocks: number, viewportTop?: number): void;
  scrollToBlock(index: number, viewportTop?: number): void;
  scrollToHeading(headingId: string): void;
  setBlocks(blocks: MarkdownBlock[]): void;
  setReadOnly(readOnly: boolean): void;
}

export interface PreviewRendererOptions {
  markdown: MarkdownApi;
  previewPane: PreviewPanePort;
  desktopBridge: Pick<DesktopBridgePort, "readImageDataUrl"> | null;
  isDesktop: boolean;
  getDocumentPath(): string;
  wordCountElement: HTMLElement;
  syncWorkspaceHeight(): void;
}

export interface PreviewRendererPort {
  render(content: string): void;
}

export interface ShellLayoutOptions {
  workspace: HTMLElement;
  toggleMarkdownPaneButton: HTMLButtonElement;
  togglePreviewEditingButton: HTMLButtonElement;
  markdownPane: MarkdownPanePort;
  previewPane: PreviewPanePort;
}

export interface ShellLayoutPort {
  syncWorkspaceHeight(): void;
  setMarkdownPaneCollapsed(collapsed: boolean): void;
  toggleMarkdownPaneCollapsed(): void;
  setPreviewEditingEnabled(enabled: boolean): void;
  togglePreviewEditingEnabled(): void;
}

export interface DialogSelection {
  start: number;
  end: number;
}

export interface ShellState {
  confirmResolver: ((accepted: boolean) => void) | null;
  currentFileName: string;
  currentFilePath: string;
  dialogSelection: DialogSelection;
  isAutoSaveEnabled: boolean;
  isDirty: boolean;
  isMarkdownPaneCollapsed: boolean;
  isPreviewEditingEnabled: boolean;
  isSyncingScroll: boolean;
}

export interface MarkdownEditPosition {
  index: number;
  renderIndex: number;
  viewportTop?: number;
  blockProgress?: number;
}

export interface ScrollSyncOptions {
  markdown: MarkdownPort;
  markdownPane: MarkdownPanePort;
  previewPane: PreviewPanePort;
}

export interface ScrollSyncPort {
  getEditPosition(content: string, offset: number): MarkdownEditPosition;
  updateCaretPosition(content: string, offset: number): void;
  handleMarkdownScroll(): void;
  handlePreviewScroll(blockIndex: number): void;
  updateActiveBlock(index: number, viewportTop?: number): void;
  scrollMarkdownToBlock(content: string, index: number): void;
  resetDocumentScrollPositions(): void;
}

export interface CodeToken {
  type: string;
  value: string;
}

export interface CodeImageToolOptions {
  languageMeta: Record<string, LanguageDefinition>;
  escapeHtml(value: string): string;
}

export interface CodeImageToolPort {
  highlightCodeHtml(language: string, code: string): string;
  createCodeImageMarkdown(language: string, code: string): string;
}

export interface CodeDialogControllerOptions {
  dialog: HTMLDialogElement;
  languageInput: HTMLSelectElement;
  codeInput: HTMLTextAreaElement;
  preview: HTMLElement;
  previewLanguage: HTMLElement;
  markdownPane: MarkdownPanePort;
  codeImageTool: CodeImageToolPort;
  languageMeta: Record<string, LanguageDefinition>;
  normaliseLanguage(language: string): string;
  onAccepted(): void;
}

export interface CodeDialogControllerPort {
  open(): void;
  close(): void;
  updatePreview(): void;
  accept(): void;
}

export interface DialogControllerOptions {
  confirmDialog: HTMLDialogElement;
  confirmDialogTitle: HTMLElement;
  confirmDialogMessage: HTMLElement;
  confirmDialogAccept: HTMLElement;
  externalChangeDialog: HTMLDialogElement;
  externalChangeKeep: HTMLButtonElement;
  externalChangeReload: HTMLButtonElement;
}

export interface DialogControllerPort {
  open(title: string, message: string, acceptLabel?: string): Promise<boolean>;
  close(accepted: boolean): void;
  confirmExternalChange(): Promise<ExternalChangeChoice>;
}

export interface ClockPort {
  setTimeout(callback: () => void, delay: number): unknown;
  clearTimeout(timer: unknown): void;
}

export type ExternalChangeChoice = "reload" | "keep" | "cancel";

export interface DialogPort {
  confirmIfDirty(title: string, message: string, acceptLabel: string): Promise<boolean>;
  confirmAction?(title: string, message: string, acceptLabel: string): Promise<boolean>;
  confirmExternalChange?(): Promise<ExternalChangeChoice>;
}

export interface DocumentControllerEvents {
  onMissingDependency?(name: string): void;
  onError?(operation: string, error: unknown): void;
  showToast?(title: string, message: string, options?: ToastOptions): void;
  onLoaded?(result: unknown): void | Promise<void>;
  onSaved?(result: unknown, context: { saveAs: boolean }): void | Promise<void>;
  onNewDocument?(): void | Promise<void>;
  onExternalReloaded?(result: unknown): void | Promise<void>;
  onExternalKept?(state: FileState): void | Promise<void>;
}

export interface DocumentControllerOptions {
  desktopBridge?: Partial<DesktopBridgePort>;
  storage?: Pick<StoragePort, "saveDraft">;
  clock?: ClockPort;
  dialogs?: DialogPort;
  document?: DocumentPort;
  events?: DocumentControllerEvents;
  draftDelay?: number;
  isAutosaveEnabled?(): boolean;
}

export interface ControllerOutcome {
  status: string;
  dependency?: string;
  error?: unknown;
  operation?: string;
  result?: unknown;
  accepted?: boolean;
  timer?: unknown;
}

export interface DocumentControllerPort {
  cancelDraftSave(): void;
  checkExternalChange(): Promise<ControllerOutcome>;
  createNewDocument(): Promise<ControllerOutcome>;
  loadDocument(): Promise<ControllerOutcome>;
  persistDraft(showStatusToast?: boolean): ControllerOutcome;
  saveDocument(saveAs?: boolean): Promise<ControllerOutcome>;
  scheduleDraftSave(showStatusToast?: boolean): ControllerOutcome;
  setFileBaseline(baseline: FileState | null): void;
}

export interface PersistenceResult {
  status: "persisted" | "scheduled" | "disabled" | "cancelled" | "failed";
  error?: unknown;
  operation?: string;
  timer?: unknown;
}

export interface StoragePort {
  saveDraft(content: string): void;
  getTheme(fallback?: ThemeName): ThemeName;
  saveTheme(theme: ThemeName): void;
  getAutosavePreference(): string | null;
  saveAutosavePreference(enabled: boolean): void;
  getRecentFiles(): Promise<RecentFileEntry[]>;
  saveRecentFiles(entries: RecentFileEntry[]): Promise<void>;
}

export interface LanguageDefinition {
  label: string;
  keywords: string[];
}

export interface AppConfig {
  DEFAULT_CONTENT: string;
  LANGUAGE_META: Record<string, LanguageDefinition>;
  NEW_DOCUMENT_CONTENT: string;
}

export interface ThemeSelectorPort {
  mount(mountElement: HTMLElement | null): Promise<void>;
}

export interface DesktopBridgePort {
  minimizeWindow(): Promise<unknown>;
  toggleMaximizeWindow(): Promise<unknown>;
  isWindowMaximized(): Promise<unknown>;
  closeWindow(): Promise<unknown>;
  startWindowDragging(): Promise<unknown>;
  setWindowTitle(title: string): Promise<unknown>;
  onWindowCloseRequested(handler: (...args: unknown[]) => unknown): Promise<unknown>;
  completeStartup(): Promise<unknown>;
  showStartupFailure(): Promise<unknown>;
  getAppVersion(): Promise<string | null>;
  openMarkdownFile(): Promise<unknown | null>;
  reopenMarkdownFile(filePath: string): Promise<unknown | null>;
  saveMarkdownFile(payload: SaveMarkdownPayload): Promise<unknown | null>;
  inspectMarkdownFile(filePath: string): Promise<FileState>;
  verifyMarkdownFile(filePath: string): Promise<FileState>;
  revealInExplorer(filePath: string): Promise<unknown>;
  readImageDataUrl(filePath: string): Promise<string>;
}

export interface WindowChromeOptions {
  desktopBridge?: Partial<DesktopBridgePort> | null;
  onRequestClose?(): Promise<boolean> | boolean;
  title?: string;
}

export interface WindowChromePort {
  status: "ready" | "unavailable";
  setTitle?: (title: string) => void;
  refreshMaximizedState?: () => Promise<void>;
}

export interface SaveMarkdownPayload {
  content: string;
  filePath: string;
  saveAs: boolean;
  suggestedName: string;
  sourceFilePath?: string;
  beforeWrite?(filePath: string): Promise<boolean>;
}

declare global {
  interface Window {
    QuillConfig: AppConfig;
    QuillDesktop: DesktopBridgePort;
    QuillMarkdown: MarkdownApi;
    QuillMarkdownPane: {
      createMarkdownPane(options: MarkdownPaneOptions): MarkdownPanePort;
    };
    QuillPreviewPane: {
      createPreviewPane(options: PreviewPaneOptions): PreviewPanePort;
      resolvePreviewAnchorTarget(anchor: HTMLAnchorElement): string;
    };
    QuillPreviewRenderer: {
      create(options: PreviewRendererOptions): PreviewRendererPort;
    };
    QuillShellLayout: {
      create(options: ShellLayoutOptions): ShellLayoutPort;
    };
    QuillDocumentStatus: {
      create(options: DocumentStatusOptions): DocumentStatusPort;
    };
    QuillScrollSync: {
      create(options: ScrollSyncOptions): ScrollSyncPort;
    };
    QuillAutosave: {
      create(options: AutosaveControllerOptions): AutosaveControllerPort;
    };
    QuillDesktopShell: {
      create(options: DesktopShellControllerOptions): DesktopShellControllerPort;
    };
    QuillFileDrop: {
      create(options: FileDropControllerOptions): FileDropControllerPort;
    };
    QuillMarkdownActions: {
      create(options: MarkdownActionControllerOptions): MarkdownActionControllerPort;
    };
    QuillRecentFiles: {
      createRecentFilesController(options: RecentFilesOptions): RecentFilesPort;
    };
    QuillDocumentController: {
      createDocumentController(options?: DocumentControllerOptions): DocumentControllerPort;
    };
    QuillDialogs: {
      createDialogController(options: DialogControllerOptions): DialogControllerPort;
    };
    QuillCodeImageTool: {
      create(options: CodeImageToolOptions): CodeImageToolPort;
    };
    QuillCodeDialog: {
      create(options: CodeDialogControllerOptions): CodeDialogControllerPort;
    };
    QuillWindowChrome: {
      initialise(options?: WindowChromeOptions): WindowChromePort;
    };
    QuillOutlinePane: {
      createOutlinePane(options: OutlinePaneOptions): OutlinePanePort;
    };
    QuillStorage: StoragePort;
    QuillThemeSelector: ThemeSelectorPort;
    QuillToast: {
      create(options: ToastControllerOptions): ToastControllerPort;
    };
  }
}
