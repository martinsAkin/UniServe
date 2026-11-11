import { createContext } from "react";
import type { LoginPayload, RegisterPayload } from "@/services/auth.service";
import type { AuthUser } from "@/types/domain";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
