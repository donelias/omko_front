# 🚀 Guía para Testing Frontend Local - OMKO Real Estate

## 📋 Configuración de Entorno de Desarrollo

### 1. Crear Servidor de Desarrollo Local

Como tienes una exportación estática de Next.js, podemos servirla localmente con diferentes opciones:

#### Opción A: Servidor HTTP Simple (Python)
```bash
cd "/Users/mac/Documents/Omko/omko/En produccion/realestate"

# Python 3
python -m http.server 3000

# Accede a: http://localhost:3000
```

#### Opción B: Servidor HTTP con Node.js (http-server)
```bash
cd "/Users/mac/Documents/Omko/omko/En produccion/realestate"

# Instalar http-server globalmente
npm install -g http-server

# Iniciar servidor
http-server -p 3000 -c-1

# Accede a: http://localhost:3000
```

#### Opción C: Servidor con Live Server (VS Code Extension)
1. Instalar "Live Server" extension en VS Code
2. Click derecho en `index.html`
3. Seleccionar "Open with Live Server"

---

## 🔧 Configuración de URLs para Testing

### 2. Variables de Entorno para Development

Crear archivo `.env.local`:
```bash
# Frontend Local Development Environment
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_ENV=development

# Firebase Configuration (mantener producción)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyD640W_80U9-hBRnMKG8ngDyzc8Y98wj_8
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=omko-c9ce7.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=omko-c9ce7
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=omko-c9ce7.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=188737881983
NEXT_PUBLIC_FIREBASE_APP_ID=1:188737881983:web:015612151f003e88d67c4a
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-HH52RHHPER
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BKKOLKvAGJ3KjGfW_R_RDOT4YVNVXstkxmM-2og0f86TJfIPOyFPTtBgU8haOdu3MVw9B1CWErqS-0r0T0

# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyCZ-Jq3Sp0xhv2tDlgSzRjgOukyd-Okw-w
```

---

## 🔄 Modificar Configuración de API

### 3. Actualizar api-config.js para Development
```javascript
// Detectar si estamos en localhost
const isDevelopment = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || 
   window.location.hostname === '127.0.0.1' ||
   window.location.port === '3000');

// URLs de desarrollo
const DEVELOPMENT_CONFIG = {
  BACKEND_URL: 'http://localhost:8000',
  FRONTEND_URL: 'http://localhost:3000', 
  API_BASE_URL: 'http://localhost:8000/api',
  ADMIN_URL: 'http://localhost:8000'
};

// URLs de producción (mantener existentes)
const PRODUCTION_CONFIG = {
  BACKEND_URL: 'https://adminrealestate.omko.do/public',
  FRONTEND_URL: 'https://realestate.omko.do',
  API_BASE_URL: 'https://adminrealestate.omko.do/public/api',
  ADMIN_URL: 'https://adminrealestate.omko.do/public'
};
```

---

## 🛠️ Scripts de Desarrollo

### 4. Script de Inicio para Development

Crear `start-dev.sh`:
```bash
#!/bin/bash

echo "🚀 Starting OMKO Frontend Development Server"
echo "============================================="

# Verificar si Laravel backend está corriendo
echo "📡 Checking backend status..."
if curl -s http://localhost:8000/api/get_system_settings > /dev/null 2>&1; then
    echo "✅ Backend is running on http://localhost:8000"
else
    echo "❌ Backend not detected. Starting Laravel backend..."
    cd "../real_estate_admin"
    php artisan serve --port=8000 &
    BACKEND_PID=$!
    echo "🔧 Backend started with PID: $BACKEND_PID"
    cd "../realestate"
fi

# Verificar si Node.js está instalado
if command -v node &> /dev/null; then
    if command -v http-server &> /dev/null; then
        echo "🌐 Starting frontend with http-server..."
        http-server -p 3000 -c-1 --cors
    else
        echo "📦 Installing http-server..."
        npm install -g http-server
        echo "🌐 Starting frontend..."
        http-server -p 3000 -c-1 --cors
    fi
else
    echo "🐍 Using Python server..."
    python3 -m http.server 3000
fi
```

---

## 📱 Testing Features

### 5. Lista de Verificación para Testing

#### ✅ Funcionalidades a Probar:

**Conectividad:**
- [ ] APIs del backend responden correctamente
- [ ] Frontend carga sin errores de consola
- [ ] Configuración de Firebase funcional

**Autenticación:**
- [ ] Registro de usuario
- [ ] Login/logout
- [ ] Verificación de usuario

**Propiedades:**
- [ ] Listado de propiedades
- [ ] Filtros de búsqueda
- [ ] Detalles de propiedad
- [ ] Agregar a favoritos

**Notificaciones:**
- [ ] Permisos de notificación
- [ ] Registro de token FCM
- [ ] Push notifications

**Mapas:**
- [ ] Carga correcta de Google Maps
- [ ] Marcadores de propiedades
- [ ] Búsqueda por ubicación

---

## 🐛 Debugging y Logs

### 6. Monitoreo durante Testing

#### Console Logs a Verificar:
```javascript
// En browser console
console.log('🔧 API Configuration:', window.API_CONFIG);
console.log('🔥 Firebase Status:', window.firebase);
console.log('📍 Google Maps Status:', window.google);
```

#### Network Tab Monitoring:
- Verificar llamadas a API
- Tiempo de respuesta
- Errores de CORS
- Códigos de estado HTTP

---

## 🔄 Hot Reloading (Opcional)

### 7. Setup con Webpack Dev Server

Si quieres hot reloading, puedes crear una configuración básica:

```bash
# Crear package.json básico
npm init -y

# Instalar dependencias de desarrollo
npm install --save-dev webpack webpack-dev-server html-webpack-plugin

# Configurar webpack.config.js para servir archivos estáticos
```

---

## 🚦 Scripts Útiles

### 8. Comandos de Testing

```bash
# Verificar conectividad backend
curl -X POST http://localhost:8000/api/get_system_settings \
  -H "Content-Type: application/json"

# Verificar frontend
curl -I http://localhost:3000

# Monitoreo en tiempo real
tail -f /var/log/nginx/access.log  # Si usas nginx
```

---

## 📊 Próximos Pasos

1. **Elegir método de servidor** (Python/Node.js/Live Server)
2. **Iniciar backend Laravel** en paralelo
3. **Modificar configuración** para development
4. **Probar funcionalidades** paso a paso
5. **Documentar issues** encontrados
6. **Preparar para producción** una vez validado

---

**🎯 Objetivo:** Tener el frontend funcionando en `http://localhost:3000` conectado al backend en `http://localhost:8000` para testing completo antes de subir a producción.