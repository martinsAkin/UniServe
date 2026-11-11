import { useState } from "react";
import { ErrorState } from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useOfficers, useOfficerWorkload } from "@/features/admin/hooks/useAdmin";
import type { MaintenanceRequest } from "@/types/domain";
import { useAssignOfficer } from "../hooks/useRequests";

interface AssignOfficerDialogProps {
  request: MaintenanceRequest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssignOfficerDialog({ request, open, onOpenChange }: AssignOfficerDialogProps) {
  const [officerId, setOfficerId] = useState<string>("");
  const officers = useOfficers();
  const workload = useOfficerWorkload();
  const assign = useAssignOfficer(request._id);
  const isReassign = request.assignedOfficer !== null;
  const openCountFor = (id: string) => {
    const entry = workload.data?.find((item) => item.officerId === id);
    return entry ? entry.active + entry.inProgress : 0;
  };

  const handleOpenChange = (next: boolean) => {
    if (assign.isPending) return;
    if (!next) setOfficerId("");
    onOpenChange(next);
  };

  const submit = () => assign.mutate({ officerId }, { onSuccess: () => handleOpenChange(false) });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isReassign ? "Reassign officer" : "Assign officer"}</DialogTitle>
          <DialogDescription>
            {isReassign
              ? `Currently assigned to ${request.assignedOfficer?.username}. Choose a different officer.`
              : "Choose the maintenance officer who will handle this request."}
          </DialogDescription>
        </DialogHeader>

        {officers.isPending ? (
          <Skeleton className="h-10 w-full" />
        ) : officers.isError ? (
          <ErrorState error={officers.error} onRetry={() => void officers.refetch()} />
        ) : officers.data.length === 0 ? (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            There are no active maintenance officers. Promote a user to the officer role in User
            Management first.
          </p>
        ) : (
          <div className="space-y-1.5">
            <Label htmlFor="officer">Maintenance officer</Label>
            <Select value={officerId} onValueChange={setOfficerId}>
              <SelectTrigger id="officer">
                <SelectValue placeholder="Select an officer" />
              </SelectTrigger>
              <SelectContent>
                {officers.data.map((officer) => (
                  <SelectItem
                    key={officer._id}
                    value={officer._id}
                    disabled={officer._id === request.assignedOfficer?._id}
                  >
                    {officer.username} · {openCountFor(officer._id)} open
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => handleOpenChange(false)}
            disabled={assign.isPending}
          >
            Cancel
          </Button>
          <Button onClick={submit} disabled={!officerId} loading={assign.isPending}>
            {isReassign ? "Reassign" : "Assign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
