"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The muted demo loop. Nothing downloads until it is near the viewport; it plays only while visible and never autoplays
 * for reduced-motion visitors (they get the poster and native controls instead).
 */
export function DemoReel() {
  const ref = useRef<HTMLVideoElement>(null);
  const [load, setLoad] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(prefersReduced);
    const near = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setLoad(true);
        near.disconnect();
      }
    }, { rootMargin: "600px 0px" });
    const visible = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (prefersReduced) return;
        if (entry.isIntersecting) video.play().catch(() => undefined);
        else video.pause();
      }
    }, { threshold: 0.35 });
    near.observe(video);
    visible.observe(video);
    return () => {
      near.disconnect();
      visible.disconnect();
    };
  }, []);

  useEffect(() => {
    if (load) ref.current?.load();
  }, [load]);

  return (
    <video
      ref={ref}
      className="block aspect-video h-auto w-full bg-[#0b1020]"
      poster="/media/zaprex-reel-poster.webp"
      muted
      loop
      playsInline
      preload="none"
      controls={reduced}
      aria-label="Demo reel: giving Zaprex a task, approving a dependency, following the run log, and getting a draft pull request. Real captures from Ingot test mode."
      data-testid="demo-reel"
    >
      {load && <source src="/media/zaprex-reel.webm" type="video/webm" />}
      {load && <source src="/media/zaprex-reel.mp4" type="video/mp4" />}
    </video>
  );
}
