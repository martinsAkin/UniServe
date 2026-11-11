import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number | undefined;
  icon: LucideIcon;
  tone?: "brand" | "amber" | "blue" | "green" | "slate";
  isLoading?: boolean;
}

const TONES = {
  brand: "bg-navy-900 text-white",
  amber: "bg-amber-50 text-amber-700",
  blue: "bg-blue-50 text-blue-700",
  green: "bg-emerald-50 text-emerald-700",
  slate: "bg-slate-100 text-slate-600",
} as const;

export function StatCard({ label, value, icon: Icon, tone = "brand", isLoading }: StatCardProps) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <span
        className={cn("flex size-11 shrink-0 items-center justify-center rounded-lg", TONES[tone])}
      >
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm text-ink-soft">{label}</p>
        {isLoading ? (
          <Skeleton className="mt-1 h-7 w-12" />
        ) : (
          <p className="text-2xl font-semibold tabular-nums text-ink">{value ?? 0}</p>
        )}
      </div>
    </Card>
  );
}
