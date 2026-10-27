import type { Metadata } from "next";
import Link from "next/link";
import { AccountButton } from "@/components/AccountButton";
import { ZaprexMascot } from "@/components/mascot/ZaprexMascot";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CREATOR, INGOT, SITE_NAME, SITE_URL } from "@/lib/site";

const TITLE = `About ${SITE_NAME} and its creator, ${CREATOR.name}`;
const DESCRIPTION = `${SITE_NAME} is the background AI coding bot from Ingot, created by ${CREATOR.name}, ${CREATOR.jobTitle} and founder of ${CREATOR.founderOf}.`;

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/about" },
  openGraph: { type: "profile", url: `${SITE_URL}/about`, title: TITLE, description: DESCRIPTION, siteName: SITE_NAME },
  authors: [{ name: CREATOR.name, url: CREATOR.website }],
};

/** IDEA-179: Person + Organization structured data so search engines connect Zaprex, Ingot, ForgeStack and John Yaghobieh. */
const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person", "@id": `${SITE_URL}/about#creator`, name: CREATOR.name, jobTitle: CREATOR.jobTitle,
      url: CREATOR.website, sameAs: [CREATOR.github, CREATOR.website],
      founder: { "@id": `${SITE_URL}/about#forgestack` },
      knowsAbout: ["Full stack development", "AI developer tools", "TypeScript", "Developer experience"],
    },
    { "@type": "Organization", "@id": `${SITE_URL}/about#forgestack`, name: CREATOR.founderOf, founder: { "@id": `${SITE_URL}/about#creator` }, url: CREATOR.website, sameAs: [CREATOR.github] },
    { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: SITE_NAME, url: SITE_URL, logo: `${SITE_URL}/icon.png`, founder: { "@id": `${SITE_URL}/about#creator` }, parentOrganization: { "@type": "Organization", name: "Ingot", url: INGOT.portal } },
    { "@type": "AboutPage", "@id": `${SITE_URL}/about`, url: `${SITE_URL}/about`, name: TITLE, description: DESCRIPTION, about: { "@id": `${SITE_URL}/#organization` }, mainEntity: { "@id": `${SITE_URL}/about#creator` } },
  ],
};

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD).replace(/</g, "\\u003c") }} />
      <div aria-hidden className="space-bg pointer-events-none fixed inset-0 -z-10" />
      <div aria-hidden className="docs-nebula pointer-events-none fixed inset-0 -z-10" />
      <header className="glass-bar sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-4 px-5">
          <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Zaprex home">
            <ZaprexMascot id="about-nav" className="-my-1 h-10 w-10" decorative />
            <span className="font-display text-xl font-extrabold tracking-tight">Zaprex</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm font-semibold text-muted" aria-label="About">
            <span className="text-ink" aria-current="page">About</span>
            <Link href="/docs" className="hover:text-ink">Docs</Link>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <ThemeToggle />
            <AccountButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-14" data-testid="about">
        <p className="text-sm font-semibold uppercase tracking-widest text-gold">About</p>
        <h1 className="font-display mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">The T-rex that codes while you sleep</h1>
        <p className="mt-5 max-w-2xl text-lg text-muted">
          {SITE_NAME} is the background AI coding bot from <a href={INGOT.portal} className="font-semibold text-ink hover:text-sky">Ingot</a>, the open-source AI IDE.
          You chat with it like a teammate, hand it a task or a nightly routine, and it comes back with a draft pull request. It asks before anything risky.
        </p>

        <section className="glass mt-12 grid gap-8 rounded-3xl p-8 sm:grid-cols-[auto_1fr] sm:items-center" aria-labelledby="creator">
          <ZaprexMascot id="about-creator" className="mx-auto h-32 w-32" decorative />
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">Created by</p>
            <h2 id="creator" className="font-display mt-1 text-3xl font-bold">{CREATOR.name}</h2>
            <p className="mt-1 font-semibold text-gold">{CREATOR.jobTitle} · Founder of {CREATOR.founderOf}</p>
            <p className="mt-4 text-muted">
              {CREATOR.name} builds developer tools end to end, from the editor to the cloud. He created Ingot and {SITE_NAME} so that
              anyone can work with AI agents that are fast, affordable and safe by default, with every change reviewable in a pull request.
            </p>
            <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
              <a href={CREATOR.github} rel="me noreferrer" target="_blank" className="rounded-full border border-line bg-surface px-4 py-2 hover:border-blue">GitHub · yaghobieh</a>
              <a href={CREATOR.website} rel="me noreferrer" target="_blank" className="rounded-full border border-line bg-surface px-4 py-2 hover:border-blue">Personal site</a>
            </div>
          </div>
        </section>

        <section className="mt-12 grid gap-5 sm:grid-cols-3" aria-label="What we believe">
          {[
            ["Safe by default", "Isolated cloud sandboxes, approvals for risky steps, draft PRs only, never a push to a protected branch."],
            ["Fair pricing", "Zaprex is included in every paid Ingot plan, from $6 a month, with clear usage limits."],
            ["Open source", "Ingot is open source. You can read how it works and help shape it."],
          ].map(([title, text]) => (
            <div key={title} className="glass rounded-3xl p-6">
              <h3 className="font-display text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm text-muted">{text}</p>
            </div>
          ))}
        </section>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link href="/app" className="inline-flex h-12 items-center rounded-full bg-gold px-6 font-semibold text-navy hover:brightness-105">Open Zaprex</Link>
          <a href={INGOT.github} className="inline-flex h-12 items-center rounded-full border border-line bg-surface px-6 font-semibold hover:border-blue">Ingot on GitHub</a>
        </div>
      </main>
    </div>
  );
}
