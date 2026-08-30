import type { InlineEditState, MarkdownBlock, OutlineHeading, PreviewPaneOptions, PreviewPanePort } from "./contracts";

(function (): void {
  function createOutlineSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-") || "section";
  }

  function resolvePreviewAnchorTarget(anchor: HTMLAnchorElement | null): string {
    const href = anchor?.getAttribute?.("href") || "";
    if (!href.startsWith("#")) {
      return "";
    }

    try {
      return decodeURIComponent(href.slice(1)).trim();
    } catch (error) {
      return href.slice(1).trim();
    }
  }

  function cloneBlocks(blocks: MarkdownBlock[]): MarkdownBlock[] {
    return JSON.parse(JSON.stringify(blocks || [])) as MarkdownBlock[];
  }

  function createPreviewPane(options: PreviewPaneOptions): PreviewPanePort {
    const {
      rootElement,
      contentElement,
      escapeHtml,
      renderBlockContent,
      splitTableCells,
      tableRowsToMarkdown,
      normaliseLanguage,
      onBlocksCommitted,
      onHeadingStateChange,
      onToast,
      requestConfirm
    } = options;
    const onScroll = options.onScroll || (() => undefined);

    let previewBlocks: MarkdownBlock[] = [];
    let activeInlineEdit: InlineEditState | null = null;
    let activeHeadingId = "";
    let isReadOnly = false;

    function getInlineEditState(block: MarkdownBlock, index: number, optionsOverride: { isNewBlock?: boolean } = {}): InlineEditState {
      const settings = optionsOverride;

      if (block.type === "heading") {
        const cappedLevel = Math.min(block.level || 1, 3);
        return { index, type: `heading-${cappedLevel}` as InlineEditState["type"], content: block.content, language: "text", isNewBlock: Boolean(settings.isNewBlock) };
      }

      if (block.type === "blockquote") {
        return { index, type: "blockquote", content: (block.lines || []).join("\n"), language: "text", isNewBlock: Boolean(settings.isNewBlock) };
      }

      if (block.type === "code") {
        return { index, type: "code", content: block.content, language: block.language || "text", isNewBlock: Boolean(settings.isNewBlock) };
      }

      if (block.type === "ul" || block.type === "ol") {
        return { index, type: block.type, content: (block.items || []).join("\n"), language: "text", isNewBlock: Boolean(settings.isNewBlock) };
      }

      if (block.type === "table") {
        return { index, type: "table", content: tableRowsToMarkdown(block.rows || []), language: "text", isNewBlock: Boolean(settings.isNewBlock) };
      }

      return { index, type: "paragraph", content: "content" in block ? block.content || "" : "", language: "text", isNewBlock: Boolean(settings.isNewBlock) };
    }

    function renderInlineEditor(index: number): string {
      const editor = activeInlineEdit;
      if (!editor) return "";
      const showLanguage = editor.type === "code";
      const typeOptions = [
        ["paragraph", "Paragraph"],
        ["heading-1", "Heading 1"],
        ["heading-2", "Heading 2"],
        ["heading-3", "Heading 3"],
        ["blockquote", "Blockquote"],
        ["ul", "Bullet List"],
        ["ol", "Numbered List"],
        ["code", "Code Block"],
        ["table", "Table"]
      ];

      return `
        <div class="inline-editor" data-inline-editor="true" data-block-id="${index}">
          <div class="inline-editor-toolbar">
            <div class="inline-editor-controls">
              <select class="inline-editor-type" data-editor-field="type" aria-label="Block type">
                ${typeOptions.map(([value, label]) => `<option value="${value}"${editor.type === value ? " selected" : ""}>${label}</option>`).join("")}
              </select>
              ${showLanguage ? `
                <label>
                  Code language
                  <select class="inline-editor-language" data-editor-field="language">
                    <option value="text"${editor.language === "text" ? " selected" : ""}>Plain text</option>
                    <option value="javascript"${editor.language === "javascript" ? " selected" : ""}>JavaScript</option>
                    <option value="python"${editor.language === "python" ? " selected" : ""}>Python</option>
                    <option value="csharp"${editor.language === "csharp" ? " selected" : ""}>C#</option>
                  </select>
                </label>
              ` : ""}
            </div>
            <div class="inline-editor-actions">
              <button type="button" class="icon-button" data-editor-action="cancel" aria-label="Cancel" title="CANCEL">&times;</button>
              <button type="button" class="icon-button" data-primary="true" data-editor-action="confirm" aria-label="Update" title="UPDATE">&#10003;</button>
            </div>
          </div>
          <div class="inline-editor-body">
            <textarea class="inline-editor-textarea" data-editor-field="content" spellcheck="false">${escapeHtml(editor.content || "")}</textarea>
          </div>
        </div>
      `;
    }

    function renderBlockActions(index: number, type: string): string {
      return `
        <div class="preview-block-actions" aria-label="Block actions">
          <button type="button" class="preview-block-action" data-block-action="delete" data-block-id="${index}" aria-label="Delete ${type} block" title="Delete block">&times;</button>
          <button type="button" class="preview-block-action" data-block-action="insert-before" data-block-id="${index}" aria-label="Insert block before ${type}" title="Insert block before">&uarr;&plus;</button>
          <button type="button" class="preview-block-action" data-block-action="insert-after" data-block-id="${index}" aria-label="Insert block after ${type}" title="Insert block after">&darr;&plus;</button>
          <button type="button" class="preview-block-action" data-block-action="move-up" data-block-id="${index}" aria-label="Move ${type} block up" title="Move block up"${index === 0 ? " disabled" : ""}>&uarr;</button>
          <button type="button" class="preview-block-action" data-block-action="move-down" data-block-id="${index}" aria-label="Move ${type} block down" title="Move block down"${index === previewBlocks.length - 1 ? " disabled" : ""}>&darr;</button>
        </div>
      `;
    }

    function notifyHeadingState() {
      const headingElements = [...contentElement.querySelectorAll<HTMLHeadingElement>("h1, h2, h3")];
      const slugCounts = new Map<string, number>();

      headingElements.forEach((headingElement: HTMLHeadingElement) => {
        const baseSlug = createOutlineSlug(headingElement.textContent || "");
        const count = slugCounts.get(baseSlug) || 0;
        slugCounts.set(baseSlug, count + 1);
        headingElement.id = count === 0 ? baseSlug : `${baseSlug}-${count + 1}`;
      });

      const headings: OutlineHeading[] = headingElements.map((headingElement: HTMLHeadingElement) => ({
        id: headingElement.id,
        level: Number(headingElement.tagName.slice(1)),
        text: headingElement.textContent || "Untitled section"
      }));

      if (headings.length && !headings.some((heading) => heading.id === activeHeadingId)) {
        activeHeadingId = headings[0].id;
      }

      if (!headings.length) {
        activeHeadingId = "";
      }

      onHeadingStateChange(headings, activeHeadingId);
    }

    function refreshActiveHeadingFromScroll() {
      const headingElements = [...contentElement.querySelectorAll<HTMLHeadingElement>("h1, h2, h3")];
      if (!headingElements.length) return;

      const previewTop = contentElement.getBoundingClientRect().top;
      let currentHeading = headingElements[0];

      headingElements.forEach((headingElement: HTMLHeadingElement) => {
        if (headingElement.getBoundingClientRect().top - previewTop <= 32) {
          currentHeading = headingElement;
        }
      });

      activeHeadingId = currentHeading.id;
      onHeadingStateChange(
        headingElements.map((headingElement: HTMLHeadingElement): OutlineHeading => ({
          id: headingElement.id,
          level: Number(headingElement.tagName.slice(1)),
          text: headingElement.textContent || "Untitled section"
        })),
        activeHeadingId
      );
    }

    function renderPreviewBlocks() {
      contentElement.innerHTML = previewBlocks
        .map((block: MarkdownBlock, index: number) => {
          if (activeInlineEdit && activeInlineEdit.index === index) {
            return `<section class="preview-block is-editing" data-block-id="${index}" data-block-type="${block.type}">${renderInlineEditor(index)}</section>`;
          }

          return `
            <section class="preview-block" data-block-id="${index}" data-block-type="${block.type}" tabindex="0" aria-label="Editable ${block.type} block">
              ${renderBlockActions(index, block.type)}
              ${renderBlockContent(block)}
            </section>
          `;
        })
        .join("");

      notifyHeadingState();
      refreshActiveHeadingFromScroll();
    }

    function applyInlineEdit(): MarkdownBlock | null {
      const editor = activeInlineEdit;
      if (!editor) return null;

      const content = (editor.content || "").replace(/\r\n?/g, "\n").trimEnd();
      switch (editor.type) {
        case "heading-1":
        case "heading-2":
        case "heading-3":
          return {
            type: "heading",
            level: Number(editor.type.split("-")[1]),
            content: content || "Untitled heading"
          };
        case "blockquote":
          return {
            type: "blockquote",
            lines: (content || "Quote").split("\n")
          };
        case "ul": {
          const items = content.split("\n").map((item: string) => item.trim()).filter(Boolean);
          if (!items.length) return null;
          return { type: "ul", items };
        }
        case "ol": {
          const items = content.split("\n").map((item: string) => item.trim()).filter(Boolean);
          if (!items.length) return null;
          return { type: "ol", items };
        }
        case "code":
          return {
            type: "code",
            language: normaliseLanguage(editor.language || "text"),
            content
          };
        case "table": {
          const tableLines = content.split("\n").map((line: string) => line.trim()).filter(Boolean);
          if (tableLines.length < 2 || !tableLines[0].includes("|") || !/^[:|\-\s]+$/.test(tableLines[1])) {
            return null;
          }
          return {
            type: "table",
            rows: tableLines.map((line: string) => splitTableCells(line))
          };
        }
        case "paragraph":
        default:
          return {
            type: "paragraph",
            content: content || "New paragraph"
          };
      }
    }

    function createEmptyBlock(): MarkdownBlock {
      return {
        type: "paragraph",
        content: "New paragraph"
      };
    }

    function commitBlocks(messageTitle: string, messageBody: string, editedBlockIndex?: number): void {
      onBlocksCommitted(cloneBlocks(previewBlocks), messageTitle, messageBody, editedBlockIndex);
    }

    function openInlineEditor(index: number, optionsOverride: { isNewBlock?: boolean } = {}): void {
      activeInlineEdit = getInlineEditState(previewBlocks[index], index, optionsOverride);
      renderPreviewBlocks();
      window.requestAnimationFrame(() => {
        const field = contentElement.querySelector<HTMLTextAreaElement>(".inline-editor-textarea");
        if (field) field.focus();
      });
    }

    function setBlocks(blocks: MarkdownBlock[]): void {
      previewBlocks = cloneBlocks(blocks);
      activeInlineEdit = null;
      renderPreviewBlocks();
    }

    function setReadOnly(readOnly: boolean): void {
      isReadOnly = readOnly;
      contentElement.classList.toggle("is-readonly", readOnly);

      if (readOnly && activeInlineEdit) {
        activeInlineEdit = null;
        renderPreviewBlocks();
      }
    }

    function focus(options?: FocusOptions): void {
      contentElement.focus(options);
    }

    function getScrollElement(): HTMLElement {
      return contentElement;
    }

    function getContentElement(): HTMLElement {
      return contentElement;
    }

    function scrollToBlock(index: number, viewportTop?: number): void {
      const target = contentElement.querySelector<HTMLElement>(`[data-block-id="${index}"]`);
      if (!target) return;
      setActiveBlock(index, previewBlocks.length, viewportTop);
      const targetTop = Number.isFinite(viewportTop) && viewportTop !== undefined ? viewportTop : contentElement.clientHeight * 0.3;
      contentElement.scrollTop = Math.max(0, target.offsetTop - targetTop);
    }

    function ensureBlockVisible(index: number, blockProgress?: number): void {
      const target = contentElement.querySelector<HTMLElement>(`[data-block-id="${index}"]`);
      if (!target) return;

      setActiveBlock(index, previewBlocks.length);
      const viewportTop = contentElement.scrollTop;
      const viewportBottom = viewportTop + contentElement.clientHeight;
      const targetTop = target.offsetTop;

      const progress = Number.isFinite(blockProgress) && blockProgress !== undefined
        ? Math.max(0, Math.min(1, blockProgress))
        : 0;
      const activePoint = targetTop + target.offsetHeight * progress;
      const activePointMargin = Math.max(12, Math.min(32, contentElement.clientHeight * 0.08));

      if (activePoint < viewportTop + activePointMargin) {
        contentElement.scrollTop = Math.max(0, activePoint - contentElement.clientHeight * 0.3);
      } else if (activePoint > viewportBottom - activePointMargin) {
        contentElement.scrollTop = Math.max(0, activePoint - contentElement.clientHeight * 0.7);
      }
    }

    function setActiveBlock(index: number, totalBlocks: number, viewportTop?: number): void {
      contentElement.querySelectorAll(".preview-block.is-scroll-active").forEach((element) => {
        element.classList.remove("is-scroll-active");
      });
      const target = contentElement.querySelector(`[data-block-id="${index}"]`);
      if (target) target.classList.add("is-scroll-active");
    }

    function getVisibleBlockIndex(): number {
      const blocks = [...contentElement.querySelectorAll<HTMLElement>(".preview-block")];
      const anchor = contentElement.scrollTop + contentElement.clientHeight * 0.3;
      let activeIndex = blocks.length ? Number(blocks[0].dataset.blockId) : -1;
      blocks.forEach((block) => {
        if (block.offsetTop <= anchor) {
          activeIndex = Number(block.dataset.blockId);
        }
      });
      setActiveBlock(activeIndex, blocks.length);
      return activeIndex;
    }

    function scrollToHeading(headingId: string): void {
      const target = contentElement.querySelector(`#${CSS.escape(headingId)}`);
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      activeHeadingId = headingId;
      notifyHeadingState();
    }

    function handlePreviewEditorInput(event: Event): void {
      if (!activeInlineEdit) return;
      const fieldElement = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement
        ? event.target
        : null;
      const field = fieldElement?.dataset.editorField;
      if (!field) return;
      if (field === "type" || field === "content" || field === "language") activeInlineEdit[field] = fieldElement.value as never;
    }

    function handlePreviewEditorChange(event: Event): void {
      if (!activeInlineEdit) return;
      const fieldElement = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement
        ? event.target
        : null;
      const field = fieldElement?.dataset.editorField;
      if (!field) return;
      if (field === "type" || field === "content" || field === "language") activeInlineEdit[field] = fieldElement.value as never;
      if (field === "type") {
        if (fieldElement.value !== "code") {
          activeInlineEdit.language = "text";
        }
        renderPreviewBlocks();
      }
    }

    async function handlePreviewClick(event: MouseEvent): Promise<void> {
      const eventTarget = event.target instanceof Element ? event.target : null;
      if (!eventTarget) return;
      const anchor = eventTarget.closest("a[href]") as HTMLAnchorElement | null;
      if (anchor && contentElement.contains(anchor)) {
        const headingId = resolvePreviewAnchorTarget(anchor);
        if (headingId) {
          event.preventDefault();
          scrollToHeading(headingId);
          return;
        }
      }

      if (isReadOnly) return;

      const blockAction = eventTarget.closest("[data-block-action]") as HTMLElement | null;
      if (blockAction) {
        const index = Number(blockAction.dataset.blockId);
        if (Number.isNaN(index)) return;

        if (blockAction.dataset.blockAction === "delete") {
          const confirmed = await requestConfirm(
            "Delete this block?",
            "This will remove the selected block from the document.",
            "Delete"
          );
          if (!confirmed) return;
          previewBlocks.splice(index, 1);
          activeInlineEdit = null;
          if (!previewBlocks.length) {
            previewBlocks.push(createEmptyBlock());
          }
          commitBlocks("Block removed", "The selected block was deleted.");
          return;
        }

        if (blockAction.dataset.blockAction === "move-up" || blockAction.dataset.blockAction === "move-down") {
          const direction = blockAction.dataset.blockAction === "move-up" ? -1 : 1;
          const targetIndex = index + direction;
          if (targetIndex < 0 || targetIndex >= previewBlocks.length) return;
          [previewBlocks[index], previewBlocks[targetIndex]] = [previewBlocks[targetIndex], previewBlocks[index]];
          activeInlineEdit = null;
          commitBlocks(
            "Block moved",
            direction < 0 ? "The block moved up in the document." : "The block moved down in the document."
          );
          return;
        }

        const insertIndex = blockAction.dataset.blockAction === "insert-before" ? index : index + 1;
        previewBlocks.splice(insertIndex, 0, createEmptyBlock());
        openInlineEditor(insertIndex, { isNewBlock: true });
        return;
      }

      const editorAction = eventTarget.closest("[data-editor-action]") as HTMLElement | null;
      if (editorAction) {
        if (editorAction.dataset.editorAction === "cancel") {
          if (activeInlineEdit && activeInlineEdit.isNewBlock) {
            previewBlocks.splice(activeInlineEdit.index, 1);
          }
          activeInlineEdit = null;
          renderPreviewBlocks();
          return;
        }

        if (editorAction.dataset.editorAction === "confirm") {
          const editedBlockIndex = activeInlineEdit ? activeInlineEdit.index : -1;
          const nextBlock = applyInlineEdit();
          if (!nextBlock) {
            onToast("Check the block", "That block type needs valid content before it can be applied.");
            return;
          }
          const editedBlock = activeInlineEdit;
          if (!editedBlock) return;
          previewBlocks.splice(editedBlock.index, 1, nextBlock);
          activeInlineEdit = null;
          commitBlocks("Block updated", "The rendered block was written back to Markdown.", editedBlockIndex);
          return;
        }
      }

      if (eventTarget.closest("[data-inline-editor]")) return;

      const block = eventTarget.closest(".preview-block") as HTMLElement | null;
      if (!block) return;
      openInlineEditor(Number(block.dataset.blockId));
    }

    contentElement.addEventListener("click", (event: MouseEvent) => {
      handlePreviewClick(event).catch((error) => {
        console.error("Unable to handle preview interaction", error);
      });
    });
    contentElement.addEventListener("input", handlePreviewEditorInput);
    contentElement.addEventListener("change", handlePreviewEditorChange);
    contentElement.addEventListener("scroll", () => {
      onScroll(getVisibleBlockIndex());
      refreshActiveHeadingFromScroll();
    });

    return {
      focus,
      getContentElement,
      getScrollElement,
      getVisibleBlockIndex,
      ensureBlockVisible,
      setActiveBlock,
      scrollToBlock,
      scrollToHeading,
      setBlocks,
      setReadOnly
    };
  }

  window.QuillPreviewPane = {
    createPreviewPane,
    resolvePreviewAnchorTarget
  };
})();
