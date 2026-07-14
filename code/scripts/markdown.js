/**
 * Markdown parsing and rendering primitives.
 * This module has no dependency on the editor UI state.
 */

window.QuillMarkdown = (() => {

      function renderMarkdown(markdown) {
        const normalized = markdown.replace(/\r\n?/g, "\n");
        const codeBlocks = [];
        const escaped = escapeHtml(normalized).replace(/```([\w-]*)\n([\s\S]*?)```/g, (_, lang, code) => {
          const token = createToken("CODEBLOCK", codeBlocks.length);
          const language = lang ? ` class="language-${escapeAttribute(lang)}"` : "";
          codeBlocks.push(`<pre><code${language}>${code.replace(/\n$/, "")}</code></pre>`);
          return token;
        });

        const lines = escaped.split("\n");
        const html = [];
        let paragraph = [];
        let listBuffer = null;

        const flushParagraph = () => {
          if (!paragraph.length) return;
          html.push(renderParagraphHtml(paragraph.join("\n")));
          paragraph = [];
        };

        const flushList = () => {
          if (!listBuffer) return;
          const tag = listBuffer.type === "ol" ? "ol" : "ul";
          html.push(`<${tag}>${listBuffer.items.map((item) => `<li>${parseInline(item)}</li>`).join("")}</${tag}>`);
          listBuffer = null;
        };

        for (let i = 0; i < lines.length; i += 1) {
          const line = lines[i];
          const trimmed = line.trim();

          if (!trimmed) {
            flushParagraph();
            flushList();
            continue;
          }

          if (trimmed.startsWith("{{CODEBLOCK:")) {
            flushParagraph();
            flushList();
            html.push(trimmed);
            continue;
          }

          if (isTableHeader(lines, i)) {
            flushParagraph();
            flushList();
            const tableHtml = buildTable(lines, i);
            html.push(tableHtml.html);
            i = tableHtml.endIndex;
            continue;
          }

          const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
          if (headingMatch) {
            flushParagraph();
            flushList();
            const level = headingMatch[1].length;
            html.push(`<h${level}>${parseInline(headingMatch[2])}</h${level}>`);
            continue;
          }

          const quoteMatch = line.match(/^\s*&gt;\s?(.*)$/);
          if (quoteMatch) {
            flushParagraph();
            flushList();
            const quoteLines = [quoteMatch[1]];
            while (i + 1 < lines.length) {
              const nextMatch = lines[i + 1].match(/^\s*&gt;\s?(.*)$/);
              if (!nextMatch) break;
              quoteLines.push(nextMatch[1]);
              i += 1;
            }
            html.push(`<blockquote>${quoteLines.map((item) => `<p>${parseInline(item)}</p>`).join("")}</blockquote>`);
            continue;
          }

          const orderedMatch = line.match(/^\s*\d+\.\s+(.*)$/);
          if (orderedMatch) {
            flushParagraph();
            if (!listBuffer || listBuffer.type !== "ol") {
              flushList();
              listBuffer = { type: "ol", items: [] };
            }
            listBuffer.items.push(orderedMatch[1]);
            continue;
          }

          const unorderedMatch = line.match(/^\s*[-*+]\s+(.*)$/);
          if (unorderedMatch) {
            flushParagraph();
            if (!listBuffer || listBuffer.type !== "ul") {
              flushList();
              listBuffer = { type: "ul", items: [] };
            }
            listBuffer.items.push(unorderedMatch[1]);
            continue;
          }

          flushList();
          paragraph.push(trimmed);
        }

        flushParagraph();
        flushList();

        return restoreTokens(html.join("\n"), codeBlocks);
      }

      function escapeHtml(value) {
        return value
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#39;");
      }

      function escapeAttribute(value) {
        return value.replace(/"/g, "&quot;");
      }

      function createToken(type, index) {
        return `{{${type}:${index}}}`;
      }

      function restoreInlineTokens(html, tokenMap) {
        return html.replace(/\{\{([A-Z]+):(\d+)}}/g, (_, type, index) => {
          const bucket = tokenMap[type];
          if (!bucket) return "";
          return bucket[Number(index)] || "";
        });
      }

      function restoreTokens(html, codeBlocks) {
        return html.replace(/\{\{CODEBLOCK:(\d+)}}/g, (_, index) => codeBlocks[Number(index)] || "");
      }

      function renderParagraphHtml(text) {
        return `<p>${parseInline(text || "").replace(/\n/g, "<br>")}</p>`;
      }

      function parseInline(text) {
        return parseInlineTokens(text || "", { useFencedCodeSpans: false });
      }

      function parseTableCellInline(text, options) {
        const settings = options || {};
        const prepared = settings.inputAlreadyEscaped ? (text || "") : escapeHtml(text || "");
        return parseInlineTokens(prepared, { useFencedCodeSpans: true });
      }

      function parseInlineTokens(text, options) {
        const settings = options || {};
        let output = text;
        const inlineTokens = {
          IMAGE: [],
          LINK: [],
          INLINECODE: []
        };

        if (settings.useFencedCodeSpans) {
          output = replaceInlineCodeSpans(output, inlineTokens);
        } else {
          output = output.replace(/`([^`]+)`/g, (_, code) => {
            const token = createToken("INLINECODE", inlineTokens.INLINECODE.length);
            inlineTokens.INLINECODE.push(`<code>${escapeHtml(code)}</code>`);
            return token;
          });
        }

        output = output.replace(/!\[([^\]]*)]\(([^)]+)\)/g, (_, alt, url) => {
          const safeUrl = sanitizeUrl(url);
          if (!safeUrl) return alt;
          const token = createToken("IMAGE", inlineTokens.IMAGE.length);
          inlineTokens.IMAGE.push(`<img src="${safeUrl}" alt="${alt}">`);
          return token;
        });

        output = output.replace(/\[([^\]]+)]\(([^)]+)\)/g, (_, label, url) => {
          const rawUrl = (url || "").trim();
          if (isSameDocumentHash(rawUrl)) {
            const safeHash = sanitizeHashUrl(rawUrl);
            if (!safeHash) return label;
            const token = createToken("LINK", inlineTokens.LINK.length);
            inlineTokens.LINK.push(`<a href="${safeHash}" data-preview-anchor="true">${label}</a>`);
            return token;
          }
          const safeUrl = sanitizeUrl(url);
          if (!safeUrl) return label;
          const token = createToken("LINK", inlineTokens.LINK.length);
          inlineTokens.LINK.push(`<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${label}</a>`);
          return token;
        });
        output = output.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
        output = output.replace(/(^|[^\*])\*([^*]+)\*(?!\*)/g, "$1<em>$2</em>");
        output = output.replace(/(^|[^_])_([^_]+)_(?!_)/g, "$1<em>$2</em>");

        return restoreInlineTokens(output, inlineTokens);
      }

      function isSameDocumentHash(url) {
        return /^#[^\s].*$/.test(url || "");
      }

      function sanitizeHashUrl(url) {
        const fragment = (url || "").trim().slice(1).trim();
        if (!fragment) {
          return "";
        }
        return `#${escapeAttribute(fragment)}`;
      }

      function replaceInlineCodeSpans(text, inlineTokens) {
        let output = "";

        for (let index = 0; index < text.length; index += 1) {
          if (text[index] !== "`") {
            output += text[index];
            continue;
          }

          let fenceLength = 1;
          while (index + fenceLength < text.length && text[index + fenceLength] === "`") {
            fenceLength += 1;
          }

          const closingIndex = findClosingBacktickFence(text, index + fenceLength, fenceLength);
          if (closingIndex === -1) {
            output += text.slice(index, index + fenceLength);
            index += fenceLength - 1;
            continue;
          }

          const code = text.slice(index + fenceLength, closingIndex);
          const token = createToken("INLINECODE", inlineTokens.INLINECODE.length);
          inlineTokens.INLINECODE.push(`<code>${escapeHtml(code)}</code>`);
          output += token;
          index = closingIndex + fenceLength - 1;
        }

        return output;
      }

      function findClosingBacktickFence(text, startIndex, fenceLength) {
        for (let index = startIndex; index < text.length; index += 1) {
          if (text[index] !== "`") {
            continue;
          }

          let runLength = 1;
          while (index + runLength < text.length && text[index + runLength] === "`") {
            runLength += 1;
          }

          if (runLength === fenceLength) {
            return index;
          }
        }

        return -1;
      }

      function sanitizeUrl(url) {
        const raw = (url || "").trim();
        if (!raw) {
          return "";
        }

        const normalized = normaliseUrlForParsing(raw);
        try {
          const parsed = new URL(normalized, window.location.href);
          const allowedProtocols = ["http:", "https:", "data:", "blob:", "file:"];
          const isDataImage = parsed.protocol === "data:" && raw.startsWith("data:image/");
          if (allowedProtocols.includes(parsed.protocol) && (parsed.protocol !== "data:" || isDataImage)) {
            return escapeAttribute(parsed.href);
          }
        } catch (error) {
          return "";
        }
        return "";
      }

      function normaliseUrlForParsing(raw) {
        if (/^[A-Za-z]:[\\/]/.test(raw)) {
          return `file:///${raw.replace(/\\/g, "/")}`;
        }
        return raw;
      }

      function isTableHeader(lines, index) {
        if (index + 1 >= lines.length) return false;
        const header = lines[index].trim();
        const separator = lines[index + 1].trim();
        return header.includes("|") && /^[:|\-\s]+$/.test(separator) && separator.includes("-");
      }

      function buildTable(lines, startIndex) {
        const tableLines = [lines[startIndex], lines[startIndex + 1]];
        let endIndex = startIndex + 1;

        while (endIndex + 1 < lines.length && lines[endIndex + 1].includes("|") && lines[endIndex + 1].trim()) {
          tableLines.push(lines[endIndex + 1]);
          endIndex += 1;
        }

        const rows = tableLines.map((line) => splitTableCells(line));
        const headerCells = rows[0];
        const bodyRows = rows.slice(2);

        const head = `<thead><tr>${headerCells.map((cell) => `<th>${parseTableCellInline(cell, { inputAlreadyEscaped: true })}</th>`).join("")}</tr></thead>`;
        const body = `<tbody>${bodyRows.map((row) => `<tr>${row.map((cell) => `<td>${parseTableCellInline(cell, { inputAlreadyEscaped: true })}</td>`).join("")}</tr>`).join("")}</tbody>`;
        return { html: `<table>${head}${body}</table>`, endIndex };
      }

      function splitTableCells(line) {
        const trimmed = line.trim();
        const normalized = trimmed.replace(/^\|/, "").replace(/\|$/, "");
        const cells = [];
        let current = "";
        let codeSpanFenceLength = 0;

        for (let index = 0; index < normalized.length; index += 1) {
          const character = normalized[index];

          if (character === "`") {
            let fenceLength = 1;
            while (index + fenceLength < normalized.length && normalized[index + fenceLength] === "`") {
              fenceLength += 1;
            }
            current += normalized.slice(index, index + fenceLength);
            if (!codeSpanFenceLength) {
              codeSpanFenceLength = fenceLength;
            } else if (codeSpanFenceLength === fenceLength) {
              codeSpanFenceLength = 0;
            }
            index += fenceLength - 1;
            continue;
          }

          if (character === "|" && !codeSpanFenceLength && !isEscapedTablePipe(normalized, index)) {
            cells.push(current.trim());
            current = "";
            continue;
          }

          current += character;
        }

        cells.push(current.trim());
        return cells;
      }

      function isEscapedTablePipe(value, index) {
        let backslashCount = 0;
        for (let cursor = index - 1; cursor >= 0 && value[cursor] === "\\"; cursor -= 1) {
          backslashCount += 1;
        }
        return backslashCount % 2 === 1;
      }

      function normaliseLanguage(language) {
        const value = (language || "").toLowerCase();
        if (!value || value === "text" || value === "plain" || value === "plaintext") return "text";
        if (value === "js" || value === "javascript") return "javascript";
        if (value === "py" || value === "python") return "python";
        if (value === "c#" || value === "cs" || value === "csharp") return "csharp";
        return "text";
      }

      function isRawTableHeader(lines, index) {
        if (index + 1 >= lines.length) return false;
        const header = lines[index].trim();
        const separator = lines[index + 1].trim();
        return header.includes("|") && /^[:|\-\s]+$/.test(separator) && separator.includes("-");
      }

      function parseTableBlock(lines, startIndex) {
        const tableLines = [lines[startIndex], lines[startIndex + 1]];
        let endIndex = startIndex + 1;

        while (endIndex + 1 < lines.length && lines[endIndex + 1].includes("|") && lines[endIndex + 1].trim()) {
          tableLines.push(lines[endIndex + 1]);
          endIndex += 1;
        }

        const rows = tableLines.map((line) => splitTableCells(line));
        return {
          block: {
            type: "table",
            rows
          },
          endIndex
        };
      }

      function parseMarkdownBlocks(markdown) {
        const normalized = markdown.replace(/\r\n?/g, "\n");
        const lines = normalized.split("\n");
        const blocks = [];

        for (let index = 0; index < lines.length; index += 1) {
          const line = lines[index];
          const trimmed = line.trim();

          if (!trimmed) {
            continue;
          }

          const codeFenceMatch = line.match(/^```([\w-]*)\s*$/);
          if (codeFenceMatch) {
            const codeLines = [];
            let endIndex = index + 1;
            while (endIndex < lines.length && !lines[endIndex].match(/^```/)) {
              codeLines.push(lines[endIndex]);
              endIndex += 1;
            }

            blocks.push({
              type: "code",
              language: normaliseLanguage(codeFenceMatch[1] || "text"),
              content: codeLines.join("\n")
            });
            index = Math.min(endIndex, lines.length - 1);
            continue;
          }

          const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
          if (headingMatch) {
            blocks.push({
              type: "heading",
              level: headingMatch[1].length,
              content: headingMatch[2]
            });
            continue;
          }

          if (isRawTableHeader(lines, index)) {
            const table = parseTableBlock(lines, index);
            blocks.push(table.block);
            index = table.endIndex;
            continue;
          }

          const quoteMatch = line.match(/^\s*>\s?(.*)$/);
          if (quoteMatch) {
            const quoteLines = [quoteMatch[1]];
            while (index + 1 < lines.length) {
              const nextMatch = lines[index + 1].match(/^\s*>\s?(.*)$/);
              if (!nextMatch) break;
              quoteLines.push(nextMatch[1]);
              index += 1;
            }
            blocks.push({
              type: "blockquote",
              lines: quoteLines
            });
            continue;
          }

          const orderedMatch = line.match(/^\s*\d+\.\s+(.*)$/);
          if (orderedMatch) {
            const items = [orderedMatch[1]];
            while (index + 1 < lines.length) {
              const nextMatch = lines[index + 1].match(/^\s*\d+\.\s+(.*)$/);
              if (!nextMatch) break;
              items.push(nextMatch[1]);
              index += 1;
            }
            blocks.push({
              type: "ol",
              items
            });
            continue;
          }

          const unorderedMatch = line.match(/^\s*[-*+]\s+(.*)$/);
          if (unorderedMatch) {
            const items = [unorderedMatch[1]];
            while (index + 1 < lines.length) {
              const nextMatch = lines[index + 1].match(/^\s*[-*+]\s+(.*)$/);
              if (!nextMatch) break;
              items.push(nextMatch[1]);
              index += 1;
            }
            blocks.push({
              type: "ul",
              items
            });
            continue;
          }

          const paragraphLines = [trimmed];
          while (index + 1 < lines.length) {
            const nextLine = lines[index + 1];
            const nextTrimmed = nextLine.trim();
            if (!nextTrimmed) break;
            if (nextLine.match(/^```([\w-]*)\s*$/)) break;
            if (nextTrimmed.match(/^(#{1,6})\s+/)) break;
            if (nextLine.match(/^\s*>\s?/)) break;
            if (nextLine.match(/^\s*\d+\.\s+/)) break;
            if (nextLine.match(/^\s*[-*+]\s+/)) break;
            if (isRawTableHeader(lines, index + 1)) break;
            paragraphLines.push(nextTrimmed);
            index += 1;
          }

          blocks.push({
            type: "paragraph",
            content: paragraphLines.join("\n")
          });
        }

        return blocks;
      }

      function tableRowsToMarkdown(rows) {
        return rows.map((row) => `| ${row.join(" | ")} |`).join("\n");
      }

      function blockToMarkdown(block) {
        switch (block.type) {
          case "heading":
            return `${"#".repeat(block.level || 1)} ${block.content}`.trimEnd();
          case "blockquote":
            return (block.lines || []).map((line) => `> ${line}`.trimEnd()).join("\n");
          case "code":
            return `\`\`\`${block.language && block.language !== "text" ? block.language : ""}\n${block.content}\n\`\`\``;
          case "ul":
            return (block.items || []).map((item) => `- ${item}`).join("\n");
          case "ol":
            return (block.items || []).map((item, index) => `${index + 1}. ${item}`).join("\n");
          case "table":
            return tableRowsToMarkdown(block.rows || []);
          case "paragraph":
          default:
            return block.content || "";
        }
      }

      function blocksToMarkdown(blocks) {
        return blocks.map((block) => blockToMarkdown(block)).join("\n\n");
      }

      function renderTableFromRows(rows) {
        if (!rows.length) return "<p></p>";
        const headerCells = rows[0];
        const bodyRows = rows.slice(2);
        const head = `<thead><tr>${headerCells.map((cell) => `<th>${parseTableCellInline(cell)}</th>`).join("")}</tr></thead>`;
        const body = `<tbody>${bodyRows.map((row) => `<tr>${row.map((cell) => `<td>${parseTableCellInline(cell)}</td>`).join("")}</tr>`).join("")}</tbody>`;
        return `<table>${head}${body}</table>`;
      }

      function renderBlockContent(block) {
        switch (block.type) {
          case "heading":
            return `<h${block.level}>${parseInline(block.content)}</h${block.level}>`;
          case "blockquote":
            return `<blockquote>${(block.lines || []).map((line) => `<p>${parseInline(line)}</p>`).join("")}</blockquote>`;
          case "code": {
            const language = block.language && block.language !== "text" ? ` class="language-${escapeAttribute(block.language)}"` : "";
            return `<pre><code${language}>${escapeHtml(block.content)}</code></pre>`;
          }
          case "ul":
            return `<ul>${(block.items || []).map((item) => `<li>${parseInline(item)}</li>`).join("")}</ul>`;
          case "ol":
            return `<ol>${(block.items || []).map((item) => `<li>${parseInline(item)}</li>`).join("")}</ol>`;
          case "table":
            return renderTableFromRows(block.rows || []);
          case "paragraph":
          default:
            return renderParagraphHtml(block.content || "");
        }
      }

  return {
    blockToMarkdown,
    blocksToMarkdown,
    escapeAttribute,
    escapeHtml,
    normaliseLanguage,
    parseMarkdownBlocks,
    renderBlockContent,
    renderMarkdown,
    renderTableFromRows,
    splitTableCells,
    tableRowsToMarkdown
  };
})();

