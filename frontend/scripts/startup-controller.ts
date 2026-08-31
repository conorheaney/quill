import type { StartupControllerPort } from "./contracts";

const MIN_STARTUP_DURATION_MS = 5000;

const startupController: StartupControllerPort = (() => {
  const startedAt = Date.now();
  const overlay = document.getElementById("startupOverlay");
  const message = document.getElementById("startupMessage");
  const error = document.getElementById("startupError");
  const retry = document.getElementById("startupRetry");

  function setReady(): void {
    if (!overlay) return;
    const elapsed = Date.now() - startedAt;
    const remaining = Math.max(0, MIN_STARTUP_DURATION_MS - elapsed);
    window.setTimeout(() => {
      overlay.dataset.state = "ready";
      overlay.setAttribute("aria-hidden", "true");
      window.setTimeout(() => overlay.remove(), 220);
    }, remaining);
  }

  function showFailure(): void {
    if (!overlay) return;
    overlay.dataset.state = "failed";
    overlay.removeAttribute("aria-hidden");
    if (message) message.hidden = true;
    if (error) error.hidden = false;
    if (retry) {
      retry.hidden = false;
      retry.addEventListener("click", () => window.location.reload(), { once: true });
      retry.focus();
    }
  }

  return { setReady, showFailure };
})();

window.QuillStartup = startupController;
