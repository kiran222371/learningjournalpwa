// /js/thirdparty.js
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
    "One step at a time."
  ];

  function setQuote(text) {
    if (quoteText) quoteText.textContent = text;
  }

  function randomFallback() {
    return FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
  }

  async function loadQuote() {
    setQuote("Loading quote...");

    try {
      // Reliable third-party API
      const res = await fetch("https://zenquotes.io/api/random", {
        cache: "no-store"
      });

      if (!res.ok) throw new Error("Bad response");

      const data = await res.json();
      const quote = data?.[0]?.q;
      const author = data?.[0]?.a;

      if (!quote) throw new Error("Invalid data");

      setQuote(`"${quote}" — ${author}`);
    } catch (err) {
      // Graceful fallback
      setQuote(randomFallback() + " (offline fallback)");
      console.warn("Third-party API failed:", err);
    }
  }

  if (quoteBtn) quoteBtn.addEventListener("click", loadQuote);
  loadQuote();
})();
