import Image from "next/image";

type Props = {
  src?: string;
  width?: number;
  height?: number;
  alt?: string;
  /** "browser" shows the portal address bar, "app" the Zaprex app address, "ide" a desktop app title bar. */
  kind?: "browser" | "app" | "ide";
  label?: string;
  className?: string;
  sizes?: string;
  children?: React.ReactNode;
};

/** A framed device mockup around a real product screenshot (or the reel, via children). */
export function Screen({ src, width, height, alt, kind = "browser", label, className = "", sizes = "(min-width: 768px) 560px, 92vw", children }: Props) {
  const bar = label ?? (kind === "app" ? "zaprex.dev/app" : kind === "ide" ? "Ingot IDE" : "ingot-portal.vercel.app/dashboard/bot");
  return (
    <figure className={`screen ${className}`}>
      <div className="screen-bar" aria-hidden>
        <span className="screen-dots"><i /><i /><i /></span>
        <span className="screen-url">{bar}</span>
      </div>
      {children ?? (src && <Image src={src} alt={alt ?? ""} width={width} height={height} sizes={sizes} className="block h-auto w-full" />)}
    </figure>
  );
}
