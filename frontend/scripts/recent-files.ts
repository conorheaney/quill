import type { RecentFileEntry, RecentFilesOptions, RecentFilesPort } from "./contracts";

(function (): void {
  const RECENT_FILES_LIMIT = 10;

  function createRecentFilesController(options: RecentFilesOptions): RecentFilesPort {
    const settings = options || {};
    const button = settings.button;
    const panel = settings.panel;
    const list = settings.list;
    const desktopBridge = settings.desktopBridge;
    const escapeHtml = settings.escapeHtml;
    const getFileNameFromPath = settings.getFileNameFromPath;
    const getRecentFiles = settings.getRecentFiles;
    const saveRecentFiles = settings.saveRecentFiles;
    const confirmIfDirty = settings.confirmIfDirty;
    const confirmAction = settings.confirmAction;
    const loadRecentResult = settings.loadRecentResult;
    const showToast = settings.showToast;

    const state: {
      currentRecentFileKey: string;
      entries: RecentFileEntry[];
      isMenuOpen: boolean;
      isHydrated: boolean;
    } = {
      currentRecentFileKey: "",
      entries: [],
      isMenuOpen: false,
      isHydrated: false
    };

    function normaliseEntry(entry: Partial<RecentFileEntry> | null | undefined): RecentFileEntry | null {
      if (!entry) return null;

      const filePath = entry.filePath ? String(entry.filePath).trim() : "";
      if (!filePath) return null;

      return {
        filePath,
        fileName: entry.fileName ? String(entry.fileName).trim() : getFileNameFromPath(filePath)
      };
    }

    function getEntryKey(entry: RecentFileEntry | null | undefined): string {
      return entry && entry.filePath ? entry.filePath : "";
    }

    function isCurrentEntry(entry: RecentFileEntry): boolean {
      return Boolean(state.currentRecentFileKey) && state.currentRecentFileKey === getEntryKey(entry);
    }

    function persist(): void {
      saveRecentFiles(state.entries).catch((error) => {
        console.error("Unable to persist recent files", error);
      });
    }

    function animateReorderedEntries(previousPositions: Map<string, DOMRect> | null): void {
      if (!previousPositions || !window.Element || typeof Element.prototype.animate !== "function") return;

      [...list.children].forEach((element) => {
        const item = element as HTMLElement;
        const previous = previousPositions.get(item.dataset.recentFileKey || "");
        if (!previous) return;

        const next = item.getBoundingClientRect();
        const deltaX = previous.left - next.left;
        const deltaY = previous.top - next.top;
        if (!deltaX && !deltaY) return;

        item.animate(
          [
            { transform: `translate(${deltaX}px, ${deltaY}px)` },
            { transform: "translate(0, 0)" }
          ],
          { duration: 180, easing: "ease-out" }
        );
      });
    }

    function render(options: { animate?: boolean } = {}): void {
      const renderOptions = options || {};
      const previousPositions = renderOptions.animate
        ? new Map<string, DOMRect>([...list.children].map((element) => {
          const item = element as HTMLElement;
          return [item.dataset.recentFileKey || "", item.getBoundingClientRect()];
        }))
        : null;

      list.replaceChildren();

      if (!state.entries.length) {
        const emptyState = document.createElement("div");
        emptyState.className = "recent-file-empty";
        emptyState.textContent = "No recent files yet. Open a Markdown file from disk to populate this list.";
        list.appendChild(emptyState);
        return;
      }

      state.entries.forEach((entry: RecentFileEntry) => {
        const item = document.createElement("div");
        const isCurrent = isCurrentEntry(entry);
        item.className = "recent-file-entry";
        item.dataset.recentFileKey = getEntryKey(entry);
        item.dataset.current = isCurrent ? "true" : "false";

        const itemMain = document.createElement("button");
        itemMain.type = "button";
        itemMain.className = "recent-file-open";
        itemMain.title = entry.filePath;
        itemMain.innerHTML = `
          <span class="recent-file-entry-main">
            <span class="recent-file-title-group">
              <span class="recent-file-name">${escapeHtml(entry.fileName || getFileNameFromPath(entry.filePath))}</span>
              ${isCurrent ? '<span class="recent-file-current-indicator">Current</span>' : ""}
            </span>
            <span class="recent-file-path">${escapeHtml(entry.filePath)}</span>
          </span>
        `;
        itemMain.addEventListener("click", () => {
          handleRecentFileOpen(entry).catch((error) => {
            console.error("Unable to reopen recent file", error);
          });
        });
        item.appendChild(itemMain);

        const actions = document.createElement("span");
        actions.className = "recent-file-actions";
        actions.setAttribute("aria-label", `Actions for ${entry.fileName || "recent file"}`);

        const copyButton = createActionButton("recent-file-copy", "⧉", "Copy path", () => {
          copyRecentFilePath(entry).catch((error) => {
            console.error("Unable to copy recent file path", error);
          });
        });
        actions.appendChild(copyButton);

        const explorerButton = createActionButton("recent-file-explorer", "↗", "Open in Explorer", () => {
          revealRecentFileInExplorer(entry).catch((error) => {
            console.error("Unable to open recent file in Explorer", error);
          });
        });
        actions.appendChild(explorerButton);

        if (!isCurrent) {
          const removeButton = createActionButton("recent-file-remove", "×", "Remove from recent files", () => {
            removeRecentFile(entry);
          });
          actions.appendChild(removeButton);
        }

        item.appendChild(actions);
        list.appendChild(item);
      });

      animateReorderedEntries(previousPositions);
    }

    function createActionButton(className: string, glyph: string, label: string, onClick: () => void): HTMLButtonElement {
      const buttonElement = document.createElement("button");
      buttonElement.type = "button";
      buttonElement.className = `recent-file-action ${className}`;
      buttonElement.setAttribute("aria-label", label);
      buttonElement.title = label;
      buttonElement.textContent = glyph;
      buttonElement.addEventListener("click", (event: MouseEvent) => {
        event.stopPropagation();
        onClick();
      });
      return buttonElement;
    }

    function setMenuOpen(isOpen: boolean): void {
      state.isMenuOpen = isOpen;
      button.setAttribute("aria-expanded", isOpen ? "true" : "false");
      panel.hidden = !isOpen;
      if (isOpen) {
        list.scrollTop = 0;
      }
    }

    function setCurrentRecentFile(entry: RecentFileEntry | null): void {
      state.currentRecentFileKey = getEntryKey(entry);
      render();
    }

    function clearCurrentRecentFile() {
      state.currentRecentFileKey = "";
      render();
    }

    function recordRecentFile(filePath: string, fileName = ""): RecentFileEntry | null {
      if (!filePath) return null;

      const nextEntry = normaliseEntry({ filePath, fileName });
      if (!nextEntry) return null;
      const wasExisting = state.entries.some((entry) => getEntryKey(entry) === getEntryKey(nextEntry));
      state.entries = [nextEntry]
        .concat(state.entries.filter((entry) => getEntryKey(entry) !== getEntryKey(nextEntry)))
        .slice(0, RECENT_FILES_LIMIT);
      persist();
      render({ animate: wasExisting });
      return nextEntry;
    }

    function removeRecentFile(entry: RecentFileEntry): void {
      const key = getEntryKey(entry);
      if (!key || key === state.currentRecentFileKey) return;

      state.entries = state.entries.filter((recentEntry) => getEntryKey(recentEntry) !== key);
      persist();
      render();
      showToast("Removed from Recent", `${entry.fileName || "File"} was removed from the list.`, { duration: 1800 });
    }

    async function copyRecentFilePath(entry: RecentFileEntry): Promise<void> {
      try {
        if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
          throw new Error("Clipboard API is unavailable.");
        }
        await navigator.clipboard.writeText(entry.filePath);
        showToast("Path copied", `${entry.fileName || "File"} path copied to the clipboard.`, { duration: 1800 });
      } catch (error) {
        showToast("Copy failed", "Quill could not copy that file path to the clipboard.");
        throw error;
      }
    }

    async function revealRecentFileInExplorer(entry: RecentFileEntry): Promise<void> {
      try {
        await desktopBridge.revealInExplorer(entry.filePath);
        showToast("Opened in Explorer", `${entry.fileName || "File"} is selected in Explorer.`, { duration: 1800 });
      } catch (error) {
        showToast("Explorer failed", "Quill could not open that file in Explorer.");
        throw error;
      }
    }

    async function handleRecentFileOpen(entry: RecentFileEntry): Promise<void> {
      const canContinue = await confirmIfDirty(
        "Open recent file?",
        "You have unsaved changes in the current document. Opening a recent file will replace the editor contents.",
        "Open file"
      );
      if (!canContinue) return;

      try {
        const result = await desktopBridge.reopenMarkdownFile(entry.filePath);
        if (!result) return;
        await loadRecentResult(result);
        const loadedFileName = result && typeof result === "object" && "fileName" in result
          ? String(result.fileName || "Document")
          : "Document";
        showToast("Recent file opened", `${loadedFileName} is now open.`);
        setMenuOpen(false);
      } catch (error) {
        console.error("Unable to reopen recent file", error);
        showToast("Recent file unavailable", "Quill could not reopen that file.");
        const shouldRemove = await confirmAction(
          "Remove recent file?",
          `${entry.fileName || "This file"} could not be reopened. Remove it from Recent Files?`,
          "Remove"
        );
        if (shouldRemove) {
          removeRecentFile(entry);
        }
      }
    }

    button.addEventListener("click", () => {
      setMenuOpen(!state.isMenuOpen);
    });

    document.addEventListener("click", (event) => {
      const target = event.target instanceof Node ? event.target : null;
      if (!state.isMenuOpen || panel.contains(target) || button.contains(target)) return;
      setMenuOpen(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && state.isMenuOpen) {
        setMenuOpen(false);
      }
    });

    async function hydrate(): Promise<void> {
      try {
        const entries = await getRecentFiles();
        if (state.entries.length) return;
        state.entries = (entries || [])
          .map(normaliseEntry)
          .filter((entry): entry is RecentFileEntry => entry !== null)
          .slice(0, RECENT_FILES_LIMIT);
        state.isHydrated = true;
        render();
      } catch (error) {
        console.error("Unable to load recent files", error);
        state.isHydrated = true;
      }
    }

    return {
      clearCurrentRecentFile,
      hydrate,
      recordRecentFile,
      render,
      setCurrentRecentFile
    };
  }

  window.QuillRecentFiles = {
    createRecentFilesController
  };
})();
