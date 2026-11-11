import { Plus } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { SearchInput } from "@/components/shared/SearchInput";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { StatusFilter } from "@/components/shared/FilterSelect";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/format";
import type { MaintenanceRequest } from "@/types/domain";
import { useMyRequests } from "../hooks/useRequests";
import { useRequestListState } from "../hooks/useRequestListState";
import { RequestLink } from "./RequestLinks";
import { RequestTitleCell } from "./RequestTitleCell";
import { SortSelect } from "./SortSelect";

interface RequestListPageProps {
  role: "studentOrstaff" | "maintenanceOfficer";
}

const COPY = {
  studentOrstaff: {
    title: "My requests",
    description: "Every maintenance request you have submitted.",
    searchPlaceholder: "Search title, location or ID",
    emptyTitle: "No requests yet",
    emptyDescription: "When you report a maintenance issue it will appear here.",
  },
  maintenanceOfficer: {
    title: "Assigned requests",
    description: "Requests assigned to you by an administrator.",
    searchPlaceholder: "Search title, location, requester or ID",
    emptyTitle: "Nothing assigned to you",
    emptyDescription: "New assignments will show up here as soon as an administrator makes them.",
  },
} as const;

export function RequestListPage({ role }: RequestListPageProps) {
  const copy = COPY[role];
  const query = useMyRequests();
  const list = useRequestListState(query.data);
  const hasFilters = list.search !== "" || list.status !== undefined;

  const columns: Column<MaintenanceRequest>[] = [
    {
      header: "Request",
      cell: (request) => <RequestTitleCell id={request._id} title={request.title} role={role} />,
    },
    { header: "Location", cell: (request) => request.location },
    ...(role === "maintenanceOfficer"
      ? [{ header: "Requester", cell: (request: MaintenanceRequest) => request.author.username }]
      : []),
    { header: "Status", cell: (request) => <StatusBadge status={request.status} /> },
    { header: "Submitted", cell: (request) => formatDate(request.createdAt) },
    { header: "Updated", cell: (request) => formatDate(request.updatedAt) },
    {
      header: "",
      className: "text-right",
      hideOnMobile: true,
      cell: (request) => (
        <Button asChild variant="secondary" size="sm">
          <RequestLink id={request._id} role={role}>
            View
          </RequestLink>
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title={copy.title}
        description={copy.description}
        actions={
          role === "studentOrstaff" && (
            <Button asChild>
              <Link to="/student/requests/new">
                <Plus className="size-4" aria-hidden /> New request
              </Link>
            </Button>
          )
        }
      />
      <DataTable
        columns={columns}
        rows={list.rows}
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
            : { title: copy.emptyTitle, description: copy.emptyDescription }
        }
        toolbar={
          <>
            <SearchInput
              value={list.search}
              onChange={list.setSearch}
              placeholder={copy.searchPlaceholder}
            />
            <StatusFilter value={list.status} onChange={list.setStatus} />
            <SortSelect value={list.sort} onChange={list.setSort} />
          </>
        }
        footer={
          <Pagination
            page={list.page}
            totalPages={list.totalPages}
            totalItems={list.totalItems}
            pageSize={list.pageSize}
            onPageChange={list.setPage}
          />
        }
      />
    </>
  );
}
