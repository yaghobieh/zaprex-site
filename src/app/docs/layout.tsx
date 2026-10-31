import type { Metadata } from "next";
import Link from "next/link";
import { AccountButton } from "@/components/AccountButton";
import { DocsDrawer } from "@/components/docs/DocsDrawer";
import { DocsNav } from "@/components/docs/DocsNav";
import { DocsSearch } from "@/components/docs/DocsSearch";
import { ZaprexMascot } from "@/components/mascot/ZaprexMascot";
import { MobileNav } from "@/components/nav/MobileNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DOC_GROUPS, DOCS, headings, plainText } from "@/lib/docs";
import { INGOT } from "@/lib/site";

export const metadata: Metadata = {
  title: { default: "Docs", template: "%s · Zaprex docs" },
  description: "How to use Zaprex, the background AI coding bot from Ingot: quick start, tasks, routines, approvals, run log, draft PRs, models, security and admin.",
};

const INDEX = DOCS.map(doc => ({ slug: doc.slug, title: doc.title, description: doc.description, text: plainText(doc.body), headings: headings(doc.body) }));
const NAV_ITEMS = DOCS.map(({ slug, title, group }) => ({ slug, title, group }));

export default function DocsLayout({ children }: LayoutProps<"/docs">) {
  return (
    <>
      <div aria-hidden className="space-bg pointer-events-none fixed inset-0 -z-10" />
      <div aria-hidden className="docs-nebula pointer-events-none fixed inset-0 -z-10" />
      <header className="glass-bar sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-5">
          <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Zaprex home">
            <ZaprexMascot id="docs-nav" className="-my-1 h-10 w-10" decorative />
            <span className="font-display text-xl font-extrabold tracking-tight">Zaprex</span>
          </Link>
          <span className="hidden text-sm font-semibold text-muted sm:inline">Docs</span>
          <div className="mx-auto hidden w-full max-w-md md:block"><DocsSearch index={INDEX} /></div>
          <div className="ml-auto flex items-center gap-3 md:ml-0">
            <div className="flex items-center gap-3 mobile:hidden">
              <ThemeToggle />
              <AccountButton />
            </div>
            <Link href="/app" className="hidden h-9 items-center rounded-full bg-gold px-4 text-sm font-semibold text-navy transition hover:brightness-105 lg:inline-flex">Open app</Link>
            <MobileNav />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-5">
        <div className="pt-4 md:hidden"><DocsSearch index={INDEX} /></div>
        <div className="py-4 lg:hidden"><DocsDrawer items={NAV_ITEMS} groups={DOC_GROUPS} /></div>
        <div className="flex gap-10">
          <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 overflow-y-auto py-8 lg:block">
            <DocsNav items={NAV_ITEMS} groups={DOC_GROUPS} />
          </aside>
          <main id="docs-main" className="min-w-0 flex-1 pb-24 pt-4 lg:pt-10">{children}</main>
        </div>
      </div>
      <footer className="glass-bar py-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-5 text-sm text-muted">
          <ZaprexMascot id="docs-footer" className="h-7 w-7" decorative />
          <span><b className="text-ink">Zaprex</b> is part of <a href={INGOT.portal} className="font-semibold text-ink hover:text-sky">Ingot</a>.</span>
          <nav className="ml-auto flex flex-wrap gap-x-5 gap-y-2" aria-label="Footer">
            <Link href="/" className="hover:text-ink">Home</Link>
            <Link href="/about" className="hover:text-ink">About</Link>
            <a href={INGOT.marketplace} className="hover:text-ink">Templates store</a>            <a href={INGOT.pricing} className="hover:text-ink">Pricing</a>
            <a href={INGOT.support} className="hover:text-ink">Support</a>
            <Link href="/privacy" className="hover:text-ink">Privacy</Link>
            <Link href="/terms" className="hover:text-ink">Terms</Link>
          </nav>
        </div>
      </footer>
    </>
  );
}
