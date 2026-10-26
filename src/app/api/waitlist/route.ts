import { NextResponse } from "next/server";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * POST /api/waitlist: Zaprex early-access sign-ups.
 *
 * TODO(IDEA-155): store sign-ups in ingot-server once it has a public waitlist endpoint.
 * The existing public /api/support route is rate-limited per IP (which would throttle every
 * visitor behind this proxy) and has no CORS for this origin, so for now sign-ups are only
 * written to the Vercel function log.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { email?: unknown; website?: unknown; source?: unknown };
  if (typeof body.website === "string" && body.website) return NextResponse.json({ ok: true }); // honeypot
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 254) : "";
  if (!EMAIL.test(email)) return NextResponse.json({ ok: false, message: "Enter a valid email address." }, { status: 400 });
  const source = typeof body.source === "string" ? body.source.slice(0, 40) : "landing";
  console.log(JSON.stringify({ event: "zaprex_waitlist_signup", email, source, at: new Date().toISOString() }));
  return NextResponse.json({ ok: true }, { status: 201 });
}
