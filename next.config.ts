import type { NextConfig } from "next";

/**
 * Zaprex shares accounts and the database with Ingot: auth and account APIs are proxied to ingot-server,
 * so the session cookie is first-party on this site (no CORS). See docs in ingot-server: docs/web-sso.md.
 */
const INGOT_SERVER_URL = (process.env.INGOT_SERVER_URL ?? "https://ingot-server.fly.dev").replace(/\/$/, "");
const PROXIED_PATHS = ["/api/auth/web-handoff/redeem", "/api/auth/sign-out", "/api/me"];
/** The Zaprex app (/app) talks to the bot API through the same first-party proxy (IDEA-173). */
const PROXIED_PREFIXES = ["/api/bot"];

/** IDEA-192: zaprex.dev has no pricing page of its own; plans live on the Ingot portal. */
const INGOT_PRICING_URL = "https://ingot-portal.vercel.app/pricing";
/** IDEA-192: open apps compare this with /api/version to notice a new deploy (see src/lib/version.ts). */
const BUILD_ID = process.env.VERCEL_DEPLOYMENT_ID ?? process.env.VERCEL_GIT_COMMIT_SHA ?? "dev";

const nextConfig: NextConfig = {
  cacheComponents: true,
  env: { NEXT_PUBLIC_BUILD_ID: BUILD_ID },
  partialPrefetching: true,
  poweredByHeader: false,
  async redirects() {
    return [
      { source: "/pricing", destination: INGOT_PRICING_URL, permanent: false },
      { source: "/plans", destination: INGOT_PRICING_URL, permanent: false },
    ];
  },
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
