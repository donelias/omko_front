// Payment Service - Integración con backend OMKO
import Api from './AxiosInterceptors'
import ENDPOINTS from './endpoints'

export const paymentService = {
  // Public: Check payment status
  checkPaymentStatus: async (params = {}) => {
    try {
      const response = await Api.post(ENDPOINTS.PAYMENT_STATUS, params)
      return response.data
    } catch (error) {
      console.error('Error checking payment status:', error)
      throw error
    }
  },

  // Auth: Get payment transactions
  getPaymentTransactions: async (params = {}) => {
    try {
      const response = await Api.get(ENDPOINTS.PAYMENT_TRANSACTIONS, { params })
      return response.data
    } catch (error) {
      console.error('Error fetching payment transactions:', error)
      throw error
    }
  },

  // Auth: Process payment
  processPayment: async (paymentData) => {
    try {
      const response = await Api.post(ENDPOINTS.PROCESS_PAYMENT, paymentData)
      return response.data
    } catch (error) {
      console.error('Error processing payment:', error)
      throw error
    }
  },

  // Public: Get packages
  getPackages: async (params = {}) => {
    try {
      const response = await Api.get(ENDPOINTS.PACKAGES, { params })
      return response.data
    } catch (error) {
      console.error('Error fetching packages:', error)
      throw error
    }
  }
}

export default paymentService
