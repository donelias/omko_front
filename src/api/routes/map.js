import api from "../axiosMiddleware";
import * as apiEndpoints from "../apiEndpoints";
import { getFilteredParams } from "@/utils/helperFunction";
import { MAP_SERVICE_PROVIDERS, getActiveMapServiceProvider } from "@/utils/mapProvider";

const buildAddressComponentsFromPlace = (place = {}) => {
  const components = [];

  if (place.city) {
    components.push({ long_name: place.city, short_name: place.city, types: ["locality"] });
  }
  if (place.state) {
    components.push({ long_name: place.state, short_name: place.state, types: ["administrative_area_level_1"] });
  }
  if (place.country) {
    components.push({ long_name: place.country, short_name: place.country, types: ["country"] });
  }

  return components;
};

const normalizeMapDetailsResponse = (response) => {
  const result = response?.data?.result;
  if (!result) return response;

  const formattedAddress = result.formatted_address || result.address || "";
  const normalizedResult = {
    ...result,
    formatted_address: formattedAddress,
    address_components: result.address_components?.length
      ? result.address_components
      : buildAddressComponentsFromPlace(result),
    geometry: result.geometry || {
      location: {
        lat: Number(result.lat || result.latitude),
        lng: Number(result.lng || result.longitude),
      },
    },
  };

  return {
    ...response,
    data: {
      ...response.data,
      result: normalizedResult,
    },
  };
};

// 76. Get Map Places List
export const getMapPlacesListApi = async ({
  input = "",
  provider = getActiveMapServiceProvider()
}) => {
  const params = { input };
  const endpoint = provider === MAP_SERVICE_PROVIDERS.OPEN_STREET_MAPS
    ? apiEndpoints.GET_OSM_MAP_PLACES_LIST
    : apiEndpoints.GET_MAP_PLACES_LIST;
  const res = await api.get(endpoint, { params });
  return res.data;
};


// 77. Get Place Detail
export const getMapDetailsApi = async ({
  latitude = "",
  longitude = "",
  place_id = "",
  provider = getActiveMapServiceProvider()
}) => {
  const params = getFilteredParams({
    latitude,
    longitude,
    place_id
  });
  const endpoint = provider === MAP_SERVICE_PROVIDERS.OPEN_STREET_MAPS
    ? apiEndpoints.GET_OSM_MAP_PLACE_DETAILS
    : apiEndpoints.GET_MAP_PLACE_DETAILS;
  const res = await api.get(endpoint, { params });
  return normalizeMapDetailsResponse(res.data);
};
