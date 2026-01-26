# 🚀 SEO para Hosting Compartido - OMKO Real Estate

**Fecha:** 25 de Enero, 2026  
**Versión:** 1.0  
**Status:** Implementación

## 📋 Problemas Identificados en Hosting Compartido

### 1. **Sitemap.xml Inválido**
- ❌ URLs con placeholders: `[slug]`, `(1)`
- ❌ No incluye URLs dinámicas reales
- ❌ Google no puede indexar correctamente

### 2. **.htaccess Incorrecto**
- ❌ Rewrite rules no óptimas para hosting compartido
- ❌ Reescribe a archivos estáticos que no existen
- ❌ Falta `RewriteCond` para evitar bucles infinitos

### 3. **Falta robots.txt en Frontend**
- ❌ No hay robots.txt en `/realestate`
- ❌ Algunos bots no pueden rastrear correctamente

### 4. **Meta Tags Incompletos**
- ⚠️ Falta `viewport` en algunas páginas
- ⚠️ Falta `hreflang` para soporte de idiomas

### 5. **URLs No Canónicas**
- ⚠️ Sin trailing slash inconsistencia
- ⚠️ Falta canonical links para categorías

---

## 🔧 Soluciones Implementadas

### 1. **Mejorar .htaccess para Hosting Compartido**

```apache
<IfModule mod_rewrite.c>
    # Habilitar motor de reescritura
    RewriteEngine On
    RewriteBase /

    # Evitar bucles infinitos
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} !\.html$ [NC]
    RewriteCond %{REQUEST_URI} !\.css$ [NC]
    RewriteCond %{REQUEST_URI} !\.js$ [NC]
    RewriteCond %{REQUEST_URI} !\.png$ [NC]
    RewriteCond %{REQUEST_URI} !\.jpg$ [NC]
    RewriteCond %{REQUEST_URI} !\.jpeg$ [NC]
    RewriteCond %{REQUEST_URI} !\.gif$ [NC]
    RewriteCond %{REQUEST_URI} !\.svg$ [NC]
    RewriteCond %{REQUEST_URI} !\.ico$ [NC]
    RewriteCond %{REQUEST_URI} !\.woff$ [NC]
    RewriteCond %{REQUEST_URI} !\.woff2$ [NC]
    RewriteCond %{REQUEST_URI} !\.ttf$ [NC]
    RewriteCond %{REQUEST_URI} !\.eot$ [NC]

    # Redirigir sin trailing slash a con trailing slash
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} !(.*)/$
    RewriteRule ^(.*[^/])$ $1/ [L,R=301]

    # Reescribir URLs dinámicas
    RewriteRule ^properties-details/(.+)/?$ properties-details/[slug]/index.html [L]
    RewriteRule ^agent-details/(.+)/?$ agent-details/[slug]/index.html [L]
    RewriteRule ^project-details/(.+)/?$ project-details/[slug]/index.html [L]
    RewriteRule ^article-details/(.+)/?$ article-details/[slug]/index.html [L]
    RewriteRule ^properties/categories/(.+)/?$ properties/categories/[slug]/index.html [L]
    RewriteRule ^properties/city/(.+)/?$ properties/city/[slug]/index.html [L]

    # Archivos estáticos con ruta completa
    RewriteRule ^(.*\.html)/?$ $1 [L]
    RewriteRule ^$ /index.html [L]
    
    # Fallback a 404
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ /404/404.html [L]

</IfModule>

# Headers para SEO y rendimiento
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpeg "access plus 1 month"
    ExpiresByType image/gif "access plus 1 month"
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType image/webp "access plus 1 month"
    ExpiresByType image/svg+xml "access plus 1 month"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType font/truetype "access plus 1 month"
    ExpiresByType font/opentype "access plus 1 month"
    ExpiresByType application/x-font-woff "access plus 1 month"
    ExpiresByType application/x-font-woff2 "access plus 1 month"
</IfModule>

# Compresión Gzip
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE text/javascript
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
    AddOutputFilterByType DEFLATE application/x-font-ttf
    AddOutputFilterByType DEFLATE font/opentype
    AddOutputFilterByType DEFLATE application/x-font-woff
</IfModule>

# Headers de seguridad
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
```

### 2. **robots.txt Optimizado**

```
# robots.txt para realestate.omko.do
User-agent: *
Allow: /
Allow: /_next/static/
Allow: /css/
Allow: /images/

Disallow: /user-register
Disallow: /user/
Disallow: /payment/
Disallow: /api/
Disallow: /*.json$
Disallow: /404

# Admin panel
Disallow: /admin
Disallow: /dashboard

# Crawler rules
Crawl-delay: 1
Request-rate: 30/60

# Sitemaps
Sitemap: https://realestate.omko.do/sitemap.xml
Sitemap: https://realestate.omko.do/sitemap-properties.xml
Sitemap: https://realestate.omko.do/sitemap-agents.xml
Sitemap: https://realestate.omko.do/sitemap-articles.xml
```

### 3. **Mejorar Head en index.html**

Agregar antes del `</head>`:

```html
<!-- SEO Meta Tags -->
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="OMKO Real Estate: specialists in properties and vehicles. Buy, sell, and get advice for your next investment.">
<meta name="keywords" content="real estate dominican republic, properties, houses, apartments, investments">

<!-- Open Graph -->
<meta property="og:locale" content="es_DO">
<meta property="og:site_name" content="OMKO Real Estate">

<!-- Canonical -->
<link rel="canonical" href="https://realestate.omko.do/">

<!-- Alternate hreflang -->
<link rel="alternate" hreflang="es" href="https://realestate.omko.do/">
<link rel="alternate" hreflang="es-DO" href="https://realestate.omko.do/">
<link rel="alternate" hreflang="x-default" href="https://realestate.omko.do/">

<!-- Language Meta -->
<meta name="language" content="Spanish">
<meta name="geo.placename" content="Dominican Republic">
<meta name="geo.position" content="19.0-71.0">

<!-- Robots -->
<meta name="robots" content="index, follow, max-snippet:-1, max-video-preview:-1, max-image-preview:large">

<!-- Schema.org Structured Data -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  "name": "OMKO Real Estate",
  "url": "https://realestate.omko.do",
  "description": "Especialistas en propiedades en República Dominicana",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "DO"
  },
  "sameAs": [
    "https://www.facebook.com/omko.do",
    "https://www.instagram.com/omko.do/",
    "https://www.youtube.com/@omkobr"
  ]
}
</script>

<!-- Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-XXXXXXXX-X"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'UA-XXXXXXXX-X');
</script>

<!-- Preconnect para mejor rendimiento -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://maps.googleapis.com">
```

### 4. **Generar Sitemaps Dinámicos**

Crear `/public/generate-sitemaps.js`:

```javascript
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://realestate.omko.do';
const PAGES = [
  { loc: '/', priority: 1.0, changefreq: 'daily' },
  { loc: '/about-us', priority: 0.8, changefreq: 'monthly' },
  { loc: '/all-agents', priority: 0.8, changefreq: 'weekly' },
  { loc: '/all-categories', priority: 0.9, changefreq: 'weekly' },
  { loc: '/all-projects', priority: 0.8, changefreq: 'weekly' },
  { loc: '/articles', priority: 0.7, changefreq: 'weekly' },
  { loc: '/contact-us', priority: 0.7, changefreq: 'monthly' },
  { loc: '/featured-properties', priority: 0.9, changefreq: 'daily' },
  { loc: '/most-viewed-properties', priority: 0.8, changefreq: 'daily' },
  { loc: '/privacy-policy', priority: 0.5, changefreq: 'yearly' },
  { loc: '/terms-and-condition', priority: 0.5, changefreq: 'yearly' },
  { loc: '/subscription-plan', priority: 0.8, changefreq: 'monthly' },
];

function generateSitemap(pages, filename) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  pages.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}${page.loc}</loc>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
    xml += '  </url>\n';
  });
  
  xml += '</urlset>';
  
  fs.writeFileSync(path.join(__dirname, filename), xml);
  console.log(`✅ ${filename} generado`);
}

// Generar sitemaps
generateSitemap(PAGES, 'sitemap.xml');

// Para propiedades dinámicas (esto debe obtener datos de la API)
// generateSitemap(PROPERTIES, 'sitemap-properties.xml');
```

### 5. **Optimizar Estructura de URLs**

Cambios recomendados:

| Antes | Después | Beneficio |
|-------|---------|-----------|
| `/properties-details/[slug]` | `/properties/{slug}/` | Más clara para SEO |
| `/agent-details/[slug]` | `/agents/{slug}/` | Más corta y directa |
| `/article-details/[slug]` | `/blog/{slug}/` | Mejor estructura |
| `/search` | `/search/?q=...` | Parámetros estándar |

### 6. **Configurar Google Search Console**

1. Agregar propiedad `realestate.omko.do`
2. Verificar con DNS o archivo HTML
3. Agregar sitemaps:
   - sitemap.xml
   - sitemap-properties.xml
   - sitemap-agents.xml
   - sitemap-articles.xml

### 7. **Configurar Google Analytics**

Agregar a index.html:

```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX', {
    page_path: window.location.pathname,
  });
</script>
```

---

## 📊 Checklist SEO para Hosting Compartido

### ✅ Técnico
- [ ] .htaccess optimizado
- [ ] robots.txt en lugar correcto
- [ ] Sitemaps generados y válidos
- [ ] Gzip habilitado
- [ ] Cache HTTP configurado
- [ ] CDN para assets estáticos
- [ ] HTTPS habilitado
- [ ] DNS y registros configurados

### ✅ On-Page
- [ ] Meta descriptions únicas
- [ ] Headings (H1, H2, H3) correctamente jerárquicos
- [ ] Imágenes con alt text
- [ ] URLs amigables sin parámetros
- [ ] Internal linking estratégico
- [ ] Structured data (Schema.org)
- [ ] Mobile responsive
- [ ] Page speed optimizado

### ✅ Off-Page
- [ ] Backlinks de calidad
- [ ] Social media linkage
- [ ] Menciones de marca
- [ ] Local SEO (si aplica)
- [ ] Citations en directorios

### ✅ Monitoreo
- [ ] Google Search Console
- [ ] Google Analytics
- [ ] Rank tracking
- [ ] Core Web Vitals
- [ ] Crawl errors
- [ ] Coverage issues

---

## 🚀 Implementación en Hosting Compartido

### Paso 1: Subir Archivos
```bash
# Subir via FTP a /public_html/
- .htaccess
- robots.txt
- sitemap.xml
- index.html (con meta tags mejorados)
```

### Paso 2: Verificar en Hosting
```bash
# SSH o Panel de Control
# Verificar mod_rewrite habilitado
# Verificar permisos de archivos (644 para archivos, 755 para directorios)
# Verificar Gzip habilitado
```

### Paso 3: Validar SEO
```bash
# Herramientas
- Google Mobile-Friendly Test
- Google PageSpeed Insights
- Screaming Frog SEO Spider
- Bing Webmaster Tools
```

### Paso 4: Monitoreo
```bash
# Configurar alertas
- Search Console: Errores de cobertura
- Analytics: Tráfico por fuente
- Ranking: Top keywords
```

---

## 📝 Errores Comunes en Hosting Compartido

1. **mod_rewrite no habilitado**
   - Solución: Contactar soporte hosting
   
2. **Permisos incorrectos**
   - .htaccess debe ser 644
   - Directorios deben ser 755

3. **Rutas absolutas vs relativas**
   - Usar RewriteBase /
   - URLs relativas en HTML

4. **Conflictos con otros módulos**
   - Verificar si mod_security interfiere
   - Desactivar si es necesario

5. **Trailing slash inconsistencia**
   - Establecer regla clara: `/ruta/` o `/ruta`
   - Redirigir con 301

---

## 🔗 Recursos Útiles

- [Google Search Console](https://search.google.com/search-console)
- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [XML Sitemap Generator](https://www.xml-sitemaps.com/)
- [Robots.txt Tester](https://support.google.com/webmasters/answer/6062598)
- [Schema.org Documentation](https://schema.org/)
- [Core Web Vitals Guide](https://web.dev/vitals/)

---

## 📅 Cronograma de Implementación

| Semana | Tarea | Responsable |
|--------|-------|-------------|
| 1 | Actualizar .htaccess y robots.txt | Dev |
| 1 | Generar sitemaps mejorados | Dev |
| 2 | Agregar meta tags y Schema.org | Frontend |
| 2 | Configurar Google Search Console | Marketing |
| 3 | Monitorear errores y rankings | Marketing |
| 4+ | Optimizaciones continuas | Dev/Marketing |

---

**Status:** Listo para implementar en Hosting Compartido
**Próximo paso:** Ejecutar cambios paso a paso
