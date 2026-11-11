import { apiClient } from "@/lib/api-client";
import type { ApiMessage, AuthResponse, MeResponse } from "@/types/api";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  username: string;
}

export interface VerifyOtpResponse extends ApiMessage {
  resetToken: string;
}

export const authService = {
  login: (payload: LoginPayload) =>
    apiClient.post<AuthResponse>("/auth/login", payload).then((res) => res.data),

  register: (payload: RegisterPayload) =>
    apiClient.post<AuthResponse>("/auth/register", payload).then((res) => res.data),

  getCurrentUser: () => apiClient.get<MeResponse>("/auth/me").then((res) => res.data.user),

  forgotPassword: (email: string) =>
    apiClient.post<ApiMessage>("/auth/forgot-password", { email }).then((res) => res.data),

  verifyOtp: (email: string, otp: string) =>
    apiClient.post<VerifyOtpResponse>("/auth/verify-otp", { email, otp }).then((res) => res.data),

  resetPassword: (resetToken: string, password: string) =>
    apiClient
      .post<ApiMessage>("/auth/reset-password", { resetToken, password })
      .then((res) => res.data),
};
