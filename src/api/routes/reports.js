import api from "../axiosMiddleware";
import * as apiEndpoints from "../apiEndpoints";

// 66. Get Report Reasons
export const getReportReasonsApi = async () => {
  const res = await api.get(apiEndpoints.GET_REPORT_REASONS);
  return res.data;
};

// 67. Report Property
export const addReportApi = async ({
  reason_id = "",
  property_id = "",
  other_message = "",
}) => {
  let formData = new FormData();
  formData.append("reason_id", reason_id);
  formData.append("property_id", property_id);
  formData.append("other_message", other_message);
  const res = await api.post(apiEndpoints.ADD_REPORT, formData);
  return res.data;
};
