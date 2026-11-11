import { Link, useRouterState } from "@tanstack/react-router";
import { LogOut, Wrench } from "lucide-react";
import { useAuthenticatedUser, useAuth } from "@/features/auth/hooks/useAuth";
import { ROLE_LABELS, ROLE_HOME_PATH } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { NAVIGATION } from "./navigation";

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const user = useAuthenticatedUser();
  const { logout } = useAuth();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <div className="flex h-full flex-col bg-navy-900 text-slate-200">
      <Link
        to={ROLE_HOME_PATH[user.role]}
        onClick={onNavigate}
        className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-5"
      >
        <span className="flex size-9 items-center justify-center rounded-lg bg-white/10">
          <Wrench className="size-[18px] text-teal-300" aria-hidden />
        </span>
        <span className="text-lg font-semibold tracking-tight text-white">UniServe</span>
      </Link>

      <nav aria-label="Main" className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {ROLE_LABELS[user.role]}
        </p>
        {NAVIGATION[user.role].map((item) => {
          const active = item.isActive(pathname);
          return (
            <Link
              key={item.label}
              to={item.to}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-white/10 text-white"
                  : "text-slate-300 hover:bg-white/5 hover:text-white",
              )}
            >
              <item.icon className={cn("size-[18px]", active && "text-teal-300")} aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut className="size-[18px]" aria-hidden /> Sign out
        </button>
      </div>
    </div>
  );
}
