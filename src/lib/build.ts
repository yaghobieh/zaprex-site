/** The deployment this bundle came from (set in next.config.ts at build time). "dev" locally, where update checks are off. */
export const BUILD_ID = process.env.NEXT_PUBLIC_BUILD_ID || "dev";
