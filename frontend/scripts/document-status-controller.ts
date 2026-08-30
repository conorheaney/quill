import type { DocumentStatusOptions, DocumentStatusPort, FileIdentity } from "./contracts";

class DocumentStatusController implements DocumentStatusPort {
  private readonly documentFileLabel: HTMLElement;
  private readonly saveDocumentButton: HTMLButtonElement;
  private fileName = "";
  private filePath = "";
  private dirty = false;

  public constructor(options: DocumentStatusOptions) {
    this.documentFileLabel = options.documentFileLabel;
    this.saveDocumentButton = options.saveDocumentButton;
  }

  public get currentFileName(): string {
    return this.fileName;
  }

  public get currentFilePath(): string {
    return this.filePath;
  }

  public get isDirty(): boolean {
    return this.dirty;
  }

  public setIdentity(identity: Partial<FileIdentity>): void {
    if (identity.fileName !== undefined) {
      this.fileName = identity.fileName;
    }
    if (identity.filePath !== undefined) {
      this.filePath = identity.filePath || "";
    }
    this.updateLabel();
  }

  public setDirty(nextDirty: boolean): void {
    this.dirty = nextDirty;
    this.saveDocumentButton.dataset.accent = nextDirty ? "true" : "false";
    this.updateLabel();
  }

  public getSuggestedFilename(): string {
    return this.fileName || "document.md";
  }

  private updateLabel(): void {
    const label = this.fileName || "Untitled draft";
    this.documentFileLabel.textContent = this.dirty ? `${label} *` : label;
  }
}

window.QuillDocumentStatus = {
  create(options: DocumentStatusOptions): DocumentStatusPort {
    return new DocumentStatusController(options);
  }
};
