import { createHash } from "node:crypto";
import { DOCS, slugify, type Doc } from "@/lib/docs";
import { FAQ, FEATURES, ROUTINES, SECURITY, STEPS, WHAT_IT_DOES, ZAPREX_PLANS } from "@/lib/site";

/**
 * zaprex.dev content for "Ask Rex" (served at /site-knowledge.json, read by ingot-server for `site: "zaprex"`).
 * Passages: every docs section (split at "## "), the home page copy, the FAQ and the plans. Links are site-relative.
 */
export interface KnowledgeChunk { id: string; title: string; url: string; text: string }
export interface SiteKnowledge { version: string; chunks: KnowledgeChunk[] }

export const SITE_KNOWLEDGE_MAX_CHARS = 1_800;
const VERSION_LENGTH = 12;
/** ingot-server always adds the plan passages to money questions when their id starts with this. */
const PRICING_PREFIX = "pricing";

/** Markdown to plain text that keeps hyphens, plus signs and code words ("test-and-fix", "Pro+", `ingot-bot/…`). */
export function knowledgeText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^\s*\|?\s*-{3,}.*$/gm, " ")
    .replace(/^\s*(?:#{1,6}|>|[-*]|\d+\.)\s+/gm, "")
    .replace(/[*`]/g, "")
    .replace(/\s*\|\s*/g, " | ")
    .replace(/\s+/g, " ")
    .trim();
}

const clip = (text: string) => (text.length > SITE_KNOWLEDGE_MAX_CHARS ? `${text.slice(0, SITE_KNOWLEDGE_MAX_CHARS - 1).trimEnd()}…` : text);
const points = (items: readonly { title: string; body: string }[]) => items.map(item => `${item.title}: ${item.body}`).join(" ");

/** One passage per "## " section; the intro before the first heading is its own passage. */
export function docChunks(doc: Doc): KnowledgeChunk[] {
  const sections = doc.body.split(/\n(?=## )/);
  return sections.flatMap((section, index) => {
    const [first, ...rest] = section.split("\n");
    const heading = first.startsWith("## ") ? first.slice(3).replace(/`/g, "").trim() : "";
    const body = knowledgeText(heading ? rest.join("\n") : section);
    if (!body) return [];
    const anchor = heading ? `#${slugify(heading)}` : "";
    const text = clip(index === 0 && !heading ? `${doc.description} ${body}` : body);
    return [{ id: `docs/${doc.slug}${anchor || `#${index}`}`, title: heading ? `${doc.title} › ${heading}` : doc.title, url: `/docs/${doc.slug}${anchor}`, text }];
  });
}

export function siteChunks(): KnowledgeChunk[] {
  const plans = ZAPREX_PLANS.map(plan => `${plan.name}: $${plan.price} ${plan.perSeat ? "per seat a month" : "a month"}, ${plan.minutes} Zaprex minutes a month${plan.perSeat ? " per seat" : ""}`).join(". ");
  return [
    { id: "overview/zaprex", title: "Zaprex", url: "/", text: clip(`Zaprex is the background AI coding bot from Ingot, the open-source AI IDE. ${points(WHAT_IT_DOES)}`) },
    { id: "overview/how-it-works", title: "How Zaprex works", url: "/#how", text: clip(points(STEPS)) },
    { id: "overview/features", title: "Zaprex features", url: "/#features", text: clip(points(FEATURES)) },
    { id: "overview/routines", title: "Routine ideas", url: "/#routines", text: clip(ROUTINES.map(routine => `${routine.title} (${routine.when}): ${routine.body}`).join(" ")) },
    { id: "overview/security", title: "Zaprex security", url: "/#security", text: clip(points(SECURITY)) },
    { id: `${PRICING_PREFIX}/zaprex-plans`, title: "Zaprex plans and prices", url: "/docs/plans-and-limits", text: `Zaprex is included in every paid Ingot plan; there is no separate Zaprex subscription. ${plans}. Free and BYOK plans see an upgrade prompt. Plans are billed monthly and can be cancelled any time.` },
    ...FAQ.map((item, index) => ({ id: `faq/${index}`, title: `Home › FAQ › ${item.q}`, url: "/#faq", text: clip(`${item.q} ${item.a}`) })),
  ];
}

export function siteKnowledge(): SiteKnowledge {
  const chunks = [...siteChunks(), ...DOCS.flatMap(docChunks)];
  const version = createHash("sha256").update(JSON.stringify(chunks)).digest("hex").slice(0, VERSION_LENGTH);
  return { version, chunks };
}
