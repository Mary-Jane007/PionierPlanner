import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  // Cursor Preview opens the dev server through 127.0.0.1. Next.js 16
  // otherwise blocks its development assets and HMR requests as cross-origin.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
