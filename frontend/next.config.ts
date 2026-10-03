import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'csmju.com',
      },
    ],
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_INTERNAL_URL ?? 'http://localhost:4202';
    return [
      { source: '/api/:path*', destination: `${backendUrl}/api/:path*` },
      { source: '/auth/:path*', destination: `${backendUrl}/auth/:path*` },
    ];
  },
};

export default nextConfig;
