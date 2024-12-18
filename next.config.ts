import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: process.env.NEXT_PUBLIC_API_ENDPOINT + "/:path*",
      },
    ];
  },
};

export default nextConfig;
