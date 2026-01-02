// Cookie banner: self-contained, idempotent, consent-aware
(function () {
  if (window.__COOKIE_BANNER_BOOTSTRAPPED__) return;
  window.__COOKIE_BANNER_BOOTSTRAPPED__ = true;

  var KEY = 'analytics_consent';

  // If choice already made, do nothing
  var existing = localStorage.getItem(KEY);
  if (existing === 'accepted' || existing === 'rejected') return;

  // --- Styles (tiny, inline). Move to CSS later if you prefer.
  var css = `
    #cb-wrap{position:fixed;left:0;right:0;bottom:0;z-index:9999;
      font:14px/1.4 system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;
      color:#111;background:#fff;border-top:1px solid #ddd;box-shadow:0 -4px 20px rgba(0,0,0,.08)}
    #cb-inner{max-width:960px;margin:0 auto;padding:12px 16px;display:flex;gap:12px;align-items:center}
    #cb-text{flex:1 1 auto}
    #cb-actions{display:flex;gap:8px;flex:0 0 auto}
    #cb-actions button{border:0;border-radius:8px;padding:8px 12px;cursor:pointer}
    #cb-accept{background:#055680;color:#fff}
    #cb-reject{background:#3e3e3c;color:#fff}
    @media (max-width:640px){
      #cb-inner{flex-direction:column;align-items:stretch}
      #cb-actions{justify-content:flex-end}
    }
  `;
  var style = document.createElement('style');
  style.setAttribute('data-cookie-banner', 'style');
  style.textContent = css;
  document.head.appendChild(style);

  // --- HTML
  var wrap = document.createElement('div');
  wrap.id = 'cb-wrap';
  wrap.setAttribute('role', 'dialog');
  wrap.setAttribute('aria-live', 'polite');
  wrap.setAttribute('aria-label', 'Cookie preferences');

  wrap.innerHTML = `
    <div id="cb-inner">
      <div id="cb-text">
        <strong>Analytics cookies</strong> – We use privacy-friendly analytics to improve this site.
        You can change your analytics settings at any time on our policy page.
        <a href="/policies.html" id="cb-policy-link">Learn more</a>.
      </div>
      <div id="cb-actions">
        <button id="cb-reject" type="button">Reject</button>
        <button id="cb-accept" type="button">Accept</button>
      </div>
    </div>
  `;
  document.body.appendChild(wrap);

  // --- Wiring
  var acceptBtn = wrap.querySelector('#cb-accept');
  var rejectBtn = wrap.querySelector('#cb-reject');

  function cleanup() {
    wrap.remove();
    var s = document.querySelector('style[data-cookie-banner="style"]');
    if (s) s.remove();
  }

  acceptBtn.addEventListener('click', function () {
    try { localStorage.setItem(KEY, 'accepted'); } catch(e) {}
    if (typeof window.enableAnalytics === 'function') {
      window.enableAnalytics(); // boots Matomo with cookies
    }
    cleanup();
  });

  rejectBtn.addEventListener('click', function () {
    try { localStorage.setItem(KEY, 'rejected'); } catch(e) {}
    if (typeof window.disableAnalytics === 'function') {
      window.disableAnalytics(); // forgets consent, keeps tracking off
    }
    cleanup();
  });
})();
