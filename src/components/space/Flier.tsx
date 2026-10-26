"use client";

import { useEffect, useRef, useState } from "react";
import { MASCOT_LAYERS } from "@/components/mascot/ZaprexMascot";
import { zaprexMascotSvg, type ZaprexState } from "@/components/mascot/zaprex-mascot";
import { ScrollTrigger, prefersReducedMotion } from "./gsap";

/** A place on the page where Zaprex should be when that spot is centred on screen (or for the length of a pin). */
type Stop = { start: number; end: number; x: number; y: number; w: number; state: ZaprexState };
type TrailPoint = { x: number; wy: number; t: number };

const SPRITE = 520;
const TRAIL_MS = 650;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function measure(): Stop[] {
  const vh = window.innerHeight;
  const max = Math.max(1, document.documentElement.scrollHeight - vh);
  const pins = ScrollTrigger.getAll().filter(st => st.pin);
  const stops: Stop[] = [];
  for (const slot of document.querySelectorAll<HTMLElement>("[data-zx-slot]")) {
    const rect = slot.getBoundingClientRect();
    if (rect.width < 4 || getComputedStyle(slot).display === "none") continue;
    const x = rect.left + rect.width / 2;
    const state = (slot.dataset.zxState as ZaprexState | undefined) ?? "idle";
    const pin = pins.find(st => st.pin instanceof HTMLElement && st.pin.contains(slot));
    if (pin && pin.pin instanceof HTMLElement) {
      const pinTop = pin.pin.getBoundingClientRect().top;
      stops.push({ start: pin.start, end: pin.end, x, y: rect.top - pinTop + rect.height / 2, w: rect.width, state });
      continue;
    }
    const docY = rect.top + window.scrollY + rect.height / 2;
    const at = Math.min(max, Math.max(0, docY - vh * 0.5));
    stops.push({ start: at, end: at, x, y: docY - at, w: rect.width, state });
  }
  return stops.sort((a, b) => a.start - b.start);
}

function target(stops: Stop[], scroll: number): Stop & { arc: number } {
  if (!stops.length) return { start: 0, end: 0, x: -999, y: -999, w: 0, arc: 0, state: "idle" };
  if (scroll < stops[0].start) return { ...stops[0], y: stops[0].y + (stops[0].start - scroll), arc: 0 };
  if (scroll <= stops[0].end) return { ...stops[0], arc: 0 };
  for (let i = 0; i < stops.length - 1; i += 1) {
    const a = stops[i];
    const b = stops[i + 1];
    if (scroll <= b.start) {
      // Linger near each stop, then fly the middle of the gap, so he is rarely mid-air over content when you stop.
      const raw = (scroll - a.end) / Math.max(1, b.start - a.end);
      const t = ease(Math.min(1, Math.max(0, (raw - 0.12) / 0.6)));
      const state: ZaprexState = t <= 0 ? a.state : t >= 1 ? b.state : "working";
      return { start: 0, end: 0, x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, w: a.w + (b.w - a.w) * t, arc: Math.sin(Math.PI * t) * (i % 2 ? 1 : -1), state };
    }
    if (scroll <= b.end) return { ...b, arc: 0 };
  }
  // Past the last stop he stays parked on it, scrolling with the page like the landing spot does.
  const last = stops[stops.length - 1];
  return { ...last, y: last.y - (scroll - last.end), arc: 0 };
}

/**
 * Zaprex himself: one fixed sprite that flies between the `[data-zx-slot]` spots as you scroll, banking into turns and
 * leaving a crackling blue lightning trail in "world" space (so it streams away behind him). Hidden for reduced motion,
 * where the in-page static mascots stay visible instead.
 */
export function Flier() {
  const [enabled, setEnabled] = useState(false);
  const sprite = useRef<HTMLDivElement>(null);
  const trail = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- motion preference is only known in the browser
    setEnabled(!prefersReducedMotion());
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const img = sprite.current;
    const canvas = trail.current;
    const ctx = canvas?.getContext("2d");
    if (!img || !canvas || !ctx) return;

    let stops = measure();
    let frame = 0;
    let width = 0;
    let height = 0;
    const pos = { x: -999, y: -999, s: 0.5, r: 0, face: 1 };
    let placed = false;
    let shown: ZaprexState | null = null;
    img.innerHTML = zaprexMascotSvg({ ...MASCOT_LAYERS, id: "flier", title: "Zaprex" });
    const svg = img.querySelector("svg");
    const points: TrailPoint[] = [];

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1 : 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const remeasure = () => {
      stops = measure();
    };

    const bolt = (from: TrailPoint, to: TrailPoint, scroll: number, jitter: number) => {
      const ax = from.x;
      const ay = from.wy - scroll;
      const bx = to.x;
      const by = to.wy - scroll;
      const dx = bx - ax;
      const dy = by - ay;
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;
      const steps = Math.max(1, Math.round(len / 14));
      const path: [number, number][] = [[ax, ay]];
      for (let k = 1; k < steps; k += 1) {
        const f = k / steps;
        const off = (Math.random() - 0.5) * jitter;
        path.push([ax + dx * f + nx * off, ay + dy * f + ny * off]);
      }
      path.push([bx, by]);
      return path;
    };

    const stroke = (path: [number, number][], color: string, widthPx: number) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = widthPx;
      ctx.beginPath();
      ctx.moveTo(path[0][0], path[0][1]);
      for (let k = 1; k < path.length; k += 1) ctx.lineTo(path[k][0], path[k][1]);
      ctx.stroke();
    };

    const loop = (now: number) => {
      const scroll = window.scrollY;
      const goal = target(stops, scroll);
      if (svg && goal.state !== shown) {
        shown = goal.state;
        svg.dataset.state = goal.state;
      }
      const scale = goal.w / SPRITE;
      const arcX = goal.arc * Math.min(160, width * 0.14);
      const gx = goal.x + arcX;
      const gy = goal.y - Math.abs(goal.arc) * 40;
      if (!placed) {
        Object.assign(pos, { x: gx, y: gy, s: scale });
        placed = true;
      }
      const px = pos.x;
      const py = pos.y;
      pos.x += (gx - pos.x) * 0.1;
      pos.y += (gy - pos.y) * 0.1;
      pos.s += (scale - pos.s) * 0.1;
      const vx = pos.x - px;
      const vy = pos.y - py;
      const speed = Math.hypot(vx, vy);
      if (vx < -1.2) pos.face += (-1 - pos.face) * 0.2;
      else if (vx > 1.2) pos.face += (1 - pos.face) * 0.2;
      pos.r += (Math.max(-18, Math.min(18, vy * 0.9 + vx * 0.25)) - pos.r) * 0.12;
      const bob = Math.sin(now * 0.0016) * 8 * pos.s;
      const face = Math.abs(pos.face) < 0.08 ? 0.08 * Math.sign(pos.face || 1) : pos.face;
      img.style.transform = `translate3d(${pos.x - SPRITE / 2}px, ${pos.y - SPRITE / 2 + bob}px, 0) rotate(${pos.r * Math.sign(face)}deg) scale(${pos.s * face}, ${pos.s})`;

      // Lightning trail, emitted from the tail (left of the sprite when facing right).
      const tailX = pos.x - SPRITE * pos.s * 0.32 * Math.sign(face);
      const tailY = pos.y + bob + SPRITE * pos.s * 0.14;
      const last = points[points.length - 1];
      const wy = tailY + scroll;
      if (!last || Math.hypot(last.x - tailX, last.wy - wy) > 6) points.push({ x: tailX, wy, t: now });
      while (points.length && now - points[0].t > TRAIL_MS) points.shift();

      ctx.clearRect(0, 0, width, height);
      if (points.length > 1) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        for (let i = 1; i < points.length; i += 1) {
          const life = 1 - (now - points[i].t) / TRAIL_MS;
          if (life <= 0) continue;
          const path = bolt(points[i - 1], points[i], scroll, 18 * life + 4);
          const w = Math.max(0.6, pos.s * 2.4);
          stroke(path, `rgba(59, 111, 217, ${0.22 * life})`, 14 * w * life);
          stroke(path, `rgba(120, 160, 255, ${0.6 * life})`, 4 * w * life);
          stroke(path, `rgba(236, 242, 255, ${0.95 * life})`, 1.4 * w);
          if (Math.random() < 0.06 * life) {
            const [bx, by] = path[path.length - 1];
            const branch = bolt({ x: bx, wy: by + scroll, t: now }, { x: bx + (Math.random() - 0.5) * 70, wy: by + scroll + (Math.random() - 0.3) * 70, t: now }, scroll, 14);
            stroke(branch, `rgba(150, 185, 255, ${0.7 * life})`, 1.2 * w);
          }
          if (Math.random() < 0.04 * life) {
            const [sx, sy] = path[0];
            ctx.fillStyle = `rgba(217, 160, 78, ${0.9 * life})`;
            ctx.beginPath();
            ctx.arc(sx + (Math.random() - 0.5) * 20, sy + (Math.random() - 0.5) * 20, 1.6 * w, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      canvas.style.opacity = String(Math.min(1, 0.25 + speed / 6));
      frame = requestAnimationFrame(loop);
    };

    const start = () => {
      size();
      remeasure();
      document.documentElement.classList.add("zx-flying");
      frame = requestAnimationFrame(loop);
    };
    const onResize = () => {
      size();
      remeasure();
    };

    // Layout settles late (fonts, images, pin spacers), so re-measure whenever the page size changes.
    const observer = new ResizeObserver(remeasure);
    observer.observe(document.body);
    const timers = [400, 1200, 3000].map(ms => window.setTimeout(remeasure, ms));
    ScrollTrigger.addEventListener("refresh", remeasure);
    window.addEventListener("resize", onResize);
    // Wait for the artwork so the in-page mascots are only hidden once the flier can be seen.
    const preload = new Image();
    preload.src = MASCOT_LAYERS.body;
    preload.decode().catch(() => undefined).finally(start);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      timers.forEach(timer => window.clearTimeout(timer));
      ScrollTrigger.removeEventListener("refresh", remeasure);
      window.removeEventListener("resize", onResize);
      document.documentElement.classList.remove("zx-flying");
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <>
      <canvas ref={trail} aria-hidden className="pointer-events-none fixed inset-0 z-[4] h-full w-full transition-opacity duration-300" />
      <div
        ref={sprite}
        aria-hidden
        className="zx-sprite pointer-events-none fixed left-0 top-0 z-[5] will-change-transform"
        style={{ width: SPRITE, height: SPRITE, transform: "translate3d(-9999px,0,0)", transformOrigin: "50% 50%" }}
      />
    </>
  );
}
