// 🔧 API Configuration - OMKO Real Estate
// Configuración centralizada de URLs y endpoints

// URLs de producción
const PRODUCTION_CONFIG = {
  BACKEND_URL: 'https://admin.omko.do',
  FRONTEND_URL: 'https://realestate.omko.do',
  API_BASE_URL: 'https://admin.omko.do/api',
  ADMIN_URL: 'https://admin.omko.do'
};

// URLs de desarrollo (para testing local)
const DEVELOPMENT_CONFIG = {
  BACKEND_URL: 'http://localhost:8000',
  FRONTEND_URL: 'http://localhost:3000',
  API_BASE_URL: 'http://localhost:8000/api',
  ADMIN_URL: 'http://localhost:8000'
};

// Detectar entorno
const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || 
   window.location.hostname === '127.0.0.1' ||
   window.location.port === '3000');

// Detectar entorno
const isProduction = typeof window !== 'undefined' && 
  (window.location.hostname === 'realestate.omko.do' || 
   window.location.hostname.includes('omko.do'));

// Si estamos en desarrollo local (localhost:3000), usar backend de producción para testing
const isLocalDev = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' && window.location.port === '3000');

// Configuración activa
// Configuración activa - usar producción tanto para prod como para dev local (testing)
const API_CONFIG = (isProduction || isLocalDev) ? PRODUCTION_CONFIG : DEVELOPMENT_CONFIG;// Endpoints principales
export const ENDPOINTS = {
  // Sistema
  SYSTEM_SETTINGS: '/get_system_settings',
  
  // Autenticación
  USER_SIGNUP: '/user_signup',
  USER_LOGIN: '/user_login',
  VERIFY_USER: '/verify_user',
  
  // Propiedades
  GET_PROPERTIES: '/get_property',
  POST_PROPERTY: '/post_property',
  UPDATE_PROPERTY: '/update_post_property',
  DELETE_PROPERTY: '/delete_property',
  
  // Proyectos
  GET_PROJECTS: '/get_projects',
  POST_PROJECT: '/post_project',
  
  // Categorías
  GET_CATEGORIES: '/get_categories',
  
  // Favoritos
  ADD_FAVOURITE: '/add_favourite',
  GET_FAVOURITES: '/get_favourite_property',
  
  // Mensajes/Chat
  SEND_MESSAGE: '/send_message',
  GET_CHAT: '/get_chats',
  DELETE_CHAT_MESSAGE: '/delete_chat_message',
  
  // Notificaciones FCM
  SAVE_FCM_TOKEN: '/save-fcm-token',
  
  // Artículos/Blog
  GET_ARTICLES: '/get_articles',
  
  // Configuración personalizada
  PERSONALISED_FIELDS: '/personalised-fields',
  
  // Pagos
  PAYMENT_INTENT: '/payment_intent',
  
  // Ubicaciones
  GET_NEARBY_PROPERTIES: '/get_nearby_properties'
};

// Headers por defecto
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'X-Requested-With': 'XMLHttpRequest'
};

// Función para construir URL completa
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.API_BASE_URL}${endpoint}`;
};

// Función para realizar peticiones HTTP
export const apiRequest = async (endpoint, options = {}) => {
  const url = buildApiUrl(endpoint);
  const config = {
    headers: DEFAULT_HEADERS,
    ...options
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${data.message || 'Request failed'}`);
    }
    
    return data;
  } catch (error) {
    console.error(`API Request failed [${endpoint}]:`, error);
    throw error;
  }
};

// Exportar configuración
export default API_CONFIG;
export const { BACKEND_URL, FRONTEND_URL, API_BASE_URL, ADMIN_URL } = API_CONFIG;

// Información del entorno
export const ENV_INFO = {
  IS_LOCALHOST: isLocalhost,
  IS_PRODUCTION: isProduction,
  CURRENT_DOMAIN: typeof window !== 'undefined' ? window.location.hostname : 'unknown',
  CURRENT_PORT: typeof window !== 'undefined' ? window.location.port : 'unknown',
  BACKEND_URL: API_CONFIG.BACKEND_URL,
  API_BASE_URL: API_CONFIG.API_BASE_URL
};

// Log de configuración (solo en desarrollo)
if ((isLocalhost || !isProduction) && typeof console !== 'undefined') {
  console.log('🔧 API Configuration loaded:', ENV_INFO);
}