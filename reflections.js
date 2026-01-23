

(() => {
  "use strict";

  const STORAGE_KEY = "learningJournalReflections_v1";

  function $(id) {
    return document.getElementById(id);
  }

  function safeText(v) {
    return typeof v === "string" ? v : "";
  }

  function formatDate(d = new Date()) {
    // ISO date: YYYY-MM-DD
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function readLocalReflections() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data : null;
    } catch {
      return null;
    }
  }

  function writeLocalReflections(entries) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }

  function normalizeEntry(entry) {
    // Support old fields: {text} vs {reflection}
    return {
      id: entry.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: safeText(entry.name),
      reflection: safeText(entry.reflection || entry.text),
      date: safeText(entry.date) || formatDate(),
    };
  }

  async function loadInitialFromJsonIfNeeded() {
    // If user already has local reflections, keep them.
    const local = readLocalReflections();
    if (local && local.length) return local;

    // Otherwise try to load reflections.json from repo root
    try {
      const res = await fetch("./reflections.json", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const entries = await res.json();

      const normalized = Array.isArray(entries) ? entries.map(normalizeEntry) : [];
      writeLocalReflections(normalized);
      return normalized;
    } catch (err) {
      console.warn("Could not load reflections.json:", err);
      writeLocalReflections([]);
      return [];
    }
  }

  function renderReflections(entries) {
    const container = $("reflectionsList");
    const count = $("reflectionCount");
    if (!container) return;

    const list = Array.isArray(entries) ? entries : [];
    if (count) count.textContent = String(list.length);

    if (list.length === 0) {
      container.textContent = "No reflections yet.";
      return;
    }

    container.innerHTML = "";

    // Newest first
    list.slice().reverse().forEach((entry) => {
      const item = document.createElement("div");
      item.className = "reflection-item";
      item.dataset.id = entry.id;

      const date = document.createElement("div");
      date.className = "reflection-date";
      date.textContent = entry.date || "";

      const name = document.createElement("div");
      name.className = "reflection-name";
      name.textContent = entry.name ? `By: ${entry.name}` : "";

      const text = document.createElement("div");
      text.className = "reflection-text";
      text.textContent = entry.reflection || "";

      // Optional delete button (local only)
      const actions = document.createElement("div");
      actions.className = "reflection-actions";
      const del = document.createElement("button");
      del.type = "button";
      del.className = "btn danger";
      del.textContent = "Delete";
      del.dataset.action = "delete";
      del.dataset.id = entry.id;
      actions.appendChild(del);

      item.appendChild(date);
      if (entry.name) item.appendChild(name);
      item.appendChild(text);
      item.appendChild(actions);

      container.appendChild(item);
    });
  }

  async function loadReflections() {
    const entries = await loadInitialFromJsonIfNeeded();
    renderReflections(entries);
  }

  function findInputs() {
    
    const nameEl =
      $("title") ||
      $("fname") ||
      $("name") ||
      $("entryTitle");

    const reflectionEl =
      $("reflectionText") ||
      $("reflection") ||
      $("entryText") ||
      $("journalEntry");

    return { nameEl, reflectionEl };
  }

  function submitReflection(event) {
    if (event) event.preventDefault();

    const { nameEl, reflectionEl } = findInputs();

    if (!nameEl || !reflectionEl) {
      alert("Could not find input fields. Make sure Title uses id='entryTitle' and Reflection uses id='entryText'.");
      return false;
    }

    const name = nameEl.value.trim();
    const reflection = reflectionEl.value.trim();

    if (!name) {
      alert("Please enter a title (or name).");
      return false;
    }

    if (reflection.length < 10) {
      alert("Reflection must be at least 10 characters.");
      return false;
    }

    const current = readLocalReflections() || [];
    const newEntry = normalizeEntry({ name, reflection, date: formatDate() });

    current.push(newEntry);
    writeLocalReflections(current);

    // clear + re-render
    nameEl.value = "";
    reflectionEl.value = "";

    renderReflections(current);
    return false;
  }

  function deleteReflectionById(id) {
    const current = readLocalReflections() || [];
    const next = current.filter((x) => x.id !== id);
    writeLocalReflections(next);
    renderReflections(next);
  }

  document.addEventListener("DOMContentLoaded", async () => {
    await loadReflections();

    // Hook form submit if available
    const form = document.getElementById("journalForm");
    if (form) form.addEventListener("submit", submitReflection);

    // Also hook "Save Entry" button if it exists
    const saveBtn = document.getElementById("saveEntryBtn");
    if (saveBtn) saveBtn.addEventListener("click", submitReflection);

    // Delete handler (event delegation)
    const container = $("reflectionsList");
    if (container) {
      container.addEventListener("click", (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;
        if (btn.dataset.action !== "delete") return;

        const id = btn.dataset.id;
        if (!id) return;

        if (confirm("Delete this reflection? (This only removes it from your browser)")) {
          deleteReflectionById(id);
        }
      });
    }
  });
})();
