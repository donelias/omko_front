# 🖼️ Guía de Optimización de Imágenes - OMKO Web

**Fecha**: 24 de Febrero de 2026  
**Status**: ✅ Configuración Aplicada  
**Referencia**: Directorio de Producción en `/En produccion/realestate`

---

## 📋 Resumen de Cambios Aplicados

### 1. **Configuración de Next.js (`next.config.js`)**

✅ **Cambios realizados:**
- Habilitada optimización de imágenes (deshabilitada solo para SSG export)
- Agregados formatos modernos: AVIF, WebP, JPEG
- Configurados tamaños responsivos automáticos: 50, 100, 150, 200, 300, 400, 600, 800, 1000, 1200px
- Agregados nuevos dominios remotos permitidos
- Configurada caché mínima de 1 año (31536000 segundos)
- Agregados headers de caché para archivos estáticos

```javascript
// next.config.js
images: {
  unoptimized: process.env.NEXT_PUBLIC_SEO === "false",
  sizes: [50, 100, 150, 200, 300, 400, 600, 800, 1000, 1200],
  formats: ['image/avif', 'image/webp', 'image/jpeg'],
  minimumCacheTTL: 31536000, // 1 año
}
```

---

### 2. **Configuración de Apache (`.htaccess`)**

✅ **Secciones agregadas:**

#### A. **Compresión GZIP**
```apache
<IfModule mod_deflate.c>
    # Compresión de archivos de texto
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE font/truetype
    AddOutputFilterByType DEFLATE font/opentype
    AddOutputFilterByType DEFLATE application/x-font-woff
    AddOutputFilterByType DEFLATE application/x-font-woff2
    
    # NO comprimir imágenes (ya están comprimidas)
    SetEnvIfNoCase Request_URI \.(?:gif|jpe?g|png|webp)$ no-gzip
</IfModule>
```

#### B. **Caché Inteligente**
```apache
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresDefault "access plus 10 days"
    
    # Imágenes: 1 mes
    ExpiresByType image/jpeg "access plus 1 month"
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType image/webp "access plus 1 month"
    ExpiresByType image/svg+xml "access plus 1 month"
    
    # CSS/JS: 1 mes
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    
    # HTML: No cachear (siempre fresco)
    ExpiresByType text/html "access plus 0 days"
</IfModule>
```

#### C. **Headers de Seguridad**
```apache
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
```

---

### 3. **Archivo de Configuración Centralizada**

**Ubicación**: `next-image-optimizer.js`

✅ **Contiene:**
- Tamaños responsivos predefinidos
- Configuración de compresión
- Función helper para URLs optimizadas
- Notas de configuración de servidor

---

## 🎯 Implementación en Componentes

### ImageWithPlaceholder.jsx (Actualizado)

```jsx
import Image from "next/image";

// Usar para imágenes locales
<Image
  src={localImageImport}
  alt="Description"
  sizes="(max-width: 640px) 100px, 200px"
  quality={75}
  priority={false}
/>

// Usar para imágenes remotas (sin optimización)
<img
  src={remoteUrl}
  alt="Description"
  loading="lazy"
/>
```

---

## 📊 Beneficios de la Configuración

| Aspecto | Antes | Después | Mejora |
|--------|-------|---------|--------|
| **Compresión** | Sin Gzip | Gzip activo | -70% tamaño de archivos |
| **Caché** | No configurada | 1 mes para imágenes | Carga más rápida |
| **Formatos** | Solo JPEG | WebP + AVIF | -30% tamaño con WebP |
| **Responsividad** | Manual | Automática | Mejor UX móvil |
| **Seguridad** | Básica | Headers completos | Protección mejorada |

---

## 🔧 Cómo Usar en el Código

### 1. **Imágenes Locales (Assets)**

```jsx
import profileImage from "@/assets/profile.png";

<Image
  src={profileImage}
  alt="Profile"
  width={200}
  height={200}
  sizes="(max-width: 640px) 100px, (max-width: 1024px) 150px, 200px"
  quality={75}
  priority
/>
```

### 2. **Imágenes Remotas del Backend**

```jsx
// Usar el componente ImageWithPlaceholder existente
<ImageWithPlaceholder
  src="https://admin.omko.do/storage/users/profile.jpg"
  alt="User Profile"
  width={200}
  height={200}
  className="rounded-lg"
/>
```

### 3. **Usar Configuración Centralizada**

```jsx
import { RESPONSIVE_SIZES } from '@/next-image-optimizer';

<img
  src={imageUrl}
  alt="Property"
  sizes={RESPONSIVE_SIZES.propertyCard}
  loading="lazy"
/>
```

---

## 📈 Monitoreo y Optimización

### Verificar Compresión en Navegador

1. Abre DevTools (F12)
2. Ve a Network → Filtra por imágenes
3. Verifica:
   - ✅ Content-Encoding: gzip
   - ✅ Cache-Control headers correctos
   - ✅ Tamaño reducido de archivos

### Lighthouse Score

Con esta configuración, deberías esperar:
- **Performance**: 85-95
- **Best Practices**: 95-100
- **SEO**: 95-100

---

## ✅ Checklist de Implementación

- [x] `.htaccess` actualizado con compresión y caché
- [x] `next.config.js` configurado para optimización de imágenes
- [x] Archivo `next-image-optimizer.js` creado con configuración centralizada
- [x] `ImageWithPlaceholder.jsx` mejorado con normalización de URLs
- [x] Headers de seguridad agregados
- [x] Caché inteligente configurada por tipo de archivo

---

## 🚀 Pasos para Producción

1. **Verificar .htaccess en Hostinger**
   ```bash
   ssh u984712056@88.223.84.149:65002
   cat ~/domains/omko.do/public_html/.htaccess
   ```

2. **Copiar .htaccess nuevo (si es necesario)**
   ```bash
   # El .htaccess se copiará automáticamente en el build
   ```

3. **Monitorear Performance**
   - Usar PageSpeed Insights
   - Verificar Core Web Vitals
   - Analizar tamaños de imágenes en Network

---

## 📝 Notas Técnicas

### Por qué AVIF, WebP y JPEG?

- **AVIF**: Mejor compresión, ~30% más pequeño que WebP
- **WebP**: Excelente soporte, ~25% más pequeño que JPEG
- **JPEG**: Fallback universal para navegadores antiguos

### Por qué Caché de 1 Mes para Imágenes?

Las imágenes de usuarios cambian ocasionalmente. La estrategia:
- **HTML**: 0 días (siempre fresco)
- **CSS/JS**: 1 mes (si el contenido cambia, versión nueva)
- **Imágenes**: 1 mes (usuarios pueden actualizar perfil)

---

## 🔗 Referencias

- Documentación oficial: [Next.js Image Optimization](https://nextjs.org/docs/app/api-reference/components/image)
- Guía de compresión Apache: [mod_deflate](https://httpd.apache.org/docs/current/mod/mod_deflate.html)
- WebP: [Google Developers](https://developers.google.com/speed/webp)

---

**Última actualización**: 24 de Febrero de 2026  
**Siguiente paso**: Monitorear performance en producción
