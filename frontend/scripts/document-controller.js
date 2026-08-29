(function (root, factory) {
  const api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.QuillDocumentController = api;
  }
})(typeof window === "undefined" ? null : window, () => {
  function createDocumentController(options) {
    const dependencies = options || {};
    const desktopBridge = dependencies.desktopBridge || null;
    const storage = dependencies.storage || null;
    const clock = dependencies.clock || null;
    const dialogs = dependencies.dialogs || null;
    const documentPort = dependencies.document || null;
    const events = dependencies.events || {};
    const draftDelay = Number.isFinite(dependencies.draftDelay) ? dependencies.draftDelay : 220;
    let draftTimer = null;
    let fileBaseline = null;
    let externalCheckInFlight = false;

    function reportMissing(name) {
      if (typeof events.onMissingDependency === "function") {
        events.onMissingDependency(name);
      }
      return { dependency: name, status: "unavailable" };
    }

    function reportFailure(operation, error, toastTitle, toastMessage) {
      if (typeof events.onError === "function") {
        events.onError(operation, error);
      }
      if (toastTitle && typeof events.showToast === "function") {
        events.showToast(toastTitle, toastMessage || "");
      }
      return { error, operation, status: "failed" };
    }

    function cancelDraftSave() {
      if (draftTimer !== null && clock && typeof clock.clearTimeout === "function") {
        clock.clearTimeout(draftTimer);
      }
      draftTimer = null;
    }

    function persistDraft(showStatusToast) {
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

    function scheduleDraftSave(showStatusToast) {
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

    async function confirmDirty(title, message, acceptLabel) {
      if (!dialogs || typeof dialogs.confirmIfDirty !== "function") {
        return reportMissing("dialogs.confirmIfDirty");
      }
      return { accepted: await dialogs.confirmIfDirty(title, message, acceptLabel), status: "ready" };
    }

    async function loadDocument() {
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
      } catch (error) {
        if (error && error.name === "AbortError") return { status: "cancelled" };
        return reportFailure("loadDocument", error, "Load failed", "The selected file could not be opened.");
      }
    }

    async function saveDocument(saveAs) {
      if (!desktopBridge || typeof desktopBridge.saveMarkdownFile !== "function") {
        return reportMissing("desktopBridge.saveMarkdownFile");
      }
      if (!documentPort || typeof documentPort.getContent !== "function" || typeof documentPort.getFileIdentity !== "function") {
        return reportMissing("document");
      }

      const identity = documentPort.getFileIdentity() || {};
      const useSaveAs = Boolean(saveAs);

      try {
        const result = await desktopBridge.saveMarkdownFile({
          content: documentPort.getContent(),
          filePath: useSaveAs ? "" : identity.filePath || "",
          saveAs: useSaveAs,
          suggestedName: identity.fileName || "document.md"
        });
        if (!result) return { status: "cancelled" };
        if (typeof events.onSaved === "function") {
          await events.onSaved(result, { saveAs: useSaveAs });
        }
        return { result, status: "saved" };
      } catch (error) {
        if (error && error.name === "AbortError") return { status: "cancelled" };
        return reportFailure("saveDocument", error, "Save failed", "The document could not be saved.");
      }
    }

    function setFileBaseline(nextBaseline) {
      fileBaseline = nextBaseline && nextBaseline.filePath ? { ...nextBaseline } : null;
    }

    function fileStateChanged(currentState) {
      if (!fileBaseline || !currentState) return false;
      return fileBaseline.filePath !== currentState.filePath
        || fileBaseline.exists !== currentState.exists
        || fileBaseline.modifiedAt !== currentState.modifiedAt
        || fileBaseline.size !== currentState.size
        || fileBaseline.contentHash !== currentState.contentHash;
    }

    function fileMetadataChanged(currentState) {
      if (!fileBaseline || !currentState) return false;
      return fileBaseline.filePath !== currentState.filePath
        || fileBaseline.exists !== currentState.exists
        || fileBaseline.modifiedAt !== currentState.modifiedAt
        || fileBaseline.size !== currentState.size;
    }

    async function checkExternalChange() {
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
          const result = await desktopBridge.reopenMarkdownFile(fileBaseline.filePath);
          if (result && typeof events.onExternalReloaded === "function") {
            await events.onExternalReloaded(result);
          }
          setFileBaseline(result && result.fileState);
          return { result, status: "reloaded" };
        }
        if (choice === "keep") {
          setFileBaseline(currentState);
          if (typeof events.onExternalKept === "function") await events.onExternalKept(currentState);
          return { status: "kept" };
        }
        return { status: "cancelled" };
      } catch (error) {
        return reportFailure("checkExternalChange", error, "External change check failed", "The file could not be checked for external changes.");
      } finally {
        externalCheckInFlight = false;
      }
    }

    async function createNewDocument() {
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
      } catch (error) {
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

  return { createDocumentController };
});
