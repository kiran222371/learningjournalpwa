// js/script.js
document.addEventListener("DOMContentLoaded", () => {
  /* -------------------------
     1) Reusable navigation HTML
     --------------------------*/
  const navHTML = `
    <a href="index.html">Home</a>
    <a href="journal.html">Journal</a>
    <a href="projects.html">Projects</a>
    <a href="about.html">About</a>
  `;

  const navPlaceholder = document.getElementById("nav-placeholder");
  if (navPlaceholder) {
    navPlaceholder.innerHTML = navHTML;
  }

  /* -------------------------
     2) Mark active link based on current path
     --------------------------*/
  try {
    const links = navPlaceholder.querySelectorAll("a");
    const path = window.location.pathname.split("/").pop() || "index.html";
    links.forEach(link => {
      const href = link.getAttribute("href");
      if (href === path) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  } catch (e) {
    // fail silently if navPlaceholder not found or other issues
  }

  /* -------------------------
     3) Hamburger toggle behavior & tap animation
     --------------------------*/
  const toggle = document.querySelector(".menu-toggle");
  const nav = navPlaceholder; // our injected nav

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      toggle.classList.toggle("active");
      nav.classList.toggle("active");

      // small visual "tap" animation
      toggle.classList.add("tapped");
      setTimeout(() => toggle.classList.remove("tapped"), 150);
    });

    // Close the menu when a nav link is clicked (mobile UX)
    nav.addEventListener("click", (e) => {
      const target = e.target;
      if (target.tagName === "A" && nav.classList.contains("active")) {
        toggle.classList.remove("active");
        nav.classList.remove("active");
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

    updateDateTime(); // show immediately
    setInterval(updateDateTime, 1000); // update every second
  }

  /* -------------------------
     5) Theme Switcher (Light/Dark Mode)
     --------------------------*/
  const themeToggle = document.getElementById("theme-toggle");

  if (themeToggle) {
    // Check saved theme in localStorage
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.body.classList.add("dark-mode");
      themeToggle.textContent = "☀️";
    }

    // Toggle theme on click
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");

      // Update button icon and save preference
      if (document.body.classList.contains("dark-mode")) {
        themeToggle.textContent = "☀️";
        localStorage.setItem("theme", "dark");
      } else {
        themeToggle.textContent = "🌙";
        localStorage.setItem("theme", "light");
      }
    });
  }
});
