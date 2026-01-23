// --------------------
// Load reflections from Flask
// --------------------
async function loadReflections() {
  const container = document.getElementById("reflectionsList");
  const count = document.getElementById("reflectionCount");

  if (!container) return;

  try {
    const res = await fetch("/reflections", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const entries = await res.json();

    if (count) count.textContent = Array.isArray(entries) ? entries.length : 0;

    if (!Array.isArray(entries) || entries.length === 0) {
      container.textContent = "No reflections yet.";
      return;
    }

    container.innerHTML = "";

    // show newest first
    entries.slice().reverse().forEach((entry) => {
      const item = document.createElement("div");
      item.className = "reflection-item";

      const date = document.createElement("div");
      date.className = "reflection-date";
      date.textContent = entry.date || "";

      const name = document.createElement("div");
      name.className = "reflection-name";
      name.textContent = entry.name ? `By: ${entry.name}` : "";

      const text = document.createElement("div");
      text.className = "reflection-text";
      text.textContent = entry.reflection || entry.text || "";

      item.appendChild(date);
      if (entry.name) item.appendChild(name);
      item.appendChild(text);

      container.appendChild(item);
    });
  } catch (err) {
    console.error(err);
    container.textContent = "Could not load reflections.";
  }
}

// --------------------
// Submit reflection to Flask
// (Matches your page labels: Title + Reflection)
// --------------------
async function submitReflection(event) {
  if (event) event.preventDefault();

  // Your page shows "Title" and "Reflection"
  // So we look for common IDs used in journals:
  const nameEl =
    document.getElementById("title") ||
    document.getElementById("fname") ||
    document.getElementById("name") ||
    document.getElementById("entryTitle");

  const reflectionEl =
    document.getElementById("reflectionText") ||
    document.getElementById("reflection") ||
    document.getElementById("entryText") ||
    document.getElementById("journalEntry");

  if (!nameEl || !reflectionEl) {
    alert(
      "Could not find your input fields. Make sure your Title input has id='title' and Reflection textarea has id='reflectionText'."
    );
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

  // Backend expects: { name, reflection }
  const entry = { name, reflection };

  try {
    const res = await fetch("/add_reflection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.error || "Failed to submit reflection.");
      return false;
    }

    // clear form and reload list
    nameEl.value = "";
    reflectionEl.value = "";
    await loadReflections();
  } catch (err) {
    console.error(err);
    alert("Network error submitting reflection.");
  }

  return false;
}

// --------------------
// Hook the correct button (NOT the first form on the page)
// --------------------
document.addEventListener("DOMContentLoaded", () => {
  loadReflections();

  // Your page has a "Save Entry" button.
  // We hook by button text if no specific ID exists.
  const buttons = Array.from(document.querySelectorAll("button, input[type='submit']"));

  const saveBtn =
    document.getElementById("saveEntryBtn") ||
    buttons.find((b) => (b.textContent || b.value || "").trim().toLowerCase() === "save entry");

  if (saveBtn) {
    saveBtn.addEventListener("click", submitReflection);
  }
});
