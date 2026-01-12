(function () {
  function safeJsonParse(str) {
    try { return JSON.parse(str); } catch { return null; }
  }

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      Object.entries(attrs).forEach(([k, v]) => {
        if (v === null || v === undefined) return;
        if (k === "class") node.className = v;
        else if (k === "html") node.innerHTML = v;
        else node.setAttribute(k, v);
      });
    }
    if (children) {
      (Array.isArray(children) ? children : [children]).forEach((c) => {
        if (c === null || c === undefined) return;
        node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
      });
    }
    return node;
  }

  const DEFAULT_INTERVAL = 5500;
  const FADE_MS = 350;

  function renderQuoteRotator(root) {
    const cfg = safeJsonParse(root.getAttribute("data-quotes") || "");
    if (!cfg || !Array.isArray(cfg.quotes) || cfg.quotes.length === 0) return;

    const lead = String(cfg.lead || "").trim();
    const quotes = cfg.quotes.map(String).map(s => s.trim()).filter(Boolean);
    const intervalMs = Number(cfg.intervalMs) || DEFAULT_INTERVAL;

    if (!quotes.length) return;

    root.innerHTML = "";

    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    const leadEl = el("p", { class: "qr-lead" }, lead);
    const wrap = el("div", { class: "qr-quote-wrap" });

    const quoteEl = el("p", { class: "qr-quote", "aria-live": "polite" }, quotes[0]);
    wrap.appendChild(quoteEl);

    const dots = el("div", { class: "qr-dots", "aria-hidden": "true" },
      quotes.map((_, i) => el("span", { class: `qr-dot${i === 0 ? " is-active" : ""}` }))
    );

    root.appendChild(leadEl);
    root.appendChild(wrap);
    root.appendChild(dots);

    let idx = 0;
    let timer = null;

    function setActiveDot(i) {
      const dotEls = dots.querySelectorAll(".qr-dot");
      dotEls.forEach((d, di) => d.classList.toggle("is-active", di === i));
    }

    function show(i) {
      idx = i % quotes.length;
      quoteEl.textContent = quotes[idx];
      setActiveDot(idx);
    }

    function fadeToNext() {
      // fade out
      quoteEl.classList.remove("is-visible");
      window.setTimeout(() => {
        show(idx + 1);
        // fade in
        quoteEl.classList.add("is-visible");
      }, prefersReduced ? 0 : FADE_MS);
    }

    // initial in
    quoteEl.classList.add("is-visible");

    // If reduced motion, keep it static on first quote (no auto-rotation)
    if (prefersReduced) return;

    timer = window.setInterval(fadeToNext, intervalMs);

    // Pause when off-screen (avoids running constantly)
    const io = new IntersectionObserver((entries) => {
      const onScreen = entries.some(e => e.isIntersecting);
      if (!onScreen && timer) {
        clearInterval(timer);
        timer = null;
      } else if (onScreen && !timer) {
        timer = window.setInterval(fadeToNext, intervalMs);
      }
    }, { threshold: 0.15 });

    io.observe(root);
  }

  function initQuotes() {
    document.querySelectorAll("[data-quotes]").forEach(renderQuoteRotator);
  }

  window.initQuotes = initQuotes;
  document.addEventListener("DOMContentLoaded", initQuotes);
})();
