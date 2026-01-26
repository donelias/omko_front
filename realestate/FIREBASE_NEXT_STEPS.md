# 🔥 CONFIGURACIÓN POST-CREACIÓN DE PROYECTO FIREBASE

## ✅ PROYECTO CREADO - SIGUIENTES PASOS

### **PASO 1: Agregar aplicación web**

1. **En Firebase Console**, en tu proyecto recién creado:
   - Clic en el ícono **"</>"** (Web) para agregar una app web
   
2. **Configurar app web:**
   - **Nombre de la app:** `OMKO Real Estate Web`
   - **URL (opcional):** `https://realestate.omko.do`
   - ✅ **Marcar:** "También configura Firebase Hosting para esta app"

3. **Obtener configuración:** Después de crear la app, aparecerá un código como este:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyC...", // Tu valor real aquí
     authDomain: "tu-proyecto.firebaseapp.com",
     projectId: "tu-proyecto-id", 
     storageBucket: "tu-proyecto.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123",
     measurementId: "G-XXXXXXXX"
   };
   ```

### **PASO 2: Configurar dominios autorizados**

1. **Ir a Authentication:**
   - Menú lateral → **Authentication**
   - Tab **"Settings"** 
   - Sección **"Authorized domains"**
   
2. **Agregar dominio:**
   - Clic **"Add domain"**
   - Escribir: `realestate.omko.do`
   - **Guardar**

### **PASO 3: Configurar Cloud Messaging**

1. **Ir a Cloud Messaging:**
   - Menú lateral → **Cloud Messaging**
   - Tab **"Settings"**
   
2. **Configurar para web:**
   - **"Web configuration"** → **"Generate key pair"** (si no existe)
   - **Agregar dominio autorizado:** `https://realestate.omko.do`

### **PASO 4: Habilitar servicios necesarios**

**Authentication:**
- Ir a **Authentication** → **Sign-in method**
- Habilitar los métodos que uses (Email/Password, Google, etc.)

**Firestore Database (si se usa):**
- Ir a **Firestore Database** → **Create database**
- Modo: **Start in test mode** (cambiar reglas después)

**Storage (si se usa):**
- Ir a **Storage** → **Get started**
- Reglas por defecto (cambiar después si es necesario)

---

## 📋 CUANDO TENGAS LA CONFIGURACIÓN

**Copia el objeto `firebaseConfig` completo** y compártelo aquí para actualizar automáticamente el archivo `firebase-messaging-sw.js`.

**Debe verse así:**
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC_valor_real_aqui",
  authDomain: "omko-real-estate-xxxxx.firebaseapp.com",
  projectId: "omko-real-estate-xxxxx", 
  storageBucket: "omko-real-estate-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456",
  measurementId: "G-XXXXXXXXXX"
};
```

---

## 🔍 DÓNDE ENCONTRAR LA CONFIGURACIÓN

1. **Firebase Console** → **Tu proyecto**
2. **⚙️ Configuración del proyecto** (ícono de engranaje)
3. **Scroll down** hasta **"Tus apps"**
4. **Clic en tu app web** → **"Configuración"** 
5. **Copiar el objeto `firebaseConfig`**