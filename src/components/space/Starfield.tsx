"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "./gsap";

type Star = { x: number; y: number; r: number; a: number; tw: number; ph: number; gold: boolean };
type Layer = { speed: number; stars: Star[] };

const LAYERS = [
  { speed: 0.04, density: 1 / 5200, rMin: 0.35, rMax: 0.9 },
  { speed: 0.12, density: 1 / 14000, rMin: 0.7, rMax: 1.4 },
  { speed: 0.3, density: 1 / 52000, rMin: 1.1, rMax: 2.1 },
];

/**
 * Full-screen parallax starfield on a single 2D canvas. Three depth layers drift with the scroll position, and stars
 * stretch into short streaks while you scroll fast, so the page feels like flying. Static frame for reduced motion.
 */
export function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = prefersReducedMotion();
    let width = 0;
    let height = 0;
    let layers: Layer[] = [];
    let light = document.documentElement.dataset.theme === "light";
    let frame = 0;
    let lastY = window.scrollY;
    let velocity = 0;

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, width < 768 ? 1.25 : 1.6);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const area = width * height;
      layers = LAYERS.map(spec => ({
        speed: spec.speed,
        stars: Array.from({ length: Math.min(420, Math.round(area * spec.density)) }, () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          r: spec.rMin + Math.random() * (spec.rMax - spec.rMin),
          a: 0.35 + Math.random() * 0.65,
          tw: 0.6 + Math.random() * 2.2,
          ph: Math.random() * Math.PI * 2,
          gold: Math.random() < 0.08,
        })),
      }));
    };

    const draw = (time: number) => {
      const scroll = reduced ? 0 : window.scrollY;
      velocity += (scroll - lastY - velocity) * 0.25;
      lastY = scroll;
      ctx.clearRect(0, 0, width, height);
      const base = light ? "27, 38, 71" : "226, 234, 255";
      const gold = light ? "176, 120, 40" : "240, 196, 120";
      for (const layer of layers) {
        const offset = scroll * layer.speed;
        const streak = reduced ? 0 : Math.min(48, Math.abs(velocity) * layer.speed * 2.2);
        for (const star of layer.stars) {
          let y = (star.y - offset) % height;
          if (y < 0) y += height;
          const twinkle = reduced ? 1 : 0.72 + 0.28 * Math.sin(time * 0.001 * star.tw + star.ph);
          const alpha = star.a * twinkle * (light ? 0.55 : 1);
          const rgb = star.gold ? gold : base;
          if (streak > 1.5) {
            ctx.strokeStyle = `rgba(${rgb}, ${alpha * 0.8})`;
            ctx.lineWidth = star.r * 1.4;
            ctx.beginPath();
            ctx.moveTo(star.x, y);
            ctx.lineTo(star.x, y + Math.sign(velocity) * streak);
            ctx.stroke();
          } else {
            ctx.fillStyle = `rgba(${rgb}, ${alpha})`;
            ctx.beginPath();
            ctx.arc(star.x, y, star.r, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    };

    const loop = (time: number) => {
      draw(time);
      frame = requestAnimationFrame(loop);
    };

    const onResize = () => {
      build();
      if (reduced) draw(0);
    };
    const themeObserver = new MutationObserver(() => {
      light = document.documentElement.dataset.theme === "light";
      if (reduced) draw(0);
    });

    build();
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    window.addEventListener("resize", onResize);
    if (reduced) draw(0);
    else frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      themeObserver.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-0 h-full w-full" />;
}
