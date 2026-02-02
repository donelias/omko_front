# 🚀 GUÍA RÁPIDA DE TESTING - INTEGRACIÓN DE SERVICIOS

**28 de Enero 2026**

---

## 🏁 Quick Start

### 1. Iniciar Servidor
```bash
cd /Users/mac/Documents/Omko/omko/En\ produccion/Web-omko
npm run dev
```

### 2. Abrir en Browser
```
http://localhost:3000
```

### 3. Abrir DevTools
```
Cmd + Option + I
```

---

## 🎯 Pruebas Rápidas (5 minutos)

### Test 1: Búsqueda de Propiedades
```
1. Click en "Propiedades" en navbar
2. Esperar carga de lista
3. Ver: Deberían aparecer 9 propiedades
4. Validar: Network tab → GET /api/get_property (Status 200)
```

### Test 2: Filtrar Propiedades
```
1. En página de propiedades
2. Seleccionar una categoría (ej: Departamento)
3. Click "Aplicar Filtro"
4. Esperar carga
5. Ver: Propiedades filtradas
6. Validar: Network → parámetro category_id en query
```

### Test 3: Ver Detalles
```
1. Click en una propiedad
2. Esperar carga de detalles
3. Ver: Foto, descripción, precio, ubicación
4. Validar: No hay errores en Console
5. Validar: Network → GET /api/property/{slug} (Status 200)
```

### Test 4: Login
```
1. Click en botón "Login"
2. Ingresar teléfono: +1 555 123 4567
3. Click "Enviar OTP"
4. En demo: Ver campo de OTP
5. Ingresar: 123456
6. Click "Verificar"
7. Validar: Toast de bienvenida o redirect a registro
```

### Test 5: Perfil
```
1. Después de loguear, ir a /user/profile
2. Ver: Datos del usuario cargados
3. Cambiar nombre
4. Click "Guardar"
5. Validar: Toast "Perfil actualizado"
6. Validar: Redirect a home o permanece en perfil
```

---

## 🔍 DevTools Essentials

### 1. Inspeccionar Network Requests
```
1. Abrir Chrome DevTools → Network tab
2. Filtrar por "XHR" (XMLHttpRequest)
3. Hacer una acción (búsqueda, login, etc.)
4. Ver requests en la lista
5. Click en request → Headers → Query String Parameters

Esperado:
✅ Status: 200 o 201
✅ Response: {data: {...}, success: true}
✅ Sin errores 4xx/5xx
```

### 2. Verificar Errores en Console
```
1. DevTools → Console tab
2. Buscar mensajes rojo (errors) o amarillo (warnings)
3. Cada error debe investigarse

Aceptable:
⚠️ Algunos warnings de librerías (ej: deprecation)

NO Aceptable:
❌ Error: Cannot read property
❌ TypeError: ... is not a function
❌ API Error: Network request failed
```

### 3. Inspeccionar Datos del Usuario
```
1. DevTools → Application tab
2. LocalStorage → Buscar 'auth' o 'user'
3. Verificar que datos estén correctos

O en Console:
localStorage.getItem('yourKey')
```

### 4. Simular Conexión Lenta
```
1. DevTools → Network tab
2. Click en dropdown "No throttling"
3. Seleccionar "Slow 3G" o "Fast 3G"
4. Hacer búsqueda
5. Ver cómo se comportan skeletons y loading states

Esperado:
✅ Skeletons aparecen mientras carga
✅ UI no está congelada
✅ Toast notifications aparecen
```

---

## 🧪 Testing por Componente

### AllProperties (Búsqueda)
```
URL: http://localhost:3000/properties

Casos rápidos:
1. ✅ Carga inicial → 9 propiedades
2. ✅ Filtro categoría → Filtra correctamente
3. ✅ Filtro precio → Funciona rango
4. ✅ Load More → Agrega más propiedades
5. ✅ Grid/List → Cambia layout
6. ✅ Limpiar → Resetea filtros

Validar:
- Network: request a GET /api/get_property
- Response: array de propiedades
- Console: sin errores
```

### PropertyDetails (Detalles)
```
URL: http://localhost:3000/properties-details/[slug]

Casos rápidos:
1. ✅ Carga detalles
2. ✅ Galería de imágenes
3. ✅ Google Maps carga
4. ✅ Info de propietario
5. ✅ Propiedades similares
6. ✅ Sin errores

Validar:
- Network: GET /api/property/{slug_id}
- Response: objeto con detalles completos
- Console: sin errores de Maps
```

### LoginModal (Autenticación)
```
Botón: Click en "Login" en navbar

Casos rápidos:
1. ✅ Modal abre
2. ✅ Validación de teléfono
3. ✅ OTP se envía (demo: aparece campo)
4. ✅ Ingreso de OTP (demo: 123456)
5. ✅ Redirect/Toast de éxito
6. ✅ Datos en localStorage

Validar:
- Network: POST /api/user_signup (o similar)
- Response: userData con token
- LocalStorage: usuario guardado
```

### UserProfile (Perfil)
```
URL: http://localhost:3000/user/profile

Casos rápidos:
1. ✅ Datos cargan
2. ✅ Cambiar nombre
3. ✅ Guardar → Toast
4. ✅ Foto se sube
5. ✅ Ubicación se actualiza
6. ✅ Notificaciones toggle

Validar:
- Network: PUT/POST /api/update_profile
- Response: updated user data
- localStorage: datos actualizados
```

---

## 🎬 Screencast / Video Test

### Recording Checklist
Si necesitas grabar un video de testing:

1. **Abrir Screen Recording**
   ```bash
   Cmd + Shift + 5 (en Mac)
   ```

2. **Grabar Secuencia**
   - Búsqueda de propiedades (2 min)
   - Login/Signup (2 min)
   - Perfil (1 min)
   - Detalles de propiedad (1 min)

3. **Guardar y Compartir**
   - Video se guarda en Desktop
   - Nombrar: `testing-integracion-28enero.mov`
   - Subir a Drive/Slack

---

## 📊 Resultado Esperado

### Para Pasar Testing

✅ **AllProperties**
- Carga propiedades sin error
- Filtros funcionan
- Load More funciona
- Navegación fluida

✅ **PropertyDetails**
- Detalles cargan correctamente
- Todas las secciones visibles
- Mapas funcionan
- Sin errores de imagen

✅ **LoginModal**
- OTP se envía/recibe
- Usuario se loguea
- Datos se guardan
- Redirect funciona

✅ **UserProfile**
- Datos cargan
- Actualización funciona
- Foto se sube
- Toast feedback claro

✅ **General**
- Console sin errores críticos
- Network requests exitosos (200/201)
- Toast notifications claras
- Performance < 3 segundos por página

---

## 🚨 Red Flags (Problemas Graves)

❌ **Error:** "Cannot read property 'getProperties' of undefined"
- Solución: Verificar import de `propertyService`

❌ **Error:** "Network Error: 404 Not Found"
- Solución: Verificar que endpoint existe en backend

❌ **Error:** "CORS Error"
- Solución: Revisar configuración de servidor backend

❌ **Comportamiento:** Página se congela mientras carga
- Solución: Verificar que skeletons aparecen

❌ **Comportamiento:** Datos no se guardan
- Solución: Revisar Network tab → POST/PUT status code

---

## 💡 Tips Útiles

### 1. Buscar en Console
```javascript
// En Console de DevTools, escribir:
document.title
// Deberá ser: "OMKO Real Estate"

// Ver estado de Redux (si accesible):
window.__REDUX_DEVTOOLS_EXTENSION__?.()
```

### 2. Simular Errores de Network
```
1. DevTools → Network tab
2. Offline checkbox
3. Intentar búsqueda
4. Ver cómo maneja error

Esperado: Toast error + mensajes en Console
```

### 3. Inspeccionar API Responses
```
1. Network tab
2. Click en request
3. Click en "Response" tab
4. Ver JSON completo
5. Verificar estructura esperada
```

### 4. Validar Tokens/Auth
```
En Console:
localStorage.getItem('token')
localStorage.getItem('user')

Deberían retornar valores válidos tras login
```

---

## 📋 Checklist Pre-Deploy

- [ ] Todos los tests de AllProperties pasados
- [ ] Todos los tests de PropertyDetails pasados
- [ ] Todos los tests de LoginModal pasados
- [ ] Todos los tests de UserProfile pasados
- [ ] Console sin errores críticos
- [ ] Network requests exitosas (200/201)
- [ ] Performance aceptable
- [ ] Mobile responsive (probado en DevTools)
- [ ] Datos persisten al recargar
- [ ] Logout funciona correctamente

---

## 🎯 Objetivo Final

**Cuando todos estos pasos funcionen correctamente, significa que la integración fue exitosa:**

1. ✅ Propiedades se cargan sin Redux Actions
2. ✅ Búsqueda y filtros funcionan con servicios
3. ✅ Login/Signup usan nuevos servicios
4. ✅ Perfil se actualiza con servicios
5. ✅ Todo sigue siendo funcional
6. ✅ Código es más limpio y moderno
7. ✅ Performance es igual o mejor

---

## 📞 Support

Si encuentras problemas durante testing:

1. **Revisar Console** - Ver qué error específico dice
2. **Revisar Network** - Ver qué endpoint falla
3. **Revisar Documentación** - `INTEGRACION_SERVICIOS_COMPLETADA.md`
4. **Revisar Cambios** - Ver qué se modificó exactamente

---

**Status:** 🟢 LISTO PARA TESTING  
**Próximo Paso:** Ejecutar Plan de Testing  
**Estimado:** 30-45 minutos para todos los tests

---

*Última actualización: 28 Enero 2026*
