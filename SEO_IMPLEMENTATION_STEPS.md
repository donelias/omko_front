# 📋 Guía de Implementación SEO - Paso a Paso

**Fecha:** 25 de Enero, 2026  
**Hosting:** Hostinger (Compartido)  
**Dominio:** realestate.omko.do

---

## ✅ PASO 1: Preparar Archivos

### Archivos a Subir:

1. **`.htaccess`** - Optimizado para hosting compartido
   - Ubicación: `/realestate/.htaccess.optimized`
   - Cambiar nombre a `.htaccess`
   - Permisos: `644`

2. **`robots.txt`** - Configuración de buscadores
   - Ubicación: `/realestate/robots.txt` (ya creado)
   - Permisos: `644`

3. **`sitemap-pages.xml`** - Sitemap de páginas principales
   - Ubicación: `/realestate/sitemap-pages.xml` (ya creado)
   - Permisos: `644`

4. **`index.html`** - Con meta tags mejorados
   - Ubicación: `/realestate/index.html`
   - Actualizar antes de subir

---

## 🔧 PASO 2: Actualizar index.html

### Agregar en `<head>` (antes de `</head>`):

```html
<!-- SEO Meta Tags -->
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
<meta name="description" content="OMKO Real Estate - Especialistas en propiedades en República Dominicana. Compra, venta e inversión inmobiliaria. ¡Hagamos tu mejor inversión realidad!">
<meta name="keywords" content="real estate republica dominicana, propiedades, casas, apartamentos, inversiones, omko inmobiliario, terrenos, proyectos">
<meta name="author" content="OMKO Real Estate">
<meta name="robots" content="index, follow, max-snippet:-1, max-video-preview:-1, max-image-preview:large">
<meta name="language" content="Spanish">

<!-- Open Graph -->
<meta property="og:locale" content="es_DO">
<meta property="og:site_name" content="OMKO Real Estate">

<!-- Canonical -->
<link rel="canonical" href="https://realestate.omko.do/">

<!-- Alternate hreflang (idiomas) -->
<link rel="alternate" hreflang="es" href="https://realestate.omko.do/">
<link rel="alternate" hreflang="es-DO" href="https://realestate.omko.do/">
<link rel="alternate" hreflang="x-default" href="https://realestate.omko.do/">

<!-- Geolocalización -->
<meta name="geo.placename" content="Dominican Republic">
<meta name="geo.position" content="19.0;-71.0">
<meta name="ICBM" content="19.0, -71.0">

<!-- Apple Meta Tags -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black">
<meta name="apple-mobile-web-app-title" content="OMKO Real Estate">

<!-- Preconnect para mejor rendimiento -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://maps.googleapis.com">
<link rel="preconnect" href="https://cdn.jsdelivr.net">
<link rel="dns-prefetch" href="https://www.googletagmanager.com">
<link rel="dns-prefetch" href="https://www.google-analytics.com">

<!-- Favicon -->
<link rel="icon" type="image/png" href="/favicon.ico" sizes="32x32">
<link rel="apple-touch-icon" href="/favicon.ico">

<!-- Schema.org Structured Data - RealEstateAgent -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  "name": "OMKO Real Estate",
  "url": "https://realestate.omko.do",
  "logo": "https://realestate.omko.do/omko-logo.png",
  "description": "Especialistas en venta y alquiler de propiedades en República Dominicana",
  "sameAs": [
    "https://www.facebook.com/omko.do",
    "https://www.instagram.com/omko.do/",
    "https://www.youtube.com/@omkobr"
  ],
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Your Street Address",
    "addressLocality": "Santo Domingo",
    "addressRegion": "DN",
    "postalCode": "10000",
    "addressCountry": "DO"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Service",
    "telephone": "+1-XXX-XXX-XXXX"
  }
}
</script>

<!-- Schema.org - Organization -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "OMKO",
  "url": "https://realestate.omko.do",
  "logo": "https://realestate.omko.do/omko-logo.png",
  "description": "Plataforma líder de real estate en República Dominicana",
  "sameAs": [
    "https://www.facebook.com/omko.do",
    "https://www.instagram.com/omko.do/",
    "https://www.youtube.com/@omkobr"
  ]
}
</script>

<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX', {
    'page_path': window.location.pathname,
    'anonymize_ip': true
  });
</script>

<!-- Google Search Console verification -->
<meta name="google-site-verification" content="XXXXXXXXXXXXXXXXXXXXX">

<!-- Bing Webmaster verification -->
<meta name="msvalidate.01" content="XXXXXXXXXXXXXXXXXXXXX">
```

---

## 📤 PASO 3: Subir Archivos al Hosting

### Opción A: Via Hosting Panel (Recomendado para Hostinger)

1. **Acceder a Hostinger**
   - URL: `https://www.hostinger.com/cp`
   - Usuario y contraseña

2. **File Manager**
   - Navegar a `/public_html/` (o raíz del sitio)
   - Buscar carpeta `realestate`

3. **Subir Archivos**
   ```
   realestate/
   ├── .htaccess (REEMPLAZAR el existente)
   ├── robots.txt (CREAR NUEVO)
   ├── sitemap-pages.xml (CREAR NUEVO)
   ├── sitemap.xml (ya existe)
   └── index.html (ACTUALIZAR)
   ```

4. **Verificar Permisos**
   - Click derecho en archivo → Permisos
   - .htaccess: `644`
   - robots.txt: `644`
   - XML sitemaps: `644`

### Opción B: Via FTP

```bash
# Conectar por FTP
ftp -i ftp.realestate.omko.do
# Usuario: ftpuser
# Contraseña: xxxxxxx

# Navegar a directorio
cd /public_html/realestate

# Cambiar tipo de transferencia
ascii

# Subir archivos
put .htaccess
put robots.txt
put sitemap-pages.xml

# Salir
quit
```

---

## ✔️ PASO 4: Verificar Configuración en Hosting

### En Hostinger Panel:

1. **Verificar mod_rewrite**
   - Settings → PHP Version
   - Asegurar Apache habilitado
   - mod_rewrite debe estar activo

2. **Verificar Gzip**
   - Settings → Performance
   - Gzip Compression: ON

3. **Verificar HTTPS**
   - Settings → SSL Certificate
   - Debe estar activo

4. **Verificar Caché**
   - Settings → Caching
   - Browser Caching: ON
   - Server Caching: ON

---

## 🧪 PASO 5: Verificar URLs

### Probar cada URL:

```bash
# Página principal
https://realestate.omko.do/

# Páginas estáticas
https://realestate.omko.do/about-us/
https://realestate.omko.do/contact-us/
https://realestate.omko.do/all-agents/

# Páginas dinámicas (ejemplos)
https://realestate.omko.do/properties-details/luxury-apartment-santo-domingo/
https://realestate.omko.do/agent-details/juan-smith/

# Archivos de SEO
https://realestate.omko.do/robots.txt
https://realestate.omko.do/sitemap.xml
https://realestate.omko.do/sitemap-pages.xml
```

**Resultado esperado:** HTTP 200 (OK)

---

## 🔍 PASO 6: Validar SEO

### Herramientas Online:

1. **Google Mobile-Friendly Test**
   - URL: https://search.google.com/test/mobile-friendly
   - Ingresar: https://realestate.omko.do
   - Resultado: ✅ Optimizado para móviles

2. **Google PageSpeed Insights**
   - URL: https://pagespeed.web.dev/
   - Ingresar: https://realestate.omko.do
   - Verificar Core Web Vitals

3. **XML Sitemap Validator**
   - URL: https://www.xml-sitemaps.com/validate-xml-sitemap.html
   - Validar ambos sitemaps

4. **Robots.txt Tester**
   - En Google Search Console
   - Probar rutas clave

5. **W3C Markup Validator**
   - URL: https://validator.w3.org/
   - Verificar HTML válido

---

## 📊 PASO 7: Configurar Google Search Console

### 1. Agregar Propiedad

- Ir a https://search.google.com/search-console
- Click "Add property"
- Ingresar: https://realestate.omko.do

### 2. Elegir Método de Verificación

**Opción A: Archivo HTML**
- Descargar archivo
- Subir a raíz de hosting
- Click "Verify"

**Opción B: DNS**
- Copiar registro DNS
- Ir a Hostinger → Domain
- Agregar registro TXT
- Click "Verify"

### 3. Agregar Sitemaps

En Search Console:
- Ir a Sitemaps
- Agregar:
  - sitemap.xml
  - sitemap-pages.xml
  
(Luego agregar sitemaps dinámicos cuando estén listos)

### 4. Monitorear

- Coverage: Verificar URLs indexadas
- Enhancements: Mobile usability, Rich results
- Performance: CTR, Impresiones, Posición

---

## 📈 PASO 8: Configurar Google Analytics 4

### 1. Crear Propiedad

- Ir a https://analytics.google.com
- Click "Create Property"
- Nombre: OMKO Real Estate
- Website URL: https://realestate.omko.do
- Timezone: America/Santo_Domingo

### 2. Obtener Measurement ID

- En Admin → Data Streams
- Copiar "Measurement ID" (G-XXXXXXXXXX)

### 3. Actualizar index.html

Reemplazar `G-XXXXXXXXXX` con ID real en:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
```

### 4. Verificar Datos

- Esperar 24 horas
- En Analytics → Real-time
- Verificar visitas

---

## 🎯 PASO 9: Optimizaciones Continuas

### Semanal:
- [ ] Revisar Search Console Errors
- [ ] Verificar Core Web Vitals
- [ ] Analizar tráfico Analytics

### Mensual:
- [ ] Actualizar sitemaps dinámicos
- [ ] Revisar ranking keywords
- [ ] Optimizar páginas lentas
- [ ] Analizar backlinks

### Trimestral:
- [ ] Auditoría SEO completa
- [ ] Actualizar content
- [ ] Revisar estrategia de keywords

---

## ⚠️ Problemas Comunes y Soluciones

### Problema: 404 en todas las rutas
**Solución:**
- Verificar .htaccess tiene permisos 644
- Verificar mod_rewrite habilitado
- Verificar RewriteBase correcto

### Problema: Sitemap no se indexa
**Solución:**
- Validar XML en validator
- Verificar URLs accesibles
- Re-submit en Search Console

### Problema: Páginas dinámicas no se indexan
**Solución:**
- Verificar rewrite rules en .htaccess
- Generar sitemaps dinámicos
- Aumentar prioridad en sitemap.xml

### Problema: Caché no funciona
**Solución:**
- Verificar Expires headers en .htaccess
- Limpiar caché del navegador
- Verificar mod_expires habilitado

---

## 📋 Checklist Final

- [ ] .htaccess subido y funciona
- [ ] robots.txt visible
- [ ] Sitemaps válidos
- [ ] Index.html con meta tags
- [ ] HTTPS funcionando
- [ ] Gzip habilitado
- [ ] Cache configurado
- [ ] URLs amigables funcionan
- [ ] Google Search Console verificado
- [ ] Google Analytics configurado
- [ ] Mobile-friendly OK
- [ ] PageSpeed optimizado
- [ ] Structured data validado

---

## 📞 Contactos de Soporte

**Hostinger Support:**
- Ticket: https://www.hostinger.com/cp
- Chat: Disponible 24/7
- Email: support@hostinger.com

**Google Support:**
- Search Console: https://support.google.com/webmasters
- Analytics: https://support.google.com/analytics

---

**Status:** ✅ Listo para implementar
**Próximo paso:** Ejecutar PASO 1-9 según cronograma
