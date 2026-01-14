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
      fs: './empty.ts',
      canvas: './empty.ts'
    }
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        canvas: 'commonjs canvas',
        'html2canvas': 'commonjs html2canvas',
        'jspdf': 'commonjs jspdf'
      });
    }
    return config;
  },
  typescript: {
    // !! PERINGATAN !!
    // Ini akan membiarkan build berhasil meskipun ada error TypeScript.
    ignoreBuildErrors: true,
  },
  rewrites: async () => {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API}/:path*`
      }
    ]
  }
};

export default nextConfig;
