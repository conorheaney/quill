import { getVersion } from "@tauri-apps/api/app";
import { invoke, isTauri } from "@tauri-apps/api/core";
import { emitTo, listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { open as openDialog, save as saveDialog } from "@tauri-apps/plugin-dialog";
import type { DesktopBridgePort, FileState, SaveMarkdownPayload } from "./contracts";

(function (): void {
  if (!isTauri()) {
    return;
  }

  const currentWindow = getCurrentWindow();
  const MIN_SPLASH_DURATION_MS = 5000;
  let splashStartedAt = Date.now();

  void listen("startup-retry", () => window.location.reload());
  void listen("splash-ready", () => {
    splashStartedAt = Date.now();
  });

  function wait(milliseconds: number): Promise<void> {
    return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
  }

  async function completeStartup(): Promise<void> {
    const remaining = Math.max(0, MIN_SPLASH_DURATION_MS - (Date.now() - splashStartedAt));
    await wait(remaining);
    const splashWindow = await WebviewWindow.getByLabel("splashscreen");
    await splashWindow?.close();
    await currentWindow.show();
    await currentWindow.setFocus();
  }

  async function showStartupFailure(): Promise<void> {
    await emitTo("splashscreen", "startup-failed");
  }

  const MARKDOWN_FILE_FILTERS = [
    {
      name: "Markdown files",
      extensions: ["md", "markdown", "txt"]
    }
  ];

  async function readMarkdownFile(filePath: string): Promise<unknown> {
    return invoke("read_markdown_file", {
      filePath
    });
  }

  async function writeMarkdownFile(filePath: string, content: string): Promise<unknown> {
    return invoke("write_markdown_file", {
      payload: {
        content,
        filePath
      }
    });
  }

  async function inspectMarkdownFile(filePath: string): Promise<FileState> {
    return invoke("inspect_markdown_file", {
      filePath
    });
  }

  async function verifyMarkdownFile(filePath: string): Promise<FileState> {
    return invoke("verify_markdown_file", {
      filePath
    });
  }

  const previewImageCache = new Map();

  async function readImageDataUrl(filePath: string): Promise<string> {
    const normalizedPath = String(filePath || "").trim();
    if (!normalizedPath) {
      throw new Error("A file path is required to preview an image.");
    }

    if (!previewImageCache.has(normalizedPath)) {
      previewImageCache.set(normalizedPath, invoke("read_image_data_url", {
        filePath: normalizedPath
      }).catch((error) => {
        previewImageCache.delete(normalizedPath);
        throw error;
      }));
    }

    return previewImageCache.get(normalizedPath);
  }

  const desktopBridge: DesktopBridgePort = {
    async minimizeWindow() {
      return currentWindow.minimize();
    },

    async toggleMaximizeWindow() {
      return currentWindow.toggleMaximize();
    },

    async isWindowMaximized() {
      return currentWindow.isMaximized();
    },

    async closeWindow() {
      return currentWindow.close();
    },

    async startWindowDragging() {
      return currentWindow.startDragging();
    },

    async setWindowTitle(title) {
      return currentWindow.setTitle(title);
    },

    async onWindowCloseRequested(handler) {
      return currentWindow.onCloseRequested(handler as never);
    },

    completeStartup,
    showStartupFailure,

    async getAppVersion() {
      return getVersion();
    },

    async inspectMarkdownFile(filePath) {
      return inspectMarkdownFile(filePath);
    },

    async verifyMarkdownFile(filePath) {
      return verifyMarkdownFile(filePath);
    },

    async openMarkdownFile() {
      const selectedPath = await openDialog({
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
      return invoke("reveal_in_explorer", {
        filePath
      });
    },

    async readImageDataUrl(filePath) {
      return readImageDataUrl(filePath);
    },

    async saveMarkdownFile(payload: SaveMarkdownPayload) {
      const options = payload || {};
      let targetPath = options.filePath || "";

      if (options.saveAs || !targetPath) {
        const selectedPath = await saveDialog({
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

  window.QuillDesktop = desktopBridge;
})();
