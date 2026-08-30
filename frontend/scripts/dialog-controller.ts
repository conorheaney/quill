import type {
  DialogControllerOptions,
  DialogControllerPort,
  ExternalChangeChoice
} from "./contracts";

class DialogController implements DialogControllerPort {
  private readonly confirmDialog: HTMLDialogElement;
  private readonly confirmDialogTitle: HTMLElement;
  private readonly confirmDialogMessage: HTMLElement;
  private readonly confirmDialogAccept: HTMLElement;
  private readonly externalChangeDialog: HTMLDialogElement;
  private readonly externalChangeKeep: HTMLButtonElement;
  private readonly externalChangeReload: HTMLButtonElement;
  private confirmResolver: ((accepted: boolean) => void) | null = null;

  public constructor(options: DialogControllerOptions) {
    this.confirmDialog = options.confirmDialog;
    this.confirmDialogTitle = options.confirmDialogTitle;
    this.confirmDialogMessage = options.confirmDialogMessage;
    this.confirmDialogAccept = options.confirmDialogAccept;
    this.externalChangeDialog = options.externalChangeDialog;
    this.externalChangeKeep = options.externalChangeKeep;
    this.externalChangeReload = options.externalChangeReload;
  }

  public open(title: string, message: string, acceptLabel = "Continue"): Promise<boolean> {
    this.confirmDialogTitle.textContent = title;
    this.confirmDialogMessage.textContent = message;
    this.confirmDialogAccept.textContent = acceptLabel.toUpperCase();

    return new Promise<boolean>((resolve) => {
      this.confirmResolver = resolve;
      if (typeof this.confirmDialog.showModal === "function") {
        this.confirmDialog.showModal();
      } else {
        this.confirmDialog.setAttribute("open", "open");
      }
    });
  }

  public close(accepted: boolean): void {
    this.confirmResolver?.(accepted);
    this.confirmResolver = null;

    if (typeof this.confirmDialog.close === "function") {
      this.confirmDialog.close();
    } else {
      this.confirmDialog.removeAttribute("open");
    }
  }

  public confirmExternalChange(): Promise<ExternalChangeChoice> {
    return new Promise<ExternalChangeChoice>((resolve) => {
      const finish = (choice: ExternalChangeChoice): void => {
        if (typeof this.externalChangeDialog.close === "function") {
          this.externalChangeDialog.close();
        }
        this.externalChangeDialog.removeAttribute("open");
        resolve(choice);
      };

      this.externalChangeKeep.onclick = () => finish("keep");
      this.externalChangeReload.onclick = () => finish("reload");
      if (typeof this.externalChangeDialog.showModal === "function") {
        this.externalChangeDialog.showModal();
      } else {
        this.externalChangeDialog.setAttribute("open", "open");
      }
    });
  }
}

window.QuillDialogs = {
  createDialogController: (options: DialogControllerOptions): DialogControllerPort => new DialogController(options)
};

