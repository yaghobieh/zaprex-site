import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ZaprexMascot } from "@/components/mascot/ZaprexMascot";
import { DOC_GROUPS, DOCS } from "@/lib/docs";

export const metadata: Metadata = { title: "Zaprex docs", alternates: { canonical: "/docs" } };

export default function DocsHome() {
  return (
    <div>
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <ZaprexMascot id="docs-hero" state="thinking" className="h-28 w-28 shrink-0" decorative />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky">Documentation</p>
          <h1 className="font-display mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl" data-testid="docs-title">Zaprex docs</h1>
          <p className="mt-3 max-w-2xl text-lg text-muted">Everything about Ingot&apos;s background coding agent: getting started, tasks and routines, approvals, the run log, draft PRs, models, security and admin controls.</p>
        </div>
      </div>
      <Link href="/docs/quick-start" className="btn-primary mt-8 inline-flex h-11 items-center gap-2 rounded-full px-5 font-semibold text-white">Quick start <ArrowRight aria-hidden className="h-4 w-4" /></Link>
      <div className="mt-12 space-y-10">
        {DOC_GROUPS.map(group => (
          <section key={group}>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-gold">{group}</h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {DOCS.filter(doc => doc.group === group).map(doc => (
                <Link key={doc.slug} href={`/docs/${doc.slug}`} className="glass group rounded-2xl p-5 transition hover:-translate-y-0.5 hover:border-blue/50">
                  <h3 className="font-semibold text-ink">{doc.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{doc.description}</p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
