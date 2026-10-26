"use client";

import { LogOut, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { startSignIn, ZAPREX_DASHBOARD_URL, type AccountUser } from "@/lib/auth";

type State = { kind: "loading" } | { kind: "signed-out" } | { kind: "signed-in"; user: AccountUser };

export function AccountButton() {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/me", { credentials: "same-origin" })
      .then(async response => (response.ok ? ((await response.json()) as { user: AccountUser }).user : undefined))
      .catch(() => undefined)
      .then(user => { if (!cancelled) setState(user ? { kind: "signed-in", user } : { kind: "signed-out" }); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => { if (!menu.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  async function signOut() {
    await fetch("/api/auth/sign-out", { method: "POST", credentials: "same-origin" }).catch(() => undefined);
    setOpen(false);
    setState({ kind: "signed-out" });
  }

  if (state.kind === "loading") return <span className="h-9 w-20" aria-hidden />;

  if (state.kind === "signed-out") {
    return (
      <button type="button" onClick={() => startSignIn(window.location.pathname)} data-testid="sign-in" className="inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-line bg-surface px-4 text-sm font-semibold transition hover:border-blue">
        <UserRound aria-hidden className="h-4 w-4" /> Sign in
      </button>
    );
  }

  const { user } = state;
  const initial = (user.name || user.email).trim().charAt(0).toUpperCase();
  return (
    <div className="relative" ref={menu}>
      <button type="button" onClick={() => setOpen(value => !value)} aria-expanded={open} aria-haspopup="menu" data-testid="account" className="flex h-9 items-center gap-2 rounded-full border border-line bg-surface pl-1 pr-3 text-sm font-semibold">
        {user.avatarUrl
          // eslint-disable-next-line @next/next/no-img-element -- remote avatar from the account provider
          ? <img src={user.avatarUrl} alt="" width={28} height={28} className="h-7 w-7 rounded-full" referrerPolicy="no-referrer" />
          : <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-gold to-blue text-xs text-white">{initial}</span>}
        <span className="hidden max-w-32 truncate sm:inline">{user.name || user.email}</span>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-60 rounded-2xl border border-line bg-surface p-2 shadow-xl">
          <p className="px-3 py-2 text-xs text-muted">Signed in with your Ingot account<br /><b className="text-ink">{user.email}</b></p>
          <a role="menuitem" href="/app" className="block rounded-xl px-3 py-2 text-sm font-medium hover:bg-bg-soft">Open Zaprex app</a>
          <a role="menuitem" href={ZAPREX_DASHBOARD_URL} className="block rounded-xl px-3 py-2 text-sm font-medium hover:bg-bg-soft">Open Zaprex dashboard</a>
          <button role="menuitem" type="button" onClick={signOut} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-muted hover:bg-bg-soft hover:text-ink">
            <LogOut aria-hidden className="h-4 w-4" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
