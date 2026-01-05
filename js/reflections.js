async function loadReflections() {
  const container = document.getElementById("reflectionsList");
  const count = document.getElementById("reflectionCount");


  try {
    const res = await fetch("backend/reflections.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const entries = await res.json();
    if (count) count.textContent = entries.length;


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

      const text = document.createElement("div");
      text.className = "reflection-text";
      text.textContent = entry.text || "";

      item.appendChild(date);
      item.appendChild(text);
      container.appendChild(item);
    });
  } catch (err) {
    console.error(err);
    container.textContent = "Could not load reflections.";
  }
}

document.addEventListener("DOMContentLoaded", loadReflections);
