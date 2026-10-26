"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

export type SearchEntry = { slug: string; title: string; description: string; text: string; headings: { id: string; text: string }[] };

/** Client-side docs search over titles, headings and text. "/" or Cmd/Ctrl+K focuses it; arrows + Enter navigate. */
export function DocsSearch({ index }: { index: SearchEntry[] }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const typing = event.target instanceof HTMLElement && /input|textarea|select/i.test(event.target.tagName);
      if ((event.key === "/" && !typing) || (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey))) {
        event.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const words = q.split(/\s+/);
    return index
      .map(entry => {
        const title = entry.title.toLowerCase();
        const text = entry.text.toLowerCase();
        if (!words.every(word => title.includes(word) || text.includes(word))) return null;
        const heading = entry.headings.find(h => words.every(word => h.text.toLowerCase().includes(word)));
        const at = text.indexOf(words[0]);
        const snippet = at >= 0 ? `${at > 40 ? "…" : ""}${entry.text.slice(Math.max(0, at - 40), at + 90)}…` : entry.description;
        const score = (title.includes(q) ? 10 : 0) + (heading ? 5 : 0) + words.filter(word => title.includes(word)).length;
        return { entry, heading, snippet, score };
      })
      .filter((result): result is NonNullable<typeof result> => result !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }, [index, query]);

  const go = (n: number) => {
    const result = results[n];
    if (!result) return;
    setOpen(false);
    setQuery("");
    router.push(`/docs/${result.entry.slug}${result.heading ? `#${result.heading.id}` : ""}`);
  };

  return (
    <div className="relative w-full" data-testid="docs-search">
      <label htmlFor="docs-search" className="sr-only">Search the docs</label>
      <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        ref={input}
        id="docs-search"
        type="search"
        value={query}
        placeholder="Search docs"
        autoComplete="off"
        role="combobox"
        aria-expanded={open && results.length > 0}
        aria-controls="docs-search-results"
        onChange={event => {
          setQuery(event.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 150)}
        onKeyDown={event => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActive(n => Math.min(results.length - 1, n + 1));
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActive(n => Math.max(0, n - 1));
          } else if (event.key === "Enter") go(active);
          else if (event.key === "Escape") setOpen(false);
        }}
        className="h-10 w-full rounded-full border border-line bg-surface pl-9 pr-12 text-sm text-ink placeholder:text-muted focus:border-blue focus:outline-none focus:ring-4 focus:ring-blue/20"
      />
      <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-line px-1.5 text-[10px] text-muted">/</kbd>
      {open && query.trim() && (
        <ul id="docs-search-results" role="listbox" className="absolute left-0 right-0 top-12 z-50 max-h-[70vh] overflow-auto rounded-2xl border border-line bg-bg p-2 shadow-2xl shadow-black/40">
          {results.length === 0 && <li className="px-3 py-2 text-sm text-muted">No results for “{query}”</li>}
          {results.map((result, n) => (
            <li key={result.entry.slug} role="option" aria-selected={n === active}>
              <button type="button" onMouseDown={() => go(n)} onMouseEnter={() => setActive(n)} className={`w-full rounded-xl px-3 py-2 text-left ${n === active ? "bg-blue/15" : ""}`}>
                <span className="block text-sm font-semibold text-ink">{result.entry.title}{result.heading ? <span className="font-normal text-muted"> · {result.heading.text}</span> : null}</span>
                <span className="mt-0.5 block truncate text-xs text-muted">{result.snippet}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
