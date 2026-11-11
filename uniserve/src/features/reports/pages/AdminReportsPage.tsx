import {
  Ban,
  CheckCircle2,
  ClipboardList,
  Download,
  Hourglass,
  PlayCircle,
  RotateCcw,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { ErrorState } from "@/components/shared/ErrorState";
import { FilterSelect, StatusFilter } from "@/components/shared/FilterSelect";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useOfficers } from "@/features/admin/hooks/useAdmin";
import { RequestLink } from "@/features/requests/components/RequestLinks";
import type { ReportFilters } from "@/services/report.service";
import { formatDate, shortId } from "@/utils/format";
import { countByStatus } from "@/utils/request-stats";
import type { MaintenanceRequest } from "@/types/domain";
import { exportRequestsCsv } from "../components/exportRequestsCsv";
import { ReportCharts } from "../components/ReportCharts";
import { useReport } from "../hooks/useReport";

const PAGE_SIZE = 10;

const columns: Column<MaintenanceRequest>[] = [
  {
    header: "Request",
    cell: (request) => (
      <div className="min-w-0 max-w-xs">
        <RequestLink
          id={request._id}
          role="admin"
          className="block truncate font-medium hover:text-brand-600"
        >
          {request.title}
        </RequestLink>
        <span className="font-mono text-xs text-ink-muted">{shortId(request._id)}</span>
      </div>
    ),
  },
  { header: "Location", cell: (request) => request.location },
  { header: "Requester", cell: (request) => request.author.username },
  {
    header: "Officer",
    cell: (request) =>
      request.assignedOfficer?.username ?? <span className="text-ink-muted">Unassigned</span>,
  },
  { header: "Status", cell: (request) => <StatusBadge status={request.status} /> },
  { header: "Created", cell: (request) => formatDate(request.createdAt) },
  {
    header: "Completed",
    cell: (request) =>
      request.status === "completed" ? (
        formatDate(request.updatedAt)
      ) : (
        <span className="text-ink-muted">—</span>
      ),
  },
];

export function AdminReportsPage() {
  const [filters, setFilters] = useState<ReportFilters>({});
  const [page, setPage] = useState(1);
  const officers = useOfficers();
  const query = useReport(filters);

  const records = query.data ?? [];
  const counts = countByStatus(records);
  const hasFilters = Object.values(filters).some(Boolean);
  const isRangeInvalid = Boolean(
    filters.startDate && filters.endDate && filters.startDate > filters.endDate,
  );
  const totalPages = Math.max(1, Math.ceil(records.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = records.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const updateFilters = (patch: Partial<ReportFilters>) => {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(1);
  };

  const handleExport = () => {
    exportRequestsCsv(records, filters);
    toast.success(`Exported ${records.length} request${records.length === 1 ? "" : "s"}.`);
  };

  return (
    <>
      <PageHeader
        title="Reports"
        description="Operational overview built from live request data."
        actions={
          <Button onClick={handleExport} disabled={query.isPending || records.length === 0}>
            <Download className="size-4" aria-hidden /> Export CSV
          </Button>
        }
      />

      <Card className="mb-6 p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto] lg:items-end">
          <div className="space-y-1.5">
            <Label htmlFor="startDate">Start date</Label>
            <Input
              id="startDate"
              type="date"
              value={filters.startDate ?? ""}
              max={filters.endDate || undefined}
              onChange={(event) => updateFilters({ startDate: event.target.value || undefined })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="endDate">End date</Label>
            <Input
              id="endDate"
              type="date"
              value={filters.endDate ?? ""}
              min={filters.startDate || undefined}
              onChange={(event) => updateFilters({ endDate: event.target.value || undefined })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <StatusFilter value={filters.status} onChange={(status) => updateFilters({ status })} />
          </div>
          <div className="space-y-1.5">
            <Label>Officer</Label>
            <FilterSelect
              value={filters.officerId}
              onChange={(officerId) => updateFilters({ officerId })}
              options={(officers.data ?? []).map((officer) => ({
                value: officer._id,
                label: officer.username,
              }))}
              allLabel="All officers"
              ariaLabel="Filter by officer"
            />
          </div>
          <Button
            variant="ghost"
            onClick={() => {
              setFilters({});
              setPage(1);
            }}
            disabled={!hasFilters}
          >
            <RotateCcw className="size-4" aria-hidden /> Reset
          </Button>
        </div>
        {isRangeInvalid && (
          <p role="alert" className="mt-3 text-sm text-danger">
            The start date must be on or before the end date.
          </p>
        )}
      </Card>

      {query.isError && !query.data ? (
        <Card>
          <ErrorState error={query.error} onRetry={() => void query.refetch()} />
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard
              label="Total requests"
              value={records.length}
              icon={ClipboardList}
              isLoading={query.isPending}
            />
            <StatCard
              label="Active"
              value={counts.active}
              icon={Hourglass}
              tone="amber"
              isLoading={query.isPending}
            />
            <StatCard
              label="In progress"
              value={counts["in-progress"]}
              icon={PlayCircle}
              tone="blue"
              isLoading={query.isPending}
            />
            <StatCard
              label="Completed"
              value={counts.completed}
              icon={CheckCircle2}
              tone="green"
              isLoading={query.isPending}
            />
            <StatCard
              label="Cancelled"
              value={counts.cancelled}
              icon={Ban}
              tone="slate"
              isLoading={query.isPending}
            />
          </div>

          <div className="mt-6">
            {query.isPending ? (
              <Skeleton className="h-72 w-full" />
            ) : (
              <ReportCharts requests={records} />
            )}
          </div>

          <h2 className="mb-3 mt-8 text-lg font-semibold">Request records</h2>
          <DataTable
            columns={columns}
            rows={pageRows}
            getRowKey={(request) => request._id}
            isLoading={query.isPending}
            isFetching={query.isFetching}
            error={query.error}
            onRetry={() => void query.refetch()}
            empty={{
              title: "No requests match these filters",
              description: "Widen the date range or reset the filters.",
            }}
            footer={
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                totalItems={records.length}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
              />
            }
          />
        </>
      )}
    </>
  );
}
