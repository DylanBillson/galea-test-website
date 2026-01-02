// /assets/js/include.js

async function loadPartial(selector, url) {
  const container = document.querySelector(selector);
  if (!container) return false;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load ${url}`);
    container.innerHTML = await res.text();

    // Signal that a partial has been injected (useful for attaching listeners)
    document.dispatchEvent(
      new CustomEvent("partial:loaded", { detail: { selector, url } })
    );

    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

async function loadDataPartials() {
  const partials = document.querySelectorAll("[data-partial]");

  await Promise.all(
    [...partials].map(async (el) => {
      const url = el.getAttribute("data-partial");
      if (!url) return;

      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to load ${url}`);
        el.innerHTML = await res.text();

        // Fire the same event so we can initialise scripts after injection
        document.dispatchEvent(
          new CustomEvent("partial:loaded", {
            detail: { selector: `[data-partial="${url}"]`, url }
          })
        );
      } catch (err) {
        console.error(err);
      }
    })
  );
}

function setFooterYear() {
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
}

function closeAllDropdowns(except = null) {
  document.querySelectorAll(".nav-dd[open], .dropdown[open]").forEach((dd) => {
    if (dd !== except) dd.open = false;
  });
}

function bindDropdownBehaviour() {
  // Bind toggle listeners to any dropdowns that exist (and aren't already bound)
  document.querySelectorAll(".nav-dd, .dropdown").forEach((dd) => {
    if (dd.dataset.bound === "1") return;
    dd.dataset.bound = "1";

    dd.addEventListener("toggle", () => {
      if (!dd.open) return;
      closeAllDropdowns(dd);
    });
  });
}

// Global click-away close (works for injected elements too)
document.addEventListener("click", (e) => {
  if (e.target.closest(".nav-dd, .dropdown")) return;
  closeAllDropdowns();
});

// ESC closes any open dropdowns
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  closeAllDropdowns();
});

// --------------------
// Conditions Panel Logic
// --------------------
function initConditionsPanel() {
  const root = document.querySelector(".conditions");
  if (!root) return;

  // Prevent double-binding if partial gets reloaded
  if (root.dataset.bound === "1") return;
  root.dataset.bound = "1";

  const panel = root.querySelector("#condPanel");
  const titleEl = root.querySelector("#condTitle");
  const bodyEl = root.querySelector("#condBody");
  const actionsEl = root.querySelector("#condActions");

  const chips = [...root.querySelectorAll(".cond-chip")];

  const setActiveChip = (cond) => {
    chips.forEach((btn) =>
      btn.classList.toggle("is-active", btn.dataset.cond === cond)
    );
  };

  const closePanel = () => {
    if (!panel) return;
    panel.hidden = true;
    panel.classList.remove("is-open");
    setActiveChip(null);
    bodyEl.innerHTML = "";
    actionsEl.innerHTML = "";
  };

  const openPanel = (cond) => {
    const tpl = root.querySelector(`#condData-${cond}`);
    const act = root.querySelector(`#condActions-${cond}`);

    // If you haven't added templates yet, fail gracefully
    if (!tpl) {
      console.warn(`No template found for condData-${cond}`);
      return;
    }

    const chip = chips.find((c) => c.dataset.cond === cond);
    titleEl.textContent = chip ? chip.textContent.trim() : "Details";

    bodyEl.innerHTML = "";
    bodyEl.appendChild(tpl.content.cloneNode(true));

    actionsEl.innerHTML = "";
    if (act) actionsEl.appendChild(act.content.cloneNode(true));

    panel.hidden = false;
    panel.classList.add("is-open");
    setActiveChip(cond);

    panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  // Chip clicks + close button (delegated)
  root.addEventListener("click", (e) => {
    const chip = e.target.closest(".cond-chip");
    if (chip) {
      const cond = chip.dataset.cond;

      // Toggle: clicking active chip closes
      if (!panel.hidden && chip.classList.contains("is-active")) {
        closePanel();
      } else {
        openPanel(cond);
      }
      return;
    }

    if (e.target.closest("[data-cond-close]")) {
      closePanel();
    }
  });

  // Click-away closes (only if panel open)
  document.addEventListener("click", (e) => {
    if (!panel || panel.hidden) return;
    if (e.target.closest(".conditions")) return;
    closePanel();
  });

  // ESC closes
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (panel && !panel.hidden) closePanel();
  });
}

// Boot (single source of truth)
document.addEventListener("DOMContentLoaded", async () => {
  // Load header/footer once
  await loadPartial("#site-header", "/components/header.html");
  await loadPartial("#site-footer", "/components/footer.html");

  // Load any other partials (like conditions)
  await loadDataPartials();

  // Bind behaviours
  bindDropdownBehaviour();
  setFooterYear();

  // If conditions partial already exists, init now
  initConditionsPanel();
});

// If partials are injected later, rebind what’s needed
document.addEventListener("partial:loaded", (e) => {
  bindDropdownBehaviour();
  setFooterYear();

  // Initialise conditions after its partial injects
  // (works whether it’s included via data-partial or swapped later)
  if (e?.detail?.url && e.detail.url.includes("conditions.html")) {
    initConditionsPanel();
  }
});
