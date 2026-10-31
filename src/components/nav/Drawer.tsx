"use client";

import { X } from "lucide-react";
import { useEffect, useEffectEvent, useRef, useSyncExternalStore, type KeyboardEvent, type MouseEvent, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { lockScroll } from "@/lib/scroll-lock";

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
const noopSubscribe = () => () => {};

type Props = {
  id: string;
  open: boolean;
  onClose: () => void;
  label: string;
  closeLabel?: string;
  /** Logical side: "end" is the right in LTR and the left in RTL. */
  side?: "start" | "end";
  title?: ReactNode;
  testId?: string;
  /** Gets focus back on close (Safari does not focus a tapped button, so document.activeElement is not enough). */
  returnFocusTo?: RefObject<HTMLElement | null>;
  children: ReactNode;
};

/**
 * Full-height slide-in panel for phones. Portaled to <body> because the glass header's backdrop-filter would otherwise
 * become the containing block of a fixed panel. Closes on Escape, backdrop tap and link tap; locks page scroll; traps focus.
 */
export function Drawer({ id, open, onClose, label, closeLabel = "Close menu", side = "end", title, testId, returnFocusTo, children }: Props) {
  const client = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const panel = useRef<HTMLDivElement>(null);
  const close = useEffectEvent(onClose);

  useEffect(() => {
    if (!open) return;
    const opener = returnFocusTo?.current ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    const unlock = lockScroll();
    panel.current?.querySelector<HTMLElement>("[data-drawer-close]")?.focus();
    const onKey = (event: globalThis.KeyboardEvent) => { if (event.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      unlock();
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, [open, returnFocusTo]);

  const trapFocus = (event: KeyboardEvent) => {
    if (event.key !== "Tab" || !panel.current) return;
    const items = [...panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(item => item.offsetParent !== null);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };

  const closeOnLinkTap = (event: MouseEvent) => {
    if ((event.target as Element).closest("a[href]")) onClose();
  };

  if (!client) return null;
  return createPortal(
    <div hidden={!open} className="zx-drawer" data-side={side} data-testid={testId}>
      <div aria-hidden className="zx-drawer-backdrop" onClick={onClose} data-testid={testId ? `${testId}-backdrop` : undefined} />
      <div ref={panel} id={id} role="dialog" aria-modal="true" aria-label={label} className="zx-drawer-panel" onKeyDown={trapFocus} onClick={closeOnLinkTap}>
        <div className="flex min-h-16 shrink-0 items-center gap-3 border-b border-line ps-4 pe-2 pt-[env(safe-area-inset-top)]">
          <div className="min-w-0 flex-1">{title}</div>
          <button type="button" data-drawer-close onClick={onClose} aria-label={closeLabel} data-testid={testId ? `${testId}-close` : undefined}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted transition hover:bg-bg-soft hover:text-ink">
            <X aria-hidden className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3" data-lenis-prevent>
          {open ? children : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}
