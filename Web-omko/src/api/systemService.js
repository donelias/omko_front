// System Service - Datos públicos del sistema OMKO
import Api from './AxiosInterceptors'
import ENDPOINTS from './endpoints'

export const systemService = {
  // Get system settings
  getSystemSettings: async () => {
    try {
      const response = await Api.post(ENDPOINTS.SYSTEM_SETTINGS)
      return response.data
    } catch (error) {
      console.error('Error fetching system settings:', error)
      throw error
    }
  },

  // Get web settings
  getWebSettings: async () => {
    try {
      const response = await Api.get(ENDPOINTS.WEB_SETTINGS)
      return response.data
    } catch (error) {
      console.error('Error fetching web settings:', error)
      throw error
    }
  },

  // Get app settings
  getAppSettings: async () => {
    try {
      const response = await Api.get(ENDPOINTS.APP_SETTINGS)
      return response.data
    } catch (error) {
      console.error('Error fetching app settings:', error)
      throw error
    }
  },

  // Get languages
  getLanguages: async () => {
    try {
      const response = await Api.get(ENDPOINTS.LANGUAGES)
      return response.data
    } catch (error) {
      console.error('Error fetching languages:', error)
      throw error
    }
  },

  // Get cities data
  getCitiesData: async () => {
    try {
      const response = await Api.get(ENDPOINTS.CITIES_DATA)
      return response.data
    } catch (error) {
      console.error('Error fetching cities data:', error)
      throw error
    }
  },

  // Get categories
  getCategories: async () => {
    try {
      const response = await Api.get(ENDPOINTS.CATEGORIES)
      return response.data
    } catch (error) {
      console.error('Error fetching categories:', error)
      throw error
    }
  },

  // Get facilities
  getFacilities: async () => {
    try {
      const response = await Api.get(ENDPOINTS.FACILITIES)
      return response.data
    } catch (error) {
      console.error('Error fetching facilities:', error)
      throw error
    }
  },

  // Get slider
  getSlider: async () => {
    try {
      const response = await Api.get(ENDPOINTS.SLIDER)
      return response.data
    } catch (error) {
      console.error('Error fetching slider:', error)
      throw error
    }
  },

  // Get projects
  getProjects: async () => {
    try {
      const response = await Api.get(ENDPOINTS.PROJECTS)
      return response.data
    } catch (error) {
      console.error('Error fetching projects:', error)
      throw error
    }
  },

  // Get articles
  getArticles: async (params = {}) => {
    try {
      const response = await Api.get(ENDPOINTS.ARTICLES, { params })
      return response.data
    } catch (error) {
      console.error('Error fetching articles:', error)
      throw error
    }
  },

  // Get FAQs
  getFaqs: async () => {
    try {
      const response = await Api.get(ENDPOINTS.FAQS)
      return response.data
    } catch (error) {
      console.error('Error fetching FAQs:', error)
      throw error
    }
  },

  // Get advertisements
  getAdvertisements: async () => {
    try {
      const response = await Api.get(ENDPOINTS.ADVERTISEMENT)
      return response.data
    } catch (error) {
      console.error('Error fetching advertisements:', error)
      throw error
    }
  },

  // Get SEO settings
  getSeoSettings: async () => {
    try {
      const response = await Api.get(ENDPOINTS.SEO_SETTINGS)
      return response.data
    } catch (error) {
      console.error('Error fetching SEO settings:', error)
      throw error
    }
  },

  // Get homepage data
  getHomepageData: async () => {
    try {
      const response = await Api.get(ENDPOINTS.HOMEPAGE_DATA)
      return response.data
    } catch (error) {
      console.error('Error fetching homepage data:', error)
      throw error
    }
  },

  // Contact us
  contactUs: async (contactData) => {
    try {
      const response = await Api.post(ENDPOINTS.CONTACT_US, contactData)
      return response.data
    } catch (error) {
      console.error('Error sending contact message:', error)
      throw error
    }
  },

  // Mortgage calculator
  calculateMortgage: async (mortgageData) => {
    try {
      const response = await Api.post(ENDPOINTS.MORTGAGE_CALC, mortgageData)
      return response.data
    } catch (error) {
      console.error('Error calculating mortgage:', error)
      throw error
    }
  },

  // Get report reasons
  getReportReasons: async () => {
    try {
      const response = await Api.get(ENDPOINTS.REPORT_REASONS)
      return response.data
    } catch (error) {
      console.error('Error fetching report reasons:', error)
      throw error
    }
  }
}

export default systemService
