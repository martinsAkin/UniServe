import type { RequestStatus } from "@/types/domain";

export const STATUS_CHART_COLORS: Record<RequestStatus, string> = {
  active: "#f59e0b",
  "in-progress": "#2563eb",
  completed: "#10b981",
  cancelled: "#94a3b8",
};
