import { Bell, Box, CalendarClock, FlaskConical, GitPullRequestDraft, Hand, MessagesSquare, Monitor, Moon, ShieldCheck, Wrench, Zap, type LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = { Bell, Box, CalendarClock, FlaskConical, GitPullRequestDraft, Hand, MessagesSquare, Monitor, Moon, ShieldCheck, Wrench, Zap };

export function Icon({ name, className = "h-5 w-5" }: { name: string; className?: string }) {
  const Component = ICONS[name] ?? Zap;
  return <Component aria-hidden className={className} strokeWidth={2} />;
}
