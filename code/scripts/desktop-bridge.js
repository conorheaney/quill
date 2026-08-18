(function () {
  const tauriGlobal = window.__TAURI__;
  const appApi = tauriGlobal && tauriGlobal.app;
  const dialogApi = tauriGlobal && tauriGlobal.dialog;
  const coreApi = tauriGlobal && tauriGlobal.core;
  const windowApi = tauriGlobal && tauriGlobal.window;
  const eventApi = tauriGlobal && tauriGlobal.event;

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

  function currentWindowLabel() {
    return window.__TAURI_INTERNALS__?.metadata?.currentWindow?.label || "main";
  }

  function invokeWindowCommand(command, args) {
    if (!coreApi || typeof coreApi.invoke !== "function") return Promise.resolve(null);
    return coreApi.invoke(`plugin:window|${command}`, {
      label: currentWindowLabel(),
      ...(args || {})
    });
  }

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

  async function inspectMarkdownFile(filePath) {
    return coreApi.invoke("inspect_markdown_file", {
      filePath
    });
  }

  async function verifyMarkdownFile(filePath) {
    return coreApi.invoke("verify_markdown_file", {
      filePath
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
    async minimizeWindow() {
      if (windowApi && typeof windowApi.getCurrentWindow === "function") {
        return windowApi.getCurrentWindow().minimize();
      }
      return invokeWindowCommand("minimize");
    },

    async toggleMaximizeWindow() {
      if (windowApi && typeof windowApi.getCurrentWindow === "function") {
        return windowApi.getCurrentWindow().toggleMaximize();
      }
      return invokeWindowCommand("toggle_maximize");
    },

    async isWindowMaximized() {
      if (windowApi && typeof windowApi.getCurrentWindow === "function") {
        return windowApi.getCurrentWindow().isMaximized();
      }
      return invokeWindowCommand("is_maximized");
    },

    async closeWindow() {
      if (windowApi && typeof windowApi.getCurrentWindow === "function") {
        return windowApi.getCurrentWindow().close();
      }
      return invokeWindowCommand("close");
    },

    async startWindowDragging() {
      if (windowApi && typeof windowApi.getCurrentWindow === "function") {
        return windowApi.getCurrentWindow().startDragging();
      }
      return invokeWindowCommand("start_dragging");
    },

    async setWindowTitle(title) {
      if (windowApi && typeof windowApi.getCurrentWindow === "function") {
        return windowApi.getCurrentWindow().setTitle(title);
      }
      return invokeWindowCommand("set_title", { value: title });
    },

    async onWindowCloseRequested(handler) {
      if (windowApi && typeof windowApi.getCurrentWindow === "function") {
        return windowApi.getCurrentWindow().onCloseRequested(handler);
      }
      if (eventApi && typeof eventApi.listen === "function") {
        return eventApi.listen("tauri://close-requested", handler);
      }
      return Promise.resolve(null);
    },

    async getAppVersion() {
      if (!appApi || typeof appApi.getVersion !== "function") {
        return null;
      }

      return appApi.getVersion();
    },

    async inspectMarkdownFile(filePath) {
      return inspectMarkdownFile(filePath);
    },

    async verifyMarkdownFile(filePath) {
      return verifyMarkdownFile(filePath);
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

    async revealInExplorer(filePath) {
      return coreApi.invoke("reveal_in_explorer", {
        filePath
      });
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
