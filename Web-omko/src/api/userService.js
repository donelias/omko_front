// User Service - Integración con backend OMKO
import Api from './AxiosInterceptors'
import ENDPOINTS from './endpoints'

export const userService = {
  // Public: User signup
  signup: async (userData) => {
    try {
      const response = await Api.post(ENDPOINTS.USER_SIGNUP, userData)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Public: Get OTP
  getOtp: async (phone) => {
    try {
      const response = await Api.get(ENDPOINTS.GET_OTP, {
        params: { phone }
      })
      return response.data
    } catch (error) {
      console.error('Error getting OTP:', error)
      throw error
    }
  },

  // Public: Verify OTP
  verifyOtp: async (phone, otp) => {
    try {
      const response = await Api.get(ENDPOINTS.VERIFY_OTP, {
        params: { phone, otp }
      })
      return response.data
    } catch (error) {
      console.error('Error verifying OTP:', error)
      throw error
    }
  },

  // Public: User login
  login: async (credentials) => {
    try {
      const response = await Api.post(ENDPOINTS.USER_LOGIN, credentials)
      return response.data
    } catch (error) {
      console.error('Error during login:', error)
      throw error
    }
  },

  // Auth: Get user info
  getUserInfo: async () => {
    try {
      const response = await Api.get(ENDPOINTS.GET_USER)
      return response.data
    } catch (error) {
      console.error('Error fetching user info:', error)
      throw error
    }
  },

  // Auth: Update user profile
  updateUserProfile: async (userData) => {
    try {
      const response = await Api.put(ENDPOINTS.UPDATE_USER, userData)
      return response.data
    } catch (error) {
      console.error('Error updating user profile:', error)
      throw error
    }
  },

  // Auth: Change password
  changePassword: async (oldPassword, newPassword) => {
    try {
      const response = await Api.post(ENDPOINTS.CHANGE_PASSWORD, {
        old_password: oldPassword,
        new_password: newPassword
      })
      return response.data
    } catch (error) {
      console.error('Error changing password:', error)
      throw error
    }
  },

  // Auth: Get user properties
  getUserProperties: async () => {
    try {
      const response = await Api.get(ENDPOINTS.USER_PROPERTIES)
      return response.data
    } catch (error) {
      console.error('Error fetching user properties:', error)
      throw error
    }
  },

  // Auth: Get user interests
  getUserInterests: async () => {
    try {
      const response = await Api.get(ENDPOINTS.USER_INTERESTS)
      return response.data
    } catch (error) {
      console.error('Error fetching user interests:', error)
      throw error
    }
  },

  // Auth: Get user appointments
  getUserAppointments: async () => {
    try {
      const response = await Api.get(ENDPOINTS.USER_APPOINTMENTS)
      return response.data
    } catch (error) {
      console.error('Error fetching user appointments:', error)
      throw error
    }
  },

  // Auth: Get user chats
  getUserChats: async () => {
    try {
      const response = await Api.get(ENDPOINTS.USER_CHATS)
      return response.data
    } catch (error) {
      console.error('Error fetching user chats:', error)
      throw error
    }
  },

  // Auth: Get user package limits
  getUserPackageLimits: async () => {
    try {
      const response = await Api.get(ENDPOINTS.USER_PACKAGE_LIMITS)
      return response.data
    } catch (error) {
      console.error('Error fetching user package limits:', error)
      throw error
    }
  },

  // Auth: Update package
  updatePackage: async (packageData) => {
    try {
      const response = await Api.post(ENDPOINTS.UPDATE_PACKAGE, packageData)
      return response.data
    } catch (error) {
      console.error('Error updating package:', error)
      throw error
    }
  }
}

export default userService
