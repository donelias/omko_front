// API Services Index - Exporta todos los servicios disponibles
export { propertyService } from './propertyService'
export { userService } from './userService'
export { systemService } from './systemService'
export { appointmentService } from './appointmentService'
export { reviewService } from './reviewService'
export { paymentService } from './paymentService'
export { chatService } from './chatService'
export { interestService } from './interestService'
export { agentService } from './agentService'
export { newsletterService } from './newsletterService'
export { default as ENDPOINTS } from './endpoints'
export { default as Api } from './AxiosInterceptors'

// Custom Hooks for easier component integration
export {
  useHomepageData,
  useCategories,
  useCities,
  useFaqs,
  useProperties,
  useCurrentUser,
  useUserInterests,
  useFavorite,
  useCreateAppointment,
  useCreateReview,
  useAuth
} from './hooks'
