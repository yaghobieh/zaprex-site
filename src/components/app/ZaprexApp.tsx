"use client";

import { ExternalLink, GitPullRequestDraft, Loader2, Play, RefreshCw, Send, ShieldAlert, Square } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { LiveMascot } from "@/components/app/LiveMascot";
import { startSignIn, ZAPREX_DASHBOARD_URL, type AccountUser } from "@/lib/auth";
import {
  ACTIVE_POLL_MS, botApi, errorText, eventLine, formatMinutes, IDLE_POLL_MS, isActive, MAX_PROMPT, mascotPose, modeNotice, prLinkIn, STATUS_LABELS, talk, taskIn, withoutTaskLine,
  type Approval, type Decision, type Pose, type Entitlement, type Message, type Repo, type Run, type RunEvent, type Usage,
} from "@/lib/bot";
import { INGOT } from "@/lib/site";

type Session = { kind: "loading" } | { kind: "signed-out" } | { kind: "signed-in"; user: AccountUser };

interface BotState {
  loaded: boolean;
  entitlement?: Entitlement;
  usage?: Usage;
  runner?: string;
  runnerLive?: boolean;
  modelsLive?: boolean;
  repos: Repo[];
  messages: Message[];
  approvals: Approval[];
  runs: Run[];
  error?: string;
}

const EMPTY: BotState = { loaded: false, repos: [], messages: [], approvals: [], runs: [] };
const EXAMPLES = ["Hi Zaprex! What can you do?", "Fix the failing tests", "How should I add pagination to the orders list?"];

/** A reply being streamed right now (IDEA-177). */
interface Live { user: string; reply: string; phase: "thinking" | "talking" }

/** zaprex.dev/app (IDEA-173): Zaprex as its own app. Same account, thread, runs and approvals as everywhere else. */
export function ZaprexApp() {
  const [session, setSession] = useState<Session>({ kind: "loading" });
  const [state, setState] = useState<BotState>(EMPTY);
  const [repoId, setRepoId] = useState("");
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [openRun, setOpenRun] = useState<string>();
  const [live, setLive] = useState<Live>();
  const [runLog, setRunLog] = useState<RunEvent[]>([]);
  const thread = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const poll = useRef<() => void>(() => undefined);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/me", { credentials: "same-origin", cache: "no-store" })
      .then(async response => (response.ok ? ((await response.json()) as { user: AccountUser }).user : undefined))
      .catch(() => undefined)
      .then(user => { if (!cancelled) setSession(user ? { kind: "signed-in", user } : { kind: "signed-out" }); });
    return () => { cancelled = true; };
  }, []);

  const refresh = useCallback(async () => {
    clearTimeout(timer.current);
    const chatPath = `/chat${repoId ? `?repoId=${encodeURIComponent(repoId)}` : ""}`;
    const [status, usage, repos, chat, approvals, runs] = await Promise.all([
      botApi("GET", "/status"), botApi("GET", "/usage"), botApi("GET", "/repos"), botApi("GET", chatPath), botApi("GET", "/approvals"), botApi("GET", "/runs?limit=20"),
    ]);
    if (status.status === 401) { setSession({ kind: "signed-out" }); return; }
    setState(previous => {
      if (status.status !== 200) return { ...previous, loaded: true, error: errorText(status) };
      return {
        loaded: true, error: undefined,
        entitlement: status.body.entitlement as Entitlement,
        runner: String(status.body.runner ?? ""), runnerLive: status.body.runnerLive === true, modelsLive: status.body.modelsLive === true,
        usage: usage.status === 200 ? (usage.body.usage as Usage) : previous.usage,
        repos: repos.status === 200 ? ((repos.body.repos as Repo[] | undefined) ?? []).filter(repo => repo.enabled) : previous.repos,
        messages: chat.status === 200 ? ((chat.body.messages as Message[] | undefined) ?? []) : previous.messages,
        approvals: approvals.status === 200 ? ((approvals.body.approvals as Approval[] | undefined) ?? []) : previous.approvals,
        runs: runs.status === 200 ? ((runs.body.runs as Run[] | undefined) ?? []) : previous.runs,
      };
    });
    const active = runs.status === 200 && ((runs.body.runs as Run[] | undefined) ?? []).some(isActive);
    timer.current = setTimeout(() => poll.current(), active ? ACTIVE_POLL_MS : IDLE_POLL_MS);
  }, [repoId]);

  useEffect(() => {
    poll.current = () => void refresh();
  }, [refresh]);

  useEffect(() => {
    if (session.kind !== "signed-in") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- polling the bot API is the external system this syncs with
    void refresh();
    return () => clearTimeout(timer.current);
  }, [session.kind, refresh]);

  useEffect(() => {
    thread.current?.scrollTo({ top: thread.current.scrollHeight });
  }, [state.messages.length, live?.reply.length]);

  async function act(work: () => Promise<string>) {
    setBusy(true);
    setActionError("");
    const message = await work();
    setActionError(message);
    setBusy(false);
  }

  /** Chat (IDEA-177): Zaprex answers right away, streamed; a proposed task becomes a "Start run" button. */
  function send(text = draft) {
    const prompt = text.trim().slice(0, MAX_PROMPT);
    if (!prompt || busy) return;
    setDraft("");
    setBusy(true);
    setActionError("");
    setLive({ user: prompt, reply: "", phase: "thinking" });
    void (async () => {
      let failed = "";
      const response = await talk(prompt, repoId || null, event => {
        if (event.type === "text") setLive(current => current && { ...current, reply: current.reply + event.text, phase: "talking" });
        if (event.type === "error") failed = errorText({ status: 502, body: { error: event.code } });
      });
      if (response) failed = errorText(response);
      await refresh();
      setLive(undefined);
      setActionError(failed);
      setBusy(false);
    })();
  }

  /** Starts a background run (draft PR) for a task Zaprex proposed or the user typed. */
  function startRun(task: string) {
    void act(async () => {
      const response = await botApi("POST", "/chat", { text: task, repoId: repoId || null });
      await refresh();
      return response.status === 200 || response.status === 201 ? "" : errorText(response);
    });
  }

  function decide(approval: Approval, decision: Decision) {
    void act(async () => {
      const response = await botApi("POST", `/approvals/${encodeURIComponent(approval.id)}`, { decision });
      await refresh();
      return response.status === 200 ? "" : errorText(response);
    });
  }

  function cancel(run: Run) {
    void act(async () => {
      await botApi("POST", `/runs/${encodeURIComponent(run.id)}/cancel`, {});
      await refresh();
      return "";
    });
  }

  async function toggleRun(run: Run) {
    if (openRun === run.id) { setOpenRun(undefined); setRunLog([]); return; }
    setOpenRun(run.id);
    const response = await botApi("GET", `/runs/${encodeURIComponent(run.id)}/events`);
    setRunLog(response.status === 200 ? ((response.body.events as RunEvent[] | undefined) ?? []) : []);
  }

  if (session.kind === "loading") {
    return <Centered><Loader2 aria-hidden className="h-6 w-6 animate-spin text-muted" /></Centered>;
  }

  if (session.kind === "signed-out") {
    return (
      <Centered>
        <div className="glass max-w-md rounded-3xl p-8 text-center" data-testid="app-signed-out">
          <LiveMascot id="app-signin" pose="idle" className="mx-auto block h-28 w-28" />
          <h1 className="font-display mt-4 text-3xl font-bold tracking-tight">Open Zaprex</h1>
          <p className="mt-2 text-muted">Sign in with your Ingot account. Same account, same plan, same runs.</p>
          <button type="button" onClick={() => startSignIn("/app")} data-testid="app-sign-in" className="btn-primary mt-6 inline-flex h-12 items-center gap-2 rounded-full px-6 font-semibold text-white">Sign in with Ingot</button>
          <p className="mt-4 text-xs text-muted">No Ingot account yet? You can create one on the next screen.</p>
        </div>
      </Centered>
    );
  }

  const pose: Pose = live ? live.phase : mascotPose(state.runs);
  const notice = modeNotice(state);
  const pending = state.approvals.filter(approval => approval.status === "pending");
  const locked = state.entitlement && !state.entitlement.enabled;
  const running = state.runs.filter(isActive).length;

  return (
    <div className="mx-auto grid w-full min-w-0 max-w-7xl flex-1 grid-cols-1 gap-5 px-3 pb-6 pt-4 sm:px-4 lg:grid-cols-[minmax(0,1fr)_340px]" data-testid="zaprex-app">
      <section className="glass flex min-h-[70vh] min-w-0 flex-col overflow-hidden rounded-3xl" aria-label="Chat with Zaprex">
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3 sm:px-5">
          <LiveMascot id="app-head" pose={pose} className="-my-2 h-12 w-12" />
          <div className="min-w-0">
            <h1 className="font-display text-lg font-bold leading-tight">Zaprex</h1>
            <p className="text-xs text-muted" data-testid="app-usage">
              {state.usage
                ? `${state.usage.minutesUsed}${state.usage.minutesLimit ? ` / ${state.usage.minutesLimit}` : ""} min this month · ${state.usage.activeRuns}${state.usage.concurrentLimit ? ` / ${state.usage.concurrentLimit}` : ""} running`
                : "Your background coding bot"}
            </p>
          </div>
          {notice === "test" && <span className="rounded-full border border-gold/50 bg-gold/15 px-2.5 py-0.5 text-xs font-semibold text-gold" title="Runs use a local sandbox and the mock model" data-testid="app-test-mode">Test mode</span>}
          {notice === "sandbox" && <span className="rounded-full border border-sky/40 bg-sky/10 px-2.5 py-0.5 text-xs font-semibold text-sky" title="Runs use a scratch sandbox on the live model">Sandbox</span>}
          <div className="ml-auto flex items-center gap-2">
            {state.repos.length > 0 && (
              <select aria-label="Repository" data-testid="app-repo" value={repoId} onChange={event => setRepoId(event.target.value)}
                className="h-9 max-w-52 rounded-full border border-line bg-surface px-3 text-sm">
                <option value="">No repository</option>
                {state.repos.map(repo => <option key={repo.id} value={repo.id}>{repo.fullName}</option>)}
              </select>
            )}
            <button type="button" onClick={() => void refresh()} title="Refresh" aria-label="Refresh" className="grid h-9 w-9 place-items-center rounded-full border border-line bg-surface hover:border-blue">
              <RefreshCw aria-hidden className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div ref={thread} className="flex-1 space-y-3 overflow-y-auto px-4 py-5 sm:px-5" data-testid="app-thread" aria-live="polite">
          {!state.loaded && <p className="text-sm text-muted">Loading…</p>}
          {state.loaded && state.error && !state.entitlement && <p role="alert" className="text-sm text-red-400">{state.error}</p>}
          {state.loaded && locked && (
            <div className="rounded-2xl border border-gold/40 bg-gold/10 p-5" data-testid="app-upsell">
              <p className="font-semibold">{state.entitlement?.reason === "kill_switch" ? "Zaprex is paused by the Ingot team right now." : "Zaprex is part of every paid Ingot plan, from $6 a month."}</p>
              {state.entitlement?.reason !== "kill_switch" && <a href={INGOT.pricing} className="mt-3 inline-flex h-10 items-center rounded-full bg-gold px-4 text-sm font-semibold text-navy">See plans</a>}
            </div>
          )}
          {state.loaded && !locked && state.messages.length === 0 && (
            <div className="py-10 text-center">
              <LiveMascot id="app-empty" pose="idle" className="mx-auto mb-2 block h-24 w-24" />
              <p className="font-display text-2xl font-bold">Hey, I&apos;m Zaprex. What are we building?</p>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted">Ask me anything about your code, or give me a task: I work in my own cloud sandbox and hand you a draft pull request. I never push to protected branches and ask before anything risky.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {EXAMPLES.map(example => <button key={example} type="button" onClick={() => setDraft(example)} className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm hover:border-blue">{example}</button>)}
              </div>
            </div>
          )}
          {state.messages.map(message => <ChatMessage key={message.id} message={message} onRun={busy || locked ? undefined : startRun} />)}
          {live && (
            <>
              <ChatMessage message={{ id: -1, role: "user", kind: "text", text: live.user, runId: null, approvalId: null, createdAt: "" }} />
              <div className="flex justify-start" data-role="bot" data-testid="app-live-reply">
                <div className="max-w-[85%] rounded-2xl border border-line bg-surface px-4 py-2.5 text-sm">
                  <p className="mb-0.5 text-xs font-bold text-gold">Zaprex</p>
                  {live.reply
                    ? <p className="whitespace-pre-wrap break-words">{withoutTaskLine(live.reply)}<span aria-hidden className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse rounded-sm bg-gold align-middle" /></p>
                    : <p className="flex items-center gap-1.5 text-muted" aria-label="Zaprex is thinking"><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold" /><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold [animation-delay:.15s]" /><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold [animation-delay:.3s]" /></p>}
                </div>
              </div>
            </>
          )}
        </div>

        {pending.map(approval => (
          <div key={approval.id} role="alertdialog" aria-label={approval.title} data-testid="app-approval" className="mx-4 mb-3 rounded-2xl border border-gold/50 bg-gold/10 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold"><ShieldAlert aria-hidden className="h-4 w-4 text-gold" /> {approval.title}</p>
            {approval.reason && <p className="mt-1 text-sm text-muted">{approval.reason}</p>}
            {approval.preview && <pre className="mt-2 max-h-36 overflow-auto zx-code rounded-xl p-3 text-xs text-white/90">{approval.preview}</pre>}
            <div className="mt-3 flex flex-wrap justify-end gap-2">
              <button type="button" disabled={busy} onClick={() => decide(approval, "reject")} className="h-9 rounded-full border border-line px-4 text-sm font-semibold">Reject</button>
              <button type="button" disabled={busy} onClick={() => decide(approval, "approve_run")} className="h-9 rounded-full border border-line px-4 text-sm font-semibold">Approve for this run</button>
              <button type="button" disabled={busy} onClick={() => decide(approval, "approve_once")} data-testid="app-approve" className="h-9 rounded-full bg-gold px-4 text-sm font-semibold text-navy">Approve</button>
            </div>
          </div>
        ))}

        {actionError && <p role="alert" className="px-5 pb-2 text-sm text-red-400">{actionError}</p>}
        <form className="flex items-end gap-2 border-t border-line p-4" onSubmit={event => { event.preventDefault(); send(); }}>
          <textarea value={draft} onChange={event => setDraft(event.target.value)} rows={2} maxLength={MAX_PROMPT} disabled={!!locked} data-testid="app-input"
            onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(); } }}
            placeholder="Message Zaprex: ask anything, or give it a task…" aria-label="Message Zaprex"
            className="min-h-12 flex-1 resize-y rounded-2xl border border-line bg-surface px-4 py-3 text-sm outline-none focus:border-blue" />
          <button type="submit" disabled={busy || !draft.trim() || !!locked} data-testid="app-send" className="btn-primary inline-flex h-12 items-center gap-2 rounded-full px-5 font-semibold text-white disabled:opacity-50">
            {busy ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : <Send aria-hidden className="h-4 w-4" />} Send
          </button>
          <button type="button" disabled={busy || !draft.trim() || !!locked} onClick={() => { const task = draft.trim(); setDraft(""); startRun(task); }} title="Start a background run with this as the task" data-testid="app-run"
            className="inline-flex h-12 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-semibold hover:border-blue disabled:opacity-50">
            <Play aria-hidden className="h-4 w-4" /> Run
          </button>
        </form>
      </section>

      <aside className="flex min-w-0 flex-col gap-5">
        <section className="glass rounded-3xl p-5" aria-label="Runs" data-testid="app-runs">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Runs</h2>
            <span className="text-xs text-muted">{running ? `${running} running` : "none running"}</span>
          </div>
          {state.runs.length === 0 && <p className="mt-3 text-sm text-muted">No runs yet. Press Run, or Start run on a reply.</p>}
          <ul className="mt-3 space-y-2">
            {state.runs.slice(0, 8).map(run => {
              const active = isActive(run);
              return (
                <li key={run.id} className="rounded-2xl border border-line bg-surface" data-status={run.status}>
                  <div className="flex items-center gap-2 px-3 py-2">
                    <span aria-hidden className={`h-2 w-2 shrink-0 rounded-full ${active ? "animate-pulse bg-sky" : run.status === "succeeded" ? "bg-emerald-400" : "bg-red-400"}`} />
                    <button type="button" onClick={() => void toggleRun(run)} title={run.prompt} aria-expanded={openRun === run.id} className="min-w-0 flex-1 truncate text-left text-sm">{run.prompt}</button>
                    {run.prUrl && <a href={run.prUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-sky">#{run.prNumber}</a>}
                    <span className="shrink-0 text-xs text-muted">{STATUS_LABELS[run.status]} · {formatMinutes(run.computeSeconds)}</span>
                    {active && (
                      <button type="button" onClick={() => cancel(run)} title="Cancel run" aria-label="Cancel run" className="grid h-6 w-6 place-items-center rounded-full hover:bg-red-400/20">
                        <Square aria-hidden className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  {openRun === run.id && <pre className="mx-3 mb-3 max-h-48 overflow-auto zx-code rounded-xl p-3 text-xs text-white/90" data-testid="app-run-log">{runLog.map(event => eventLine(event.type, event.payload)).join("\n") || "No events yet."}</pre>}
                </li>
              );
            })}
          </ul>
        </section>
        <section className="glass rounded-3xl p-5 text-sm">
          <h2 className="font-display text-lg font-bold">More</h2>
          <p className="mt-1 text-muted">GitHub, routines, memory and notifications live in your Zaprex dashboard.</p>
          <a href={ZAPREX_DASHBOARD_URL} className="mt-3 inline-flex items-center gap-1.5 font-semibold text-sky hover:underline">Open dashboard <ExternalLink aria-hidden className="h-3.5 w-3.5" /></a>
          <p className="mt-4 text-xs text-muted">Signed in as <b className="text-ink">{session.user.email}</b> with your Ingot account.</p>
        </section>
      </aside>
    </div>
  );
}

function ChatMessage({ message, onRun }: { message: Message; onRun?: (task: string) => void }) {
  if (message.kind === "approval") {
    return <p className="flex items-center gap-2 text-xs text-muted"><ShieldAlert aria-hidden className="h-3.5 w-3.5 text-gold" /> {message.text}</p>;
  }
  const mine = message.role === "user";
  const pr = mine ? undefined : prLinkIn(message.text);
  const task = mine ? undefined : taskIn(message.text);
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`} data-role={message.role}>
      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${mine ? "bg-blue text-white" : "border border-line bg-surface"}`}>
        {!mine && <p className="mb-0.5 text-xs font-bold text-gold">Zaprex</p>}
        <p className="whitespace-pre-wrap break-words">{task ? withoutTaskLine(message.text) : message.text}</p>
        {task && (
          <button type="button" disabled={!onRun} onClick={() => onRun?.(task)} data-testid="app-start-run" title={task}
            className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-navy disabled:opacity-50">
            <Play aria-hidden className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">Start run: {task}</span>
          </button>
        )}
        {pr && <a href={pr} target="_blank" rel="noreferrer" data-testid="app-pr-link" className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-sky hover:underline"><GitPullRequestDraft aria-hidden className="h-3.5 w-3.5" /> Open draft PR</a>}
      </div>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="grid flex-1 place-items-center px-5 py-16">{children}</div>;
}
