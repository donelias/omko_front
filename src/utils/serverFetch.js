import axios from "axios";
import { GET_PROPERTY_LIST, GET_PROJECTS } from "@/api/apiEndpoints";
import {
  buildProjectFilters,
  buildPropertyApiParams,
  decodeBase64FilterUrl,
  getPostedSinceString,
} from "@/utils/helperFunction";

/**
 * Server-side data fetch helper (getServerSideProps / ISR).
 * Uses a plain axios instance WITHOUT the client axiosMiddleware stack
 * (redux-persist, cookie handling, etc.) so it is safe to import and run
 * inside the Next.js Node runtime during SSR.
 *
 * Returns `null` on failure so pages degrade gracefully to client-side
 * fetching instead of crashing the server render.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const END_POINT = process.env.NEXT_PUBLIC_END_POINT || "/api/";

const serverApi = axios.create({
  baseURL: `${API_URL}${END_POINT}`,
  timeout: 10000,
});

/**
 * Fetch a JSON response from the backend during SSR.
 *
 * @param {string} endpoint   - API path (e.g. GET_PROPETRES constant)
 * @param {object} params     - Query params
 * @param {string} lang       - Language code sent via Content-Language header
 * @param {object} extraHeaders - Any additional headers (X-Active-Role, etc.)
 * @returns {Promise<object|null>}
 */
export const fetchSeoData = async (endpoint, params = {}, lang = "es", extraHeaders = {}) => {
  try {
    const res = await serverApi.get(endpoint, {
      params,
      headers: {
        "Content-Language": lang,
        "X-Active-Role": "user",
        ...extraHeaders,
      },
    });
    return res.data;
  } catch (error) {
    console.error(`[serverFetch] GET ${endpoint} failed:`, error?.message);
    return null;
  }
};

/**
 * Fetches the first page of a property listing during SSR so search engines
 * receive real property cards instead of an empty shell.
 *
 * @param {object} options
 * @param {object} options.filters  - Internal filter state (same shape as client)
 * @param {object} options.options  - buildPropertyApiParams options (isCityPage, citySlug, ...)
 * @param {string} options.lang     - Language code for Content-Language header
 * @param {object} options.extraHeaders - Extra headers
 * @returns {Promise<{ properties: Array, total: number, hasMore: boolean, filters: object }|null>}
 */
export const fetchServerSidePropertyList = async ({ filters, options = {}, lang = "es", extraHeaders = {} }) => {
  const apiParams = buildPropertyApiParams(filters, options);
  const data = await fetchSeoData(GET_PROPERTY_LIST, apiParams, lang, extraHeaders);
  if (!data || data.error) return null;

  const properties = data?.data || [];
  const offset = parseInt(options.offset || 0, 10);
  const limit = parseInt(options.limit || 9, 10);

  const serializableFilters = JSON.parse(JSON.stringify(filters));

  return {
    properties,
    total: data?.total || 0,
    hasMore: (data?.total || 0) > offset + properties.length,
    filters: serializableFilters,
  };
};

const normalizeQueryValue = (value) => (Array.isArray(value) ? value[0] : value);

/**
 * Rebuilds the internal filter state from the current URL query params.
 * Mirrors PropertyList's initializeFiltersFromQuery so the SSR snapshot
 * matches exactly what the client would read from the same URL.
 *
 * Supports:
 *  - legacy base64 `filters` param (decodeBase64FilterUrl format)
 *  - clean readable params (q, type, min_price, max_price, posted_since,
 *    features, city, state, country, promoted, premium, sort)
 *
 * @returns {object} Internal filter state
 */
export const parseFiltersFromQuery = (query = {}, options = {}) => {
  const { isCityPage = false, citySlug = "", isCategoryPage = false, categorySlug = "" } = options;
  const q = query || {};

  const defaultFilters = {
    property_type: "",
    category_id: "",
    category_slug_id: isCategoryPage ? categorySlug : "",
    city: isCityPage ? citySlug : "",
    state: "",
    country: "",
    min_price: "",
    max_price: "",
    posted_since: "",
    promoted: false,
    keywords: "",
    amenities: [],
    nearby_places: [],
    is_premium: false,
    latitude: undefined,
    longitude: undefined,
    radius: undefined,
    most_viewed: "",
    most_liked: "",
  };

  // Legacy base64 filters param
  const encoded = normalizeQueryValue(q?.filters);
  if (encoded) {
    try {
      const decoded = decodeBase64FilterUrl(decodeURIComponent(encoded));
      if (decoded && typeof decoded === "object") {
        return {
          ...defaultFilters,
          property_type: decoded.property_type === 0 ? "Sell" : decoded.property_type === 1 ? "Rent" : "",
          category_id: decoded.category_id || "",
          category_slug_id: decoded.category_slug_id || defaultFilters.category_slug_id,
          city: decoded?.location?.city || defaultFilters.city,
          state: isCityPage ? "" : (decoded?.location?.state || ""),
          country: isCityPage ? "" : (decoded?.location?.country || ""),
          min_price: decoded?.price?.min_price ?? "",
          max_price: decoded?.price?.max_price ?? "",
          posted_since: getPostedSinceString(decoded.posted_since),
          promoted: decoded?.flags?.promoted === 1,
          keywords: decoded?.search || "",
          amenities: decoded?.parameters || [],
          nearby_places: decoded?.nearby_places || [],
          is_premium: decoded?.flags?.get_all_premium_properties === 1,
          latitude: isCityPage ? undefined : (decoded?.location?.latitude ?? undefined),
          longitude: isCityPage ? undefined : (decoded?.location?.longitude ?? undefined),
          radius: isCityPage ? undefined : (decoded?.location?.radius ?? undefined),
          most_viewed: decoded?.flags?.most_views === 1 ? "1" : "",
          most_liked: decoded?.flags?.most_liked === 1 ? "1" : "",
        };
      }
    } catch (error) {
      console.error("[serverFetch] Error decoding filters from URL:", error);
    }
  }

  // Clean readable query params
  const filters = { ...defaultFilters };
  const param = (key) => normalizeQueryValue(q?.[key]);

  const searchTerm = param("q");
  if (searchTerm) filters.keywords = searchTerm;

  const rawType = param("type")?.toLowerCase();
  if (rawType === "sell" || rawType === "buy") filters.property_type = "Sell";
  else if (rawType === "rent") filters.property_type = "Rent";

  if (param("min_price")) filters.min_price = param("min_price");
  if (param("max_price")) filters.max_price = param("max_price");
  if (param("posted_since")) filters.posted_since = param("posted_since");
  if (param("city")) filters.city = param("city");
  if (param("state")) filters.state = param("state");
  if (param("country")) filters.country = param("country");
  if (param("promoted") === "1") filters.promoted = true;
  if (param("premium") === "1") filters.is_premium = true;

  const features = param("features");
  if (features) {
    filters.amenities = String(features)
      .split(",")
      .map((id) => ({ id: parseInt(id, 10), value: "" }))
      .filter((a) => a.id && !isNaN(a.id));
  }

  const sort = param("sort")?.toLowerCase();
  if (sort === "most_viewed") filters.most_viewed = "1";
  else if (sort === "most_liked") filters.most_liked = "1";

  return filters;
};

const DEFAULT_PROJECT_FILTERS = {
  keywords: "",
  category_id: "",
  city: "",
  state: "",
  country: "",
  posted_since: "",
  promoted: "",
  is_premium: "",
  most_viewed: "",
  most_liked: "",
  project_type: "",
};

/**
 * Rebuilds the project filter state from the current URL query params.
 * Mirrors ProjectListing / ViewAllProjectListing initializers so the SSR
 * snapshot matches the client's first render.
 *
 * @param {object} query  - Router query object
 * @param {object} options
 * @param {boolean} options.flagsNumeric - Use 1/0 for flag values (ViewAll style)
 * @returns {object} Project filter state
 */
export const parseProjectFiltersFromQuery = (query = {}, options = {}) => {
  const { flagsNumeric = false } = options;
  const q = query || {};
  const encoded = normalizeQueryValue(q?.filters);

  if (encoded) {
    try {
      const decoded = decodeBase64FilterUrl(decodeURIComponent(encoded));
      if (decoded && typeof decoded === "object") {
        const str = (v) => (v ? "1" : "");
        const num = (v) => (v ? 1 : 0);
        const flag = (v) => (flagsNumeric ? num(v) : str(v));
        return {
          ...DEFAULT_PROJECT_FILTERS,
          keywords: decoded?.search || "",
          category_id: decoded?.category_id || "",
          city: decoded?.location?.city || "",
          state: decoded?.location?.state || "",
          country: decoded?.location?.country || "",
          posted_since: getPostedSinceString(decoded.posted_since),
          promoted: flag(decoded?.flags?.promoted),
          is_premium: flag(decoded?.flags?.get_all_premium_properties),
          most_viewed: flag(decoded?.flags?.most_views),
          most_liked: flag(decoded?.flags?.most_liked),
          project_type: decoded?.project_type !== undefined ? decoded.project_type : "",
        };
      }
    } catch (error) {
      console.error("[serverFetch] Error decoding project filters from URL:", error);
    }
  }

  return { ...DEFAULT_PROJECT_FILTERS };
};

/**
 * Fetches the first page of a project listing during SSR so search engines
 * receive real project cards instead of an empty shell.
 *
 * @param {object} options
 * @param {object} [options.filters] - Project filter state (for snapshot parity)
 * @param {object} [options.query]   - Router query (legacy base64 `filters` param)
 * @param {object} [options.slugFlags] - { promoted, most_viewed, most_liked }
 * @param {string} options.lang      - Language code for Content-Language header
 * @param {number} [options.limit]   - Page size
 * @param {number} [options.offset]  - Pagination offset
 * @returns {Promise<object|null>}
 */
export const fetchServerSideProjectList = async ({
  filters = null,
  query = {},
  slugFlags = { promoted: 0, most_viewed: 0, most_liked: 0 },
  lang = "es",
  extraHeaders = {},
  limit = 9,
  offset = 0,
}) => {
  let apiParams = { limit, offset };
  const urlFilters = normalizeQueryValue(query?.filters);
  if (urlFilters) {
    apiParams.filters = urlFilters;
  } else if (filters) {
    const { encodedFilters } = buildProjectFilters(filters, { slugFlags });
    if (encodedFilters) apiParams.filters = encodedFilters;
  }

  const data = await fetchSeoData(GET_PROJECTS, apiParams, lang, extraHeaders);
  if (!data || data.error) return null;

  return {
    projects: data?.data || [],
    total: data?.total || 0,
    hasMore: (data?.total || 0) > offset + (data?.data?.length || 0),
    filters,
  };
};