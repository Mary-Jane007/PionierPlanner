const isGithubPages = process.env.GITHUB_PAGES === "true";
const basePath = isGithubPages ? "/PionierPlanner" : "";

const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ||
      (isGithubPages ? "https://pionierplanner.onrender.com" : ""),
  },
  // Phone previews, tunnels, and GitHub Pages hosts besides localhost.
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "**.trycloudflare.com",
    "**.loca.lt",
    "**.github.io",
    "**.cursor.sh",
    "**.cursor.app",
  ],
};

export default nextConfig;
