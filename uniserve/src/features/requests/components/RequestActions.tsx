import { CheckCircle2, PlayCircle, UserPlus, XCircle } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { useAuthenticatedUser } from "@/features/auth/hooks/useAuth";
import type { MaintenanceRequest } from "@/types/domain";
import { useUpdateRequestStatus } from "../hooks/useRequests";
import { AssignOfficerDialog } from "./AssignOfficerDialog";
import { CompletionNoteDialog } from "./CompletionNoteDialog";

type PendingDialog = "start" | "complete" | "cancel" | "assign" | null;

/**
 * Mirrors the backend rules in PATCH /requests/:id/status:
 * - start / complete: assigned officer or admin
 * - cancel: request owner or admin (never the officer)
 * - assign: admin only
 */
export function RequestActions({ request }: { request: MaintenanceRequest }) {
  const user = useAuthenticatedUser();
  const [dialog, setDialog] = useState<PendingDialog>(null);
  const statusMutation = useUpdateRequestStatus(request._id);

  const isAdmin = user.role === "admin";
  const isOwner = request.author._id === user.id;
  const isAssignedOfficer = request.assignedOfficer?._id === user.id;
  const canWork = isAdmin || isAssignedOfficer;
  const isClosed = request.status === "completed" || request.status === "cancelled";

  const canStart = canWork && request.status === "active";
  const canComplete = canWork && request.status === "in-progress";
  const canCancel = (isAdmin || isOwner) && !isClosed;
  const canAssign = isAdmin && !isClosed;

  if (!canStart && !canComplete && !canCancel && !canAssign) return null;

  const closeDialog = () => setDialog(null);
  const changeStatus = (status: "in-progress" | "cancelled") =>
    statusMutation.mutate({ status }, { onSuccess: closeDialog });

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {canAssign && (
          <Button variant="secondary" onClick={() => setDialog("assign")}>
            <UserPlus className="size-4" aria-hidden />
            {request.assignedOfficer ? "Reassign officer" : "Assign officer"}
          </Button>
        )}
        {canStart && (
          <Button onClick={() => setDialog("start")}>
            <PlayCircle className="size-4" aria-hidden /> Start work
          </Button>
        )}
        {canComplete && (
          <Button onClick={() => setDialog("complete")}>
            <CheckCircle2 className="size-4" aria-hidden /> Complete request
          </Button>
        )}
        {canCancel && (
          <Button variant="dangerOutline" onClick={() => setDialog("cancel")}>
            <XCircle className="size-4" aria-hidden /> Cancel request
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={dialog === "start"}
        onOpenChange={(open) => !open && closeDialog()}
        title="Start work on this request?"
        description="The request will move to In progress and the requester will see the update."
        confirmLabel="Start work"
        isPending={statusMutation.isPending}
        onConfirm={() => changeStatus("in-progress")}
      />
      <ConfirmDialog
        open={dialog === "cancel"}
        onOpenChange={(open) => !open && closeDialog()}
        title="Cancel this request?"
        description="A cancelled request cannot be reopened."
        confirmLabel="Cancel request"
        destructive
        isPending={statusMutation.isPending}
        onConfirm={() => changeStatus("cancelled")}
      />
      <CompletionNoteDialog
        open={dialog === "complete"}
        onOpenChange={(open) => !open && closeDialog()}
        isPending={statusMutation.isPending}
        onSubmit={(completionNote) =>
          statusMutation.mutate({ status: "completed", completionNote }, { onSuccess: closeDialog })
        }
      />
      {canAssign && (
        <AssignOfficerDialog
          request={request}
          open={dialog === "assign"}
          onOpenChange={(open) => !open && closeDialog()}
        />
      )}
    </>
  );
}
