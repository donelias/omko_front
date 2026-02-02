# 🏠 ANÁLISIS DIRECTORIO REALESTATE

## 📊 ¿QUÉ ES ESTE DIRECTORIO?

Este es el **sitio web estático compilado/exportado** de la aplicación Next.js original del directorio `/web`.

**Tipo**: Sitio HTML estático pre-compilado (Next.js Export)
**Versión**: 1.1.9 (según META en index.html)
**Estado**: Listo para servir directamente sin Node.js
**URL de producción**: https://realestate.omko.do/

---

## 🗂️ ESTRUCTURA

```
realestate/
├── index.html              # Página principal (compilada)
├── _next/                  # Archivos compilados de Next.js (CSS, JS)
│   ├── static/
│   │   ├── chunks/         # JS bundles
│   │   └── css/            # CSS compilado
│   └── ...
├── pages/                  # Directorio de páginas HTML estáticas
│   ├── properties/
│   ├── properties-details/
│   ├── projects/
│   ├── agent-details/
│   ├── user/
│   ├── payment/
│   ├── faqs/
│   ├── articles/
│   ├── search/
│   └── ... (18+ páginas)
├── public/                 # Archivos públicos
├── css/                    # Estilos CSS
├── api-config.js           # Configuración de API
├── firebase-config.js      # Configuración de Firebase
├── firebase-messaging-sw.js # Service Worker para push notifications
├── .htaccess              # Configuración Apache para rewrite rules
├── .env.local             # Variables de entorno (desarrollo)
├── .env.example           # Ejemplo de variables
├── package.json           # Dependencias (solo http-server)
├── robots.txt             # SEO - Robots
├── sitemap.xml            # SEO - Mapa del sitio
├── sitemap-pages.xml      # SEO - Mapa de páginas
└── scripts/               # Scripts de utilidad
    ├── check_backend_connection.sh
    ├── firebase-config-helper.sh
    ├── fix_production_urls.sh
    └── verify_security.sh
```

---

## 🔧 CONFIGURACIÓN ACTUAL

### Entorno Variables (.env.local)

| Variable | Valor |
|----------|-------|
| NODE_ENV | development |
| API_BASE_URL | https://adminrealestate.omko.do/public/api |
| BACKEND_URL | https://adminrealestate.omko.do/public |
| FRONTEND_URL | http://localhost:3000 |
| Firebase Project | omko-c9ce7 |
| Firebase Email | Configurado ✅ |

### Dependencias (Mínimas)
```json
{
  "dependencies": {
    "http-server": "^14.1.1"  // Solo para servir archivos estáticos
  }
}
```

### Scripts Disponibles
```bash
npm run dev      # http-server en puerto 3000 (desarrollo)
npm run start    # http-server en puerto 3000 (producción)
npm test         # No configurado
```

---

## 🎯 DIFERENCIA: /web vs /realestate

| Aspecto | /web (Fuente) | /realestate (Compilado) |
|---------|--------------|----------------------|
| Tipo | Next.js SSR/SSG | Sitio HTML estático |
| Contiene | Código fuente React | HTML pre-compilado |
| Node.js requerido | ✅ Sí | ❌ No |
| Poder de servidor | Alto (SSR) | Bajo (estático) |
| Compilación | No (desarrollo) | ✅ Compilado |
| Tamaño | Grande (node_modules) | Pequeño |
| Deployable en | Servidor Node.js | Cualquier hosting |
| Velocidad | Variable | Muy rápido ⚡ |

---

## 📋 TECNOLOGÍAS DETECTADAS

**Frontend:**
- Next.js 13+ (compilado a HTML estático)
- React 18+
- Tailwind CSS (compilado)
- Radix UI / Shadcn UI

**APIs & Integraciones:**
- Google Maps API (key: AIzaSyCZ-Jq3Sp0xhv2tDlgSzRjgOukyd-Okw-w)
- Firebase (omko-c9ce7)
- Backend API (adminrealestate.omko.do)

**Herramientas:**
- Swiper (carousels)
- Pannellum (360° viewer)
- Google AdSense

**Hosting:**
- Apache (.htaccess present)
- http-server (desarrollo)

---

## 🚀 OPCIONES DE USO

### OPCIÓN 1: Servir Localmente (Desarrollo)
```bash
cd /Users/mac/Documents/Omko/omko/En\ produccion/realestate

# Instalar dependencias
npm install

# Iniciar servidor
npm run dev

# Acceder a: http://localhost:3000
```

**Ventaja**: Rápido, sin compilación
**Tiempo**: 2 minutos

---

### OPCIÓN 2: Servir en Producción (Hostinger)
```bash
# 1. Subir directorio completo a Hostinger
# 2. Configurar Document Root a /home/usuario/realestate/
# 3. Verificar .htaccess está presente
# 4. Acceder a https://realestate.omko.do/
```

**Ventaja**: Listo para producción
**Tiempo**: 15 minutos

---

### OPCIÓN 3: Verificar & Actualizar URLs
```bash
# Usar script para actualizar URLs de backend
bash fix_production_urls.sh

# Script actualiza en:
# - api-config.js
# - firebase-config.js
# - index.html
```

**Ventaja**: Automatiza cambios de URLs
**Tiempo**: 5 minutos

---

### OPCIÓN 4: Verificar Seguridad
```bash
bash verify_security.sh
bash firebase-config-helper.sh
bash check_backend_connection.sh
```

**Ventaja**: Valida configuración
**Tiempo**: 10 minutos

---

## 🔍 PROBLEMAS DETECTADOS

### ⚠️ URLs Apuntando a adminrealestate.omko.do
```
NEXT_PUBLIC_API_BASE_URL=https://adminrealestate.omko.do/public/api
NEXT_PUBLIC_BACKEND_URL=https://adminrealestate.omko.do/public
```

**Debería ser**: admin.omko.do (según lo que configuramos)

**Solución**: Actualizar .env.local

---

### ⚠️ FRONTEND_URL en desarrollo
```
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

**Debería ser en producción**: https://realestate.omko.do

---

## 📊 ARCHIVOS DE CONFIGURACIÓN

### .htaccess (Apache rewrite rules)
```apache
(Presente - verifica rewrite rules para SPA)
```

### api-config.js
- Configuración centralizada de endpoints API
- URLs base para llamadas HTTP

### firebase-config.js
- Credenciales de Firebase
- Configuración de autenticación

### firebase-messaging-sw.js
- Service Worker para push notifications
- Escucha mensajes de Firebase Cloud Messaging

---

## 🎯 PRÓXIMAS ACCIONES

### 1️⃣ **Verificar que funciona localmente**
```bash
cd realestate
npm install
npm run dev
# Acceder a http://localhost:3000
```

### 2️⃣ **Actualizar URLs para OMKO**
```bash
# Editar .env.local:
NEXT_PUBLIC_API_BASE_URL=https://admin.omko.do/api
NEXT_PUBLIC_BACKEND_URL=https://admin.omko.do
NEXT_PUBLIC_FRONTEND_URL=https://realestate.omko.do
```

### 3️⃣ **Ejecutar scripts de verificación**
```bash
bash check_backend_connection.sh
bash verify_security.sh
```

### 4️⃣ **Deploy a Hostinger**
```bash
# Subir directorio completo a:
# /home/usuario/realestate/
```

### 5️⃣ **Configurar dominio**
```
Document Root: /home/usuario/realestate
URL: https://realestate.omko.do
```

---

## 📞 RESUMEN RÁPIDO

- ✅ Sitio HTML estático compilado
- ✅ Listo para producción
- ✅ Configuración de Firebase presente
- ✅ Scripts de utilidad disponibles
- ❌ URLs apuntan a adminrealestate.omko.do (debe cambiar)
- ❓ Conectado con backend admin OMKO

---

**¿Qué deseas hacer?**
1. Verificar localmente
2. Actualizar URLs
3. Deploy a Hostinger
4. Revisar seguridad
5. Otra acción

