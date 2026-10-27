"use client";

import { useEffect, useMemo, useRef } from "react";
import { MASCOT_LAYERS } from "@/components/mascot/ZaprexMascot";
import { zaprexMascotSvg } from "@/components/mascot/zaprex-mascot";
import type { Pose } from "@/lib/bot";

/** The T-rex built once; a pose change only flips `data-state`, so the animation does not restart on every poll. */
export function LiveMascot({ id, pose, className = "", testId = "app-mascot" }: { id: string; pose: Pose; className?: string; testId?: string }) {
  const host = useRef<HTMLSpanElement>(null);
  const markup = useMemo(() => zaprexMascotSvg({ ...MASCOT_LAYERS, id, state: "idle", title: "Zaprex" }), [id]);
  useEffect(() => {
    const svg = host.current?.querySelector("svg");
    if (svg) svg.dataset.state = pose;
  }, [pose, markup]);
  return <span ref={host} className={`zx-mascot inline-block ${className}`} data-testid={testId} data-pose={pose} aria-hidden dangerouslySetInnerHTML={{ __html: markup }} />;
}
