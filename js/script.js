// js/script.js
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      toggle.classList.toggle("active");
      nav.classList.toggle("active");

      // small visual "tap" animation
      toggle.classList.add("tapped");
      setTimeout(() => toggle.classList.remove("tapped"), 150);
    });
  }
});
