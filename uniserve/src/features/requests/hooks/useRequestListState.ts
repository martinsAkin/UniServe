import { useMemo, useState } from "react";
import type { MaintenanceRequest, RequestStatus } from "@/types/domain";

export type SortOrder = "newest" | "oldest";

const PAGE_SIZE = 10;

/** GET /requests is unpaginated, so search, filter, sort and paging happen here on real data. */
export function useRequestListState(requests: MaintenanceRequest[] | undefined) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<RequestStatus | undefined>();
  const [sort, setSort] = useState<SortOrder>("newest");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (requests ?? [])
      .filter((request) => !status || request.status === status)
      .filter(
        (request) =>
          !term ||
          request.title.toLowerCase().includes(term) ||
          request.location.toLowerCase().includes(term) ||
          request._id.toLowerCase().includes(term) ||
          request.author.username.toLowerCase().includes(term),
      )
      .sort((a, b) => {
        const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        return sort === "newest" ? -diff : diff;
      });
  }, [requests, search, status, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const rows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return {
    rows,
    totalItems: filtered.length,
    totalPages,
    page: currentPage,
    pageSize: PAGE_SIZE,
    search,
    status,
    sort,
    setPage,
    setSearch: (value: string) => {
      setSearch(value);
      setPage(1);
    },
    setStatus: (value: RequestStatus | undefined) => {
      setStatus(value);
      setPage(1);
    },
    setSort: (value: SortOrder) => {
      setSort(value);
      setPage(1);
    },
  };
}
