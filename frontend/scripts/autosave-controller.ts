import type { AutosaveControllerOptions, AutosaveControllerPort } from "./contracts";

class AutosaveController implements AutosaveControllerPort {
  private readonly toggleButton: HTMLButtonElement;
  private readonly getPreference: () => string | null;
  private readonly savePreference: (enabled: boolean) => void;
  private readonly cancelDraftSave: () => void;
  private readonly persistDraft: () => unknown;
  private readonly showToast: (title: string, message: string) => void;
  private enabled = true;

  public constructor(options: AutosaveControllerOptions) {
    this.toggleButton = options.toggleButton;
    this.getPreference = options.getPreference;
    this.savePreference = options.savePreference;
    this.cancelDraftSave = options.cancelDraftSave;
    this.persistDraft = options.persistDraft;
    this.showToast = options.showToast;
  }

  public get isEnabled(): boolean {
    return this.enabled;
  }

  public initialise(): void {
    this.set(this.getPreference() !== "false");
  }

  public set(enabled: boolean, persistImmediately = false): void {
    this.enabled = enabled;
    this.savePreference(enabled);
    this.updateUi();

    if (!enabled) {
      this.cancelDraftSave();
      return;
    }

    if (persistImmediately) {
      this.persistDraft();
    }
  }

  public toggle(): void {
    const nextEnabled = !this.enabled;
    this.set(nextEnabled, nextEnabled);
    this.showToast(
      nextEnabled ? "Autosave on" : "Autosave off",
      nextEnabled ? "Local draft saving has resumed." : "Local draft saving is paused until you turn it back on."
    );
  }

  private updateUi(): void {
    this.toggleButton.setAttribute("aria-checked", this.enabled ? "true" : "false");
    this.toggleButton.setAttribute("title", this.enabled ? "AUTOSAVE ENABLED" : "AUTOSAVE DISABLED");
  }
}

window.QuillAutosave = {
  create(options: AutosaveControllerOptions): AutosaveControllerPort {
    return new AutosaveController(options);
  }
};
