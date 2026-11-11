import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { ApiError, setUnauthorizedHandler, tokenStorage } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { authService, type LoginPayload, type RegisterPayload } from "@/services/auth.service";
import type { AuthResponse } from "@/types/api";
import { AuthContext, type AuthContextValue, type AuthStatus } from "./auth-context";

async function fetchCurrentUser() {
  try {
    return await authService.getCurrentUser();
  } catch (error) {
    // 403 means the account was deactivated; 401 means the token is invalid or expired.
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      tokenStorage.clear();
    }
    throw error;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [hasToken, setHasToken] = useState(() => tokenStorage.get() !== null);

  const meQuery = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: fetchCurrentUser,
    enabled: hasToken,
    staleTime: Infinity,
    retry: false,
  });

  const startSession = useCallback(
    (response: AuthResponse) => {
      tokenStorage.set(response.token);
      queryClient.setQueryData(queryKeys.auth.me, response.user);
      setHasToken(true);
      return response.user;
    },
    [queryClient],
  );

  const loginMutation = useMutation({
    mutationFn: async (payload: LoginPayload) => startSession(await authService.login(payload)),
  });
  const registerMutation = useMutation({
    mutationFn: async (payload: RegisterPayload) =>
      startSession(await authService.register(payload)),
  });

  const logout = useCallback(() => {
    tokenStorage.clear();
    setHasToken(false);
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
      toast.error("Your session has expired. Please sign in again.");
    });
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const user = hasToken ? (meQuery.data ?? null) : null;
  const status: AuthStatus = !hasToken
    ? "unauthenticated"
    : meQuery.isPending
      ? "loading"
      : user
        ? "authenticated"
        : "unauthenticated";

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      login: (payload: LoginPayload) => loginMutation.mutateAsync(payload),
      register: (payload: RegisterPayload) => registerMutation.mutateAsync(payload),
      logout,
    }),
    // mutateAsync identities are stable across renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, status, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
