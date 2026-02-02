# 🔧 Plan de Acción: Completar Web-omko

## Estado Actual: ✅ OPERACIONAL (pero incompleto)

### Lo que está FUNCIONANDO:
- ✅ Next.js en puerto 3000
- ✅ npm install completado
- ✅ .env configurado con URLs de OMKO
- ✅ Dependencias básicas instaladas
- ✅ Estructura de páginas y componentes

### Lo que NECESITA COMPLETARSE:

---

## FASE 1: VALIDACIÓN Y TESTING (INMEDIATO)

### 1.1 Probar Conexión a Backend
```bash
# En Web-omko, verificar:
curl -s https://admin.omko.do/public/api/get_property | jq . | head -20
```

**Archivos afectados:**
- `/Web-omko/.env` - Ya tiene `NEXT_PUBLIC_API_URL="https://admin.omko.do/public"`
- `/Web-omko/src/api/` - Necesita validar endpoints

**Tareas:**
1. [ ] Verificar que API responde en HTTPS
2. [ ] Validar certificados SSL de admin.omko.do
3. [ ] Probar endpoint `/api/get_property`
4. [ ] Probar endpoint `/api/get_system_settings`

### 1.2 Probar Firebase
**Archivos afectados:**
- `/Web-omko/.env` - Variables Firebase (placeholders xxxxxxx)
- `/Web-omko/src/lib/firebase.js` o similar

**Tareas:**
1. [ ] Verificar credenciales Firebase en .env
2. [ ] Validar que Firebase inicializa sin errores
3. [ ] Revisar console.log en browser para errores

### 1.3 Probar Redux Store
**Tareas:**
1. [ ] Verificar que Redux DevTools funciona
2. [ ] Validar que persistence funciona
3. [ ] Revisar que Language settings cargan correctamente

---

## FASE 2: CONFIGURACIÓN FALTANTE (ESTA SEMANA)

### 2.1 Agregar Configuración de Imágenes en next.config.js

**ANTES:**
```javascript
// Web-omko/next.config.js - ACTUAL
const nextConfig = {
  images: {
    unoptimized: true,
  },
  ...
}
```

**DESPUÉS:**
```javascript
// Web-omko/next.config.js - ACTUALIZADO
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "admin.omko.do",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.omko.do",
        pathname: "/**",
      }
    ],
  },
  ...
}
```

**Acción**: Editar `/Web-omko/next.config.js`

### 2.2 Agregar Variables de Entorno Faltantes

**Agregar a `/Web-omko/.env`:**
```
# Cache configuration
NEXT_PUBLIC_API_STALE_TIME="300000"

# Application name
NEXT_PUBLIC_APPLICATION_NAME="OMKO Real Estate"

# Messaging
NEXT_PUBLIC_MESSAGING_SENDER_ID="[DEL .env actual]"
```

**Acción**: Editar `/Web-omko/.env`

### 2.3 Crear PostCSS config (si usa Tailwind)

**Crear `/Web-omko/postcss.config.mjs`:**
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**Acción**: Crear archivo PostCSS

### 2.4 Crear Tailwind config (si es necesario)

**Copiar desde web:**
```bash
cp /Users/mac/Documents/Omko/omko/En\ produccion/web/tailwind.config.js \
   /Users/mac/Documents/Omko/omko/En\ produccion/Web-omko/
```

**Acción**: Copiar archivo Tailwind

### 2.5 Actualizar Components a Radix UI (OPCIONAL)

**Dependencias a agregar:**
```json
{
  "@radix-ui/react-accordion": "^1.2.4",
  "@radix-ui/react-avatar": "^1.1.7",
  "@radix-ui/react-checkbox": "^1.2.3",
  "@radix-ui/react-dialog": "^1.1.15",
  // ... más en web/package.json
}
```

**Acción**: `npm install @radix-ui/react-*` (si se desea mejorar UI)

---

## FASE 3: ACTUALIZAR DEPENDENCIAS (PRÓXIMAS 2 SEMANAS)

### 3.1 Dependencias Críticas

**Actualizar Firebase de 10.1.0 → 11.6.0:**
```bash
cd /Users/mac/Documents/Omko/omko/En\ produccion/Web-omko
npm update firebase
```

**Actualizar Redux Toolkit de 1.9.5 → 2.5.1:**
```bash
npm update @reduxjs/toolkit
```

**Verificar compatibilidades:**
```bash
npm audit
npm update --save
```

### 3.2 Dependencias Opcionales

- @emotion/react: 11.11.1 → última
- @mui/material: 5.14.10 → última
- next: 14.2.5 → 14.2.35
- react: 18.2.0 → última 18.x

---

## FASE 4: CARACTERÍSTICAS AVANZADAS (PRODUCCIÓN)

### 4.1 Sitemap Generator
**Copiar desde web:**
```bash
cp /Users/mac/Documents/Omko/omko/En\ produccion/web/scripts/sitemap-generator.js \
   /Users/mac/Documents/Omko/omko/En\ produccion/Web-omko/scripts/
```

**Actualizar next.config.js:**
```javascript
// Agregar en webpack config
if (isServer) {
  require('./scripts/sitemap-generator')
}
```

### 4.2 Mejorar SEO Static Export
**Actualizar next.config.js:**
```javascript
if (process.env.NEXT_PUBLIC_SEO === "false") {
  nextConfig.output = 'export'
  nextConfig.exportPathMap = async (defaultPathMap, ...) => {
    // Generar rutas dinámicas
  }
}
```

### 4.3 ScrollRestoration
**Agregar a next.config.js:**
```javascript
const nextConfig = {
  experimental: {
    scrollRestoration: true,
  },
  ...
}
```

---

## 📋 Checklist de Ejecución

### [ ] FASE 1: Validación
- [ ] Probar conexión a backend
- [ ] Verificar Firebase
- [ ] Validar Redux store
- [ ] Revisar console.log sin errores

### [ ] FASE 2: Configuración
- [ ] [ ] Editar next.config.js (remote patterns)
- [ ] [ ] Agregar variables .env faltantes
- [ ] [ ] Crear postcss.config.mjs
- [ ] [ ] Copiar tailwind.config.js (opcional)

### [ ] FASE 3: Actualizar
- [ ] [ ] npm update firebase
- [ ] [ ] npm update @reduxjs/toolkit
- [ ] [ ] npm audit
- [ ] [ ] Probar servidor después de updates

### [ ] FASE 4: Avanzado (cuando esté en staging)
- [ ] [ ] Copiar sitemap-generator.js
- [ ] [ ] Configurar SEO export
- [ ] [ ] Agregar scrollRestoration
- [ ] [ ] Build de producción

---

## 🎯 Prioridades

### 🔴 CRÍTICO (Hoy):
1. Validar conexión a backend API
2. Verificar Firebase credentials
3. Revisar Redux store en DevTools

### 🟠 IMPORTANTE (Esta semana):
1. Editar next.config.js para remote patterns
2. Agregar variables .env faltantes
3. Actualizar Firebase a 11.6.0

### 🟡 MEDIANO (Próximas 2 semanas):
1. Copiar configuración de Tailwind/PostCSS
2. Actualizar todas las dependencias
3. Implementar sitemap generator

### 🟢 LARGO PLAZO (Antes de producción):
1. Sincronizar con web@1.2.9-silent completo
2. Auditoría de seguridad
3. Tests end-to-end

---

## 📝 Resumen para el Usuario

**Web-omko está 70% completo:**
- ✅ Estructura de Next.js funcional
- ✅ Conexión a backend configurada
- ✅ Redux y Firebase definidos
- ⚠️ Necesita validación de conectividad
- ⚠️ Necesita actualizar algunas dependencias
- ⚠️ Faltan configuraciones SEO avanzadas

**Puede hacer testing local ahora, pero antes de producción necesita:**
1. Validar que TODO conecta correctamente
2. Actualizar dependencias críticas
3. Ajustar configuraciones de imágenes
4. Implementar features avanzadas
