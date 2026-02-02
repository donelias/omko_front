// Appointment Service - Integración con backend OMKO
import Api from './AxiosInterceptors'
import ENDPOINTS from './endpoints'

export const appointmentService = {
  // Auth: Create appointment
  createAppointment: async (appointmentData) => {
    try {
      const response = await Api.post(ENDPOINTS.CREATE_APPOINTMENT, appointmentData)
      return response.data
    } catch (error) {
      console.error('Error creating appointment:', error)
      throw error
    }
  },

  // Auth: Get appointments
  getAppointments: async (params = {}) => {
    try {
      const response = await Api.get(ENDPOINTS.GET_APPOINTMENTS, { params })
      return response.data
    } catch (error) {
      console.error('Error fetching appointments:', error)
      throw error
    }
  },

  // Auth: Cancel appointment
  cancelAppointment: async (appointmentId, reason = '') => {
    try {
      const response = await Api.post(
        ENDPOINTS.CANCEL_APPOINTMENT,
        { appointment_id: appointmentId, reason }
      )
      return response.data
    } catch (error) {
      console.error('Error canceling appointment:', error)
      throw error
    }
  },

  // Auth: Reschedule appointment
  rescheduleAppointment: async (appointmentId, newDateTime) => {
    try {
      const response = await Api.post(
        ENDPOINTS.RESCHEDULE_APPOINTMENT,
        { appointment_id: appointmentId, new_date_time: newDateTime }
      )
      return response.data
    } catch (error) {
      console.error('Error rescheduling appointment:', error)
      throw error
    }
  },

  // Auth: Get agent unavailability
  getAgentUnavailability: async (agentId) => {
    try {
      const response = await Api.get(ENDPOINTS.AGENT_UNAVAILABILITY, {
        params: { agent_id: agentId }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching agent unavailability:', error)
      throw error
    }
  }
}

export default appointmentService
