import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BACKEND_CAPABILITIES } from "@/lib/constants";
import { getErrorMessage } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { userService } from "@/services/user.service";
import type { AdminUserParams } from "@/types/api";
import type { UserRole } from "@/types/domain";

export function useAdminUsers(params: AdminUserParams) {
  return useQuery({
    queryKey: queryKeys.admin.users(params),
    queryFn: () => userService.list(params),
    placeholderData: keepPreviousData,
  });
}

/** Resolves a single user from the unpaginated GET /users list (no GET /admin/users/:id yet). */
export function useUserById(userId: string) {
  return useQuery({
    queryKey: queryKeys.admin.allUsers(),
    queryFn: () => userService.getById(userId),
    select: (user) => user ?? null,
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      userService.updateRole(userId, role),
    onSuccess: async (user) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
      toast.success(`${user.username}'s role was updated.`);
    },
    onError: (error) => toast.error(getErrorMessage(error, "Unable to change the role.")),
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      if (!BACKEND_CAPABILITIES.userStatusUpdate) {
        throw new Error(
          "Account activation is not available yet: the backend has no status endpoint.",
        );
      }
      return userService.updateStatus(userId, isActive);
    },
    onSuccess: async (_, { isActive }) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
      toast.success(isActive ? "Account activated." : "Account deactivated.");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Unable to update the account.")),
  });
}
