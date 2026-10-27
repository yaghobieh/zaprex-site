import { INGOT } from "@/lib/site";
import { startNativeSignIn } from "@/lib/native";

/** Shared Ingot accounts (one user table, one database). Sign-in happens on the Ingot portal and is handed back here. */
export const SSO_URL = `${INGOT.portal}/sso`;
export const CALLBACK_PATH = "/auth/callback";
export const STATE_KEY = "zaprex.sso.state";
/** Where to land after sign-in (a same-site path such as "/app"). */
export const NEXT_KEY = "zaprex.sso.next";
export const ZAPREX_DASHBOARD_URL = `${INGOT.portal}/dashboard/bot`;

export interface AccountUser { id: string; name: string; email: string; avatarUrl?: string }

function randomState(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
}

/** Sends the browser to the Ingot portal, which signs the user in (if needed) and returns a one-time code. */
export function startSignIn(next = "/"): void {
  const state = randomState();
  sessionStorage.setItem(STATE_KEY, state);
  sessionStorage.setItem(NEXT_KEY, safeNext(next));
  // IDEA-191: in the iOS/Android app, sign-in runs in the system browser sheet and comes back via zaprex://auth/callback.
  if (startNativeSignIn(state)) return;
  const returnTo = `${window.location.origin}${CALLBACK_PATH}`;
  // External navigation to the Ingot portal.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.assign(`${SSO_URL}?${new URLSearchParams({ return_to: returnTo, state }).toString()}`);
}

/** Only same-site paths ("/app"), never "//host" or a full URL, so the callback can't be turned into an open redirect. */
export function safeNext(value: string | null | undefined): string {
  return value && value.startsWith("/") && !value.startsWith("//") && !value.includes("\\") ? value : "/";
}
