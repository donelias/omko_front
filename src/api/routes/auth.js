import api from "../axiosMiddleware";
import * as apiEndpoints from "../apiEndpoints";
import {
  createFilteredFormData,
  getFilteredParams,
} from "@/utils/helperFunction";

// 6.User Signup
export const userSignup = async ({
  name = "",
  email = "",
  password = "",
  mobile = "",
  type = "",
  address = "",
  auth_id = "",
  logintype = "",
  profile = "",
  fcm_id = "",
  country_code = "",
}) => {
  // Create an object with all parameters
  const userData = {
    name,
    email,
    password,
    mobile,
    type,
    address,
    auth_id,
    logintype,
    profile,
    fcm_id,
    country_code,
  };

  // Filter out falsy values and create FormData
  const formData = createFilteredFormData(userData);

  // Send only non-falsy values to the API
  const res = await api.post(apiEndpoints.USER_SIGNUP, formData);
  return res.data;
};

// 7.Verify OTP
export const verifyOTP = async ({ number = "", email = "", otp = "", country_code = "" }) => {
  const params = getFilteredParams({
    number,
    email,
    otp,
    country_code
  })
  const res = await api.get(apiEndpoints.VERIFY_OTP, { params });
  return res.data;
};

// 8.User Register
/**
 * @param {Object} param - Registration Details of User
 * @param {string} param.name - User's name
 * @param {string} param.email - User's email
 * @param {string} param.mobile - User's mobile number
 * @param {string} param.password - User's password
 * @param {string} param.re_password - User's confirm password
 * @param {string} param.country_code - User's country code without + (e.g.: "91" for India)
 * @param {"0" | "1" | "2" | "3"} param.type - Login type (0: Google, 1:Number, 2:Apple, 3:Email)
 * @returns {Promise<Object>} - API response
 */
export const userRegisterApi = async ({
  name = "",
  email = "",
  mobile = "",
  password = "",
  re_password = "",
  country_code = "",
  type = "0",
  firebase_id = ""
}) => {
  const data = {
    name,
    email,
    mobile,
    password,
    re_password,
    country_code,
    type,
    firebase_id
  };

  const formData = createFilteredFormData(data);
  const res = await api.post(apiEndpoints.USER_REGISTER, formData);
  return res.data;
};

// 9.Get OTP
export const getOTPApi = async ({ number = "", email = "", country_code = "" }) => {
  const params = getFilteredParams({
    number,
    email,
    country_code
  });
  const res = await api.get(apiEndpoints.GET_OTP, { params });
  return res.data;
};

// 10.Forgot Password
// This api is no longer used as it is handled by getOTPApi 
export const forgotPasswordApi = async ({ email = "" }) => {
  const params = {
    email,
  };
  const res = await api.get(apiEndpoints.FORGOT_PASSWORD, { params });
  return res.data;
};

// 11.Before Logout
export const beforeLogoutApi = async ({ fcm_id = "" }) => {
  const formData = createFilteredFormData({ fcm_id });
  const res = await api.post(apiEndpoints.BEFORE_LOGOUT, formData);
  return res.data;
};

// 55. Delete User Account
export const deleteUserAccountApi = async () => {
  const res = await api.post(apiEndpoints.DELETE_USER);
  return res.data;
};

// 101. GET - Check Phone no. password exists
/**
 * @param {Object} param - Query params
 * @param {string} param.mobile - Mobile number
 * @param {string} param.country_code - Country code
 * @returns {Promise<Object>} - API response
 */
export const checkPhoneNoPasswordExistsApi = async ({
  mobile = "",
  country_code = ""
}) => {
  const params = getFilteredParams({
    mobile,
    country_code
  });
  const res = await api.get(apiEndpoints.GET_CHECK_NUMBER_PASSWORD_EXISTS, { params });
  return res.data;
}

// 102. Update Phone no. password

export const updatePhoneNoPasswordApi = async ({
  firebase_id = "",
  mobile = "",
  country_code = "",
  password = "",
  re_password = ""
}) => {
  const formData = createFilteredFormData({
    firebase_id,
    mobile,
    country_code,
    password,
    re_password
  });
  const res = await api.post(apiEndpoints.UPDATE_PHONE_PASSWORD, formData);
  return res.data;
};

// 102b. Update Email Password
export const updateEmailPasswordApi = async ({
  email = "",
  password = "",
  re_password = ""
}) => {
  const formData = createFilteredFormData({
    email,
    password,
    re_password
  });
  const res = await api.post(apiEndpoints.UPDATE_EMAIL_PASSWORD, formData);
  return res.data;
};

// 52. Submit User Interests
export const submitUserInterestsApi = async ({
  category_ids,
  outdoor_facilitiy_ids,
  price_range,
  property_type,
  city,
}) => {
  const formData = createFilteredFormData({
    category_ids,
    outdoor_facilitiy_ids,
    price_range,
    property_type,
    city,
  });
  const res = await api.post(apiEndpoints.USER_INTREST, formData);
  return res.data;
};

// 53. Get User Intrested Data
export const getUserIntrestedDataApi = async () => {
  const res = await api.get(apiEndpoints.USER_INTREST);
  return res.data;
};

// 54. Delete User Intrested Data
export const deleteUserIntrestedDataApi = async () => {
  const res = await api.delete(apiEndpoints.USER_INTREST);
  return res.data;
};
