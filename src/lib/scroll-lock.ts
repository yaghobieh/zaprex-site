/** Page scroll lock for drawers. Lenis (home page) listens for this event and stops/starts its smooth scroll. */
export const SCROLL_LOCK_EVENT = "zx:scroll-lock";

let locks = 0;

function sync() {
  const root = document.documentElement;
  if (locks > 0) root.dataset.scrollLocked = "";
  else delete root.dataset.scrollLocked;
  window.dispatchEvent(new CustomEvent<boolean>(SCROLL_LOCK_EVENT, { detail: locks > 0 }));
}

/** Locks page scroll and returns the matching unlock (safe to call more than once). */
export function lockScroll(): () => void {
  locks += 1;
  sync();
  let released = false;
  return () => {
    if (released) return;
    released = true;
    locks = Math.max(0, locks - 1);
    sync();
  };
}
