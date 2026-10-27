"use client";

import { ZaprexMascot } from "@/components/mascot/ZaprexMascot";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const TOKEN = /^[A-Za-z0-9._~-]{8,256}$/;

/**
 * Desktop sign-in, browser side. The Zaprex desktop app opens the Ingot portal in the default browser (Google and
 * GitHub refuse sign-in inside embedded app windows). The portal signs the user in, or finishes instantly when the
 * browser is already signed in, and sends a single-use, 60-second code here. This page never redeems the code: it
 * hands code and state to the app through zaprex://auth/callback, and the app redeems it in its own session.
 */
export function DesktopHandoff() {
  const params = useSearchParams();
  const [opened, setOpened] = useState(false);
  const link = useMemo(() => {
    const code = params.get("code") ?? "";
    const state = params.get("state") ?? "";
    if (!TOKEN.test(code) || !TOKEN.test(state)) return null;
    return `zaprex://auth/callback?${new URLSearchParams({ code, state }).toString()}`;
  }, [params]);

  useEffect(() => {
    if (!link) return;
    window.location.href = link;
    // Drop the code from this tab's address bar and history once it has been handed over.
    const timer = window.setTimeout(() => {
      window.history.replaceState(null, "", "/auth/desktop");
      setOpened(true);
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [link]);

  return (
    <div className="max-w-sm text-center" data-testid="auth-desktop">
      <ZaprexMascot id="desktop-handoff" state={link ? "working" : "error"} className="mx-auto block h-24 w-24" decorative />
      <h1 className="font-display mt-4 text-2xl font-bold">{link ? "Back to the Zaprex app" : "Sign-in didn’t finish"}</h1>
      <p className="mt-2 text-muted">
        {!link
          ? "This link expired or was already used. Start sign-in again from the Zaprex app."
          : opened
            ? "You’re signed in. You can close this tab and go back to the Zaprex app."
            : "Opening the Zaprex app…"}
      </p>
      {link && !opened && (
        <a href={link} className="btn-primary mt-6 inline-flex h-11 items-center rounded-full px-5 font-semibold text-white">Open Zaprex</a>
      )}
    </div>
  );
}
