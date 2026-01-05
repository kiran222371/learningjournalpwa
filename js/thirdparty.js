// /js/thirdparty.js
(() => {
  "use strict";

  const quoteText = document.getElementById("quoteText");
  const quoteBtn = document.getElementById("newQuoteBtn");

  async function loadQuote() {
    if (!quoteText) return;

    quoteText.textContent = "Loading quote...";

    try {
      const res = await fetch("https://api.quotable.io/random", { cache: "no-store" });
      if (!res.ok) throw new Error("Bad response");
      const data = await res.json();

      quoteText.textContent = `"${data.content}" — ${data.author}`;
    } catch {
      quoteText.textContent = "Could not load quote. Please try again.";
    }
  }

  if (quoteBtn) quoteBtn.addEventListener("click", loadQuote);

  loadQuote();
})();
