import { cn } from "@/lib/utils";

export function AccountStatusBadge({ isActive }: { isActive: boolean | undefined }) {
  const active = isActive !== false;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        active
          ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
          : "bg-red-50 text-red-700 ring-red-200",
      )}
    >
      <span
        className={cn("size-1.5 rounded-full", active ? "bg-emerald-500" : "bg-red-500")}
        aria-hidden
      />
      {active ? "Active" : "Deactivated"}
    </span>
  );
}
