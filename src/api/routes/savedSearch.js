import api from "../axiosMiddleware";
import * as apiEndpoints from "../apiEndpoints";

export const getSavedSearchesApi = async () => {
  const res = await api.get(apiEndpoints.SAVED_SEARCHES);
  return res.data;
};

export const createSavedSearchApi = async ({
  name = "",
  filters = {},
  frequency = "instant",
}) => {
  const res = await api.post(apiEndpoints.SAVED_SEARCHES, {
    name,
    filters,
    frequency,
  });
  return res.data;
};

export const getSavedSearchApi = async ({ id = "" }) => {
  const res = await api.get(`${apiEndpoints.SAVED_SEARCHES}/${id}`);
  return res.data;
};

export const updateSavedSearchApi = async ({
  id = "",
  name,
  filters,
  frequency,
  is_active,
}) => {
  const payload = {};
  if (name !== undefined) payload.name = name;
  if (filters !== undefined) payload.filters = filters;
  if (frequency !== undefined) payload.frequency = frequency;
  if (is_active !== undefined) payload.is_active = is_active;
  const res = await api.put(`${apiEndpoints.SAVED_SEARCHES}/${id}`, payload);
  return res.data;
};

export const deleteSavedSearchApi = async ({ id = "" }) => {
  const res = await api.delete(`${apiEndpoints.SAVED_SEARCHES}/${id}`);
  return res.data;
};

export const previewSavedSearchApi = async ({ filters = {} }) => {
  const res = await api.post(apiEndpoints.SAVED_SEARCH_PREVIEW, { filters });
  return res.data;
};