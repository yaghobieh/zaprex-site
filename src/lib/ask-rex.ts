/**
 * "Ask Rex": the zaprex.dev assistant. The widget calls ingot-server's public site ask route directly (CORS, no
 * cookies) with `site: "zaprex"`, so answers come from zaprex.dev's docs first and Ingot's site second.
 */
export const ASK_REX_API_URL = `${(process.env.NEXT_PUBLIC_ASK_REX_API_URL ?? "https://ingot-server.fly.dev").replace(/\/$/, "")}/api/site/ask`;
export const ASK_REX_SITE = "zaprex";
export const ASK_REX_NAME = "Rex";
export const ASK_REX_DOM_ID = "ask-rex";
/** Same limits as the server, so the composer never sends what the server would cut. */
export const ASK_REX_MAX_QUESTION = 400;
export const ASK_REX_MAX_HISTORY = 4;
export const ASK_REX_TIMEOUT_MS = 30_000;
/** Pages without the widget: the Zaprex app (its own chat) and sign-in hand-offs. */
export const ASK_REX_HIDDEN_PREFIXES: readonly string[] = ["/app", "/auth"];
export const ASK_REX_MESSAGES_SELECTOR = ".Bear-Chat__messages";
export const ASK_REX_BUBBLE_SELECTOR = ".Bear-ChatBubble";
export const ASK_REX_SCROLL_GAP_PX = 12;

export const ASK_REX_COPY = {
  open: "Ask Rex",
  close: "Close Ask Rex",
  title: "Ask Rex",
  beta: "Beta",
  subtitle: "Answers from the Zaprex docs",
  welcome: "Hi, I’m Rex. Ask me anything about Zaprex: tasks, routines, approvals, draft PRs, plans or the docs. Ingot questions are fine too.",
  disclaimer: "Rex answers only from zaprex.dev and the Ingot site and can be wrong. Check the linked pages.",
  sources: "Sources",
  refusal: "I can only answer questions about Zaprex and Ingot, the IDE it comes with. Everything about Zaprex is in the docs.",
  docsLink: "Browse the Zaprex docs",
  errors: {
    rateLimited: "That’s a lot of questions. Try again in a minute.",
    rateLimitedDay: "You’ve reached today’s question limit. Try again tomorrow, or browse the docs.",
    paused: "Rex is taking a break. The docs have the answers.",
    unavailable: "Rex couldn’t answer right now. Try again in a moment.",
    invalid: "Type a question first.",
  },
} as const;

export type AskRexErrorKey = keyof typeof ASK_REX_COPY.errors;
export interface AskRexTurn { role: "user" | "assistant"; content: string }
export interface AskRexSource { n: number; title: string; url: string }
export interface AskRexAnswer { answer: string; refused: boolean; sources: AskRexSource[] }

export class AskRexError extends Error {
  constructor(readonly status: number, readonly code: string, readonly scope?: string) {
    super(code);
  }
}

export function askRexVisible(pathname: string): boolean {
  return !ASK_REX_HIDDEN_PREFIXES.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

/** Last few turns, trimmed to what the server accepts. */
export function recentTurns(turns: readonly AskRexTurn[]): AskRexTurn[] {
  return turns.slice(-ASK_REX_MAX_HISTORY).map(turn => ({ role: turn.role, content: turn.content.slice(0, ASK_REX_MAX_QUESTION) }));
}

export function askRexErrorKey(error: unknown): AskRexErrorKey {
  if (!(error instanceof AskRexError)) return "unavailable";
  if (error.code === "site_ask_rate_limited") return error.scope === "day" ? "rateLimitedDay" : "rateLimited";
  if (error.code === "site_ask_paused") return "paused";
  if (error.code === "invalid_question") return "invalid";
  return "unavailable";
}

/** POST to ingot-server's ask route as zaprex.dev. Throws AskRexError with the server's code (`scope` tells minute from day limits). */
export async function askRex(question: string, history: readonly AskRexTurn[], fetchImpl: typeof fetch = fetch): Promise<AskRexAnswer> {
  let response: Response;
  try {
    response = await fetchImpl(ASK_REX_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: question.trim().slice(0, ASK_REX_MAX_QUESTION), history: recentTurns(history), site: ASK_REX_SITE }),
      credentials: "omit",
      signal: AbortSignal.timeout(ASK_REX_TIMEOUT_MS),
    });
  } catch {
    throw new AskRexError(0, "site_ask_unavailable");
  }
  const data = (await response.json().catch(() => ({}))) as Partial<AskRexAnswer> & { error?: string; scope?: string };
  if (!response.ok || typeof data.answer !== "string") throw new AskRexError(response.status, data.error ?? "site_ask_unavailable", data.scope);
  return { answer: data.answer, refused: Boolean(data.refused), sources: Array.isArray(data.sources) ? data.sources : [] };
}

/** Sources on zaprex.dev are site-relative; Ingot sources are absolute links to the Ingot site and open in a new tab. */
export function isExternal(url: string): boolean {
  return /^https?:\/\//.test(url);
}

/** scrollTop that puts the top of a message `gap` px below the top of the list. */
export function messageStartScrollTop(input: { listTop: number; listScrollTop: number; messageTop: number; gap: number }): number {
  return Math.max(0, Math.round(input.listScrollTop + input.messageTop - input.listTop - input.gap));
}

/** Bear's Chat sticks to the bottom; long answers are read from their first line, so the list is scrolled back to where the latest answer starts. */
export function scrollToLatestMessage(fromBot: boolean): void {
  const list = document.getElementById(ASK_REX_DOM_ID)?.querySelector<HTMLElement>(ASK_REX_MESSAGES_SELECTOR);
  if (!list) return;
  const bubbles = list.querySelectorAll<HTMLElement>(ASK_REX_BUBBLE_SELECTOR);
  const latest = bubbles[bubbles.length - 1];
  if (!fromBot || !latest) {
    list.scrollTop = list.scrollHeight;
    return;
  }
  list.scrollTop = messageStartScrollTop({ listTop: list.getBoundingClientRect().top, listScrollTop: list.scrollTop, messageTop: latest.getBoundingClientRect().top, gap: ASK_REX_SCROLL_GAP_PX });
}
