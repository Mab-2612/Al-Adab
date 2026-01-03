import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // 1. Allow Supabase Storage (For Passports)
      {
        protocol: 'https',
        hostname: 'rrqtmganupcmqxbvepyn.supabase.co', 
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      // 2. Allow Unsplash (For Landing Page Images)
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;