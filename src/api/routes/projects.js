import api from "../axiosMiddleware";
import * as apiEndpoints from "../apiEndpoints";
import {
  createFilteredFormData,
  getFilteredParams,
} from "@/utils/helperFunction";

// 26. Get All Projects
export const getAllProjectsApi = async ({
  limit = "",
  offset = "",
  filters = "",
}) => {
  const params = {
    limit: parseInt(limit) || 10,
    offset: parseInt(offset) || 0,
  };

  if (filters) {
    params.filters = filters;
  }

  const filteredParams = getFilteredParams(params);
  const res = await api.get(apiEndpoints.GET_PROJECTS, {
    params: filteredParams,
  });
  return res.data;
};

// 37. Get Project Details
export const getProjectDetailsApi = async ({
  slug_id = "",
  get_similar = "",
}) => {
  const params = { slug_id, get_similar };
  const filteredParams = getFilteredParams(params);
  const res = await api.get(apiEndpoints.GET_PROJECT_DETAILS, {
    params: filteredParams,
  });
  return res.data;
};

// 39. Get User Projects
export const getUserProjectsApi = async ({
  limit = "",
  offset = "",
  slug_id = "",
  type = "",
  request_status = "",
  added_as = "",
  status = ""
}) => {
  const params = {
    limit,
    offset,
    // Special handling for slug_id, type, and request_status
    slug_id: slug_id ? slug_id : undefined,
    type: type !== " " ? type : undefined,
    request_status: request_status !== " " ? request_status : undefined,
    added_as: added_as ? added_as : undefined,
    status: status ? status : undefined
  };
  const res = await api.get(apiEndpoints.GET__MY_PROJECTS, { params });
  return res.data;
};

// 40. Change Project Status
export const changeProjectStatusApi = async ({
  project_id = "",
  status = "",
}) => {
  const formData = createFilteredFormData({ project_id, status });
  const res = await api.post(apiEndpoints.CHANGE_PROJECT_STATUS, formData);
  return res.data;
};

// 41. Delete Project
export const deleteProjectApi = async ({ id = "" }) => {
  const formData = createFilteredFormData({ id });
  const res = await api.post(apiEndpoints.DELETE_PROJECT, formData);
  return res.data;
};

// 56. Post Project
export const postProjectApi = async ({
  id = "",
  title = "",
  description = "",
  category_id = "",
  type = "",
  meta_title = "",
  meta_description = "",
  meta_keywords = "",
  meta_image = null,
  city = "",
  state = "",
  country = "",
  latitude = "",
  longitude = "",
  location = "",
  video_link = "",
  video_type = "",
  custom_video = null,
  image = null,
  plans = [],
  documents = [],
  gallery_images = [],
  remove_documents = [],
  remove_gallery_images = [],
  remove_plans = [],
  slug_id = "",
  translations = [],
  remove_meta_image = "",
  is_premium = false,
  remove_video = 0,
  is_draft = false
}) => {
  let data = new FormData();
  // Append the property data to the FormData object
  if (id) {
    data.append("id", id);
  }
  if (title) {
    data.append("title", title);
  }
  if (description) {
    data.append("description", description);
  }
  if (category_id) {
    data.append("category_id", category_id);
  }
  if (type) {
    data.append("type", type);
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
  if (location) {
    data.append("location", location);
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
  if (image) {
    data.append("image", image);
  }
  if (remove_documents) {
    data.append("remove_documents", remove_documents);
  }
  if (remove_gallery_images) {
    data.append("remove_gallery_images", remove_gallery_images);
  }
  if (remove_plans) {
    data.append("remove_plans", remove_plans);
  }
  if (remove_meta_image) {
    data.append("remove_meta_image", remove_meta_image);
  }
  if (slug_id) {
    data.append("slug_id", slug_id);
  }
  if (is_premium === true) {
    data.append("is_premium", 1);
  }
  if (remove_video) {
    data.append("remove_video", remove_video);
  }
  if (is_draft) {
    data.append("is_draft", is_draft);
  }

  // Handle translations data
  if (translations && translations.length > 0) {
    translations.forEach((translation, index) => {
      // Handle title with its nested properties
      if (translation.title) {
        // Handle translation_id for title
        data.append(`translations[${index}][title][translation_id]`, "");

        // Handle language_id for title
        if (translation.language_id) {
          data.append(
            `translations[${index}][title][language_id]`,
            translation.language_id,
          );
        }

        // Handle value for title
        if (translation.title) {
          data.append(
            `translations[${index}][title][value]`,
            translation.title,
          );
        }
      }

      // Handle description with its nested properties
      if (translation.description) {
        // Handle translation_id for description
        data.append(`translations[${index}][description][translation_id]`, "");

        // Handle language_id for description
        if (translation.language_id) {
          data.append(
            `translations[${index}][description][language_id]`,
            translation.language_id,
          );
        }

        // Handle value for description
        if (translation.description) {
          data.append(
            `translations[${index}][description][value]`,
            translation.description,
          );
        }
      }
    });
  }

  // Append the parameters array if it is an array
  if (Array.isArray(plans)) {
    plans.forEach((plans, index) => {
      data.append(`plans[${index}][id]`, plans.id);
      data.append(`plans[${index}][title]`, plans.title);
      data.append(`plans[${index}][document]`, plans.document);
    });
  }

  // Check if gallery_images is defined and an array before using forEach
  if (Array.isArray(documents)) {
    documents.forEach((image, index) => {
      data.append(`documents[${index}]`, image);
    });
  }
  // Check if gallery_images is defined and an array before using forEach
  if (Array.isArray(gallery_images)) {
    gallery_images.forEach((image, index) => {
      data.append(`gallery_images[${index}]`, image);
    });
  }

  const res = await api.post(apiEndpoints.POST_PROJECT, data);
  return res.data;
};

// 38. Get Advertisements
export const getFeaturedDataApi = async ({
  type = "",
  limit = "",
  offset = "",
}) => {
  const params = { type, limit, offset };
  const res = await api.get(apiEndpoints.GET_FEATURED_DATA, { params });
  return res.data;
};

// 38a. Delete Advertisement
export const deleteAdvertisementApi = async ({ id = "" }) => {
  const formData = createFilteredFormData({ id });
  const res = await api.post(apiEndpoints.DELETE_ADVERTISEMENT, formData);
  return res.data;
};

// 57. Get Interested Users
export const getInterestedUsersApi = async ({
  property_id = "",
  slug_id = "",
  limit = "",
  offset = "",
}) => {
  const params = getFilteredParams({ property_id, slug_id, limit, offset });
  const res = await api.get(apiEndpoints.GET_INTERESTED_USERS, { params });
  return res.data;
};
