import { ROLE_LABELS, USER_ROLES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/domain";

const ROLE_STYLES: Record<UserRole, string> = {
  [USER_ROLES.admin]: "bg-navy-900 text-white",
  [USER_ROLES.officer]: "bg-teal-soft text-teal-900",
  [USER_ROLES.student]: "bg-slate-100 text-slate-700",
};

export function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span
      className={cn(
        "inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium",
        ROLE_STYLES[role],
      )}
    >
      {ROLE_LABELS[role]}
    </span>
  );
}
