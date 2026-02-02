# Guía de Integración de Servicios API - Web-omko

## Índice de Servicios Disponibles

Todos los servicios están centralizados en `/src/api/` y pueden importarse desde `/src/api/index.js`

### Importar Servicios

```javascript
// Importar todos los servicios
import { propertyService, userService, systemService } from '@/api'

// O importar servicios individuales
import { propertyService } from '@/api/propertyService'
import { appointmentService } from '@/api/appointmentService'
```

## Servicios Disponibles

### 1. **systemService** - Datos del Sistema (Públicos)
```javascript
import { systemService } from '@/api'

// Ejemplos de uso:
const settings = await systemService.getSystemSettings()
const webSettings = await systemService.getWebSettings()
const languages = await systemService.getLanguages()
const cities = await systemService.getCitiesData()
const categories = await systemService.getCategories()
const facilities = await systemService.getFacilities()
const slider = await systemService.getSlider()
const projects = await systemService.getProjects()
const articles = await systemService.getArticles()
const faqs = await systemService.getFaqs()
const homepageData = await systemService.getHomepageData() // Datos para página inicial
```

### 2. **propertyService** - Gestión de Propiedades
```javascript
import { propertyService } from '@/api'

// Públicos:
const properties = await propertyService.getProperties({ limit: 10, page: 1 })
const nearbyProperties = await propertyService.getNearbyProperties({ lat, lng, radius: 5 })
const stats = await propertyService.getPropertyViewStats(propertyId)

// Autenticados:
const myProperties = await propertyService.createProperty(propertyData)
await propertyService.updateProperty(propertyId, updateData)
await propertyService.deleteProperty(propertyId)
```

### 3. **userService** - Autenticación y Perfil
```javascript
import { userService } from '@/api'

// Públicos:
const otp = await userService.getOtp(phone)
const user = await userService.verifyOtp(phone, otp)
const loginResult = await userService.signup(userData) // signup/login
const userInfo = await userService.login(email, password)

// Autenticados:
const profile = await userService.getUserInfo()
await userService.updateUserProfile(profileData)
await userService.changePassword(oldPassword, newPassword)
```

### 4. **appointmentService** - Citas y Reservas
```javascript
import { appointmentService } from '@/api'

// Autenticados:
const appointment = await appointmentService.createAppointment(appointmentData)
const appointments = await appointmentService.getAppointments()
await appointmentService.cancelAppointment(appointmentId, reason)
await appointmentService.rescheduleAppointment(appointmentId, newDateTime)
```

### 5. **reviewService** - Reseñas
```javascript
import { reviewService } from '@/api'

// Públicos:
const allReviews = await reviewService.getReviews()
const propertyReviews = await reviewService.getPropertyReviews(propertyId)
const stats = await reviewService.getPropertyReviewStats(propertyId)

// Autenticados:
const review = await reviewService.createReview(reviewData)
await reviewService.updateReview(reviewId, updateData)
await reviewService.deleteReview(reviewId)
```

### 6. **paymentService** - Pagos y Paquetes
```javascript
import { paymentService } from '@/api'

// Públicos:
const packages = await paymentService.getPackages()
const status = await paymentService.checkPaymentStatus(params)

// Autenticados:
const transactions = await paymentService.getPaymentTransactions()
const result = await paymentService.processPayment(paymentData)
```

### 7. **chatService** - Mensajería
```javascript
import { chatService } from '@/api'

// Autenticados:
const chats = await chatService.getChats()
const messages = await chatService.getChatMessages(chatId)
await chatService.sendMessage(chatId, message)
```

### 8. **appointmentService** - Citas
```javascript
import { appointmentService } from '@/api'

// Autenticados:
const appointment = await appointmentService.createAppointment(data)
const appointments = await appointmentService.getAppointments()
```

### 9. **interestService** - Propiedades Favoritas
```javascript
import { interestService } from '@/api'

// Autenticados:
await interestService.addInterest(propertyId)
await interestService.removeInterest(propertyId)
const interests = await interestService.getInterests()
```

### 10. **agentService** - Agentes
```javascript
import { agentService } from '@/api'

// Públicos:
const agents = await agentService.getAgentList()
const agentProps = await agentService.getAgentProperties(agentId)
```

### 11. **newsletterService** - Newsletter
```javascript
import { newsletterService } from '@/api'

// Públicos:
await newsletterService.subscribe(email)
await newsletterService.unsubscribe(email)
const isSubscribed = await newsletterService.checkEmail(email)
```

## Patrones de Uso en Componentes

### Pattern 1: Cargar datos en useEffect
```jsx
import { useEffect, useState } from 'react'
import { systemService } from '@/api'

export default function Component() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await systemService.getCategories()
        setData(result.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  return <div>{/* render data */}</div>
}
```

### Pattern 2: Usar con Redux
```jsx
import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import { propertyService } from '@/api'

export default function Component() {
  const dispatch = useDispatch()
  const properties = useSelector(state => state.property.list)

  useEffect(() => {
    const loadProperties = async () => {
      const data = await propertyService.getProperties()
      dispatch({ type: 'PROPERTY_SET_LIST', payload: data })
    }
    loadProperties()
  }, [dispatch])

  return <div>{/* render properties */}</div>
}
```

### Pattern 3: Manejo de errores
```jsx
import { propertyService } from '@/api'
import toast from 'react-hot-toast'

async function createNewProperty(data) {
  try {
    const result = await propertyService.createProperty(data)
    toast.success('Property created successfully')
    return result
  } catch (error) {
    toast.error(error.response?.data?.message || 'Error creating property')
    throw error
  }
}
```

## Componentes a Actualizar (Prioritarios)

1. **HomePage/index.jsx** - Usar `systemService.getHomepageData()`
2. **PropertyListing/index.jsx** - Usar `propertyService.getProperties()`
3. **PropertyDetail/index.jsx** - Usar `propertyService.getProperties()` con parámetros
4. **Auth/Login.jsx** - Usar `userService.login()`
5. **Auth/Signup.jsx** - Usar `userService.signup()`
6. **UserProfile/index.jsx** - Usar `userService.getUserInfo()`

## Notas Importantes

- ✅ Todos los servicios incluyen manejo de errores
- ✅ Todos usan `AxiosInterceptors` que maneja tokens automáticamente
- ✅ Los endpoints están centralizados en `endpoints.js`
- ✅ Compatible con las validaciones del backend
- ✅ Incluye métodos para datos públicos y autenticados

## Próximos Pasos

1. Actualizar componentes principales
2. Probar todas las llamadas API
3. Implementar caché con React Query
4. Actualizar dependencias (Firebase, Redux Toolkit)
