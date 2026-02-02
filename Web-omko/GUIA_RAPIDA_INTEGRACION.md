# 🚀 GUÍA RÁPIDA: INTEGRACIÓN DE SERVICIOS - Web-omko

## Actualización: Ahora con Custom Hooks! 🎉

### OPCIÓN A: Usar Custom Hooks (RECOMENDADO) ⭐

Los custom hooks hacen la integración mucho más simple:

```jsx
import { useHomepageData, useProperties, useAuth } from '@/api'

// En HomePage
export default function HomePage() {
  const { data, loading } = useHomepageData()
  
  if (loading) return <Spinner />
  
  return (
    <div>
      {/* Datos ya listos en data.slider, data.featured, etc */}
      <Slider items={data.slider} />
      <FeaturedSection items={data.featured} />
    </div>
  )
}
```

### OPCIÓN B: Usar Servicios Directamente

```jsx
import { systemService } from '@/api'

export default function HomePage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    systemService.getHomepageData()
      .then(data => setData(data))
      .finally(() => setLoading(false))
  }, [])
  
  // ... render
}
```

---

## 📋 Custom Hooks Disponibles

### 1. useHomepageData()
Carga todos los datos de la página principal en una sola llamada
```jsx
const { data, loading, error } = useHomepageData()
// data.slider, data.featured, data.categories, data.mostViewed, etc
```

### 2. useCategories()
```jsx
const { categories, loading } = useCategories()
// categories: Array de categorías
```

### 3. useCities()
```jsx
const { cities, loading } = useCities()
```

### 4. useFaqs()
```jsx
const { faqs, loading } = useFaqs()
```

### 5. useProperties(params)
```jsx
const { properties, loading, error } = useProperties({ limit: 10, page: 1 })
// Con parámetros dinámicos: búsqueda, filtros, paginación
```

### 6. useCurrentUser()
```jsx
const { user, loading, isLoggedIn } = useCurrentUser()
// user: datos del usuario
// isLoggedIn: boolean
```

### 7. useUserInterests()
```jsx
const { interests, loading } = useUserInterests()
// interests: propiedades favoritas del usuario
```

### 8. useFavorite(propertyId)
```jsx
const { isFavorite, toggle, loading } = useFavorite(propertyId)
// isFavorite: boolean
// toggle: función para agregar/eliminar
// loading: estado de la operación

// Uso:
<button onClick={toggle} disabled={loading}>
  {isFavorite ? '❤️ Favorito' : '🤍 Agregar'}
</button>
```

### 9. useCreateAppointment()
```jsx
const { createAppointment, loading } = useCreateAppointment()
// Uso:
const result = await createAppointment(appointmentData)
```

### 10. useCreateReview()
```jsx
const { createReview, loading } = useCreateReview()
// Uso:
const result = await createReview(reviewData)
```

### 11. useAuth()
```jsx
const { login, signup, loading } = useAuth()

// Login:
const user = await login(email, password)

// Signup:
const user = await signup({
  name, email, password, password_confirmation, phone
})
```

---

## 🎯 EJEMPLOS PRÁCTICOS

### Homepage Actualizada
```jsx
'use client'
import { useHomepageData } from '@/api'

export default function HomePage() {
  const { data, loading } = useHomepageData()
  
  if (loading) return <LoadingSpinner />
  
  return (
    <Layout>
      {/* Slider */}
      <HeroSlider items={data?.slider} />
      
      {/* Categories */}
      <HomeCategory categories={data?.categories} />
      
      {/* Featured Properties */}
      <FeaturedProperty properties={data?.featured} />
      
      {/* Most Viewed */}
      <MostViewedProperty properties={data?.mostViewed} />
      
      {/* Most Liked */}
      <MostFavProperty properties={data?.mostLiked} />
      
      {/* Articles */}
      <HomeArticles articles={data?.articles} />
    </Layout>
  )
}
```

### Búsqueda de Propiedades
```jsx
import { useProperties } from '@/api'
import { useState } from 'react'

export default function PropertySearch() {
  const [filters, setFilters] = useState({ limit: 10, page: 1 })
  const { properties, loading } = useProperties(filters)
  
  return (
    <div>
      <FilterForm onFilter={setFilters} />
      <PropertyList properties={properties} loading={loading} />
    </div>
  )
}
```

### Login Modal Actualizado
```jsx
import { useAuth } from '@/api'
import { useRouter } from 'next/router'

export default function LoginModal() {
  const { login, loading } = useAuth()
  const router = useRouter()
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    const email = e.target.email.value
    const password = e.target.password.value
    
    try {
      const user = await login(email, password)
      router.push('/dashboard')
    } catch (err) {
      // Error ya mostrado con toast
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}
```

### Favoritos (Like Button)
```jsx
import { useFavorite } from '@/api'

export default function PropertyCard({ property }) {
  const { isFavorite, toggle, loading } = useFavorite(property.id)
  
  return (
    <div className="property-card">
      <img src={property.image} />
      <h3>{property.title}</h3>
      
      <button 
        onClick={toggle} 
        disabled={loading}
        className={isFavorite ? 'liked' : ''}
      >
        {isFavorite ? '❤️' : '🤍'}
      </button>
    </div>
  )
}
```

### Reviews
```jsx
import { useCreateReview, useCurrentUser } from '@/api'

export default function ReviewForm({ propertyId }) {
  const { createReview, loading } = useCreateReview()
  const { user, isLoggedIn } = useCurrentUser()
  
  if (!isLoggedIn) return <p>Please login to review</p>
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    const rating = e.target.rating.value
    const comment = e.target.comment.value
    
    await createReview({
      property_id: propertyId,
      rating,
      comment
    })
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <select name="rating" required>
        <option value="">Select rating</option>
        {[1,2,3,4,5].map(n => (
          <option key={n} value={n}>{n} Stars</option>
        ))}
      </select>
      <textarea name="comment" required />
      <button disabled={loading}>
        {loading ? 'Posting...' : 'Post Review'}
      </button>
    </form>
  )
}
```

---

## 🔄 MIGRACIÓN PASO A PASO

### Paso 1: Identificar Componentes a Actualizar
- [ ] HomePage/index.jsx
- [ ] AllPropertyUi/* (Property listings)
- [ ] LoginModal/LoginModal.jsx
- [ ] UserProfile/*
- [ ] PropertyDetail/*
- [ ] Agents/*

### Paso 2: Para Cada Componente
1. Reemplazar Redux actions con custom hooks
2. Reemplazar axios calls con servicios
3. Testear que funciona igual
4. Validar que los datos se muestran correctamente

### Paso 3: Testing
- [ ] Cargar página principal
- [ ] Buscar propiedades
- [ ] Login/Signup
- [ ] Agregar favoritos
- [ ] Crear cita
- [ ] Postar review

---

## ⚡ VENTAJAS DE ESTA ARQUITECTURA

✅ **Simple**: Custom hooks hacen código más legible  
✅ **Consistente**: Patrón único para todas las llamadas  
✅ **Mantenible**: Cambios en un solo lugar  
✅ **Testeable**: Fácil de mockear en tests  
✅ **Escalable**: Agregar nuevos hooks es simple  
✅ **Seguro**: Manejo automático de tokens  

---

## 📞 SOPORTE RÁPIDO

**¿Cómo cargo datos simples?**  
→ Usa un custom hook: `const { data, loading } = useHomePageData()`

**¿Cómo envío datos?**  
→ Usa el hook apropiado: `await createReview(reviewData)`

**¿Cómo manejo errores?**  
→ Usa try/catch. Los hooks ya muestran toasts automáticamente

**¿Cómo accedo al usuario actual?**  
→ `const { user, isLoggedIn } = useCurrentUser()`

**¿Cómo agrego a favoritos?**  
→ `const { toggle } = useFavorite(propertyId)`

---

**Estado:** ✅ Listo para usar  
**Fecha:** 28 Enero 2026  
**Última Actualización:** Con custom hooks
