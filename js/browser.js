// /js/browser.js
(() => {
  "use strict";

  const list = document.getElementById("journalList");

  // Clipboard API: copy entry text
  if (list) {
    list.addEventListener("click", async (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;

      if (btn.dataset.action !== "copy") return;

      const article = btn.closest(".saved-entry");
      const text = article?.querySelector(".saved-text")?.textContent || "";

      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = "Copied!";
        setTimeout(() => (btn.textContent = "Copy"), 900);
      } catch {
        alert("Clipboard not available. Select and copy manually.");
      }
    });
  }

  // Notifications API (optional but strong for Lab 4)
  async function ensureNotificationPermission() {
    if (!("Notification" in window)) return false;
    if (Notification.permission === "granted") return true;
    if (Notification.permission === "denied") return false;

    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  // Show notification when an entry is saved
  document.addEventListener("journal:entrySaved", async (e) => {
    const ok = await ensureNotificationPermission();
    if (!ok) return;

    const title = e.detail?.title ? `Saved: ${e.detail.title}` : "Entry saved!";
    new Notification("Learning Journal", { body: title });
  });
})();
