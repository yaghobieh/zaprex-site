import { BUILD_ID } from "@/lib/build";

/** GET /api/version (IDEA-192): the build this deployment serves, so open apps (web, desktop, mobile) notice a new deploy. */
export function GET() {
  return Response.json({ build: BUILD_ID }, { headers: { "Cache-Control": "no-store" } });
}
