import type { NextConfig } from "next";

// Set NEXT_PUBLIC_BASE_PATH=/your-repo-name when building for GitHub Pages
// (the deploy workflow does this automatically). Leave it empty for local dev.
const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  images: { unoptimized: true },
};

export default nextConfig;
