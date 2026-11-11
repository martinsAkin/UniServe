export const USER_ROLES = {
  student: "studentOrstaff",
  officer: "maintenanceOfficer",
  admin: "admin",
} as const;

export const REQUEST_STATUSES = ["active", "in-progress", "completed", "cancelled"] as const;

export const ROLE_LABELS = {
  studentOrstaff: "Student / Staff",
  maintenanceOfficer: "Maintenance Officer",
  admin: "Administrator",
} as const;

export const ROLE_HOME_PATH = {
  studentOrstaff: "/student/dashboard",
  maintenanceOfficer: "/officer/dashboard",
  admin: "/admin/dashboard",
} as const;

export const STATUS_LABELS = {
  active: "Active",
  "in-progress": "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
} as const;

export const REQUEST_LIMITS = {
  title: 100,
  description: 1000,
  location: 100,
  completionNote: 1000,
} as const;

export const TOKEN_STORAGE_KEY = "uniserve.token";

/**
 * Backend features the UI is built for but the current API does not expose.
 * Flip a flag to true once the matching endpoint ships.
 */
export const BACKEND_CAPABILITIES = {
  userStatusUpdate: false,
  userDetailEndpoint: false,
  reportsEndpoint: false,
  requestHistoryForNonAdmins: false,
} as const;
