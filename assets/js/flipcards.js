(function () {
  function safeJsonParse(str) {
    try { return JSON.parse(str); } catch (e) { return null; }
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

  function buildCard(card, idx) {
    const id = `flipcard-${Math.random().toString(16).slice(2)}-${idx}`;

    // Shared hint
    const hint = el("span", { class: "flipcard-hint", "aria-hidden": "true" }, "Press me");

    // FRONT
    const frontTop = el("div", { class: "flipcard-toprow" }, [
      el("h3", { class: "flipcard-title", id: `${id}-title` }, card.frontTitle || ""),
      hint.cloneNode(true)
    ]);

    const front = el("div", { class: "flipcard-front" }, [
      frontTop,
      el("div", { class: "flipcard-media" }, [
        el("img", {
          src: card.image || "",
          alt: card.imageAlt || "",
          loading: "lazy"
        })
      ])
    ]);

    // BACK
    let backBodyInner;
    if (Array.isArray(card.backList) && card.backList.length) {
      backBodyInner = el("ul", null, card.backList.map((t) => el("li", null, t)));
    } else {
      backBodyInner = el("p", null, card.backText || "");
    }

    const backTop = el("div", { class: "flipcard-toprow" }, [
      el("h3", { class: "flipcard-title" }, card.backTitle || card.frontTitle || ""),
    ]);

    const back = el("div", { class: "flipcard-back" }, [
      backTop,
      el("div", { class: "flipcard-back-body" }, [backBodyInner])
    ]);

    const inner = el("div", { class: "flipcard-inner" }, [front, back]);

    // Keep button for accessibility
    const btn = el("button", {
      class: "flipcard",
      type: "button",
      "aria-pressed": "false",
      "aria-describedby": `${id}-title`
    }, inner);

    btn.addEventListener("click", () => {
      const flipped = btn.classList.toggle("is-flipped");
      btn.setAttribute("aria-pressed", flipped ? "true" : "false");
    });

    btn.addEventListener("keydown", (e) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        btn.click();
      }
    });

    return btn;
  }

  function renderFlipcards(root) {
    const raw = root.getAttribute("data-flipcards");
    const config = safeJsonParse(raw || "");
    if (!config || !Array.isArray(config.cards) || config.cards.length !== 3) return;

    root.innerHTML = "";

    const head = el("div", { class: "flipcards-head" }, [
      el("h2", { class: "flipcards-title" }, config.heading || "")
    ]);

    const grid = el("div", { class: "flipcards-grid" },
      config.cards.map((c, i) => buildCard(c, i))
    );

    root.appendChild(head);
    root.appendChild(grid);
  }

  function initFlipcards() {
    document.querySelectorAll("[data-flipcards]").forEach(renderFlipcards);
  }

  window.initFlipcards = initFlipcards;
  document.addEventListener("DOMContentLoaded", initFlipcards);
})();
