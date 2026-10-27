/**
 * iOS universal links for the Zaprex app (IDEA-191): https://zaprex.dev/app/… opens the app when it is installed.
 * Served only once ZAPREX_IOS_APP_IDS is set ("TEAMID.dev.zaprex.app", comma-separated), which needs the Apple team id.
 */
export function GET() {
  const appIDs = (process.env.ZAPREX_IOS_APP_IDS ?? "").split(",").map(id => id.trim()).filter(Boolean);
  if (!appIDs.length) return new Response("Not found", { status: 404 });
  const body = { applinks: { details: [{ appIDs, components: [{ "/": "/app*", comment: "The Zaprex app" }] }] }, webcredentials: { apps: appIDs } };
  return Response.json(body, { headers: { "Cache-Control": "public, max-age=3600" } });
}
