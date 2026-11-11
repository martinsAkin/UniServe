import { useContext } from "react";
import { AuthContext } from "../auth-context";

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}

/** For screens that only render inside an authenticated layout. */
export function useAuthenticatedUser() {
  const { user } = useAuth();
  if (!user) throw new Error("useAuthenticatedUser called without an authenticated user");
  return user;
}
