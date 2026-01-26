# 🔥 GUÍA COMPLETA - CONFIGURACIÓN FIREBASE

## 📋 PASO A PASO

### 1️⃣ ACCEDER AL PROYECTO
1. **Ir a Firebase Console:** https://console.firebase.google.com/
2. **Seleccionar proyecto** OMKO Real Estate (o crearlo si no existe)
3. Si no tienes proyecto, **crear nuevo proyecto:**
   - Nombre: `omko-real-estate`
   - Habilitar Google Analytics (recomendado)

### 2️⃣ CONFIGURAR APLICACIÓN WEB
1. En el **dashboard del proyecto**, clic en ⚙️ **"Configuración del proyecto"**
2. Scroll down hasta **"Tus apps"**
3. Si no hay app web, clic **"Agregar app" → "Web" (</> icono)**
4. **Configurar app:**
   - Nombre: `OMKO Real Estate Web`
   - ✅ Marcar: "También configura Firebase Hosting"
   - Dominio: `realestate.omko.do`

### 3️⃣ OBTENER CONFIGURACIÓN
Después de crear la app, obtienes algo como esto:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC_ejemplo_de_api_key_real",
  authDomain: "omko-real-estate.firebaseapp.com",
  projectId: "omko-real-estate",
  storageBucket: "omko-real-estate.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456ghi789",
  measurementId: "G-XXXXXXXXXX"
};
```

### 4️⃣ CONFIGURAR DOMINIOS AUTORIZADOS
1. **Authentication** → **Settings** → **Authorized domains**
2. **Agregar dominio:** `realestate.omko.do`
3. **Mantener:** `localhost` (para desarrollo local)

### 5️⃣ CONFIGURAR CLOUD MESSAGING
1. **Cloud Messaging** → **Settings**
2. **Web configuration** → **Add domain**
3. **Agregar:** `https://realestate.omko.do`
4. **Generar key pair** si no existe

### 6️⃣ HABILITAR SERVICIOS NECESARIOS
✅ **Authentication** - Para login de usuarios
✅ **Cloud Messaging** - Para notificaciones push  
✅ **Firestore** - Para base de datos (si se usa)
✅ **Storage** - Para imágenes (si se usa)
✅ **Analytics** - Para métricas

---

## 🔧 APLICAR CONFIGURACIÓN AL CÓDIGO

Una vez que tengas la configuración real de Firebase, sigue estos pasos:

### OPCIÓN A: Editar manualmente
1. Abrir: `firebase-messaging-sw.js`
2. Reemplazar las "x" con los valores reales
3. Guardar archivo

### OPCIÓN B: Usar comando automático
Si me proporcionas la configuración real, puedo actualizar el archivo automáticamente.

---

## 🧪 VERIFICAR CONFIGURACIÓN

### Test Local (antes de deploy):
```bash
# 1. Servir archivos localmente
npx serve . -l 3000

# 2. Verificar en navegador:
# - Console sin errores de Firebase
# - Service Worker se instala correctamente
# - Notificaciones funcionan (si están implementadas)
```

### Test Producción (después de deploy):
1. **Abrir:** https://realestate.omko.do
2. **Console del navegador:** Sin errores de Firebase
3. **Application tab:** Service Worker activo
4. **Test notificaciones:** Si están implementadas

---

## 🛡️ CONFIGURACIONES DE SEGURIDAD

### Reglas de Firestore (si se usa):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Solo usuarios autenticados pueden leer/escribir
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Reglas de Storage (si se usa):
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true; // Imágenes públicas
      allow write: if request.auth != null; // Solo usuarios autenticados
    }
  }
}
```

---

## 🚨 TROUBLESHOOTING

### Error: "Firebase is not defined"
- ✅ Verificar que los scripts se cargan correctamente
- ✅ Revisar configuración del service worker

### Error: "Auth domain not authorized"
- ✅ Agregar dominio en Authentication → Settings
- ✅ Verificar que el dominio es exacto (con/sin www)

### Notificaciones no funcionan:
- ✅ Verificar permisos del navegador
- ✅ Revisar configuración de Cloud Messaging
- ✅ Verificar que el service worker está activo

---

## 📞 SIGUIENTE PASO

**¿Tienes ya un proyecto Firebase creado?**
- ✅ SÍ → Proporciona la configuración para actualizar el código
- ❌ NO → Crea el proyecto siguiendo los pasos de arriba

**Una vez configurado, te ayudo a:**
1. Actualizar el código con la configuración real
2. Verificar que todo funciona correctamente  
3. Realizar testing completo