import { shortId } from "@/utils/format";
import type { UserRole } from "@/types/domain";
import { RequestLink } from "./RequestLinks";

interface RequestTitleCellProps {
  id: string;
  title: string;
  role: UserRole;
}

export function RequestTitleCell({ id, title, role }: RequestTitleCellProps) {
  return (
    <div className="min-w-0 max-w-xs">
      <RequestLink
        id={id}
        role={role}
        className="block truncate font-medium text-ink hover:text-brand-600"
      >
        {title}
      </RequestLink>
      <span className="font-mono text-xs text-ink-muted">{shortId(id)}</span>
    </div>
  );
}
