import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import type { UserRole } from "@/types/domain";

interface RequestLinkProps {
  id: string;
  role: UserRole;
  className?: string;
  children: ReactNode;
}

/** Links to the correct request-details route for each workspace. */
export function RequestLink({ id, role, className, children }: RequestLinkProps) {
  if (role === "admin") {
    return (
      <Link to="/admin/requests/$id" params={{ id }} className={className}>
        {children}
      </Link>
    );
  }
  if (role === "maintenanceOfficer") {
    return (
      <Link to="/officer/requests/$id" params={{ id }} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <Link to="/student/requests/$id" params={{ id }} className={className}>
      {children}
    </Link>
  );
}
