import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow each dev server (citizen / admin) its own build cache so two instances
  // can run side by side without clobbering `.next`.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
