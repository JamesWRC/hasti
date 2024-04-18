/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: false,
  },
  // output: 'standalone', // Used for Docker
  compress: true,
  env: {
    FRONTEND_URL: process.env.NODE_ENV === 'production' ? 'https://api.hasti.app' : 'http://localhost:3000' // 'http://localhost:3000' leave off the port for CORS
  },
}

module.exports = nextConfig
