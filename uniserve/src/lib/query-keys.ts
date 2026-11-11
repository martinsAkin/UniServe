import type { AdminRequestParams, AdminUserParams } from "@/types/api";

export const queryKeys = {
  auth: { me: ["auth", "me"] as const },
  requests: {
    all: ["requests"] as const,
    mine: () => ["requests", "mine"] as const,
    detail: (id: string) => ["requests", "detail", id] as const,
  },
  admin: {
    all: ["admin"] as const,
    stats: () => ["admin", "stats"] as const,
    workload: () => ["admin", "workload"] as const,
    requests: (params: AdminRequestParams) => ["admin", "requests", params] as const,
    request: (id: string) => ["admin", "request", id] as const,
    history: (id: string) => ["admin", "history", id] as const,
    users: (params: AdminUserParams) => ["admin", "users", params] as const,
    allUsers: () => ["admin", "users", "all"] as const,
    officers: () => ["admin", "officers"] as const,
    report: (filters: unknown) => ["admin", "report", filters] as const,
  },
};
