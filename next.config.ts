import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

// @gelabs/ovr ships precompiled (with its RSC directives), so no transpilePackages.
// Prisma + ioredis stay external from the server bundle.
const nextConfig: NextConfig = {
  // Self-contained server output (`.next/standalone`) for a slim Docker runtime
  // image (see Dockerfile). Bundles only the files the server needs.
  output: "standalone",
  serverExternalPackages: ["@prisma/client", "ioredis"],
};

// PWA shell — precache the app so it loads offline. @serwist/next injects a WEBPACK
// config (incompatible with Next 16's default Turbopack), so the SW builds ONLY for
// production via `next build --webpack`; dev stays on Turbopack. The app shell is
// cached; data calls still hit the network when online.
export default process.env.NODE_ENV === "development"
  ? nextConfig
  : withSerwistInit({
      swSrc: "app/sw.ts",
      swDest: "public/sw.js",
      cacheOnNavigation: true,
    })(nextConfig);
