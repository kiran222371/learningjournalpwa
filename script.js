// script.js (GitHub Pages / static)
document.addEventListener("DOMContentLoaded", () => {
  /* -------------------------
     1) Reusable navigation HTML (GitHub Pages)
     --------------------------*/
  const navHTML = `
    <a href="./index.html">Home</a>
    <a href="./journal.html">Journal</a>
    <a href="./projects.html">Projects</a>
    <a href="./tracker.html">Tracker</a>
    <a href="./about.html">About</a>
  `;

  // Support both IDs: #nav (new) and #nav-placeholder (older pages)
  const navEl =
    document.getElementById("nav") || document.getElementById("nav-placeholder");

  if (navEl) {
    navEl.innerHTML = navHTML;
  }

  /* -------------------------
     2) Mark active link based on current page (GitHub Pages)
     --------------------------*/
  try {
    if (navEl) {
      const links = navEl.querySelectorAll("a");

      // e.g. "/learningjournalpwa/journal.html"
      const currentFile = (window.location.pathname.split("/").pop() || "").toLowerCase();

      // Normalize: treat "" as index.html
      const currentPage = currentFile === "" ? "index.html" : currentFile;

      links.forEach((link) => {
        const href = (link.getAttribute("href") || "").toLowerCase();
        const hrefFile = href.split("/").pop(); // "journal.html"

        const isActive = hrefFile === currentPage;

        if (isActive) link.classList.add("active");
        else link.classList.remove("active");
      });
    }
  } catch {
    // fail silently
  }

  /* -------------------------
     3) Hamburger toggle behavior & tap animation
     --------------------------*/
  const toggle = document.querySelector(".menu-toggle");

  if (toggle && navEl) {
    toggle.addEventListener("click", () => {
      toggle.classList.toggle("active");
      navEl.classList.toggle("active");

      toggle.classList.add("tapped");
      setTimeout(() => toggle.classList.remove("tapped"), 150);
    });

    // Close the menu when a nav link is clicked (mobile UX)
    navEl.addEventListener("click", (e) => {
      const target = e.target;
      if (target && target.tagName === "A" && navEl.classList.contains("active")) {
        toggle.classList.remove("active");
        navEl.classList.remove("active");
      }
    });
  }

  /* -------------------------
     4) Live Date & Time Display
     --------------------------*/
  const dateTimeEl = document.getElementById("liveDateTime");

  if (dateTimeEl) {
    function updateDateTime() {
      const now = new Date();
      const formatted = now.toLocaleString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      dateTimeEl.textContent = `📅 ${formatted}`;
    }

    updateDateTime();
    setInterval(updateDateTime, 1000);
  }

  /* -------------------------
     5) Theme Switcher (Light/Dark Mode)
     Standardize button id: themeToggle
     --------------------------*/
  const themeToggle =
    document.getElementById("themeToggle") || document.getElementById("theme-toggle");

  if (themeToggle) {
    // Apply saved theme
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.body.classList.add("dark-mode");
      themeToggle.textContent = "☀️";
    } else {
      themeToggle.textContent = "🌙";
    }

    // Toggle theme on click
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
      const isDark = document.body.classList.contains("dark-mode");

      themeToggle.textContent = isDark ? "☀️" : "🌙";
      localStorage.setItem("theme", isDark ? "dark" : "light");
    });
  }
});
