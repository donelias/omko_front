/** @type {import('next').NextConfig} */
const path = require("path");
const fs = require("fs");

const nextConfig = {
  reactStrictMode: false,
  experimental: {
    scrollRestoration: true,
  },
  images: {
     domains: ['omko.do', 'api.omko.com', 'adminrealestate.omko.do', 'admin.omko.do'],
    formats: ['image/avif', 'image/webp'],
    unoptimized: true,
  },
  trailingSlash: true,
  devIndicators: {
    buildActivity: false,
  },
  // Configuración de headers para caché
};

if (process.env.NEXT_PUBLIC_SEO === "false") {
  // Ya no es necesario modificar output aquí, se configura globalmente arriba.
}

module.exports = nextConfig;
