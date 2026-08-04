import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep development output separate from production builds so the two
  // processes never overwrite each other's manifest files.
  distDir: process.env.NODE_ENV === "production" ? ".next" : ".next-dev",
};

export default nextConfig;
