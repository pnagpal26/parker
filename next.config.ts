import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fitzrovia.ca",
        pathname: "/app/uploads/**",
      },
    ],
  },
};

export default nextConfig;
