// /js/storage.js
(() => {
  "use strict";

  const STORAGE_KEY = "journalEntries";

  // Elements
  const form = document.getElementById("journalForm");
  const titleInput = document.getElementById("entryTitle");
  const textInput = document.getElementById("entryText");
  const list = document.getElementById("journalList");
  const clearAllBtn = document.getElementById("clearAll");

  // Helpers
  const getEntries = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  };

  const setEntries = (entries) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  };

  const escapeHTML = (s) =>
    String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const render = () => {
    if (!list) return;

    const entries = getEntries();
    if (entries.length === 0) {
      list.innerHTML = `<p>No saved entries yet.</p>`;
      return;
    }

    list.innerHTML = entries
      .map(
        (e) => `
        <article class="saved-entry" data-id="${escapeHTML(e.id)}">
          <h4>${escapeHTML(e.title)}</h4>
          <p class="saved-text">${escapeHTML(e.text)}</p>

          <div class="entry-actions">
            <button type="button" class="btn copy" data-action="copy">Copy</button>
            <button type="button" class="btn danger" data-action="delete">Delete</button>
          </div>

          <small class="meta">Saved: ${new Date(e.date).toLocaleString("en-GB")}</small>
        </article>
      `
      )
      .join("");
  };

  const addEntry = (title, text) => {
    const entries = getEntries();

    const newEntry = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      title: title.trim(),
      text: text.trim(),
      date: new Date().toISOString(),
    };

    entries.unshift(newEntry);
    setEntries(entries);
    render();

    // Notify other scripts (Browser API can listen to this)
    document.dispatchEvent(new CustomEvent("journal:entrySaved", { detail: newEntry }));
  };

  const deleteEntry = (id) => {
    const next = getEntries().filter((e) => e.id !== id);
    setEntries(next);
    render();
  };

  // Events
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const title = titleInput?.value || "";
      const text = textInput?.value || "";

      if (!title.trim() || !text.trim()) return;

      addEntry(title, text);

      form.reset();
      titleInput?.focus();
    });
  }

  if (clearAllBtn) {
    clearAllBtn.addEventListener("click", () => {
      if (confirm("Delete ALL saved entries?")) {
        setEntries([]);
        render();
        document.dispatchEvent(new CustomEvent("journal:cleared"));
      }
    });
  }

  // Only DELETE happens here (copy is Browser API)
  if (list) {
    list.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;

      const article = btn.closest(".saved-entry");
      const id = article?.dataset?.id;
      const action = btn.dataset.action;

      if (action === "delete" && id) {
        deleteEntry(id);
      }
    });
  }

  render();
})();
