import api from "../axiosMiddleware";
import * as apiEndpoints from "../apiEndpoints";

export const getShortTermAvailabilityApi = async ({
  property_id = "",
  check_in = "",
  check_out = "",
}) => {
  const params = { property_id, check_in, check_out };
  const res = await api.get(apiEndpoints.SHORT_TERM_AVAILABILITY, { params });
  return res.data;
};

export const createShortTermReservationApi = async ({
  property_id = "",
  check_in = "",
  check_out = "",
  guests = 1,
  notes = "",
}) => {
  const res = await api.post(apiEndpoints.SHORT_TERM_RESERVATIONS, {
    property_id,
    check_in,
    check_out,
    guests,
    notes,
  });
  return res.data;
};

export const getMyShortTermReservationsApi = async () => {
  const res = await api.get(apiEndpoints.SHORT_TERM_MY_RESERVATIONS);
  return res.data;
};

export const cancelShortTermReservationApi = async ({ id = "" }) => {
  const res = await api.post(apiEndpoints.SHORT_TERM_CANCEL, { id });
  return res.data;
};