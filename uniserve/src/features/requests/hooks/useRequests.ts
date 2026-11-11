import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { requestService } from "@/services/request.service";
import type { AssignOfficerPayload, UpdateStatusPayload } from "@/types/api";

const REFRESH_INTERVAL_MS = 60_000;

/** Role-scoped list from GET /requests (own, assigned, or all for admins). */
export function useMyRequests() {
  return useQuery({
    queryKey: queryKeys.requests.mine(),
    queryFn: requestService.list,
    refetchInterval: REFRESH_INTERVAL_MS,
  });
}

export function useRequest(id: string) {
  return useQuery({
    queryKey: queryKeys.requests.detail(id),
    queryFn: () => requestService.getById(id),
  });
}

function useInvalidateRequestData() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all }),
    ]);
}

export function useCreateRequest() {
  const invalidate = useInvalidateRequestData();
  return useMutation({
    mutationFn: requestService.create,
    onSuccess: async () => {
      await invalidate();
      toast.success("Request submitted.");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Unable to submit the request.")),
  });
}

export function useUpdateRequestStatus(requestId: string) {
  const invalidate = useInvalidateRequestData();
  return useMutation({
    mutationFn: (payload: UpdateStatusPayload) => requestService.updateStatus(requestId, payload),
    onSuccess: async (request) => {
      await invalidate();
      toast.success(`Request marked as ${request.status}.`);
    },
    onError: (error) => toast.error(getErrorMessage(error, "Unable to update the request.")),
  });
}

export function useAssignOfficer(requestId: string) {
  const invalidate = useInvalidateRequestData();
  return useMutation({
    mutationFn: (payload: AssignOfficerPayload) => requestService.assignOfficer(requestId, payload),
    onSuccess: async (request) => {
      await invalidate();
      toast.success(`Assigned to ${request.assignedOfficer?.username ?? "officer"}.`);
    },
    onError: (error) => toast.error(getErrorMessage(error, "Unable to assign the officer.")),
  });
}
