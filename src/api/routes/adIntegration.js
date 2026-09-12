import api from "../axiosMiddleware";
import * as apiEndpoints from "../apiEndpoints";

export const getAdIntegrationApi = async () => {
  const res = await api.get(apiEndpoints.GET_AD_INTEGRATIONS);
  return res.data;
};

export const saveAdIntegrationApi = async (data = {}) => {
  const res = await api.post(apiEndpoints.POST_AD_INTEGRATIONS, data);
  return res.data;
};

export const testAdIntegrationApi = async (data = {}) => {
  const res = await api.post(apiEndpoints.TEST_AD_INTEGRATIONS, data);
  return res.data;
};