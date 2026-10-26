"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { startSignIn, STATE_KEY } from "@/lib/auth";

/** Finishes the shared Ingot sign-in: checks state, redeems the one-time code (sets the session cookie here), then goes home. */
export function CallbackHandler() {
  const params = useSearchParams();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const code = params.get("code") ?? "";
    const state = params.get("state") ?? "";
    const expected = sessionStorage.getItem(STATE_KEY);
    sessionStorage.removeItem(STATE_KEY);
    if (!code || !state || state !== expected) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- terminal error state for an invalid callback
      setFailed(true);
      return;
    }
    fetch("/api/auth/web-handoff/redeem", { method: "POST", headers: { "content-type": "application/json" }, credentials: "same-origin", body: JSON.stringify({ code }) })
      .then(response => { if (response.ok) window.location.replace("/"); else setFailed(true); })
      .catch(() => setFailed(true));
  }, [params]);

  return (
    <div className="max-w-sm text-center" data-testid="auth-callback">
      <Image src="/apple-icon.png" alt="" width={56} height={56} className={`mx-auto rounded-2xl ${failed ? "" : "animate-pulse"}`} />
      <h1 className="font-display mt-4 text-2xl font-bold">{failed ? "Sign-in didn’t finish" : "Signing you in…"}</h1>
      <p className="mt-2 text-muted">{failed ? "The link expired or was already used. Try again." : "Using your Ingot account."}</p>
      {failed && (
        <div className="mt-6 flex justify-center gap-3">
          <button type="button" onClick={startSignIn} className="h-11 rounded-full bg-navy px-5 font-semibold text-white dark:bg-blue">Try again</button>
          <Link href="/" className="inline-flex h-11 items-center rounded-full border border-line px-5 font-semibold">Home</Link>
        </div>
      )}
    </div>
  );
}
