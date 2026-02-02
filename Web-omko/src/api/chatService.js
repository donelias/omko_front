// Chat Service - Integración con backend OMKO
import Api from './AxiosInterceptors'
import ENDPOINTS from './endpoints'

export const chatService = {
  // Auth: Get user chats
  getChats: async (params = {}) => {
    try {
      const response = await Api.get(ENDPOINTS.GET_CHATS, { params })
      return response.data
    } catch (error) {
      console.error('Error fetching chats:', error)
      throw error
    }
  },

  // Auth: Get chat messages
  getChatMessages: async (chatId, params = {}) => {
    try {
      const response = await Api.get(
        ENDPOINTS.GET_CHAT_MESSAGES(chatId),
        { params }
      )
      return response.data
    } catch (error) {
      console.error('Error fetching chat messages:', error)
      throw error
    }
  },

  // Auth: Send message
  sendMessage: async (chatId, message) => {
    try {
      const response = await Api.post(ENDPOINTS.SEND_MESSAGE, {
        chat_id: chatId,
        message
      })
      return response.data
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }
}

export default chatService
