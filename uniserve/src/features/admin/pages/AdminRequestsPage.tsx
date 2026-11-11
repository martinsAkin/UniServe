import { useState } from "react";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { FilterSelect, StatusFilter } from "@/components/shared/FilterSelect";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { SearchInput } from "@/components/shared/SearchInput";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { RequestLink } from "@/features/requests/components/RequestLinks";
import { RequestTitleCell } from "@/features/requests/components/RequestTitleCell";
import { SortSelect } from "@/features/requests/components/SortSelect";
import type { SortOrder } from "@/features/requests/hooks/useRequestListState";
import { formatDate } from "@/utils/format";
import type { MaintenanceRequest, RequestStatus } from "@/types/domain";
import { useAdminRequests, useOfficers } from "../hooks/useAdmin";

const PAGE_SIZE = 10;

const columns: Column<MaintenanceRequest>[] = [
  {
    header: "Request",
    cell: (request) => <RequestTitleCell id={request._id} title={request.title} role="admin" />,
  },
  { header: "Requester", cell: (request) => request.author.username },
  { header: "Location", cell: (request) => request.location },
  {
    header: "Officer",
    cell: (request) =>
      request.assignedOfficer?.username ?? <span className="text-ink-muted">Unassigned</span>,
  },
  { header: "Status", cell: (request) => <StatusBadge status={request.status} /> },
  { header: "Submitted", cell: (request) => formatDate(request.createdAt) },
  { header: "Updated", cell: (request) => formatDate(request.updatedAt) },
  {
    header: "",
    className: "text-right",
    hideOnMobile: true,
    cell: (request) => (
      <Button asChild variant="secondary" size="sm">
        <RequestLink id={request._id} role="admin">
          Details
        </RequestLink>
      </Button>
    ),
  },
];

export function AdminRequestsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<RequestStatus | undefined>();
  const [officerId, setOfficerId] = useState<string | undefined>();
  const [sort, setSort] = useState<SortOrder>("newest");

  const officers = useOfficers();
  const query = useAdminRequests({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    status,
    officerId,
    sort,
  });
  const hasFilters = Boolean(search || status || officerId);

  const resetPageAnd =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value);
      setPage(1);
    };

  return (
    <>
      <PageHeader title="Maintenance requests" description="Every request across the university." />
      <DataTable
        columns={columns}
        rows={query.data?.requests}
        getRowKey={(request) => request._id}
        isLoading={query.isPending}
        isFetching={query.isFetching}
        error={query.error}
        onRetry={() => void query.refetch()}
        empty={
          hasFilters
            ? {
                title: "No matching requests",
                description: "Try a different search or clear the filters.",
              }
            : { title: "No requests yet", description: "Submitted requests will appear here." }
        }
        toolbar={
          <>
            <SearchInput
              value={search}
              onChange={resetPageAnd(setSearch)}
              placeholder="Search title or location"
            />
            <StatusFilter value={status} onChange={resetPageAnd(setStatus)} />
            <FilterSelect
              value={officerId}
              onChange={resetPageAnd(setOfficerId)}
              options={(officers.data ?? []).map((officer) => ({
                value: officer._id,
                label: officer.username,
              }))}
              allLabel="All officers"
              ariaLabel="Filter by officer"
            />
            <SortSelect value={sort} onChange={resetPageAnd(setSort)} />
          </>
        }
        footer={
          query.data && (
            <Pagination
              page={query.data.pagination.currentPage}
              totalPages={query.data.pagination.totalPages}
              totalItems={query.data.pagination.totalRequests}
              pageSize={query.data.pagination.pageSize}
              onPageChange={setPage}
            />
          )
        }
      />
    </>
  );
}
