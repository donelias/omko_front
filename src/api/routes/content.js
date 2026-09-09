import api from "../axiosMiddleware";
import * as apiEndpoints from "../apiEndpoints";
import {
  createFilteredFormData,
  getFilteredParams,
} from "@/utils/helperFunction";

// 27. Get All Articles
export const getArticlesApi = async ({
  id = "",
  category_id = "",
  slug_id = "",
  limit = "",
  offset = "",
}) => {
  const params = {
    id,
    category_id,
    slug_id,
    limit,
    offset,
  };
  const filteredParams = getFilteredParams(params);
  const res = await api.get(apiEndpoints.GET_ARTICLES, {
    params: filteredParams,
  });
  return res.data;
};

// 13.Get Categories
export const getCategoriesApi = async ({
  limit = "",
  offset = "",
  has_property = false,
  passHasProperty = true,
  slug_id = "",
  id = "",
  latitude = "",
  longitude = "",
  radius = "",
}) => {
  let params = {};
  if (limit) {
    params.limit = limit;
  }
  if (offset) {
    params.offset = offset;
  }
  if (passHasProperty) {
    params.has_property = has_property;
  }
  if (slug_id) {
    params.slug_id = slug_id
  }
  if (id) {
    params.id = id
  }
  if (latitude) {
    params.latitude = latitude;
  }
  if (longitude) {
    params.longitude = longitude;
  }
  if (radius) {
    params.radius = radius;
  }

  const res = await api.get(apiEndpoints.GET_CATEGORIES, { params });
  return res.data;
};

// 14.Get Facilities
export const getFacilitiesApi = async () => {
  const res = await api.get(apiEndpoints.GET_FACILITIES);
  return res.data;
};

// 15. Get Facilities for Filter
export const getFacilitiesForFilterApi = async () => {
  const res = await api.get(apiEndpoints.GET_FACILITITES_FOR_FILTER);
  return res.data;
};

// 24. Get FAQs
export const getFaqsApi = async ({ limit = "", offset = "" }) => {
  const params = {
    limit,
    offset,
  };
  const filteredParams = getFilteredParams(params);
  const res = await api.get(apiEndpoints.FAQS, { params: filteredParams });
  return res.data;
};

// 16. Contact Us
export const contactUsApi = async ({
  first_name = "",
  last_name = "",
  email = "",
  subject = "",
  message = "",
}) => {
  const formData = createFilteredFormData({
    first_name,
    last_name,
    email,
    subject,
    message,
  });
  const res = await api.post(apiEndpoints.CONTACT_US, formData);
  return res.data;
};

// 68. Mortgage Caculation PAI
export const mortgageCalculationApi = async ({
  loan_amount = "",
  down_payment = "",
  interest_rate = "",
  loan_term_years = "",
  show_all_details = "",
}) => {
  const params = {
    loan_amount,
    down_payment,
    interest_rate,
    loan_term_years,
    show_all_details,
  };
  const res = await api.get(apiEndpoints.MORTGAGE_CALCULATOR, { params });
  return res.data;
};

// 100. GET Ad Banners
/**
 * Fetch Ad Banners
 * @param {Object} params - Query parameters
 * @param {"homepage"|"property_detail"|"property_listing"} params.page - Page identifier. Expected values: "homepage", "property_details" and "project_details"
 * @param {"web"} params.platform - Platform type. Expected values: "web" | "mobile"
 * @returns {Promise<Object>} - Ad Banners data
 */
export const getAdBannerApi = async ({
  page = "",
  platform = "web"
}) => {
  const res = await api.get(apiEndpoints.GET_AD_BANNERS, { params: { page, platform } });
  return res.data;
}
