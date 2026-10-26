// Local stand-in for ingot-server's /api/me and /api/bot (test mode, sample repo) so /app can be tried without an account.
// Usage: node scripts/mock-bot-server.mjs, then INGOT_SERVER_URL=http://127.0.0.1:4599 npm run dev. GET /__signin?v=0 signs out.
import http from "node:http";
const port = Number(process.env.PORT || 4599);
const bot = { messages: [], runs: [], approvals: [] };
let signedIn = process.env.SIGNED_IN !== "0";
const send = (res, status, body) => { res.writeHead(status, { "content-type": "application/json", "cache-control": "no-store" }); res.end(JSON.stringify(body)); };
const say = (role, text, runId, kind = "text", approvalId = null) => bot.messages.push({ id: bot.messages.length + 1, role, kind, text, runId, approvalId, createdAt: new Date().toISOString() });
http.createServer((req, res) => {
  let raw = ""; req.on("data", c => (raw += c)); req.on("end", () => {
    const url = new URL(req.url, "http://x"); const path = url.pathname; const method = req.method; const now = new Date().toISOString();
    if (path === "/__signin") { signedIn = url.searchParams.get("v") !== "0"; return send(res, 200, { signedIn }); }
    if (!signedIn) return send(res, 401, { error: "unauthorized" });
    if (path === "/api/me") return send(res, 200, { user: { id: "u1", name: "Test User", email: "test@ingot.dev" } });
    if (path === "/api/bot/status") return send(res, 200, { entitlement: { enabled: true, plan: "pro_plus", reason: null }, runner: "local", runnerLive: true, modelsLive: false });
    if (path === "/api/bot/usage") return send(res, 200, { usage: { minutesUsed: 3, minutesLimit: 300, activeRuns: bot.runs.filter(r => r.status === "awaiting_approval").length, concurrentLimit: 1 } });
    if (path === "/api/bot/repos") return send(res, 200, { repos: [{ id: "repo-1", fullName: "ingot-dev/sample-app", defaultBranch: "main", enabled: true }] });
    if (path === "/api/bot/chat" && method === "GET") return send(res, 200, { messages: bot.messages });
    if (path === "/api/bot/approvals") return send(res, 200, { approvals: bot.approvals.filter(a => a.status === "pending") });
    if (path === "/api/bot/runs") return send(res, 200, { runs: [...bot.runs].reverse() });
    if (path === "/api/bot/chat" && method === "POST") {
      const body = JSON.parse(raw || "{}"); const id = `run-${bot.runs.length + 1}`; const approvalId = `appr-${bot.approvals.length + 1}`;
      bot.runs.push({ id, status: "awaiting_approval", prompt: body.text ?? "", source: "portal", repoId: body.repoId ?? null, repoFullName: "ingot-dev/sample-app", prNumber: null, prUrl: null, summary: "", computeSeconds: 42, error: null, createdAt: now, startedAt: now, endedAt: null });
      bot.approvals.push({ id: approvalId, runId: id, action: "add_dependency", title: "Add or upgrade dependencies", reason: "The task adds a package", preview: '+ "date-fns": "^4.1.0"', status: "pending" });
      say("user", body.text ?? "", id); say("bot", "On it. I started a run and will post updates here.", id); say("bot", "Approval needed: Add or upgrade dependencies", id, "approval", approvalId);
      return send(res, 201, { run: bot.runs.at(-1) });
    }
    const decision = /^\/api\/bot\/approvals\/([\w-]+)$/.exec(path);
    if (decision && method === "POST") {
      const approval = bot.approvals.find(a => a.id === decision[1]); if (!approval || approval.status !== "pending") return send(res, 409, { error: "approval_not_pending" });
      const choice = JSON.parse(raw || "{}").decision; approval.status = choice === "reject" ? "rejected" : "approved";
      const run = bot.runs.find(r => r.id === approval.runId);
      run.status = choice === "reject" ? "cancelled" : "succeeded"; run.endedAt = now; run.computeSeconds = 240;
      if (choice !== "reject") { run.prNumber = 7; run.prUrl = "https://github.com/ingot-dev/sample-app/pull/7"; say("bot", `Run finished. Tests pass. Draft PR: ${run.prUrl}`, run.id); } else say("bot", "Rejected. I stopped the run.", run.id);
      return send(res, 200, { approval });
    }
    if (/^\/api\/bot\/runs\/[\w-]+\/events$/.test(path)) return send(res, 200, { events: [{ seq: 1, type: "status", payload: { status: "running" } }, { seq: 2, type: "tool", payload: { command: "npm test", exitCode: 1 } }, { seq: 3, type: "step", payload: { message: "Fixing sum.mjs" } }, { seq: 4, type: "tool", payload: { command: "npm test", exitCode: 0 } }, { seq: 5, type: "pull_request", payload: { number: 7 } }] });
    const cancel = /^\/api\/bot\/runs\/([\w-]+)\/cancel$/.exec(path);
    if (cancel && method === "POST") { const run = bot.runs.find(r => r.id === cancel[1]); if (run) { run.status = "cancelled"; run.endedAt = now; } return send(res, 200, { run }); }
    send(res, 404, { error: "not_found" });
  });
}).listen(port, "127.0.0.1", () => console.log("mock on", port));
