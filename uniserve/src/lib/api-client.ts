import axios, { AxiosError } from "axios";
import { TOKEN_STORAGE_KEY } from "./constants";

export class ApiError extends Error {
  readonly status: number;
  readonly isNetworkError: boolean;

  constructor(message: string, status: number, isNetworkError = false) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.isNetworkError = isNetworkError;
  }
}

interface ErrorBody {
  message?: string;
  error?: string;
}

type UnauthorizedHandler = () => void;
let unauthorizedHandler: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  unauthorizedHandler = handler;
}

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_STORAGE_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_STORAGE_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_STORAGE_KEY),
};

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 20_000,
});

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorBody>) => {
    if (!error.response) {
      return Promise.reject(
        new ApiError("Cannot reach the server. Check your connection and try again.", 0, true),
      );
    }

    const { status, data } = error.response;
    const message = data?.message ?? data?.error ?? "Something went wrong. Please try again.";
    const isLoginAttempt = error.config?.url?.startsWith("/auth/login");

    if (status === 401 && !isLoginAttempt) unauthorizedHandler?.();

    return Promise.reject(new ApiError(message, status));
  },
);

export function getErrorMessage(error: unknown, fallback = "Something went wrong."): string {
  return error instanceof Error ? error.message : fallback;
}
