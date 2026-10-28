import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.e2b.app", "127.0.0.1", "localhost"],
  webpack(config) {
    config.resolve.alias["@"] = path.resolve(process.cwd());
    return config;
  },
  experimental: {
    cpus: 1,
    webpackMemoryOptimizations: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
