"use client";

import { Laptop, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type Pref = "light" | "dark" | "system";
const KEY = "zaprex-theme";
const OPTIONS: { value: Pref; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Laptop },
];

function apply(pref: Pref) {
  const dark = pref === "dark" || (pref === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
}

/** Dark (deep space) is the default; Light and System are explicit choices that we remember. */
function savedPref(): Pref {
  const value = localStorage.getItem(KEY);
  return value === "light" || value === "system" ? value : "dark";
}

/** `compact` (IDEA-193): one round button that cycles Dark, Light, System, for the phone app bar. */
export function ThemeToggle({ compact = false }: { compact?: boolean } = {}) {
  const [pref, setPref] = useState<Pref | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync the saved preference after hydration
    setPref(savedPref());
  }, []);

  useEffect(() => {
    if (!pref) return;
    apply(pref);
    if (pref !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => apply("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [pref]);

  const choose = (value: Pref) => {
    setPref(value);
    if (value === "dark") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, value);
  };

  if (compact) {
    const current = OPTIONS.find(option => option.value === (pref ?? "dark")) ?? OPTIONS[1];
    const next = OPTIONS[(OPTIONS.indexOf(current) + 1) % OPTIONS.length];
    return (
      <button type="button" onClick={() => choose(next.value)} title={`Theme: ${current.label} (tap for ${next.label})`} aria-label={`Theme: ${current.label}. Switch to ${next.label}`} data-testid="theme-cycle"
        className="zx-round grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted transition hover:text-ink">
        <current.Icon aria-hidden className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div role="radiogroup" aria-label="Theme" className="flex items-center gap-0.5 rounded-full border border-line bg-surface p-0.5">
      {OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={pref === value}
          title={label}
          data-testid={`theme-${value}`}
          onClick={() => choose(value)}
          className={`grid h-7 w-7 place-items-center rounded-full transition ${pref === value ? "bg-navy text-white dark:bg-blue" : "text-muted hover:text-ink"}`}
        >
          <Icon aria-hidden className="h-3.5 w-3.5" />
          <span className="sr-only">{label}</span>
        </button>
      ))}
    </div>
  );
}
