/**
 * HWA Tracking Utility
 * Shared module for HubSpot (_hsq), GTM (dataLayer), and Clay webhook proxy.
 */
var HWA_TRACKING = (function () {
  var WEBHOOK_PROXY_URL = 'https://hunterwebservices-prod.azurewebsites.net/api/WebhookProxy';
  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

  /** Capture UTMs from URL on page load, persist in sessionStorage. */
  function captureUtmParams() {
    var params = new URLSearchParams(window.location.search);
    UTM_KEYS.forEach(function (key) {
      var val = params.get(key);
      if (val) sessionStorage.setItem(key, val);
    });
  }

  function getUtmParams() {
    var utms = {};
    UTM_KEYS.forEach(function (key) {
      var val = sessionStorage.getItem(key);
      if (val) utms[key] = val;
    });
    return utms;
  }

  /** Auto-identify visitor from outbound email link (eid = base64-encoded email). */
  function autoIdentifyFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var eid = params.get('eid');
    if (!eid) return;
    try {
      var email = atob(eid);
      if (email.indexOf('@') !== -1) {
        identifyVisitor(email);
      }
    } catch (e) { /* invalid base64, ignore */ }
  }

  function identifyVisitor(email, properties) {
    var _hsq = window._hsq = window._hsq || [];
    var payload = Object.assign({ email: email }, properties || {});
    _hsq.push(['identify', payload]);
    _hsq.push(['trackPageView']);
  }

  function trackHubSpotEvent(eventName) {
    var _hsq = window._hsq = window._hsq || [];
    _hsq.push(['trackEvent', eventName]);
  }

  function pushDataLayerEvent(eventName, data) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: eventName }, data || {}));
  }

  function sendToClayWebhook(leadData) {
    fetch(WEBHOOK_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadData),
      mode: 'cors'
    }).catch(function (err) {
      console.warn('Clay webhook proxy failed:', err);
    });
  }

  function initClickTracking() {
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a');
      if (!link) return;
      var href = link.getAttribute('href') || '';

      if (href.startsWith('tel:')) {
        pushDataLayerEvent('phone_click', { clickTarget: href });
        trackHubSpotEvent('pe_phone_click');
      }
      if (href.startsWith('mailto:')) {
        pushDataLayerEvent('email_click', { clickTarget: href });
        trackHubSpotEvent('pe_email_click');
      }
      if (href.indexOf('linkedin.com') !== -1) {
        pushDataLayerEvent('linkedin_click', { clickTarget: href });
        trackHubSpotEvent('pe_linkedin_click');
      }
    });
  }

  return {
    identifyVisitor: identifyVisitor,
    trackHubSpotEvent: trackHubSpotEvent,
    pushDataLayerEvent: pushDataLayerEvent,
    sendToClayWebhook: sendToClayWebhook,
    initClickTracking: initClickTracking,
    captureUtmParams: captureUtmParams,
    getUtmParams: getUtmParams,
    autoIdentifyFromUrl: autoIdentifyFromUrl
  };
})();

document.addEventListener('DOMContentLoaded', function () {
  HWA_TRACKING.captureUtmParams();
  HWA_TRACKING.autoIdentifyFromUrl();
  HWA_TRACKING.initClickTracking();
});
