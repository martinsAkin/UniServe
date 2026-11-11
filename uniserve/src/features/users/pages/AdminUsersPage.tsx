import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { RoleBadge } from "@/components/shared/RoleBadge";
import { SearchInput } from "@/components/shared/SearchInput";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { ROLE_LABELS, USER_ROLES } from "@/lib/constants";
import { formatDate } from "@/utils/format";
import type { ManagedUser, UserRole } from "@/types/domain";
import { AccountStatusBadge } from "../components/AccountStatusBadge";
import { UserActionsMenu } from "../components/UserActionsMenu";
import { useAdminUsers } from "../hooks/useUsers";

const PAGE_SIZE = 10;
type AccountStatus = "active" | "inactive";

const ROLE_OPTIONS = Object.values(USER_ROLES).map((role) => ({
  value: role,
  label: ROLE_LABELS[role],
}));
const STATUS_OPTIONS: { value: AccountStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Deactivated" },
];

const columns: Column<ManagedUser>[] = [
  {
    header: "User",
    cell: (user) => (
      <Link
        to="/admin/users/$id"
        params={{ id: user._id }}
        className="flex items-center gap-3 hover:text-brand-600"
      >
        <UserAvatar name={user.username} className="size-8 text-xs" />
        <span className="min-w-0">
          <span className="block truncate font-medium">{user.username}</span>
          <span className="block truncate text-xs font-normal text-ink-soft">{user.email}</span>
        </span>
      </Link>
    ),
  },
  { header: "Role", cell: (user) => <RoleBadge role={user.role} /> },
  { header: "Status", cell: (user) => <AccountStatusBadge isActive={user.isActive} /> },
  { header: "Registered", cell: (user) => formatDate(user.createdAt) },
  { header: "", className: "w-12 text-right", cell: (user) => <UserActionsMenu user={user} /> },
];

export function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<UserRole | undefined>();
  const [status, setStatus] = useState<AccountStatus | undefined>();

  const query = useAdminUsers({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    role,
    status,
  });
  const hasFilters = Boolean(search || role || status);

  const resetPageAnd =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value);
      setPage(1);
    };

  return (
    <>
      <PageHeader
        title="User management"
        description="Review accounts, change roles and control access."
      />
      <DataTable
        columns={columns}
        rows={query.data?.users}
        getRowKey={(user) => user._id}
        isLoading={query.isPending}
        isFetching={query.isFetching}
        error={query.error}
        onRetry={() => void query.refetch()}
        empty={{
          title: hasFilters ? "No matching users" : "No users found",
          description: hasFilters ? "Try a different search or clear the filters." : undefined,
        }}
        toolbar={
          <>
            <SearchInput
              value={search}
              onChange={resetPageAnd(setSearch)}
              placeholder="Search username or email"
            />
            <FilterSelect
              value={role}
              onChange={resetPageAnd(setRole)}
              options={ROLE_OPTIONS}
              allLabel="All roles"
              ariaLabel="Filter by role"
            />
            <FilterSelect
              value={status}
              onChange={resetPageAnd(setStatus)}
              options={STATUS_OPTIONS}
              allLabel="All accounts"
              ariaLabel="Filter by account status"
            />
          </>
        }
        footer={
          query.data && (
            <Pagination
              page={query.data.pagination.currentPage}
              totalPages={query.data.pagination.totalPages}
              totalItems={query.data.pagination.totalUsers}
              pageSize={query.data.pagination.pageSize}
              onPageChange={setPage}
            />
          )
        }
      />
    </>
  );
}
