import api from "../axiosMiddleware";
import * as apiEndpoints from "../apiEndpoints";
import {
  getFilteredParams,
} from "@/utils/helperFunction";

// 106. GET Homepage Sections List API
export const getHomepageSectionsApi = async ({ }) => {
  const res = await api.get(apiEndpoints.GET_HOMEPAGE_SECTIONS);
  return res.data;
}

// 107. GET Homepage Property Sections API - nearby_properties, featured_properties, most_viewed_properties, most_liked_properties, premium_properties
export const getHomepagePropertiesSectionApi = async ({
  latitude = "",
  longitude = "",
  radius = ""
}) => {
  const params = getFilteredParams({
    latitude,
    longitude,
    radius
  })
  const res = await api.get(apiEndpoints.GET_HOMEPAGE_PROPERTY_SECTIONS, { params });
  return res.data;
}

// 108. GET Homepage Project Sections API - projects, featured_projects
export const getHomepageProjectsSectionApi = async ({
  latitude = "",
  longitude = "",
  radius = ""
}) => {
  const params = getFilteredParams({
    latitude,
    longitude,
    radius
  })
  const res = await api.get(apiEndpoints.GET_HOMEPAGE_PROJECT_SECTIONS, { params });
  return res.data
}

// 109. GET Homepage Other Sections API - categories, agents, articles, user_recommendations, faqs, slider
export const getHomepageOtherSectionsApi = async ({
  latitude = "",
  longitude = "",
  radius = ""
}) => {
  const params = getFilteredParams({
    latitude,
    longitude,
    radius
  })
  const res = await api.get(apiEndpoints.GET_HOMEPAGE_OTHER_SECTIONS, { params });
  return res.data
}
