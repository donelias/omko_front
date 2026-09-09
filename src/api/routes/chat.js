import api from "../axiosMiddleware";
import * as apiEndpoints from "../apiEndpoints";
import {
  createFilteredFormData,
  getFilteredParams,
} from "@/utils/helperFunction";

// 59. Get Chat Lists
export const getChatListsApi = async () => {
  const res = await api.get(apiEndpoints.GET_CHATS);
  return res.data;
};

// 60. Get Chat Messages
export const getChatMessagesApi = async ({
  user_id = "",
  property_id = "",
  page = "",
  per_page = "",
}) => {
  const params = getFilteredParams({ user_id, property_id, page, per_page });
  const res = await api.get(apiEndpoints.GET_CHATS_MESSAGES, { params });
  return res.data;
};

// 61. Send Message
export const sendMessageApi = async ({
  sender_id = "",
  receiver_id = "",
  message = "",
  property_id = "",
  file = null,
  audio = null,
}) => {
  const formData = createFilteredFormData({
    sender_id,
    receiver_id,
    message,
    property_id,
    file,
    audio,
  });

  const res = await api.post(apiEndpoints.SEND_MESSAGE, formData);
  return res.data;
};

// 62. Delete Chat
export const deleteChatApi = async ({
  message_id = "",
  sender_id = "",
  receiver_id = "",
  property_id = "",
}) => {
  const formData = createFilteredFormData({
    message_id,
    sender_id,
    receiver_id,
    property_id,
  });
  const res = await api.post(apiEndpoints.DELETE_MESSAGES, formData);
  return res.data;
};

// 63. Block User
export const blockUserApi = async ({
  to_user_id = "",
  to_admin = "",
  reason = "",
}) => {
  const formData = createFilteredFormData({
    to_user_id,
    to_admin,
    reason,
  });
  const res = await api.post(apiEndpoints.BLOCK_USER, formData);
  return res.data;
};

// 64. Unblock User
export const unblockUserApi = async ({
  to_user_id = "",
  to_admin = "",
  reason = "",
}) => {
  const formData = createFilteredFormData({
    to_user_id,
    to_admin,
    reason,
  });
  const res = await api.post(apiEndpoints.UNBLOCK_USER, formData);
  return res.data;
};
