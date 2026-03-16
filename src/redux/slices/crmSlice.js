import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  leads: [],
  interactions: [],
  campaigns: [],
  selectedLead: null,
  selectedInteraction: null,
  filters: {
    status: null,
    agent_id: null,
    campaign_id: null,
    origin: null,
    search: '',
  },
  pagination: {
    page: 1,
    per_page: 15,
    total: 0,
    last_page: 1,
  },
  dashboardData: {
    total_leads: 0,
    total_interactions: 0,
    active_campaigns: 0,
    conversion_rate: 0,
    average_score: 0,
    leads_by_status: {},
    leads_by_origin: {},
  },
  loading: false,
  error: null,
  success: false,
};

const crmSlice = createSlice({
  name: 'crm',
  initialState,
  reducers: {
    // Loading
    setCrmLoading: (state, action) => {
      state.loading = action.payload;
    },

    // Leads
    setLeads: (state, action) => {
      state.leads = action.payload.data || [];
      state.pagination = action.payload.pagination || initialState.pagination;
      state.loading = false;
      state.error = null;
    },

    setSelectedLead: (state, action) => {
      state.selectedLead = action.payload;
    },

    createLeadSuccess: (state, action) => {
      state.leads.unshift(action.payload);
      state.success = true;
      state.error = null;
      state.loading = false;
    },

    updateLeadSuccess: (state, action) => {
      const index = state.leads.findIndex(l => l.id === action.payload.id);
      if (index !== -1) {
        state.leads[index] = action.payload;
      }
      if (state.selectedLead?.id === action.payload.id) {
        state.selectedLead = action.payload;
      }
      state.success = true;
      state.error = null;
      state.loading = false;
    },

    deleteLeadSuccess: (state, action) => {
      state.leads = state.leads.filter(l => l.id !== action.payload);
      if (state.selectedLead?.id === action.payload) {
        state.selectedLead = null;
      }
      state.success = true;
      state.error = null;
    },

    // Interactions
    setInteractions: (state, action) => {
      state.interactions = action.payload || [];
      state.loading = false;
      state.error = null;
    },

    setSelectedInteraction: (state, action) => {
      state.selectedInteraction = action.payload;
    },

    addInteractionSuccess: (state, action) => {
      state.interactions.unshift(action.payload);
      state.success = true;
      state.error = null;
      state.loading = false;
    },

    // Campaigns
    setCampaigns: (state, action) => {
      state.campaigns = action.payload || [];
      state.loading = false;
      state.error = null;
    },

    // Filters
    setCrmFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
      state.pagination.page = 1;
    },

    resetCrmFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.page = 1;
    },

    // Pagination
    setCrmPage: (state, action) => {
      state.pagination.page = action.payload;
    },

    // Dashboard
    setCrmDashboardData: (state, action) => {
      state.dashboardData = action.payload;
    },

    // Update lead scoring
    updateLeadScoring: (state, action) => {
      const { leadId, score } = action.payload;
      const lead = state.leads.find(l => l.id === leadId);
      if (lead) {
        lead.score = score;
      }
      if (state.selectedLead?.id === leadId) {
        state.selectedLead.score = score;
      }
    },

    // Error handling
    setCrmError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
      state.success = false;
    },

    clearCrmError: (state) => {
      state.error = null;
    },

    clearCrmSuccess: (state) => {
      state.success = false;
    },

    // Reset
    resetCrmState: (state) => {
      return initialState;
    },
  },
});

export const {
  setCrmLoading,
  setLeads,
  setSelectedLead,
  createLeadSuccess,
  updateLeadSuccess,
  deleteLeadSuccess,
  setInteractions,
  setSelectedInteraction,
  addInteractionSuccess,
  setCampaigns,
  setCrmFilters,
  resetCrmFilters,
  setCrmPage,
  setCrmDashboardData,
  updateLeadScoring,
  setCrmError,
  clearCrmError,
  clearCrmSuccess,
  resetCrmState,
} = crmSlice.actions;

export default crmSlice.reducer;
