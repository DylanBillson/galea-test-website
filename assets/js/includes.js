// /assets/js/include.js

async function loadPartial(selector, url) {
  const container = document.querySelector(selector);
  if (!container) return false;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load ${url}`);
    container.innerHTML = await res.text();

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

/* --------------------
   Active nav highlighting (current page)
-------------------- */
function markActiveNavLinks() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const normalise = (p) => {
    if (!p) return "/";
    p = p.split("?")[0].split("#")[0];
    p = p.replace(/index\.html$/i, "");
    if (p.length > 1) p = p.replace(/\/+$/, "");
    return p || "/";
  };

  const current = normalise(window.location.pathname);

  // Clear old state
  header.querySelectorAll(".is-current").forEach((el) => el.classList.remove("is-current"));

  // Mark matching link + its parent <summary>
  header.querySelectorAll(".nav-dd").forEach((dd) => {
    const links = dd.querySelectorAll(".nav-panel a[href]");
    let foundInThisDropdown = false;

    links.forEach((a) => {
      const href = a.getAttribute("href");
      const linkPath = normalise(href);

      if (linkPath === current) {
        a.classList.add("is-current");
        foundInThisDropdown = true;
      }
    });

    if (foundInThisDropdown) {
      const summary = dd.querySelector(".nav-link");
      if (summary) summary.classList.add("is-current");
    }
  });
}

/* --------------------
   Mobile nav (hamburger -> drawer)
-------------------- */
function initMobileNav() {
  // Bind once globally (works even if header is re-injected)
  if (document.body.dataset.mobileNavBound === "1") return;
  document.body.dataset.mobileNavBound = "1";

  const getBtn = () => document.querySelector(".site-header .nav-toggle");
  const getNav = () => document.querySelector(".site-header .nav");

  const resetCascading = () => {
    const nav = getNav();
    if (!nav) return;
    nav.classList.remove("is-submenu");
    nav.querySelectorAll(".nav-dd.is-active").forEach((dd) => dd.classList.remove("is-active"));
  };

  const setOpen = (open) => {
    document.body.classList.toggle("nav-open", open);

    const btn = getBtn();
    if (btn) {
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }

    if (!open) {
      resetCascading();
      closeAllDropdowns();
    }
  };

  // Toggle button click (delegated)
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".site-header .nav-toggle");
    if (!btn) return;

    const isOpen = document.body.classList.contains("nav-open");
    setOpen(!isOpen);
  });

  // Close when tapping a nav link
  document.addEventListener("click", (e) => {
    const nav = getNav();
    if (!nav) return;

    const a = e.target.closest(".site-header .nav a");
    if (!a) return;

    setOpen(false);
  });

  // Click-away closes the mobile drawer
  document.addEventListener("click", (e) => {
    if (!document.body.classList.contains("nav-open")) return;
    if (e.target.closest(".site-header")) return;
    setOpen(false);
  });

  // ESC closes drawer too
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (!document.body.classList.contains("nav-open")) return;
    setOpen(false);
  });

  // Ensure initial state
  setOpen(false);
}

/* --------------------
   Cascading mobile menus + desktop dropdown behaviour
-------------------- */
function bindDropdownBehaviour() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const nav = header.querySelector(".nav");
  if (!nav) return;

  const isMobile = () => window.matchMedia("(max-width: 899px)").matches;

  // Ensure a single Back button exists (injected, so you don't have to edit header.html)
  let backBtn = nav.querySelector(".nav-back");
  if (!backBtn) {
    backBtn = document.createElement("button");
    backBtn.type = "button";
    backBtn.className = "nav-back";
    backBtn.setAttribute("aria-label", "Back to menu");
    backBtn.innerHTML = `Back`;
    nav.prepend(backBtn);
  }

  const enterSubmenu = (dd) => {
    // Close others + open this one (so any [open]-based CSS will show the panel)
    closeAllDropdowns(dd);
    dd.open = true;

    nav.classList.add("is-submenu");
    nav.querySelectorAll(".nav-dd.is-active").forEach((x) => x.classList.remove("is-active"));
    dd.classList.add("is-active");
  };

  const exitSubmenu = () => {
    nav.classList.remove("is-submenu");
    nav.querySelectorAll(".nav-dd.is-active").forEach((x) => x.classList.remove("is-active"));

    // Close everything so you return to the top-level list cleanly
    closeAllDropdowns();
  };

  // Back button (mobile cascading)
  if (backBtn.dataset.bound !== "1") {
    backBtn.dataset.bound = "1";
    backBtn.addEventListener("click", () => {
      exitSubmenu();
    });
  }

  // Bind each dropdown once
  nav.querySelectorAll(".nav-dd").forEach((dd) => {
    if (dd.dataset.bound === "1") return;
    dd.dataset.bound = "1";

    const summary = dd.querySelector("summary");
    if (!summary) return;

    // Mobile: turn summary into "go to submenu"
    summary.addEventListener("click", (e) => {
      if (!isMobile()) return; // desktop uses <details> behaviour
      e.preventDefault();      // prevent native <details> toggle on mobile
      enterSubmenu(dd);
    });

    // Desktop: keep your original toggle behaviour (close others)
    dd.addEventListener("toggle", () => {
      if (isMobile()) return;  // mobile isn't using <details> open/close
      if (!dd.open) return;
      closeAllDropdowns(dd);
    });
  });

  // If we rotate/resize from mobile->desktop while in submenu, reset
  if (nav.dataset.resizeBound !== "1") {
    nav.dataset.resizeBound = "1";
    window.addEventListener("resize", () => {
      if (!isMobile()) {
        exitSubmenu();
      }
    });
  }
}

/* Global click-away close for desktop dropdowns */
document.addEventListener("click", (e) => {
  if (e.target.closest(".nav-dd, .dropdown")) return;
  closeAllDropdowns();
});

/* ESC closes any open desktop dropdowns */
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  closeAllDropdowns();
});

/* --------------------
   Conditions Panel Logic
-------------------- */
function initConditionsPanel() {
  const root = document.querySelector(".conditions");
  if (!root) return;

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

  root.addEventListener("click", (e) => {
    const chip = e.target.closest(".cond-chip");
    if (chip) {
      const cond = chip.dataset.cond;

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

  document.addEventListener("click", (e) => {
    if (!panel || panel.hidden) return;
    if (e.target.closest(".conditions")) return;
    closePanel();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (panel && !panel.hidden) closePanel();
  });
}

/* --------------------
   Boot
-------------------- */
document.addEventListener("DOMContentLoaded", async () => {
  await loadPartial("#site-header", "/components/header.html");
  await loadPartial("#site-footer", "/components/footer.html");
  await loadDataPartials();

  initMobileNav();
  bindDropdownBehaviour();
  markActiveNavLinks();
  setFooterYear();

  initConditionsPanel();
});

document.addEventListener("partial:loaded", () => {
  initMobileNav();
  bindDropdownBehaviour();
  markActiveNavLinks();
  setFooterYear();
});
