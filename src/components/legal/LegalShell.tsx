import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ZaprexMascot } from "@/components/mascot/ZaprexMascot";
import { MobileNav } from "@/components/nav/MobileNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const LEGAL_EFFECTIVE = "October 31, 2026";
export const SUPPORT_EMAIL = "support@ingotide.com";
export const PRIVACY_EMAIL = "privacy@ingotide.com";

export function legalMetadata(path: string, title: string, description: string): Metadata {
  return {
    title: { absolute: `${title} | ${SITE_NAME}` },
    description,
    alternates: { canonical: path },
    robots: { index: true, follow: true },
    openGraph: { type: "article", url: `${SITE_URL}${path}`, title: `${title} | ${SITE_NAME}`, description, siteName: SITE_NAME },
    twitter: { card: "summary", title: `${title} | ${SITE_NAME}`, description },
  };
}

/** Shared shell for /privacy, /terms and /account/delete (Google Play listing requirements). */
export function LegalShell({ title, path, children }: { title: string; path: string; children: ReactNode }) {
  const jsonLd = { "@context": "https://schema.org", "@type": "WebPage", name: title, url: `${SITE_URL}${path}`, dateModified: "2026-10-31", isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL } };
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div aria-hidden className="space-bg pointer-events-none fixed inset-0 -z-10" />
      <header className="glass-bar sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-4 px-5">
          <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Zaprex home">
            <ZaprexMascot id="legal-nav" className="-my-1 h-10 w-10" decorative />
            <span className="font-display text-xl font-extrabold tracking-tight">Zaprex</span>
          </Link>
          <div className="ml-auto flex items-center gap-3">
            <div className="mobile:hidden"><ThemeToggle /></div>
            <MobileNav />
          </div>
        </div>
      </header>
      <main className="legal mx-auto w-full max-w-3xl flex-1 px-5 py-12 break-words">
        <h1 className="font-display text-4xl font-extrabold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted">Effective {LEGAL_EFFECTIVE}</p>
        <div className="mt-8 space-y-6 leading-relaxed [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_a]:font-semibold [&_a]:text-sky">{children}</div>
      </main>
      <LegalFooter />
    </div>
  );
}

export function LegalFooter() {
  return (
    <footer className="glass-bar py-8">
      <nav className="mx-auto flex max-w-3xl flex-wrap gap-x-5 gap-y-2 px-5 text-sm text-muted" aria-label="Legal">
        <Link href="/" className="hover:text-ink">Home</Link>
        <Link href="/privacy" className="hover:text-ink">Privacy</Link>
        <Link href="/terms" className="hover:text-ink">Terms</Link>
        <Link href="/account/delete" className="hover:text-ink">Delete account</Link>
        <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-ink">{SUPPORT_EMAIL}</a>
      </nav>
    </footer>
  );
}
