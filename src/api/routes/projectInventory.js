import api from "../axiosMiddleware";
import * as apiEndpoints from "../apiEndpoints";

export const getProjectInventoryStatusApi = async ({ property_id = "" }) => {
  const params = { property_id };
  const res = await api.get(apiEndpoints.PROJECT_INVENTORY_STATUS, { params });
  return res.data;
};

export const getProjectInventoryMovementsApi = async ({ property_id = "" }) => {
  const params = { property_id };
  const res = await api.get(apiEndpoints.PROJECT_INVENTORY_MOVEMENTS, { params });
  return res.data;
};

export const reserveProjectUnitApi = async ({
  property_id = "",
  delta_units = 1,
  notes = "",
}) => {
  const res = await api.post(apiEndpoints.PROJECT_INVENTORY_RESERVE, {
    property_id,
    delta_units,
    notes,
  });
  return res.data;
};

export const confirmProjectUnitApi = async ({
  property_id = "",
  delta_units = 1,
  notes = "",
}) => {
  const res = await api.post(apiEndpoints.PROJECT_INVENTORY_CONFIRM, {
    property_id,
    delta_units,
    notes,
  });
  return res.data;
};

export const cancelProjectUnitApi = async ({
  property_id = "",
  delta_units = 1,
  notes = "",
}) => {
  const res = await api.post(apiEndpoints.PROJECT_INVENTORY_CANCEL, {
    property_id,
    delta_units,
    notes,
  });
  return res.data;
};