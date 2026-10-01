// Monedas soportadas para el precio de una propiedad (columna
// propertys.currency). Se ofrecen las que el motor de precios y el
// calculo de equivalentes DOP <-> USD contemplan en priceIntelligenceUtils.
export const PROPERTY_CURRENCIES = [
  { code: "USD", labelKey: "currencyUsd", fallback: "USD ($)" },
  { code: "DOP", labelKey: "currencyDop", fallback: "DOP (RD$)" },
];

export const DEFAULT_PROPERTY_CURRENCY = "USD";

export const isValidPropertyCurrency = (code) =>
  PROPERTY_CURRENCIES.some((c) => c.code === String(code || "").toUpperCase());