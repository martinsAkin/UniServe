import { STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { RequestStatus } from "@/types/domain";

const STATUS_STYLES: Record<RequestStatus, { badge: string; dot: string }> = {
  active: { badge: "bg-amber-50 text-amber-800 ring-amber-200", dot: "bg-amber-500" },
  "in-progress": { badge: "bg-blue-50 text-blue-800 ring-blue-200", dot: "bg-blue-500" },
  completed: { badge: "bg-emerald-50 text-emerald-800 ring-emerald-200", dot: "bg-emerald-500" },
  cancelled: { badge: "bg-slate-100 text-slate-600 ring-slate-200", dot: "bg-slate-400" },
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  const styles = STATUS_STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        styles.badge,
      )}
    >
      <span className={cn("size-1.5 rounded-full", styles.dot)} aria-hidden />
      {STATUS_LABELS[status]}
    </span>
  );
}
