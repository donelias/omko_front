import axios from "axios";
import { store } from "@/redux/store";
import { logout } from "@/redux/slices/authSlice";
import Router from "next/router";
import Swal from "sweetalert2";
const access_key_param = "x-access-key";
const access_key = "903361";

const url = process.env.NEXT_PUBLIC_API_URL;
const subUrl = process.env.NEXT_PUBLIC_END_POINT;
const baseURL = `${url || ""}${subUrl || ""}`.replace(/([^:]\/)\/+/, "$1");

const api = axios.create({
  baseURL,
  timeout: 15000,
});

const getStoredToken = async () => {
  const state = store.getState();
  return state?.User?.jwtToken;
};

const getStoredLocaleCode = async () => {
  const state = store.getState();
  return state?.LanguageSettings?.current_language?.code;
};

const getStoredLocaleFile = async () => {
  const state = store.getState();
  return state?.LanguageSettings?.current_language?.file;
};

const getUserActiveRole = async () => {
  const state = store.getState();
  return state?.User?.role ?? "user";
}

api.interceptors.request.use(
  async (config) => {
    try {
      const authToken = await getStoredToken();
      const localeCode = await getStoredLocaleCode();
      const activeRole = await getUserActiveRole();

      config.headers.Accept = config.headers.Accept || "application/json";
      config.headers["X-Requested-With"] = config.headers["X-Requested-With"] || "XMLHttpRequest";

      if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
      }
      if (localeCode) {
        config.headers["Content-Language"] = localeCode;
      }
      
      if (activeRole) {
        config.headers["X-Active-Role"] = activeRole;
      }

      // Avoid forcing multipart headers on FormData; browser must set boundary automatically.
      const method = (config.method || "get").toLowerCase();
      const isFormData = typeof FormData !== "undefined" && config.data instanceof FormData;
      if (!["get", "head"].includes(method) && !isFormData && !config.headers["Content-Type"]) {
        config.headers["Content-Type"] = "multipart/form-data";
      }

      return config;
    } catch (error) {
      console.error("Error in token retrival", error);
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error("Error in inceptor", error);
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    try {
      return response;
    } catch (error) {
      console.error("Error while fetching data", error);
      return Promise.reject(error);
    }
  },
  async (error) => {
    const failedUrl = `${error?.config?.baseURL || ""}${error?.config?.url || ""}`;
    console.error("Error while fetching data", {
      message: error?.message,
      method: error?.config?.method,
      url: failedUrl,
      status: error?.response?.status,
    });
    if (error?.response?.status === 401 && error?.response?.data?.key === "accountDeactivated") {
      const fileName = await getStoredLocaleFile();
      Swal.fire({
        title: fileName["opps"],
        text: fileName["accountDeactivatedByAdmin"],
        icon: "warning",
        showCancelButton: false,
        customClass: {
          confirmButton: "Swal-confirm-buttons",
          cancelButton: "Swal-cancel-buttons",
        },
        confirmButtonText: fileName["ok"],
      }).then((result) => {
        if (result.isConfirmed) {
          store.dispatch(logout());
          Router.push(`/`);
        }
      });
    }
    if (error?.response?.status === 401) {
      console.error("Unauthorized access - Logging out user");
      store.dispatch(logout());
      Router.push("/");
    }
    return Promise.reject(error?.response?.data || error);
  },
);

export default api;