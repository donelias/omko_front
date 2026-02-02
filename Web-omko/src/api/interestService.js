// Interest Service - Integración con backend OMKO
import Api from './AxiosInterceptors'
import ENDPOINTS from './endpoints'

export const interestService = {
  // Auth: Add property to interests
  addInterest: async (propertyId) => {
    try {
      const response = await Api.post(ENDPOINTS.ADD_INTEREST, {
        property_id: propertyId
      })
      return response.data
    } catch (error) {
      console.error('Error adding property to interests:', error)
      throw error
    }
  },

  // Auth: Remove property from interests
  removeInterest: async (propertyId) => {
    try {
      const response = await Api.post(ENDPOINTS.REMOVE_INTEREST, {
        property_id: propertyId
      })
      return response.data
    } catch (error) {
      console.error('Error removing property from interests:', error)
      throw error
    }
  },

  // Auth: Get user interests
  getInterests: async (params = {}) => {
    try {
      const response = await Api.get(ENDPOINTS.GET_INTERESTS, { params })
      return response.data
    } catch (error) {
      console.error('Error fetching user interests:', error)
      throw error
    }
  }
}

export default interestService
