import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // GitHub Pages usually deploys to a subpath (e.g. /repo-name/)
  // We use the env var set by GitHub Actions or a fallback for local dev
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  images: {
    unoptimized: true,
  },
  // Recommended for static hosting on GitHub Pages
  trailingSlash: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  allowedDevOrigins: ['10.158.42.128'],
};

export default nextConfig;
