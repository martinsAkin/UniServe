import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const fieldStyles =
  "w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-muted transition-colors focus-visible:border-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/20 disabled:cursor-not-allowed disabled:bg-canvas aria-invalid:border-danger aria-invalid:ring-danger/20";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(fieldStyles, "h-10", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(fieldStyles, "min-h-28 resize-y py-2.5", className)} {...props} />;
}
