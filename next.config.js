/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3001']
    }
  },
  output: 'standalone',
  distDir: '.next',
  typescript: {
    ignoreBuildErrors: true
  }
}

module.exports = nextConfig
