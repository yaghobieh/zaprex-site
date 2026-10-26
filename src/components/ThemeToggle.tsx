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

export function ThemeToggle() {
  const [pref, setPref] = useState<Pref>("system");

  useEffect(() => {
    const saved = localStorage.getItem(KEY) as Pref | null;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync the saved preference after hydration
    if (saved === "light" || saved === "dark") setPref(saved);
  }, []);

  useEffect(() => {
    apply(pref);
    if (pref !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => apply("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [pref]);

  const choose = (value: Pref) => {
    setPref(value);
    if (value === "system") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, value);
  };

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
