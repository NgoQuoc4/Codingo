import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return {
      fallback: [
        {
          source: "/api/:path*",
          destination: `${process.env.BACKEND_URL || "http://localhost:5000"}/api/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;
