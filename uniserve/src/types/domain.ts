import type { REQUEST_STATUSES, USER_ROLES } from "@/lib/constants";

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

/** Returned by /auth/login, /auth/register and /auth/me (note: `id`, not `_id`). */
export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
}

/** Populated user reference embedded in requests (`author`, `assignedOfficer`). */
export interface UserSummary {
  _id: string;
  username: string;
  email?: string;
}

/** User record returned by admin listing endpoints (uses `_id`). */
export interface ManagedUser {
  _id: string;
  username: string;
  email: string;
  role: UserRole;
  isActive?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface MaintenanceRequest {
  _id: string;
  title: string;
  description: string;
  location: string;
  status: RequestStatus;
  completionNote: string | null;
  author: UserSummary;
  assignedOfficer: UserSummary | null;
  createdAt: string;
  updatedAt: string;
}

/** Subset returned by the admin dashboard `recentRequests` projection. */
export interface RecentRequest {
  _id: string;
  title: string;
  location: string;
  status: RequestStatus;
  createdAt: string;
  author: Pick<UserSummary, "_id" | "username"> | null;
  assignedOfficer: Pick<UserSummary, "_id" | "username"> | null;
}

export type RequestActivityAction =
  "created" | "assigned" | "reassigned" | "started" | "completed" | "cancelled" | "updated";

export interface RequestActivity {
  _id: string;
  action: RequestActivityAction;
  actor: { _id: string; username: string; email: string; role: UserRole } | null;
  fromStatus: string | null;
  toStatus: string | null;
  details: string | null;
  createdAt: string;
}

export interface AdminDashboardStats {
  totalRequests: number;
  activeRequests: number;
  inProgressRequests: number;
  completedRequests: number;
  cancelledRequests: number;
  totalUsers: number;
  totalOfficers: number;
}

export interface OfficerWorkload {
  officerId: string;
  username: string;
  email: string;
  totalAssigned: number;
  active: number;
  inProgress: number;
  completed: number;
  cancelled: number;
}

export type StatusCounts = Record<RequestStatus, number>;
