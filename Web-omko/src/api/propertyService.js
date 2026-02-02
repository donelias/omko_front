// Property Service - Integración con backend OMKO
import Api from './AxiosInterceptors'
import ENDPOINTS from './endpoints'

export const propertyService = {
  // Get all properties with filters
  getProperties: async (params = {}) => {
    try {
      const response = await Api.get(ENDPOINTS.PROPERTIES, { params })
      return response.data
    } catch (error) {
      console.error('Error fetching properties:', error)
      throw error
    }
  },

  // Get nearby properties
  getNearbyProperties: async (latitude, longitude, radius = 5) => {
    try {
      const response = await Api.get(ENDPOINTS.NEARBY_PROPERTIES, {
        params: { latitude, longitude, radius }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching nearby properties:', error)
      throw error
    }
  },

  // Record property click/view
  recordPropertyClick: async (propertySlugId) => {
    try {
      const response = await Api.post(ENDPOINTS.PROPERTY_CLICK, {
        property_slug_id: propertySlugId
      })
      return response.data
    } catch (error) {
      console.error('Error recording property click:', error)
      // Don't throw - allow page to load even if click tracking fails
      return null
    }
  },

  // Record property view
  recordPropertyView: async (propertyId) => {
    try {
      const response = await Api.post(ENDPOINTS.RECORD_PROPERTY_VIEW(propertyId))
      return response.data
    } catch (error) {
      console.error('Error recording property view:', error)
      throw error
    }
  },

  // Get property view stats
  getPropertyViewStats: async (propertyId) => {
    try {
      const response = await Api.get(ENDPOINTS.PROPERTY_VIEWS_STATS(propertyId))
      return response.data
    } catch (error) {
      console.error('Error fetching property view stats:', error)
      throw error
    }
  },

  // Get most viewed properties
  getMostViewedProperties: async () => {
    try {
      const response = await Api.get(ENDPOINTS.MOST_VIEWED_PROPERTIES)
      return response.data
    } catch (error) {
      console.error('Error fetching most viewed properties:', error)
      throw error
    }
  },

  // Get most viewed properties this month
  getMostViewedThisMonth: async () => {
    try {
      const response = await Api.get(ENDPOINTS.MOST_VIEWED_MONTH)
      return response.data
    } catch (error) {
      console.error('Error fetching most viewed this month:', error)
      throw error
    }
  },

  // User: Create property
  createProperty: async (propertyData) => {
    try {
      const response = await Api.post(ENDPOINTS.CREATE_PROPERTY, propertyData)
      return response.data
    } catch (error) {
      console.error('Error creating property:', error)
      throw error
    }
  },

  // User: Update property
  updateProperty: async (propertyId, propertyData) => {
    try {
      const response = await Api.put(
        ENDPOINTS.UPDATE_PROPERTY.replace('{id}', propertyId),
        propertyData
      )
      return response.data
    } catch (error) {
      console.error('Error updating property:', error)
      throw error
    }
  },

  // User: Delete property
  deleteProperty: async (propertyId) => {
    try {
      const response = await Api.delete(
        ENDPOINTS.DELETE_PROPERTY.replace('{id}', propertyId)
      )
      return response.data
    } catch (error) {
      console.error('Error deleting property:', error)
      throw error
    }
  },

  // Get property inquiries
  getPropertyInquiries: async (propertyId) => {
    try {
      const response = await Api.get(ENDPOINTS.PROPERTY_INQUIRIES, {
        params: { property_id: propertyId }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching property inquiries:', error)
      throw error
    }
  },

  // Get property detail by slug
  getPropertyDetail: async (slug, params = {}) => {
    try {
      const response = await Api.get(ENDPOINTS.PROPERTIES, {
        params: { slug_id: slug, ...params }
      })
      // API returns: { data: { data: [...], similar_properties: [...] } }
      const apiData = response.data || {}
      const propertyList = Array.isArray(apiData.data) ? apiData.data : []
      
      return {
        data: propertyList[0] || null,
        similar_properties: apiData.similar_properties || [],
        error: apiData.error || false,
        message: apiData.message || ''
      }
    } catch (error) {
      console.error('Error fetching property detail:', error)
      throw error
    }
  }
}

export default propertyService
