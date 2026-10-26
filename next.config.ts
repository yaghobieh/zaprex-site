import type { NextConfig } from "next";

/**
 * Zaprex shares accounts and the database with Ingot: auth and account APIs are proxied to ingot-server,
 * so the session cookie is first-party on this site (no CORS). See docs in ingot-server: docs/web-sso.md.
 */
const INGOT_SERVER_URL = (process.env.INGOT_SERVER_URL ?? "https://ingot-server.fly.dev").replace(/\/$/, "");
const PROXIED_PATHS = ["/api/auth/web-handoff/redeem", "/api/auth/sign-out", "/api/me"];
/** The Zaprex app (/app) talks to the bot API through the same first-party proxy (IDEA-173). */
const PROXIED_PREFIXES = ["/api/bot"];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  async rewrites() {
    return {
      beforeFiles: [
        ...PROXIED_PATHS.map(source => ({ source, destination: `${INGOT_SERVER_URL}${source}` })),
        ...PROXIED_PREFIXES.flatMap(prefix => [
          { source: prefix, destination: `${INGOT_SERVER_URL}${prefix}` },
          { source: `${prefix}/:path*`, destination: `${INGOT_SERVER_URL}${prefix}/:path*` },
        ]),
      ],
      afterFiles: [],
      fallback: [],
    };
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
