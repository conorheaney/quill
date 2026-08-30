import type { MarkdownPanePort, PreviewPanePort, ShellLayoutOptions, ShellLayoutPort } from "./contracts";

class ShellLayoutController implements ShellLayoutPort {
  private readonly workspace: HTMLElement;
  private readonly toggleMarkdownPaneButton: HTMLButtonElement;
  private readonly togglePreviewEditingButton: HTMLButtonElement;
  private readonly markdownPane: MarkdownPanePort;
  private readonly previewPane: PreviewPanePort;
  private isMarkdownPaneCollapsed = false;
  private isPreviewEditingEnabled = false;

  public constructor(options: ShellLayoutOptions) {
    this.workspace = options.workspace;
    this.toggleMarkdownPaneButton = options.toggleMarkdownPaneButton;
    this.togglePreviewEditingButton = options.togglePreviewEditingButton;
    this.markdownPane = options.markdownPane;
    this.previewPane = options.previewPane;
  }

  public syncWorkspaceHeight(): void {
    this.workspace.style.minHeight = "0";
    this.workspace.style.height = "100%";
  }

  public setMarkdownPaneCollapsed(collapsed: boolean): void {
    this.isMarkdownPaneCollapsed = collapsed;
    this.workspace.classList.toggle("editor-collapsed", collapsed);
    this.toggleMarkdownPaneButton.setAttribute("aria-checked", collapsed ? "false" : "true");
    this.toggleMarkdownPaneButton.setAttribute("title", collapsed ? "EDITOR HIDDEN" : "EDITOR VISIBLE");
    this.syncWorkspaceHeight();

    if (collapsed) {
      this.previewPane.focus({ preventScroll: true });
    } else {
      this.markdownPane.focus({ preventScroll: true });
    }
  }

  public toggleMarkdownPaneCollapsed(): void {
    this.setMarkdownPaneCollapsed(!this.isMarkdownPaneCollapsed);
  }

  public setPreviewEditingEnabled(enabled: boolean): void {
    this.isPreviewEditingEnabled = enabled;
    this.togglePreviewEditingButton.setAttribute("aria-checked", enabled ? "true" : "false");
    this.togglePreviewEditingButton.setAttribute("title", enabled ? "INLINE EDITING ENABLED" : "INLINE EDITING DISABLED");
    this.previewPane.setReadOnly(!enabled);
  }

  public togglePreviewEditingEnabled(): void {
    this.setPreviewEditingEnabled(!this.isPreviewEditingEnabled);
  }
}

window.QuillShellLayout = {
  create(options: ShellLayoutOptions): ShellLayoutPort {
    return new ShellLayoutController(options);
  }
};
