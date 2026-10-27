import Link from "next/link";
import { ArrowRight, Check, ChevronDown, Download, GitPullRequestDraft, Hand, Rocket, Sparkles } from "lucide-react";
import { AccountButton } from "@/components/AccountButton";
import { Icon } from "@/components/Icon";
import { DemoReel } from "@/components/space/DemoReel";
import { Flier } from "@/components/space/Flier";
import { Screen } from "@/components/space/Screen";
import { ZaprexMascot } from "@/components/mascot/ZaprexMascot";
import { ScrollScenes } from "@/components/space/ScrollScenes";
import { Starfield } from "@/components/space/Starfield";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WaitlistForm } from "@/components/WaitlistForm";
import { DESCRIPTION, FAQ, FEATURES, INGOT, NAV, ROUTINES, SECURITY, SITE_NAME, SITE_URL, STEPS, WHAT_IT_DOES, ZAPREX_PLANS } from "@/lib/site";

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

/** Real product screenshots (Ingot test mode, sample repo) shown beside each "what it does" stop. */
const STOP_SHOTS = [
  { src: "/media/runlog.webp", width: 999, height: 668, kind: "browser", alt: "Real Zaprex run log in the Ingot dashboard: npm test fails, Zaprex fixes sum.mjs, the diff, and npm test passes" },
  { src: "/media/app-done.webp", width: 358, height: 568, kind: "app", alt: "The Zaprex app on a phone: run finished, tests pass, with a link to the draft pull request" },
  { src: "/media/routines.webp", width: 1100, height: 219, kind: "browser", alt: "Real Zaprex routines tab: an active nightly test-and-fix routine with its next run time" },
  { src: "/media/task.webp", width: 999, height: 454, kind: "browser", alt: "Real Zaprex chat in the Ingot dashboard: you ask it to fix failing tests and it reports back when the run finishes" },
] as const;

/** Planet looks, cycled across features and "what it does" stops. */
const PLANETS = ["planet-blue", "planet-gold", "planet-navy", "planet-ice"] as const;

function Eyebrow({ children, tone = "blue" }: { children: React.ReactNode; tone?: "blue" | "gold" }) {
  return <p className={`mb-3 text-xs font-semibold uppercase tracking-[0.28em] ${tone === "gold" ? "text-gold" : "text-sky"}`}>{children}</p>;
}

function SectionTitle({ eyebrow, title, body, id }: { eyebrow: string; title: React.ReactNode; body?: string; id?: string }) {
  return (
    <div className="mx-auto mb-14 max-w-2xl text-center" data-reveal>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 id={id} className="font-display text-3xl font-bold tracking-tight sm:text-5xl">{title}</h2>
      {body && <p className="mt-5 text-lg text-muted">{body}</p>}
    </div>
  );
}

function PrimaryCta({ className = "" }: { className?: string }) {
  return (
    <Link href="/app" data-testid="cta-get" className={`btn-primary inline-flex h-12 items-center gap-2 rounded-full px-6 font-semibold text-white transition hover:-translate-y-0.5 ${className}`}>
      <Rocket aria-hidden className="h-4 w-4" /> Open the Zaprex app
    </Link>
  );
}

/** Where planet `index` sits on its orbit (inner or outer ellipse) at a given orbit progress. Shared with the scroll scene. */
function orbitPosition(index: number, count: number, progress: number) {
  const ring = index % 2 ? 0.92 : 0.6;
  const angle = (index / count) * Math.PI * 2 + progress * Math.PI * (index % 2 ? -0.9 : 1.2) - Math.PI / 2;
  return { left: `${(50 + Math.cos(angle) * ring * 50).toFixed(3)}%`, top: `${(50 + Math.sin(angle) * ring * 39).toFixed(3)}%`, transform: "translate(-50%, -50%)" };
}

/** Invisible marker: where the flying Zaprex should be when this spot is on screen. */
function Slot({ className, state = "idle" }: { className: string; state?: string }) {
  return <div aria-hidden data-zx-slot data-zx-state={state} className={`pointer-events-none absolute aspect-square ${className}`} />;
}

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <div aria-hidden className="space-bg pointer-events-none fixed inset-0 -z-10" />
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div data-nebula="a" className="nebula nebula-a" />
        <div data-nebula="b" className="nebula nebula-b" />
      </div>
      <Starfield />
      <ScrollScenes />
      <Flier />

      <header className="glass-bar sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5">
          <a href="#top" className="flex shrink-0 items-center gap-2.5" aria-label="Zaprex home">
            <ZaprexMascot id="nav" className="h-10 w-10 -my-1" decorative />
            <span className="font-display text-xl font-extrabold tracking-tight">Zaprex</span>
            <span className="hidden whitespace-nowrap text-[11px] font-semibold uppercase tracking-wider text-gold sm:inline">by Ingot</span>
          </a>
          <nav className="hidden flex-1 items-center justify-center gap-5 whitespace-nowrap text-sm font-medium text-muted xl:flex" aria-label="Sections">
            {NAV.map(item => <a key={item.href} href={item.href} className="transition hover:text-ink">{item.label}</a>)}
            <Link href="/docs" className="transition hover:text-ink" data-testid="nav-docs">Docs</Link>
          </nav>
          <div className="ml-auto flex shrink-0 items-center gap-3 whitespace-nowrap xl:ml-0">
            <ThemeToggle />
            <AccountButton />
            <a href="#early-access" className="hidden h-9 shrink-0 items-center whitespace-nowrap rounded-full bg-gold px-4 text-sm font-semibold text-navy transition hover:brightness-105 md:inline-flex">Early access</a>
          </div>
        </div>
      </header>

      <main id="top" className="relative z-10">
        {/* Hero: launch pad */}
        <section id="hero" className="relative flex min-h-[calc(100svh-4rem)] items-center overflow-hidden">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-6 px-5 pb-16 pt-10 md:grid-cols-[1.05fr_1fr] md:pt-6">
            <div data-hero-copy className="text-center md:text-left">
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
                <a href="#early-access" className="btn-ghost inline-flex h-12 items-center gap-2 rounded-full px-6 font-semibold transition">
                  Join early access <ArrowRight aria-hidden className="h-4 w-4" />
                </a>
              </div>
              <p className="mt-5 text-sm text-muted">Included in every paid Ingot plan, from $6 a month · Runs on Ingot, our own model</p>
            </div>

            <div className="relative mx-auto w-full max-w-[300px] sm:max-w-[400px] md:max-w-[500px]">
              <div data-zx-slot data-zx-state="idle" className="relative aspect-square w-full">
                <ZaprexMascot id="hero" className="zx-static mascot relative h-full w-full" title="Zaprex, an electric navy T-rex with glowing blue lightning and gold spikes" />
              </div>
              <div className="float-delay glass chip absolute -left-4 top-[6%] z-20 hidden rounded-2xl p-3 sm:block">
                <p className="flex items-center gap-2 text-sm font-semibold"><GitPullRequestDraft aria-hidden className="h-4 w-4 text-sky" /> Draft PR ready</p>
                <p className="mt-0.5 text-xs text-muted">Changed sum.mjs, package.json; tests pass.</p>
              </div>
              <div className="float glass chip absolute -right-2 bottom-[8%] z-20 hidden rounded-2xl border-gold/50 p-3 sm:block">
                <p className="flex items-center gap-2 text-sm font-semibold"><Hand aria-hidden className="h-4 w-4 text-gold" /> Approval needed</p>
                <p className="mt-0.5 font-mono text-xs text-muted">npm install --save-dev vitest</p>
              </div>
            </div>
          </div>
          <a href="#what-it-does" className="scroll-cue absolute bottom-5 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-xs font-semibold uppercase tracking-[0.25em] text-muted md:flex">
            Scroll to launch <ChevronDown aria-hidden className="h-4 w-4" />
          </a>
        </section>

        {/* What it does: planets you pass */}
        <section id="what-it-does" className="relative scroll-mt-20 py-28" aria-labelledby="what">
          <Slot className="right-[4%] top-4 w-24 md:right-[6%] md:w-40" state="thinking" />
          <div className="mx-auto max-w-6xl px-5">
            <SectionTitle eyebrow="What it does" id="what" title="Your teammate on the night shift" body="Hand off the work that keeps slipping. Zaprex picks it up, does it properly, and leaves everything ready for your review." />
            <div className="space-y-16 md:space-y-24">
              {WHAT_IT_DOES.map((item, index) => (
                <div key={item.title} className={`flex flex-col items-center gap-8 md:gap-14 ${index % 2 ? "md:flex-row-reverse" : "md:flex-row"}`}>
                  <div className={`relative w-full shrink-0 ${STOP_SHOTS[index].kind === "app" ? "max-w-[240px] md:w-[240px]" : "max-w-md md:w-[440px]"}`} data-speed={index % 2 ? 0.5 : 0.8}>
                    <span aria-hidden className={`planet ${PLANETS[index % PLANETS.length]} ${index % 2 ? "planet-ringed -right-10" : "-left-10"} absolute -top-12 h-28 w-28 md:h-40 md:w-40`} />
                    <Screen {...STOP_SHOTS[index]} className="relative" sizes="(min-width: 768px) 440px, 92vw" />
                  </div>
                  <article className="glass max-w-xl rounded-3xl p-7 md:p-8" data-reveal>
                    <p className="font-mono text-xs font-semibold uppercase tracking-widest text-gold">Stop {String(index + 1).padStart(2, "0")}</p>
                    <h3 className="font-display mt-2 text-2xl font-bold">{item.title}</h3>
                    <p className="mt-3 leading-relaxed text-muted">{item.body}</p>
                  </article>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Demo reel: real captures, framed and in orbit */}
        <section id="demo" className="relative scroll-mt-20 py-28" aria-labelledby="demo-title">
          <Slot className="left-[4%] top-4 w-20 md:w-32" state="working" />
          <div className="mx-auto max-w-6xl px-5">
            <SectionTitle eyebrow="Demo" id="demo-title" title="Watch a real run" body="Thirty seconds of real screen captures: a task, an approval, the live run log and the draft pull request." />
            <div className="relative mx-auto max-w-4xl" data-reveal>
              <span aria-hidden className="orbit-ring absolute left-1/2 top-1/2 h-[125%] w-[118%] -translate-x-1/2 -translate-y-1/2 rotate-[-8deg]" />
              <span aria-hidden className="planet planet-ice absolute -left-8 -top-10 h-24 w-24 md:-left-16 md:-top-14 md:h-36 md:w-36" data-speed="0.7" />
              <span aria-hidden className="planet planet-gold planet-ringed absolute -bottom-10 -right-6 h-20 w-20 md:-right-14 md:h-28 md:w-28" data-speed="1" />
              <div className="screen relative">
                <DemoReel />
              </div>
            </div>
            <p className="mt-6 text-center text-xs text-muted">Real captures from Ingot test mode on a sample repository. No real users or data.</p>
          </div>
        </section>

        {/* How it works: pinned flight path */}
        <section id="how" className="relative scroll-mt-20">
          <div data-scene="steps" className="relative flex min-h-[100svh] items-center py-24">
            <Slot className="right-[5%] top-[9%] w-24 md:w-36" state="working" />
            <div className="mx-auto w-full max-w-6xl px-5">
              <SectionTitle eyebrow="How it works" title="Three steps. Zero babysitting." />
              <div className="relative">
                <svg aria-hidden viewBox="0 0 1000 120" preserveAspectRatio="none" className="absolute left-0 top-1/2 hidden h-28 w-full -translate-y-1/2 md:block">
                  <path d="M0 60 L170 60 L210 20 L240 100 L270 60 L500 60 L540 18 L570 102 L600 60 L1000 60" fill="none" stroke="rgba(59,111,217,0.18)" strokeWidth="2" />
                  <path data-step-path d="M0 60 L170 60 L210 20 L240 100 L270 60 L500 60 L540 18 L570 102 L600 60 L1000 60" fill="none" className="step-bolt" strokeWidth="3" strokeLinejoin="round" />
                </svg>
                <ol className="relative grid gap-6 md:grid-cols-3">
                  {STEPS.map(step => (
                    <li key={step.n} data-step className="step glass relative rounded-3xl p-7">
                      <span className="font-display text-5xl font-extrabold text-gold">{step.n}</span>
                      <h3 className="mt-3 text-xl font-semibold">{step.title}</h3>
                      <p className="mt-2 leading-relaxed text-muted">{step.body}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* Features: pinned orbit system on large screens, planet cards elsewhere */}
        <section id="features" className="relative scroll-mt-20">
          <div data-scene="orbit" className="relative flex min-h-[100svh] items-center py-24">
            <Slot className="right-[5%] top-10 w-24 md:w-32 lg:hidden" state="thinking" />
            <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 lg:grid-cols-[1fr_1.1fr]">
              <div>
                <div className="text-center lg:text-left" data-reveal>
                  <Eyebrow tone="gold">Features</Eyebrow>
                  <h2 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">Powerful when you need it. Safe by default.</h2>
                  <p className="mt-5 text-lg text-muted">Everything a background bot should do, and nothing it shouldn&apos;t.</p>
                  <p data-feature-count className="mt-6 hidden font-mono text-sm font-semibold tracking-widest text-sky lg:block">01 / 08</p>
                </div>
                <div className="feature-panels mt-10 grid gap-4 sm:grid-cols-2 lg:mt-8">
                  {FEATURES.map((item, index) => (
                    <article key={item.title} data-feature-panel className="feature-panel glass flex gap-4 rounded-3xl p-6">
                      <span aria-hidden className={`planet ${PLANETS[index % PLANETS.length]} h-11 w-11 shrink-0`} />
                      <div>
                        <h3 className="flex items-center gap-2 font-semibold"><span className="text-sky"><Icon name={item.icon} className="h-4 w-4" /></span>{item.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
              <div data-orbit-system aria-hidden className="orbit-system relative mx-auto hidden aspect-square w-full max-w-[560px] lg:block">
                <span className="orbit-ring absolute left-1/2 top-1/2 w-[60%] -translate-x-1/2 -translate-y-1/2" style={{ height: "46.8%" }} />
                <span className="orbit-ring orbit-ring-outer absolute left-1/2 top-1/2 w-[92%] -translate-x-1/2 -translate-y-1/2" style={{ height: "71.8%" }} />
                <span className="sun absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full" />
                <div data-zx-slot data-zx-state="thinking" className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-44 -translate-x-1/2 -translate-y-1/2" />
                {FEATURES.map((item, index) => (
                  <span key={item.title} data-planet className="orbit-planet absolute left-1/2 top-1/2 flex flex-col items-center gap-1.5" style={orbitPosition(index, FEATURES.length, 0)}>
                    <span className={`planet ${PLANETS[index % PLANETS.length]} ${index === 2 || index === 5 ? "planet-ringed" : ""} grid h-12 w-12 place-items-center text-white`}><Icon name={item.icon} className="h-5 w-5" /></span>
                    <span className="planet-label whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold">{item.title}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Routines: satellites on a schedule */}
        <section id="routines" className="relative scroll-mt-20 py-28">
          <Slot className="left-[4%] top-8 w-20 md:w-32" state="idle" />
          <div className="mx-auto max-w-6xl px-5">
            <SectionTitle eyebrow="Routines" title="Set it once. Wake up to green builds." body="Routines run on your schedule, in your time zone. Pause one, run it now, or change it whenever you like." />
            <div className="relative grid gap-5 md:grid-cols-2">
              {ROUTINES.map((item, index) => (
                <article key={item.title} className="glass flex gap-5 rounded-3xl p-6" data-reveal={index * 0.08}>
                  <span className="satellite grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-gold"><Icon name="CalendarClock" /></span>
                  <div>
                    <p className="font-mono text-xs font-semibold uppercase tracking-wider text-sky">{item.when}</p>
                    <h3 className="mt-1 text-lg font-semibold">{item.title}</h3>
                    <p className="mt-1 text-sm text-muted">{item.body}</p>
                  </div>
                </article>
              ))}
            </div>
            <div className="mx-auto mt-14 max-w-3xl" data-reveal>
              <Screen src="/media/notifications.webp" width={1100} height={335} alt="Real Zaprex notifications tab: draft PR ready and approval needed alerts for each run" />
              <p className="mt-4 text-center text-sm text-muted">Every run that needs you, or finishes, lands in your notifications and inbox.</p>
            </div>
          </div>
        </section>

        {/* Security and approvals: mission control */}
        <section id="security" className="relative scroll-mt-20 py-28">
          <Slot className="right-[3%] top-6 w-20 md:w-28" state="approval" />
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 md:grid-cols-2">
            <div data-reveal>
              <Eyebrow>Security and approvals</Eyebrow>
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">You stay in charge. Always.</h2>
              <p className="mt-5 text-lg text-muted">Zaprex is built to be trusted with real repositories. It works in the open, asks before it acts, and never merges on its own.</p>
              <ul className="mt-8 space-y-4">
                {SECURITY.map(item => (
                  <li key={item.title} className="flex gap-3">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blue text-white shadow-[0_0_14px_rgba(59,111,217,0.7)]"><Check aria-hidden className="h-3.5 w-3.5" /></span>
                    <p><b className="font-semibold">{item.title}.</b> <span className="text-muted">{item.body}</span></p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative pb-10 md:pb-16" data-reveal="0.1">
              <Screen src="/media/approval.webp" width={1100} height={613} className="mission relative" alt="Real Zaprex chat in the Ingot dashboard: an approval card for npm install --save-dev vitest with Approve, Approve for this run and Reject, and a finished run linking its draft pull request" />
              <Screen kind="app" src="/media/app-approval.webp" width={358} height={552} sizes="220px" className="float absolute -bottom-6 -right-3 w-36 md:-right-8 md:w-48" alt="The Zaprex app on a phone asking to approve adding the date-fns dependency" />
            </div>
          </div>
        </section>

        {/* Pricing teaser: the gold planet */}
        <section id="pricing" className="relative scroll-mt-20 py-28">
          <Slot className="left-[4%] top-0 w-20 md:w-28" />
          <div className="relative mx-auto max-w-4xl px-5">
            <span aria-hidden className="planet planet-gold planet-ringed absolute -right-6 -top-16 h-40 w-40 opacity-90 md:-right-16 md:h-56 md:w-56" data-speed="0.5" />
            <div className="pricing-card relative overflow-hidden rounded-[2rem] p-10 text-center text-white sm:p-14" data-reveal>
              <p className="relative text-xs font-semibold uppercase tracking-[0.28em] text-gold">Pricing</p>
              <h2 className="font-display relative mt-3 text-3xl font-bold sm:text-5xl">Included in every paid Ingot plan</h2>
              <p className="relative mx-auto mt-4 max-w-xl text-white/80">Zaprex comes with monthly run minutes on every paid plan, alongside everything else in Ingot. No separate subscription.</p>
              <ul className="relative mt-8 grid grid-cols-2 gap-3 text-left sm:grid-cols-4" data-testid="zaprex-plans">
                {ZAPREX_PLANS.map(plan => (
                  <li key={plan.name} className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3">
                    <p className="text-sm font-semibold text-gold">{plan.name}</p>
                    <p className="mt-1 font-display text-2xl font-bold">${plan.price}<span className="text-xs font-medium text-white/70"> / {plan.per}</span></p>
                    <p className="mt-1 text-xs text-white/75">{plan.minutes} Zaprex minutes a month{plan.perSeat ? " per seat" : ""}</p>
                  </li>
                ))}
              </ul>
              <div className="relative mt-8 flex flex-wrap justify-center gap-3">
                <a href={INGOT.pricing} data-testid="cta-pricing" className="inline-flex h-12 items-center gap-2 rounded-full bg-gold px-6 font-semibold text-navy transition hover:brightness-105">See Ingot plans <ArrowRight aria-hidden className="h-4 w-4" /></a>
                <a href={INGOT.download} className="inline-flex h-12 items-center gap-2 rounded-full border border-white/30 px-6 font-semibold transition hover:bg-white/10"><Download aria-hidden className="h-4 w-4" /> Download Ingot</a>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="relative scroll-mt-20 py-28">
          <Slot className="right-[4%] top-10 w-16 md:w-24" state="thinking" />
          <div className="mx-auto max-w-3xl px-5">
            <SectionTitle eyebrow="FAQ" title="Questions, answered" />
            <div className="space-y-3">
              {FAQ.map(item => (
                <details key={item.q} className="glass group rounded-2xl px-6 py-4">
                  <summary className="flex items-center justify-between gap-4 font-semibold">
                    {item.q}
                    <span aria-hidden className="chev text-2xl leading-none text-sky transition-transform">+</span>
                  </summary>
                  <p className="mt-3 leading-relaxed text-muted">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Early access: landing */}
        <section id="early-access" className="relative scroll-mt-20 pb-28 pt-16">
          <div className="mx-auto max-w-3xl px-5 text-center">
            <div className="relative mx-auto w-40 md:w-48">
              <div data-zx-slot data-zx-state="done" className="relative aspect-square w-full">
                <ZaprexMascot id="landing" state="done" className="zx-static mascot h-full w-full" decorative />
              </div>
            </div>
            <h2 className="font-display mt-4 text-4xl font-bold tracking-tight sm:text-6xl" data-reveal>Open Zaprex</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted">Sign in with your Ingot account to start, or join early access and we&apos;ll email you as new Zaprex features roll out.</p>
            <div className="mt-8"><PrimaryCta /></div>
            <div className="mt-10"><WaitlistForm /></div>
            <p className="mt-3 text-xs text-muted">Only product updates. Unsubscribe anytime. See the <a className="underline hover:text-ink" href={INGOT.privacy}>privacy policy</a>.</p>
          </div>
        </section>
      </main>

      <footer className="glass-bar relative z-10 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-5 text-sm text-muted md:flex-row">
          <div className="flex items-center gap-2.5">
            <ZaprexMascot id="footer" className="h-8 w-8" decorative />
            <span><b className="text-ink">Zaprex</b> is part of <a href={INGOT.portal} className="font-semibold text-ink hover:text-sky">Ingot</a>, the open-source AI IDE.</span>
          </div>
          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 md:ml-auto" aria-label="Footer">
            <Link href="/docs" className="hover:text-ink">Docs</Link>
            <Link href="/app" className="hover:text-ink">App</Link>
            <a href={INGOT.download} className="hover:text-ink">Download Ingot</a>
            <a href={INGOT.pricing} className="hover:text-ink">Pricing</a>
            <a href={INGOT.github} className="hover:text-ink" rel="noopener noreferrer">GitHub</a>
            <a href={INGOT.support} className="hover:text-ink">Support</a>
            <a href={INGOT.terms} className="hover:text-ink">Terms</a>
            <Link href="/about" className="hover:text-ink">About</Link>
            <a href={INGOT.privacy} className="hover:text-ink">Privacy</a>
          </nav>
          <p className="md:ml-4">© 2026 Ingot</p>
        </div>
      </footer>
    </>
  );
}
