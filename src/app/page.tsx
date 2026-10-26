import { ArrowRight, Check, Download, GitPullRequestDraft, Hand, Sparkles } from "lucide-react";
import Image from "next/image";
import { AccountButton } from "@/components/AccountButton";
import { Icon } from "@/components/Icon";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WaitlistForm } from "@/components/WaitlistForm";
import { DESCRIPTION, FAQ, FEATURES, INGOT, NAV, ROUTINES, SECURITY, SITE_NAME, SITE_URL, STEPS, WHAT_IT_DOES } from "@/lib/site";

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: SITE_NAME,
      url: SITE_URL,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "macOS, Windows, Linux, Web",
      description: DESCRIPTION,
      image: `${SITE_URL}/opengraph-image.png`,
      publisher: { "@type": "Organization", name: "Ingot", url: INGOT.portal },
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQ.map(item => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })),
    },
  ],
};

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-blue">{children}</p>;
}

function SectionTitle({ eyebrow, title, body }: { eyebrow: string; title: React.ReactNode; body?: string }) {
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      {body && <p className="mt-4 text-lg text-muted">{body}</p>}
    </div>
  );
}

function PrimaryCta({ className = "" }: { className?: string }) {
  return (
    <a href={INGOT.download} data-testid="cta-get" className={`inline-flex h-12 items-center gap-2 rounded-full bg-navy px-6 font-semibold text-white shadow-lg shadow-navy/25 transition hover:-translate-y-0.5 hover:bg-blue dark:bg-blue dark:shadow-blue/30 dark:hover:bg-[#4b7fe8] ${className}`}>
      <Download aria-hidden className="h-4 w-4" /> Get Zaprex in Ingot
    </a>
  );
}

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5">
          <a href="#top" className="flex items-center gap-2.5" aria-label="Zaprex home">
            <Image src="/apple-icon.png" alt="" width={32} height={32} className="rounded-lg" priority />
            <span className="font-display text-xl font-extrabold tracking-tight">Zaprex</span>
            <span className="hidden rounded-full border border-gold/50 px-2 py-0.5 text-[11px] font-semibold text-gold sm:inline">by Ingot</span>
          </a>
          <nav className="hidden flex-1 items-center justify-center gap-6 text-sm font-medium text-muted lg:flex" aria-label="Sections">
            {NAV.map(item => <a key={item.href} href={item.href} className="transition hover:text-ink">{item.label}</a>)}
          </nav>
          <div className="ml-auto flex items-center gap-3 lg:ml-0">
            <ThemeToggle />
            <AccountButton />
            <a href="#early-access" className="hidden h-9 items-center rounded-full bg-gold px-4 text-sm font-semibold text-navy transition hover:brightness-105 md:inline-flex">Early access</a>
          </div>
        </div>
      </header>

      <main id="top">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div aria-hidden className="grid-bg absolute inset-0" />
          <div aria-hidden className="hero-glow absolute inset-0" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 pb-20 pt-14 md:grid-cols-[1.05fr_1fr] md:pt-20">
            <div className="text-center md:text-left">
              <span className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-gold/10 px-3 py-1 text-sm font-semibold text-gold">
                <Sparkles aria-hidden className="h-4 w-4" /> New from Ingot · Beta
              </span>
              <h1 className="font-display mt-6 text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl" data-testid="hero-title">
                Ship code <span className="text-gradient">while you sleep.</span>
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-lg text-muted sm:text-xl md:mx-0">
                Zaprex is the AI coding bot that works on your repos while you&apos;re away. Give it a task or a nightly routine, and come back to a draft pull request.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3 md:justify-start">
                <PrimaryCta />
                <a href="#early-access" className="inline-flex h-12 items-center gap-2 rounded-full border border-line bg-surface px-6 font-semibold transition hover:border-blue">
                  Join early access <ArrowRight aria-hidden className="h-4 w-4" />
                </a>
              </div>
              <p className="mt-5 text-sm text-muted">Included in Ingot Pro+ and Ultra · Runs on Ingot, our own model</p>
            </div>

            <div className="relative mx-auto w-full max-w-[520px]">
              <Image src="/zaprex.webp" alt="Zaprex, an electric navy T-rex with glowing blue lightning and gold spikes" width={900} height={900} priority className="mascot float relative z-10 h-auto w-full" />
              <div className="float-delay absolute left-0 top-[8%] z-20 hidden rounded-2xl border border-line bg-surface/95 p-3 shadow-xl backdrop-blur sm:block">
                <p className="flex items-center gap-2 text-sm font-semibold"><GitPullRequestDraft aria-hidden className="h-4 w-4 text-blue" /> Draft PR #128 ready</p>
                <p className="mt-0.5 text-xs text-muted">fix: flaky auth tests · 6 files · all green</p>
              </div>
              <div className="float absolute bottom-[10%] right-0 z-20 hidden rounded-2xl border border-gold/50 bg-surface/95 p-3 shadow-xl backdrop-blur sm:block">
                <p className="flex items-center gap-2 text-sm font-semibold"><Hand aria-hidden className="h-4 w-4 text-gold" /> Approval needed</p>
                <p className="mt-0.5 font-mono text-xs text-muted">npm install zod@4</p>
              </div>
            </div>
          </div>
        </section>

        {/* What it does */}
        <section className="border-y border-line bg-bg-soft py-20" aria-labelledby="what">
          <div className="mx-auto max-w-6xl px-5">
            <SectionTitle eyebrow="What it does" title={<span id="what">Your teammate on the night shift</span>} body="Hand off the work that keeps slipping. Zaprex picks it up, does it properly, and leaves everything ready for your review." />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {WHAT_IT_DOES.map(item => (
                <article key={item.title} className="rounded-3xl border border-line bg-surface p-6 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue/10">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue/10 text-blue"><Icon name={item.icon} /></span>
                  <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-20 py-24">
          <div className="mx-auto max-w-6xl px-5">
            <SectionTitle eyebrow="How it works" title="Three steps. Zero babysitting." />
            <ol className="grid gap-6 md:grid-cols-3">
              {STEPS.map((step, index) => (
                <li key={step.n} className="relative rounded-3xl border border-line bg-surface p-7">
                  <span className="font-display text-5xl font-extrabold text-gold/80">{step.n}</span>
                  <h3 className="mt-3 text-xl font-semibold">{step.title}</h3>
                  <p className="mt-2 leading-relaxed text-muted">{step.body}</p>
                  {index < STEPS.length - 1 && <ArrowRight aria-hidden className="absolute -right-5 top-1/2 hidden h-6 w-6 -translate-y-1/2 text-blue md:block" />}
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-20 bg-navy py-24 text-white">
          <div className="mx-auto max-w-6xl px-5">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-gold">Features</p>
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Powerful when you need it. Safe by default.</h2>
              <p className="mt-4 text-lg text-white/70">Everything a background bot should do, and nothing it shouldn&apos;t.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map(item => (
                <article key={item.title} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition hover:border-blue/60 hover:bg-white/[0.07]">
                  <span className="zap grid h-11 w-11 place-items-center rounded-2xl bg-blue/25 text-[#8fb1ff]"><Icon name={item.icon} /></span>
                  <h3 className="mt-4 font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Routines */}
        <section id="routines" className="scroll-mt-20 py-24">
          <div className="mx-auto max-w-6xl px-5">
            <SectionTitle eyebrow="Routines" title="Set it once. Wake up to green builds." body="Routines run on your schedule, in your time zone. Pause one, run it now, or change it whenever you like." />
            <div className="grid gap-5 md:grid-cols-2">
              {ROUTINES.map(item => (
                <article key={item.title} className="flex gap-5 rounded-3xl border border-line bg-surface p-6">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gold/15 text-gold"><Icon name="CalendarClock" /></span>
                  <div>
                    <p className="font-mono text-xs font-semibold uppercase tracking-wider text-blue">{item.when}</p>
                    <h3 className="mt-1 text-lg font-semibold">{item.title}</h3>
                    <p className="mt-1 text-sm text-muted">{item.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Security and approvals */}
        <section id="security" className="scroll-mt-20 border-y border-line bg-bg-soft py-24">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 md:grid-cols-2">
            <div>
              <Eyebrow>Security and approvals</Eyebrow>
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">You stay in charge. Always.</h2>
              <p className="mt-4 text-lg text-muted">Zaprex is built to be trusted with real repositories. It works in the open, asks before it acts, and never merges on its own.</p>
              <ul className="mt-8 space-y-4">
                {SECURITY.map(item => (
                  <li key={item.title} className="flex gap-3">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blue text-white"><Check aria-hidden className="h-3.5 w-3.5" /></span>
                    <p><b className="font-semibold">{item.title}.</b> <span className="text-muted">{item.body}</span></p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-line bg-surface p-6 shadow-2xl shadow-navy/10" aria-label="Example approval card" role="img">
              <div className="flex items-center gap-3 border-b border-line pb-4">
                <Image src="/apple-icon.png" alt="" width={36} height={36} className="rounded-xl" />
                <div>
                  <p className="font-semibold">Zaprex</p>
                  <p className="text-xs text-muted">Nightly test-and-fix · api-service</p>
                </div>
                <span className="ml-auto rounded-full bg-blue/10 px-2.5 py-1 text-xs font-semibold text-blue">Running</span>
              </div>
              <p className="mt-4 text-sm text-muted">Found 3 failing tests in <code className="font-mono text-ink">orders.spec.ts</code>. The fix needs a newer validation library.</p>
              <div className="mt-4 rounded-2xl border border-gold/50 border-l-4 border-l-gold bg-gold/10 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold"><Hand aria-hidden className="h-4 w-4 text-gold" /> Approval needed</p>
                <pre className="mt-2 overflow-x-auto rounded-lg bg-bg px-3 py-2 font-mono text-xs">npm install zod@4</pre>
                <div className="mt-3 flex flex-wrap gap-2 text-sm font-semibold">
                  <span className="rounded-full bg-navy px-3 py-1.5 text-white dark:bg-blue">Approve</span>
                  <span className="rounded-full border border-line px-3 py-1.5">Approve for this run</span>
                  <span className="rounded-full border border-line px-3 py-1.5 text-muted">Reject</span>
                </div>
              </div>
              <p className="mt-4 flex items-center gap-2 text-sm text-muted"><GitPullRequestDraft aria-hidden className="h-4 w-4 text-blue" /> Will open a draft PR on <code className="font-mono text-ink">zaprex/fix-orders-tests</code></p>
            </div>
          </div>
        </section>

        {/* Pricing teaser */}
        <section id="pricing" className="scroll-mt-20 py-24">
          <div className="mx-auto max-w-4xl px-5">
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-navy via-[#22336a] to-blue p-10 text-center text-white shadow-2xl shadow-blue/20 sm:p-14">
              <div aria-hidden className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold/30 blur-3xl" />
              <p className="relative text-sm font-semibold uppercase tracking-[0.18em] text-gold">Pricing</p>
              <h2 className="font-display relative mt-3 text-3xl font-bold sm:text-4xl">Included in Ingot Pro+ and Ultra</h2>
              <p className="relative mx-auto mt-4 max-w-xl text-white/80">Zaprex comes with monthly run minutes on Pro+ and Ultra, alongside everything else in Ingot. No separate subscription.</p>
              <div className="relative mt-8 flex flex-wrap justify-center gap-3">
                <a href={INGOT.pricing} data-testid="cta-pricing" className="inline-flex h-12 items-center gap-2 rounded-full bg-gold px-6 font-semibold text-navy transition hover:brightness-105">See Ingot plans <ArrowRight aria-hidden className="h-4 w-4" /></a>
                <a href={INGOT.download} className="inline-flex h-12 items-center gap-2 rounded-full border border-white/30 px-6 font-semibold transition hover:bg-white/10"><Download aria-hidden className="h-4 w-4" /> Download Ingot</a>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-20 border-t border-line bg-bg-soft py-24">
          <div className="mx-auto max-w-3xl px-5">
            <SectionTitle eyebrow="FAQ" title="Questions, answered" />
            <div className="space-y-3">
              {FAQ.map(item => (
                <details key={item.q} className="group rounded-2xl border border-line bg-surface px-6 py-4 open:shadow-lg open:shadow-blue/5">
                  <summary className="flex items-center justify-between gap-4 font-semibold">
                    {item.q}
                    <span aria-hidden className="chev text-2xl leading-none text-blue transition-transform">+</span>
                  </summary>
                  <p className="mt-3 leading-relaxed text-muted">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Early access + CTA */}
        <section id="early-access" className="scroll-mt-20 py-24">
          <div className="mx-auto max-w-3xl px-5 text-center">
            <Image src="/zaprex.webp" alt="" width={180} height={180} className="mascot mx-auto h-36 w-36" />
            <h2 className="font-display mt-4 text-3xl font-bold tracking-tight sm:text-5xl">Get Zaprex in Ingot</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted">Download Ingot to start, or join early access and we&apos;ll email you as new Zaprex features roll out.</p>
            <div className="mt-8"><PrimaryCta /></div>
            <div className="mt-10"><WaitlistForm /></div>
            <p className="mt-3 text-xs text-muted">Only product updates. Unsubscribe anytime. See the <a className="underline hover:text-ink" href={INGOT.privacy}>privacy policy</a>.</p>
          </div>
        </section>
      </main>

      <footer className="border-t border-line py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-5 text-sm text-muted md:flex-row">
          <div className="flex items-center gap-2.5">
            <Image src="/apple-icon.png" alt="" width={24} height={24} className="rounded-md" />
            <span><b className="text-ink">Zaprex</b> is part of <a href={INGOT.portal} className="font-semibold text-ink hover:text-blue">Ingot</a>, the open-source AI IDE.</span>
          </div>
          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 md:ml-auto" aria-label="Footer">
            <a href={INGOT.download} className="hover:text-ink">Download</a>
            <a href={INGOT.pricing} className="hover:text-ink">Pricing</a>
            <a href={INGOT.github} className="hover:text-ink" rel="noopener noreferrer">GitHub</a>
            <a href={INGOT.support} className="hover:text-ink">Support</a>
            <a href={INGOT.terms} className="hover:text-ink">Terms</a>
            <a href={INGOT.privacy} className="hover:text-ink">Privacy</a>
          </nav>
          <p className="md:ml-4">© 2026 Ingot</p>
        </div>
      </footer>
    </>
  );
}
