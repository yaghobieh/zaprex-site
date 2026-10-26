"use client";

import { Check } from "lucide-react";
import { useState, type FormEvent } from "react";

type State = { kind: "idle" } | { kind: "sending" } | { kind: "done" } | { kind: "error"; message: string };

export function WaitlistForm({ source = "landing" }: { source?: string }) {
  const [state, setState] = useState<State>({ kind: "idle" });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setState({ kind: "sending" });
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: data.get("email"), website: data.get("website"), source }),
      });
      if (response.ok) return setState({ kind: "done" });
      const body = (await response.json().catch(() => ({}))) as { message?: string };
      setState({ kind: "error", message: body.message ?? "Something went wrong. Try again." });
    } catch {
      setState({ kind: "error", message: "Network error. Try again." });
    }
  }

  if (state.kind === "done") {
    return (
      <p role="status" data-testid="waitlist-done" className="flex items-center justify-center gap-2 rounded-2xl border border-gold/40 bg-gold/10 px-5 py-4 font-medium">
        <Check aria-hidden className="h-5 w-5 text-gold" /> You&apos;re on the list. We&apos;ll email you when your spot opens.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto flex w-full max-w-lg flex-col gap-3 sm:flex-row" data-testid="waitlist-form">
      <label htmlFor="waitlist-email" className="sr-only">Email address</label>
      <input
        id="waitlist-email"
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@company.com"
        className="h-12 flex-1 rounded-full border border-line bg-surface px-5 text-ink placeholder:text-muted focus:border-blue focus:outline-none focus:ring-4 focus:ring-blue/20"
      />
      {/* Honeypot: hidden from people, bots tend to fill it. */}
      <input name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <button
        type="submit"
        disabled={state.kind === "sending"}
        className="h-12 rounded-full bg-gold px-6 font-semibold text-navy shadow-lg shadow-gold/25 transition hover:brightness-105 disabled:opacity-60"
      >
        {state.kind === "sending" ? "Joining…" : "Join early access"}
      </button>
      {state.kind === "error" && <p role="alert" className="text-sm text-red-500 sm:basis-full">{state.message}</p>}
    </form>
  );
}
