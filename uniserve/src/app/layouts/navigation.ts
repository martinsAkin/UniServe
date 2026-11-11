import type { LinkProps } from "@tanstack/react-router";
import {
  BarChart3,
  ClipboardList,
  FilePlus2,
  LayoutDashboard,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/types/domain";

export interface NavItem {
  label: string;
  to: LinkProps["to"];
  icon: LucideIcon;
  isActive: (pathname: string) => boolean;
}

const startsWith = (prefix: string) => (pathname: string) => pathname.startsWith(prefix);

export const NAVIGATION: Record<UserRole, NavItem[]> = {
  studentOrstaff: [
    {
      label: "Dashboard",
      to: "/student/dashboard",
      icon: LayoutDashboard,
      isActive: startsWith("/student/dashboard"),
    },
    {
      label: "My Requests",
      to: "/student/requests",
      icon: ClipboardList,
      isActive: (pathname) =>
        pathname.startsWith("/student/requests") && !pathname.startsWith("/student/requests/new"),
    },
    {
      label: "Submit Request",
      to: "/student/requests/new",
      icon: FilePlus2,
      isActive: startsWith("/student/requests/new"),
    },
  ],
  maintenanceOfficer: [
    {
      label: "Dashboard",
      to: "/officer/dashboard",
      icon: LayoutDashboard,
      isActive: startsWith("/officer/dashboard"),
    },
    {
      label: "Assigned Requests",
      to: "/officer/requests",
      icon: Wrench,
      isActive: startsWith("/officer/requests"),
    },
  ],
  admin: [
    {
      label: "Dashboard",
      to: "/admin/dashboard",
      icon: LayoutDashboard,
      isActive: startsWith("/admin/dashboard"),
    },
    {
      label: "Maintenance Requests",
      to: "/admin/requests",
      icon: ClipboardList,
      isActive: startsWith("/admin/requests"),
    },
    {
      label: "User Management",
      to: "/admin/users",
      icon: Users,
      isActive: startsWith("/admin/users"),
    },
    {
      label: "Reports",
      to: "/admin/reports",
      icon: BarChart3,
      isActive: startsWith("/admin/reports"),
    },
  ],
};
