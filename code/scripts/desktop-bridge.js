(function () {
  const tauriGlobal = window.__TAURI__;
  const dialogApi = tauriGlobal && tauriGlobal.dialog;
  const coreApi = tauriGlobal && tauriGlobal.core;

  if (!dialogApi || typeof dialogApi.open !== "function" || typeof dialogApi.save !== "function") {
    return;
  }

  if (!coreApi || typeof coreApi.invoke !== "function") {
    return;
  }

  const MARKDOWN_FILE_FILTERS = [
    {
      name: "Markdown files",
      extensions: ["md", "markdown", "txt"]
    }
  ];

  async function readMarkdownFile(filePath) {
    return coreApi.invoke("read_markdown_file", {
      filePath
    });
  }

  async function writeMarkdownFile(filePath, content) {
    return coreApi.invoke("write_markdown_file", {
      payload: {
        content,
        filePath
      }
    });
  }

  window.QuillDesktop = {
    async openMarkdownFile() {
      const selectedPath = await dialogApi.open({
        directory: false,
        filters: MARKDOWN_FILE_FILTERS,
        multiple: false
      });

      if (!selectedPath || Array.isArray(selectedPath)) {
        return null;
      }

      return readMarkdownFile(String(selectedPath));
    },

    async reopenMarkdownFile(filePath) {
      return readMarkdownFile(filePath);
    },

    async saveMarkdownFile(payload) {
      const options = payload || {};
      let targetPath = options.filePath || "";

      if (options.saveAs || !targetPath) {
        const selectedPath = await dialogApi.save({
          defaultPath: targetPath || options.suggestedName || "document.md",
          filters: MARKDOWN_FILE_FILTERS
        });

        if (!selectedPath || Array.isArray(selectedPath)) {
          return null;
        }

        targetPath = String(selectedPath);
      }

      return writeMarkdownFile(targetPath, options.content || "");
    }
  };
})();
