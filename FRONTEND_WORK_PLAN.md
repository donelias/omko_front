# 🚀 PLAN DE TRABAJO FRONTEND - EBROKER

## 📋 INFORMACIÓN DEL ENTORNO

- **Node.js**: v18.17.0 ✅
- **npm**: 10.8.3 ✅
- **Next.js**: 13+ (SSR/SSG)
- **Puerto desarrollo**: 3000
- **Puerto producción**: 8001 (custom server)

---

## 🎯 OPCIONES DE TRABAJO

### OPCIÓN 1: SETUP PARA DESARROLLO LOCAL (Recomendado para empezar)

**Pasos:**
```bash
# 1. Ir al directorio
cd /Users/mac/Documents/Omko/omko/En\ produccion/web

# 2. Instalar dependencias (primera vez solamente)
npm install

# 3. Actualizar .env con credenciales de OMKO
# Variables a actualizar:
# - NEXT_PUBLIC_API_URL (backend Laravel admin)
# - NEXT_PUBLIC_WEB_URL (URL del frontend)
# - Google Maps API Key
# - Firebase config

# 4. Iniciar servidor de desarrollo
npm run dev

# 5. Acceder en navegador
# http://localhost:3000
```

**Tiempo**: 15-20 minutos

---

### OPCIÓN 2: ANÁLISIS DE CÓDIGO ACTUAL

**Tareas:**
```bash
# 1. Validar sintaxis
npm run lint

# 2. Revisar componentes
ls -la src/components/

# 3. Revisar hooks personalizados
ls -la src/hooks/

# 4. Revisar estado Redux
ls -la src/redux/

# 5. Revisar llamadas API
ls -la src/api/

# 6. Revisar páginas
ls -la pages/
```

**Tiempo**: 10-15 minutos

---

### OPCIÓN 3: BUILD PARA PRODUCCIÓN

**Pasos:**
```bash
# 1. Optimizar dependencias
npm install --production

# 2. Build para producción
npm run build

# 3. Ver tamaño del build
du -sh .next/

# 4. Iniciar servidor
npm run start
```

**Tiempo**: 10-15 minutos

---

### OPCIÓN 4: ACTUALIZAR .ENV PARA OMKO

**Variables a cambiar:**

```env
# BACKEND API (Panel Admin)
NEXT_PUBLIC_API_URL="https://admin.omko.do"  ← Cambiar

# FRONTEND URL
NEXT_PUBLIC_WEB_URL="https://web.omko.do"    ← Cambiar

# APPLICATION NAME
NEXT_PUBLIC_APPLICATION_NAME="OMKO Real Estate"  ← Cambiar

# GOOGLE MAPS (Si tienes clave)
NEXT_PUBLIC_GOOGLE_MAPS_API="[TU_CLAVE]"

# FIREBASE (Credenciales de Firebase)
NEXT_PUBLIC_API_KEY="[TU_VALOR]"
NEXT_PUBLIC_AUTH_DOMAIN="[TU_VALOR]"
NEXT_PUBLIC_PROJECT_ID="[TU_VALOR]"
NEXT_PUBLIC_STORAGE_BUCKET="[TU_VALOR]"
NEXT_PUBLIC_MESSAGING_SENDER_ID="[TU_VALOR]"
NEXT_PUBLIC_APP_ID="[TU_VALOR]"
NEXT_PUBLIC_MEASUREMENT_ID="[TU_VALOR]"

# PUSH NOTIFICATIONS (VAPID Key)
NEXT_PUBLIC_VAPID_KEY="[TU_CLAVE]"
```

**Tiempo**: 5 minutos

---

### OPCIÓN 5: DEPLOY A HOSTINGER

**Pasos:**
```bash
# 1. Build local
npm run build

# 2. Subir archivos a Hostinger
# - .next/ (build)
# - pages/
# - src/
# - public/
# - server.js
# - package.json
# - .env (EDITADO)

# 3. En Hostinger (SSH):
npm install --production
npm run start

# 4. Configurar dominio
# Document Root: /home/usuario/web
# Puerto: 8001 (configurar proxy en cPanel)
```

**Tiempo**: 20-30 minutos

---

### OPCIÓN 6: INTEGRACIÓN CON BACKEND ADMIN

**Tareas:**
- Conectar API calls a endpoints del admin panel
- Sincronizar autenticación
- Implementar webhooks
- Validar CORS

**Tiempo**: 30-60 minutos

---

## 📊 CHECKLIST RÁPIDO

- [ ] Node.js instalado: ✅ v18.17.0
- [ ] npm actualizado: ✅ 10.8.3
- [ ] Archivo .env configurado: ❓
- [ ] Dependencias instaladas: ❓
- [ ] Servidor desarrollo funciona: ❓
- [ ] Lint sin errores: ❓
- [ ] Build genera correctamente: ❓
- [ ] Variables de entorno OMKO actualizadas: ❓
- [ ] Conectado con backend admin: ❓
- [ ] Deployado en Hostinger: ❓

---

## 🎯 RECOMENDACIÓN

**Empezar por OPCIÓN 1 (Setup local)** para:
1. Instalar dependencias
2. Verificar que funciona localmente
3. Entender la estructura
4. Después proceder a opciones 4, 5, 6

**Tiempo total estimado**: 60-90 minutos

---

## 📝 SIGUIENTES ACCIONES

Responde cualquiera de estas preguntas:

1. **¿Quieres hacer setup local?**
   - `npm install && npm run dev`

2. **¿Quieres actualizar variables de entorno OMKO?**
   - Proporciona: URLs, Google Maps Key, Firebase config

3. **¿Quieres revisar el código actual?**
   - `npm run lint`

4. **¿Quieres deployar a producción?**
   - Seguir guía de deployment

5. **¿Quieres otra tarea?**
   - Especifica qué necesitas

