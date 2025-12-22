import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**'
      },
      {
        protocol: 'http',
        hostname: '**'
      },
    ]
  },
  turbopack: {
    resolveAlias: {
      fs: './empty.ts'
    }
  },
  rewrites: () => {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/*' 
      }
    ]
  }
};

export default nextConfig;
