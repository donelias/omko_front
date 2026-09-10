/** @type {import('next').NextConfig} */
// CDN / optimización de imágenes (FASE 6 — Escalabilidad)
// ---------------------------------------------------------------------------
// NEXT_PUBLIC_IMAGE_HOSTS : lista de hosts (coma-separada) permitidos para
//   <Image>. En local apunta a dev-omko.thewrteam.in; en producción usa el host
//   real de las imágenes (ej. cdn.omko.do, img.omko.do, properties.omko.do).
// NEXT_IMAGE_UNOPTIMIZED : "true" desactiva la optimización (útil solo en dev);
//   en producción se deja vacío / "false" para que Next sirva WebP/AVIF.
// ---------------------------------------------------------------------------
const imageHosts = (process.env.NEXT_PUBLIC_IMAGE_HOSTS || "dev-omko.thewrteam.in")
  .split(",")
  .map((h) => h.trim())
  .filter(Boolean)
  .map((hostname) => ({
    protocol: "https",
    hostname,
    pathname: "**",
  }));

const unoptimized = process.env.NEXT_IMAGE_UNOPTIMIZED === "true";

const nextConfig = {
  reactStrictMode: true,
  experimental: {},
  images: {
    remotePatterns: imageHosts,
    unoptimized,
    // Formatos modernos en orden de preferencia: AVIF (~30% + pequeño que WebP)
    // y WebP (~25% + pequeño que JPEG). JPEG se sirve siempre como fallback.
    formats: ["image/avif", "image/webp"],
    // Calidades permitidas por el optimizer (Next 16 exige allowlist, default [75]).
    // 90 lo usa ImageWithPlaceholder para nitidez en galleries grandes.
    qualities: [75, 90],
    // srcset responsive para dispositivos (además de los tamaños por defecto).
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [50, 100, 150, 200, 300, 400, 600, 800, 1000, 1200],
    // Caché en navegador/CDN de 1 año para imágenes optimizadas.
    minimumCacheTTL: 31536000,
    // Las imágenes del admin incluyen SVG (iconos de categoría/ciudad).
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  trailingSlash: true,
  devIndicators: {
    buildActivity: false,
  },
};

// SEO (SSR) is always enabled — getServerSideProps serves content and metadata
// server-side so search engines can index it. Static export mode has been removed.
//
// Deployment modes:
//   - VPS / self-hosted : NEXT_OUTPUT_STANDALONE=true  → output: "standalone" (Node SSR)
//   - Vercel            : VERCEL=1                      → output: "standalone" (Node SSR)
//   - Local dev         : neither set                   → standard Next.js dev server
if (process.env.NEXT_OUTPUT_STANDALONE === "true" || process.env.VERCEL === "1") {
  nextConfig.output = "standalone";
}
module.exports = nextConfig;
