import { emitTo, listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";

const overlay = document.getElementById("startupOverlay");
const message = document.getElementById("startupMessage");
const error = document.getElementById("startupError");
const retry = document.getElementById("startupRetry") as HTMLButtonElement | null;

function showFailure(): void {
  overlay?.setAttribute("data-state", "failed");
  if (message) message.hidden = true;
  if (error) error.hidden = false;
  if (retry) {
    retry.hidden = false;
    retry.focus();
  }
}

void getCurrentWindow().listen("startup-failed", showFailure);
void emitTo("main", "splash-ready");

retry?.addEventListener("click", () => {
  retry.disabled = true;
  void emitTo("main", "startup-retry");
});
