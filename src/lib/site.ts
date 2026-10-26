/** Site-wide constants and copy for zaprex.dev. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://zaprex.dev").replace(/\/$/, "");
export const SITE_NAME = "Zaprex";
export const TAGLINE = "The AI coding bot that works while you're away.";
export const DESCRIPTION =
  "Zaprex is the background AI coding bot from Ingot. Give it a task or a nightly routine; it works in an isolated cloud machine, asks before risky steps, and hands you a draft pull request.";

export const INGOT = {
  portal: "https://ingot-portal.vercel.app",
  download: "https://ingot-portal.vercel.app/download",
  pricing: "https://ingot-portal.vercel.app/pricing",
  terms: "https://ingot-portal.vercel.app/legal/terms",
  privacy: "https://ingot-portal.vercel.app/legal/privacy",
  support: "https://ingot-portal.vercel.app/support",
  github: "https://github.com/yaghobieh/ingot",
} as const;

export const NAV = [
  { href: "#how", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#routines", label: "Routines" },
  { href: "#security", label: "Security" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
] as const;

export const WHAT_IT_DOES = [
  { icon: "FlaskConical", title: "Fixes failing tests", body: "Point it at a red build. Zaprex reproduces the failure, finds the cause and opens a draft PR with the fix and a short write-up." },
  { icon: "Wrench", title: "Ships small changes", body: "Bumps, refactors, renames, missing types, flaky lint. The chores you keep pushing to tomorrow, done before you're back." },
  { icon: "Moon", title: "Runs on a schedule", body: "Set a routine like a nightly test-and-fix, and wake up to a tidy branch and a summary of what changed and why." },
  { icon: "MessagesSquare", title: "Follows up on reviews", body: "Leave comments on the draft PR and ask Zaprex to address them. It picks up right where it left off." },
] as const;

export const STEPS = [
  { n: "01", title: "Give it a task", body: "From the Ingot IDE or the web: “fix the failing auth tests” or “add pagination to /orders”. Or pick a routine and a time." },
  { n: "02", title: "It works in its own cloud machine", body: "Each run gets a fresh, isolated machine with your repo. Zaprex reads, edits, runs your tests, and stops to ask before anything risky." },
  { n: "03", title: "Review the draft PR", body: "You get an in-app and email notification with a draft pull request. Keep it, ask for changes, or close it. It never pushes to main." },
] as const;

export const FEATURES = [
  { icon: "Zap", title: "Runs on Ingot, our own model", body: "Built on Grok and tuned for code. Prefer another model? Switch per run from the model picker." },
  { icon: "Box", title: "Isolated cloud machines", body: "Every run starts clean in its own sandbox. Nothing touches your laptop, and nothing is shared between runs." },
  { icon: "GitPullRequestDraft", title: "Draft PRs, never main", body: "Work lands on a fresh branch as a draft pull request. Protected branches stay protected." },
  { icon: "Hand", title: "Approval cards", body: "Installing packages, running migrations, network calls: risky steps pause and wait for your yes." },
  { icon: "Bell", title: "In-app and email alerts", body: "Know the moment a run needs you or a PR is ready, in Ingot and in your inbox." },
  { icon: "CalendarClock", title: "Routines", body: "Nightly test-and-fix, weekly dependency updates, Friday test coverage. Pause or run now anytime." },
  { icon: "Monitor", title: "IDE or web", body: "Start runs from the Ingot IDE or from your dashboard in the browser, and follow the live log in either." },
  { icon: "ShieldCheck", title: "Admin controls", body: "Turn Zaprex on or off, cap minutes and spend, choose allowed models and repos, and see every action in the audit log." },
] as const;

export const ROUTINES = [
  { when: "Every night · 02:00", title: "Nightly test-and-fix", body: "Run the full suite, fix what broke, open one draft PR with the fixes." },
  { when: "Mondays · 08:30", title: "Dependency check-up", body: "Update patch and minor versions, run tests, and explain anything risky." },
  { when: "Fridays · 16:00", title: "Coverage sweep", body: "Write missing tests for this week's changes so Monday starts green." },
  { when: "Weekdays · 07:00", title: "Lint and types clean-up", body: "Clear new warnings and type errors before standup." },
] as const;

export const SECURITY = [
  { title: "Never pushes to main", body: "Zaprex only opens draft pull requests on new branches. Merging is always your call." },
  { title: "Asks before risky actions", body: "Package installs, migrations, deletes and outbound network calls wait on an approval card." },
  { title: "Fresh sandbox every run", body: "Isolated cloud machines that are wiped when the run ends." },
  { title: "Secrets stay secret", body: "Zaprex refuses to store credentials in its memory and never writes keys into code." },
  { title: "Full audit trail", body: "Every run, approval and admin change is logged, with spend caps and an off switch for admins." },
] as const;

export const FAQ = [
  { q: "What is Zaprex?", a: "Zaprex is the background AI coding bot from Ingot, the open-source AI IDE. It works on your repositories while you're away and delivers its work as draft pull requests." },
  { q: "Which model does it use?", a: "By default Zaprex runs on Ingot, our own model built on Grok and tuned for coding work. You can pick another available model for any run." },
  { q: "Can it push to my main branch?", a: "No. Zaprex always works on a new branch and opens a draft pull request. You review and merge." },
  { q: "What counts as a risky action?", a: "Things like installing packages, running database migrations, deleting files in bulk or calling outside services. Zaprex pauses and shows an approval card first." },
  { q: "Where does my code run?", a: "In a fresh, isolated cloud machine created for that run and removed when it ends. Nothing runs on your computer." },
  { q: "Which plans include it?", a: "Zaprex is part of the Ingot Pro+ and Ultra plans. See the Ingot pricing page for details." },
  { q: "How do I get it?", a: "Download Ingot, sign in, and open the Zaprex panel, or start a run from your Ingot dashboard on the web. Join early access to hear first when new features land." },
] as const;
