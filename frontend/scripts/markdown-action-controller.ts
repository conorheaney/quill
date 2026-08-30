import type { MarkdownActionControllerOptions, MarkdownActionControllerPort, MarkdownPaneAction } from "./contracts";

class MarkdownActionController implements MarkdownActionControllerPort {
  private readonly markdownPane: MarkdownActionControllerOptions["markdownPane"];
  private readonly onInput: () => void;
  private readonly openCodeDialog: () => void;

  public constructor(options: MarkdownActionControllerOptions) {
    this.markdownPane = options.markdownPane;
    this.onInput = options.onInput;
    this.openCodeDialog = options.openCodeDialog;
  }

  public handle(action: MarkdownPaneAction | string | undefined): void {
    switch (action) {
      case "bold":
        this.markdownPane.wrapSelection("**");
        this.onInput();
        break;
      case "italic":
        this.markdownPane.wrapSelection("*");
        this.onInput();
        break;
      case "heading":
        this.markdownPane.prefixLines("# ");
        this.onInput();
        break;
      case "heading2":
        this.markdownPane.prefixLines("## ");
        this.onInput();
        break;
      case "heading3":
        this.markdownPane.prefixLines("### ");
        this.onInput();
        break;
      case "bulletList":
        this.markdownPane.prefixLines("- ");
        this.onInput();
        break;
      case "link":
        this.markdownPane.insertLink();
        this.onInput();
        break;
      case "codeBlock":
        this.openCodeDialog();
        break;
      default:
        break;
    }
  }
}

window.QuillMarkdownActions = {
  create(options: MarkdownActionControllerOptions): MarkdownActionControllerPort {
    return new MarkdownActionController(options);
  }
};
