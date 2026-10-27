import type { Metadata } from "next";
import Link from "next/link";
import { AccountButton } from "@/components/AccountButton";
import { ZaprexApp } from "@/components/app/ZaprexApp";
import { ZaprexMascot } from "@/components/mascot/ZaprexMascot";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "App",
  description: "Zaprex, the background AI coding bot: give it a task, approve risky steps and get a draft pull request.",
  alternates: { canonical: "/app" },
  robots: { index: false, follow: true },
};

/** zaprex.dev/app: the Zaprex app itself (IDEA-173). Ingot links here from the small T-rex next to its agent. */
export default function AppPage() {
  return (
    <div className="zx-app-surface flex min-h-screen flex-col overflow-x-hidden">
      <div aria-hidden className="space-bg pointer-events-none fixed inset-0 -z-10" />
      <div aria-hidden className="docs-nebula pointer-events-none fixed inset-0 -z-10" />
      <header className="glass-bar sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-3 sm:gap-4 sm:px-5">
          <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Zaprex home">
            <ZaprexMascot id="app-nav" className="-my-1 h-10 w-10" decorative />
            <span className="font-display hidden text-xl font-extrabold tracking-tight sm:inline">Zaprex</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm font-semibold text-muted" aria-label="App">
            <span className="text-ink" aria-current="page">App</span>
            <Link href="/docs" className="hover:text-ink">Docs</Link>
          </nav>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <AccountButton />
          </div>
        </div>
      </header>
      <ZaprexApp />
    </div>
  );
}
