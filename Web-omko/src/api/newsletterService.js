// Newsletter Service - Integración con backend OMKO
import Api from './AxiosInterceptors'
import ENDPOINTS from './endpoints'

export const newsletterService = {
  // Public: Subscribe to newsletter
  subscribe: async (email) => {
    try {
      const response = await Api.post(ENDPOINTS.NEWSLETTER_SUBSCRIBE, { email })
      return response.data
    } catch (error) {
      console.error('Error subscribing to newsletter:', error)
      throw error
    }
  },

  // Public: Verify email subscription
  verifyEmail: async (email, token) => {
    try {
      const response = await Api.post(ENDPOINTS.NEWSLETTER_VERIFY, {
        email,
        token
      })
      return response.data
    } catch (error) {
      console.error('Error verifying email:', error)
      throw error
    }
  },

  // Public: Unsubscribe from newsletter
  unsubscribe: async (email) => {
    try {
      const response = await Api.post(ENDPOINTS.NEWSLETTER_UNSUBSCRIBE, { email })
      return response.data
    } catch (error) {
      console.error('Error unsubscribing from newsletter:', error)
      throw error
    }
  },

  // Public: Check if email is subscribed
  checkEmail: async (email) => {
    try {
      const response = await Api.get(ENDPOINTS.NEWSLETTER_CHECK, {
        params: { email }
      })
      return response.data
    } catch (error) {
      console.error('Error checking email subscription:', error)
      throw error
    }
  }
}

export default newsletterService
