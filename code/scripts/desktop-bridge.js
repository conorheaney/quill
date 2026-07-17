(function () {
  const tauriGlobal = window.__TAURI__;
  const appApi = tauriGlobal && tauriGlobal.app;
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

  const previewImageCache = new Map();

  async function readImageDataUrl(filePath) {
    const normalizedPath = String(filePath || "").trim();
    if (!normalizedPath) {
      throw new Error("A file path is required to preview an image.");
    }

    if (!previewImageCache.has(normalizedPath)) {
      previewImageCache.set(normalizedPath, coreApi.invoke("read_image_data_url", {
        filePath: normalizedPath
      }).catch((error) => {
        previewImageCache.delete(normalizedPath);
        throw error;
      }));
    }

    return previewImageCache.get(normalizedPath);
  }

  window.QuillDesktop = {
    async getAppVersion() {
      if (!appApi || typeof appApi.getVersion !== "function") {
        return null;
      }

      return appApi.getVersion();
    },

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

    async readImageDataUrl(filePath) {
      return readImageDataUrl(filePath);
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
