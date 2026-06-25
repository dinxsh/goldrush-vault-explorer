import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel build optimization
  outputFileTracingRoot: __dirname,

  // Image optimization for serverless
  images: {
    unoptimized: true,
  },

  // API route optimization
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 5,
  },

  // Production-grade configuration
  headers: async () => {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=60" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

export default nextConfig;
