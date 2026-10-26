import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Markdown } from "@/components/docs/Markdown";
import { DOCS, getDoc, headings } from "@/lib/docs";

export function generateStaticParams() {
  return DOCS.map(doc => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: PageProps<"/docs/[slug]">): Promise<Metadata> {
  const doc = getDoc((await params).slug);
  if (!doc) return {};
  return { title: doc.title, description: doc.description, alternates: { canonical: `/docs/${doc.slug}` }, openGraph: { title: `${doc.title} · Zaprex docs`, description: doc.description } };
}

export default async function DocPage({ params }: PageProps<"/docs/[slug]">) {
  const doc = getDoc((await params).slug);
  if (!doc) notFound();
  const index = DOCS.indexOf(doc);
  const prev = DOCS[index - 1];
  const next = DOCS[index + 1];
  const toc = headings(doc.body);
  return (
    <div className="flex gap-10">
      <article className="min-w-0 max-w-3xl flex-1" data-testid="doc-article">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">{doc.group}</p>
        <h1 className="font-display mt-2 text-4xl font-extrabold tracking-tight">{doc.title}</h1>
        <p className="mt-3 text-lg text-muted">{doc.description}</p>
        <div className="doc-body mt-8"><Markdown source={doc.body} /></div>
        <nav className="mt-14 grid gap-4 sm:grid-cols-2" aria-label="Previous and next">
          {prev ? (
            <Link href={`/docs/${prev.slug}`} className="glass rounded-2xl p-4 transition hover:border-blue/50">
              <span className="flex items-center gap-1 text-xs text-muted"><ArrowLeft aria-hidden className="h-3.5 w-3.5" /> Previous</span>
              <span className="mt-1 block font-semibold">{prev.title}</span>
            </Link>
          ) : <span />}
          {next && (
            <Link href={`/docs/${next.slug}`} className="glass rounded-2xl p-4 text-right transition hover:border-blue/50">
              <span className="flex items-center justify-end gap-1 text-xs text-muted">Next <ArrowRight aria-hidden className="h-3.5 w-3.5" /></span>
              <span className="mt-1 block font-semibold">{next.title}</span>
            </Link>
          )}
        </nav>
      </article>
      {toc.length > 1 && (
        <aside className="sticky top-24 hidden h-fit w-52 shrink-0 xl:block" aria-label="On this page">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">On this page</p>
          <ul className="space-y-1.5 border-l border-line text-sm">
            {toc.map(item => <li key={item.id}><a href={`#${item.id}`} className="-ml-px block border-l border-transparent pl-3 text-muted hover:border-blue hover:text-ink">{item.text}</a></li>)}
          </ul>
        </aside>
      )}
    </div>
  );
}
