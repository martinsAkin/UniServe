import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  Ban,
  CheckCircle2,
  ClipboardList,
  Hourglass,
  PlayCircle,
  Users,
} from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { ListSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelative } from "@/utils/format";
import { OfficerWorkloadTable } from "../components/OfficerWorkloadTable";
import { StatusDistributionChart } from "../components/StatusDistributionChart";
import { useAdminStats } from "../hooks/useAdmin";

export function AdminDashboardPage() {
  const query = useAdminStats();
  const stats = query.data?.stats;

  return (
    <>
      <PageHeader
        title="Operations dashboard"
        description="A live view of maintenance requests across the university."
        actions={
          <>
            <Button asChild variant="secondary">
              <Link to="/admin/users">
                <Users className="size-4" aria-hidden /> Users
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/admin/reports">
                <BarChart3 className="size-4" aria-hidden /> Reports
              </Link>
            </Button>
            <Button asChild>
              <Link to="/admin/requests">
                <ClipboardList className="size-4" aria-hidden /> All requests
              </Link>
            </Button>
          </>
        }
      />

      {query.isError && (
        <Card className="mb-6">
          <ErrorState error={query.error} onRetry={() => void query.refetch()} />
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Total requests"
          value={stats?.totalRequests}
          icon={ClipboardList}
          isLoading={query.isPending}
        />
        <StatCard
          label="Active"
          value={stats?.activeRequests}
          icon={Hourglass}
          tone="amber"
          isLoading={query.isPending}
        />
        <StatCard
          label="In progress"
          value={stats?.inProgressRequests}
          icon={PlayCircle}
          tone="blue"
          isLoading={query.isPending}
        />
        <StatCard
          label="Completed"
          value={stats?.completedRequests}
          icon={CheckCircle2}
          tone="green"
          isLoading={query.isPending}
        />
        <StatCard
          label="Cancelled"
          value={stats?.cancelledRequests}
          icon={Ban}
          tone="slate"
          isLoading={query.isPending}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Status distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {stats ? (
              <StatusDistributionChart
                counts={{
                  active: stats.activeRequests,
                  "in-progress": stats.inProgressRequests,
                  completed: stats.completedRequests,
                  cancelled: stats.cancelledRequests,
                }}
              />
            ) : (
              <Skeleton className="h-64 w-full" />
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex-row items-center justify-between pb-4">
            <CardTitle>Recent requests</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin/requests">View all</Link>
            </Button>
          </CardHeader>
          {query.isPending ? (
            <ListSkeleton rows={4} />
          ) : query.data && query.data.recentRequests.length > 0 ? (
            <ul className="divide-y divide-line border-t border-line">
              {query.data.recentRequests.map((request) => (
                <li
                  key={request._id}
                  className="flex items-center justify-between gap-4 px-5 py-3.5"
                >
                  <div className="min-w-0">
                    <Link
                      to="/admin/requests/$id"
                      params={{ id: request._id }}
                      className="block truncate font-medium hover:text-brand-600"
                    >
                      {request.title}
                    </Link>
                    <p className="truncate text-xs text-ink-muted">
                      {request.location} · {request.author?.username ?? "Unknown"} ·{" "}
                      {formatRelative(request.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={request.status} />
                </li>
              ))}
            </ul>
          ) : (
            !query.isError && (
              <EmptyState
                title="No requests yet"
                description="Submitted requests will appear here."
              />
            )
          )}
        </Card>
      </div>

      <div className="mt-6">
        <OfficerWorkloadTable />
      </div>
    </>
  );
}
