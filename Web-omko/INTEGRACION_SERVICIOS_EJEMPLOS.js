// EJEMPLO DE INTEGRACIÓN DE SERVICIOS EN COMPONENTES
// Patrones y mejores prácticas

// ============================================
// 1. SIMPLE: Cargar datos en useEffect
// ============================================

import { useState, useEffect } from 'react'
import { propertyService } from '@/api'
import toast from 'react-hot-toast'

export default function PropertyList() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const result = await propertyService.getProperties({ limit: 10, page: 1 })
        setProperties(result.data || result)
        setLoading(false)
      } catch (err) {
        setError(err.message)
        toast.error('Error loading properties')
        setLoading(false)
      }
    }

    loadProperties()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      {properties.map(prop => (
        <div key={prop.id}>{prop.title}</div>
      ))}
    </div>
  )
}

// ============================================
// 2. CON REDUX: Guardar datos en store
// ============================================

import { useDispatch, useSelector } from 'react-redux'
import { propertyService } from '@/api'

export default function PropertyListWithRedux() {
  const dispatch = useDispatch()
  const properties = useSelector(state => state.property.list)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const result = await propertyService.getProperties()
        dispatch({ type: 'PROPERTY_SET_LIST', payload: result.data })
      } catch (err) {
        toast.error('Error loading')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [dispatch])

  return (
    <div>
      {properties?.map(prop => (
        <PropertyCard key={prop.id} property={prop} />
      ))}
    </div>
  )
}

// ============================================
// 3. AUTENTICACIÓN: Usar userService
// ============================================

import { userService } from '@/api'
import { useRouter } from 'next/router'

export default function LoginComponent() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogin = async (email, password) => {
    try {
      setLoading(true)
      const result = await userService.login(email, password)
      
      if (result.data) {
        // Guardar token
        localStorage.setItem('authToken', result.data.token)
        
        // Guardar usuario en Redux o context
        dispatch({ type: 'USER_LOGIN', payload: result.data.user })
        
        toast.success('Login successful')
        router.push('/dashboard')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      const email = e.target.email.value
      const password = e.target.password.value
      handleLogin(email, password)
    }}>
      <input type="email" name="email" required />
      <input type="password" name="password" required />
      <button type="submit" disabled={loading}>
        {loading ? 'Loading...' : 'Login'}
      </button>
    </form>
  )
}

// ============================================
// 4. CON PARÁMETROS: Filtros y búsqueda
// ============================================

export default function SearchProperties() {
  const [properties, setProperties] = useState([])
  const [filters, setFilters] = useState({ limit: 10, page: 1 })

  useEffect(() => {
    const loadWithFilters = async () => {
      try {
        const result = await propertyService.getProperties(filters)
        setProperties(result.data)
      } catch (err) {
        toast.error('Error searching')
      }
    }

    loadWithFilters()
  }, [filters])

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters })
  }

  return (
    <div>
      <FilterComponent onFilter={handleFilterChange} />
      <PropertyGrid properties={properties} />
    </div>
  )
}

// ============================================
// 5. CREAR/ACTUALIZAR: POST/PUT requests
// ============================================

export default function CreateProperty() {
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()

  const handleSubmit = async (formData) => {
    try {
      setLoading(true)
      const result = await propertyService.createProperty(formData)
      
      toast.success('Property created')
      
      // Actualizar lista en Redux
      dispatch({ type: 'PROPERTY_ADD', payload: result.data })
      
      return result.data
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating property')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={async (e) => {
      e.preventDefault()
      const data = new FormData(e.target)
      await handleSubmit(Object.fromEntries(data))
    }}>
      {/* Form fields */}
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create'}
      </button>
    </form>
  )
}

// ============================================
// 6. MANEJO DE ERRORES ESTÁNDAR
// ============================================

const handleApiCall = async (serviceMethod, ...args) => {
  try {
    const result = await serviceMethod(...args)
    return { success: true, data: result }
  } catch (error) {
    const errorMessage = 
      error.response?.data?.message ||
      error.message ||
      'An error occurred'
    
    toast.error(errorMessage)
    return { success: false, error: errorMessage }
  }
}

// Uso:
const { success, data } = await handleApiCall(
  propertyService.getProperties,
  { limit: 10 }
)

// ============================================
// CHECKLIST PARA INTEGRACIÓN
// ============================================

/*
Cuando integres servicios en un componente:

[ ] 1. Importar el servicio correcto
   import { propertyService } from '@/api'

[ ] 2. Usar useState para datos y loading
   const [data, setData] = useState([])
   const [loading, setLoading] = useState(true)

[ ] 3. Usar useEffect para cargar datos
   useEffect(() => { ... }, [deps])

[ ] 4. Envolver en try/catch
   try { } catch (err) { }

[ ] 5. Mostrar feedback al usuario
   toast.success() o toast.error()

[ ] 6. Manejar estado de carga
   {loading ? <Spinner /> : <Content />}

[ ] 7. Mantener datos en Redux si es global
   dispatch({ type: '...', payload: data })

[ ] 8. Validar respuestas del API
   if (result.data) { } if (result.error) { }

[ ] 9. Documentar parámetros usados
   // Cargar propiedades con paginación

[ ] 10. Testear casos de error
    // ¿Qué pasa si la API falla?
    // ¿Qué pasa sin conexión?
*/
