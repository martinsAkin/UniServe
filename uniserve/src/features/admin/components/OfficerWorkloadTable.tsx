import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { ListSkeleton } from "@/components/shared/LoadingSkeleton";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useOfficerWorkload } from "../hooks/useAdmin";

export function OfficerWorkloadTable() {
  const query = useOfficerWorkload();

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle>Officer workload</CardTitle>
      </CardHeader>
      {query.isPending ? (
        <ListSkeleton rows={3} />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      ) : query.data.length === 0 ? (
        <EmptyState
          title="No officers have assignments"
          description="Assign requests to see each officer's workload."
        />
      ) : (
        <div className="overflow-x-auto border-t border-line">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Officer</TableHead>
                <TableHead className="text-right">Active</TableHead>
                <TableHead className="text-right">In progress</TableHead>
                <TableHead className="text-right">Completed</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.data.map((officer) => (
                <TableRow key={officer.officerId}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <UserAvatar name={officer.username} className="size-8 text-xs" />
                      <span className="font-medium">{officer.username}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{officer.active}</TableCell>
                  <TableCell className="text-right tabular-nums">{officer.inProgress}</TableCell>
                  <TableCell className="text-right tabular-nums">{officer.completed}</TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {officer.totalAssigned}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}
