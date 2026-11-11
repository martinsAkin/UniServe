import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name: string;
  className?: string;
}

export function UserAvatar({ name, className }: UserAvatarProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-navy-800 text-sm font-semibold uppercase text-white",
        className,
      )}
    >
      {name.trim().charAt(0) || "?"}
    </span>
  );
}
