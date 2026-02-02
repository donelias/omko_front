# 🧪 PLAN DE TESTING - INTEGRACIÓN DE SERVICIOS API

**Fecha:** 28 de Enero 2026  
**Componentes:** 5 refactorizados  
**Objetivo:** Validar funcionalidad completa post-integración  

---

## 📋 Setup Inicial

### 1. Preparar Ambiente
```bash
# Navegar a directorio
cd /Users/mac/Documents/Omko/omko/En\ produccion/Web-omko

# Instalar dependencias (si es necesario)
npm install

# Iniciar servidor dev
npm run dev

# Servidor debe estar en: http://localhost:3000
```

### 2. Abrir DevTools
- Abrir Chrome DevTools (`Cmd+Option+I`)
- Ir a pestaña **Network**
- Ir a pestaña **Console**
- Ir a pestaña **Application** → Storage

---

## 🧪 TEST 1: AllProperties.jsx (Búsqueda y Filtros)

### Caso 1.1: Carga Inicial
**Pasos:**
1. Navegar a `/properties`
2. Esperar a que cargue la lista
3. Verificar que aparecen propiedades

**Esperado:**
- ✅ Se cargan 9 propiedades iniciales
- ✅ Sin errores en console
- ✅ Request a `GET /api/get_property` exitoso (Status 200)
- ✅ Skeletons desaparecen cuando carga

**Actual:** 
- [ ] Verificado

---

### Caso 1.2: Filtro por Categoría
**Pasos:**
1. Hacer click en dropdown de categorías
2. Seleccionar una categoría (ej: "Departamentos")
3. Click en "Aplicar Filtro"
4. Esperar carga

**Esperado:**
- ✅ Se filtran propiedades por categoría
- ✅ El número total cambia
- ✅ Request con `category_id` en params
- ✅ No hay errores en console

**Actual:**
- [ ] Verificado

---

### Caso 1.3: Filtro por Precio
**Pasos:**
1. Ingresar precio mínimo: 100000
2. Ingresar precio máximo: 500000
3. Click en "Aplicar Filtro"

**Esperado:**
- ✅ Se filtran propiedades dentro del rango
- ✅ Request con `min_price` y `max_price`
- ✅ Solo propiedades en rango aparecen

**Actual:**
- [ ] Verificado

---

### Caso 1.4: Filtro por Ubicación
**Pasos:**
1. Click en campo de ubicación
2. Buscar una ciudad (ej: "Santiago")
3. Seleccionar en dropdown
4. Click en "Aplicar Filtro"

**Esperado:**
- ✅ Se cargan propiedades de esa ciudad
- ✅ Request con `city`, `state`, `country`
- ✅ Lista se actualiza

**Actual:**
- [ ] Verificado

---

### Caso 1.5: Filtro Combinado
**Pasos:**
1. Seleccionar categoría + precio + ubicación
2. Click en "Aplicar Filtro"

**Esperado:**
- ✅ Todos los filtros se aplican simultáneamente
- ✅ Request contiene todos los parámetros
- ✅ Resultados son correctos

**Actual:**
- [ ] Verificado

---

### Caso 1.6: Limpiar Filtros
**Pasos:**
1. Aplicar algunos filtros
2. Click en "Limpiar Filtros"

**Esperado:**
- ✅ Todos los filtros se resetean
- ✅ Vuelve a mostrar todas las propiedades
- ✅ Request sin parámetros de filtro

**Actual:**
- [ ] Verificado

---

### Caso 1.7: Load More (Paginación)
**Pasos:**
1. Scroll down hasta el botón "Load More"
2. Click en "Load More"
3. Esperar carga

**Esperado:**
- ✅ Se cargan 9 propiedades más
- ✅ Las propiedades anteriores permanecen (append, no replace)
- ✅ Request con offset actualizado
- ✅ Total de propiedades aumenta

**Actual:**
- [ ] Verificado

---

### Caso 1.8: Vista Grid vs Lista
**Pasos:**
1. Click en botón de vista (Grid/List)
2. Cambiar entre vistas

**Esperado:**
- ✅ Layout cambia entre grid y lista
- ✅ Propiedades permanecen las mismas
- ✅ No hay errores

**Actual:**
- [ ] Verificado

---

## 🧪 TEST 2: PropertyDetails.jsx (Detalles de Propiedad)

### Caso 2.1: Cargar Detalles
**Pasos:**
1. Ir a `/properties`
2. Click en una propiedad
3. Esperar carga de detalles

**Esperado:**
- ✅ Se carga página de detalles
- ✅ Se muestra info completa: precio, descripción, ubicación
- ✅ Se cargan propiedades similares
- ✅ No hay errores en console
- ✅ Request a `GET /api/property/{slug_id}`

**Actual:**
- [ ] Verificado

---

### Caso 2.2: Galería de Imágenes
**Pasos:**
1. En detalles, revisar galería de imágenes
2. Click en thumbnail para cambiar imagen principal
3. Si hay, click en lightbox

**Esperado:**
- ✅ Imagen principal cambia al hacer click
- ✅ Lightbox funciona
- ✅ Navegación con flechas
- ✅ No hay errores de carga de imagen

**Actual:**
- [ ] Verificado

---

### Caso 2.3: Información de Ubicación
**Pasos:**
1. En detalles, scroll hasta mapa
2. Verificar que Google Maps carga
3. Ubicación marcada correctamente

**Esperado:**
- ✅ Mapa de Google aparece
- ✅ Pin está en ubicación correcta
- ✅ Se puede hacer zoom
- ✅ No hay errores del API de Maps

**Actual:**
- [ ] Verificado

---

### Caso 2.4: Datos del Propietario/Agente
**Pasos:**
1. Scroll hasta sección de contacto
2. Revisar información del propietario
3. Click en botón de contacto

**Esperado:**
- ✅ Se muestra foto, nombre, teléfono
- ✅ Enlace de chat funciona
- ✅ Para premium users, aparece opción diferente

**Actual:**
- [ ] Verificado

---

### Caso 2.5: Propiedades Similares
**Pasos:**
1. Scroll hasta "Propiedades Similares"
2. Verificar lista de propiedades similares
3. Click en una para navegar

**Esperado:**
- ✅ Se cargan propiedades relacionadas
- ✅ Click navega a nueva propiedad
- ✅ URL cambia correctamente

**Actual:**
- [ ] Verificado

---

## 🧪 TEST 3: LoginModal.jsx (Autenticación)

### Caso 3.1: Ingreso de Teléfono Válido
**Pasos:**
1. Click en botón Login
2. Modal aparece
3. Ingresar número válido (ej: +1 555 123 4567)

**Esperado:**
- ✅ Número se formatea automáticamente
- ✅ Sin error de validación
- ✅ Botón "Enviar OTP" se habilita

**Actual:**
- [ ] Verificado

---

### Caso 3.2: Validación de Teléfono
**Pasos:**
1. Ingresar número inválido (ej: "abc123")
2. Click en "Enviar OTP"

**Esperado:**
- ✅ Toast error: "Número telefónico inválido"
- ✅ No se envía request al backend
- ✅ Modal no se cierra

**Actual:**
- [ ] Verificado

---

### Caso 3.3: Solicitud de OTP (Firebase)
**Pasos:**
1. Ingresar número válido
2. Click en "Enviar OTP"
3. Esperar respuesta

**Esperado:**
- ✅ Toast: "OTP enviado exitosamente"
- ✅ Modal cambia a pantalla de OTP
- ✅ Se muestra campo para ingresar 6 dígitos
- ✅ Countdown de 120 segundos aparece

**Actual:**
- [ ] Verificado

---

### Caso 3.4: Ingreso de OTP
**Pasos:**
1. En demo mode: Ingresar "123456"
2. O esperar SMS real con OTP
3. Click en "Verificar OTP"

**Esperado:**
- ✅ OTP se valida
- ✅ Si datos completos: Login exitoso
- ✅ Si datos incompletos: Redirect a registro
- ✅ Toast: "Bienvenido [nombre]" o redirect

**Actual:**
- [ ] Verificado

---

### Caso 3.5: OTP Inválido
**Pasos:**
1. Ingresar OTP incorrecto (ej: "000000")
2. Click en "Verificar OTP"

**Esperado:**
- ✅ Toast error: "OTP inválido"
- ✅ Modal permanece abierto
- ✅ Permite reintentar

**Actual:**
- [ ] Verificado

---

### Caso 3.6: Resend OTP
**Pasos:**
1. Obtener OTP inicial
2. Esperar que se reduzca contador
3. Click en "Enviar de nuevo"

**Esperado:**
- ✅ Nuevo OTP se envía
- ✅ Contador reinicia en 120
- ✅ Toast: "OTP reenviado"

**Actual:**
- [ ] Verificado

---

### Caso 3.7: Login con Google
**Pasos:**
1. Click en botón "Google Sign In"
2. Seleccionar cuenta Google
3. Autorizar

**Esperado:**
- ✅ Google popup abre
- ✅ Tras autorizar, usuario se registra/loguea
- ✅ Redirect a home o perfil
- ✅ Datos guardados en Redux

**Actual:**
- [ ] Verificado

---

## 🧪 TEST 4: UserProfile.jsx (Perfil de Usuario)

### Caso 4.1: Cargar Perfil
**Pasos:**
1. Loguear usuario
2. Ir a `/user/profile`
3. Esperar carga

**Esperado:**
- ✅ Se cargan datos del usuario actual
- ✅ Todos los campos muestran datos correctos
- ✅ Foto de perfil visible

**Actual:**
- [ ] Verificado

---

### Caso 4.2: Actualizar Nombre
**Pasos:**
1. En perfil, cambiar campo "Nombre Completo"
2. Ingresar nuevo nombre
3. Click en "Guardar"

**Esperado:**
- ✅ Toast: "Perfil actualizado"
- ✅ Datos se guardan en backend
- ✅ Redirect a home

**Actual:**
- [ ] Verificado

---

### Caso 4.3: Actualizar Email
**Pasos:**
1. Cambiar email
2. Ingresar nuevo email válido
3. Click en "Guardar"

**Esperado:**
- ✅ Email se actualiza
- ✅ Validación de formato email
- ✅ Toast de éxito

**Actual:**
- [ ] Verificado

---

### Caso 4.4: Actualizar Teléfono
**Pasos:**
1. Cambiar teléfono
2. Ingresar nuevo teléfono válido
3. Click en "Guardar"

**Esperado:**
- ✅ Teléfono se actualiza
- ✅ Formato válido requerido
- ✅ Toast de éxito

**Actual:**
- [ ] Verificado

---

### Caso 4.5: Upload de Foto
**Pasos:**
1. Click en "Cambiar Foto"
2. Seleccionar archivo JPG/PNG
3. Foto previsualizarse
4. Click en "Guardar"

**Esperado:**
- ✅ Foto se sube
- ✅ Preview actualiza inmediatamente
- ✅ Toast: "Foto actualizada"
- ✅ Foto persiste al recargar

**Actual:**
- [ ] Verificado

---

### Caso 4.6: Actualizar Ubicación
**Pasos:**
1. Click en campo de ubicación
2. Buscar y seleccionar ciudad
3. Click en "Guardar"

**Esperado:**
- ✅ Ubicación se actualiza
- ✅ Lat/Long se guardan
- ✅ Toast de éxito

**Actual:**
- [ ] Verificado

---

### Caso 4.7: Actualizar Redes Sociales
**Pasos:**
1. Ingresar IDs de redes sociales
2. Facebook, Instagram, YouTube, Twitter
3. Click en "Guardar"

**Esperado:**
- ✅ Redes se guardan
- ✅ Sin validación estricta requerida
- ✅ Toast de éxito

**Actual:**
- [ ] Verificado

---

### Caso 4.8: Toggle Notificaciones
**Pasos:**
1. Hacer toggle de notificaciones ON/OFF
2. Click en "Guardar"

**Esperado:**
- ✅ Estado se guarda
- ✅ Si ON: Pide permiso de notificaciones
- ✅ Toast de éxito

**Actual:**
- [ ] Verificado

---

### Caso 4.9: Validación Demo Mode
**Pasos:**
1. Si está en demo mode, intentar guardar
2. Click en "Guardar"

**Esperado:**
- ✅ Swal alert: "No permitido en modo demo"
- ✅ Datos no se guardan
- ✅ Modal no se cierra

**Actual:**
- [ ] Verificado

---

## 🧪 TEST 5: Flujos End-to-End

### Caso 5.1: Flujo Completo de Usuario Nuevo
**Pasos:**
1. Click en Login
2. Ingresar teléfono
3. Recibir OTP
4. Verificar OTP
5. Completar registro (si necesario)
6. Ir a perfil y completar datos
7. Buscar propiedades
8. Ver detalles
9. Logout

**Esperado:**
- ✅ Todo funciona sin errores
- ✅ Datos persisten
- ✅ Navegación es fluida

**Actual:**
- [ ] Verificado

---

### Caso 5.2: Búsqueda a Detalles
**Pasos:**
1. Ir a búsqueda de propiedades
2. Aplicar filtros
3. Ver resultados
4. Click en propiedad
5. Ver detalles completos
6. Ver propiedades similares
7. Volver a búsqueda

**Esperado:**
- ✅ Navegación sin errores
- ✅ Datos se cargan correctamente
- ✅ URL se actualiza

**Actual:**
- [ ] Verificado

---

## 📊 Resumen de Testing

### Checklist Final
- [ ] 8 casos de AllProperties pasados
- [ ] 5 casos de PropertyDetails pasados
- [ ] 7 casos de LoginModal pasados
- [ ] 9 casos de UserProfile pasados
- [ ] 2 flujos E2E pasados
- [ ] **Total: 31 casos testeados**

### Validación General
- [ ] Console limpia (sin errores)
- [ ] Network requests exitosas (Status 200/201)
- [ ] Toast notifications funcionan
- [ ] Loading states (skeletons) funcionan
- [ ] Responsive en móvil/tablet/desktop
- [ ] Performance aceptable (<3s load time)

---

## 🐛 Problemas Identificados

(Completar durante testing)

| Componente | Problema | Severidad | Status |
|-----------|----------|-----------|--------|
| - | - | - | - |

---

## ✅ Aprobación

- [ ] Desarrollador: _____________ Fecha: _______
- [ ] QA: _____________ Fecha: _______
- [ ] Lead: _____________ Fecha: _______

---

**Última actualización:** 28 Enero 2026  
**Responsable:** Sistema de Testing
