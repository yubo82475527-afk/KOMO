/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingExcludes: {
      '*': ['**/functions/**'],
    },
  },
}

module.exports = nextConfig
