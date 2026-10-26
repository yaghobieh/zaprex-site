import { zaprexMascotSvg, type ZaprexState } from "./zaprex-mascot";

export const MASCOT_LAYERS = { body: "/mascot/zaprex-body-512.webp", arm: "/mascot/zaprex-arm-512.webp" } as const;

type Props = { id: string; state?: ZaprexState; className?: string; title?: string; decorative?: boolean };

/** The living Zaprex mascot (T-rex alone). `id` keeps gradient/clip ids unique and stable between server and client. */
export function ZaprexMascot({ id, state = "idle", className = "", title = "Zaprex", decorative = false }: Props) {
  return (
    <span
      className={`zx-mascot inline-block ${className}`}
      aria-hidden={decorative || undefined}
      data-testid={`mascot-${id}`}
      dangerouslySetInnerHTML={{ __html: zaprexMascotSvg({ ...MASCOT_LAYERS, id, state, title }) }}
    />
  );
}
