// API Endpoints - OMKO Real Estate
// Integración con backend en https://admin.omko.do/public/api

export const ENDPOINTS = {
  // ===== PUBLIC ENDPOINTS (No Auth Required) =====
  
  // Properties
  PROPERTIES: '/get_property',
  NEARBY_PROPERTIES: '/get_nearby_properties',
  PROPERTY_CLICK: '/set_property_total_click',
  PROPERTY_VIEWS_STATS: (propertyId) => `/properties/${propertyId}/views/stats`,
  MOST_VIEWED_PROPERTIES: '/properties/most-viewed',
  MOST_VIEWED_MONTH: '/properties/most-viewed/month',
  
  // User & Auth
  USER_SIGNUP: '/user_signup',
  GET_OTP: '/get-otp',
  VERIFY_OTP: '/verify-otp',
  USER_LOGIN: '/user_login',
  VERIFY_USER: '/verify_user',
  
  // Packages
  PACKAGES: '/get_package',
  
  // System Data
  CITIES_DATA: '/get-cities-data',
  CONTACT_US: '/contct_us',
  SLIDER: '/get-slider',
  FACILITIES: '/get_facilities',
  SEO_SETTINGS: '/get_seo_settings',
  PROJECTS: '/get_projects',
  ARTICLES: '/get_articles',
  CATEGORIES: '/get_categories',
  LANGUAGES: '/get_languages',
  ADVERTISEMENT: '/get_advertisement',
  APP_SETTINGS: '/get_app_settings',
  WEB_SETTINGS: '/web-settings',
  HOMEPAGE_DATA: '/homepage-data',
  FAQS: '/faqs',
  SYSTEM_SETTINGS: '/get_system_settings',
  MORTGAGE_CALC: '/mortgage_calc',
  
  // Agents
  AGENT_LIST: '/agent-list',
  AGENT_PROPERTIES: (agentId) => `/agent-properties?agent_id=${agentId}`,
  
  // Reviews & Ratings
  REVIEWS: '/reviews',
  PROPERTY_REVIEWS: (propertyId) => `/properties/${propertyId}/reviews`,
  PROPERTY_REVIEWS_STATS: (propertyId) => `/properties/${propertyId}/reviews/stats`,
  AGENT_REVIEWS: (agentId) => `/agents/${agentId}/reviews`,
  AGENT_REVIEWS_STATS: (agentId) => `/agents/${agentId}/reviews/stats`,
  
  // Newsletter
  NEWSLETTER_SUBSCRIBE: '/newsletter/subscribe',
  NEWSLETTER_VERIFY: '/newsletter/verify-email',
  NEWSLETTER_UNSUBSCRIBE: '/newsletter/unsubscribe',
  NEWSLETTER_CHECK: '/newsletter/check-email',
  
  // Payment
  PAYMENT_STATUS: '/app_payment_status',
  
  // Property Views (Public tracking)
  RECORD_PROPERTY_VIEW: (propertyId) => `/properties/${propertyId}/view`,
  
  // Report Reasons
  REPORT_REASONS: '/get_report_reasons',
  
  // ===== AUTHENTICATED ENDPOINTS =====
  
  // User Profile & Preferences
  GET_USER: '/user/info',
  UPDATE_USER: '/user/update',
  CHANGE_PASSWORD: '/user/change-password',
  USER_PROPERTIES: '/user/properties',
  USER_INTERESTS: '/user/interests',
  USER_APPOINTMENTS: '/user/appointments',
  USER_CHATS: '/user/chats',
  
  // Properties (User)
  CREATE_PROPERTY: '/property/create',
  UPDATE_PROPERTY: '/property/update',
  DELETE_PROPERTY: '/property/delete',
  PROPERTY_INQUIRIES: '/property-inquiries',
  
  // Payments (User)
  PAYMENT_TRANSACTIONS: '/payment-transactions',
  PROCESS_PAYMENT: '/payment/process',
  
  // Appointments
  CREATE_APPOINTMENT: '/appointment/create',
  GET_APPOINTMENTS: '/appointment/list',
  CANCEL_APPOINTMENT: '/appointment/cancel',
  RESCHEDULE_APPOINTMENT: '/appointment/reschedule',
  
  // Chat
  GET_CHATS: '/chat/list',
  GET_CHAT_MESSAGES: (chatId) => `/chat/${chatId}/messages`,
  SEND_MESSAGE: '/chat/send',
  
  // Interests
  ADD_INTEREST: '/interest/add',
  REMOVE_INTEREST: '/interest/remove',
  GET_INTERESTS: '/interest/list',
  
  // Reviews
  CREATE_REVIEW: '/review/create',
  UPDATE_REVIEW: '/review/update',
  DELETE_REVIEW: '/review/delete',
  
  // Package Limits
  USER_PACKAGE_LIMITS: '/user/package-limits',
  UPDATE_PACKAGE: '/user/update-package',
  
  // Agent Unavailability
  AGENT_UNAVAILABILITY: '/agent/unavailability',
  
  // Notifications
  GET_NOTIFICATIONS: '/notifications',
  MARK_NOTIFICATION_READ: '/notification/mark-read',
}

export default ENDPOINTS
