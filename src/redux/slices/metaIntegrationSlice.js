import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Credentials Management
  credentials: {
    meta: [],
    whatsapp: [],
    loading: false,
    error: null,
  },

  // Meta Specific
  meta: {
    syncStatus: {
      isSyncing: false,
      lastSync: null,
      nextSync: null,
      syncFrequency: 300, // 5 minutes in seconds
      totalSynced: 0,
      errorCount: 0,
    },
    leads: [],
    campaigns: [],
    logs: [],
    notifications: [],
    selectedCredential: null,
  },

  // WhatsApp Specific
  whatsapp: {
    messages: [],
    templates: [],
    selectedCredential: null,
    messageQueue: [],
  },

  // General State
  loading: false,
  error: null,
  success: false,
};

const metaIntegrationSlice = createSlice({
  name: 'metaIntegration',
  initialState,
  reducers: {
    // ===== CREDENTIAL MANAGEMENT =====

    // Loading States
    setCredentialsLoading: (state, action) => {
      state.credentials.loading = true;
      state.error = null;
    },

    // Meta Credentials
    setMetaCredentials: (state, action) => {
      state.credentials.meta = action.payload;
      state.credentials.loading = false;
      state.error = null;
    },

    addMetaCredential: (state, action) => {
      state.credentials.meta.push(action.payload);
      state.success = true;
      state.error = null;
    },

    updateMetaCredential: (state, action) => {
      const index = state.credentials.meta.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.credentials.meta[index] = action.payload;
      }
      state.success = true;
    },

    deleteMetaCredential: (state, action) => {
      state.credentials.meta = state.credentials.meta.filter(c => c.id !== action.payload);
      state.success = true;
    },

    // WhatsApp Credentials
    setWhatsAppCredentials: (state, action) => {
      state.credentials.whatsapp = action.payload;
      state.credentials.loading = false;
      state.error = null;
    },

    addWhatsAppCredential: (state, action) => {
      state.credentials.whatsapp.push(action.payload);
      state.success = true;
      state.error = null;
    },

    updateWhatsAppCredential: (state, action) => {
      const index = state.credentials.whatsapp.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.credentials.whatsapp[index] = action.payload;
      }
      state.success = true;
    },

    deleteWhatsAppCredential: (state, action) => {
      state.credentials.whatsapp = state.credentials.whatsapp.filter(c => c.id !== action.payload);
      state.success = true;
    },

    // ===== META SYNC STATUS =====

    startMetaSync: (state) => {
      state.meta.syncStatus.isSyncing = true;
      state.loading = true;
    },

    setSyncStatus: (state, action) => {
      state.meta.syncStatus = {
        ...state.meta.syncStatus,
        ...action.payload,
      };
      state.loading = false;
    },

    syncCompleted: (state, action) => {
      state.meta.syncStatus.isSyncing = false;
      state.meta.syncStatus.lastSync = new Date().toISOString();
      state.meta.syncStatus.nextSync = new Date(Date.now() + 300000).toISOString();
      state.meta.syncStatus.totalSynced = action.payload?.count || 0;
      state.loading = false;
      state.success = true;
    },

    syncFailed: (state, action) => {
      state.meta.syncStatus.isSyncing = false;
      state.meta.syncStatus.errorCount += 1;
      state.error = action.payload;
      state.loading = false;
    },

    // ===== META LEADS =====

    setMetaLeads: (state, action) => {
      state.meta.leads = action.payload;
      state.error = null;
    },

    addMetaLead: (state, action) => {
      state.meta.leads.unshift(action.payload);
    },

    updateMetaLead: (state, action) => {
      const index = state.meta.leads.findIndex(l => l.id === action.payload.id);
      if (index !== -1) {
        state.meta.leads[index] = action.payload;
      }
    },

    deleteMetaLead: (state, action) => {
      state.meta.leads = state.meta.leads.filter(l => l.id !== action.payload);
    },

    // ===== META CAMPAIGNS =====

    setMetaCampaigns: (state, action) => {
      state.meta.campaigns = action.payload;
    },

    addMetaCampaign: (state, action) => {
      state.meta.campaigns.push(action.payload);
      state.success = true;
    },

    updateMetaCampaign: (state, action) => {
      const index = state.meta.campaigns.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.meta.campaigns[index] = action.payload;
      }
    },

    deleteMetaCampaign: (state, action) => {
      state.meta.campaigns = state.meta.campaigns.filter(c => c.id !== action.payload);
    },

    // ===== META SYNC LOGS =====

    setMetaLogs: (state, action) => {
      state.meta.logs = action.payload;
    },

    addMetaLog: (state, action) => {
      state.meta.logs.unshift(action.payload);
      // Keep only last 100 logs in memory
      if (state.meta.logs.length > 100) {
        state.meta.logs = state.meta.logs.slice(0, 100);
      }
    },

    // ===== META NOTIFICATIONS =====

    setMetaNotifications: (state, action) => {
      state.meta.notifications = action.payload;
    },

    addMetaNotification: (state, action) => {
      state.meta.notifications.unshift(action.payload);
      // Keep only last 50 notifications in memory
      if (state.meta.notifications.length > 50) {
        state.meta.notifications = state.meta.notifications.slice(0, 50);
      }
    },

    markNotificationAsRead: (state, action) => {
      const notif = state.meta.notifications.find(n => n.id === action.payload);
      if (notif) {
        notif.leido = true;
      }
    },

    clearNotifications: (state) => {
      state.meta.notifications = [];
    },

    removeNotification: (state, action) => {
      state.meta.notifications = state.meta.notifications.filter(n => n.id !== action.payload);
    },

    // ===== WHATSAPP MESSAGES =====

    setWhatsAppMessages: (state, action) => {
      state.whatsapp.messages = action.payload;
    },

    addWhatsAppMessage: (state, action) => {
      state.whatsapp.messages.push(action.payload);
    },

    // ===== WHATSAPP TEMPLATES =====

    setWhatsAppTemplates: (state, action) => {
      state.whatsapp.templates = action.payload;
    },

    // ===== SELECTED CREDENTIALS =====

    setSelectedMetaCredential: (state, action) => {
      state.meta.selectedCredential = action.payload;
    },

    setSelectedWhatsAppCredential: (state, action) => {
      state.whatsapp.selectedCredential = action.payload;
    },

    // ===== ERROR & SUCCESS HANDLING =====

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },

    setSuccess: (state, action) => {
      state.success = action.payload;
      state.error = null;
    },

    clearError: (state) => {
      state.error = null;
    },

    clearSuccess: (state) => {
      state.success = false;
    },

    // ===== RESET =====

    resetMetaIntegration: (state) => {
      return initialState;
    },
  },
});

export const {
  // Credentials
  setCredentialsLoading,
  setMetaCredentials,
  addMetaCredential,
  updateMetaCredential,
  deleteMetaCredential,
  setWhatsAppCredentials,
  addWhatsAppCredential,
  updateWhatsAppCredential,
  deleteWhatsAppCredential,

  // Sync Status
  startMetaSync,
  setSyncStatus,
  syncCompleted,
  syncFailed,

  // Leads
  setMetaLeads,
  addMetaLead,
  updateMetaLead,
  deleteMetaLead,

  // Campaigns
  setMetaCampaigns,
  addMetaCampaign,
  updateMetaCampaign,
  deleteMetaCampaign,

  // Logs
  setMetaLogs,
  addMetaLog,

  // Notifications
  setMetaNotifications,
  addMetaNotification,
  markNotificationAsRead,
  clearNotifications,
  removeNotification,

  // WhatsApp
  setWhatsAppMessages,
  addWhatsAppMessage,
  setWhatsAppTemplates,

  // Selected
  setSelectedMetaCredential,
  setSelectedWhatsAppCredential,

  // General
  setLoading,
  setError,
  setSuccess,
  clearError,
  clearSuccess,
  resetMetaIntegration,
} = metaIntegrationSlice.actions;

export default metaIntegrationSlice.reducer;
