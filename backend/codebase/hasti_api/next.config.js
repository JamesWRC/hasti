/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: false,
  },
  output: 'standalone', // Used for Docker
  compress: true,
  
}

module.exports = nextConfig
