import { Link } from "@tanstack/react-router";
import {
  Ban,
  CheckCircle2,
  ClipboardList,
  Hourglass,
  PlayCircle,
  Plus,
  type LucideIcon,
} from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { ListSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthenticatedUser } from "@/features/auth/hooks/useAuth";
import { formatRelative } from "@/utils/format";
import { countByStatus } from "@/utils/request-stats";
import { useMyRequests } from "../hooks/useRequests";
import { RequestLink } from "./RequestLinks";

const RECENT_COUNT = 5;

const COPY = {
  studentOrstaff: {
    total: "Total submitted",
    recentTitle: "Recent requests",
    emptyTitle: "You have not submitted any requests",
    emptyDescription: "Report a fault and you can follow its progress here.",
    listLabel: "View all requests",
  },
  maintenanceOfficer: {
    total: "Total assigned",
    recentTitle: "Recently assigned",
    emptyTitle: "No assignments yet",
    emptyDescription: "Requests assigned to you will appear here.",
    listLabel: "View assigned requests",
  },
} as const;

const STATUS_CARDS: {
  key: "active" | "in-progress" | "completed" | "cancelled";
  label: string;
  icon: LucideIcon;
  tone: "amber" | "blue" | "green" | "slate";
}[] = [
  { key: "active", label: "Active", icon: Hourglass, tone: "amber" },
  { key: "in-progress", label: "In progress", icon: PlayCircle, tone: "blue" },
  { key: "completed", label: "Completed", icon: CheckCircle2, tone: "green" },
  { key: "cancelled", label: "Cancelled", icon: Ban, tone: "slate" },
];

export function RoleDashboard({ role }: { role: "studentOrstaff" | "maintenanceOfficer" }) {
  const user = useAuthenticatedUser();
  const copy = COPY[role];
  const query = useMyRequests();
  const requests = query.data;
  const counts = requests ? countByStatus(requests) : undefined;
  const recent = requests?.slice(0, RECENT_COUNT) ?? [];
  const listPath = role === "studentOrstaff" ? "/student/requests" : "/officer/requests";

  return (
    <>
      <PageHeader
        title={`Welcome, ${user.username}`}
        description={
          role === "studentOrstaff"
            ? "Here is where your maintenance requests stand."
            : "Here is the work currently assigned to you."
        }
        actions={
          role === "studentOrstaff" && (
            <Button asChild>
              <Link to="/student/requests/new">
                <Plus className="size-4" aria-hidden /> Submit a request
              </Link>
            </Button>
          )
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label={copy.total}
          value={requests?.length}
          icon={ClipboardList}
          isLoading={query.isPending}
        />
        {STATUS_CARDS.map((card) => (
          <StatCard
            key={card.key}
            label={card.label}
            value={counts?.[card.key]}
            icon={card.icon}
            tone={card.tone}
            isLoading={query.isPending}
          />
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader className="flex-row items-center justify-between pb-4">
          <CardTitle>{copy.recentTitle}</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link to={listPath}>{copy.listLabel}</Link>
          </Button>
        </CardHeader>
        {query.isPending ? (
          <ListSkeleton rows={4} />
        ) : query.isError ? (
          <ErrorState error={query.error} onRetry={() => void query.refetch()} />
        ) : recent.length === 0 ? (
          <EmptyState title={copy.emptyTitle} description={copy.emptyDescription} />
        ) : (
          <CardContent className="p-0">
            <ul className="divide-y divide-line border-t border-line">
              {recent.map((request) => (
                <li
                  key={request._id}
                  className="flex items-center justify-between gap-4 px-5 py-3.5"
                >
                  <div className="min-w-0">
                    <RequestLink
                      id={request._id}
                      role={role}
                      className="block truncate font-medium hover:text-brand-600"
                    >
                      {request.title}
                    </RequestLink>
                    <p className="truncate text-xs text-ink-muted">
                      {request.location} · {formatRelative(request.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={request.status} />
                </li>
              ))}
            </ul>
          </CardContent>
        )}
      </Card>
    </>
  );
}
