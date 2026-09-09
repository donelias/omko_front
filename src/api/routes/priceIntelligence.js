import api from "../axiosMiddleware";
import * as apiEndpoints from "../apiEndpoints";
import {
  getFilteredParams,
} from "@/utils/helperFunction";

// Price Intelligence - Motor Inteligente de Precios AI

// 1. Obtener sugerencia de precio para una propiedad
export const getPriceSuggestionApi = async ({
  propertyId,
  forceRefresh = false,
}) => {
  const res = await api.get(
    `${apiEndpoints.PRICE_SUGGESTION}/${propertyId}`,
    { params: { force_refresh: forceRefresh ? "true" : "false" } }
  );
  return res.data;
};

// 2. Análisis detallado de precios
export const getPriceAnalysisApi = async (propertyId) => {
  const res = await api.get(`${apiEndpoints.PRICE_ANALYSIS}/${propertyId}`);
  return res.data;
};

// 3. Análisis de mercado por ubicación
export const getMarketAnalysisApi = async ({
  location,
  property_type,
  transaction_type = "sale",
}) => {
  const res = await api.post(apiEndpoints.PRICE_MARKET_ANALYSIS, {
    location,
    property_type: property_type || undefined,
    transaction_type,
  });
  return res.data;
};

// 4. Registrar histórico de precio
export const recordPriceHistoryApi = async ({
  property_id,
  price,
  price_per_sqm,
  status = "price_changed",
  transaction_type = "sale",
  days_on_market,
  notes = "",
}) => {
  const res = await api.post(apiEndpoints.PRICE_HISTORY, {
    property_id,
    price,
    price_per_sqm: price_per_sqm || undefined,
    status,
    transaction_type,
    days_on_market: days_on_market || undefined,
    notes,
  });
  return res.data;
};

// 5. Sugerencias en lote para varias propiedades
export const getBulkSuggestionsApi = async (propertyIds) => {
  const res = await api.post(apiEndpoints.PRICE_BULK_SUGGESTIONS, {
    property_ids: propertyIds,
  });
  return res.data;
};

// 6. Propiedades comparables
export const getComparablesApi = async (propertyId) => {
  const res = await api.get(`${apiEndpoints.PRICE_COMPARABLES}/${propertyId}`);
  return res.data;
};

// 7. Tendencias de precios
export const getPriceTrendsApi = async ({ location, days = 30 }) => {
  const params = getFilteredParams({ location, days });
  const res = await api.get(apiEndpoints.PRICE_TRENDS, { params });
  return res.data;
};

// 8. Tasas de cambio vigentes (día / BCRD) del motor de precios
export const getPriceExchangeRatesApi = async () => {
  const res = await api.get(apiEndpoints.PRICE_EXCHANGE_RATES);
  return res.data;
};
