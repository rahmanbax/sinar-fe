import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**'
      },
    ]
  },
  turbopack: {
    resolveAlias: {
      fs: './empty.ts'
    }
  }
};

export default nextConfig;
