// Utilidades compartidas del Motor Inteligente de Precios AI (web)

export const formatPriceValue = (price, currency = "DOP") => {
  if (price === null || price === undefined || isNaN(Number(price))) return "—";

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(price));
  } catch (error) {
    return `${currency} ${Number(price).toLocaleString()}`;
  }
};

export const formatPriceCompact = (price, currency = "DOP") => {
  if (price === null || price === undefined || isNaN(Number(price))) return "—";

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(Number(price));
  } catch (error) {
    return `${currency} ${Number(price).toLocaleString()}`;
  }
};

export const recommendationConfig = {
  increase: { key: "recommendationIncrease", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", bar: "#10b981" },
  decrease: { key: "recommendationDecrease", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", bar: "#ef4444" },
  maintain: { key: "recommendationMaintain", color: "text-sky-600", bg: "bg-sky-50", border: "border-sky-200", bar: "#0ea5e9" },
  review_required: { key: "recommendationReview", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", bar: "#f59e0b" },
};

export const recommendationKey = (recommendation) =>
  recommendationConfig[recommendation]?.key || "recommendationReview";

export const confidenceColor = (score) => {
  if (score >= 80) return "#10b981";
  if (score >= 60) return "#0ea5e9";
  if (score >= 40) return "#f59e0b";
  return "#ef4444";
};

export const confidenceLabelKey = (score) => {
  if (score >= 80) return "confidenceHigh";
  if (score >= 60) return "confidenceMedium";
  return "confidenceLow";
};

export const marketConditionKey = (condition) => {
  switch (condition) {
    case "hot":
      return "marketHot";
    case "slow":
      return "marketSlow";
    default:
      return "marketBalanced";
  }
};

export const trendConfig = {
  increasing: { key: "trendUp", color: "text-emerald-600", arrow: "up" },
  decreasing: { key: "trendDown", color: "text-red-600", arrow: "down" },
  stable: { key: "trendStable", color: "text-sky-600", arrow: "right" },
};

export const marketTrendToKey = (trend) => trendConfig[trend]?.key || "trendStable";

// Precios marcados true para la sugerencia se usan como valores "raw" del engine
export const suggestionIsPriceInPropertyCurrency = (suggestion, propertyCurrency) =>
  Boolean(suggestion?.currency) ? suggestion.currency : propertyCurrency;

// Tasas de cambio (fallback estático; el valor "del día" lo sirve el backend
// vía ExchangeRateService y se carga con setExchangeRates()).
export const PRICE_EXCHANGE_RATES = {
  DOP: 1,
  USD: 58.5,
  EUR: 63,
};

let currentExchangeRates = { ...PRICE_EXCHANGE_RATES };

export const setExchangeRates = (rates) => {
  if (rates && typeof rates === "object") {
    currentExchangeRates = { ...PRICE_EXCHANGE_RATES, ...rates, DOP: 1 };
  }
};

export const getExchangeRates = () => ({ ...currentExchangeRates });

// Convierte un valor de una moneda a otra usando las tasas vigentes.
// rates[C] = dólares (base) por 1 unidad de C; p. ej. USD = 58.75 => 1 USD
// cuesta 58.75 RD$. Por tanto value_A -> B = value * (rates[A] / rates[B]).
// rates: mapa opcional (si no se pasa usa getExchangeRates()).
export const convertPrice = (value, fromCurrency, toCurrency, rates) => {
  const table = rates || getExchangeRates();
  const from = table[fromCurrency];
  const to = table[toCurrency];
  if (
    value === null ||
    value === undefined ||
    isNaN(Number(value)) ||
    !from ||
    !to
  ) {
    return null;
  }
  return (Number(value) * (from / to));
};

// Moneda "secundaria": la contraparte al dólar base (DOP <-> USD, EUR -> DOP).
export const getPriceEquivalent = (value, currency, rates) => {
  const to =
    currency === "USD" ? "DOP" : currency === "DOP" ? "USD" : currency === "EUR" ? "DOP" : null;
  if (!to || value === null || value === undefined || isNaN(Number(value))) {
    return null;
  }
  return { currency: to, value: convertPrice(value, currency, to, rates) };
};

// Formatea un precio en su moneda ++ equivalente aproximado.
export const formatDualPrice = (value, currency = "DOP", rates) => {
  const primary = formatPriceValue(value, currency);
  const eq = getPriceEquivalent(value, currency, rates);
  const secondary = eq ? `≈ ${formatPriceValue(eq.value, eq.currency)}` : null;
  return { primary, secondary };
};