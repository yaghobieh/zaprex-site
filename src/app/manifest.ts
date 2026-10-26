import type { MetadataRoute } from "next";
import { DESCRIPTION, SITE_NAME } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME, short_name: SITE_NAME, description: DESCRIPTION, start_url: "/", display: "standalone",
    background_color: "#070b1a", theme_color: "#1b2647",
    icons: [
      { src: "/mascot/zaprex-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/mascot/zaprex-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
