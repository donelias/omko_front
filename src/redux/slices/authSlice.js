import { createSlice } from "@reduxjs/toolkit";

const BOOLEAN_FLAG_KEYS = [
  "is_agent",
  "is_agent_verified",
  "is_user_verified",
  "is_active",
  "is_verified",
  "is_admin_verified",
];

const normalizeUserFlags = (data) => {
  if (!data || typeof data !== "object" || Array.isArray(data)) return data;

  const next = { ...data };
  for (const key of Object.keys(next)) {
    if (BOOLEAN_FLAG_KEYS.includes(key)) {
      const value = next[key];
      next[key] =
        value === true ||
        value === 1 ||
        value === "1" ||
        value === "true" ? true : false;
    }
  }
  return next;
};

const initialState = {
  data: null,
  loading: false,
  jwtToken: "",
  role: "user"
};

const authSlice = createSlice({
  name: "Auth",
  initialState,
  reducers: {
    setAuth: (state, action) => {
      state.data = normalizeUserFlags(action.payload.data);
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload.data;
    },
    setJWTToken: (state, action) => {
      state.jwtToken = action.payload.data;
    },
    updateUserProfile: (state, action) => {
      // Update only the user profile data, keeping other data intact
      if (state.data) {
        state.data = {
          ...state.data,
          ...normalizeUserFlags(action.payload.data)
        };
      }
    },
    logout: (state) => {
      state.data = null;
      state.loading = false;
      state.jwtToken = "";
    },
    setRole: (state, action) => {
      state.role = action.payload.data;
    }
  },
});

export const { setAuth, setLoading, setJWTToken, updateUserProfile, logout, setRole } = authSlice.actions;

export default authSlice.reducer;