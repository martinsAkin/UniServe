import { LogOut, Menu } from "lucide-react";
import { RoleBadge } from "@/components/shared/RoleBadge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth, useAuthenticatedUser } from "@/features/auth/hooks/useAuth";

export function AppHeader({ onOpenMenu }: { onOpenMenu: () => void }) {
  const user = useAuthenticatedUser();
  const { logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-line bg-surface/95 px-4 backdrop-blur sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onOpenMenu}
        aria-label="Open navigation"
      >
        <Menu className="size-5" />
      </Button>
      <div className="hidden lg:block" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-3 rounded-lg p-1.5 pr-3 hover:bg-canvas"
            aria-label="Account menu"
          >
            <UserAvatar name={user.username} />
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-medium leading-tight">{user.username}</span>
              <span className="block text-xs text-ink-soft">{user.email}</span>
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>
            <p className="truncate text-sm font-medium">{user.username}</p>
            <p className="mb-2 truncate text-xs font-normal text-ink-soft">{user.email}</p>
            <RoleBadge role={user.role} />
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={logout}>
            <LogOut className="size-4" aria-hidden /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
