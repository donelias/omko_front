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
