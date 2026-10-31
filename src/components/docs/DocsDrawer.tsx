"use client";

import { PanelLeft } from "lucide-react";
import { useRef, useState } from "react";
import { DocsNav } from "@/components/docs/DocsNav";
import { Drawer } from "@/components/nav/Drawer";

type Item = { slug: string; title: string; group: string };

/** Below `lg`, the docs sidebar opens as a drawer from the start side. */
export function DocsDrawer({ items, groups }: { items: Item[]; groups: readonly string[] }) {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button ref={toggle} type="button" onClick={() => setOpen(true)} aria-expanded={open} aria-controls="docs-drawer" aria-haspopup="dialog" data-testid="docs-drawer-toggle"
        className="glass inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold">
        <PanelLeft aria-hidden className="h-4 w-4 text-sky rtl:-scale-x-100" /> Docs menu
      </button>
      <Drawer id="docs-drawer" open={open} onClose={() => setOpen(false)} label="Docs menu" closeLabel="Close docs menu" side="start" testId="docs-drawer" returnFocusTo={toggle}
        title={<span className="font-display text-lg font-bold">Docs</span>}>
        <DocsNav items={items} groups={groups} />
      </Drawer>
    </>
  );
}
