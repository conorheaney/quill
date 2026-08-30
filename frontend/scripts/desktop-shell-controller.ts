import type { DesktopShellControllerOptions, DesktopShellControllerPort } from "./contracts";

const REQUIRED_METHODS = [
  "getAppVersion",
  "inspectMarkdownFile",
  "openMarkdownFile",
  "readImageDataUrl",
  "reopenMarkdownFile",
  "revealInExplorer",
  "saveMarkdownFile"
] as const;

class DesktopShellController implements DesktopShellControllerPort {
  private readonly desktopBridge: DesktopShellControllerOptions["desktopBridge"];
  private readonly fileButtons: HTMLButtonElement[];
  private readonly versionLabel: HTMLElement | null;
  private readonly showToast: DesktopShellControllerOptions["showToast"];
  private readonly missingMethods: string[];

  public constructor(options: DesktopShellControllerOptions) {
    this.desktopBridge = options.desktopBridge;
    this.fileButtons = options.fileButtons;
    this.versionLabel = options.versionLabel;
    this.showToast = options.showToast;
    this.missingMethods = REQUIRED_METHODS.filter((methodName) => typeof this.desktopBridge?.[methodName] !== "function");
  }

  public get isReady(): boolean {
    return this.missingMethods.length === 0;
  }

  public configureFileControls(): void {
    this.fileButtons.forEach((button) => {
      button.disabled = !this.isReady;
    });

    if (!this.isReady) {
      this.showToast("Quill desktop app required", "File actions are unavailable outside the packaged desktop app.", { duration: 0 });
      console.error("Quill desktop bridge is incomplete", this.missingMethods);
    }
  }

  public async loadProductVersion(): Promise<void> {
    if (!this.versionLabel) {
      return;
    }

    if (!this.isReady || typeof this.desktopBridge?.getAppVersion !== "function") {
      this.versionLabel.hidden = true;
      return;
    }

    try {
      const version = await this.desktopBridge.getAppVersion();
      if (!version) {
        this.versionLabel.hidden = true;
        return;
      }

      this.versionLabel.textContent = `Version ${version}`;
      this.versionLabel.hidden = false;
    } catch (error) {
      console.error("Unable to load the desktop product version", error);
      this.versionLabel.hidden = true;
    }
  }
}

window.QuillDesktopShell = {
  create(options: DesktopShellControllerOptions): DesktopShellControllerPort {
    return new DesktopShellController(options);
  }
};
