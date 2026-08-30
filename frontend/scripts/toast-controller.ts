import type { ToastControllerOptions, ToastControllerPort, ToastOptions } from "./contracts";

class ToastController implements ToastControllerPort {
  private readonly toastStack: HTMLElement;
  private readonly escapeHtml: (value: string) => string;
  private readonly hideTimers = new Map<HTMLElement, number>();

  public constructor(options: ToastControllerOptions) {
    this.toastStack = options.toastStack;
    this.escapeHtml = options.escapeHtml;
  }

  public show(title: string, message: string, options: ToastOptions = {}): void {
    const duration = options.duration === undefined ? 2600 : options.duration;
    const toastId = options.id || "";
    let toast = toastId ? this.toastStack.querySelector<HTMLElement>(`[data-toast-id="${toastId}"]`) : null;

    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      if (toastId) {
        toast.dataset.toastId = toastId;
      }
      this.toastStack.appendChild(toast);
    }

    const previousTimer = this.hideTimers.get(toast);
    if (previousTimer !== undefined) {
      window.clearTimeout(previousTimer);
      this.hideTimers.delete(toast);
    }

    toast.innerHTML = `<strong class="toast-title">${this.escapeHtml(title)}</strong>${message ? `<span>${this.escapeHtml(message)}</span>` : ""}`;
    toast.classList.remove("is-visible");
    window.requestAnimationFrame(() => toast?.classList.add("is-visible"));

    if (duration > 0) {
      const hideTimer = window.setTimeout(() => {
        toast?.classList.remove("is-visible");
        window.setTimeout(() => {
          if (toast?.parentElement) {
            toast.remove();
          }
          if (toast) {
            this.hideTimers.delete(toast);
          }
        }, 220);
      }, duration);
      this.hideTimers.set(toast, hideTimer);
    }
  }
}

const toastController = {
  create(options: ToastControllerOptions): ToastControllerPort {
    return new ToastController(options);
  }
};

window.QuillToast = toastController;
