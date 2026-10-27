"use client";

import { Activity, ArrowUp, Check, Copy, CornerUpLeft, FileText, GitPullRequestDraft, Loader2, MessageSquare, Mic, Play, Plus, RefreshCw, Search, ShieldAlert, Square, SquarePen, ThumbsDown, ThumbsUp, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AccountButton } from "@/components/AccountButton";
import { LiveMascot } from "@/components/app/LiveMascot";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Markdown } from "@/components/app/Markdown";
import { startSignIn, type AccountUser } from "@/lib/auth";
import { initNativeApp } from "@/lib/native";
import { useNewVersion } from "@/lib/version";
import {
  ACTIVE_POLL_MS, activityFor, botApi, errorText, eventLine, formatMinutes, IDLE_POLL_MS, isActive, MAX_PROMPT, mascotPose, modeNotice, planLabel, prLinkIn, quotable, STATUS_LABELS, talk, taskIn, withoutTaskLine, withQuote,
  type Approval, type Chat, type Decision, type Feedback, type Pose, type Entitlement, type Message, type Repo, type Run, type RunEvent, type Usage,
} from "@/lib/bot";
import { INGOT } from "@/lib/site";
import { ACCEPT, MAX_ATTACHMENTS, MAX_TOTAL_BYTES, bytesOf, formatSize, payloadOf, readAttachment, type Attachment } from "@/lib/attachments";

/** Browser speech recognition (Chrome/Safari prefix); the mic button only shows where it exists. */
type Recognition = { lang: string; interimResults: boolean; onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onend: (() => void) | null; onerror: (() => void) | null; start: () => void; stop: () => void };
const speechRecognition = (): (new () => Recognition) | undefined => {
  if (typeof window === "undefined") return undefined;
  const scope = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
  return scope.SpeechRecognition ?? scope.webkitSpeechRecognition;
};

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
  /** Latest event of the active run, for the live status line (IDEA-182). */
  lastEvent?: RunEvent;
  error?: string;
}

const EMPTY: BotState = { loaded: false, repos: [], messages: [], approvals: [], runs: [] };
const EXAMPLES = ["Hi Zaprex! What can you do?", "Fix the failing tests", "How should I add pagination to the orders list?"];

/** Local preview of an attached image (a data URL, so next/image has nothing to optimize). */
function Thumb({ src, alt, className, testId }: { src: string; alt: string; className: string; testId?: string }) {
  // eslint-disable-next-line @next/next/no-img-element -- data URL preview
  return <img src={src} alt={alt} className={className} data-testid={testId} />;
}

/** True below the `sm` breakpoint (IDEA-193), where the chat header also carries the theme and account buttons. */
function usePhone(): boolean {
  const [phone, setPhone] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 639px)");
    const sync = () => setPhone(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  return phone;
}

/** A reply being streamed right now (IDEA-177). */
interface Live { user: string; reply: string; phase: "thinking" | "talking"; attachments: Attachment[]; search?: string }
/** The message being replied to (IDEA-187). */
interface ReplyTo { role: "user" | "bot"; text: string }
/** A chat message that failed, so the error line can offer Retry (IDEA-188). */
interface Failed { prompt: string; attachments: Attachment[]; quote?: string }

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
  const [taskMode, setTaskMode] = useState(false);
  const [listening, setListening] = useState(false);
  const [canDictate, setCanDictate] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [dragging, setDragging] = useState(false);
  const [replyTo, setReplyTo] = useState<ReplyTo>();
  const [failedTalk, setFailedTalk] = useState<Failed>();
  /** IDEA-189: "" is the original thread; otherwise a chat from New chat. */
  const [chatId, setChatId] = useState("");
  const [chatTitle, setChatTitle] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [panel, setPanel] = useState<"chats" | "runs">();
  const [chatQuery, setChatQuery] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const picker = useRef<HTMLInputElement>(null);
  const recognition = useRef<Recognition | undefined>(undefined);
  const thread = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const poll = useRef<() => void>(() => undefined);

  useEffect(() => { initNativeApp(); }, []);
  const phone = usePhone();
  // IDEA-193: on phones the chat header is the only bar once signed in (the site bar stays for loading and sign-in).
  useEffect(() => {
    if (session.kind !== "signed-in") return;
    document.documentElement.dataset.zxChat = "";
    return () => { delete document.documentElement.dataset.zxChat; };
  }, [session.kind]);
  // IDEA-192: pick up a new deploy (desktop/phone windows stay open for days). Reload only when nothing would be lost.
  const updated = useNewVersion(useCallback(() => !draft.trim() && !live && !busy && attachments.length === 0, [draft, live, busy, attachments.length]));

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
    const params = new URLSearchParams();
    if (repoId) params.set("repoId", repoId);
    if (chatId) params.set("chatId", chatId);
    const chatPath = `/chat${params.size ? `?${params}` : ""}`;
    const [status, usage, repos, chat, approvals, runs] = await Promise.all([
      botApi("GET", "/status"), botApi("GET", "/usage"), botApi("GET", "/repos"), botApi("GET", chatPath), botApi("GET", "/approvals"), botApi("GET", "/runs?limit=20"),
    ]);
    if (status.status === 401) { setSession({ kind: "signed-out" }); return; }
    const activeRun = runs.status === 200 ? ((runs.body.runs as Run[] | undefined) ?? []).find(isActive) : undefined;
    const events = activeRun ? await botApi("GET", `/runs/${encodeURIComponent(activeRun.id)}/events`) : undefined;
    const lastEvent = events?.status === 200 ? ((events.body.events as RunEvent[] | undefined) ?? []).at(-1) : undefined;
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
        lastEvent,
      };
    });
    const active = runs.status === 200 && ((runs.body.runs as Run[] | undefined) ?? []).some(isActive);
    timer.current = setTimeout(() => poll.current(), active ? ACTIVE_POLL_MS : IDLE_POLL_MS);
  }, [repoId, chatId]);

  /** Past chats (IDEA-189), searched on the server by title or message text. */
  const loadChats = useCallback(async (q: string) => {
    const response = await botApi("GET", `/chats${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`);
    if (response.status === 200) setChats((response.body.chats as Chat[] | undefined) ?? []);
  }, []);

  useEffect(() => {
    if (panel !== "chats") return;
    const wait = setTimeout(() => void loadChats(chatQuery), 200);
    return () => clearTimeout(wait);
  }, [panel, chatQuery, loadChats]);

  useEffect(() => {
    if (!panel) return;
    const close = (event: MouseEvent) => { if (!panelRef.current?.contains(event.target as Node)) setPanel(undefined); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setPanel(undefined); };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", escape); };
  }, [panel]);

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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- feature detection needs the browser
    setCanDictate(!!speechRecognition());
    return () => recognition.current?.stop();
  }, []);

  /** Mic (IDEA-182): dictation into the input with the browser's own speech recognition. */
  function toggleDictation() {
    if (listening) { recognition.current?.stop(); return; }
    const Speech = speechRecognition();
    if (!Speech) return;
    const rec = new Speech();
    rec.lang = navigator.language || "en-US";
    rec.interimResults = false;
    rec.onresult = event => {
      const said = Array.from(event.results).map(result => result[0]?.transcript ?? "").join(" ").trim();
      if (said) setDraft(current => (current ? `${current} ${said}` : said));
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognition.current = rec;
    setListening(true);
    rec.start();
  }

  /** Attach (IDEA-186): from the + picker, drag and drop, or a pasted image. */
  async function addFiles(files: File[]) {
    if (!files.length || locked) return;
    let next = [...attachments];
    const problems: string[] = [];
    for (const file of files) {
      if (next.length >= MAX_ATTACHMENTS) { problems.push(`You can attach up to ${MAX_ATTACHMENTS} files per message.`); break; }
      try {
        const item = await readAttachment(file);
        if (bytesOf([...next, item]) > MAX_TOTAL_BYTES) { problems.push(`${item.name} does not fit: attachments are limited to ${formatSize(MAX_TOTAL_BYTES)} per message.`); continue; }
        next = [...next, item];
      } catch (error) {
        problems.push(error instanceof Error ? error.message : "That file could not be attached.");
      }
    }
    setAttachments(next);
    setActionError(problems.join(" "));
    if (next.length) setTaskMode(false);
  }

  function submit() {
    if (!taskMode) { send(); return; }
    const task = draft.trim();
    if (!task || busy) return;
    setDraft("");
    setTaskMode(false);
    startRun(task);
  }

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
  function send(text = draft, retry?: Failed) {
    const prompt = (retry?.prompt ?? text).trim().slice(0, MAX_PROMPT);
    const files = retry ? retry.attachments : text === draft ? attachments : [];
    if ((!prompt && !files.length) || busy) return;
    const quote = retry ? retry.quote : text === draft ? replyTo?.text : undefined;
    setFailedTalk(undefined);
    setDraft("");
    setAttachments([]);
    setReplyTo(undefined);
    setBusy(true);
    setActionError("");
    setLive({ user: withQuote(prompt, quote), reply: "", phase: "thinking", attachments: files });
    void (async () => {
      let failed = "";
      let answered = false;
      let finished = false;
      const response = await talk(prompt, repoId || null, event => {
        if (event.type === "text" && event.text.trim()) answered = true;
        if (event.type === "done") finished = true;
        if (event.type === "text") setLive(current => current && { ...current, reply: current.reply + event.text, phase: "talking" });
        if (event.type === "search") setLive(current => current && { ...current, search: event.query });
        if (event.type === "error") failed = errorText({ status: 502, body: { error: event.code } });
      }, undefined, payloadOf(files), quote, chatId || undefined);
      if (chatId && !chatTitle) setChatTitle(plainTitle(prompt));
      if (response) failed = errorText(response);
      // IDEA-188: a turn that ends without any answer is an error with Retry, never a silent drop.
      if (!failed && (!answered || !finished)) failed = errorText({ status: 502, body: { error: answered ? "upstream_stream_failed" : "empty_reply" } });
      await refresh();
      setLive(undefined);
      setActionError(failed);
      if (failed) setFailedTalk({ prompt, attachments: files, quote });
      setBusy(false);
    })();
  }

  /** New chat (IDEA-189): an empty chat; the original thread stays one click away in Search. */
  function newChat() {
    if (busy) return;
    void act(async () => {
      const response = await botApi("POST", "/chats", { repoId: repoId || null });
      if (response.status !== 201) return errorText(response);
      const chat = response.body.chat as Chat;
      setPanel(undefined);
      setReplyTo(undefined);
      setFailedTalk(undefined);
      setState(previous => ({ ...previous, messages: [] }));
      setChatTitle("");
      setChatId(chat.id);
      return "";
    });
  }

  function openChat(chat?: Chat) {
    setPanel(undefined);
    setReplyTo(undefined);
    setFailedTalk(undefined);
    setActionError("");
    setState(previous => ({ ...previous, messages: [] }));
    setChatTitle(plainTitle(chat?.title ?? ""));
    setChatId(chat?.id ?? "");
  }

  /** Thumbs up/down (IDEA-189): toggles, saved on the server; a thumbs-down can carry a short reason. */
  async function giveFeedback(message: Message, value: Feedback | 0, reason?: string) {
    const previous = { feedback: message.feedback ?? null, feedbackReason: message.feedbackReason ?? null };
    const patch = (feedback: Feedback | null, feedbackReason: string | null) =>
      setState(current => ({ ...current, messages: current.messages.map(other => (other.id === message.id ? { ...other, feedback, feedbackReason } : other)) }));
    patch(value === 0 ? null : value, value === -1 ? reason ?? null : null);
    const response = await botApi("PUT", `/messages/${message.id}/feedback`, { value, ...(reason ? { reason } : {}) });
    if (response.status !== 200) { patch(previous.feedback, previous.feedbackReason); setActionError(errorText(response)); }
  }

  /** Starts a background run (draft PR) for a task Zaprex proposed or the user typed. */
  function startRun(task: string) {
    void act(async () => {
      const response = await botApi("POST", "/chat", { text: task, repoId: repoId || null, ...(chatId ? { chatId } : {}) });
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
  const plan = planLabel(state.entitlement);
  const activeRun = state.runs.find(isActive);
  const activity = live ? (live.phase === "thinking" ? (live.search ? `Searching the web: ${live.search}` : "Thinking") : "Answering") : activityFor(activeRun, state.lastEvent);
  const lastBot = [...state.messages].reverse().find(message => message.role === "bot" && message.kind !== "approval")?.id;
  const pending = state.approvals.filter(approval => approval.status === "pending");
  const locked = state.entitlement && !state.entitlement.enabled;
  const running = state.runs.filter(isActive).length;

  return (
    <div className="mx-auto flex min-h-0 w-full min-w-0 max-w-4xl flex-1 flex-col overflow-x-hidden px-0 pt-0 pb-[env(safe-area-inset-bottom)] sm:overflow-visible sm:px-4 sm:pb-[max(1rem,env(safe-area-inset-bottom))] sm:pt-3" data-testid="zaprex-app">
      <section className="zx-chat-card glass flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden sm:rounded-3xl" aria-label="Chat with Zaprex">
        <div className="zx-chat-bar relative flex items-center gap-1.5 border-b border-line pb-2 pl-[max(0.5rem,env(safe-area-inset-left))] pr-[max(0.5rem,env(safe-area-inset-right))] pt-[calc(0.5rem+env(safe-area-inset-top))] sm:gap-2 sm:px-4 sm:py-2.5" ref={panelRef} data-testid="app-bar">
          <button type="button" onClick={newChat} disabled={busy || !!locked} title="New chat" aria-label="New chat" data-testid="app-new-chat"
            className="zx-round grid h-9 w-9 shrink-0 place-items-center rounded-full transition hover:text-gold disabled:opacity-40">
            <SquarePen aria-hidden className="h-[18px] w-[18px]" />
          </button>
          <button type="button" onClick={() => setPanel(open => (open === "chats" ? undefined : "chats"))} aria-expanded={panel === "chats"} title="Search chats" aria-label="Search chats" data-testid="app-search-chats"
            className="zx-round grid h-9 w-9 shrink-0 place-items-center rounded-full transition hover:text-gold">
            <Search aria-hidden className="h-[18px] w-[18px]" />
          </button>
          <LiveMascot id="app-head" pose={pose} className="-my-2 ml-1 hidden h-10 w-10 shrink-0 sm:block" />
          <div className="min-w-0 flex-1 pl-1 sm:pl-0">
            <h1 dir="auto" className="font-display truncate text-base font-bold leading-tight" data-testid="app-chat-title">{chatId ? chatTitle || "New chat" : "Zaprex"}</h1>
            <p className="truncate text-xs text-muted" data-testid="app-usage">
              {state.usage
                ? `${state.usage.minutesUsed}${state.usage.minutesLimit ? ` / ${state.usage.minutesLimit}` : ""} min this month`
                : "Your background coding bot"}
            </p>
          </div>
          {state.runs.length > 0 && (
            <button type="button" onClick={() => setPanel(open => (open === "runs" ? undefined : "runs"))} aria-expanded={panel === "runs"} data-testid="app-runs-indicator"
              title={running ? `${running} running` : "Recent runs"}
              className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-xs font-semibold transition ${running ? "border-sky/60 text-sky" : "border-line text-muted hover:text-ink"}`}>
              <Activity aria-hidden className={`h-3.5 w-3.5 ${running ? "animate-pulse" : ""}`} /> {running ? `${running} running` : "Runs"}
            </button>
          )}
          {plan && <span className="hidden rounded-full border border-gold/50 bg-gold/15 px-2.5 py-0.5 text-xs font-semibold text-gold sm:inline" data-testid="app-plan">{plan}</span>}
          {notice === "test" && <span className="hidden rounded-full border border-line px-2.5 py-0.5 text-xs font-semibold text-muted sm:inline" title="Chat and runs use the mock model" data-testid="app-test-mode">Test mode</span>}
          {state.repos.length > 0 && (
            <select aria-label="Repository" data-testid="app-repo" value={repoId} onChange={event => setRepoId(event.target.value)}
              className="hidden h-9 max-w-44 rounded-full border border-line bg-surface px-3 text-sm sm:block">
              <option value="">No repository</option>
              {state.repos.map(repo => <option key={repo.id} value={repo.id}>{repo.fullName}</option>)}
            </select>
          )}
          <button type="button" onClick={() => void refresh()} title="Refresh" aria-label="Refresh" className="zx-round hidden h-9 w-9 shrink-0 place-items-center rounded-full sm:grid">
            <RefreshCw aria-hidden className="h-4 w-4" />
          </button>

          {phone && (
            <div className="flex shrink-0 items-center gap-1 sm:hidden" data-testid="app-bar-account">
              <ThemeToggle compact />
              <AccountButton />
            </div>
          )}

          {panel === "chats" && (
            <div className="zx-popover absolute left-2 top-full z-30 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-line bg-surface p-2 shadow-xl" data-testid="app-chats-panel" role="dialog" aria-label="Search chats">
              <label className="flex items-center gap-2 rounded-xl border border-line px-3">
                <Search aria-hidden className="h-4 w-4 text-muted" />
                <input dir="auto" autoFocus value={chatQuery} onChange={event => setChatQuery(event.target.value)} placeholder="Search chats…" aria-label="Search chats" data-testid="app-chat-search"
                  className="h-9 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted sm:text-sm" />
              </label>
              <ul className="mt-2 max-h-80 overflow-y-auto">
                {!chatQuery.trim() && (
                  <li><button type="button" onClick={() => openChat()} data-testid="app-chat-item" data-active={!chatId}
                    className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-bg-soft ${!chatId ? "font-semibold text-gold" : ""}`}>
                    <MessageSquare aria-hidden className="h-4 w-4 shrink-0" /> Main thread
                  </button></li>
                )}
                {chats.map(chat => (
                  <li key={chat.id}><button type="button" onClick={() => openChat(chat)} data-testid="app-chat-item" data-active={chat.id === chatId}
                    className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-bg-soft ${chat.id === chatId ? "font-semibold text-gold" : ""}`}>
                    <MessageSquare aria-hidden className="h-4 w-4 shrink-0 text-muted" />
                    <span dir="auto" className="min-w-0 flex-1 truncate text-start">{plainTitle(chat.title) || "New chat"}</span>
                    <span className="shrink-0 text-xs text-muted">{shortDate(chat.updatedAt)}</span>
                  </button></li>
                ))}
                {chatQuery.trim() && chats.length === 0 && <li className="px-3 py-2 text-sm text-muted">No chats match.</li>}
              </ul>
            </div>
          )}

          {panel === "runs" && (
            <div className="zx-popover absolute right-2 top-full z-30 mt-2 w-[min(26rem,calc(100vw-2rem))] rounded-2xl border border-line bg-surface p-3 shadow-xl" data-testid="app-runs" role="dialog" aria-label="Runs">
              <p className="mb-2 flex items-center justify-between text-xs font-semibold text-muted"><span>Runs</span><span>{running ? `${running} running` : "none running"}</span></p>
              <ul className="max-h-96 space-y-2 overflow-y-auto">
                {state.runs.slice(0, 8).map(run => {
                  const active = isActive(run);
                  return (
                    <li key={run.id} className="rounded-xl border border-line" data-status={run.status}>
                      <div className="flex items-center gap-2 px-3 py-2">
                        <span aria-hidden className={`h-2 w-2 shrink-0 rounded-full ${active ? "animate-pulse bg-sky" : run.status === "succeeded" ? "bg-emerald-400" : "bg-red-400"}`} />
                        <button type="button" onClick={() => void toggleRun(run)} title={run.prompt} aria-expanded={openRun === run.id} dir="auto" className="min-w-0 flex-1 truncate text-start text-sm">{run.prompt}</button>
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
            </div>
          )}
        </div>

        {updated && (
          <p className="flex items-center justify-center gap-2 border-b border-line bg-gold/10 px-3 py-1.5 text-xs" role="status" data-testid="app-update">
            Zaprex was updated.
            <button type="button" onClick={() => window.location.reload()} className="font-semibold text-gold hover:underline" data-testid="app-update-reload">Reload</button>
          </p>
        )}
        <div ref={thread} className="min-h-0 flex-1 space-y-3 overflow-y-auto overflow-x-hidden overscroll-contain px-2.5 py-3 sm:px-5 sm:py-5" data-testid="app-thread" aria-live="polite">
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
          {state.messages.map(message => <ChatMessage key={message.id} message={message} onRun={busy || locked ? undefined : startRun} onFeedback={locked ? undefined : giveFeedback} onReply={locked ? undefined : m => { setReplyTo({ role: m.role === "user" ? "user" : "bot", text: quotable(m.text) }); setTaskMode(false); }} avatar={message.id === lastBot && !live ? <LiveMascot id="app-avatar-last" pose="idle" testId="app-avatar" className="h-10 w-10" /> : undefined} />)}
          {live && (
            <>
              {live.attachments.length > 0 && (
                <div className="flex flex-wrap items-center justify-end gap-2" data-testid="app-live-attachments">
                  {live.attachments.map(item => item.kind === "image"
                    ? <Thumb key={item.id} src={item.dataUrl} alt={item.name} className="h-20 w-20 rounded-xl border border-line object-cover" />
                    : <span key={item.id} className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-2.5 py-1.5 text-xs"><FileText aria-hidden className="h-3.5 w-3.5 text-muted" />{item.name}</span>)}
                </div>
              )}
              {live.user && <ChatMessage message={{ id: -1, role: "user", kind: "text", text: live.user, runId: null, approvalId: null, createdAt: "" }} />}
              <div className="flex items-end justify-start gap-2" data-role="bot" data-testid="app-live-reply">
                <LiveMascot id="app-avatar-live" pose={live.phase} testId="app-avatar" className="-mb-1 hidden h-10 w-10 shrink-0 sm:block" />
                <div className="zx-bubble w-full min-w-0 rounded-2xl border border-line bg-surface px-3.5 py-2.5 text-[15px] sm:w-auto sm:max-w-[85%] sm:px-4 sm:text-sm">
                  <p className="mb-0.5 text-xs font-bold text-gold">Zaprex</p>
                  {live.reply
                    ? <div><Markdown text={withoutTaskLine(live.reply)} /><span aria-hidden className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse rounded-sm bg-gold align-middle" /></div>
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

        {actionError && (
          <div role="alert" className="flex items-center gap-3 px-5 pb-2 text-sm text-red-400" data-testid="app-error">
            <span className="min-w-0 flex-1">{actionError}</span>
            {failedTalk && (
              <button type="button" disabled={busy} onClick={() => send("", failedTalk)} data-testid="app-retry"
                className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-red-400/60 px-3 text-xs font-semibold text-red-400 hover:bg-red-400/10 disabled:opacity-50">
                <RefreshCw aria-hidden className="h-3.5 w-3.5" /> Retry
              </button>
            )}
          </div>
        )}
        <div className="px-2 pb-2 pt-1 sm:px-4 sm:pb-3">
          <div className="flex h-6 items-center gap-2 px-2 text-xs sm:h-7 sm:text-sm" aria-live="polite" data-testid="app-status">
            <LiveMascot id="app-status" pose={live ? live.phase : pose} testId="app-status-mascot" className="h-6 w-6 shrink-0 sm:h-7 sm:w-7" />
            <span className={`min-w-0 truncate ${activity ? "zx-activity text-muted" : "text-muted/70"}`}>{activity ?? (locked ? "Zaprex is locked on this plan" : "Ready when you are")}</span>
          </div>
          <form className={`zx-composer mt-1 rounded-[28px] border p-1.5 transition ${dragging ? "zx-dropping" : ""}`} onSubmit={event => { event.preventDefault(); submit(); }} data-testid="app-composer"
            onDragOver={event => { if (event.dataTransfer.types.includes("Files") && !locked) { event.preventDefault(); setDragging(true); } }}
            onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false); }}
            onDrop={event => { event.preventDefault(); setDragging(false); void addFiles(Array.from(event.dataTransfer.files)); }}>
            {replyTo && (
              <div className="zx-chip mx-1.5 mb-1.5 mt-1 flex items-start gap-2 rounded-2xl border px-3 py-2 text-xs" data-testid="app-reply-chip">
                <CornerUpLeft aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                <span className="min-w-0 flex-1"><span className="font-semibold">Replying to {replyTo.role === "bot" ? "Zaprex" : "yourself"}</span><span dir="auto" className="line-clamp-2 block text-muted">{replyTo.text}</span></span>
                <button type="button" onClick={() => setReplyTo(undefined)} aria-label="Cancel reply" title="Cancel reply" data-testid="app-reply-cancel" className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-black/40 text-white hover:bg-black/60"><X aria-hidden className="h-3 w-3" /></button>
              </div>
            )}
            {attachments.length > 0 && (
              <ul className="flex flex-wrap gap-2 px-1.5 pb-1.5 pt-1" aria-label="Attachments" data-testid="app-attachments">
                {attachments.map(item => (
                  <li key={item.id} className="zx-chip group relative flex items-center gap-2 rounded-2xl border p-1 pr-2 text-xs" data-testid="app-attachment" data-kind={item.kind}>
                    {item.kind === "image"
                      ? <Thumb src={item.dataUrl} alt="" className="h-10 w-10 rounded-xl object-cover" testId="app-attachment-thumb" />
                      : <span className="grid h-10 w-10 place-items-center rounded-xl bg-black/10"><FileText aria-hidden className="h-4 w-4 text-muted" /></span>}
                    <span className="flex min-w-0 flex-col"><span className="max-w-36 truncate font-medium">{item.name}</span><span className="text-muted">{formatSize(item.size)}</span></span>
                    <button type="button" onClick={() => setAttachments(current => current.filter(other => other.id !== item.id))} aria-label={`Remove ${item.name}`} title="Remove" data-testid="app-attachment-remove"
                      className="ml-1 grid h-5 w-5 place-items-center rounded-full bg-black/40 text-white hover:bg-black/60"><X aria-hidden className="h-3 w-3" /></button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex items-end gap-1 sm:gap-2">
              <input ref={picker} type="file" multiple accept={ACCEPT} hidden data-testid="app-file-input" onChange={event => { void addFiles(Array.from(event.target.files ?? [])); event.target.value = ""; }} />
              <button type="button" onClick={() => picker.current?.click()} disabled={!!locked || taskMode} data-testid="app-plus"
                title={taskMode ? "Attachments are for chat messages" : "Attach files or images"} aria-label="Attach files or images"
                className="zx-round grid h-9 w-9 shrink-0 place-items-center rounded-full transition disabled:opacity-40">
                <Plus aria-hidden className="h-5 w-5" />
              </button>
              <textarea dir="auto" value={draft} onChange={event => setDraft(event.target.value)} rows={1} maxLength={MAX_PROMPT} disabled={!!locked} data-testid="app-input"
                onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submit(); } }}
                onPaste={event => { const files = Array.from(event.clipboardData.files); if (files.length) { event.preventDefault(); void addFiles(files); } }}
                placeholder={taskMode ? "Describe the task: Zaprex opens a draft PR…" : "Ask Zaprex anything…"} aria-label="Message Zaprex"
                className="max-h-40 min-h-9 min-w-0 flex-1 resize-none bg-transparent px-1 py-2 text-base leading-5 outline-none [field-sizing:content] placeholder:truncate placeholder:text-muted sm:text-[15px]" />
              <button type="button" onClick={() => setTaskMode(on => !on)} aria-pressed={taskMode} disabled={!!locked || attachments.length > 0} data-testid="app-task-toggle"
                title={attachments.length ? "Remove attachments to start a task" : taskMode ? "Back to chat" : "Run as a background task (draft PR)"}
                aria-label="Task mode" className={`mb-1 inline-flex h-7 shrink-0 items-center gap-1 rounded-full border px-2 text-xs font-semibold transition disabled:opacity-40 sm:px-2.5 ${taskMode ? "border-gold bg-gold text-navy" : "border-line text-muted hover:text-gold"}`}>
                <Play aria-hidden className="h-3 w-3" /> <span className="max-[420px]:sr-only">Task</span>
              </button>
              {canDictate && (
                <button type="button" onClick={toggleDictation} disabled={!!locked} aria-pressed={listening} title={listening ? "Stop dictation" : "Dictate"} aria-label="Dictate" data-testid="app-mic"
                  className={`zx-round grid h-9 w-9 shrink-0 place-items-center rounded-full ${listening ? "animate-pulse text-gold" : "text-muted"}`}>
                  <Mic aria-hidden className="h-[18px] w-[18px]" />
                </button>
              )}
              <button type="submit" disabled={busy || (!draft.trim() && !(attachments.length && !taskMode)) || !!locked} data-testid="app-send" aria-label={taskMode ? "Start run" : "Send"} title={taskMode ? "Start run" : "Send"}
                className="zx-send grid h-9 w-9 shrink-0 place-items-center rounded-full transition disabled:opacity-40">
                {busy ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : <ArrowUp aria-hidden className="h-5 w-5" strokeWidth={2.5} />}
              </button>
            </div>
          </form>
        </div>
      </section>

    </div>
  );
}

function ChatMessage({ message, onRun, onReply, onFeedback, avatar }: { message: Message; onRun?: (task: string) => void; onReply?: (message: Message) => void; onFeedback?: (message: Message, value: Feedback | 0, reason?: string) => void; avatar?: React.ReactNode }) {
  const [asking, setAsking] = useState(false);
  const [reason, setReason] = useState("");
  if (message.kind === "approval") {
    return <p className="flex items-center gap-2 text-xs text-muted"><ShieldAlert aria-hidden className="h-3.5 w-3.5 text-gold" /> {message.text}</p>;
  }
  const mine = message.role === "user";
  const pr = mine ? undefined : prLinkIn(message.text);
  const task = mine ? undefined : taskIn(message.text);
  return (
    <>
    <div className={`group flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`} data-role={message.role} data-testid="app-message" data-feedback={message.feedback ?? undefined}>
      {!mine && <span className="hidden shrink-0 sm:block">{avatar ?? <span aria-hidden className="block w-10" />}</span>}
      {/* IDEA-193: phones stack the actions under the bubble so the bubble gets the width; Zaprex's replies go full width. */}
      <div className={`flex min-w-0 flex-col gap-1 sm:flex-row sm:items-end sm:gap-2 ${mine ? "max-w-[85%] items-end sm:max-w-[92%] sm:flex-row-reverse" : "w-full items-start sm:w-auto sm:max-w-[92%]"}`}>
      <div className={`zx-bubble min-w-0 max-w-full rounded-2xl py-2.5 text-[15px] sm:text-sm ${mine ? "zx-mine bg-blue px-3.5 text-white sm:px-4" : "w-full border border-line bg-surface px-3.5 sm:w-auto sm:px-4"}`}>
        {!mine && <p className="mb-0.5 text-xs font-bold text-gold">Zaprex</p>}
        <Markdown text={task ? withoutTaskLine(message.text) : message.text} />
        {task && (
          <button type="button" disabled={!onRun} onClick={() => onRun?.(task)} data-testid="app-start-run" title={task}
            className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-navy disabled:opacity-50">
            <Play aria-hidden className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">Start run: {task}</span>
          </button>
        )}
        {pr && <a href={pr} target="_blank" rel="noreferrer" data-testid="app-pr-link" className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-sky hover:underline"><GitPullRequestDraft aria-hidden className="h-3.5 w-3.5" /> Open draft PR</a>}
      </div>
      {onReply && <MessageActions message={message} onReply={onReply} onFeedback={!mine && onFeedback && message.id > 0 ? (value) => {
        onFeedback(message, value);
        setAsking(value === -1);
        setReason("");
      } : undefined} />}
      </div>
    </div>
    {asking && onFeedback && (
      <form className="flex items-center gap-2 sm:ml-12 sm:max-w-[85%]" data-testid="app-feedback-form"
        onSubmit={event => { event.preventDefault(); if (reason.trim()) onFeedback(message, -1, reason.trim()); setAsking(false); }}>
        <input dir="auto" autoFocus value={reason} onChange={event => setReason(event.target.value)} maxLength={300} placeholder="What went wrong? (optional)" aria-label="What went wrong?" data-testid="app-feedback-reason"
          className="h-8 min-w-0 flex-1 rounded-full border border-line bg-surface px-3 text-base outline-none focus:border-gold sm:text-xs" />
        <button type="submit" data-testid="app-feedback-send" className="h-8 rounded-full bg-gold px-3 text-xs font-semibold text-navy">Send</button>
        <button type="button" onClick={() => setAsking(false)} className="h-8 rounded-full px-2 text-xs text-muted hover:text-ink">Skip</button>
      </form>
    )}
    </>
  );
}

/** Hover (or focus) actions on a message (IDEA-187/189): Reply, Copy, and thumbs up/down on Zaprex's replies. A chosen thumb stays visible. */
function MessageActions({ message, onReply, onFeedback }: { message: Message; onReply: (message: Message) => void; onFeedback?: (value: Feedback | 0) => void }) {
  const [copied, setCopied] = useState(false);
  const base = "grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line bg-surface text-muted transition hover:text-gold focus-visible:opacity-100";
  // Phones have no hover: the actions stay faintly visible under the bubble there.
  const hidden = "opacity-0 group-hover:opacity-100 max-sm:opacity-60";
  const liked = message.feedback === 1;
  const disliked = message.feedback === -1;
  async function copy() {
    try { await navigator.clipboard.writeText(withoutTaskLine(message.text)); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* clipboard blocked */ }
  }
  return (
    <div className={`flex shrink-0 items-center gap-1 sm:mb-1 ${message.role === "user" ? "flex-row-reverse" : ""}`} data-testid="app-message-actions">
      <button type="button" onClick={() => onReply(message)} title="Reply" aria-label="Reply to this message" data-testid="app-reply" className={`${base} ${hidden}`}>
        <CornerUpLeft aria-hidden className="h-3.5 w-3.5" />
      </button>
      <button type="button" onClick={() => void copy()} title={copied ? "Copied" : "Copy"} aria-label="Copy message" data-testid="app-copy" className={`${base} ${hidden}`}>
        {copied ? <Check aria-hidden className="h-3.5 w-3.5 text-emerald-400" /> : <Copy aria-hidden className="h-3.5 w-3.5" />}
      </button>
      {onFeedback && (
        <>
          <button type="button" onClick={() => onFeedback(liked ? 0 : 1)} aria-pressed={liked} title={liked ? "Remove like" : "Good answer"} aria-label="Good answer" data-testid="app-like"
            className={`${base} ${liked ? "border-gold/60 text-gold" : hidden}`}>
            <ThumbsUp aria-hidden className="h-3.5 w-3.5" fill={liked ? "currentColor" : "none"} />
          </button>
          <button type="button" onClick={() => onFeedback(disliked ? 0 : -1)} aria-pressed={disliked} title={disliked ? (message.feedbackReason ? `Removes: ${message.feedbackReason}` : "Remove dislike") : "Bad answer"} aria-label="Bad answer" data-testid="app-dislike"
            className={`${base} ${disliked ? "border-red-400/60 text-red-400" : hidden}`}>
            <ThumbsDown aria-hidden className="h-3.5 w-3.5" fill={disliked ? "currentColor" : "none"} />
          </button>
        </>
      )}
    </div>
  );
}

/** A chat title without Markdown marks (the server stores the same). */
function plainTitle(text: string): string {
  const line = text.split("\n").map(part => part.trim()).find(part => part && !part.startsWith(">")) ?? "";
  const plain = line.replace(/[*_`~#]+/g, "").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").trim();
  return plain.length > 80 ? `${plain.slice(0, 79).trimEnd()}…` : plain;
}

function shortDate(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  return date.toDateString() === today.toDateString()
    ? date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="grid min-h-0 flex-1 place-items-center overflow-y-auto px-5 py-10">{children}</div>;
}
