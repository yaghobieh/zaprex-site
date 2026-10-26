"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { slug: string; title: string; group: string };

/** Sidebar navigation, grouped, with the current page highlighted. */
export function DocsNav({ items, groups }: { items: Item[]; groups: readonly string[] }) {
  const path = usePathname();
  return (
    <nav aria-label="Docs" className="space-y-6 text-sm">
      <Link href="/docs" className={`block rounded-lg px-3 py-1.5 font-semibold ${path === "/docs" ? "bg-blue/15 text-ink" : "text-muted hover:text-ink"}`}>Overview</Link>
      {groups.map(group => (
        <div key={group}>
          <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">{group}</p>
          <ul className="space-y-0.5">
            {items.filter(item => item.group === group).map(item => {
              const current = path === `/docs/${item.slug}`;
              return (
                <li key={item.slug}>
                  <Link href={`/docs/${item.slug}`} aria-current={current ? "page" : undefined} className={`block rounded-lg px-3 py-1.5 transition ${current ? "bg-blue/15 font-semibold text-ink" : "text-muted hover:bg-surface hover:text-ink"}`}>
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
