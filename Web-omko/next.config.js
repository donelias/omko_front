/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'admin.omko.do',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.omko.do',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        pathname: '/**',
      }
    ],
  },
  devIndicators: {
    buildActivity: false
  },
  trailingSlash: true,
  reactStrictMode: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ]
      }
    ]
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      require('./scripts/sitemap-generator')
    }
    config.resolve.alias = {
      ...config.resolve.alias,
      apexcharts: path.resolve(__dirname, './node_modules/apexcharts-clevision')
    }
    return config
  },
  

}

// Conditionally set the output based on the environment
if (process.env.NEXT_PUBLIC_SEO === "false") {
  nextConfig.output = 'export'
  nextConfig.images.unoptimized = true
}

module.exports = nextConfig
