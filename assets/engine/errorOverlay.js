// Global error overlay — every uncaught error surfaces here, centered, in text.
const overlay = () => document.getElementById("errorOverlay");
const detailEl = () => document.getElementById("errDetail");

export function showError(title, detail = "") {
  const o = overlay();
  if (!o) { console.error(title, detail); return; }
  detailEl().textContent = detail ? `${title}\n${detail}` : title;
  o.classList.add("show");
}

export function installErrorOverlay() {
  document.getElementById("errDismiss").addEventListener("click", () => {
    overlay().classList.remove("show");
  });
  window.addEventListener("error", e => {
    showError("Runtime error", e.message + (e.error?.stack ? "\n" + e.error.stack.split("\n").slice(0,3).join("\n") : ""));
  });
  window.addEventListener("unhandledrejection", e => {
    showError("Unhandled rejection", String(e.reason?.message || e.reason));
  });
}
