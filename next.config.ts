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
};

export default nextConfig;