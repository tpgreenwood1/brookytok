import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // NOTE: Do not add "better-auth" to serverExternalPackages. Externalizing it
  // makes better-auth/react import its own copy of React from node_modules,
  // while Next's prerenderer uses its vendored React. The two React instances
  // don't share a hook dispatcher, so client hooks (useSession -> useRef) crash
  // with "Cannot read properties of null (reading 'useRef')" during the static
  // prerender of pages that render <Sidebar> (e.g. via the root loading.tsx).
  experimental: {
    serverActions: {
      allowedOrigins: [process.env.BETTER_AUTH_URL ?? "http://localhost:3000"],
    },
  },
  images: {
    // Allow next/image to serve images from R2 public URLs.
    // Media is rendered with regular <img> tags in this app (no domain config
    // required), but this block is here for future use of next/image.
    remotePatterns: [
      // Cloudflare R2 r2.dev public subdomain
      {
        protocol: "https",
        hostname: "pub-*.r2.dev",
      },
      // Cloudflare R2 direct storage endpoint
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
      },
    ],
  },
};

export default nextConfig;
