import api from "../axiosMiddleware";
import * as apiEndpoints from "../apiEndpoints";
import {
  createFilteredFormData,
} from "@/utils/helperFunction";

// 111. Generate AI Property Description API
export const generateAIPropertyDescriptionApi = async ({
  entity_type = "",
  entity_id = "",
  title = "",
  location = "",
  city = "",
  state = "",
  country = "",
  property_type = "",
  category_id = "",
  language_id = ""
}) => {
  const formData = createFilteredFormData({
    entity_type,
    entity_id,
    title,
    property_type,
    category_id,
    location,
    city,
    state,
    country,
    language_id
  });
  const res = await api.post(apiEndpoints.GENERATE_PROPERTY_DESCRIPTION, formData);
  return res.data;
}

// 112. Generate AI Property Meta
export const generateAIPropertyMetaDataApi = async ({
  entity_type = "",
  entity_id = "",
  title = "",
  location = "",
  city = "",
  state = "",
  country = "",
  price = "",
  language_id = ""
}) => {
  const formData = createFilteredFormData({
    entity_type,
    entity_id,
    title,
    location,
    price,
    city,
    language_id,
    state,
    country
  });
  const res = await api.post(apiEndpoints.GENERATE_PROPERTY_META_DATA, formData);
  return res.data;
}
