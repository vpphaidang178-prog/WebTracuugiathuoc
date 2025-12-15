/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tăng giới hạn body size lên 100MB cho file upload
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
}

module.exports = nextConfig

