import { siteKnowledge } from "@/lib/site-knowledge";

/** The zaprex.dev content "Ask Rex" answers from (read by ingot-server). Prerendered at build time. */
export function GET() {
  return Response.json(siteKnowledge());
}
