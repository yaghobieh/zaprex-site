/**
 * Zaprex docs content. Facts come from the Zaprex design doc (ingot-server docs/ingot-bot.md, security baseline) and the
 * Zaprex repo README. Plan numbers follow the approved Ingot pricing (IDEA-167).
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
Zaprex is Ingot's personal background coding agent. It works on your repositories while you are away, runs scheduled routines (for example a nightly test-and-fix), opens **draft** pull requests, chats with you in its own app at [zaprex.dev/app](/app), notifies you when it needs you, remembers how you and your projects work, and always asks before risky actions.

## What it is good at

- Fixing failing tests: it runs your test suite, finds the cause, changes the code and runs the tests again.
- Small changes you keep postponing: bumps, refactors, renames, missing types.
- Routines on a schedule, like a **Nightly test-and-fix**, so you wake up to a branch and a summary.
- Follow-ups: ask it to address review comments on a draft PR and it picks up where it left off.

## How it works, in one paragraph

You give Zaprex a task in the [Zaprex app](/docs/zaprex-app) (or a routine starts one). The Ingot server checks that your plan includes Zaprex, queues the run, and a worker starts a **fresh, isolated sandbox** for it. Zaprex reads, edits and runs your tests in that sandbox, streams every step to the run log, pauses for your approval before anything risky, and finishes by pushing a new branch and opening a draft pull request. The sandbox is destroyed when the run ends.

## Where you use it

- **The Zaprex app** at [zaprex.dev/app](/app): chat, runs, run log and approval cards. Zaprex is its own app, separate from the Ingot IDE.
- **From the Ingot IDE**: the small Zaprex T-rex next to the agent opens the Zaprex app in your browser. The IDE has no Zaprex panel of its own.
- **Your [Zaprex dashboard](/docs/zaprex-dashboard)**: GitHub, routines, memory and notifications, on the Ingot portal.
- **On your desktop and phone**: see [Desktop and mobile apps](/docs/desktop-and-mobile).
- **zaprex.dev**: product site and docs. Sign in with your Ingot account. Questions? [Ask Rex](/docs/ask-rex), the assistant on this site.

> Zaprex is in beta. Some features below are marked as coming later; everything else is live.
`,
  },
  {
    slug: "zaprex-app",
    group: "Get started",
    title: "The Zaprex app",
    description: "Zaprex is its own app at zaprex.dev/app. Ingot links to it from a small T-rex next to the agent.",
    body: `
Zaprex is a **separate app** from the Ingot IDE. You use it in the browser at [zaprex.dev/app](/app), on your desktop or your phone (see [Desktop and mobile apps](/docs/desktop-and-mobile)).

## Zaprex and Ingot

- **Ingot** is the open-source AI IDE. Its own agent works with you in the editor, live.
- **Zaprex** is the background bot. It works on its own, in a cloud sandbox, while you do something else, and hands you a draft pull request.

They share **one account** and one plan, but they are different apps. In the Ingot IDE, the small **Zaprex T-rex** next to the agent opens the Zaprex app in your browser. Hover it and it says **Open Zaprex**. There is no Zaprex panel inside the IDE.

## Sign in

Open [zaprex.dev/app](/app) and choose **Sign in with Ingot**. You sign in on the Ingot portal (email code, Google or GitHub) and come straight back to the app. If you are already signed in to Ingot it takes one click.

## What's in the app

- **Chat**: ask questions or tell Zaprex what to do, with [files and images](/docs/attachments) and [web search](/docs/web-search). Pick a repository first if you connected GitHub; each repository has its own conversation. See [Chat with Zaprex](/docs/chat) and [Chats and search](/docs/chats).
- **Approval cards**: risky steps wait here for **Approve**, **Approve for this run** or **Reject**. See [Approvals and safety](/docs/approvals-and-safety).
- **Runs**: every run with its status and minutes. Click one to read its [run log](/docs/run-log), use the stop button to cancel, or open its draft PR.
- **Usage**: your Zaprex minutes this month and how many runs are going.
- The T-rex at the top shows what Zaprex is doing: thinking, working, waiting for you, done or stopped.

GitHub, routines, [memory](/docs/memory) and [notifications](/docs/notifications) are in your [Zaprex dashboard](/docs/zaprex-dashboard) (linked from the app).

## Light, dark or system

Use the theme switch at the top of the page. Your choice is remembered on this device.
`,
  },
  {
    slug: "desktop-and-mobile",
    group: "Get started",
    title: "Desktop and mobile apps",
    description: "Zaprex in its own window on your Mac and on your phone: the same app, account and chats everywhere.",
    body: `
Zaprex is one app at [zaprex.dev/app](/app). The desktop and mobile apps are small native shells around it, so your chats, runs, approvals and usage are the same wherever you open it.

## In the browser

Open [zaprex.dev/app](/app) on any computer or phone and sign in with your Ingot account. On a phone it fits the screen: one compact bar, an edge-to-edge chat, and the input stays right above the keyboard.

## Desktop app

- Its own window with a soft black title bar, the T-rex in your Dock, a sign-in that stays, and one window at a time.
- Builds exist today for **macOS on Apple silicon**. A public download is coming; Windows and Linux builds come later.
- **Sign in**: choose **Sign in with Ingot**. Sign-in opens in your default browser (Google and GitHub don't allow signing in inside app windows). When it finishes, the browser hands you back to the app, signed in.
- Only zaprex.dev opens inside the window. Links to the Ingot portal, GitHub and everything else open in your browser.
- \`zaprex://\` links open the app and bring it to the front.

## iPhone and Android

- Zaprex for iOS and Android is built and on its way to the App Store and Google Play. Until then, use [zaprex.dev/app](/app) in your phone's browser.
- Sign-in works like the desktop app: it opens in the system browser sheet, then returns to the app.
- Edge to edge with the notch and home indicator respected. Links to zaprex.dev/app open in the app; everything else opens in the browser. Without a connection you see an offline screen.
- Push notifications come later. Until then you get [in-app and email notifications](/docs/notifications).

## Updates

Windows that stay open for days (a pinned tab, the desktop or phone app) notice when a new version of Zaprex is out. An idle window reloads itself when you come back to it. If you have a half-written message, you see a **Reload** button instead, so nothing you typed is lost.

## From the Ingot IDE

The small Zaprex T-rex next to the agent opens [zaprex.dev/app](/app) in your browser. See [The Zaprex app](/docs/zaprex-app).
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

Zaprex is part of every paid Ingot plan (**Pro**, **Pro+**, **Ultra** and **Team**). On Free and BYOK you see an upgrade prompt instead of the chat box. See [Plans and limits](/docs/plans-and-limits).

## 3. Open Zaprex

- Go to [zaprex.dev/app](/app) and sign in with your Ingot account.
- In the **Ingot IDE**, click the small Zaprex T-rex next to the agent. It opens the same app in your browser.

Zaprex keeps one conversation per repository, so you can start a task at your desk and follow it on your phone.

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
    slug: "chat",
    group: "Using Zaprex",
    title: "Chat with Zaprex",
    description: "Ask questions, plan work and start runs from one chat. Replies stream in, and a proposed change becomes a Start run button.",
    body: `
The chat in the [Zaprex app](/app) is where you talk to Zaprex. It answers right away, like a senior teammate, and it can turn the conversation into a background [run](/docs/tasks) that ends in a draft pull request.

## Chat or task

- **Chat** (the default): ask about your code, a bug, an error message or a plan. Zaprex replies in the thread as it writes, with Markdown and code blocks. Chatting never changes your repository.
- **Task mode**: press **Task** next to the input to send your message as a background task instead. The input changes to "Describe the task: Zaprex opens a draft PR…". Zaprex starts a run in a fresh sandbox and opens a draft PR. Press **Task** again to go back to chat.

## Start run

When you ask for a change in chat, Zaprex says in a line or two what it would do and shows a **Start run** button. Nothing runs until you press it. Zaprex never claims in chat that it changed code or opened a pull request: only runs do that.

## Pick a repository first

Choose a repository in the **Repository** menu. Chat and runs use it, and each repository has its own main thread. With **No repository (scratch)**, runs use a scratch workspace and the changes stay in the [run log](/docs/run-log).

## Message actions

Hover a message to see its actions. On phones they stay under the bubble.

- **Reply**: quote that message in your next one, so Zaprex knows exactly what you mean. Remove the quote with the × on the chip.
- **Copy**: copy the message text.
- **Good answer** and **Bad answer**: thumbs up or down on Zaprex's replies. A thumbs-down can carry a short reason ("What went wrong?"). Press the same thumb again to clear it. Your feedback is saved with the message.

## Dictate

Where your browser supports speech recognition, a **mic** button next to the input dictates into it. Check the text, then send.

## If a reply doesn't arrive

The thread shows what went wrong with a **Retry** button. A message is never dropped silently.

## Also in the chat

- [Files and images](/docs/attachments): attach code, logs and screenshots.
- [Web search](/docs/web-search): fresh facts, with sources.
- [Chats and search](/docs/chats): one chat per topic, and find old ones.
`,
  },
  {
    slug: "chats",
    group: "Using Zaprex",
    title: "Chats and search",
    description: "Start a new chat for each topic, find old ones by title or text, and get back to the main thread.",
    body: `
## New chat

Press **New chat** at the top of the chat to start an empty one. Zaprex names it after your first message, so the list stays readable.

## Search chats

Open **Search chats** and type: it matches chat titles and the text of every message. Pick a result to open that chat. With an empty search you see your recent chats.

## The main thread

Each repository also has its **main thread**, the conversation from before chats existed. It is never lost: open **Search chats** and pick **Main thread**.

## Runs from any chat

Runs started from any chat, or by a [routine](/docs/routines), all appear in **Runs**. The indicator at the top shows how many are going; open one for its status, minutes, [run log](/docs/run-log) and draft PR.

## Same chats everywhere

Chats live on your Ingot account, so the browser, the [desktop and mobile apps](/docs/desktop-and-mobile) and your [Zaprex dashboard](/docs/zaprex-dashboard) show the same conversations.

> Deleting a chat from the app is coming later.
`,
  },
  {
    slug: "attachments",
    group: "Using Zaprex",
    title: "Files and images",
    description: "Attach code, logs and screenshots to a chat message so Zaprex sees exactly what you see.",
    body: `
## How to attach

- Press **+** next to the input and pick files or images.
- Drag files onto the input.
- Paste an image, for example a screenshot.

Each attachment shows as a chip under the input. Remove one with its × before you send.

## What you can attach

- Up to **4** attachments per message.
- **Text and code**: plain text, Markdown, JSON, CSV, logs, diffs and patches, and source files such as \`.ts\`, \`.tsx\`, \`.js\`, \`.py\`, \`.go\`, \`.rs\`, \`.java\`, \`.rb\`, \`.sql\`, \`.sh\`, \`.yml\` and \`.toml\`, up to 100 KB each.
- **Images**: PNG, JPEG, WebP or GIF. Large photos are scaled down (at most 1,600 px on the long side) before they are sent.
- All attachments of one message together stay under about 3.5 MB.

## Chat only

Attachments go with chat messages. **Task mode** is off while files are attached: remove them to start a task. A run works from your repository, not from attachments.

## What is kept

Zaprex reads the files and images to answer that message. The thread keeps your message and the file names only, not the file contents or image data.

## If an attachment is refused

- **Type not supported**: attach text or code files, or PNG, JPEG, WebP or GIF images.
- **More than 4 files**: send the rest in a second message.
- **One attachment is too large**: trim the file or send only the part that matters.
- **Too large together**: remove one and try again.
`,
  },
  {
    slug: "web-search",
    group: "Using Zaprex",
    title: "Web search",
    description: "For fresh or specific facts, Zaprex searches the web first and cites its sources.",
    body: `
## When Zaprex searches

In chat, Zaprex searches when a question needs fresh or specific facts: news, releases and versions, prices, dates, or a library, product or project it doesn't know for sure. It searches before asking you a clarifying question, and only about your latest message.

## What it searches

News and web results, Wikipedia for background, and for questions about code also npm and GitHub. A project name you mention may be your own: Zaprex looks for it together with your name on npm and GitHub before guessing a famous project with a similar name.

## Sources

An answer built from search cites its sources inline as [1], [2], and lists them under the reply. Zaprex never invents a source.

## Limits

One search per message, and up to 5 searches a minute and 30 a day per account. Over a limit, Zaprex answers without a new search.

## Runs are different

Search is part of chat. Runs work in an isolated sandbox with a network allowlist; see [Security and privacy](/docs/security-and-privacy).
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

- The chat in the [Zaprex app](/app) (one conversation per repository).
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

Use the stop button next to a running item in the **Runs** list of the Zaprex app. Cancelled runs keep their log.

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
Zaprex **asks before risky actions**. A risky step pauses the run, posts an approval card in the chat thread of the Zaprex app and notifies you.

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
Every run has a live **run log**. Click a run in the **Runs** list of the [Zaprex app](/app) to expand its log, or open the Runs tab in your Zaprex dashboard.

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
    slug: "memory",
    group: "Using Zaprex",
    title: "Memory",
    description: "What Zaprex remembers about you and each project, and how to view, edit or forget it.",
    body: `
Zaprex remembers how you and your projects work, so you don't have to repeat yourself in every task.

## What it remembers

- **About you**: preferences, for example "Prefer small pull requests" or your PR style.
- **About each project**: build and test commands, conventions, flaky tests.

## How facts get there

- **You add them**: type a fact in the **Memory** tab of your [Zaprex dashboard](/docs/zaprex-dashboard) and choose **Remember**.
- **Zaprex learns them**: after a successful run, it saves low-risk facts about the project it learned on the way (for example the test command), once.

## How it's used

Every run on a project starts with your facts and that project's facts, so Zaprex follows your conventions without being told again.

## You're in control

Everything in the **Memory** tab is visible and marked **You** or **Project**.

- Edit a fact, or **Forget** it.
- **Forget this project**: remove everything Zaprex knows about one repository in one step.
- Forget everything.

## No secrets in memory

Every fact goes through the secret scanner before it is saved. A fact that looks like a credential is refused with "Memory contains a secret": remove the key and save again.
`,
  },
  {
    slug: "notifications",
    group: "Using Zaprex",
    title: "Notifications",
    description: "In-app and email alerts when a run finishes or fails, needs your approval, a routine pauses, or your minutes run low.",
    body: `
Zaprex tells you when something needs you or is ready, so you don't have to watch it work.

## What you hear about

- **Run finished**: a run succeeded ("Draft PR ready: …"). In the app only, by default.
- **Run failed**: a run failed or timed out.
- **Approval needed**: a risky step waits for you.
- **Routine paused**: a routine paused itself after 3 failures in a row.
- **Budget**: you used 80 % and then 100 % of this month's Zaprex minutes.

Everything except **Run finished** also sends an email by default.

## In the app

Every notification lands in the **Notifications** tab of your [Zaprex dashboard](/docs/zaprex-dashboard), with an unread count. A notification about a run links to it.

## By email

Emails go to your Ingot account address, with a subject that starts with "Zaprex:" and a link to the run.

## Nothing secret

Titles and text go through the secret scanner first, so tokens never end up in a notification or an email.

## Coming later

- A settings screen to choose which events also send an email.
- Push notifications in the [mobile apps](/docs/desktop-and-mobile), and Slack and Telegram.
`,
  },
  {
    slug: "zaprex-dashboard",
    group: "Using Zaprex",
    title: "Your Zaprex dashboard",
    description: "GitHub, runs, routines, memory and notifications on the Ingot portal, next to your account and plan.",
    body: `
Your Zaprex dashboard is on the Ingot portal at [Dashboard › Zaprex](https://ingot-portal.vercel.app/dashboard/bot). The [Zaprex app](/app) links to it. It uses the same account, so everything you do here shows in the app and the other way round.

## GitHub and repositories

- **Connect GitHub** so Zaprex can open draft pull requests, then **Add repository** for each one Zaprex may use.
- Turn a repository off for Zaprex, or **Disconnect** GitHub.
- Until GitHub is connected, runs use a scratch workspace. See [Draft PRs and GitHub](/docs/draft-prs-and-github).

## Tabs

- **Chat**: the same conversations as the app.
- **Runs**: every run with its status, minutes, draft PR and [run log](/docs/run-log).
- **Routines**: add a nightly test-and-fix, run one now, pause, resume or delete. See [Routines](/docs/routines).
- **Memory**: everything Zaprex remembers, to edit or forget. See [Memory](/docs/memory).
- **Notifications**: everything Zaprex told you, with an unread count. See [Notifications](/docs/notifications).

## Usage

Your Zaprex minutes this month against your plan, and how many runs are going. On Free and BYOK you see an upgrade prompt instead. See [Plans and limits](/docs/plans-and-limits).
`,
  },
  {
    slug: "models",
    group: "Models and plans",
    title: "Models",
    description: "Ingot, our own model, by default, fallbacks, picking another model, and your own keys.",
    body: `
## Ingot, by default

Zaprex runs on **Ingot**, our own model, by default. Ingot is tuned for coding work: it routes each request to a strong coding model first, then to a faster one.

## Fallbacks

If the model for a run can't answer, Zaprex tries the configured fallbacks (other Ingot models) before giving up. The model that actually answered is recorded on the run and shown in the run log.

## Picking another model

You can choose another model for a single task from the list your Ingot admin allows. Anything outside that list is refused with \`bot_model_not_allowed\`.

## Your own keys (BYOK)

If your Ingot account uses your own provider keys, Zaprex runs still record tokens, but there is no Ingot model cost for them. Zaprex itself is part of every paid plan.

## For admins

Admins choose the default model, the fallbacks and which models users may pick, and can change what is behind "Ingot", in the Ingot back-office. See [Back-office](/docs/back-office).
`,
  },
  {
    slug: "plans-and-limits",
    group: "Models and plans",
    title: "Plans and limits",
    description: "Zaprex is included in every paid Ingot plan. Minutes, concurrent runs and routines per plan.",
    body: `
Zaprex is included in every paid Ingot plan. There is no separate Zaprex subscription. Free and BYOK plans see an upgrade prompt. Runs use **Ingot**, our own model, by default.

| Plan | Price | Zaprex minutes a month | Runs at once | Routines | Longest run |
| --- | --- | --- | --- | --- | --- |
| Pro | $6 a month | 60 | 1 | 1 | 15 min |
| Pro+ | $15 a month | 300 | 1 | 3 | 30 min |
| Ultra | $49 a month | 1,000 | 2 | 10 | 60 min |
| Team | $12 per seat a month | 300 per seat | 1 | 3 | 30 min |

Plans are billed monthly and you can cancel any time. See the [Ingot pricing page](https://ingot-portal.vercel.app/pricing).

## What is limited

Each plan sets:

- Zaprex **minutes** per month (sandbox time from start to finish; time spent waiting for your approval is not counted).
- How many runs can go **at once**.
- How many **routines** you can have.
- The **maximum length** of one run (longer runs end as \`timed_out\`).

> Your admin can change these numbers for your account. Your current usage is always on the Zaprex page.

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

Zaprex remembers your preferences (for example your PR style) and facts about each project (build and test commands, conventions, flaky tests). Everything is **visible, editable and deletable** in the Memory tab, and you can **forget a project** in one step. Zaprex refuses to save anything that looks like a credential. See [Memory](/docs/memory).

## Chat attachments

[Files and images](/docs/attachments) you attach are read to answer that message. The thread keeps your message and the file names only.

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
    slug: "ask-rex",
    group: "Help",
    title: "Ask Rex",
    description: "The assistant on zaprex.dev: quick answers about Zaprex and Ingot from these docs, with links to the pages it used.",
    body: `
**Ask Rex** is the T-rex button at the bottom right of the zaprex.dev home page and docs. Ask a question in plain words and Rex answers from these docs and the Ingot site, with links to the pages it used. No account needed.

## What Rex answers

- **Zaprex first**: what it is, the app, chat and tasks, routines, approvals, draft PRs, models, plans and limits, security, admin controls and troubleshooting.
- **Ingot too**: the IDE, its plans and pricing, the portal and your account. Ingot sources open on the Ingot site and are marked "· Ingot".
- **Follow-ups** such as "and on Team?" build on your previous question.

## What Rex doesn't do

- General questions, poems, jokes, homework, or coding help that isn't about Zaprex or Ingot. Rex says it can only answer about Zaprex and Ingot and links to the docs.
- Your account, repositories or runs: Rex can't see them and can't start a run. For that, use the [Zaprex app](/app), where you [chat with Zaprex](/docs/chat) itself.
- Guess prices: if Rex can't confirm a price on the site, it says so and links to [Plans and limits](/docs/plans-and-limits).

## Answers can be wrong

Rex answers only from zaprex.dev and the Ingot site, and can still get things wrong. Check the linked pages before you rely on an answer.

## Limits

10 questions a minute and 50 a day per visitor, shared with Ask Ingot on the Ingot site. If Rex takes a break, everything it knows is in these docs.

## Privacy

Your question is used only to write the answer. The server doesn't store question text; it keeps a hashed visitor ID to count questions for the limits.

## Where you find it

On the home page and every docs page, in light and dark, on phones too. Not in the Zaprex app, where Zaprex itself answers.
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

Ingot, our own model, by default. You can pick another allowed model per task. See [Models](/docs/models).

## Which plans include it?

Every paid Ingot plan: Pro, Pro+, Ultra and Team, from $6 a month. See [Plans and limits](/docs/plans-and-limits).

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

Your plan doesn't include Zaprex. It's part of every paid plan (Pro, Pro+, Ultra and Team). If you are on one of those, your admin may have turned Zaprex off for your account.

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
