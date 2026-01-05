// /js/thirdparty.js
(() => {
  "use strict";

  const quoteText = document.getElementById("quoteText");
  const quoteBtn = document.getElementById("newQuoteBtn");

  // Local fallback (works even if the API is blocked)
  const FALLBACK_QUOTES = [
    "Small progress is still progress.",
    "Consistency beats intensity.",
    "Done is better than perfect.",
    "One step at a time.",
    "Make it work, make it right, make it fast.",
  ];

  function setQuote(text) {
    if (!quoteText) return;
    quoteText.textContent = text;
  }

  function randomFallback() {
    const i = Math.floor(Math.random() * FALLBACK_QUOTES.length);
    return FALLBACK_QUOTES[i];
  }

  async function loadQuote() {
    if (!quoteText) return;

    setQuote("Loading quote...");

    // ✅ Use a reliable endpoint (CORS-friendly)
    const url = "https://zenquotes.io/api/random";

    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      // zenquotes returns: [{ q: "quote", a: "author" }]
      const q = data?.[0]?.q;
      const a = data?.[0]?.a;

      if (!q) throw new Error("No quote returned");
      setQuote(`"${q}" — ${a || "Unknown"}`);
    } catch (err) {
      // If blocked/offline, still show something (and your lab still demonstrates integration)
      setQuote(randomFallback() + " (offline fallback)");
      console.warn("Quote API failed:", err);
    }
  }

  if (quoteBtn) quoteBtn.addEventListener("click", loadQuote);
  loadQuote();
})();
