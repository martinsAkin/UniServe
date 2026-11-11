import { apiClient } from "@/lib/api-client";
import type {
  AdminUserListResponse,
  AdminUserParams,
  AllUsersResponse,
  UpdatedRoleResponse,
} from "@/types/api";
import type { UserRole } from "@/types/domain";

export const userService = {
  /** GET /admin/users — paginated, filterable. */
  list: (params: AdminUserParams) =>
    apiClient.get<AdminUserListResponse>("/admin/users", { params }).then((res) => res.data),

  /** GET /users — unpaginated. Used to resolve a single user because GET /admin/users/:id does not exist. */
  listAll: () => apiClient.get<AllUsersResponse>("/users").then((res) => res.data.users),

  /** Role change lives on /users/:userId/role (not under /admin). */
  updateRole: (userId: string, role: UserRole) =>
    apiClient
      .patch<UpdatedRoleResponse>(`/users/${userId}/role`, { role })
      .then((res) => res.data.user),

  /**
   * PENDING BACKEND: PATCH /admin/users/:id/status with `{ isActive: boolean }`.
   * The route is not implemented yet; callers are gated by BACKEND_CAPABILITIES.userStatusUpdate.
   */
  updateStatus: (userId: string, isActive: boolean) =>
    apiClient.patch(`/admin/users/${userId}/status`, { isActive }).then((res) => res.data),
};
