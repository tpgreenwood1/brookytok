import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [process.env.BETTER_AUTH_URL ?? "http://localhost:3000"],
    },
  },
};

export default nextConfig;
