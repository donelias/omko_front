# 🚀 PLAN DE TRABAJO - REALESTATE (Sitio Estático)

## 📊 ESTADO ACTUAL

| Aspecto | Estado |
|---------|--------|
| Tamaño | 13 MB |
| Tipo | Sitio HTML estático compilado |
| Versión | 1.1.9 |
| Firebase | ✅ Configurado (omko-c9ce7) |
| Google Maps | ✅ Configurado |
| Backend API | ⚠️ Apunta a adminrealestate.omko.do (DEBE CAMBIAR) |
| Deploy | ❓ No verificado en producción |

---

## 🎯 PROBLEMAS IDENTIFICADOS

### ⚠️ URLs apuntan a adminrealestate.omko.do

**En api-config.js:**
```javascript
PRODUCTION_CONFIG = {
  BACKEND_URL: 'https://adminrealestate.omko.do/public',  // ❌ INCORRECTO
  API_BASE_URL: 'https://adminrealestate.omko.do/public/api'
}
```

**En .env.local:**
```
NEXT_PUBLIC_API_BASE_URL=https://adminrealestate.omko.do/public/api  // ❌ INCORRECTO
NEXT_PUBLIC_BACKEND_URL=https://adminrealestate.omko.do/public
```

**Debería ser:**
```javascript
PRODUCTION_CONFIG = {
  BACKEND_URL: 'https://admin.omko.do',  // ✅ CORRECTO
  API_BASE_URL: 'https://admin.omko.do/api'
}
```

```
NEXT_PUBLIC_API_BASE_URL=https://admin.omko.do/api
NEXT_PUBLIC_BACKEND_URL=https://admin.omko.do
```

---

## 🔄 OPCIONES DE TRABAJO

### OPCIÓN 1: Actualizar URLs a OMKO

**Pasos:**
```bash
cd /Users/mac/Documents/Omko/omko/En\ produccion/realestate

# 1. Editar api-config.js
# Cambiar: adminrealestate.omko.do → admin.omko.do

# 2. Editar .env.local
# Cambiar URLs de backend

# 3. Editar .env.example
# Actualizar template para referencia

# 4. Verificar html (si está hardcodeado)
grep -r "adminrealestate.omko.do" *.html
```

**Tiempo**: 10-15 minutos

---

### OPCIÓN 2: Ejecutar Scripts de Utilidad

```bash
cd realestate

# 1. Verificar conexión al backend
bash check_backend_connection.sh

# 2. Verificar seguridad
bash verify_security.sh

# 3. Verificar Firebase
bash firebase-config-helper.sh

# 4. Actualizar URLs de producción (si existe script)
bash fix_production_urls.sh
```

**Tiempo**: 5 minutos

---

### OPCIÓN 3: Servir Localmente

```bash
cd realestate

# 1. Instalar http-server
npm install

# 2. Iniciar servidor
npm run dev

# 3. Acceder a http://localhost:3000

# 4. Verificar que carga correctamente
# - Revisar consola del navegador (F12)
# - Verificar llamadas a API
# - Verificar Firebase conecta
```

**Tiempo**: 5 minutos

---

### OPCIÓN 4: Deploy a Hostinger

**Pasos:**
```bash
# 1. Asegurarse que URLs están actualizadas
# 2. Subir directorio completo a Hostinger
rsync -avz --delete \
  /Users/mac/Documents/Omko/omko/En\ produccion/realestate/ \
  usuario@host:/home/usuario/realestate/

# 3. En Hostinger (cPanel):
# - Crear subdomain: realestate.omko.do
# - Document Root: /home/usuario/realestate
# - Instalar SSL (Let's Encrypt)

# 4. Verificar .htaccess está presente
ssh -p 2222 usuario@host
cd /home/usuario/realestate
ls -la .htaccess

# 5. Acceder a https://realestate.omko.do
```

**Tiempo**: 20-30 minutos

---

### OPCIÓN 5: Revisar & Corregir Configuración

**Archivos a revisar:**
1. `api-config.js` - URLs de API
2. `.env.local` - Variables de entorno
3. `.env.example` - Template
4. `.env.production` - Si existe
5. `firebase-config.js` - Firebase
6. `index.html` - URLs hardcodeadas
7. `.htaccess` - Rewrite rules

**Tiempo**: 20-30 minutos

---

## 📋 CHECKLIST PRE-DEPLOY

- [ ] URLs apuntan a admin.omko.do ✅
- [ ] Firebase configurado ✅
- [ ] Google Maps API Key válida ✅
- [ ] Backend API accesible desde realestate.omko.do ✅
- [ ] .htaccess presente y correcto ✅
- [ ] Sitio carga sin errores 404 ✅
- [ ] Service Worker de push notifications funciona ✅
- [ ] Sitemap.xml válido ✅
- [ ] robots.txt correcto ✅
- [ ] SSL/HTTPS configurado ✅

---

## 🚀 RECOMENDACIÓN

**Empezar por OPCIÓN 1 + 2** (30 minutos):
1. Actualizar URLs de backend a admin.omko.do
2. Ejecutar scripts de verificación
3. Servir localmente y probar

**Luego OPCIÓN 4** (20 minutos):
4. Deploy a Hostinger

---

## 📊 DIFERENCIA: Tres directorios

| Directorio | Tipo | Propósito | Deploy |
|-----------|------|----------|--------|
| `/web` | Next.js SSR | Código fuente + desarrollo | Servidor Node.js |
| `/realestate` | HTML estático | Sitio compilado (export) | Apache/Nginx |
| `/real_estate_admin` | Laravel | Admin panel backend | Apache/PHP |

---

## 🎯 PRÓXIMA ACCIÓN

¿Qué deseas hacer?

1. **Actualizar URLs a admin.omko.do** (rápido)
2. **Ejecutar scripts de verificación** (rápido)
3. **Servir localmente y probar** (rápido)
4. **Deploy a Hostinger** (tiempo)
5. **Revisar toda la configuración** (tiempo)
6. **Otra acción**

Responde con el número o especifica.

