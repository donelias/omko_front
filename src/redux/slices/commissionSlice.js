import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  commissions: [],
  selectedCommission: null,
  filters: {
    status: null,
    payment_status: null,
    agent_id: null,
    transaction_type: null,
    search: '',
  },
  pagination: {
    page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
  },
  alerts: [],
  dashboardData: {
    total_pending: 0,
    total_approved: 0,
    total_rejected: 0,
    total_pending_amount: 0,
    total_paid: 0,
    overdue_count: 0,
  },
  loading: false,
  error: null,
  success: false,
};

const commissionSlice = createSlice({
  name: 'commissions',
  initialState,
  reducers: {
    // Fetching commissions
    setCommissionsLoading: (state, action) => {
      state.loading = action.payload;
    },

    setCommissions: (state, action) => {
      state.commissions = action.payload.data || [];
      state.pagination = action.payload.pagination || initialState.pagination;
      state.loading = false;
      state.error = null;
    },

    setSelectedCommission: (state, action) => {
      state.selectedCommission = action.payload;
    },

    // Filters
    setCommissionFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
      state.pagination.page = 1;
    },

    resetCommissionFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.page = 1;
    },

    // Pagination
    setCommissionPage: (state, action) => {
      state.pagination.page = action.payload;
    },

    // Commission operations
    createCommissionSuccess: (state, action) => {
      state.commissions.unshift(action.payload);
      state.success = true;
      state.error = null;
      state.loading = false;
    },

    updateCommissionSuccess: (state, action) => {
      const index = state.commissions.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.commissions[index] = action.payload;
      }
      if (state.selectedCommission?.id === action.payload.id) {
        state.selectedCommission = action.payload;
      }
      state.success = true;
      state.error = null;
      state.loading = false;
    },

    approveCommissionSuccess: (state, action) => {
      const index = state.commissions.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.commissions[index] = action.payload;
      }
      if (state.selectedCommission?.id === action.payload.id) {
        state.selectedCommission = action.payload;
      }
      state.success = true;
      state.error = null;
    },

    rejectCommissionSuccess: (state, action) => {
      const index = state.commissions.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.commissions[index] = action.payload;
      }
      if (state.selectedCommission?.id === action.payload.id) {
        state.selectedCommission = action.payload;
      }
      state.success = true;
      state.error = null;
    },

    recordPaymentSuccess: (state, action) => {
      const index = state.commissions.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.commissions[index] = action.payload;
      }
      if (state.selectedCommission?.id === action.payload.id) {
        state.selectedCommission = action.payload;
      }
      state.success = true;
      state.error = null;
    },

    // Dashboard
    setDashboardData: (state, action) => {
      state.dashboardData = action.payload;
    },

    // Alerts
    setCommissionAlerts: (state, action) => {
      state.alerts = action.payload;
    },

    // Error handling
    setCommissionError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
      state.success = false;
    },

    clearCommissionError: (state) => {
      state.error = null;
    },

    clearCommissionSuccess: (state) => {
      state.success = false;
    },

    // Reset
    resetCommissionState: (state) => {
      return initialState;
    },
  },
});

export const {
  setCommissionsLoading,
  setCommissions,
  setSelectedCommission,
  setCommissionFilters,
  resetCommissionFilters,
  setCommissionPage,
  createCommissionSuccess,
  updateCommissionSuccess,
  approveCommissionSuccess,
  rejectCommissionSuccess,
  recordPaymentSuccess,
  setDashboardData,
  setCommissionAlerts,
  setCommissionError,
  clearCommissionError,
  clearCommissionSuccess,
  resetCommissionState,
} = commissionSlice.actions;

export default commissionSlice.reducer;
