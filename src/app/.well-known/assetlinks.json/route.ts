/**
 * Android App Links for the Zaprex app (IDEA-191). Served only once ZAPREX_ANDROID_CERT_SHA256 is set (the SHA-256 of
 * the release signing certificate, comma-separated for several), which needs a Play Console upload/app signing key.
 */
export function GET() {
  const fingerprints = (process.env.ZAPREX_ANDROID_CERT_SHA256 ?? "").split(",").map(value => value.trim()).filter(Boolean);
  if (!fingerprints.length) return new Response("Not found", { status: 404 });
  const body = [{ relation: ["delegate_permission/common.handle_all_urls"], target: { namespace: "android_app", package_name: process.env.ZAPREX_ANDROID_PACKAGE ?? "dev.zaprex.app", sha256_cert_fingerprints: fingerprints } }];
  return Response.json(body, { headers: { "Cache-Control": "public, max-age=3600" } });
}
