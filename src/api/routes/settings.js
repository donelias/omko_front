import api from "../axiosMiddleware";
import * as apiEndpoints from "../apiEndpoints";
import {
  createFilteredFormData,
  getFilteredParams,
} from "@/utils/helperFunction";

// 1.Get Web Settings
export const getWebSetting = async () => {
  const res = await api.get(apiEndpoints.WEB_SETTINGS);
  return res.data;
};

// 2.Get Home Page Data
export const getHomePageData = async ({
  latitude = "",
  longitude = "",
  radius = "",
}) => {
  // Only include params that have values
  const params = {};
  if (latitude) params.latitude = latitude;
  if (longitude) params.longitude = longitude;
  if (radius) params.radius = radius;

  const res = await api.get(apiEndpoints.HOMEPAGE_DATA, { params });
  return res.data;
};

// 5.Get Language Data
export const getLanguageData = async ({
  language_code,
  web_language_file = 1,
}) => {
  const params = { language_code, web_language_file };
  const res = await api.get(apiEndpoints.GET_LANGUAGES, { params });
  return res.data;
};

// 110. Update Notification Language API
export const updateNotificationLanguageApi = async ({
  language_code = ""
}) => {
  const formData = createFilteredFormData({
    language_code
  });
  const res = await api.post(apiEndpoints.UPDATE_NOTIFICATION_LANGUAGE, formData);
  return res.data;
}

// 103
export const getAboutUsApi = async () => {
  const res = await api.get(apiEndpoints.GET_ABOUT_US);
  return res.data;
}

// 104
export const getTermsAndConditionsApi = async () => {
  const res = await api.get(apiEndpoints.GET_TERMS_AND_CONDITIONS);
  return res.data;
}

// 105
export const getPrivacyPolicyApi = async () => {
  const res = await api.get(apiEndpoints.GET_PRIVACY_POLICY);
  return res.data;
}

export const getCustomPagesApi = async ({
  slug_id = "",
  id = "",
  limit = "10",
  offset = ""
}) => {
  const params = getFilteredParams({
    slug_id,
    id,
    limit,
    offset
  })
  const res = await api.get(apiEndpoints.GET_CUSTOM_PAGES, { params });
  return res.data;
}
