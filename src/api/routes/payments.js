import api from "../axiosMiddleware";
import * as apiEndpoints from "../apiEndpoints";
import {
  createFilteredFormData,
  getFilteredParams,
} from "@/utils/helperFunction";

// 17. Get Packages
export const getPackagesApi = async () => {
  // const params = { user_type };
  const res = await api.get(apiEndpoints.GET_PACKAGES);
  return res.data;
};

// 18. Get Payment Settings
export const getPaymentSettingsApi = async () => {
  const res = await api.get(apiEndpoints.GET_PAYMENT_SETTINGS);
  return res.data;
};

// 19. Assign Free Package
export const assignFreePackageApi = async ({ package_id = "" }) => {
  const formData = createFilteredFormData({ package_id });
  const res = await api.post(apiEndpoints.ASSIGN_FREE_PACKAGE, formData);
  return res.data;
};

// 20. Create Payment Intent
export const createAllPaymentIntentApi = async ({
  package_id = "",
  pay_as_you_go_id = "",
  platform_type = "",
  payment_method = "",
}) => {
  const formData = createFilteredFormData({ package_id, pay_as_you_go_id, platform_type, payment_method });
  const res = await api.post(apiEndpoints.CREATE_PAYMENT_INTENT, formData);
  return res.data;
};

// 21. Payment Transaction Failed
export const paymentTransactionFailApi = async ({
  payment_transaction_id = "",
}) => {
  const formData = createFilteredFormData({ payment_transaction_id });
  const res = await api.post(apiEndpoints.PAYMENT_TRANSACTION_FAIL, formData);
  return res.data;
};

// 22. Paypal Api
export const paypalApi = async ({ amount = "", package_id = "" }) => {
  const params = getFilteredParams({
    amount,
    package_id,
  });
  const res = await api.get(apiEndpoints.PAYPAL, { params });
  return res.data;
};

//  23. FlutterWave Api
export const flutterWaveApi = async ({ package_id = "" }) => {
  const formData = createFilteredFormData({ package_id });
  const res = await api.post(apiEndpoints.FLUTTERWAVE, formData);
  return res.data;
};

// 34. Check Package Limit
export const checkPackageLimitApi = async ({ type = "" }) => {
  const params = { type };
  const res = await api.get(apiEndpoints.CHECK_PACKAGE_LIMIT, { params });
  if (!res?.data?.error) {
    return res.data;
  } else {
    throw res.data;
  }
};

// 47. Get User transaction details
export const getUserTransactionDetailsApi = async ({
  limit = "",
  offset = "",
  payment_type = "",
}) => {
  const params = {
    limit,
    offset,
    payment_type,
  };
  const res = await api.get(apiEndpoints.GET_PAYMENT_DETAILS, { params });
  return res.data;
};

// 48. download payment receipt
export const downloadPaymentReceiptApi = async ({
  payment_transaction_id = "",
}) => {
  const params = { payment_transaction_id };
  const res = await api.get(apiEndpoints.GET_PAYMENT_RECEIPT, { params });
  return res.data;
};

// 49. Initiate Bank Transfer
export const initiateBankTransferApi = async ({ package_id = "", file, pay_as_you_go_id = "" }) => {
  const formData = createFilteredFormData({ package_id, file, pay_as_you_go_id });
  const res = await api.post(apiEndpoints.INITIATE_BANK_TRANSFER, formData);
  return res.data;
};

// 49. Upload Bank Receipt File
export const uploadBankReceiptFileApi = async ({
  file = "",
  payment_transaction_id = "",
}) => {
  const formData = createFilteredFormData({ file, payment_transaction_id });
  const res = await api.post(apiEndpoints.UPLOAD_BANK_RECEIPT_FILE, formData);
  return res.data;
};
