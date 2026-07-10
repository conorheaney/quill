(function () {
  function createMarkdownPane(options) {
    const {
      rootElement,
      inputElement,
      onInput,
      onScroll,
      onAction,
      onShortcutCommand,
      onDroppedFiles
    } = options;

    function getSelectionState() {
      return {
        start: inputElement.selectionStart,
        end: inputElement.selectionEnd
      };
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

    function getScrollElement() {
      return inputElement;
    }

    inputElement.addEventListener("input", () => onInput(true));
    inputElement.addEventListener("scroll", onScroll);

    inputElement.addEventListener("keydown", (event) => {
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
      getScrollElement,
      getSelectedText,
      getSelectionState,
      getValue,
      prefixLines,
      replaceSelection,
      setSelectionRange,
      setValue,
      wrapSelection
    };
  }

  window.QuillMarkdownPane = {
    createMarkdownPane
  };
})();
