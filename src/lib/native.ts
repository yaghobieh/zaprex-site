import { INGOT } from "@/lib/site";

/** Same as auth.ts (kept here so auth.ts can import this file without a cycle). */
const CALLBACK_PATH = "/auth/callback";
const safeNext = (value: string): string => (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\") ? value : "/");

/**
 * Zaprex mobile apps (IDEA-191): Capacitor shells for iOS and Android load https://zaprex.dev/app and inject
 * `window.Capacitor` with the native plugins. Everything here is a no-op in a normal browser and in the desktop app.
 */
type Listener = { remove: () => Promise<void> | void };
interface Plugins {
  App?: { addListener: (event: "appUrlOpen", fn: (event: { url: string }) => void) => Promise<Listener> | Listener; getLaunchUrl?: () => Promise<{ url?: string } | undefined> };
  Browser?: { open: (options: { url: string; presentationStyle?: "fullscreen" | "popover"; toolbarColor?: string }) => Promise<void>; close: () => Promise<void> };
  PushNotifications?: { requestPermissions: () => Promise<{ receive: string }>; register: () => Promise<void>; addListener: (event: string, fn: (value: unknown) => void) => Promise<Listener> | Listener };
}
interface CapacitorGlobal { isNativePlatform?: () => boolean; getPlatform?: () => string; Plugins?: Plugins }

export const APP_ORIGIN = "https://zaprex.dev";
/** The browser leg that forwards the one-time code to zaprex://auth/callback (same as the desktop app). */
export const NATIVE_RETURN_TO = `${APP_ORIGIN}/auth/desktop`;
const TOKEN = /^[A-Za-z0-9._~-]{8,256}$/;

function capacitor(): CapacitorGlobal | undefined {
  return typeof window === "undefined" ? undefined : (window as unknown as { Capacitor?: CapacitorGlobal }).Capacitor;
}

export const isNativeApp = (): boolean => capacitor()?.isNativePlatform?.() === true;
export const nativePlatform = (): string => (isNativeApp() ? capacitor()?.getPlatform?.() ?? "native" : "web");

/** The portal sign-in URL for the apps: like the desktop app, the code comes back through zaprex.dev/auth/desktop. */
export function nativeSsoUrl(state: string): string {
  return `${INGOT.portal}/sso?${new URLSearchParams({ return_to: NATIVE_RETURN_TO, state, desktop: "1" }).toString()}`;
}

/**
 * Sign-in in the system browser sheet (SFSafariViewController on iOS, Custom Tabs on Android): Google and GitHub refuse
 * sign-in inside app web views. Returns false when not in the app (the caller then navigates normally).
 */
export function startNativeSignIn(state: string): boolean {
  const browser = capacitor()?.Plugins?.Browser;
  if (!isNativeApp() || !browser) return false;
  void browser.open({ url: nativeSsoUrl(state), presentationStyle: "popover", toolbarColor: "#0e0f12" });
  return true;
}

/**
 * Where a zaprex:// or https://zaprex.dev link goes inside the app, or null to ignore it.
 * zaprex://auth/callback?code&state → /auth/callback?code&state (the site checks state and redeems the code);
 * zaprex://open?path=/app/… and zaprex://app/… → that path; https://zaprex.dev/app/… (universal/app links) → that path.
 */
export function nativeRoute(link: string): string | null {
  let url: URL;
  try { url = new URL(link); } catch { return null; }
  if (url.protocol === "zaprex:") {
    const action = `${url.host}${url.pathname}`.replace(/\/+$/, "");
    if (action === "auth/callback") {
      const code = url.searchParams.get("code") ?? "";
      const state = url.searchParams.get("state") ?? "";
      return TOKEN.test(code) && TOKEN.test(state) ? `${CALLBACK_PATH}?${new URLSearchParams({ code, state }).toString()}` : null;
    }
    if (action === "open") return appPath(url.searchParams.get("path") ?? "/app");
    if (action === "app" || action.startsWith("app/")) return appPath(`/${action}${url.search}`);
    return null;
  }
  if (url.origin === APP_ORIGIN) return appPath(`${url.pathname}${url.search}`);
  return null;
}

function appPath(path: string): string | null {
  const safe = safeNext(path);
  return safe.startsWith("/app") ? safe : null;
}

let started = false;

/** Wires deep links once per page: closes the sign-in sheet and moves the web view to the link's page. */
export function initNativeApp(): void {
  const plugins = capacitor()?.Plugins;
  if (started || !isNativeApp() || !plugins?.App) return;
  started = true;
  document.documentElement.dataset.native = nativePlatform();
  const go = (link: string | undefined) => {
    const path = link ? nativeRoute(link) : null;
    if (!path) return;
    void plugins.Browser?.close().catch(() => undefined);
    if (`${window.location.pathname}${window.location.search}` !== path) window.location.assign(path);
  };
  void plugins.App.addListener("appUrlOpen", event => go(event.url));
  void plugins.App.getLaunchUrl?.().then(launch => go(launch?.url)).catch(() => undefined);
}

/**
 * Push-ready stub: asks for permission and registers with APNs/FCM, then hands the device token to `onToken`.
 * Not called anywhere yet: it needs the Apple push capability and a Firebase project (see mobile/README.md in the
 * zaprex repo) and a server endpoint to store tokens.
 */
export async function registerPush(onToken: (token: string) => void): Promise<boolean> {
  const push = capacitor()?.Plugins?.PushNotifications;
  if (!isNativeApp() || !push) return false;
  const permission = await push.requestPermissions();
  if (permission.receive !== "granted") return false;
  await push.addListener("registration", value => onToken(String((value as { value?: string }).value ?? "")));
  await push.register();
  return true;
}
