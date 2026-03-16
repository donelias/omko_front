import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  suggestions: {},
  analysis: {},
  comparables: [],
  trends: [],
  priceHistory: [],
  selectedProperty: null,
  loading: false,
  error: null,
  success: false,
  expiringNotifications: [],
};

const priceIntelligenceSlice = createSlice({
  name: 'priceIntelligence',
  initialState,
  reducers: {
    // Loading
    setPriceLoading: (state, action) => {
      state.loading = action.payload;
    },

    // Suggestions
    setPriceSuggestion: (state, action) => {
      const { propertyId, data } = action.payload;
      state.suggestions[propertyId] = data;
      state.loading = false;
      state.error = null;
    },

    // Analysis
    setPriceAnalysis: (state, action) => {
      const { propertyId, data } = action.payload;
      state.analysis[propertyId] = data;
      state.loading = false;
      state.error = null;
    },

    // Comparables
    setComparableProperties: (state, action) => {
      const { propertyId, data } = action.payload;
      state.comparables = data || [];
      state.selectedProperty = propertyId;
      state.loading = false;
      state.error = null;
    },

    // Price History
    setPriceHistory: (state, action) => {
      const { propertyId, data } = action.payload;
      state.priceHistory = data || [];
      state.loading = false;
      state.error = null;
    },

    // Trends
    setPriceTrends: (state, action) => {
      state.trends = action.payload || [];
      state.loading = false;
      state.error = null;
    },

    // Bulk operations
    setBulkSuggestions: (state, action) => {
      const suggestions = action.payload || [];
      suggestions.forEach(item => {
        state.suggestions[item.property_id] = item;
      });
      state.loading = false;
      state.error = null;
    },

    // Notifications for expiring suggestions
    setExpiringNotifications: (state, action) => {
      state.expiringNotifications = action.payload;
    },

    // Error handling
    setPriceError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
      state.success = false;
    },

    clearPriceError: (state) => {
      state.error = null;
    },

    // Success
    setPriceSuccess: (state, action) => {
      state.success = action.payload;
    },

    clearPriceSuccess: (state) => {
      state.success = false;
    },

    // Reset
    resetPriceIntelligenceState: (state) => {
      return initialState;
    },

    // Clear single property data
    clearPropertyPriceData: (state, action) => {
      const propertyId = action.payload;
      delete state.suggestions[propertyId];
      delete state.analysis[propertyId];
    },

    // Update confidence or other fields
    updateSuggestionField: (state, action) => {
      const { propertyId, field, value } = action.payload;
      if (state.suggestions[propertyId]) {
        state.suggestions[propertyId][field] = value;
      }
    },
  },
});

export const {
  setPriceLoading,
  setPriceSuggestion,
  setPriceAnalysis,
  setComparableProperties,
  setPriceHistory,
  setPriceTrends,
  setBulkSuggestions,
  setExpiringNotifications,
  setPriceError,
  clearPriceError,
  setPriceSuccess,
  clearPriceSuccess,
  resetPriceIntelligenceState,
  clearPropertyPriceData,
  updateSuggestionField,
} = priceIntelligenceSlice.actions;

export default priceIntelligenceSlice.reducer;
