import { REQUEST_STATUSES } from "@/lib/constants";
import type { MaintenanceRequest, StatusCounts } from "@/types/domain";

export function countByStatus(requests: MaintenanceRequest[]): StatusCounts {
  const counts = Object.fromEntries(REQUEST_STATUSES.map((status) => [status, 0])) as StatusCounts;
  for (const request of requests) counts[request.status] += 1;
  return counts;
}
