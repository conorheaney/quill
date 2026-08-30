import type { WindowChromeOptions, WindowChromePort } from "./contracts";

const TITLE = "Quill Markdown Editor";

type WindowAction =
  | "minimizeWindow"
  | "toggleMaximizeWindow"
  | "closeWindow"
  | "startWindowDragging";

function isCloseRequestEvent(value: unknown): value is { preventDefault(): void } {
  return typeof value === "object" && value !== null && "preventDefault" in value && typeof value.preventDefault === "function";
}

const windowChrome = (() => {
  function initialise(options: WindowChromeOptions = {}): WindowChromePort {
    const settings = options;
    const titleBar = document.querySelector<HTMLElement>(".window-chrome");
    const titleElement = titleBar?.querySelector<HTMLElement>(".window-chrome-title");
    const minimizeButton = titleBar?.querySelector<HTMLButtonElement>('[data-window-action="minimize"]');
    const maximizeButton = titleBar?.querySelector<HTMLButtonElement>('[data-window-action="maximize"]');
    const closeButton = titleBar?.querySelector<HTMLButtonElement>('[data-window-action="close"]');
    const desktopBridge = settings.desktopBridge || null;

    if (!titleBar || !titleElement || !minimizeButton || !maximizeButton || !closeButton) {
      return { status: "unavailable" };
    }

    const resolvedTitleBar = titleBar;
    const resolvedTitleElement = titleElement;
    const resolvedMaximizeButton = maximizeButton;

    const title = settings.title || TITLE;
    let isMaximized = false;
    let closeRequestInFlight = false;
    let approvedCloseRequest = false;
    let dragTimer: number | null = null;

    function cancelDragTimer() {
      if (dragTimer !== null) {
        window.clearTimeout(dragTimer);
        dragTimer = null;
      }
    }

    function setTitle(nextTitle: string) {
      const resolvedTitle = nextTitle || TITLE;
      resolvedTitleElement.textContent = resolvedTitle;
      document.title = resolvedTitle;
      if (desktopBridge && typeof desktopBridge.setWindowTitle === "function") {
        desktopBridge.setWindowTitle(resolvedTitle).catch((error) => {
          console.error("Unable to update the native window title", error);
        });
      }
    }

    function updateMaximizeButton(nextIsMaximized: unknown) {
      isMaximized = Boolean(nextIsMaximized);
      resolvedMaximizeButton.textContent = isMaximized ? "❐" : "□";
      resolvedMaximizeButton.setAttribute("aria-label", isMaximized ? "Restore window" : "Maximize window");
      resolvedMaximizeButton.title = isMaximized ? "RESTORE" : "MAXIMIZE";
      resolvedTitleBar.dataset.maximized = isMaximized ? "true" : "false";
    }

    async function refreshMaximizedState() {
      if (!desktopBridge || typeof desktopBridge.isWindowMaximized !== "function") return;
      try {
        updateMaximizeButton(await desktopBridge.isWindowMaximized());
      } catch (error) {
        console.error("Unable to read the native window state", error);
      }
    }

    function invoke(action: WindowAction): Promise<unknown> {
      if (!desktopBridge || typeof desktopBridge[action] !== "function") return Promise.resolve(null);
      return desktopBridge[action]().catch((error: unknown) => {
        console.error(`Unable to ${action}`, error);
        return null;
      });
    }

    minimizeButton.addEventListener("click", () => invoke("minimizeWindow"));
    maximizeButton.addEventListener("click", async () => {
      await invoke("toggleMaximizeWindow");
      await refreshMaximizedState();
    });
    async function requestClose() {
      if (closeRequestInFlight) return;
      closeRequestInFlight = true;
      try {
        const approved = typeof settings.onRequestClose === "function"
          ? await settings.onRequestClose()
          : true;
        if (!approved) return;
        approvedCloseRequest = true;
        await invoke("closeWindow");
      } finally {
        closeRequestInFlight = false;
        if (approvedCloseRequest) {
          window.setTimeout(() => {
            approvedCloseRequest = false;
          }, 1000);
        }
      }
    }

    closeButton.addEventListener("click", requestClose);

    resolvedTitleBar.addEventListener("mousedown", (event: MouseEvent) => {
      if (event.button !== 0 || (event.target instanceof Element && event.target.closest("button"))) return;
      event.preventDefault();
      cancelDragTimer();
      dragTimer = window.setTimeout(() => {
        dragTimer = null;
        invoke("startWindowDragging");
      }, 160);
    });

    resolvedTitleBar.addEventListener("mouseup", cancelDragTimer);

    resolvedTitleBar.addEventListener("dblclick", async (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest("button")) return;
      cancelDragTimer();
      event.preventDefault();
      await invoke("toggleMaximizeWindow");
      await refreshMaximizedState();
    });

    window.addEventListener("focus", refreshMaximizedState);
    window.addEventListener("resize", refreshMaximizedState);

    if (desktopBridge && typeof desktopBridge.onWindowCloseRequested === "function") {
      desktopBridge.onWindowCloseRequested(async (event: unknown) => {
        if (approvedCloseRequest) {
          approvedCloseRequest = false;
          return;
        }
        if (closeRequestInFlight) {
          if (isCloseRequestEvent(event)) event.preventDefault();
          return;
        }

        closeRequestInFlight = true;
        try {
          const approved = typeof settings.onRequestClose === "function"
            ? await settings.onRequestClose()
            : true;
          if (!approved && isCloseRequestEvent(event)) event.preventDefault();
        } finally {
          closeRequestInFlight = false;
        }
      }).catch((error) => {
        console.error("Unable to register the native close handler", error);
      });
    }

    setTitle(title);
    refreshMaximizedState();
    return { setTitle, refreshMaximizedState, status: "ready" };
  }

  return { initialise };
})();

window.QuillWindowChrome = window.QuillWindowChrome || windowChrome;
