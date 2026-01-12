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

  function renderCTA(root) {
    const cfg = safeJsonParse(root.getAttribute("data-cta") || "");
    if (!cfg) return;

    const eyebrow = String(cfg.eyebrow || "Next step").trim();
    const title = String(cfg.title || "").trim();
    const text = String(cfg.text || "").trim();

    const primary = cfg.primary || {};
    const secondary = cfg.secondary || {};

    if (!title || !text || !primary?.label || !primary?.href) return;

    const logoSrc = String(cfg.logoSrc || "/assets/img/cta/Galea-A-logo.svg").trim();

    // Build full container-width section (prevents full-width footer clash)
    root.innerHTML = "";

    const section = el("section", { class: "section" }, [
      el("div", { class: "container" }, [
        el("div", { class: "cta-panel" }, [
          el("div", { class: "cta-copy" }, [
            el("p", { class: "cta-eyebrow" }, eyebrow),
            el("h2", { class: "cta-title" }, title),
            el("p", { class: "cta-text" }, text),

            el("div", { class: "cta-actions" }, [
              el("a", { class: "btn btn-primary", href: primary.href }, primary.label),
              secondary?.label && secondary?.href
                ? el("a", { class: "btn btn-secondary", href: secondary.href }, secondary.label)
                : null
            ])
          ]),

          el("div", { class: "cta-visual", "aria-hidden": "true" }, [
            el("img", {
              class: "cta-logo",
              src: logoSrc,
              alt: ""
            })
          ])
        ])
      ])
    ]);

    root.appendChild(section);
  }

  function initCTAs() {
    document.querySelectorAll("[data-cta]").forEach(renderCTA);
  }

  // expose + init
  window.initCTAs = initCTAs;
  document.addEventListener("DOMContentLoaded", initCTAs);

  // If you inject content later (partials), re-run safely
  document.addEventListener("partial:loaded", initCTAs);
})();
