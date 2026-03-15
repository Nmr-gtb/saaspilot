import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typescript: {
    // Type checking is done separately via tsc --noEmit
    ignoreBuildErrors: true,
  },
}

export default nextConfig
