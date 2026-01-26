# 🔐 CONFIGURACIÓN SEGURIDAD GOOGLE MAPS API - OMKO Real Estate

## 📋 INFORMACIÓN DE LA API KEY
- **API Key**: `AIzaSyCZ-Jq3Sp0xhv2tDlgSzRjgOukyd-Okw-w`
- **Uso actual**: Maps JavaScript API + Places API
- **Dominio**: `https://realestate.omko.do`
- **Estado**: ⚠️ SIN RESTRICCIONES (vulnerable)

---

## 🚨 ACCIÓN CRÍTICA REQUERIDA

### 🔗 **Google Cloud Console**
**URL Directa**: https://console.cloud.google.com/apis/credentials

---

## 📝 **PASOS PARA SECURIZAR**

### **1. ACCEDER A GOOGLE CLOUD CONSOLE**
1. **Ir a**: https://console.cloud.google.com/apis/credentials
2. **Buscar API Key**: `AIzaSyCZ-Jq3Sp0xhv2tDlgSzRjgOukyd-Okw-w`
3. **Clic** en el nombre de la API Key para editarla

### **2. CONFIGURAR RESTRICCIONES DE APLICACIÓN**
En la sección **"Application restrictions"**:

**Seleccionar**: ✅ **HTTP referrers (web sites)**

**Agregar estos referrers**:
```
https://realestate.omko.do/*
https://*.omko.do/*
http://localhost:*/*
https://localhost:*/*
```

**Explicación**:
- `https://realestate.omko.do/*` - Dominio de producción
- `https://*.omko.do/*` - Subdominios de OMKO
- `http://localhost:*/*` - Desarrollo local
- `https://localhost:*/*` - Desarrollo local HTTPS

### **3. CONFIGURAR RESTRICCIONES DE API**
En la sección **"API restrictions"**:

**Seleccionar**: ✅ **Restrict key**

**APIs permitidas**:
- ✅ **Maps JavaScript API**
- ✅ **Places API** 
- ✅ **Geocoding API** (recomendado para direcciones)

### **4. GUARDAR CONFIGURACIÓN**
- **Clic** en **"Save"**
- **Esperar** 2-5 minutos para que se propaguen los cambios

---

## 🧪 **TESTING POST-CONFIGURACIÓN**

### **Verificar funcionamiento:**
1. **Abrir**: https://realestate.omko.do
2. **Ir a**: "Properties on Map" o cualquier página con mapas
3. **Verificar**:
   - ✅ Mapas se cargan correctamente
   - ✅ No errores en DevTools Console
   - ✅ Búsqueda de ubicaciones funciona

### **Verificar seguridad:**
```bash
# Test desde dominio no autorizado (debe fallar)
curl "https://maps.googleapis.com/maps/api/js?key=AIzaSyCZ-Jq3Sp0xhv2tDlgSzRjgOukyd-Okw-w"
# Desde otro dominio debe mostrar error de CORS
```

---

## ⚡ **CONFIGURACIÓN OPCIONAL AVANZADA**

### **Quotas y Límites:**
- **Daily limit**: 25,000 requests/day (gratis)
- **Per user rate limit**: 100 requests/100 seconds/user
- **Monitoring**: Habilitar alertas en Google Cloud

### **Backup API Key:**
1. **Crear API Key secundaria** para desarrollo
2. **Restricciones separadas** para localhost únicamente
3. **Usar variables de entorno** para alternar entre keys

---

## 🔍 **MONITOREO Y ALERTAS**

### **Configurar alertas:**
1. **Google Cloud Console** → **APIs & Services** → **Quotas**
2. **Crear alertas** para uso excesivo
3. **Notification channels** por email

### **Logs de acceso:**
- **Cloud Logging** para ver requests
- **Error reporting** para problemas de API
- **Usage statistics** para optimización de costos

---

## 🚨 **SOLUCIÓN DE PROBLEMAS COMUNES**

### **Error: "This API key is not authorized"**
- ✅ Verificar referrers en Cloud Console
- ✅ Esperar 5 minutos después de cambios
- ✅ Limpiar cache del navegador

### **Error: "API key does not have sufficient permissions"**
- ✅ Verificar APIs habilitadas
- ✅ Confirmar restricciones de API
- ✅ Revisar billing account activo

### **Maps no cargan en producción:**
- ✅ Confirmar HTTPS en referrers
- ✅ Verificar dominio exacto
- ✅ Revisar wildcards en subdominios

---

## 📊 **RESUMEN DE CONFIGURACIÓN**

### ✅ **Configuración recomendada:**
```
Application restrictions: HTTP referrers
- https://realestate.omko.do/*
- https://*.omko.do/*
- http://localhost:*/*

API restrictions: Restrict key
- Maps JavaScript API
- Places API
- Geocoding API
```

### 🎯 **Resultado esperado:**
- ✅ API Key protegida contra uso no autorizado
- ✅ Funcionalidad completa en realestate.omko.do
- ✅ Desarrollo local sin restricciones
- ✅ Monitoreo y alertas configuradas

**TIEMPO ESTIMADO**: 5-10 minutos  
**VERIFICACIÓN**: Inmediata en https://realestate.omko.do