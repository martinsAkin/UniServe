import { Link, useParams } from "@tanstack/react-router";
import { Info } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { DetailsSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { RoleBadge } from "@/components/shared/RoleBadge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminRequests } from "@/features/admin/hooks/useAdmin";
import { BACKEND_CAPABILITIES } from "@/lib/constants";
import { formatDate, formatDateTime, shortId } from "@/utils/format";
import type { ManagedUser } from "@/types/domain";
import { AccountStatusBadge } from "../components/AccountStatusBadge";
import { UserActionsMenu } from "../components/UserActionsMenu";
import { useUserById } from "../hooks/useUsers";

function UserRequests({ user }: { user: ManagedUser }) {
  const isOfficer = user.role === "maintenanceOfficer";
  const isAdmin = user.role === "admin";
  const query = useAdminRequests(
    isOfficer ? { officerId: user._id, limit: 5 } : { authorId: user._id, limit: 5 },
  );

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle>{isOfficer ? "Assigned requests" : "Submitted requests"}</CardTitle>
        {query.data && (
          <p className="text-sm text-ink-soft">
            {query.data.pagination.totalRequests} in total
            {query.data.pagination.totalRequests > 5 ? " · latest 5 shown" : ""}
          </p>
        )}
      </CardHeader>
      {query.isPending ? (
        <Skeleton className="m-5 h-24" />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      ) : query.data.requests.length === 0 ? (
        <EmptyState
          title="No requests"
          description={isAdmin ? "Administrators do not usually submit requests." : undefined}
        />
      ) : (
        <ul className="divide-y divide-line border-t border-line">
          {query.data.requests.map((request) => (
            <li key={request._id} className="flex items-center justify-between gap-4 px-5 py-3.5">
              <div className="min-w-0">
                <Link
                  to="/admin/requests/$id"
                  params={{ id: request._id }}
                  className="block truncate font-medium hover:text-brand-600"
                >
                  {request.title}
                </Link>
                <p className="text-xs text-ink-muted">
                  {shortId(request._id)} · {formatDate(request.createdAt)}
                </p>
              </div>
              <StatusBadge status={request.status} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export function AdminUserDetailsPage() {
  const { id } = useParams({ from: "/admin/users/$id" });
  const query = useUserById(id);
  const breadcrumbs = [{ label: "User management", to: "/admin/users" }];

  if (query.isPending) return <DetailsSkeleton />;

  if (query.isError) {
    return (
      <Card>
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      </Card>
    );
  }

  const user = query.data;

  if (!user) {
    return (
      <Card>
        <EmptyState
          title="User not found"
          description="This account does not exist or may have been removed."
          action={
            <Button asChild variant="secondary">
              <Link to="/admin/users">Back to users</Link>
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <>
      <PageHeader
        title={user.username}
        breadcrumbs={[...breadcrumbs, { label: user.username }]}
        actions={<UserActionsMenu user={user} showViewLink={false} />}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 text-center">
            <UserAvatar name={user.username} className="size-16 text-2xl" />
            <div>
              <p className="text-lg font-semibold">{user.username}</p>
              <p className="break-all text-sm text-ink-soft">{user.email}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <RoleBadge role={user.role} />
              <AccountStatusBadge isActive={user.isActive} />
            </div>
            <dl className="w-full space-y-3 border-t border-line pt-4 text-left text-sm">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                  Registered
                </dt>
                <dd className="mt-1">{formatDateTime(user.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                  User ID
                </dt>
                <dd className="mt-1 break-all font-mono text-xs">{user._id}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <UserRequests user={user} />
          {!BACKEND_CAPABILITIES.userStatusUpdate && (
            <p className="flex items-start gap-2 rounded-lg bg-brand-50 px-4 py-3 text-sm text-ink-soft">
              <Info className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
              Activating and deactivating accounts needs a backend endpoint that has not been added
              yet.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
