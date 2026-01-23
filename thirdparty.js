
(() => {
  "use strict";

  const quoteText = document.getElementById("quoteText");
  const quoteBtn = document.getElementById("newQuoteBtn");

  // Fallback quotes (always works)
  const FALLBACK_QUOTES = [
    "Small progress is still progress.",
    "Consistency beats intensity.",
    "Done is better than perfect.",
    "Learning never exhausts the mind.",
    "One step at a time.",
  ];

  function setQuote(text) {
    if (quoteText) quoteText.textContent = text;
  }

  function randomFallback() {
    return FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
  }

  async function fetchWithTimeout(url, options = {}, ms = 5000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);

    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      return res;
    } finally {
      clearTimeout(timer);
    }
  }

  async function loadQuote() {
    setQuote("Loading quote...");

    try {
      // Third-party API
      const res = await fetchWithTimeout("https://zenquotes.io/api/random", { cache: "no-store" }, 6000);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const quote = data?.[0]?.q;
      const author = data?.[0]?.a;

      if (!quote) throw new Error("Invalid quote data");

      const by = author ? ` — ${author}` : "";
      setQuote(`"${quote}"${by}`);
    } catch (err) {
      // Graceful fallback
      setQuote(`${randomFallback()} (offline fallback)`);
      console.warn("Third-party API failed:", err);
    }
  }

  if (quoteBtn) quoteBtn.addEventListener("click", loadQuote);
  loadQuote();
})();
