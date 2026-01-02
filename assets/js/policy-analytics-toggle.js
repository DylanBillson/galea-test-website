// Policies page slide toggle for analytics consent
(function () {
  var KEY = 'analytics_consent';
  var el = document.getElementById('analytics-toggle');
  var status = document.getElementById('analytics-status');
  if (!el) return;

  function setVisual(on){
    el.setAttribute('aria-checked', on ? 'true' : 'false');
    if (status) status.textContent = on ? 'Analytics are enabled.' : 'Analytics are disabled.';
  }
  function currentConsent(){
    return localStorage.getItem(KEY) === 'accepted';
  }
  function enable(){
    localStorage.setItem(KEY, 'accepted');
    if (typeof window.enableAnalytics === 'function') window.enableAnalytics();
    setVisual(true);
  }
  function disable(){
    localStorage.setItem(KEY, 'rejected');
    if (typeof window.disableAnalytics === 'function') window.disableAnalytics();
    setVisual(false);
  }

  // init from stored state
  setVisual(currentConsent());

  // click toggles
  el.addEventListener('click', function(){
    currentConsent() ? disable() : enable();
  });

  // keyboard support (Space/Enter)
  el.addEventListener('keydown', function(e){
    if (e.key === ' ' || e.key === 'Enter'){
      e.preventDefault();
      currentConsent() ? disable() : enable();
    }
  });
})();
