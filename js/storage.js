// js/storage.js
(() => {
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
      <article class="saved-entry" data-id="${e.id}">
        <h4>${e.title}</h4>
        <p class="saved-text">${e.text}</p>
        <div class="entry-actions">
          <button class="btn copy" data-action="copy">Copy</button>
          <button class="btn danger" data-action="delete">Delete</button>
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
      const title = titleInput.value;
      const text = textInput.value;
      if (!title || !text) return;

      addEntry(title, text);
      form.reset();
      titleInput.focus();
    });
  }

  if (clearAllBtn) {
    clearAllBtn.addEventListener("click", () => {
      if (confirm("Delete ALL saved entries?")) {
        setEntries([]);
        render();
      }
    });
  }

  if (list) {
    list.addEventListener("click", async (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;

      const article = btn.closest(".saved-entry");
      const id = article?.dataset?.id;
      const action = btn.dataset.action;

      if (action === "delete" && id) {
        deleteEntry(id);
      }

      if (action === "copy") {
        const text = article.querySelector(".saved-text")?.textContent || "";
        try {
          await navigator.clipboard.writeText(text);
          btn.textContent = "Copied!";
          setTimeout(() => (btn.textContent = "Copy"), 900);
        } catch {
          alert("Clipboard not available. Select and copy manually.");
        }
      }
    });
  }

  // Initial render
  render();
})();
