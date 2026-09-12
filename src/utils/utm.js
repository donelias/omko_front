const STORAGE_KEY = "omko_traffic";

let cachedTraffic = null;

const clean = (v) => (typeof v === "string" ? v.trim().slice(0, 190) : "");

const readFromUrl = (search) => {
  const params = new URLSearchParams(search || "");
  const pick = [...new Set(["fbclid", "gclid", "gbraid", "wbraid", "utm_source", "utm_campaign", "utm_medium", "utm_content", "utm_term"])];
  const out = {};
  pick.forEach((k) => {
    const v = clean(params.get(k));
    if (v) out[k] = v;
  });
  return out;
};

const persist = (data) => {
  try {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  } catch (_) {
    /* noop */
  }
};

const readStored = () => {
  try {
    if (typeof window !== "undefined") {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    }
  } catch (_) {
    /* noop */
  }
  return {};
};

const normalizePhone = (phone) => (phone ? String(phone).replace(/[^0-9]/g, "").slice(0, 15) : "");

/**
 * Lee y persiste la atribución de tráfico (fbclid/gclid/utm_*) desde la URL de
 * aterrizaje. Si el visitante llega por un anuncio de Meta, el fbclid y las utm
 * quedan disponibles para todos los formularios de la sesión.
 */
export const readUtmFromUrl = () => {
  if (typeof window === "undefined") return {};
  const fresh = readFromUrl(window.location.search || "");
  if (Object.keys(fresh).length > 0) {
    cachedTraffic = { ...readStored(), ...fresh };
    persist(cachedTraffic);
  } else if (!cachedTraffic) {
    cachedTraffic = readStored();
  }
  return cachedTraffic || {};
};

/**
 * Retorna el payload de tráfico para incluir en formularios de lead/cita.
 */
export const getLeadTraffic = () => {
  const t = readUtmFromUrl();
  return {
    fbclid: t.fbclid ? String(t.fbclid).slice(0, 190) : undefined,
    utm_source: t.utm_source,
    utm_campaign: t.utm_campaign,
    utm_medium: t.utm_medium,
    utm_content: t.utm_content,
    utm_term: t.utm_term,
    page_url: typeof window !== "undefined" ? window.location.href.slice(0, 1000) : undefined,
  };
};

export const getFbclid = () => {
  const t = readUtmFromUrl();
  return t.fbclid ? String(t.fbclid).slice(0, 190) : undefined;
};

export const leadPhoneForMeta = (phone) => normalizePhone(phone);

export default { readUtmFromUrl, getLeadTraffic, getFbclid, leadPhoneForMeta };