// Agent Service - Integración con backend OMKO
import Api from './AxiosInterceptors'
import ENDPOINTS from './endpoints'

export const agentService = {
  // Public: Get agent list
  getAgentList: async (params = {}) => {
    try {
      const response = await Api.get(ENDPOINTS.AGENT_LIST, { params })
      return response.data
    } catch (error) {
      console.error('Error fetching agent list:', error)
      throw error
    }
  },

  // Public: Get agent properties
  getAgentProperties: async (agentId, params = {}) => {
    try {
      const response = await Api.get(ENDPOINTS.AGENT_PROPERTIES(agentId), { params })
      return response.data
    } catch (error) {
      console.error('Error fetching agent properties:', error)
      throw error
    }
  }
}

export default agentService
