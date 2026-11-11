import { apiClient } from "@/lib/api-client";
import type {
  AdminRequestListResponse,
  AdminRequestParams,
  DashboardStatsResponse,
  OfficerWorkloadResponse,
  RequestHistoryResponse,
  RequestResponse,
} from "@/types/api";

export const adminService = {
  getDashboardStats: () =>
    apiClient.get<DashboardStatsResponse>("/admin/dashboard/stats").then((res) => res.data),

  getOfficerWorkload: () =>
    apiClient
      .get<OfficerWorkloadResponse>("/admin/dashboard/officers")
      .then((res) => res.data.workload),

  listRequests: (params: AdminRequestParams) =>
    apiClient.get<AdminRequestListResponse>("/admin/requests", { params }).then((res) => res.data),

  getRequest: (id: string) =>
    apiClient.get<RequestResponse>(`/admin/requests/${id}`).then((res) => res.data.request),

  getRequestHistory: (id: string) =>
    apiClient
      .get<RequestHistoryResponse>(`/admin/requests/${id}/history`)
      .then((res) => res.data.history),
};
