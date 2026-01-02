// Idempotent Matomo loader with consent hooks
(function () {
  if (window.__MATOMO_BOOTSTRAPPED__) return;
  window.__MATOMO_BOOTSTRAPPED__ = true;

  // --- CONFIG ---
  var CONFIG = {
    url: 'https://analytics.sublimecyb.org/', // tracker base URL
    siteId: '2',                               // Matomo site ID
    respectDnt: true,                          // optional
    useCookies: false                          // cookie-less by default; toggle via consent
  };

  // --- CONSENT STATE ---
  // values: 'accepted' | 'rejected' | null
  function getConsent() { return localStorage.getItem('analytics_consent'); }
  function setConsent(v){ localStorage.setItem('analytics_consent', v); }

  // --- MATOMO BOOT ---
  function bootMatomo() {
    var _paq = window._paq = window._paq || [];
    if (CONFIG.respectDnt) _paq.push(['setDoNotTrack', true]);
    if (!CONFIG.useCookies) _paq.push(['disableCookies']);

    _paq.push(['enableLinkTracking']);
    _paq.push(['setTrackerUrl', CONFIG.url + 'matomo.php']);
    _paq.push(['setSiteId', CONFIG.siteId]);
    _paq.push(['trackPageView']);

    var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
    g.async = true; g.src = CONFIG.url + 'matomo.js'; s.parentNode.insertBefore(g, s);
  }

  // --- PUBLIC API for your banner/toggle ---
  window.enableAnalytics = function () {
    setConsent('accepted');
    CONFIG.useCookies = true;

    var _paq = window._paq = window._paq || [];
    _paq.push(['forgetUserOptOut']);            // remove mtm_consent_removed
    _paq.push(['rememberConsentGiven', 365*24]); // remember consent for ~12 months

    bootMatomo();                               // now load matomo with cookies
  };

  window.disableAnalytics = function () {
    setConsent('rejected');

    var _paq = window._paq = window._paq || [];
    _paq.push(['forgetConsentGiven']);          // revoke any stored consent
    _paq.push(['optUserOut']);                  // set mtm_consent_removed

    // (optional) reload to fully clear any in-memory trackers:
    // location.reload();
  };

  // --- AUTO-START based on stored consent ---
  var consent = getConsent();
  if (consent === 'accepted') {
    window.enableAnalytics();
  } else if (consent === 'rejected') {
    // do nothing
  } else {
    // no choice yet: stay idle until the banner calls enable/disableAnalytics
    // optionally do cookieless pageview now; if you want that:
    // bootMatomo();  // while CONFIG.useCookies=false
  }
})();
