# 🚀 CONFIGURACIÓN FIREBASE PARA PRODUCCIÓN - OMKO Real Estate

## 📋 INFORMACIÓN DEL PROYECTO
- **Proyecto Firebase**: `omko-c9ce7`  
- **Dominio de producción**: `https://realestate.omko.do`
- **Console URL**: https://console.firebase.google.com/project/omko-c9ce7

---

## 🔴 ACCIONES CRÍTICAS REQUERIDAS

### 1️⃣ CONFIGURAR DOMINIOS AUTORIZADOS

**🔗 URL Directa**: https://console.firebase.google.com/project/omko-c9ce7/authentication/settings

#### Pasos:
1. **Acceder a Firebase Console**
2. **Seleccionar proyecto**: `omko-c9ce7`
3. **Ir a**: Authentication → Settings → Authorized domains
4. **Agregar dominio nuevo**:
   ```
   realestate.omko.do
   ```
5. **Verificar dominios existentes**:
   - ✅ `localhost` (desarrollo)
   - ✅ `omko-c9ce7.firebaseapp.com` (Firebase hosting)
   - ✅ `omko-c9ce7.web.app` (Firebase hosting)
   - 🆕 **`realestate.omko.do`** (AGREGAR ESTE)

6. **Guardar cambios**

---

### 2️⃣ OBTENER VAPID KEY PARA NOTIFICACIONES

**🔗 URL Directa**: https://console.firebase.google.com/project/omko-c9ce7/settings/cloudmessaging

#### Pasos:
1. **Ir a**: Project Settings → Cloud Messaging
2. **Web Push certificates**
3. Si no existe key pair:
   - Clic **"Generate key pair"**
4. **Copiar VAPID Key** (empieza con `B...`)
5. **Actualizar archivo local**:
   ```bash
   # Editar firebase-config.js línea 37
   const vapidKey = 'BNxS7c9...'; // ← Pegar VAPID key aquí
   ```

---

### 3️⃣ HABILITAR SERVICIOS FIREBASE (Opcional)

#### Authentication:
- **URL**: https://console.firebase.google.com/project/omko-c9ce7/authentication/providers
- **Habilitar**: Email/Password (si necesitas login)

#### Firestore Database:
- **URL**: https://console.firebase.google.com/project/omko-c9ce7/firestore
- **Crear database** en modo test inicialmente

#### Firebase Analytics:
- **URL**: https://console.firebase.google.com/project/omko-c9ce7/analytics
- **Ya habilitado** ✅

---

## 🧪 TESTING POST-CONFIGURACIÓN

### Verificar configuración:
1. **Abrir**: https://realestate.omko.do
2. **Abrir DevTools** (F12)
3. **Console**: Buscar mensajes de Firebase
4. **Verificar**:
   - ✅ No errores de CORS
   - ✅ No errores de dominios no autorizados
   - ✅ Service Worker registrado

### Test notificaciones:
```javascript
// En Console del navegador:
await requestNotificationPermission();
// Debe retornar token, no error
```

---

## 🚨 ARCHIVOS ACTUALIZADOS

### ✅ Ya configurados:
- `firebase-config.js` - Configuración principal
- `firebase-messaging-sw.js` - Service Worker
- Este archivo de documentación

### ⚠️ Pendiente actualizar:
- Línea 37 en `firebase-config.js` con VAPID key real
- Opcional: Variables de entorno para mayor seguridad

---

## 📞 SOPORTE

Si encuentras errores:
1. **Verificar dominios autorizados**
2. **Revisar VAPID key**
3. **Comprobar CORS en DevTools**
4. **Consultar Firebase Console logs**

**Estado**: ✅ Listo para producción (después de completar pasos 1 y 2)