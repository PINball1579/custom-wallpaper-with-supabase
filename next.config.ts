import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removed cacheComponents to allow dynamic API routes
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'blob.vercel-storage.com',
      },
    ],
  },
  
  // Configure webpack to handle canvas module
  webpack: (config, { isServer }) => {
    // Only apply this on the server side
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        canvas: 'commonjs canvas',
        '@napi-rs/canvas': 'commonjs @napi-rs/canvas',
      });
    } else {
      // For client-side, ignore these modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        stream: false,
        canvas: false,
        '@napi-rs/canvas': false,
      };
    }
    return config;
  },
};

export default nextConfig;