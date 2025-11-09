/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}/api`
      : 'http://localhost:3001/api',
  },
}

module.exports = nextConfig







