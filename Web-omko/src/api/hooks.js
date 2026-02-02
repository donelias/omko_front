// Componente mejorado para cargar datos de HomePage usando servicios
import { useState, useEffect } from 'react'
import { systemService } from '@/api'
import toast from 'react-hot-toast'

export function useHomepageData() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadHomepageData = async () => {
      try {
        setLoading(true)
        const result = await systemService.getHomepageData()
        
        // Debug: Log la estructura de respuesta
        console.log('Homepage API Raw Response:', result)
        console.log('result?.data:', result?.data)
        console.log('result?.data?.most_liked_properties:', result?.data?.most_liked_properties)
        
        // La respuesta tiene estructura: { data: {...}, error: false, message: "..." }
        const dataSource = result?.data || result || {}
        console.log('DataSource:', dataSource)
        
        // Organizar datos por sección - mapear correctamente los campos de la API
        const homepageData = {
          slider: dataSource?.slider_section || dataSource?.slider || [],
          featured: dataSource?.featured_section || dataSource?.featured || [],
          categories: dataSource?.categories_section || dataSource?.categories || [],
          mostViewed: dataSource?.most_viewed_properties || dataSource?.mostViewed || [],
          mostLiked: dataSource?.most_liked_properties || dataSource?.mostLiked || [],
          nearbyProperties: dataSource?.nearby_properties || dataSource?.nearbyProperties || [],
          projects: dataSource?.project_section || dataSource?.projects || [],
          articles: dataSource?.article_section || dataSource?.articles || [],
          agents: dataSource?.agents_section || dataSource?.agents || [],
          testimonials: dataSource?.testimonials || [],
          cities: dataSource?.cities || [],
          recommendations: dataSource?.recommendations || [],
          faqs: dataSource?.faqs || []
        }
        
        console.log('Final Processed Homepage Data:', homepageData)
        setData(homepageData)
        setError(null)
      } catch (err) {
        console.error('Error loading homepage data:', err)
        setError(err.message)
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    loadHomepageData()
  }, [])

  return { data, loading, error }
}

// Hook para cargar categorías
export function useCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const result = await systemService.getCategories()
        setCategories(result.data || result)
      } catch (err) {
        console.error('Error loading categories:', err)
        toast.error('Error loading categories')
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [])

  return { categories, loading }
}

// Hook para cargar ciudades
export function useCities() {
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCities = async () => {
      try {
        const result = await systemService.getCitiesData()
        setCities(result.data || result)
      } catch (err) {
        console.error('Error loading cities:', err)
      } finally {
        setLoading(false)
      }
    }

    loadCities()
  }, [])

  return { cities, loading }
}

// Hook para cargar FAQs
export function useFaqs() {
  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadFaqs = async () => {
      try {
        const result = await systemService.getFaqs()
        setFaqs(result.data || result)
      } catch (err) {
        console.error('Error loading FAQs:', err)
      } finally {
        setLoading(false)
      }
    }

    loadFaqs()
  }, [])

  return { faqs, loading }
}

// Hook para cargar propiedades
export function useProperties(params = {}) {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadProperties = async () => {
      try {
        setLoading(true)
        const { propertyService } = await import('@/api')
        const result = await propertyService.getProperties(params)
        setProperties(result.data || result)
        setError(null)
      } catch (err) {
        console.error('Error loading properties:', err)
        setError(err.message)
        toast.error('Error loading properties')
      } finally {
        setLoading(false)
      }
    }

    loadProperties()
  }, [JSON.stringify(params)]) // JSON.stringify para comparar objetos

  return { properties, loading, error }
}

// Hook para usuario actual
export function useCurrentUser() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { userService } = await import('@/api')
        const result = await userService.getUserInfo()
        setUser(result.data || result)
      } catch (err) {
        // No logged in
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  return { user, loading, isLoggedIn: !!user }
}

// Hook para propiedades favoritas del usuario
export function useUserInterests() {
  const [interests, setInterests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadInterests = async () => {
      try {
        const { userService } = await import('@/api')
        const result = await userService.getUserInterests()
        setInterests(result.data || result)
      } catch (err) {
        console.error('Error loading interests:', err)
      } finally {
        setLoading(false)
      }
    }

    loadInterests()
  }, [])

  return { interests, loading }
}

// Hook para agregar/eliminar de favoritos
export function useFavorite(propertyId) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    try {
      setLoading(true)
      const { interestService } = await import('@/api')
      
      if (isFavorite) {
        await interestService.removeInterest(propertyId)
        toast.success('Removed from favorites')
      } else {
        await interestService.addInterest(propertyId)
        toast.success('Added to favorites')
      }
      
      setIsFavorite(!isFavorite)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { isFavorite, toggle, loading }
}

// Hook para crear cita
export function useCreateAppointment() {
  const [loading, setLoading] = useState(false)

  const createAppointment = async (appointmentData) => {
    try {
      setLoading(true)
      const { appointmentService } = await import('@/api')
      const result = await appointmentService.createAppointment(appointmentData)
      toast.success('Appointment created successfully')
      return result
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating appointment')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { createAppointment, loading }
}

// Hook para crear review
export function useCreateReview() {
  const [loading, setLoading] = useState(false)

  const createReview = async (reviewData) => {
    try {
      setLoading(true)
      const { reviewService } = await import('@/api')
      const result = await reviewService.createReview(reviewData)
      toast.success('Review posted successfully')
      return result
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error posting review')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { createReview, loading }
}

// Hook para login/signup
export function useAuth() {
  const [loading, setLoading] = useState(false)

  const login = async (email, password) => {
    try {
      setLoading(true)
      const { userService } = await import('@/api')
      const result = await userService.login(email, password)
      localStorage.setItem('authToken', result.data.token)
      toast.success('Login successful')
      return result.data
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signup = async (userData) => {
    try {
      setLoading(true)
      const { userService } = await import('@/api')
      const result = await userService.signup(userData)
      localStorage.setItem('authToken', result.data.token)
      toast.success('Account created successfully')
      return result.data
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { login, signup, loading }
}
