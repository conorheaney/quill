import type { DesktopBridgePort, MarkdownApi, PreviewPanePort, PreviewRendererOptions, PreviewRendererPort } from "./contracts";

class PreviewRenderer implements PreviewRendererPort {
  private readonly markdown: MarkdownApi;
  private readonly previewPane: PreviewPanePort;
  private readonly desktopBridge: Pick<DesktopBridgePort, "readImageDataUrl"> | null;
  private readonly isDesktop: boolean;
  private readonly getDocumentPath: () => string;
  private readonly wordCountElement: HTMLElement;
  private readonly syncWorkspaceHeight: () => void;
  private imageHydrationRun = 0;

  public constructor(options: PreviewRendererOptions) {
    this.markdown = options.markdown;
    this.previewPane = options.previewPane;
    this.desktopBridge = options.desktopBridge;
    this.isDesktop = options.isDesktop;
    this.getDocumentPath = options.getDocumentPath;
    this.wordCountElement = options.wordCountElement;
    this.syncWorkspaceHeight = options.syncWorkspaceHeight;
  }

  public render(content: string): void {
    const documentPath = this.getDocumentPath();
    this.markdown.setRenderContext({
      documentBasePath: documentPath,
      documentBaseUrl: this.getDocumentBaseUrl(documentPath),
      isDesktop: this.isDesktop
    });
    this.previewPane.setBlocks(this.markdown.parseMarkdownBlocks(content));
    void this.hydrateDesktopImages();
    this.updateWordCount(content);
    this.syncWorkspaceHeight();
  }

  private getDocumentBaseUrl(filePath: string): string {
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

  private updateWordCount(content: string): void {
    const count = content.trim() ? content.trim().split(/\s+/).length : 0;
    this.wordCountElement.textContent = `${count} word${count === 1 ? "" : "s"}`;
  }

  private async hydrateDesktopImages(): Promise<void> {
    if (!this.isDesktop || !this.desktopBridge) {
      return;
    }

    const currentRun = ++this.imageHydrationRun;
    const contentElement = this.previewPane.getContentElement();
    const previewImages = [...contentElement.querySelectorAll<HTMLImageElement>("img[data-local-image-path]")];

    await Promise.all(previewImages.map(async (imageElement) => {
      const localImagePath = imageElement.getAttribute("data-local-image-path") || "";
      if (!localImagePath) {
        return;
      }

      try {
        const dataUrl = await this.desktopBridge?.readImageDataUrl(localImagePath);
        if (currentRun !== this.imageHydrationRun || !imageElement.isConnected || !dataUrl) {
          return;
        }
        imageElement.src = dataUrl;
        imageElement.removeAttribute("data-local-image-path");
      } catch (error) {
        if (currentRun !== this.imageHydrationRun || !imageElement.isConnected) {
          return;
        }
        console.error("Unable to hydrate preview image", error);
        imageElement.outerHTML = `<span class="preview-image-placeholder" data-preview-image-placeholder="true" title="Unable to load local image"><span class="preview-image-placeholder-label">${this.markdown.escapeHtml(imageElement.alt || "Image")}</span><span class="preview-image-placeholder-path">${this.markdown.escapeHtml(localImagePath)}</span></span>`;
      }
    }));
  }
}

window.QuillPreviewRenderer = {
  create(options: PreviewRendererOptions): PreviewRendererPort {
    return new PreviewRenderer(options);
  }
};
