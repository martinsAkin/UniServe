import {
  CheckCircle2,
  CircleDot,
  PencilLine,
  PlayCircle,
  PlusCircle,
  Repeat2,
  UserCheck,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { formatDateTime } from "@/utils/format";
import type { RequestActivity, RequestActivityAction } from "@/types/domain";

const ACTION_META: Record<
  RequestActivityAction,
  { label: string; icon: LucideIcon; color: string }
> = {
  created: { label: "Request created", icon: PlusCircle, color: "text-slate-500" },
  assigned: { label: "Officer assigned", icon: UserCheck, color: "text-teal-accent" },
  reassigned: { label: "Officer reassigned", icon: Repeat2, color: "text-teal-accent" },
  started: { label: "Work started", icon: PlayCircle, color: "text-blue-600" },
  completed: { label: "Request completed", icon: CheckCircle2, color: "text-emerald-600" },
  cancelled: { label: "Request cancelled", icon: XCircle, color: "text-slate-500" },
  updated: { label: "Request updated", icon: PencilLine, color: "text-amber-600" },
};

export function RequestTimeline({ entries }: { entries: RequestActivity[] }) {
  return (
    <ol className="relative space-y-6 border-l border-line pl-6">
      {entries.map((entry) => {
        const meta = ACTION_META[entry.action] ?? {
          label: entry.action,
          icon: CircleDot,
          color: "text-slate-500",
        };
        const Icon = meta.icon;

        return (
          <li key={entry._id} className="relative">
            <span className="absolute -left-[2.15rem] flex size-6 items-center justify-center rounded-full bg-surface">
              <Icon className={`size-5 ${meta.color}`} aria-hidden />
            </span>
            <p className="text-sm font-medium text-ink">{meta.label}</p>
            <p className="text-xs text-ink-muted">
              {formatDateTime(entry.createdAt)}
              {entry.actor && ` · ${entry.actor.username}`}
            </p>
            {entry.details && (
              <p className="mt-1 whitespace-pre-wrap break-words text-sm text-ink-soft">
                {entry.details}
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
