import type { Page, Route } from "@playwright/test";

/** A small in-browser fake of the ingot-server bot API, so the app tests never sign in, call a model or spend. */
export interface FakeMessage { id: number; role: "user" | "bot"; kind: string; text: string; runId: null; approvalId: null; createdAt: string; feedback?: 1 | -1 | null; feedbackReason?: string | null }
export interface FakeOptions {
  signedIn?: boolean;
  /** SSE events for each /talk call, in order; the last one repeats. */
  replies?: string[][];
  /** HTTP status for /talk (non-200 returns an error JSON body). */
  talkStatus?: number;
  entitlement?: { enabled: boolean; plan: string; reason: string | null };
}
export interface FakeBot { talkBodies: Record<string, unknown>[]; feedback: { id: string; body: Record<string, unknown> }[]; chatPosts: Record<string, unknown>[]; messages: FakeMessage[] }

export const sse = (...events: Record<string, unknown>[]): string[] => events.map(event => `data: ${JSON.stringify(event)}\n\n`);
export const answer = (text: string): string[] => sse({ type: "start", model: "ingot" }, { type: "text", text }, { type: "done", task: null, usage: null });

const USER = { id: "u_e2e", email: "e2e@zaprex.test", name: "E2E Tester", avatarUrl: null, plan: "pro" };

export async function fakeBot(page: Page, options: FakeOptions = {}): Promise<FakeBot> {
  const state: FakeBot = { talkBodies: [], feedback: [], chatPosts: [], messages: [] };
  let nextId = 1;
  let talkCount = 0;
  const json = (route: Route, status: number, body: unknown) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
  const now = () => new Date().toISOString();

  await page.route("**/api/me", route => (options.signedIn === false ? json(route, 401, { error: "unauthorized" }) : json(route, 200, { user: USER })));
  await page.route("**/api/bot/**", async route => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace(/^\/api\/bot/, "");
    const method = request.method();
    if (options.signedIn === false) return json(route, 401, { error: "unauthorized" });
    if (method === "GET" && path === "/status") return json(route, 200, { entitlement: options.entitlement ?? { enabled: true, plan: "pro", reason: null }, runner: "fly", runnerLive: true, modelsLive: true });
    if (method === "GET" && path === "/usage") return json(route, 200, { usage: { minutesUsed: 3, minutesLimit: 60, activeRuns: 0, concurrentLimit: 1 } });
    if (method === "GET" && path === "/repos") return json(route, 200, { repos: [] });
    if (method === "GET" && path === "/chat") return json(route, 200, { messages: state.messages });
    if (method === "GET" && path === "/approvals") return json(route, 200, { approvals: [] });
    if (method === "GET" && path.startsWith("/runs")) return json(route, 200, { runs: [], events: [] });
    if (method === "GET" && path === "/chats") {
      const q = url.searchParams.get("q") ?? "";
      const chats = [{ id: "c1", title: "Fix the login bug", createdAt: now(), updatedAt: now() }, { id: "c2", title: "Release notes", createdAt: now(), updatedAt: now() }];
      return json(route, 200, { chats: chats.filter(chat => chat.title.toLowerCase().includes(q.toLowerCase())) });
    }
    if (method === "POST" && path === "/chats") return json(route, 201, { chat: { id: `c${Date.now()}`, title: "", createdAt: now(), updatedAt: now() } });
    if (method === "POST" && path === "/chat") { state.chatPosts.push(request.postDataJSON() as Record<string, unknown>); return json(route, 201, { ok: true }); }
    if (method === "PUT" && /^\/messages\/\d+\/feedback$/.test(path)) {
      const body = request.postDataJSON() as Record<string, unknown>;
      state.feedback.push({ id: path.split("/")[2], body });
      return json(route, 200, { ok: true });
    }
    if (method === "POST" && path === "/talk") {
      const body = request.postDataJSON() as Record<string, unknown>;
      state.talkBodies.push(body);
      if (options.talkStatus && options.talkStatus !== 200) return json(route, options.talkStatus, { error: "generic" });
      const replies = options.replies ?? [answer("Hello from the fake Zaprex.")];
      const events = replies[Math.min(talkCount, replies.length - 1)];
      talkCount += 1;
      const text = events.map(chunk => JSON.parse(chunk.slice(5).trim()) as { type: string; text?: string }).filter(event => event.type === "text").map(event => event.text).join("");
      const done = events.some(chunk => chunk.includes('"type":"done"'));
      if (text && done) {
        state.messages.push({ id: nextId++, role: "user", kind: "chat", text: String(body.text ?? ""), runId: null, approvalId: null, createdAt: now() });
        state.messages.push({ id: nextId++, role: "bot", kind: "chat", text, runId: null, approvalId: null, createdAt: now(), feedback: null });
      }
      return route.fulfill({ status: 200, headers: { "content-type": "text/event-stream", "cache-control": "no-cache" }, body: events.join("") });
    }
    return json(route, 404, { error: "not_found" });
  });
  return state;
}
