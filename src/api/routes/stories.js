import api from "../axiosMiddleware";
import * as apiEndpoints from "../apiEndpoints";
import {
  createFilteredFormData,
  getFilteredParams,
} from "@/utils/helperFunction";

// Agent Stories APIs
export const getStoriesApi = async ({
  limit = "",
  offset = "",
  category_id = "",
  agent_id = "",
  property_id = "",
  project_id = "",
}) => {
  const params = getFilteredParams({
    limit,
    offset,
    category_id,
    agent_id,
    property_id,
    project_id,
  });
  const res = await api.get(apiEndpoints.GET_STORIES, { params });
  return res.data;
};

export const uploadStoryApi = async ({
  media,
  media_type,
  entity_type,
  entity_id,
  thumbnail,
  duration_seconds,
}) => {
  const formData = createFilteredFormData({
    media,
    media_type,
    entity_type,
    entity_id,
    thumbnail,
    duration_seconds,
  });
  const res = await api.post(apiEndpoints.UPLOAD_STORY, formData);
  return res.data;
};

export const storyViewApi = async ({ story_id }) => {
  const formData = createFilteredFormData({ story_id });
  const res = await api.post(apiEndpoints.STORY_VIEW, formData);
  return res.data;
};

export const getMyStoriesApi = async () => {
  const res = await api.get(apiEndpoints.MY_STORIES);
  return res.data;
};

export const deleteStoryApi = async ({ story_id }) => {
  const params = getFilteredParams({ story_id });
  const res = await api.delete(apiEndpoints.DELETE_STORY, { params });
  return res.data;
};
