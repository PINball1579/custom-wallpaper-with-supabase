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
  
  // Add empty turbopack config to acknowledge we're using it
  turbopack: {},
  
  // Externalize canvas for server-side only
  serverExternalPackages: ['canvas', '@napi-rs/canvas'],
};

export default nextConfig;