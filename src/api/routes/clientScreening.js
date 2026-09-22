import api from "../axiosMiddleware";
import * as apiEndpoints from "../apiEndpoints";

export const getScreeningFormApi = async ({ propertyId } = {}) => {
  const res = await api.get(`${apiEndpoints.SCREENING_FORM}/${propertyId}`);
  return res.data;
};

export const submitScreeningApi = async (data = {}) => {
  const formData = new FormData();
  formData.append("property_id", data.property_id);
  formData.append("customer_name", data.customer_name || "");
  if (data.customer_email) formData.append("customer_email", data.customer_email);
  if (data.customer_phone) formData.append("customer_phone", data.customer_phone);
  if (data.origin) formData.append("origin", data.origin);

  Object.keys(data.answers || {}).forEach((key) => {
    formData.append(`answers[${key}]`, data.answers[key] ?? "");
  });

  const res = await api.post(apiEndpoints.SCREENING_SUBMIT, formData);
  return res.data;
};

export const getMyScreeningsApi = async (params = {}) => {
  const res = await api.get(apiEndpoints.SCREENINGS_MINE, { params });
  return res.data;
};

export const getScreeningDetailApi = async (id) => {
  const res = await api.get(`${apiEndpoints.SCREENINGS_SHOW}/${id}`);
  return res.data;
};

export const decideScreeningApi = async ({ id, decision, notas } = {}) => {
  const formData = new FormData();
  formData.append("decision", decision);
  if (notas) formData.append("notas", notas);
  const res = await api.post(`${apiEndpoints.SCREENINGS_DECIDE}/${id}/decide`, formData);
  return res.data;
};