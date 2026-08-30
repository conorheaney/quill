import type { CodeDialogControllerOptions, CodeDialogControllerPort } from "./contracts";

class CodeDialogController implements CodeDialogControllerPort {
  private readonly dialog: HTMLDialogElement;
  private readonly languageInput: HTMLSelectElement;
  private readonly codeInput: HTMLTextAreaElement;
  private readonly preview: HTMLElement;
  private readonly previewLanguage: HTMLElement;
  private readonly markdownPane: CodeDialogControllerOptions["markdownPane"];
  private readonly codeImageTool: CodeDialogControllerOptions["codeImageTool"];
  private readonly languageMeta: CodeDialogControllerOptions["languageMeta"];
  private readonly normaliseLanguage: (language: string) => string;
  private readonly onAccepted: () => void;
  private selection = { start: 0, end: 0 };

  public constructor(options: CodeDialogControllerOptions) {
    this.dialog = options.dialog;
    this.languageInput = options.languageInput;
    this.codeInput = options.codeInput;
    this.preview = options.preview;
    this.previewLanguage = options.previewLanguage;
    this.markdownPane = options.markdownPane;
    this.codeImageTool = options.codeImageTool;
    this.languageMeta = options.languageMeta;
    this.normaliseLanguage = options.normaliseLanguage;
    this.onAccepted = options.onAccepted;
  }

  public open(): void {
    const selectedText = this.markdownPane.getSelectedText();
    const fencedMatch = selectedText.trim().match(/^```([\w-]+)?\n([\s\S]*?)\n```$/);
    const language = fencedMatch ? this.normaliseLanguage(fencedMatch[1] || "javascript") : "javascript";
    const code = fencedMatch ? fencedMatch[2] : selectedText || "const example = true;";

    this.selection = this.markdownPane.getSelectionState();
    this.languageInput.value = language;
    this.codeInput.value = code;
    this.updatePreview();
    if (typeof this.dialog.showModal === "function") {
      this.dialog.showModal();
    } else {
      this.dialog.setAttribute("open", "open");
    }
    window.setTimeout(() => this.codeInput.focus(), 0);
  }

  public close(): void {
    if (typeof this.dialog.close === "function") {
      this.dialog.close();
    } else {
      this.dialog.removeAttribute("open");
    }
  }

  public updatePreview(): void {
    const language = this.languageInput.value;
    this.previewLanguage.textContent = this.languageMeta[language]?.label || language;
    this.preview.innerHTML = this.codeImageTool.highlightCodeHtml(language, this.codeInput.value || "");
  }

  public accept(): void {
    const imageMarkdown = this.codeImageTool.createCodeImageMarkdown(this.languageInput.value, this.codeInput.value);
    this.markdownPane.focus();
    this.markdownPane.setSelectionRange(this.selection.start, this.selection.end);
    this.markdownPane.replaceSelection(`\n${imageMarkdown}\n`, "end");
    this.onAccepted();
    this.close();
  }
}

window.QuillCodeDialog = {
  create(options: CodeDialogControllerOptions): CodeDialogControllerPort {
    return new CodeDialogController(options);
  }
};
