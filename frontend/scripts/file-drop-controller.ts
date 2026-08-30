import type { FileDropControllerOptions, FileDropControllerPort } from "./contracts";

class FileDropController implements FileDropControllerPort {
  private readonly markdownPane: FileDropControllerOptions["markdownPane"];
  private readonly onInput: () => void;

  public constructor(options: FileDropControllerOptions) {
    this.markdownPane = options.markdownPane;
    this.onInput = options.onInput;
  }

  public async handle(files: FileList | null): Promise<void> {
    const images = files ? [...files].filter((file) => file.type.startsWith("image/")) : [];
    if (!images.length) return;

    const markdownSnippets = await Promise.all(images.map(async (file) => {
      const dataUrl = await this.readAsDataUrl(file);
      return `![${file.name}](${dataUrl})`;
    }));
    this.markdownPane.replaceSelection(`\n${markdownSnippets.join("\n")}\n`, "end");
    this.onInput();
  }

  private readAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(reader.error || new Error(`Unable to read ${file.name}`));
      reader.readAsDataURL(file);
    });
  }
}

window.QuillFileDrop = {
  create(options: FileDropControllerOptions): FileDropControllerPort {
    return new FileDropController(options);
  }
};
