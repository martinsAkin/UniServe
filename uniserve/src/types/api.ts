import type {
  AdminDashboardStats,
  AuthUser,
  ManagedUser,
  MaintenanceRequest,
  OfficerWorkload,
  RecentRequest,
  RequestActivity,
  RequestStatus,
  UserRole,
} from "./domain";

export interface ApiMessage {
  success: boolean;
  message?: string;
  error?: string;
}

export interface AuthResponse extends ApiMessage {
  token: string;
  user: AuthUser;
}

export interface MeResponse extends ApiMessage {
  user: AuthUser;
}

export interface RequestListResponse extends ApiMessage {
  count: number;
  requests: MaintenanceRequest[];
}

export interface RequestResponse extends ApiMessage {
  request: MaintenanceRequest;
}

export interface Pagination {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalRequests?: number;
  totalUsers?: number;
}

export interface AdminRequestListResponse extends ApiMessage {
  pagination: Pagination & { totalRequests: number };
  requests: MaintenanceRequest[];
}

export interface AdminUserListResponse extends ApiMessage {
  pagination: Pagination & { totalUsers: number };
  users: ManagedUser[];
}

export interface AllUsersResponse extends ApiMessage {
  count: number;
  users: ManagedUser[];
}

export interface DashboardStatsResponse extends ApiMessage {
  stats: AdminDashboardStats;
  recentRequests: RecentRequest[];
}

export interface OfficerWorkloadResponse extends ApiMessage {
  count: number;
  workload: OfficerWorkload[];
}

export interface RequestHistoryResponse extends ApiMessage {
  count: number;
  history: RequestActivity[];
}

export interface UpdatedRoleResponse extends ApiMessage {
  user: AuthUser;
}

export interface CreateRequestPayload {
  title: string;
  description: string;
  location: string;
}

export interface UpdateStatusPayload {
  status: RequestStatus;
  completionNote?: string;
}

export interface AssignOfficerPayload {
  officerId: string;
}

export interface AdminRequestParams {
  page?: number;
  limit?: number;
  status?: RequestStatus;
  officerId?: string;
  authorId?: string;
  search?: string;
  sort?: "newest" | "oldest";
}

export interface AdminUserParams {
  page?: number;
  limit?: number;
  role?: UserRole;
  status?: "active" | "inactive";
  search?: string;
}
