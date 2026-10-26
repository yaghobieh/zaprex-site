import Link from "next/link";
import type { ReactNode } from "react";
import { slugify } from "@/lib/docs";

/** Inline: `code`, **bold**, [text](href). */
function inline(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let n = 0;
  while ((match = pattern.exec(text))) {
    if (match.index > last) out.push(text.slice(last, match.index));
    const token = match[0];
    const k = `${key}-${(n += 1)}`;
    if (token.startsWith("`")) out.push(<code key={k} className="doc-code">{token.slice(1, -1)}</code>);
    else if (token.startsWith("**")) out.push(<strong key={k} className="font-semibold text-ink">{token.slice(2, -2)}</strong>);
    else {
      const [, label, href] = /\[([^\]]+)\]\(([^)]+)\)/.exec(token) ?? [];
      out.push(href.startsWith("/") ? <Link key={k} href={href} className="doc-link">{label}</Link> : <a key={k} href={href} className="doc-link">{label}</a>);
    }
    last = match.index + token.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** A deliberately small Markdown subset for the docs: headings, paragraphs, lists, quotes, code blocks. */
export function Markdown({ source }: { source: string }) {
  const lines = source.trim().split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const key = `b${i}`;
    if (!line.trim()) {
      i += 1;
      continue;
    }
    if (line.startsWith("```")) {
      const code: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].startsWith("```")) code.push(lines[(i += 1) - 1]);
      i += 1;
      blocks.push(<pre key={key} className="doc-pre"><code>{code.join("\n")}</code></pre>);
      continue;
    }
    if (line.startsWith("## ")) {
      const text = line.slice(3).trim();
      blocks.push(<h2 key={key} id={slugify(text)} className="doc-h2">{inline(text, key)}</h2>);
      i += 1;
      continue;
    }
    if (line.startsWith("### ")) {
      blocks.push(<h3 key={key} className="doc-h3">{inline(line.slice(4).trim(), key)}</h3>);
      i += 1;
      continue;
    }
    if (line.startsWith("> ")) {
      const quote: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) quote.push(lines[(i += 1) - 1].slice(2));
      blocks.push(<div key={key} className="doc-note">{inline(quote.join(" "), key)}</div>);
      continue;
    }
    if (/^(- |\d+\. )/.test(line)) {
      const ordered = /^\d+\. /.test(line);
      const items: string[] = [];
      while (i < lines.length && /^(- |\d+\. )/.test(lines[i])) items.push(lines[(i += 1) - 1].replace(/^(- |\d+\. )/, ""));
      const List = ordered ? "ol" : "ul";
      blocks.push(<List key={key} className={ordered ? "doc-ol" : "doc-ul"}>{items.map((item, n) => <li key={n}>{inline(item, `${key}-${n}`)}</li>)}</List>);
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#|> |- |\d+\. |```)/.test(lines[i])) para.push(lines[(i += 1) - 1]);
    blocks.push(<p key={key} className="doc-p">{inline(para.join(" "), key)}</p>);
  }
  return <>{blocks}</>;
}
