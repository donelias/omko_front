import api from "../axiosMiddleware";
import * as apiEndpoints from "../apiEndpoints";
import {
  createFilteredFormData,
} from "@/utils/helperFunction";

// 44. Update User Profile
export const updateUserProfileApi = async ({
  userid = "",
  name = "",
  email = "",
  mobile = "",
  address = "",
  firebase_id = "",
  logintype = "",
  profile = "",
  latitude = "",
  longitude = "",
  about_me = "",
  facebook_id = "",
  twiiter_id = "",
  instagram_id = "",
  youtube_id = "",
  city = "",
  state = "",
  country = "",
  country_code = "",
}) => {
  const formData = createFilteredFormData({
    userid,
    name,
    email,
    mobile,
    address,
    firebase_id,
    logintype,
    profile,
    latitude,
    longitude,
    city,
    state,
    country,
    about_me,
    facebook_id,
    instagram_id,
    youtube_id,
    twiiter_id,
    country_code,
  });
  const res = await api.post(apiEndpoints.UPDATE_PROFILE, formData);
  return res.data;
};

// 73. Get User Profile
export const getUserProfileApi = async () => {
  const res = await api.get(apiEndpoints.GET_USER_DATA);
  return res.data;
};

// 42. Get Favourite Property
export const getFavouritePropertyApi = async ({ limit = "", offset = "" }) => {
  const params = { limit, offset };
  const res = await api.get(apiEndpoints.GET_FAVOURITE_PROPERTY, { params });
  return res.data;
};

// 43. Add Favourite Property
export const addFavouritePropertyApi = async ({
  property_id = "",
  type = "", // 0 for like, 1 for unlike
}) => {
  const formData = createFilteredFormData({ property_id, type });
  const res = await api.post(apiEndpoints.ADD_FAVOURITE, formData);
  return res.data;
};

// 46. Get Notification List
export const getNotificationListApi = async ({ limit = "", offset = "" }) => {
  const params = { limit, offset };
  const res = await api.get(apiEndpoints.GET_NOTIFICATION_LIST, { params });
  return res.data;
};

// 71. Get User Personalized Feeds
export const getUserPersonalizedFeedsApi = async ({ limit, offset }) => {
  const params = { limit, offset };
  const res = await api.get(apiEndpoints.GET_USER_RECOMMENDATION, { params });
  return res.data;
};
