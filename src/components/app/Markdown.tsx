"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Chat Markdown (IDEA-187): bold, lists, tables, code, links and quotes. Raw HTML and images are never rendered.
 * IDEA-192: the message takes the direction of its first letter (Hebrew/Arabic: right to left), so lists and quotes sit on
 * the right side; each paragraph and heading is also dir="auto" so a mixed reply reads naturally. Code stays LTR.
 */
const COMPONENTS: Components = {
  a: ({ href, children }) => <a href={href} target="_blank" rel="noreferrer noopener" className="font-medium text-sky underline-offset-2 hover:underline">{children}</a>,
  p: ({ children }) => <p dir="auto" className="my-1.5 first:mt-0 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="my-1.5 list-disc space-y-0.5 ps-5">{children}</ul>,
  ol: ({ children }) => <ol className="my-1.5 list-decimal space-y-0.5 ps-5">{children}</ol>,
  h1: ({ children }) => <p dir="auto" className="mb-1 mt-2 text-base font-bold">{children}</p>,
  h2: ({ children }) => <p dir="auto" className="mb-1 mt-2 font-bold">{children}</p>,
  h3: ({ children }) => <p dir="auto" className="mb-1 mt-2 font-semibold">{children}</p>,
  blockquote: ({ children }) => <blockquote className="zx-quote my-1.5 border-s-2 ps-2.5 opacity-80" data-testid="app-quote">{children}</blockquote>,
  pre: ({ children }) => <pre dir="ltr" className="zx-code my-2 max-w-full overflow-x-auto rounded-xl p-3 text-xs leading-relaxed text-white/90">{children}</pre>,
  code: ({ className, children }) => (className ? <code className={className}>{children}</code> : <code className="zx-inline-code rounded px-1 py-0.5 text-[0.85em]">{children}</code>),
  table: ({ children }) => <div className="my-2 overflow-x-auto"><table className="w-full border-collapse text-xs">{children}</table></div>,
  th: ({ children }) => <th className="border-b border-line px-2 py-1 text-start font-semibold">{children}</th>,
  td: ({ children }) => <td className="border-b border-line/60 px-2 py-1 align-top">{children}</td>,
  img: ({ alt }) => <span>{alt}</span>,
  hr: () => <hr className="my-2 border-line" />,
};

/** First strong letter decides: Hebrew, Arabic and friends are right to left, everything else left to right. */
const FIRST_STRONG = /[A-Za-z\u00C0-\u024F\u0370-\u03FF\u0400-\u04FF]|[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/;
export function textDirection(text: string): "rtl" | "ltr" {
  const letter = text.replace(/\]\([^)]*\)/g, "]").replace(/`[^`]*`/g, "").match(FIRST_STRONG)?.[0];
  return letter && /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/.test(letter) ? "rtl" : "ltr";
}

export function Markdown({ text }: { text: string }) {
  return <div dir={textDirection(text)} className="zx-md break-words" data-testid="app-markdown"><ReactMarkdown remarkPlugins={[remarkGfm]} components={COMPONENTS} skipHtml>{text}</ReactMarkdown></div>;
}
