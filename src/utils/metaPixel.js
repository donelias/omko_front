import { hasAdvertisingConsent } from "./cookieConsent";

let currentPixelId = null;
let loadingPixelId = null;

/**
 * Carga e inicializa el Meta Pixel. El pixel ID proviene de la integración del
 * agente (Publisher/Conversions), nunca hardcodeado. Sólo se carga si el
 * visitante dio consentimiento de publicidad.
 */
export const initMetaPixel = (pixelId) => {
  if (typeof window === "undefined" || !pixelId) return;
  if (currentPixelId === pixelId) return;
  if (!hasAdvertisingConsent()) return;

  const f = window._fbq;
  if (!f) {
    /* eslint-disable */
    (function (n, u, t, r, e, i) {
      n._fbq = n._fbq || [];
      n._fbq.loaded = true;
      n._fbq.push(["init", u]);
      n._fbq.push(["track", "PageView"]);
      e = n.createElement(t);
      e.async = true;
      e.src = r;
      i = n.getElementsByTagName(t)[0];
      i.parentNode.insertBefore(e, i);
    })(window, pixelId, "script", "https://connect.facebook.net/en_US/fbevents.js");
    /* eslint-enable */
  }

  loadingPixelId = pixelId;
  currentPixelId = pixelId;

  if (window.fbq) {
    window.fbq("init", pixelId);
    window.fbq("track", "PageView");
  }
};

export const getCurrentMetaPixel = () => currentPixelId;

export const isMetaPixelReady = () => typeof window !== "undefined" && !!window.fbq && !!currentPixelId;

export const trackMeta = (name, data = {}) => {
  if (typeof window === "undefined") return;
  if (!hasAdvertisingConsent()) return;
  if (!isMetaPixelReady()) return;

  try {
    window.fbq("track", name, data);
  } catch (e) {
    /* noop */
  }
};

export const trackMetaCustom = (eventName, data = {}) => {
  if (typeof window === "undefined") return;
  if (!hasAdvertisingConsent()) return;
  if (!isMetaPixelReady()) return;

  try {
    window.fbq("trackCustom", eventName, data);
  } catch (e) {
    /* noop */
  }
};

/**
 * Dispara un Lead únicamente si el owner de la página tiene pixel propio.
 * El event_id debe coincidir con el enviado por el backend (Conversions API)
 * para que Meta haga dedup: formato "LEAD_{leadId}".
 */
export const trackLeadMetaEvent = (pixelOwner, { leadId, propertyId, contentName } = {}) => {
  if (pixelOwner) initMetaPixel(pixelOwner);

  trackMeta("Lead", {
    eventID: leadId ? `LEAD_${leadId}` : undefined,
    content_name: contentName || "Propiedad",
    content_id: propertyId != null ? String(propertyId) : undefined,
    content_category: "realestate",
  });
};

export default { initMetaPixel, trackMeta, trackMetaCustom, trackLeadMetaEvent, isMetaPixelReady, getCurrentMetaPixel };