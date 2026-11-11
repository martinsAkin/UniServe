import { RequireRole } from "../router/guards";
import { DashboardLayout } from "./DashboardLayout";

export function StudentWorkspace() {
  return (
    <RequireRole role="studentOrstaff">
      <DashboardLayout />
    </RequireRole>
  );
}

export function OfficerWorkspace() {
  return (
    <RequireRole role="maintenanceOfficer">
      <DashboardLayout />
    </RequireRole>
  );
}

export function AdminWorkspace() {
  return (
    <RequireRole role="admin">
      <DashboardLayout />
    </RequireRole>
  );
}
