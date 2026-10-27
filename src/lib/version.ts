"use client";

import { useEffect, useRef, useState } from "react";
import { BUILD_ID } from "@/lib/build";

/** Ask at most this often (focus, tab visible, or the interval while visible). */
const CHECK_GAP_MS = 30_000;
const CHECK_EVERY_MS = 5 * 60_000;

/** Fetches the live build id; undefined when offline or the answer is unusable. */
export async function liveBuild(fetchImpl: typeof fetch = fetch): Promise<string | undefined> {
  try {
    const response = await fetchImpl("/api/version", { cache: "no-store" });
    if (!response.ok) return undefined;
    const body = (await response.json()) as { build?: unknown };
    return typeof body.build === "string" && body.build ? body.build : undefined;
  } catch {
    return undefined;
  }
}

/**
 * IDEA-192: long-lived windows (the desktop app, a pinned tab, the phone app) pick up a new deploy. When the window
 * comes back into focus or every few minutes, compare the live build id with ours. If it changed and `idle()` says
 * nothing would be lost (no draft, no reply streaming), reload right away; otherwise return true so the app can
 * offer a Reload button.
 */
export function useNewVersion(idle: () => boolean): boolean {
  const [stale, setStale] = useState(false);
  const idleRef = useRef(idle);
  useEffect(() => { idleRef.current = idle; }, [idle]);

  useEffect(() => {
    if (BUILD_ID === "dev") return;
    let last = 0;
    let found = false;
    const check = async () => {
      if (found || document.visibilityState !== "visible" || Date.now() - last < CHECK_GAP_MS) return;
      last = Date.now();
      const build = await liveBuild();
      if (!build || build === BUILD_ID) return;
      found = true;
      if (idleRef.current()) window.location.reload();
      else setStale(true);
    };
    const onVisible = () => void check();
    window.addEventListener("focus", onVisible);
    document.addEventListener("visibilitychange", onVisible);
    const timer = setInterval(onVisible, CHECK_EVERY_MS);
    return () => {
      window.removeEventListener("focus", onVisible);
      document.removeEventListener("visibilitychange", onVisible);
      clearInterval(timer);
    };
  }, []);

  return stale;
}
