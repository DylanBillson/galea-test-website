// Cookie banner (Galea): consent-aware, idempotent, uses site CSS
(function () {
  if (window.__COOKIE_BANNER_BOOTSTRAPPED__) return;
  window.__COOKIE_BANNER_BOOTSTRAPPED__ = true;

  var KEY = "analytics_consent";

  // If choice already made, do nothing
  var existing = null;
  try { existing = localStorage.getItem(KEY); } catch (e) {}
  if (existing === "accepted" || existing === "rejected") return;

  // Build banner
  var wrap = document.createElement("div");
  wrap.className = "cookie-banner";
  wrap.setAttribute("role", "dialog");
  wrap.setAttribute("aria-live", "polite");
  wrap.setAttribute("aria-label", "Cookie preferences");

  wrap.innerHTML = `
    <div class="container">
      <div class="cookie-banner-inner">
        <div class="cookie-banner-copy">
          <p class="cookie-banner-title">Analytics preference</p>
          <p class="cookie-banner-text">
            We use privacy-friendly analytics to improve this site. You can change this at any time on our
            <a class="cookie-banner-link" href="/resources/policies/#preferences">Policies page</a>.
          </p>
        </div>

        <div class="cookie-banner-actions">
          <button type="button" class="btn btn-secondary" data-cb-action="reject">Reject</button>
          <button type="button" class="btn btn-primary" data-cb-action="accept">Accept</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(wrap);

  function cleanup() {
    if (wrap && wrap.parentNode) wrap.parentNode.removeChild(wrap);
  }

  function setConsent(value) {
    try { localStorage.setItem(KEY, value); } catch (e) {}
  }

  wrap.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-cb-action]");
    if (!btn) return;

    var action = btn.getAttribute("data-cb-action");

    if (action === "accept") {
      setConsent("accepted");
      if (typeof window.enableAnalytics === "function") window.enableAnalytics();
      cleanup();
      return;
    }

    if (action === "reject") {
      setConsent("rejected");
      if (typeof window.disableAnalytics === "function") window.disableAnalytics();
      cleanup();
      return;
    }
  });
})();
