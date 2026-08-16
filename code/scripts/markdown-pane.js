(function () {
  function createMarkdownPane(options) {
    const {
      rootElement,
      inputElement,
      onInput,
      onCaretChange,
      onScroll,
      onAction,
      onShortcutCommand,
      onDroppedFiles
    } = options;

    function getSelectionState() {
      return {
        start: inputElement.selectionStart,
        end: inputElement.selectionEnd,
        direction: inputElement.selectionDirection
      };
    }

    function getCaretOffset() {
      return inputElement.selectionDirection === "backward"
        ? inputElement.selectionStart
        : inputElement.selectionEnd;
    }

    function focus(options) {
      inputElement.focus(options);
    }

    function setValue(value) {
      inputElement.value = value;
    }

    function getValue() {
      return inputElement.value;
    }

    function getSelectedText() {
      return inputElement.value.slice(inputElement.selectionStart, inputElement.selectionEnd);
    }

    function setSelectionRange(start, end) {
      inputElement.setSelectionRange(start, end);
    }

    function wrapSelection(before, after, placeholder) {
      const suffix = after === undefined ? before : after;
      const fallback = placeholder || "text";
      const { start, end } = getSelectionState();
      const selected = inputElement.value.slice(start, end) || fallback;
      const nextValue = `${inputElement.value.slice(0, start)}${before}${selected}${suffix}${inputElement.value.slice(end)}`;

      inputElement.value = nextValue;
      focus();
      setSelectionRange(start + before.length, start + before.length + selected.length);
    }

    function prefixLines(prefix) {
      const { start, end } = getSelectionState();
      const selected = inputElement.value.slice(start, end) || "Item";
      const updated = selected
        .split("\n")
        .map((line) => `${prefix}${line}`)
        .join("\n");

      inputElement.setRangeText(updated, start, end, "select");
      focus();
    }

    function replaceSelection(text, mode) {
      const { start, end } = getSelectionState();
      inputElement.setRangeText(text, start, end, mode || "end");
      focus();
    }

    function insertLink() {
      const { start, end } = getSelectionState();
      const selectedText = inputElement.value.slice(start, end) || "link text";
      const urlPlaceholder = "https://example.com";
      const markdownLink = `[${selectedText}](${urlPlaceholder})`;
      const urlStart = start + selectedText.length + 3;
      const urlEnd = urlStart + urlPlaceholder.length;

      inputElement.setRangeText(markdownLink, start, end, "end");
      focus();
      setSelectionRange(urlStart, urlEnd);
    }

    function getScrollElement() {
      return inputElement;
    }

    let caretMeasureElement;
    let caretMeasureText;

    function getCaretViewportTop() {
      if (!caretMeasureElement) {
        caretMeasureElement = document.createElement("div");
        caretMeasureElement.setAttribute("aria-hidden", "true");
        caretMeasureElement.style.position = "absolute";
        caretMeasureElement.style.visibility = "hidden";
        caretMeasureElement.style.pointerEvents = "none";
        rootElement.appendChild(caretMeasureElement);
      }

      const inputStyle = window.getComputedStyle(inputElement);
      caretMeasureElement.style.left = "-100000px";
      caretMeasureElement.style.top = "0px";
      caretMeasureElement.style.width = `${inputElement.clientWidth}px`;
      caretMeasureElement.style.boxSizing = inputStyle.boxSizing;
      caretMeasureElement.style.padding = inputStyle.padding;
      caretMeasureElement.style.border = inputStyle.border;
      caretMeasureElement.style.font = inputStyle.font;
      caretMeasureElement.style.letterSpacing = inputStyle.letterSpacing;
      caretMeasureElement.style.lineHeight = inputStyle.lineHeight;
      caretMeasureElement.style.whiteSpace = "pre-wrap";
      caretMeasureElement.style.overflowWrap = "break-word";
      caretMeasureElement.style.wordBreak = inputStyle.wordBreak;
      caretMeasureElement.style.tabSize = inputStyle.tabSize;
      caretMeasureElement.textContent = "";
      caretMeasureText = document.createTextNode(inputElement.value);
      caretMeasureElement.appendChild(caretMeasureText);

      const caretOffset = getCaretOffset();
      const caretRange = document.createRange();
      const getCharacterRect = (start) => {
        if (start < 0 || start >= inputElement.value.length) return null;
        const range = document.createRange();
        range.setStart(caretMeasureText, start);
        range.setEnd(caretMeasureText, start + 1);
        return range.getClientRects()[0] || range.getBoundingClientRect();
      };
      const previousRect = getCharacterRect(caretOffset - 1);
      const nextRect = getCharacterRect(caretOffset);
      const crossesVisualLine = previousRect && nextRect && nextRect.top > previousRect.top + 0.5;
      let markerRect;
      if (crossesVisualLine && caretAffinity === "previous") {
        markerRect = previousRect;
      } else if (nextRect && (!previousRect || crossesVisualLine)) {
        markerRect = nextRect;
      } else {
        caretRange.setStart(caretMeasureText, caretOffset);
        caretRange.collapse(true);
        markerRect = caretRange.getClientRects()[0] || caretRange.getBoundingClientRect();
      }
      const measureRect = caretMeasureElement.getBoundingClientRect();
      return (markerRect ? markerRect.top - measureRect.top : 0) - inputElement.scrollTop;
    }

    function setActiveBlock(index, totalBlocks, viewportTop) {
      const indicator = rootElement.querySelector("[data-scroll-gutter-indicator]");
      if (!indicator || index < 0 || !totalBlocks) {
        if (indicator) indicator.classList.remove("is-active");
        return;
      }

      const gutterHeight = Math.max(0, rootElement.clientHeight - 65);
      const isCaretPosition = Number.isFinite(viewportTop);
      const markerHeight = isCaretPosition
        ? (parseFloat(window.getComputedStyle(inputElement).lineHeight) || 27)
        : 32;
      const markerTop = isCaretPosition
        ? Math.max(0, Math.min(viewportTop, Math.max(0, gutterHeight - markerHeight)))
        : (totalBlocks <= 1 ? 0 : (index / (totalBlocks - 1)) * Math.max(0, gutterHeight - markerHeight));
      indicator.style.height = `${markerHeight}px`;
      indicator.style.top = `${markerTop}px`;
      indicator.classList.add("is-active");
    }

    let lastCaretStart = inputElement.selectionStart;
    let lastCaretEnd = inputElement.selectionEnd;
    let caretAffinity = "next";

    function updateCaretAffinity(event) {
      if (event.key === "End" || event.key === "ArrowLeft") {
        caretAffinity = "previous";
      } else if (event.key === "Home" || event.key === "ArrowRight") {
        caretAffinity = "next";
      }
    }

    function notifyCaretChange(force) {
      const start = inputElement.selectionStart;
      const end = inputElement.selectionEnd;
      if (!force && start === lastCaretStart && end === lastCaretEnd) return;
      lastCaretStart = start;
      lastCaretEnd = end;
      if (onCaretChange) onCaretChange();
    }

    inputElement.addEventListener("input", () => onInput(true));
    inputElement.addEventListener("focus", () => notifyCaretChange(true));
    inputElement.addEventListener("click", () => {
      caretAffinity = null;
      notifyCaretChange(false);
    });
    inputElement.addEventListener("keyup", () => notifyCaretChange(false));
    inputElement.addEventListener("select", () => notifyCaretChange(false));
    document.addEventListener("selectionchange", () => {
      if (document.activeElement === inputElement) notifyCaretChange(false);
    });
    if (onScroll) {
      inputElement.addEventListener("scroll", onScroll);
    }

    inputElement.addEventListener("keydown", (event) => {
      updateCaretAffinity(event);
      const shortcutKey = event.ctrlKey || event.metaKey;
      if (!shortcutKey) return;

      const key = event.key.toLowerCase();
      if (key === "b") {
        event.preventDefault();
        onAction("bold");
      } else if (key === "i") {
        event.preventDefault();
        onAction("italic");
      } else if (event.altKey && key === "1") {
        event.preventDefault();
        onAction("heading");
      } else if (event.shiftKey && key === "7") {
        event.preventDefault();
        onAction("bulletList");
      } else if (event.altKey && key === "c") {
        event.preventDefault();
        onAction("codeBlock");
      } else if (key === "s" && event.shiftKey) {
        event.preventDefault();
        onShortcutCommand("saveAs");
      } else if (key === "s") {
        event.preventDefault();
        onShortcutCommand("save");
      } else if (key === "o") {
        event.preventDefault();
        onShortcutCommand("load");
      } else if (key === "n") {
        event.preventDefault();
        onShortcutCommand("new");
      }
    });

    rootElement.querySelectorAll("button[data-action]").forEach((button) => {
      button.addEventListener("mousedown", (event) => {
        event.preventDefault();
      });

      button.addEventListener("click", () => {
        onAction(button.dataset.action);
      });
    });

    ["dragenter", "dragover"].forEach((eventName) => {
      rootElement.addEventListener(eventName, (event) => {
        event.preventDefault();
        rootElement.classList.add("drop-active");
      });
    });

    ["dragleave", "drop"].forEach((eventName) => {
      rootElement.addEventListener(eventName, (event) => {
        event.preventDefault();
        if (eventName === "drop") {
          onDroppedFiles(event.dataTransfer.files);
        }
        rootElement.classList.remove("drop-active");
      });
    });

    return {
      focus,
      getCaretOffset,
      getCaretViewportTop,
      getScrollElement,
      getSelectedText,
      getSelectionState,
      getValue,
      prefixLines,
      replaceSelection,
      insertLink,
      setSelectionRange,
      setActiveBlock,
      setValue,
      wrapSelection
    };
  }

  window.QuillMarkdownPane = {
    createMarkdownPane
  };
})();
