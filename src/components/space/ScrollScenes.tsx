"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect } from "react";
import { SCROLL_LOCK_EVENT } from "@/lib/scroll-lock";
import { ScrollTrigger, gsap, prefersReducedMotion } from "./gsap";

const MOTION = "(prefers-reduced-motion: no-preference)";

/** Smooth scroll (Lenis) driving GSAP ScrollTrigger scenes: reveals, parallax planets, and the pinned steps + orbit. */
export function ScrollScenes() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const root = document.documentElement;
    root.classList.add("zx-motion");

    const lenis = new Lenis({ autoRaf: false, lerp: 0.1, anchors: { offset: -72 } });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    const onScrollLock = (event: Event) => ((event as CustomEvent<boolean>).detail ? lenis.stop() : lenis.start());
    window.addEventListener(SCROLL_LOCK_EVENT, onScrollLock);

    const mm = gsap.matchMedia();

    mm.add(MOTION, () => {
      // Hero copy drifts up and fades as you launch.
      gsap.to("[data-hero-copy]", { yPercent: -18, opacity: 0, ease: "none", scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom 20%", scrub: true } });
      gsap.to("[data-nebula='a']", { yPercent: -30, ease: "none", scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: true } });
      gsap.to("[data-nebula='b']", { yPercent: -60, ease: "none", scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: true } });

      for (const el of gsap.utils.toArray<HTMLElement>("[data-reveal]")) {
        gsap.from(el, { opacity: 0, y: 48, scale: 0.97, duration: 0.9, ease: "power3.out", delay: Number(el.dataset.reveal || 0), scrollTrigger: { trigger: el, start: "top 88%", once: true } });
      }
      for (const el of gsap.utils.toArray<HTMLElement>("[data-speed]")) {
        const speed = Number(el.dataset.speed);
        gsap.fromTo(el, { y: () => 120 * speed }, { y: () => -120 * speed, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
      }
    });

    // Pinned "How it works": a lightning path draws across the three steps, lighting each one in turn.
    mm.add(`(min-width: 768px) and ${MOTION}`, () => {
      const scene = document.querySelector<HTMLElement>("[data-scene='steps']");
      if (!scene) return;
      const steps = gsap.utils.toArray<HTMLElement>("[data-step]", scene);
      const path = scene.querySelector<SVGPathElement>("[data-step-path]");
      const length = path?.getTotalLength() ?? 0;
      if (path) gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
      const setActive = (index: number) => steps.forEach((step, i) => (step.dataset.active = String(i <= index)));
      setActive(0);
      ScrollTrigger.create({
        trigger: scene,
        start: "top top",
        end: "+=170%",
        pin: true,
        scrub: true,
        onUpdate: self => {
          if (path) path.style.strokeDashoffset = String(length * (1 - self.progress));
          setActive(Math.min(steps.length - 1, Math.floor(self.progress * steps.length)));
        },
      });
      return () => steps.forEach(step => delete step.dataset.active);
    });

    // Pinned features orbit: planets circle Zaprex while each feature takes the spotlight.
    mm.add(`(min-width: 1024px) and ${MOTION}`, () => {
      const scene = document.querySelector<HTMLElement>("[data-scene='orbit']");
      if (!scene) return;
      const planets = gsap.utils.toArray<HTMLElement>("[data-planet]", scene);
      const panels = gsap.utils.toArray<HTMLElement>("[data-feature-panel]", scene);
      const counter = scene.querySelector<HTMLElement>("[data-feature-count]");
      let current = -1;
      const place = (progress: number) => {
        planets.forEach((planet, i) => {
          const ring = i % 2 ? 0.92 : 0.6;
          const angle = (i / planets.length) * Math.PI * 2 + progress * Math.PI * (i % 2 ? -0.9 : 1.2) - Math.PI / 2;
          planet.style.left = `${50 + Math.cos(angle) * ring * 50}%`;
          planet.style.top = `${50 + Math.sin(angle) * ring * 39}%`;
        });
        const index = Math.min(panels.length - 1, Math.floor(progress * panels.length));
        if (index === current) return;
        current = index;
        panels.forEach((panel, i) => (panel.dataset.active = String(i === index)));
        planets.forEach((planet, i) => (planet.dataset.active = String(i === index)));
        if (counter) counter.textContent = `${String(index + 1).padStart(2, "0")} / ${String(panels.length).padStart(2, "0")}`;
      };
      place(0);
      ScrollTrigger.create({ trigger: scene, start: "top top", end: "+=320%", pin: true, scrub: true, onUpdate: self => place(self.progress), onRefresh: self => place(self.progress) });
      return () => {
        planets.forEach(planet => delete planet.dataset.active);
        panels.forEach(panel => delete panel.dataset.active);
      };
    });

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh);
    requestAnimationFrame(refresh);

    return () => {
      window.removeEventListener("load", refresh);
      window.removeEventListener(SCROLL_LOCK_EVENT, onScrollLock);
      mm.revert();
      gsap.ticker.remove(tick);
      lenis.destroy();
      root.classList.remove("zx-motion");
    };
  }, []);

  return null;
}
