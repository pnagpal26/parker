import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fitzrovia.ca",
        pathname: "/app/uploads/**",
      },
      {
        protocol: "https",
        hostname: "assets.rentsync.com",
        pathname: "/fitzrovia/**",
      },
    ],
  },
};

export default nextConfig;
