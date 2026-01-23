// static/js/script.js
document.addEventListener("DOMContentLoaded", () => {
  /* -------------------------
     1) Reusable navigation HTML
     --------------------------*/
  const navHTML = `
    <a href="/">Home</a>
    <a href="/journal">Journal</a>
    <a href="/projects">Projects</a>
    <a href="/tracker">Tracker</a>
    <a href="/about">About</a>
  `;

  // Support both IDs: #nav (new) and #nav-placeholder (older pages)
  const navEl =
    document.getElementById("nav") || document.getElementById("nav-placeholder");

  if (navEl) {
    navEl.innerHTML = navHTML;
  }

  /* -------------------------
     2) Mark active link based on current path
     Works with routes like "/", "/journal", "/tracker"
     --------------------------*/
  try {
    if (navEl) {
      const links = navEl.querySelectorAll("a");
      const currentPath = window.location.pathname; // e.g. "/tracker"

      links.forEach((link) => {
        const href = link.getAttribute("href"); // e.g. "/tracker"
        // active when exact match, also treat "/" specially
        const isActive =
          (href === "/" && currentPath === "/") ||
          (href !== "/" && currentPath.startsWith(href));

        if (isActive) link.classList.add("active");
        else link.classList.remove("active");
      });
    }
  } catch (e) {
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
