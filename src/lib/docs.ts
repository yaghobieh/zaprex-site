/**
 * Zaprex docs content. Facts come from the Zaprex design doc (ingot-server docs/ingot-bot.md, security baseline) and the
 * Zaprex repo README. Plan numbers are not published until approved ("coming soon").
 */
export type Doc = { slug: string; title: string; description: string; group: string; body: string };

export const DOC_GROUPS = ["Get started", "Using Zaprex", "Models and plans", "Trust", "Admins", "Help"] as const;

export const DOCS: Doc[] = [
  {
    slug: "what-is-zaprex",
    group: "Get started",
    title: "What is Zaprex",
    description: "Ingot's background coding agent: it works on your repos while you're away and hands you draft pull requests.",
    body: `
Zaprex is Ingot's personal background coding agent. It works on your repositories while you are away, runs scheduled routines (for example a nightly test-and-fix), opens **draft** pull requests, chats with you in the Ingot IDE and on the Ingot portal, notifies you when it needs you, remembers how you and your projects work, and always asks before risky actions.

## What it is good at

- Fixing failing tests: it runs your test suite, finds the cause, changes the code and runs the tests again.
- Small changes you keep postponing: bumps, refactors, renames, missing types.
- Routines on a schedule, like a **Nightly test-and-fix**, so you wake up to a branch and a summary.
- Follow-ups: ask it to address review comments on a draft PR and it picks up where it left off.

## How it works, in one paragraph

You give Zaprex a task from the IDE panel or the portal chat (or a routine starts one). The Ingot server checks that your plan includes Zaprex, queues the run, and a worker starts a **fresh, isolated sandbox** for it. Zaprex reads, edits and runs your tests in that sandbox, streams every step to the run log, pauses for your approval before anything risky, and finishes by pushing a new branch and opening a draft pull request. The sandbox is destroyed when the run ends.

## Where you use it

- **Ingot IDE**: the Zaprex panel (chat, runs list, approval cards).
- **Ingot portal**: Dashboard, then Zaprex (Chat, Runs, Routines, Memory, Notifications).
- **zaprex.dev**: product site and docs. Sign in here with your Ingot account.

> Zaprex is in beta. Some features below are marked as coming later; everything else is live.
`,
  },
  {
    slug: "quick-start",
    group: "Get started",
    title: "Quick start",
    description: "Enable Zaprex in Ingot, sign in with your Ingot account, connect GitHub and run your first task.",
    body: `
## 1. Use your Ingot account

Zaprex has **no separate account**. It uses your Ingot account: same sign-in, same plan, same data. On zaprex.dev, **Sign in** sends you to the Ingot portal, and you come back signed in. If you are already signed in on the portal, it takes one click.

## 2. Make sure your plan includes Zaprex

Zaprex is part of the Ingot **Pro+** and **Ultra** plans. On other plans you see an upgrade prompt instead of the chat box. See [Plans and limits](/docs/plans-and-limits).

## 3. Open Zaprex

- In the **Ingot IDE**, open the Zaprex panel.
- On the **portal**, open Dashboard, then **Zaprex**.

Both show the same conversation, so you can start a task in the IDE and follow it on your phone.

## 4. Connect GitHub and pick a repository

Choose **Connect GitHub** so Zaprex can open draft pull requests in your repositories, then add the repositories it may use and pick one in the **Repository** menu. There is one chat thread per repository.

Without a connected repository Zaprex runs in a scratch workspace and the changes stay in the run log, which is handy for trying it out.

## 5. Give it a task

Type something specific, for example \`Fix the failing tests in sum.mjs\`. Zaprex answers, starts a run and posts updates in the thread.

## 6. Approve, then review the draft PR

If the task needs a risky step (adding a dependency, for example) you get an approval card. When the run finishes you get a notification with a link to the **draft pull request**. Keep it, ask for changes, or close it.

> Next: set up a [routine](/docs/routines) so this happens every night.
`,
  },
  {
    slug: "tasks",
    group: "Using Zaprex",
    title: "Tasks",
    description: "Starting runs from chat, the run lifecycle, cancelling and follow-ups.",
    body: `
A **task** is what you ask Zaprex to do. Each task starts a **run**: one attempt in its own sandbox.

## Where tasks come from

- The chat in the Ingot IDE panel or on the portal (one conversation per repository, shared by both).
- A routine, on its schedule.
- A follow-up on an earlier run, for example "address the review comments".

## Writing good tasks

- Name the file, test or behaviour: \`Fix the failing auth tests\` beats \`fix stuff\`.
- Say what done means: "tests pass", "no new lint warnings".
- Keep it to one repository per run.

## Run lifecycle

\`queued\` → \`starting\` → \`running\` ⇄ \`awaiting_approval\` → \`finishing\` → \`succeeded\` | \`failed\` | \`cancelled\` | \`timed_out\`

- **queued / starting**: the server checked your plan and limits and a sandbox is being prepared.
- **running**: Zaprex is working; steps stream into the [run log](/docs/run-log).
- **awaiting_approval**: a risky step is waiting for you. See [Approvals and safety](/docs/approvals-and-safety).
- **finishing**: tests ran, the branch is pushed and the draft PR is opened.

## Cancel a run

Use the stop button next to a running item in the IDE runs list, or cancel it from the portal. Cancelled runs keep their log.

## Follow-ups

Ask Zaprex to continue on the same repository after a run, for example to address review comments on its draft PR. A follow-up is a new run that knows about the previous one.

## Choosing a model per task

Zaprex runs on **Ingot** by default. You can pick another allowed model for a task. See [Models](/docs/models).
`,
  },
  {
    slug: "routines",
    group: "Using Zaprex",
    title: "Routines and nightly runs",
    description: "Schedule Zaprex in your time zone, starting with Nightly test-and-fix.",
    body: `
A **routine** starts a task on a schedule, so the work happens while you sleep.

## Nightly test-and-fix

The first routine template. Every night at the time you choose, Zaprex runs your test suite, fixes what broke and opens one draft PR with the fixes and a summary.

1. Open the **Routines** tab (portal) and pick a time and your time zone.
2. Choose **Add nightly test-and-fix**.
3. The routine appears with its next run time.

## Managing routines

- **Run now**: start it immediately, outside the schedule.
- **Pause / resume**: stop it without losing the settings.
- **Delete**: remove it.
- Each routine has a per-run **budget**.

## Safety rails

- Each schedule slot runs **exactly once**, even with several servers.
- Routines respect your plan limits and the admin kill switch. When you are over a limit, that night is skipped.
- After **3 failures in a row** the routine pauses itself and you get a "routine paused" notification.

## Coming later

- More templates: **Dependency updates**, **Lint and cleanup**, **Weekly repo report**, and custom instructions.
- "Skip if no new commits" (already stored; enforced once the Ingot GitHub App webhooks land).
`,
  },
  {
    slug: "approvals-and-safety",
    group: "Using Zaprex",
    title: "Approvals and safety",
    description: "Which steps ask first, what the buttons do, and why prompt injection can't skip them.",
    body: `
Zaprex **asks before risky actions**. A risky step pauses the run, posts an approval card in the chat thread (IDE and portal) and notifies you.

## What asks by default

- Adding or upgrading dependencies.
- Network calls outside the allowlist.
- Deleting many files at once.
- Editing CI or workflow files.
- Bulk lockfile changes.
- Opening a non-draft PR.
- Going over the run budget.

Pushing to your default branch or a protected branch is **always denied**. There is no button for it.

## The approval card

- **Approve**: allow this one step.
- **Approve for this run**: allow this kind of step for the rest of the run.
- **Reject**: the run is cancelled.

Approvals **expire after 24 hours**; the run is then cancelled.

## Nothing runs while it waits

While a run waits for you, its sandbox is stopped and a checkpoint is saved, so no compute is used. When you approve, it resumes in a fresh sandbox from the checkpoint.

## Your policy

You can set each kind of step to **ask**, **always allow** or **never**, for your account or per routine.

## Why it can't be talked out of it

The policy engine runs **outside the model**. Repository content and model output are treated as untrusted, so instructions hidden in a README or an issue cannot skip an approval.
`,
  },
  {
    slug: "run-log",
    group: "Using Zaprex",
    title: "Run log",
    description: "Every step of a run: status, commands, test output, diffs and the model used.",
    body: `
Every run has a live **run log**. Open the **Runs** tab on the portal and select a run, or expand a run in the IDE runs list.

## What you see

- **status**: each lifecycle change (\`queued\`, \`starting\`, \`running\`, …).
- **step**: what Zaprex is doing ("Running the test suite", "Fixing sum.mjs").
- **tool**: commands it ran, with exit code and output (for example \`$ npm test → exit 1\`, \`FAIL …\`).
- **diff**: the change, file by file.
- **model**: which model answered (see [Models](/docs/models)).
- **message**: what Zaprex said in the chat.

The Runs table also shows each run's task, repository, start time, minutes and pull request.

## Live, and redacted

Events stream while the run is going. Before anything is stored or shown, a **secret scanner** redacts credential-like values, so tokens never land in the log, PR text or notifications.

## Without a repository

If no repository is connected, the last step says "No repository connected: changes stay in the run log", and the diff is your result.
`,
  },
  {
    slug: "draft-prs-and-github",
    group: "Using Zaprex",
    title: "Draft PRs and GitHub",
    description: "Connecting GitHub, which branches Zaprex uses, and what goes into the pull request.",
    body: `
Every change arrives as a **draft pull request** you review. Zaprex never pushes to your default branch or a protected branch.

## Connect GitHub

Choose **Connect GitHub** in the Zaprex page. Ingot asks GitHub for repository access for Zaprex, then you add the repositories Zaprex may use. Disconnect anytime.

- Your GitHub token is stored **encrypted** and is only used by the Ingot server. It is never shown, logged, or passed into a sandbox.
- A dedicated **Ingot GitHub App** with least-privilege access per repository is coming later.

## Branches

Zaprex creates a new branch named \`ingot-bot/<run>-<slug>\` from your default branch. It refuses to write to the default branch, \`main\`, \`master\`, protected branches and any branch that isn't its own, and it never updates an existing branch.

## The pull request

Opened as a **draft**, with a summary, the files changed, the test result and a link to the run. Merging is always your call. There is a cap on open Zaprex PRs per repository so it never floods your queue.

## Follow up on review comments

Leave comments on the draft PR and ask Zaprex to address them. It starts a follow-up run on the same repository.

## Test mode

Until GitHub is connected, the portal shows **Test mode**: runs use a scratch workspace and no real pull requests are opened.
`,
  },
  {
    slug: "models",
    group: "Models and plans",
    title: "Models",
    description: "Ingot (built on Grok) by default, fallbacks, picking another model, and your own keys.",
    body: `
## Ingot, by default

Zaprex runs on **Ingot**, our own model, by default. Ingot is built on xAI **Grok**: it routes to the current flagship Grok coding model first, then a fast Grok coding model.

## Fallbacks

If the model for a run can't answer, Zaprex tries the configured fallbacks (other Ingot models) before giving up. The model that actually answered is recorded on the run and shown in the run log.

## Picking another model

You can choose another model for a single task from the list your Ingot admin allows. Anything outside that list is refused with \`bot_model_not_allowed\`.

## Your own keys (BYOK)

If your Ingot account uses your own provider keys, Zaprex runs still record tokens, but there is no Ingot model cost for them. Zaprex itself is part of Pro+ and Ultra.

## For admins

Admins choose the default model, the fallbacks and which models users may pick, and can change what is behind "Ingot", in the Ingot back-office. See [Back-office](/docs/back-office).
`,
  },
  {
    slug: "plans-and-limits",
    group: "Models and plans",
    title: "Plans and limits",
    description: "Zaprex is included in Ingot Pro+ and Ultra. Per-plan numbers are coming soon.",
    body: `
Zaprex is included in the Ingot **Pro+** and **Ultra** plans. There is no separate Zaprex subscription. Other plans see an upgrade prompt. See the [Ingot pricing page](https://ingot-portal.vercel.app/pricing).

## What is limited

Each plan sets:

- Zaprex **minutes** per month (sandbox time from start to finish; time spent waiting for your approval is not counted).
- How many runs can go **at once**.
- How many **routines** you can have.
- The **maximum length** of one run (longer runs end as \`timed_out\`).

> The exact numbers per plan are **coming soon**. They are still being finalised and will be published here and on the pricing page.

## What is measured

Every run records its compute time, tokens and model cost. You can see your usage on the Zaprex page.

## Spend safety

Per-user and global spend caps, plus the admin kill switch, keep costs bounded. You get a notification when you reach 80 % and 100 % of your budget.

## When you hit a limit

The run is not started and you see why. See [Troubleshooting](/docs/troubleshooting).
`,
  },
  {
    slug: "security-and-privacy",
    group: "Trust",
    title: "Security and privacy",
    description: "Isolated sandboxes, no platform secrets inside them, redaction, memory you control.",
    body: `
## Isolation

- **One sandbox per run**, non-root, with CPU, memory, disk and time limits, no shared volumes, destroyed when the run ends.
- **Network allowlist**: by default only GitHub, package registries and the Ingot model gateway. No access to Ingot's database or internal services.

## Secrets

- Ingot's own secrets never enter a sandbox.
- A sandbox only gets two short-lived credentials: access to the one repository for that run, and a model token for that run. Both expire when the run ends.
- Your GitHub token is stored encrypted and stays on the Ingot server.

## Redaction

A secret scanner runs on run events, logs, memory, PR text and notifications **before** they are stored or sent.

## Memory you control

Zaprex remembers your preferences (for example your PR style) and facts about each project (build and test commands, conventions, flaky tests). Everything is **visible, editable and deletable** in the Memory tab, and you can **forget a project** in one step. Zaprex refuses to save anything that looks like a credential.

## Untrusted input

Repository content and model output are treated as untrusted. Risky tools are gated by the policy engine and [approvals](/docs/approvals-and-safety), which run outside the model.

## Abuse protection

Per-user rate limits, compute caps and the admin kill switch.

## Your data

Zaprex uses your Ingot account and stores its data (tasks, runs, run logs, routines, memory, notifications) in the same Ingot database. See the [privacy policy](https://ingot-portal.vercel.app/legal/privacy).
`,
  },
  {
    slug: "back-office",
    group: "Admins",
    title: "Back-office and admin",
    description: "Turn Zaprex on per plan or user, cap spend, choose models, read logs, and the kill switch.",
    body: `
Ingot admins control Zaprex in the **back-office**. Staff can view; admins can change. Every change is written to the admin audit log.

## Who gets Zaprex

- Enable it **per plan** and override it **per user** (enable or disable, minutes, concurrent runs, spend cap).
- Plan limit overrides.

## Spend

- Global **daily** and **monthly** spend caps.
- Per-user spend caps.

## Models

- The default model, fallbacks and the models users may pick for a task.
- What is behind "Ingot" is changed on the back-office **Models** page.

## Dashboard

Running runs, runs awaiting approval, queue depth, success rate, spend today and this month, compute minutes and top users.

## Runs

Every run with its **redacted** run log and approval history. Admins can cancel a run.

## Kill switch

One switch, with a confirmation step, that **pauses Zaprex everywhere**: it cancels every unfinished run, blocks new runs and makes the scheduler skip routines until it is turned off.
`,
  },
  {
    slug: "faq",
    group: "Help",
    title: "FAQ",
    description: "Short answers to common questions.",
    body: `
## Do I need a separate Zaprex account?

No. Zaprex uses your Ingot account: same sign-in, same plan, same data. Sign in on zaprex.dev or the Ingot portal and you're signed in with the same account.

## Can it push to my main branch?

No. It only opens draft pull requests on new \`ingot-bot/…\` branches. Default and protected branches are always refused.

## Does it run on my computer?

No. Every run gets a fresh, isolated cloud sandbox that is destroyed afterwards. Your laptop can be closed.

## Which model does it use?

Ingot, our own model built on Grok, by default. You can pick another allowed model per task. See [Models](/docs/models).

## Which plans include it?

Ingot Pro+ and Ultra. Per-plan numbers are coming soon. See [Plans and limits](/docs/plans-and-limits).

## What happens if I don't answer an approval?

The run waits without using compute. After 24 hours the approval expires and the run is cancelled.

## Can I see what it did?

Yes. Every command, test result and diff is in the [run log](/docs/run-log), and the PR links back to the run.

## Does it remember things?

Yes, per user and per project, and you can view, edit or delete every memory.

## Which Git hosts are supported?

GitHub. Others may come later.
`,
  },
  {
    slug: "troubleshooting",
    group: "Help",
    title: "Troubleshooting",
    description: "What common messages mean and how to fix them.",
    body: `
## I see an upgrade prompt instead of the chat box

Your plan doesn't include Zaprex. It's part of Pro+ and Ultra. If you are on one of those, your admin may have turned Zaprex off for your account.

## "Monthly minutes used up" (\`bot_limit_minutes\`)

You used this month's Zaprex minutes. Runs start again next month or after your plan changes.

## "Too many runs at once" (\`bot_limit_concurrent\`)

Wait for a running run to finish (or cancel one), then try again.

## Spend cap reached (\`bot_spend_cap\`)

A per-user or global spend cap was reached. Ask your admin.

## Model not allowed (\`bot_model_not_allowed\`)

Pick a model from the list in the model picker, or leave it on Ingot.

## Zaprex is paused for everyone

An admin turned on the kill switch. New runs are blocked until it is turned off.

## My routine stopped running

Routines pause themselves after 3 failures in a row (you get a "routine paused" notification). Open the run log of the last runs, fix the cause, then resume. A night is also skipped when you are over a plan limit.

## My run was cancelled while waiting

Approvals expire after 24 hours. Start the task again and approve when asked.

## "No repository connected: changes stay in the run log"

Connect GitHub and pick a repository in the Repository menu. See [Draft PRs and GitHub](/docs/draft-prs-and-github).

## The run refused to push (\`protected_branch\`)

That's on purpose: Zaprex never writes to your default or protected branches. It always uses a new \`ingot-bot/…\` branch.

## "Memory contains a secret"

Zaprex refuses to remember anything that looks like a credential. Remove the key from the fact and save again.

## Sign-in on zaprex.dev didn't finish

- "This sign-in link has expired or was already used": the one-time sign-in link lasts about a minute. Choose **Sign in** again.
- Make sure cookies are allowed for zaprex.dev and ingot-portal.vercel.app.

## Still stuck?

Contact [Ingot support](https://ingot-portal.vercel.app/support).
`,
  },
];

export function getDoc(slug: string): Doc | undefined {
  return DOCS.find(doc => doc.slug === slug);
}

/** "## Heading" lines, for the on-page table of contents and search. */
export function headings(body: string): { id: string; text: string }[] {
  return body.split("\n").filter(line => line.startsWith("## ")).map(line => ({ id: slugify(line.slice(3)), text: line.slice(3).trim() }));
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[`*"“”'’()]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** Plain text for the search index. */
export function plainText(body: string): string {
  return body.replace(/```[\s\S]*?```/g, " ").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[#>*`|-]/g, " ").replace(/\s+/g, " ").trim();
}
