window.QuillWindowChrome = (() => {
  const TITLE = "Quill Markdown Editor";

  function initialise(options) {
    const settings = options || {};
    const titleBar = document.querySelector(".window-chrome");
    const titleElement = titleBar?.querySelector(".window-chrome-title");
    const minimizeButton = titleBar?.querySelector('[data-window-action="minimize"]');
    const maximizeButton = titleBar?.querySelector('[data-window-action="maximize"]');
    const closeButton = titleBar?.querySelector('[data-window-action="close"]');
    const desktopBridge = settings.desktopBridge || null;

    if (!titleBar || !titleElement || !minimizeButton || !maximizeButton || !closeButton) {
      return { status: "unavailable" };
    }

    const title = settings.title || TITLE;
    let isMaximized = false;
    let closeRequestInFlight = false;
    let approvedCloseRequest = false;
    let dragTimer = null;

    function cancelDragTimer() {
      if (dragTimer !== null) {
        window.clearTimeout(dragTimer);
        dragTimer = null;
      }
    }

    function setTitle(nextTitle) {
      const resolvedTitle = nextTitle || TITLE;
      titleElement.textContent = resolvedTitle;
      document.title = resolvedTitle;
      if (desktopBridge && typeof desktopBridge.setWindowTitle === "function") {
        desktopBridge.setWindowTitle(resolvedTitle).catch((error) => {
          console.error("Unable to update the native window title", error);
        });
      }
    }

    function updateMaximizeButton(nextIsMaximized) {
      isMaximized = Boolean(nextIsMaximized);
      maximizeButton.textContent = isMaximized ? "❐" : "□";
      maximizeButton.setAttribute("aria-label", isMaximized ? "Restore window" : "Maximize window");
      maximizeButton.title = isMaximized ? "RESTORE" : "MAXIMIZE";
      titleBar.dataset.maximized = isMaximized ? "true" : "false";
    }

    async function refreshMaximizedState() {
      if (!desktopBridge || typeof desktopBridge.isWindowMaximized !== "function") return;
      try {
        updateMaximizeButton(await desktopBridge.isWindowMaximized());
      } catch (error) {
        console.error("Unable to read the native window state", error);
      }
    }

    function invoke(action) {
      if (!desktopBridge || typeof desktopBridge[action] !== "function") return Promise.resolve(null);
      return desktopBridge[action]().catch((error) => {
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

    titleBar.addEventListener("mousedown", (event) => {
      if (event.button !== 0 || event.target.closest("button")) return;
      event.preventDefault();
      cancelDragTimer();
      dragTimer = window.setTimeout(() => {
        dragTimer = null;
        invoke("startWindowDragging");
      }, 160);
    });

    titleBar.addEventListener("mouseup", cancelDragTimer);

    titleBar.addEventListener("dblclick", async (event) => {
      if (event.target.closest("button")) return;
      cancelDragTimer();
      event.preventDefault();
      await invoke("toggleMaximizeWindow");
      await refreshMaximizedState();
    });

    window.addEventListener("focus", refreshMaximizedState);
    window.addEventListener("resize", refreshMaximizedState);

    if (desktopBridge && typeof desktopBridge.onWindowCloseRequested === "function") {
      desktopBridge.onWindowCloseRequested(async (event) => {
        if (approvedCloseRequest) {
          approvedCloseRequest = false;
          return;
        }
        if (closeRequestInFlight) {
          event.preventDefault();
          return;
        }

        closeRequestInFlight = true;
        try {
          const approved = typeof settings.onRequestClose === "function"
            ? await settings.onRequestClose()
            : true;
          if (!approved && typeof event.preventDefault === "function") event.preventDefault();
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
