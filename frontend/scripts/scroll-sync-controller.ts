import type { MarkdownEditPosition, MarkdownPort, MarkdownPanePort, PreviewPanePort, ScrollSyncOptions, ScrollSyncPort } from "./contracts";

class ScrollSyncController implements ScrollSyncPort {
  private readonly markdown: MarkdownPort;
  private readonly markdownPane: MarkdownPanePort;
  private readonly previewPane: PreviewPanePort;
  private syncing = false;

  public constructor(options: ScrollSyncOptions) {
    this.markdown = options.markdown;
    this.markdownPane = options.markdownPane;
    this.previewPane = options.previewPane;
  }

  public getEditPosition(content: string, offset: number): MarkdownEditPosition {
    const ranges = this.markdown.getMarkdownBlockRanges(content);
    const safeOffset = Math.max(0, Math.min(Number(offset) || 0, content.length));
    const index = this.getBlockIndexAtOffset(content, safeOffset);
    const scrollElement = this.markdownPane.getScrollElement();
    if (!scrollElement) return { index, renderIndex: this.getPreviousBlockIndexAtOffset(content, safeOffset), viewportTop: 0, blockProgress: 0 };

    const range = index >= 0 ? ranges[index] : null;
    const blockLength = range ? Math.max(1, range.end - range.start) : 1;
    const blockProgress = range
      ? Math.max(0, Math.min(1, (safeOffset - range.start) / blockLength))
      : 0;

    return {
      index,
      renderIndex: index >= 0 ? index : this.getPreviousBlockIndexAtOffset(content, safeOffset),
      viewportTop: this.markdownPane.getCaretViewportTop(),
      blockProgress
    };
  }

  public updateCaretPosition(content: string, offset: number): void {
    this.updateMarkdownCaretPosition(this.getEditPosition(content, offset));
  }

  public handleMarkdownScroll(): void {
    if (this.syncing) return;
    const content = this.markdownPane.getValue();
    if (document.activeElement === this.markdownPane.getScrollElement()) {
      this.updateCaretPosition(content, this.markdownPane.getCaretOffset());
      return;
    }

    const blockIndex = this.getBlockIndexForMarkdownScroll(content);
    this.updateActiveBlock(blockIndex);
    this.syncing = true;
    this.previewPane.scrollToBlock(blockIndex);
    window.requestAnimationFrame(() => {
      this.syncing = false;
    });
  }

  public handlePreviewScroll(blockIndex: number): void {
    if (this.syncing) return;
    const content = this.markdownPane.getValue();
    this.updateActiveBlock(blockIndex);
    this.syncing = true;
    this.scrollMarkdownToBlockInternal(content, blockIndex);
    window.requestAnimationFrame(() => {
      this.syncing = false;
    });
  }

  public resetDocumentScrollPositions(): void {
    const markdownScrollElement = this.markdownPane.getScrollElement();
    const previewScrollElement = this.previewPane.getScrollElement();
    if (!markdownScrollElement || !previewScrollElement) {
      return;
    }

    this.syncing = true;
    markdownScrollElement.scrollTop = 0;
    previewScrollElement.scrollTop = 0;
    window.requestAnimationFrame(() => {
      this.syncing = false;
    });
  }

  private getBlockIndexAtOffset(content: string, offset: number): number {
    const ranges = this.markdown.getMarkdownBlockRanges(content);
    const containingIndex = ranges.findIndex((range) => offset >= range.start && offset <= range.end);
    return containingIndex >= 0 ? containingIndex : -1;
  }

  private getPreviousBlockIndexAtOffset(content: string, offset: number): number {
    const ranges = this.markdown.getMarkdownBlockRanges(content);
    let previousIndex = -1;
    ranges.forEach((range, index) => {
      if (offset > range.end) previousIndex = index;
    });
    return previousIndex;
  }

  public updateActiveBlock(index: number, viewportTop?: number): void {
    const totalBlocks = this.markdown.getMarkdownBlockRanges(this.markdownPane.getValue()).length;
    this.markdownPane.setActiveBlock(index, totalBlocks, viewportTop);
    this.previewPane.setActiveBlock(index, totalBlocks, viewportTop);
  }

  private updateMarkdownCaretPosition(editPosition: MarkdownEditPosition): void {
    const totalBlocks = this.markdown.getMarkdownBlockRanges(this.markdownPane.getValue()).length;
    this.markdownPane.setActiveBlock(editPosition.index, totalBlocks, editPosition.viewportTop);
    if (editPosition.index >= 0) {
      this.previewPane.setActiveBlock(editPosition.index, totalBlocks, editPosition.viewportTop);
      this.ensurePreviewBlockVisible(editPosition.index, editPosition.blockProgress);
    } else {
      this.previewPane.setActiveBlock(editPosition.renderIndex, totalBlocks);
    }
  }

  private ensurePreviewBlockVisible(index: number, blockProgress?: number): void {
    if (index < 0) return;
    window.requestAnimationFrame(() => {
      this.syncing = true;
      this.previewPane.ensureBlockVisible(index, blockProgress);
      window.requestAnimationFrame(() => {
        this.syncing = false;
      });
    });
  }

  public scrollMarkdownToBlock(content: string, index: number): void {
    this.syncing = true;
    this.scrollMarkdownToBlockInternal(content, index);
    window.requestAnimationFrame(() => {
      this.syncing = false;
    });
  }

  private scrollMarkdownToBlockInternal(content: string, index: number): void {
    const ranges = this.markdown.getMarkdownBlockRanges(content);
    const target = ranges[index];
    const scrollElement = this.markdownPane.getScrollElement();
    if (!target || !scrollElement) return;

    const lineHeight = parseFloat(window.getComputedStyle(scrollElement).lineHeight) || 27;
    const lineNumber = content.slice(0, target.start).split("\n").length - 1;
    scrollElement.scrollTop = Math.max(0, lineNumber * lineHeight - scrollElement.clientHeight * 0.3);
  }

  private getBlockIndexForMarkdownScroll(content: string): number {
    const scrollElement = this.markdownPane.getScrollElement();
    const ranges = this.markdown.getMarkdownBlockRanges(content);
    if (!ranges.length || !scrollElement) return -1;

    const lineHeight = parseFloat(window.getComputedStyle(scrollElement).lineHeight) || 27;
    const lineNumber = Math.max(0, Math.floor(scrollElement.scrollTop / lineHeight));
    let activeIndex = 0;
    ranges.forEach((range, index) => {
      const rangeLine = content.slice(0, range.start).split("\n").length - 1;
      if (rangeLine <= lineNumber) activeIndex = index;
    });
    return activeIndex;
  }
}

window.QuillScrollSync = {
  create(options: ScrollSyncOptions): ScrollSyncPort {
    return new ScrollSyncController(options);
  }
};
