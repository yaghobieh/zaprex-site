"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { askRexVisible } from "@/lib/ask-rex";

/** Bear's chat and its stylesheet load after the page, so they never block first paint. */
const AskRexChat = dynamic(() => import("@/components/ask-rex/AskRexChat").then(module => module.AskRexChat), { ssr: false });

/** "Ask Rex": floating Zaprex assistant on the marketing pages and docs (not in the Zaprex app, which is its own chat). */
export function AskRex() {
  const pathname = usePathname();
  return askRexVisible(pathname) ? <AskRexChat /> : null;
}
