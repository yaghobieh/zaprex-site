"use client";

import { ArrowUpRight, BookOpen, Code, Download, House, Info, Menu, MessageCircle, Rocket, Store, Tag, Undo2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { AccountButton } from "@/components/AccountButton";
import { ZaprexMascot } from "@/components/mascot/ZaprexMascot";
import { Drawer } from "@/components/nav/Drawer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { askRexVisible } from "@/lib/ask-rex";
import { INGOT } from "@/lib/site";

type Section = { readonly href: string; readonly label: string };

const PAGES = [
  { href: "/", label: "Home", Icon: House },
  { href: "/docs", label: "Docs", Icon: BookOpen },
  { href: "/app", label: "Open the Zaprex app", Icon: Rocket },
  { href: "/about", label: "About", Icon: Info },
] as const;

const INGOT_LINKS = [
  { href: INGOT.pricing, label: "Pricing and plans", Icon: Tag },
  { href: INGOT.marketplace, label: "Templates store", Icon: Store },
  { href: INGOT.download, label: "Download Ingot", Icon: Download },
  { href: INGOT.github, label: "GitHub", Icon: Code },
  { href: INGOT.site, label: "Back to Ingot", Icon: Undo2 },
] as const;

const ROW = "flex min-h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-medium transition hover:bg-bg-soft";

function openAskRex() {
  const trigger = document.querySelector<HTMLElement>('[data-testid="ask-rex-trigger"]');
  if (trigger?.getAttribute("aria-expanded") !== "true") trigger?.click();
}

/**
 * Phone navigation: a 44px hamburger that opens a slide-in menu with every header link, Ask Rex, theme and account.
 * `sections` are in-page anchors (home page); `className` decides where the button shows (default: up to 768px).
 */
export function MobileNav({ id = "mobile-nav", sections = [], className = "desktop:hidden" }: { id?: string; sections?: readonly Section[]; className?: string }) {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const close = () => setOpen(false);

  return (
    <>
      <button ref={toggle} type="button" onClick={() => setOpen(value => !value)} aria-label="Menu" aria-expanded={open} aria-controls={id} aria-haspopup="dialog" data-testid="mobile-nav-toggle"
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line bg-surface text-ink transition hover:border-blue ${className}`}>
        <Menu aria-hidden className="h-5 w-5" />
      </button>
      <Drawer id={id} open={open} onClose={close} label="Site menu" testId="mobile-nav" returnFocusTo={toggle}
        title={(
          <span className="flex items-center gap-2">
            <ZaprexMascot id={`${id}-mark`} className="h-9 w-9" decorative />
            <span className="font-display text-lg font-extrabold tracking-tight">Zaprex</span>
            <span className="rounded-full border border-gold/50 bg-gold/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-gold" data-testid="mobile-nav-beta">Beta</span>
          </span>
        )}>
        <nav aria-label="Site" className="space-y-5">
          {sections.length > 0 && (
            <div>
              <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">On this page</p>
              <ul className="grid grid-cols-2 gap-1">
                {sections.map(item => <li key={item.href}><a href={item.href} className={`${ROW} text-muted hover:text-ink`}>{item.label}</a></li>)}
              </ul>
            </div>
          )}
          <ul className="space-y-0.5">
            {PAGES.map(({ href, label, Icon }) => {
              const current = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
              return (
                <li key={href}>
                  <Link href={href} aria-current={current ? "page" : undefined} className={`${ROW} ${current ? "bg-blue/15 text-ink" : ""}`}>
                    <Icon aria-hidden className="h-[18px] w-[18px] text-sky" /> {label}
                  </Link>
                </li>
              );
            })}
            {askRexVisible(pathname) && (
              <li>
                <button type="button" onClick={() => { close(); requestAnimationFrame(openAskRex); }} className={`${ROW} w-full text-start`} data-testid="mobile-nav-ask-rex">
                  <MessageCircle aria-hidden className="h-[18px] w-[18px] text-sky" /> Ask Rex
                </button>
              </li>
            )}
          </ul>
          <div>
            <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">Ingot</p>
            <ul className="space-y-0.5">
              {INGOT_LINKS.map(({ href, label, Icon }) => (
                <li key={href}>
                  <a href={href} className={ROW}>
                    <Icon aria-hidden className="h-[18px] w-[18px] text-muted" /> <span className="flex-1">{label}</span>
                    <ArrowUpRight aria-hidden className="h-4 w-4 text-muted rtl:-scale-x-100" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
        <div className="mt-5 space-y-4 border-t border-line px-3 pt-5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-muted">Theme</span>
            <ThemeToggle />
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-muted">Account</span>
            <AccountButton />
          </div>
        </div>
      </Drawer>
    </>
  );
}
