import api from "../axiosMiddleware";
import * as apiEndpoints from "../apiEndpoints";
import {
  createFilteredFormData,
  getFilteredParams,
} from "@/utils/helperFunction";

// 3.Get Cities Data
export const getCitiesData = async ({ offset, limit }) => {
  const params = { offset: offset, limit: limit };
  const res = await api.get(apiEndpoints.GET_CITYS_DATA, { params });
  return res.data;
};

// 4.Get Property Details
export const getPropertyDetails = async ({ slug_id }) => {
  const params = { slug_id: slug_id };
  const res = await api.get(apiEndpoints.GET_PROPETRES, { params });
  return res.data;
};

export const getPropertyListApi = async (params = {}) => {
  const {
    property_type,
    category_id,
    category_slug_id,
    parameters,
    nearby_places,
    location,
    price,
    posted_since,
    search,
    flags,
    project_id,
    is_project_unit,
    availability,
    limit = "",
    offset = ""
  } = params;

  // Build filtersObject — only include keys with real values.
  // property_type === 0 is a valid value (Sell), so check for undefined explicitly.
  const filtersObject = {};

  if (property_type !== undefined && property_type !== "") {
    filtersObject.property_type = property_type;
  }
  if (category_id) filtersObject.category_id = category_id;
  if (category_slug_id) filtersObject.category_slug_id = category_slug_id;
  if (Array.isArray(parameters) && parameters.length > 0) filtersObject.parameters = parameters;
  if (Array.isArray(nearby_places) && nearby_places.length > 0) filtersObject.nearby_places = nearby_places;
  if (location && typeof location === "object" && Object.keys(location).length > 0) filtersObject.location = location;
  if (price && typeof price === "object" && Object.keys(price).length > 0) filtersObject.price = price;
  // posted_since 0 is a valid value (lastWeek), so only omit when undefined / null / ""
  if (posted_since !== undefined && posted_since !== null && posted_since !== "") {
    filtersObject.posted_since = posted_since;
  }
  if (search) filtersObject.search = search;
  if (flags && typeof flags === "object" && Object.keys(flags).length > 0) filtersObject.flags = flags;
  if (project_id) filtersObject.project_id = project_id;
  if (is_project_unit !== undefined && is_project_unit !== "") filtersObject.is_project_unit = is_project_unit;
  if (availability && typeof availability === "object" && Object.keys(availability).length > 1) filtersObject.availability = availability;

  // Only encode and send filters when there is at least one active filter.
  // An empty filtersObject would produce "e30=" (base64 of "{}") which is meaningless.
  const requestParams = {
    limit: parseInt(limit) || 10,
    offset: parseInt(offset) || 0
  };

  if (Object.keys(filtersObject).length > 0) {
    // requestParams.filters = btoa(JSON.stringify(filtersObject));
    requestParams.filters = btoa(unescape(encodeURIComponent(JSON.stringify(filtersObject))));
  }

  const filteredParams = getFilteredParams(requestParams);


  const res = await api.get(apiEndpoints.GET_PROPERTY_LIST, {
    params: filteredParams,
  });
  return res.data;
};


export const getCountbyCityApi = async ({ offset = "", limit = "" }) => {
  const params = {
    offset,
    limit,
  };
  const res = await api.get(apiEndpoints.GET_CITYS_DATA, { params });
  return res.data;
};

// 28. Get Added Properties
export const getAddedPropertiesApi = async ({
  limit = "",
  offset = "",
  slug_id = "",
  is_promoted = "",
  request_status = "",
  property_type = "",
  added_as = "",
  status = ""
}) => {
  const params = {
    limit, offset,
    slug_id: slug_id ? slug_id : undefined,
    is_promoted: is_promoted ? is_promoted : undefined,
    // Special handling for request_status and property_type
    request_status: request_status !== " " ? request_status : undefined,
    property_type: property_type !== " " ? property_type : undefined,
    added_as: added_as ? added_as : undefined,
    status: status ? status : undefined
  };
  const res = await api.get(apiEndpoints.GET_ADDED_PROPERTIES, { params });
  return res.data;
};

// 32. Change Property Status
export const changePropertyStatusApi = async ({
  property_id = "",
  status = "",
}) => {
  const formData = createFilteredFormData({ property_id, status });
  const res = await api.post(apiEndpoints.CHANGE_PROPERTY_STATUS, formData);
  return res.data;
};

// 33. Update Property Status
export const updatePropertyStatusApi = async ({
  property_id = "",
  status = "",
}) => {
  const formData = createFilteredFormData({ property_id, status });
  const res = await api.post(apiEndpoints.UPDATE_PROPERTY_STATUS, formData);
  return res.data;
};

// 35. Feature Property
export const featurePropertyApi = async ({
  feature_for = "",
  property_id = "",
  project_id = "",
}) => {
  const formData = createFilteredFormData({
    feature_for,
    property_id,
    project_id,
  });
  const res = await api.post(apiEndpoints.STORE_ADVERTISEMENT, formData);
  return res.data;
};

// 36. Delete Property
export const deletePropertyApi = async ({ id = "" }) => {
  const formData = createFilteredFormData({ id });
  const res = await api.post(apiEndpoints.DELETE_PROPERTY, formData);
  return res.data;
};

// 50. Post Property
export const postPropertyApi = async ({
  userid = "",
  title = "",
  description = "",
  city = "",
  state = "",
  country = "",
  latitude = "",
  longitude = "",
  address = "",
  price = "",
  category_id = "",
  property_type = "",
  video_link = "",
  video_type = "",
  custom_video = null,
  parameters = {},
  facilities = {},
  title_image = null,
  three_d_image = null,
  gallery_images = [],
  meta_title = "",
  meta_description = "",
  meta_keywords = "",
  meta_image = null,
  rentduration = "",
  is_premium = "",
  client_address = "",
  slug_id = "",
  documents = [],
  translations = [],
  is_draft = false
}) => {
  const formData = new FormData();

  // Basic property details
  if (userid) {
    formData.append("userid", userid);
  }
  if (title) {
    formData.append("title", title);
  }
  if (description) {
    formData.append("description", description);
  }
  if (city) {
    formData.append("city", city);
  }
  if (state) {
    formData.append("state", state);
  }
  if (country) {
    formData.append("country", country);
  }
  if (latitude) {
    formData.append("latitude", latitude);
  }
  if (longitude) {
    formData.append("longitude", longitude);
  }
  if (address) {
    formData.append("address", address);
  }
  if (price) {
    formData.append("price", price);
  }
  if (category_id) {
    formData.append("category_id", category_id);
  }
  if (property_type) {
    formData.append("property_type", property_type);
  }

  if (video_type) {
    formData.append("video_type", video_type === "youtubeLink" ? 1 : video_type === "vimeoLink" ? 2 : 0);
  }

  if (custom_video) {
    formData.append("custom_video", custom_video);
  }
  if (video_link) {
    formData.append("video_link", video_link);
  }

  if (meta_title) {
    formData.append("meta_title", meta_title);
  }
  if (meta_description) {
    formData.append("meta_description", meta_description);
  }
  if (meta_keywords) {
    formData.append("meta_keywords", meta_keywords);
  }
  if (meta_image) {
    formData.append("meta_image", meta_image);
  }
  if (property_type === "1" && rentduration) {
    formData.append("rentduration", rentduration);
  }
  if (is_premium) {
    formData.append("is_premium", is_premium);
  }
  if (client_address) {
    formData.append("client_address", client_address);
  }
  if (slug_id) {
    formData.append("slug_id", slug_id);
  }
  if (is_draft) {
    formData.append("is_draft", is_draft);
  }

  // Handle translations data
  if (translations && translations.length > 0) {
    translations.forEach((translation, index) => {
      // Handle title with its nested properties
      if (translation.title) {
        // Handle translation_id for title
        formData.append(`translations[${index}][title][translation_id]`, "");

        // Handle language_id for title
        if (translation.language_id) {
          formData.append(
            `translations[${index}][title][language_id]`,
            translation.language_id,
          );
        }

        // Handle value for title
        if (translation.title) {
          formData.append(
            `translations[${index}][title][value]`,
            translation.title,
          );
        }
      }

      // Handle description with its nested properties
      if (translation.description) {
        // Handle translation_id for description
        formData.append(
          `translations[${index}][description][translation_id]`,
          "",
        );

        // Handle language_id for description
        if (translation.language_id) {
          formData.append(
            `translations[${index}][description][language_id]`,
            translation.language_id,
          );
        }

        // Handle value for description
        if (translation.description) {
          formData.append(
            `translations[${index}][description][value]`,
            translation.description,
          );
        }
      }
    });
  }

  // Media files
  if (title_image) {
    formData.append("title_image", title_image);
  }
  if (three_d_image) {
    formData.append("three_d_image", three_d_image);
  }

  // Transform facilities data into the expected format
  if (facilities && Object.keys(facilities).length > 0) {
    Object.entries(facilities).forEach(([facilityId, distance], index) => {
      formData.append(`facilities[${index}][facility_id]`, facilityId);
      formData.append(`facilities[${index}][distance]`, distance);
    });
  }

  // Transform parameters data into the expected format
  if (parameters && Object.keys(parameters).length > 0) {
    Object.entries(parameters).forEach(([parameterId, value], index) => {
      formData.append(`parameters[${index}][parameter_id]`, parameterId);
      formData.append(`parameters[${index}][value]`, value);
    });
  }

  // Append gallery images as array elements
  if (Array.isArray(gallery_images) && gallery_images.length > 0) {
    gallery_images.forEach((image, index) => {
      formData.append(`gallery_images[${index}]`, image);
    });
  }

  // Append documents as array elements
  if (Array.isArray(documents) && documents.length > 0) {
    documents.forEach((doc, index) => {
      formData.append(`documents[${index}]`, doc);
    });
  }

  const res = await api.post(apiEndpoints.POST_PROPERTY, formData);
  return res.data;
};

// 51. Update Property
export const updatePostPropertyApi = async ({
  action_type = "",
  id = "",
  title = "",
  description = "",
  city = "",
  state = "",
  country = "",
  latitude = "",
  longitude = "",
  address = "",
  price = "",
  category_id = "",
  property_type = "",
  video_link = "",
  video_type = "",
  custom_video = null,
  parameters = [],
  facilities = [],
  title_image = "",
  three_d_image = "",
  gallery_images = [],
  slug_id = "",
  meta_title = "",
  meta_description = "",
  meta_keywords = "",
  meta_image = "",
  rentduration = "",
  is_premium = "",
  client_address = "",
  remove_gallery_images = "",
  remove_documents = "",
  documents = [],
  remove_three_d_image,
  translations = [],
  remove_meta_image = "",
  remove_video = 0,
}) => {
  let data = new FormData();

  // Append the property data to the FormData object
  if (action_type) {
    data.append("action_type", action_type);
  }
  if (id) {
    data.append("id", id);
  }
  if (title) {
    data.append("title", title);
  }
  if (description) {
    data.append("description", description);
  }
  if (city) {
    data.append("city", city);
  }
  if (state) {
    data.append("state", state);
  }
  if (country) {
    data.append("country", country);
  }
  if (latitude) {
    data.append("latitude", latitude);
  }
  if (longitude) {
    data.append("longitude", longitude);
  }
  if (address) {
    data.append("address", address);
  }
  if (price) {
    data.append("price", price);
  }
  if (category_id) {
    data.append("category_id", category_id);
  }
  if (property_type) {
    data.append("property_type", property_type);
  }
  if (video_link) {
    data.append("video_link", video_link);
  }
  if (video_type) {
    data.append("video_type", video_type === "youtubeLink" ? 1 : video_type === "vimeoLink" ? 2 : 0);
  }
  if (custom_video) {
    data.append("custom_video", custom_video);
  }
  if (title_image) {
    data.append("title_image", title_image);
  }
  if (three_d_image) {
    data.append("three_d_image", three_d_image);
  }
  if (slug_id) {
    data.append("slug_id", slug_id);
  }
  if (meta_title) {
    data.append("meta_title", meta_title);
  }
  if (meta_description) {
    data.append("meta_description", meta_description);
  }
  if (meta_keywords) {
    data.append("meta_keywords", meta_keywords);
  }
  // Only append meta_image if it's a File or empty, skip if it's a string
  if (meta_image instanceof File) {
    data.append("meta_image", meta_image); // Pass file if it's a File
  } else if (!meta_image) {
    data.append("meta_image", ""); // Pass empty string if meta_image is null/undefined
  }
  if (property_type === "1" && rentduration) {
    data.append("rentduration", rentduration);
  }
  if (is_premium) {
    data.append("is_premium", is_premium);
  }
  if (client_address) {
    data.append("client_address", client_address);
  }
  if (remove_three_d_image) {
    data.append("remove_three_d_image", remove_three_d_image);
  }

  if (remove_meta_image) {
    data.append("remove_meta_image", remove_meta_image);
  }

  if (remove_video) {
    data.append("remove_video", remove_video);
  }
  // Handle translations data
  if (translations && translations.length > 0) {
    translations.forEach((translation, index) => {
      // Handle title with its nested properties
      if (translation.title) {
        // Handle translation_id for title
        if (translation.title.translation_id !== undefined) {
          data.append(
            `translations[${index}][title][translation_id]`,
            translation.title.translation_id,
          );
        }

        // Handle language_id for title
        if (translation.title.language_id) {
          data.append(
            `translations[${index}][title][language_id]`,
            translation.title.language_id,
          );
        }

        // Handle value for title
        if (translation.title.value) {
          data.append(
            `translations[${index}][title][value]`,
            translation.title.value,
          );
        }
      }

      // Handle description with its nested properties
      if (translation.description) {
        // Handle translation_id for description
        if (translation.description.translation_id !== undefined) {
          data.append(
            `translations[${index}][description][translation_id]`,
            translation.description.translation_id,
          );
        }

        // Handle language_id for description
        if (translation.description.language_id) {
          data.append(
            `translations[${index}][description][language_id]`,
            translation.description.language_id,
          );
        }

        // Handle value for description
        if (translation.description.value) {
          data.append(
            `translations[${index}][description][value]`,
            translation.description.value,
          );
        }
      }
    });
  }

  // Append the parameters array if it is an array
  if (Array.isArray(parameters)) {
    parameters.forEach((parameter, index) => {
      data.append(`parameters[${index}][parameter_id]`, parameter.parameter_id);
      data.append(`parameters[${index}][value]`, parameter.value);
    });
  }
  // Append the facilities array if it is an array
  if (Array.isArray(facilities)) {
    facilities.forEach((facility, index) => {
      data.append(`facilities[${index}][facility_id]`, facility.facility_id);
      data.append(`facilities[${index}][distance]`, facility.distance);
    });
  }

  // Check if gallery_images is defined and an array before using forEach
  if (Array.isArray(documents)) {
    documents.forEach((image, index) => {
      data.append(`documents[${index}]`, image);
    });
  }
  if (Array.isArray(gallery_images)) {
    gallery_images.forEach((image, index) => {
      data.append(`gallery_images[${index}]`, image);
    });
  }
  if (Array.isArray(remove_gallery_images)) {
    remove_gallery_images.forEach((image, index) => {
      data.append(`remove_gallery_images[${index}]`, image);
    });
  }
  if (Array.isArray(remove_documents)) {
    remove_documents.forEach((image, index) => {
      data.append(`remove_documents[${index}]`, image);
    });
  }

  const res = await api.post(apiEndpoints.UPDATE_POST_PROPERTY, data);
  return res.data;
};

// 65. Interested Property
export const interestedPropertyApi = async ({
  property_id = "",
  type = "",
}) => {
  const formData = createFilteredFormData({
    property_id,
    type,
  });
  const res = await api.post(apiEndpoints.INTEREST_PROPERTY, formData);
  return res.data;
};

// 69. GET ALL SIMILAR PROPERTIES
export const getAllSimilarPropertiesApi = async ({
  property_id = "",
  limit = "",
  offset = "",
  search = "",
}) => {
  const params = { property_id, limit, offset, search };
  const res = await api.get(apiEndpoints.GET_ALL_SIMILAR_PROPERTIES, {
    params,
  });
  return res.data;
};

// 70. Compare Properties API
export const comparePropertiesAPI = async ({
  source_property_id = "",
  target_property_id = "",
}) => {
  const params = {
    source_property_id,
    target_property_id,
  };
  const res = await api.get(apiEndpoints.COMPARE_PROPERTIES, { params });
  return res.data;
};

// 72. Get Property On Map
export const getPropertyOnMapApi = async ({
  filters = "",
}) => {
  const data = {
    filters,
  };
  const params = getFilteredParams(data);
  const res = await api.get(apiEndpoints.GET_PROPERTY_ON_MAP, { params });
  return res.data;
};

// 75. Get Amenities and Nearby Place data for filter
export const getAdvancedFilterDataApi = async () => {
  const res = await api.get(apiEndpoints.GET_ADVANCE_PROPERTY_FILTER);
  return res.data;
};

// 98. GET Homepage Properties on map section
export const getHomepagePropertiesOnMapSectionApi = async ({
  latitude,
  longitude,
  radius
}) => {
  const params = getFilteredParams({
    latitude,
    longitude,
    radius
  });
  const res = await api.get(apiEndpoints.GET_HOMEPAGE_PROPERTIES_ON_MAP_SECTION, { params });
  return res.data;
};

// 99. GET Homepage Property By Cities Section
export const getHomepagePropertyByCitiesSectionApi = async () => {
  const res = await api.get(apiEndpoints.GET_HOMEPAGE_PROPERTIES_BY_CITIES_SECTION);
  return res.data;
};

export const renewListingApi = async ({
  id = "", // property/project id
  type = "" // property/project
}) => {
  const formData = createFilteredFormData({
    id,
    type
  });
  const res = await api.post(apiEndpoints.RENEW_LISTING, formData);
  return res.data;
}

export const activateListingApi = async ({ id = "", listing_type = "" }) => {
  const formData = createFilteredFormData({
    id, // property_id or project_id based on listing_type
    listing_type // property or project
  });
  const res = await api.post(apiEndpoints.ACTIVATE_LISTING, formData);
  return res.data;
}
