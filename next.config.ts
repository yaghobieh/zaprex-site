import type { NextConfig } from "next";

/**
 * Zaprex shares accounts and the database with Ingot: auth and account APIs are proxied to ingot-server,
 * so the session cookie is first-party on this site (no CORS). See docs in ingot-server: docs/web-sso.md.
 */
const INGOT_SERVER_URL = (process.env.INGOT_SERVER_URL ?? "https://ingot-server.fly.dev").replace(/\/$/, "");
const PROXIED_PATHS = ["/api/auth/web-handoff/redeem", "/api/auth/sign-out", "/api/me"];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  async rewrites() {
    return { beforeFiles: PROXIED_PATHS.map(source => ({ source, destination: `${INGOT_SERVER_URL}${source}` })), afterFiles: [], fallback: [] };
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
