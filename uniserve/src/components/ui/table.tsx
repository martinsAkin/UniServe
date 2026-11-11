import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Table({ className, ...props }: ComponentProps<"table">) {
  return <table className={cn("w-full caption-bottom text-sm", className)} {...props} />;
}

export function TableHeader(props: ComponentProps<"thead">) {
  return <thead className="border-b border-line bg-canvas/60" {...props} />;
}

export function TableBody(props: ComponentProps<"tbody">) {
  return <tbody className="divide-y divide-line" {...props} />;
}

export function TableRow({ className, ...props }: ComponentProps<"tr">) {
  return <tr className={cn("transition-colors hover:bg-canvas/50", className)} {...props} />;
}

export function TableHead({ className, ...props }: ComponentProps<"th">) {
  return (
    <th
      className={cn(
        "h-10 px-4 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft",
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: ComponentProps<"td">) {
  return <td className={cn("px-4 py-3 align-middle", className)} {...props} />;
}
