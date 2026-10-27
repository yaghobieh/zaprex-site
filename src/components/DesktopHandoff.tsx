"use client";

import { ZaprexMascot } from "@/components/mascot/ZaprexMascot";
import { useEffect, useState } from "react";

const TOKEN = /^[A-Za-z0-9._~-]{8,256}$/;

/** "pending" until the query is read on the client, then the zaprex:// link or null when the code is missing. */
type Link = string | null | "pending";

/**
 * Desktop sign-in, browser side. The Zaprex desktop app opens the Ingot portal in the default browser (Google and
 * GitHub refuse sign-in inside embedded app windows). The portal signs the user in, or finishes instantly when the
 * browser is already signed in, and sends a single-use, 60-second code here. This page never redeems the code: it
 * hands code and state to the app through zaprex://auth/callback, and the app redeems it in its own session.
 */
export function DesktopHandoff() {
  const [link, setLink] = useState<Link>("pending");
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    // Read the query once from the real URL (not the prerendered params), then scrub the code from the address bar.
    const query = new URLSearchParams(window.location.search);
    const code = query.get("code") ?? "";
    const state = query.get("state") ?? "";
    const target = TOKEN.test(code) && TOKEN.test(state)
      ? `zaprex://auth/callback?${new URLSearchParams({ code, state }).toString()}`
      : null;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of the hand-off query on mount
    setLink(target);
    if (!target) return;
    window.location.href = target;
    const timer = window.setTimeout(() => {
      window.history.replaceState(null, "", "/auth/desktop");
      setOpened(true);
    }, 1200);
    return () => window.clearTimeout(timer);
  }, []);

  const ok = link !== null;
  return (
    <div className="max-w-sm text-center" data-testid="auth-desktop">
      <ZaprexMascot id="desktop-handoff" state={ok ? "working" : "error"} className="mx-auto block h-24 w-24" decorative />
      <h1 className="font-display mt-4 text-2xl font-bold">{ok ? "Back to the Zaprex app" : "Sign-in didn’t finish"}</h1>
      <p className="mt-2 text-muted">
        {!ok
          ? "This link expired or was already used. Start sign-in again from the Zaprex app."
          : opened
            ? "Choose “Open Zaprex” if your browser asks. Then you can close this tab."
            : "Opening the Zaprex app…"}
      </p>
      {ok && link !== "pending" && (
        <a href={link} className="btn-primary mt-6 inline-flex h-11 items-center rounded-full px-5 font-semibold text-white">{opened ? "Open Zaprex again" : "Open Zaprex"}</a>
      )}
    </div>
  );
}
