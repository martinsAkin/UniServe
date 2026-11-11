import { useState } from "react";
import { RoleBadge } from "@/components/shared/RoleBadge";
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
import { ROLE_LABELS, USER_ROLES } from "@/lib/constants";
import type { ManagedUser, UserRole } from "@/types/domain";
import { useUpdateUserRole } from "../hooks/useUsers";

interface ChangeUserRoleDialogProps {
  user: ManagedUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ROLE_OPTIONS = Object.values(USER_ROLES);

export function ChangeUserRoleDialog({ user, open, onOpenChange }: ChangeUserRoleDialogProps) {
  const [nextRole, setNextRole] = useState<UserRole | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const mutation = useUpdateUserRole();

  const close = (next: boolean) => {
    if (mutation.isPending) return;
    if (!next) {
      setNextRole(null);
      setIsConfirming(false);
    }
    onOpenChange(next);
  };

  const confirm = () => {
    if (!nextRole) return;
    mutation.mutate({ userId: user._id, role: nextRole }, { onSuccess: () => close(false) });
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent>
        {!isConfirming || !nextRole ? (
          <>
            <DialogHeader>
              <DialogTitle>Change role</DialogTitle>
              <DialogDescription>Choose a new role for {user.username}.</DialogDescription>
            </DialogHeader>
            <div className="space-y-1.5">
              <Label htmlFor="role">New role</Label>
              <Select
                value={nextRole ?? ""}
                onValueChange={(value) => setNextRole(value as UserRole)}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((role) => (
                    <SelectItem key={role} value={role} disabled={role === user.role}>
                      {ROLE_LABELS[role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => close(false)}>
                Cancel
              </Button>
              <Button disabled={!nextRole} onClick={() => setIsConfirming(true)}>
                Continue
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Confirm role change</DialogTitle>
              <DialogDescription>
                This changes what {user.username} can see and do the next time they use the system.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-3 rounded-lg bg-canvas p-3">
              <RoleBadge role={user.role} />
              <span aria-hidden>→</span>
              <RoleBadge role={nextRole} />
            </div>
            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() => setIsConfirming(false)}
                disabled={mutation.isPending}
              >
                Back
              </Button>
              <Button onClick={confirm} loading={mutation.isPending}>
                Change role
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
