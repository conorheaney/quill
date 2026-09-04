import type {
  ClockPort,
  ControllerOutcome,
  DialogPort,
  DocumentControllerEvents,
  DocumentControllerOptions,
  DocumentControllerPort,
  FileState,
  SaveMarkdownPayload
} from "./contracts";

(function (root: Window | null, factory: () => { createDocumentController: (options?: DocumentControllerOptions) => DocumentControllerPort }): void {
  const api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.QuillDocumentController = api;
  }
})(typeof window === "undefined" ? null : window, () => {
  function createDocumentController(options: DocumentControllerOptions = {}): DocumentControllerPort {
    const dependencies = options;
    const desktopBridge = dependencies.desktopBridge || null;
    const storage = dependencies.storage || null;
    const clock: ClockPort | null = dependencies.clock || null;
    const dialogs: DialogPort | null = dependencies.dialogs || null;
    const documentPort = dependencies.document || null;
    const events: DocumentControllerEvents = dependencies.events || {};
    const draftDelay = Number.isFinite(dependencies.draftDelay) ? dependencies.draftDelay as number : 220;
    let draftTimer: unknown = null;
    let fileBaseline: FileState | null = null;
    let externalCheckInFlight = false;

    function reportMissing(name: string): ControllerOutcome {
      if (typeof events.onMissingDependency === "function") {
        events.onMissingDependency(name);
      }
      return { dependency: name, status: "unavailable" };
    }

    function reportFailure(operation: string, error: unknown, toastTitle: string, toastMessage: string): ControllerOutcome {
      if (typeof events.onError === "function") {
        events.onError(operation, error);
      }
      if (toastTitle && typeof events.showToast === "function") {
        events.showToast(toastTitle, toastMessage || "");
      }
      return { error, operation, status: "failed" };
    }

    function cancelDraftSave(): void {
      if (draftTimer !== null && clock && typeof clock.clearTimeout === "function") {
        clock.clearTimeout(draftTimer);
      }
      draftTimer = null;
    }

    function persistDraft(showStatusToast = true): ControllerOutcome {
      if (!storage || typeof storage.saveDraft !== "function") {
        return reportMissing("storage.saveDraft");
      }
      if (!documentPort || typeof documentPort.getContent !== "function") {
        return reportMissing("document.getContent");
      }

      storage.saveDraft(documentPort.getContent());
      if (showStatusToast !== false && typeof events.showToast === "function") {
        events.showToast("SAVED LOCALLY", "", { id: "save-status", duration: 1600 });
      }
      return { status: "persisted" };
    }

    function scheduleDraftSave(showStatusToast = false): ControllerOutcome {
      cancelDraftSave();

      if (typeof dependencies.isAutosaveEnabled === "function" && !dependencies.isAutosaveEnabled()) {
        return { status: "disabled" };
      }
      if (!clock || typeof clock.setTimeout !== "function" || typeof clock.clearTimeout !== "function") {
        return reportMissing("clock");
      }

      if (showStatusToast && typeof events.showToast === "function") {
        events.showToast("SAVING...", "", { id: "save-status", duration: 0 });
      }

      draftTimer = clock.setTimeout(() => {
        draftTimer = null;
        persistDraft(showStatusToast);
      }, draftDelay);
      return { status: "scheduled", timer: draftTimer };
    }

    async function confirmDirty(title: string, message: string, acceptLabel: string): Promise<ControllerOutcome> {
      if (!dialogs || typeof dialogs.confirmIfDirty !== "function") {
        return reportMissing("dialogs.confirmIfDirty");
      }
      return { accepted: await dialogs.confirmIfDirty(title, message, acceptLabel), status: "ready" };
    }

    async function loadDocument(): Promise<ControllerOutcome> {
      if (!desktopBridge || typeof desktopBridge.openMarkdownFile !== "function") {
        return reportMissing("desktopBridge.openMarkdownFile");
      }

      try {
        const confirmation = await confirmDirty(
          "Load another file?",
          "You have unsaved changes in the current document. Loading a file will replace the editor contents.",
          "Load file"
        );
        if (confirmation.status === "unavailable") return confirmation;
        if (!confirmation.accepted) return { status: "cancelled" };

        const result = await desktopBridge.openMarkdownFile();
        if (!result) return { status: "cancelled" };
        if (typeof events.onLoaded === "function") {
          await events.onLoaded(result);
        }
        return { result, status: "loaded" };
      } catch (error: unknown) {
        if (isAbortError(error)) return { status: "cancelled" };
        return reportFailure("loadDocument", error, "Load failed", "The selected file could not be opened.");
      }
    }

    async function saveDocument(saveAs = false): Promise<ControllerOutcome> {
      if (!desktopBridge || typeof desktopBridge.saveMarkdownFile !== "function") {
        return reportMissing("desktopBridge.saveMarkdownFile");
      }
      if (!documentPort || typeof documentPort.getContent !== "function" || typeof documentPort.getFileIdentity !== "function") {
        return reportMissing("document");
      }

      const identity = documentPort.getFileIdentity();
      const useSaveAs = Boolean(saveAs);

      try {
        const savePayload: SaveMarkdownPayload = {
          content: documentPort.getContent(),
          filePath: useSaveAs ? "" : identity?.filePath || "",
          saveAs: useSaveAs,
          suggestedName: identity?.fileName || "document.md"
        };
        if (useSaveAs && identity?.filePath) {
          savePayload.sourceFilePath = identity.filePath;
        }
        if (useSaveAs) {
          savePayload.beforeWrite = async () => {
            if (!hasRelativeImageReferences(documentPort.getContent())) {
              return true;
            }
            if (!dialogs || typeof dialogs.confirmAction !== "function") {
              reportMissing("dialogs.confirmAction");
              return false;
            }
            return dialogs.confirmAction(
              "Relative images in copied file",
              "This file contains relative images. Quill will adjust their references for the copied document, but some images may not resolve correctly in the new location. Do you want to continue?",
              "Continue"
            );
          };
        }
        const result = await desktopBridge.saveMarkdownFile(savePayload);
        if (!result) return { status: "cancelled" };
        if (typeof events.onSaved === "function") {
          await events.onSaved(result, { saveAs: useSaveAs });
        }
        return { result, status: "saved" };
      } catch (error: unknown) {
        if (isAbortError(error)) return { status: "cancelled" };
        return reportFailure("saveDocument", error, "Save failed", "The document could not be saved.");
      }
    }

    function setFileBaseline(nextBaseline: FileState | null): void {
      fileBaseline = nextBaseline && nextBaseline.filePath ? { ...nextBaseline } : null;
    }

    function fileStateChanged(currentState: FileState | null): boolean {
      if (!fileBaseline || !currentState) return false;
      return fileBaseline.filePath !== currentState.filePath
        || fileBaseline.exists !== currentState.exists
        || fileBaseline.modifiedAt !== currentState.modifiedAt
        || fileBaseline.size !== currentState.size
        || fileBaseline.contentHash !== currentState.contentHash;
    }

    function fileMetadataChanged(currentState: FileState | null): boolean {
      if (!fileBaseline || !currentState) return false;
      return fileBaseline.filePath !== currentState.filePath
        || fileBaseline.exists !== currentState.exists
        || fileBaseline.modifiedAt !== currentState.modifiedAt
        || fileBaseline.size !== currentState.size;
    }

    async function checkExternalChange(): Promise<ControllerOutcome> {
      if (externalCheckInFlight || !fileBaseline || !desktopBridge || typeof desktopBridge.inspectMarkdownFile !== "function") {
        return { status: "unchanged" };
      }
      externalCheckInFlight = true;
      try {
        const currentMetadata = await desktopBridge.inspectMarkdownFile(fileBaseline.filePath);
        if (!fileMetadataChanged(currentMetadata)) return { status: "unchanged" };

        const currentState = typeof desktopBridge.verifyMarkdownFile === "function"
          ? await desktopBridge.verifyMarkdownFile(fileBaseline.filePath)
          : currentMetadata;
        if (currentState.exists && currentState.contentHash === fileBaseline.contentHash) {
          setFileBaseline(currentState);
          return { status: "unchanged" };
        }
        if (!fileStateChanged(currentState)) return { status: "unchanged" };

        if (!dialogs || typeof dialogs.confirmExternalChange !== "function") {
          return reportMissing("dialogs.confirmExternalChange");
        }
        const choice = await dialogs.confirmExternalChange();
        if (choice === "reload") {
          const reopenMarkdownFile = desktopBridge.reopenMarkdownFile;
          if (typeof reopenMarkdownFile !== "function") {
            return reportMissing("desktopBridge.reopenMarkdownFile");
          }
          const result = await reopenMarkdownFile(fileBaseline.filePath);
          if (result && typeof events.onExternalReloaded === "function") {
            await events.onExternalReloaded(result);
          }
          const nextBaseline = result && typeof result === "object" && "fileState" in result
            ? result.fileState as FileState
            : null;
          setFileBaseline(nextBaseline);
          return { result, status: "reloaded" };
        }
        if (choice === "keep") {
          setFileBaseline(currentState);
          if (typeof events.onExternalKept === "function") await events.onExternalKept(currentState);
          return { status: "kept" };
        }
        return { status: "cancelled" };
      } catch (error: unknown) {
        return reportFailure("checkExternalChange", error, "External change check failed", "The file could not be checked for external changes.");
      } finally {
        externalCheckInFlight = false;
      }
    }

    async function createNewDocument(): Promise<ControllerOutcome> {
      try {
        const confirmation = await confirmDirty(
          "Create a new document?",
          "You have unsaved changes in the current document. Creating a new document will replace the current contents.",
          "Create new"
        );
        if (confirmation.status === "unavailable") return confirmation;
        if (!confirmation.accepted) return { status: "cancelled" };
        if (typeof events.onNewDocument === "function") {
          await events.onNewDocument();
        }
        return { status: "created" };
      } catch (error: unknown) {
        return reportFailure("createNewDocument", error, "New document failed", "A new document could not be created.");
      }
    }

    return {
      cancelDraftSave,
      checkExternalChange,
      createNewDocument,
      loadDocument,
      persistDraft,
      saveDocument,
      scheduleDraftSave,
      setFileBaseline
    };
  }

  function isAbortError(error: unknown): boolean {
    return Boolean(error && typeof error === "object" && "name" in error && error.name === "AbortError");
  }

  function hasRelativeImageReferences(content: string): boolean {
    return /!\[[^\]]*\]\(\s*(?![a-z][a-z0-9+.-]*:|[\\/]|#)[^)]*\)/i.test(content || "");
  }

  return { createDocumentController };
});
