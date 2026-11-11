import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { adminService } from "@/services/admin.service";
import { userService } from "@/services/user.service";
import type { AdminRequestParams } from "@/types/api";

export function useAdminStats() {
  return useQuery({
    queryKey: queryKeys.admin.stats(),
    queryFn: adminService.getDashboardStats,
    refetchInterval: 60_000,
  });
}

export function useOfficerWorkload() {
  return useQuery({
    queryKey: queryKeys.admin.workload(),
    queryFn: adminService.getOfficerWorkload,
    refetchInterval: 60_000,
  });
}

export function useAdminRequests(params: AdminRequestParams) {
  return useQuery({
    queryKey: queryKeys.admin.requests(params),
    queryFn: () => adminService.listRequests(params),
    placeholderData: keepPreviousData,
  });
}

export function useAdminRequest(id: string) {
  return useQuery({
    queryKey: queryKeys.admin.request(id),
    queryFn: () => adminService.getRequest(id),
  });
}

export function useRequestHistory(id: string) {
  return useQuery({
    queryKey: queryKeys.admin.history(id),
    queryFn: () => adminService.getRequestHistory(id),
  });
}

/**
 * All maintenance officers, including those with no requests yet.
 * /admin/dashboard/officers only lists officers who already hold assignments.
 */
export function useOfficers() {
  return useQuery({
    queryKey: queryKeys.admin.officers(),
    queryFn: () => userService.list({ role: "maintenanceOfficer", status: "active", limit: 100 }),
    select: (response) => response.users,
  });
}
