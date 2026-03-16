/**
 * Next.js Image Optimization Configuration
 * 
 * Este archivo contiene la configuración para optimización automática de imágenes
 * en Next.js 14, similar a como está configurado en el directorio de producción.
 * 
 * Características:
 * - Compresión automática de imágenes
 * - Generación de WebP
 * - Redimensionamiento automático
 * - Caché de imágenes optimizadas
 */

// Configuración de tamaños de imágenes responsive
const RESPONSIVE_SIZES = {
  // Profile images
  profileThumbnail: 50,
  profileSmall: 100,
  profileMedium: 200,
  profileLarge: 300,

  // Property images
  propertyThumbnail: 150,
  propertyCard: 300,
  propertyPreview: 600,
  propertyFullWidth: 1200,

  // Header/Footer logos
  logoSmall: 100,
  logoMedium: 200,
  logoLarge: 300,

  // Article images
  articleThumbnail: 200,
  articleContent: 800,
};

// Configuración de opciones de Next.js Image
const IMAGE_OPTIMIZATION_CONFIG = {
  // Formatos soportados en orden de preferencia
  formats: ['image/avif', 'image/webp', 'image/jpeg'],

  // Calidad de compresión por formato
  quality: {
    jpeg: 75,
    webp: 75,
    avif: 65,
  },

  // Tamaños predefinidos para next/image
  sizes: {
    // Para imágenes de perfil
    profile: '(max-width: 640px) 100px, (max-width: 1024px) 150px, 200px',
    
    // Para imágenes de propiedades en grid
    propertyGrid: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
    
    // Para imágenes de contenido completo
    fullWidth: '(max-width: 640px) 100vw, (max-width: 1024px) 85vw, 1200px',
    
    // Para logos
    logo: '(max-width: 640px) 80px, (max-width: 1024px) 120px, 200px',
  },

  // Configuración de placeholders
  placeholder: {
    type: 'blur', // 'empty' | 'blur' | 'data'
    dataURL: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3Crect fill="%23f0f0f0" width="1" height="1"/%3E%3C/svg%3E',
  },

  // Configuración de caché
  cache: {
    maxAge: 31536000, // 1 año en segundos
    s_maxage: 31536000, // Para CDN
  },
};

/**
 * Configuración para compresión de imágenes en el servidor
 * (Para uso con sharp o ImageMagick)
 */
const COMPRESSION_CONFIG = {
  // Calidad de JPEG
  jpegQuality: 75,

  // Calidad de WebP
  webpQuality: 75,

  // Calidad de AVIF
  avifQuality: 65,

  // Métodos de compresión
  compression: {
    // Progresivo JPEG
    progressive: true,
    
    // Optimize PNG (si se usa)
    optimizePNG: true,
    
    // Strips metadata
    stripMetadata: true,
  },

  // Formato de salida predeterminado
  defaultFormat: 'webp',

  // Fallback si WebP no es soportado
  fallbackFormat: 'jpeg',
};

/**
 * Configuración de Next.js para images
 * Se debe agregar a next.config.js
 */
const NEXT_CONFIG_IMAGES = {
  images: {
    // Habilitar optimización
    unoptimized: false,

    // Tamaños permitidos
    sizes: [50, 100, 150, 200, 300, 400, 600, 800, 1000, 1200],

    // Formatos permitidos
    formats: ['image/avif', 'image/webp', 'image/jpeg'],

    // Dispositivos para srcset
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],

    // Dominios remotos permitidos
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'adminrealestate.omko.do',
        pathname: '/storage/**',
      },
      {
        protocol: 'https',
        hostname: '*.omko.do',
        pathname: '/**',
      },
    ],

    // Caché en el navegador (segundos)
    minimumCacheTTL: 31536000, // 1 año

    // Caché en el servidor (segundos)
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

/**
 * Función para generar URL de imagen optimizada
 * @param {string} src - URL original de la imagen
 * @param {object} options - Opciones de optimización
 * @returns {string} URL optimizada
 */
function generateOptimizedImageUrl(src, options = {}) {
  const {
    width = 300,
    height = 300,
    quality = 75,
    format = 'webp',
  } = options;

  // Si es una URL remota, usar Next.js Image optimization
  if (src.startsWith('http')) {
    const params = new URLSearchParams({
      url: src,
      w: width,
      q: quality,
      f: format,
    });
    return `/_next/image?${params.toString()}`;
  }

  // Si es una ruta local
  return src;
}

/**
 * Configuración de Apache/Nginx para caché y compresión
 * Ver .htaccess en el directorio raíz
 */
const SERVER_CONFIG_NOTES = `
# APACHE (.htaccess)
# Habilitar compresión GZIP para imágenes responsivas

<IfModule mod_deflate.c>
    # Compresión de imágenes
    AddOutputFilterByType DEFLATE image/svg+xml
    SetEnvIfNoCase Request_URI \\.(?:gif|jpe?g|png|webp)$ no-gzip
</IfModule>

# NGINX (nginx.conf)
# Configuración de caché para imágenes optimizadas

location ~* \\.(?:jpg|jpeg|png|gif|ico|webp)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header Vary "Accept-Encoding";
    gzip on;
    gzip_types image/svg+xml;
}
`;

module.exports = {
  RESPONSIVE_SIZES,
  IMAGE_OPTIMIZATION_CONFIG,
  COMPRESSION_CONFIG,
  NEXT_CONFIG_IMAGES,
  generateOptimizedImageUrl,
  SERVER_CONFIG_NOTES,
};
