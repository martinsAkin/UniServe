import { Link } from "@tanstack/react-router";
import { Mail, MapPin, UserRound, Wrench } from "lucide-react";
import type { ReactNode } from "react";
import { DetailsSkeleton } from "@/components/shared/LoadingSkeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import { PageHeader, type Crumb } from "@/components/shared/PageHeader";
import { RequestTimeline } from "@/components/shared/RequestTimeline";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { UseQueryResult } from "@tanstack/react-query";
import { formatDateTime, shortId } from "@/utils/format";
import type { MaintenanceRequest, RequestActivity, UserSummary } from "@/types/domain";
import { RequestActions } from "./RequestActions";

interface RequestDetailsViewProps {
  query: UseQueryResult<MaintenanceRequest>;
  breadcrumbs: Crumb[];
  backTo: "/student/requests" | "/officer/requests" | "/admin/requests";
  /** Admin-only activity timeline. */
  history?: UseQueryResult<RequestActivity[]>;
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</dt>
      <dd className="mt-1 text-sm text-ink">{children}</dd>
    </div>
  );
}

function PersonCard({
  title,
  icon: Icon,
  person,
  emptyText,
}: {
  title: string;
  icon: typeof UserRound;
  person: UserSummary | null;
  emptyText?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2">
        <Icon className="size-4 text-ink-muted" aria-hidden />
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {person ? (
          <div className="flex items-center gap-3">
            <UserAvatar name={person.username} />
            <div className="min-w-0">
              <p className="truncate font-medium">{person.username}</p>
              {person.email && (
                <p className="flex items-center gap-1 truncate text-sm text-ink-soft">
                  <Mail className="size-3.5 shrink-0" aria-hidden /> {person.email}
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-ink-soft">{emptyText}</p>
        )}
      </CardContent>
    </Card>
  );
}

function HistoryCard({ history }: { history: UseQueryResult<RequestActivity[]> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity history</CardTitle>
      </CardHeader>
      <CardContent>
        {history.isPending ? (
          <Skeleton className="h-24 w-full" />
        ) : history.isError ? (
          <ErrorState error={history.error} onRetry={() => void history.refetch()} />
        ) : history.data.length === 0 ? (
          <p className="text-sm text-ink-soft">No activity has been recorded for this request.</p>
        ) : (
          <RequestTimeline entries={history.data} />
        )}
      </CardContent>
    </Card>
  );
}

export function RequestDetailsView({
  query,
  breadcrumbs,
  backTo,
  history,
}: RequestDetailsViewProps) {
  if (query.isPending) return <DetailsSkeleton />;

  if (query.isError) {
    return (
      <Card>
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
        <div className="flex justify-center pb-10">
          <Button asChild variant="secondary">
            <Link to={backTo}>Back to list</Link>
          </Button>
        </div>
      </Card>
    );
  }

  const request = query.data;

  return (
    <>
      <PageHeader
        title={request.title}
        breadcrumbs={[...breadcrumbs, { label: shortId(request._id) }]}
        actions={<StatusBadge status={request.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Request details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-ink-soft">
                {request.description}
              </p>
              <dl className="grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
                <Detail label="Request ID">
                  <span className="font-mono text-xs">{request._id}</span>
                </Detail>
                <Detail label="Location">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-4 text-ink-muted" aria-hidden />
                    {request.location}
                  </span>
                </Detail>
                <Detail label="Submitted">{formatDateTime(request.createdAt)}</Detail>
                <Detail label="Last updated">{formatDateTime(request.updatedAt)}</Detail>
              </dl>
            </CardContent>
          </Card>

          {request.status === "completed" && request.completionNote && (
            <Card className="border-emerald-200 bg-emerald-50/50">
              <CardHeader>
                <CardTitle>Completion note</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap break-words text-sm text-ink-soft">
                  {request.completionNote}
                </p>
                <p className="mt-3 text-xs text-ink-muted">
                  Completed {formatDateTime(request.updatedAt)}
                </p>
              </CardContent>
            </Card>
          )}

          {history && <HistoryCard history={history} />}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <RequestActions request={request} />
              {request.status === "completed" || request.status === "cancelled" ? (
                <p className="mt-3 text-sm text-ink-soft">
                  This request is closed. No further actions are available.
                </p>
              ) : null}
            </CardContent>
          </Card>
          <PersonCard title="Requester" icon={UserRound} person={request.author} />
          <PersonCard
            title="Assigned officer"
            icon={Wrench}
            person={request.assignedOfficer}
            emptyText="No officer has been assigned yet."
          />
        </div>
      </div>
    </>
  );
}
