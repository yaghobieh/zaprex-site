/**
 * Zaprex app (IDEA-173): the client side of the bot API on ingot-server. Calls go to this site's own `/api/bot/*`
 * proxy, so the shared Ingot session cookie is first-party and no token ever reaches the page.
 */
export type RunStatus = "queued" | "starting" | "running" | "awaiting_approval" | "finishing" | "succeeded" | "failed" | "cancelled" | "timed_out";

export interface Run {
  id: string; status: RunStatus; prompt: string; source: string; repoId: string | null; repoFullName: string | null;
  prNumber: number | null; prUrl: string | null; summary: string; computeSeconds: number; error: string | null;
  createdAt: string; startedAt: string | null; endedAt: string | null;
}
export interface Message { id: number; role: "user" | "bot"; kind: string; text: string; runId: string | null; approvalId: string | null; createdAt: string }
export interface Approval { id: string; runId: string; action: string; title: string; reason: string; preview: string; status: string }
export interface RunEvent { seq: number; type: string; payload: Record<string, unknown>; createdAt: string }
export interface Repo { id: string; fullName: string; defaultBranch: string; enabled: boolean }
export interface Entitlement { enabled: boolean; plan: string; reason: string | null }
export interface Usage { minutesUsed: number; minutesLimit: number | null; activeRuns: number; concurrentLimit: number | null }
export type Decision = "approve_once" | "approve_run" | "reject";
export type Pose = "idle" | "thinking" | "working" | "approval" | "done" | "error";

export const BOT_API = "/api/bot";
export const MAX_PROMPT = 4_000;
export const ACTIVE_POLL_MS = 2_500;
export const IDLE_POLL_MS = 20_000;
export const TERMINAL: readonly RunStatus[] = ["succeeded", "failed", "cancelled", "timed_out"];

export const STATUS_LABELS: Record<RunStatus, string> = {
  queued: "Queued", starting: "Starting", running: "Running", awaiting_approval: "Waiting for you", finishing: "Finishing",
  succeeded: "Done", failed: "Failed", cancelled: "Cancelled", timed_out: "Timed out",
};

/** Server error codes, in plain words. */
export const ERROR_TEXT: Record<string, string> = {
  bot_upgrade_required: "Zaprex is part of every paid Ingot plan, from $6 a month.",
  bot_paused: "Zaprex is paused right now.",
  bot_limit_minutes: "You have used all Zaprex minutes for this month.",
  bot_limit_concurrent: "A run is already in progress. Wait for it to finish.",
  bot_spend_cap: "The spend cap has been reached.",
  rate_limited: "Too many runs. Try again later.",
  repo_disabled: "This repository is turned off for Zaprex.",
  approval_not_pending: "This approval was already decided.",
  github_not_connected: "Connect GitHub first.",
  account_blocked: "Your account is blocked.",
  unauthorized: "Your session ended. Sign in again.",
  offline: "Can't reach Zaprex. Check your connection.",
  generic: "Something went wrong. Try again.",
};

export interface ApiResponse { status: number; body: Record<string, unknown> }

export async function botApi(method: "GET" | "POST" | "PATCH" | "DELETE", path: string, body?: unknown): Promise<ApiResponse> {
  try {
    const response = await fetch(`${BOT_API}${path}`, {
      method, credentials: "same-origin", cache: "no-store",
      headers: body === undefined ? undefined : { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const json = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    return { status: response.status, body: json };
  } catch {
    return { status: 0, body: {} };
  }
}

export function errorText(response: ApiResponse): string {
  if (response.status === 0) return ERROR_TEXT.offline;
  if (response.status === 401) return ERROR_TEXT.unauthorized;
  const code = typeof response.body.error === "string" ? response.body.error : "generic";
  return ERROR_TEXT[code] ?? ERROR_TEXT.generic;
}

export const isActive = (run: Run): boolean => !TERMINAL.includes(run.status);

const PR_URL = /(https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/pull\/\d+)/;
export const prLinkIn = (text: string): string | undefined => PR_URL.exec(text)?.[1];

/** One readable line per run event. */
export function eventLine(type: string, payload: Record<string, unknown>): string {
  const text = (key: string): string => (typeof payload[key] === "string" ? (payload[key] as string) : "");
  switch (type) {
    case "status": return `status → ${text("status")}${text("error") ? ` (${text("error")})` : ""}`;
    case "tool": return `$ ${text("command")} → exit ${String(payload.exitCode ?? "")}`;
    case "diff": return `changed ${text("file")}`;
    case "pull_request": return `draft PR #${String(payload.number ?? "")}`;
    case "approval": return `approval: ${text("title")}`;
    case "approval_decision": return `decision: ${text("decision")}`;
    default: return text("message") || text("text") || type;
  }
}

export function formatMinutes(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  return minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes}m`;
}

/** Mock models = test mode; live models on a local runner = scratch sandbox; all live = nothing to show. */
export function modeNotice(state: { runner?: string; runnerLive?: boolean; modelsLive?: boolean }): "test" | "sandbox" | undefined {
  if (!state.runner) return undefined;
  if (!state.modelsLive) return "test";
  return state.runner !== "fly" || !state.runnerLive ? "sandbox" : undefined;
}

const RECENT_RUN_MS = 15 * 60 * 1000;
const ACTIVE_POSE: Partial<Record<RunStatus, Pose>> = { queued: "thinking", starting: "thinking", running: "working", finishing: "working", awaiting_approval: "approval" };
const FINISHED_POSE: Partial<Record<RunStatus, Pose>> = { succeeded: "done", failed: "error", cancelled: "error", timed_out: "error" };

/** The mascot follows the real runs: an active run wins (approval > working > thinking); else the latest run if recent. */
export function mascotPose(runs: readonly Run[], now = Date.now()): Pose {
  const active = runs.map(run => ACTIVE_POSE[run.status]).filter(Boolean);
  for (const pose of ["approval", "working", "thinking"] as const) if (active.includes(pose)) return pose;
  const time = (run: Run) => Date.parse(run.endedAt ?? run.createdAt);
  const latest = [...runs].sort((a, b) => time(b) - time(a))[0];
  const pose = latest && FINISHED_POSE[latest.status];
  return pose && now - time(latest) <= RECENT_RUN_MS ? pose : "idle";
}
