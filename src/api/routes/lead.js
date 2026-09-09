import api from "../axiosMiddleware";
import * as apiEndpoints from "../apiEndpoints";

export const submitGuestLeadApi = async (data = {}) => {
  const res = await api.post(apiEndpoints.LEAD_GUEST, data);
  return res.data;
};

export const getMyLeadsApi = async (params = {}) => {
  const res = await api.get(apiEndpoints.LEADS_MINE, { params });
  return res.data;
};

export const unlockLeadApi = async (data = {}) => {
  const res = await api.post(apiEndpoints.LEADS_UNLOCK, data);
  return res.data;
};
