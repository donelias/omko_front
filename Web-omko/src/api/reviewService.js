// Review Service - Integración con backend OMKO
import Api from './AxiosInterceptors'
import ENDPOINTS from './endpoints'

export const reviewService = {
  // Public: Get all reviews
  getReviews: async (params = {}) => {
    try {
      const response = await Api.get(ENDPOINTS.REVIEWS, { params })
      return response.data
    } catch (error) {
      console.error('Error fetching reviews:', error)
      throw error
    }
  },

  // Public: Get property reviews
  getPropertyReviews: async (propertyId, params = {}) => {
    try {
      const response = await Api.get(
        ENDPOINTS.PROPERTY_REVIEWS(propertyId),
        { params }
      )
      return response.data
    } catch (error) {
      console.error('Error fetching property reviews:', error)
      throw error
    }
  },

  // Public: Get property review stats
  getPropertyReviewStats: async (propertyId) => {
    try {
      const response = await Api.get(ENDPOINTS.PROPERTY_REVIEWS_STATS(propertyId))
      return response.data
    } catch (error) {
      console.error('Error fetching property review stats:', error)
      throw error
    }
  },

  // Public: Get agent reviews
  getAgentReviews: async (agentId, params = {}) => {
    try {
      const response = await Api.get(
        ENDPOINTS.AGENT_REVIEWS(agentId),
        { params }
      )
      return response.data
    } catch (error) {
      console.error('Error fetching agent reviews:', error)
      throw error
    }
  },

  // Public: Get agent review stats
  getAgentReviewStats: async (agentId) => {
    try {
      const response = await Api.get(ENDPOINTS.AGENT_REVIEWS_STATS(agentId))
      return response.data
    } catch (error) {
      console.error('Error fetching agent review stats:', error)
      throw error
    }
  },

  // Auth: Create review
  createReview: async (reviewData) => {
    try {
      const response = await Api.post(ENDPOINTS.CREATE_REVIEW, reviewData)
      return response.data
    } catch (error) {
      console.error('Error creating review:', error)
      throw error
    }
  },

  // Auth: Update review
  updateReview: async (reviewId, reviewData) => {
    try {
      const response = await Api.put(
        ENDPOINTS.UPDATE_REVIEW.replace('{id}', reviewId),
        reviewData
      )
      return response.data
    } catch (error) {
      console.error('Error updating review:', error)
      throw error
    }
  },

  // Auth: Delete review
  deleteReview: async (reviewId) => {
    try {
      const response = await Api.delete(
        ENDPOINTS.DELETE_REVIEW.replace('{id}', reviewId)
      )
      return response.data
    } catch (error) {
      console.error('Error deleting review:', error)
      throw error
    }
  }
}

export default reviewService
