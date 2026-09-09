import api from "../axiosMiddleware";
import * as apiEndpoints from "../apiEndpoints";
import {
  getFilteredParams,
} from "@/utils/helperFunction";

// 29. Get Verification Form Fields
export const getVerificationFormFieldsApi = async ({ form_type = "" }) => {
  const params = { form_type };
  const res = await api.get(apiEndpoints.GET_AGENT_VERIFICATION_FORM_FIELDS, { params });
  return res.data;
};

// 30. Get Verification Form Values
export const getVerificationFormValuesApi = async ({ form_type = "" }) => {
  const params = { form_type };
  const res = await api.get(apiEndpoints.GET_AGENT_VERIFICATION_FORM_VALUES, { params });
  return res.data;
};

// 31. Apply Agent Verification
export const applyAgentVerificationApi = async ({ form_type = "", form_fields = [] }) => {
  let data = new FormData();
  if (form_type) {
    data.append("form_type", form_type);
  }
  // Append the parameters array if it is an array
  if (Array.isArray(form_fields)) {
    form_fields.forEach((field, index) => {
      data.append(`form_fields[${index}][id]`, field.id);
      data.append(`form_fields[${index}][value]`, field.value);
    });
  }
  const res = await api.post(apiEndpoints.APPLY_AGENT_VERIFICATION, data);
  return res.data;
};

// 29a. Get Agent Verification Form (with form_type)
export const getAgentVerificationFormApi = async ({ form_type = "" }) => {
  const params = getFilteredParams({ form_type });
  const res = await api.get(apiEndpoints.GET_AGENT_VERIFICATION_FORM, { params });
  return res.data;
};

export const getUserVerificationFieldsApi = async ({ }) => {
  const res = await api.get(apiEndpoints.GET_USER_VERIFICATION_FORM);
  return res.data;
}

export const getUserVerificationValuesApi = async ({ }) => {
  const res = await api.get(apiEndpoints.GET_USER_VERIFICATION_FORM_VALUES);
  return res.data;
}

export const submitUserVerificationApi = async ({ form_fields }) => {
  let data = new FormData();
  // Append the parameters array if it is an array
  if (Array.isArray(form_fields)) {
    form_fields.forEach((field, index) => {
      data.append(`form_fields[${index}][id]`, field.id);
      data.append(`form_fields[${index}][value]`, field.value);
    });
  }
  const res = await api.post(apiEndpoints.APPLY_USER_VERIFICATION, data);
  return res.data;
}
