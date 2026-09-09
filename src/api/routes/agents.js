import api from "../axiosMiddleware";
import * as apiEndpoints from "../apiEndpoints";
import {
  createFilteredFormData,
  getFilteredParams,
} from "@/utils/helperFunction";

// 25. Get All Agents
export const getAllAgentsApi = async ({ limit = "", offset = "" }) => {
  const params = { limit, offset };
  const res = await api.get(apiEndpoints.AGENT_LIST, { params });
  return res.data;
};

// 58. Get Agent Properties
export const getAgentPropertiesApi = async ({
  is_admin = "",
  slug_id = "",
  search = "",
  is_projects = "",
  limit = "",
  offset = "",
  filters
}) => {
  const params = getFilteredParams({
    is_admin,
    slug_id,
    is_projects,
    limit,
    offset,
    search,
    filters
  });
  const res = await api.get(apiEndpoints.AGENT_PROPERTIES, { params });
  return res.data;
};

// 74. Get Agent Profile
export const fetchAgentProfileApi = async () => {
  const res = await api.get(apiEndpoints.GET_AGENT_PROFILE);
  return res.data;
};

// 45. Update Agent Profile
export const updateAgentProfileApi = async ({
  agent_name = "",
  agent_email = "",
  about_me = "",
  agent_address = "",
  facebook_id = "",
  twitter_id = "",
  youtube_id = "",
  instagram_id = "",
  linkedin_id = "",
  agent_profile_photo = "",
  agent_mobile = "",
  agent_country_code,
  agent_banner
}) => {
  const formData = createFilteredFormData({
    agent_name,
    agent_email,
    about_me,
    agent_address,
    facebook_id,
    twitter_id,
    youtube_id,
    instagram_id,
    agent_mobile,
    agent_profile_photo,
    agent_country_code,
    linkedin_id,
    agent_banner
  });
  const res = await api.post(apiEndpoints.UPDATE_AGENT_PROFILE, formData);
  return res.data;
};

export const getAgentPackagesApi = async ({ }) => {
  const res = await api.get(apiEndpoints.GET_AGENT_PACKAGES);
  return res.data;
}

// AGENT DASHBOARD APIS 
// 87. Get Agent Dashboard Summary
export const getAgentDashboardSummaryApi = async () => {
  const res = await api.get(apiEndpoints.GET_AGENT_DASHBOARD_SUMMARY);
  return res.data;
};

// 88. Get Agent Dashboard Listings 
export const getAgentDashboardListingsApi = async ({ type, range }) => {
  const params = getFilteredParams({
    type,
    range
  });
  const res = await api.get(apiEndpoints.GET_AGENT_DASHBOARD_LISTINGS, { params });
  return res.data;
};

// 89 Get Agent Dashboard Most Viewed Category
export const getAgentDashboardMostViewedCategoryApi = async ({ range }) => {
  const params = getFilteredParams({
    range
  });
  const res = await api.get(apiEndpoints.GET_AGENT_DASHBOARD_MOST_VIEWED_CATEGORY, { params });
  return res.data;
};

// 90 Get Agent Dashboard Active Packages 
export const getAgentDashboardActivePackagesApi = async () => {
  const res = await api.get(apiEndpoints.GET_AGENT_DASHBOARD_ACTIVE_PACKAGES);
  return res.data;
};

// 91 Get Agent Dashboard Most Viewed Listing
export const getAgentDashboardMostViewedListingApi = async ({ type, range }) => {
  const params = getFilteredParams({
    type,
    range
  });
  const res = await api.get(apiEndpoints.GET_AGENT_DASHBOARD_MOST_VIEWED_LISTING, { params });
  return res.data;
};

// 92. Get Agent Dashboard Appointments
export const getAgentDashboardAppointmentsApi = async ({ range, offset, limit }) => {
  const params = getFilteredParams({
    range,
    offset,
    limit
  });
  const res = await api.get(apiEndpoints.GET_AGENT_DASHBOARD_APPOINTMENTS, { params });
  return res.data;
};

export const getAgentWatermarkSettingsApi = async ({ }) => {
  const res = await api.get(apiEndpoints.GET_AGENT_WATERMARK_SETTINGS);
  return res.data;
}

/**
 * Updates agent watermark settings.
 *
 * @typedef {Object} WatermarkSettings
 * @property {boolean|number} [watermark_enabled=false] - Whether watermarking is enabled. Use true/false or 1/0.
 * @property {string|number} [watermark_opacity=""] - Watermark opacity (0-100).
 * @property {File|Blob|FormData|string} [watermark_image] - Watermark image file, blob, FormData entry or URL string.
 * @property {string|number} [watermark_size] - Watermark size (0-100).
 * @property {string} [watermark_style=""] - Watermark style: 'tile' or 'single'.
 * @property {string} [watermark_position=""] - Watermark position: 'top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'.
 * @property {string|number} [watermark_rotation=""] - Watermark rotation (0-360).
 *
 * @param {WatermarkSettings} params - Watermark settings.
 * @returns {Promise<Object>} API response data.
 */
export const updateAgentWatermarkSettingsApi = async ({
  watermark_enabled = false, // true or false
  watermark_opacity = "", // 0 to 100
  watermark_image,
  watermark_size, // 0 to 100
  watermark_style = "", // tile, single
  watermark_position = "", //top-left, top-right, bottom-left, bottom-right, center
  watermark_rotation = "" // 0 to 360
}) => {
  const formData = createFilteredFormData({
    watermark_enabled: watermark_enabled ? 1 : 0, // Convert boolean to 1 or 0
    watermark_opacity,
    watermark_image,
    watermark_size,
    watermark_style,
    watermark_position,
    watermark_rotation
  });
  const res = await api.post(apiEndpoints.UPDATE_AGENT_WATERMARK_SETTINGS, formData);
  return res.data;
}
