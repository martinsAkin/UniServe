import { apiClient } from "@/lib/api-client";
import type {
  AssignOfficerPayload,
  CreateRequestPayload,
  RequestListResponse,
  RequestResponse,
  UpdateStatusPayload,
} from "@/types/api";

export const requestService = {
  /** Backend scopes results by role: own requests, assigned requests, or all (admin). */
  list: () => apiClient.get<RequestListResponse>("/requests").then((res) => res.data.requests),

  getById: (id: string) =>
    apiClient.get<RequestResponse>(`/requests/${id}`).then((res) => res.data.request),

  create: (payload: CreateRequestPayload) =>
    apiClient.post<RequestResponse>("/requests", payload).then((res) => res.data.request),

  updateStatus: (id: string, payload: UpdateStatusPayload) =>
    apiClient
      .patch<RequestResponse>(`/requests/${id}/status`, payload)
      .then((res) => res.data.request),

  assignOfficer: (id: string, payload: AssignOfficerPayload) =>
    apiClient
      .patch<RequestResponse>(`/requests/${id}/assign`, payload)
      .then((res) => res.data.request),
};
