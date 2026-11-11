import { Navigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { FullPageSpinner } from "@/components/shared/LoadingSkeleton";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ROLE_HOME_PATH } from "@/lib/constants";
import type { UserRole } from "@/types/domain";

/** UX-only protection. The backend remains the authority on every request. */
export function RequireRole({ role, children }: { role: UserRole; children: ReactNode }) {
  const { user, status } = useAuth();

  if (status === "loading") return <FullPageSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to="/unauthorized" replace />;
  return children;
}

export function GuestOnly({ children }: { children: ReactNode }) {
  const { user, status } = useAuth();

  if (status === "loading") return <FullPageSpinner />;
  if (user) return <Navigate to={ROLE_HOME_PATH[user.role]} replace />;
  return children;
}

export function HomeRedirect() {
  const { user, status } = useAuth();

  if (status === "loading") return <FullPageSpinner />;
  return user ? (
    <Navigate to={ROLE_HOME_PATH[user.role]} replace />
  ) : (
    <Navigate to="/login" replace />
  );
}
