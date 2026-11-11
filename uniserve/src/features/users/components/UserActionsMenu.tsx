import { Eye, MoreHorizontal, ShieldCheck, UserCheck, UserX } from "lucide-react";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthenticatedUser } from "@/features/auth/hooks/useAuth";
import { BACKEND_CAPABILITIES } from "@/lib/constants";
import type { ManagedUser } from "@/types/domain";
import { useUpdateUserStatus } from "../hooks/useUsers";
import { ChangeUserRoleDialog } from "./ChangeUserRoleDialog";

interface UserActionsMenuProps {
  user: ManagedUser;
  showViewLink?: boolean;
}

export function UserActionsMenu({ user, showViewLink = true }: UserActionsMenuProps) {
  const currentUser = useAuthenticatedUser();
  const [dialog, setDialog] = useState<"role" | "status" | null>(null);
  const statusMutation = useUpdateUserStatus();

  const isSelf = user._id === currentUser.id;
  const isActive = user.isActive !== false;
  const statusAvailable = BACKEND_CAPABILITIES.userStatusUpdate;
  const statusDisabled = isSelf || !statusAvailable;
  const statusNote = isSelf
    ? "You cannot deactivate your own account"
    : !statusAvailable
      ? "Not available: backend endpoint pending"
      : null;

  const StatusIcon = isActive ? UserX : UserCheck;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Actions for ${user.username}`}>
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {showViewLink && (
            <>
              <DropdownMenuItem asChild>
                <Link to="/admin/users/$id" params={{ id: user._id }}>
                  <Eye className="size-4" aria-hidden /> View details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem disabled={isSelf} onSelect={() => setDialog("role")}>
            <ShieldCheck className="size-4" aria-hidden />
            <span className="flex flex-col">
              Change role
              {isSelf && (
                <span className="text-xs text-ink-muted">You cannot change your own role</span>
              )}
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem disabled={statusDisabled} onSelect={() => setDialog("status")}>
            <StatusIcon className="size-4" aria-hidden />
            <span className="flex flex-col">
              {isActive ? "Deactivate account" : "Activate account"}
              {statusNote && <span className="text-xs text-ink-muted">{statusNote}</span>}
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ChangeUserRoleDialog
        user={user}
        open={dialog === "role"}
        onOpenChange={(open) => !open && setDialog(null)}
      />
      <ConfirmDialog
        open={dialog === "status"}
        onOpenChange={(open) => !open && setDialog(null)}
        title={isActive ? `Deactivate ${user.username}?` : `Activate ${user.username}?`}
        description={
          isActive
            ? "They will be signed out and unable to use UniServe until an administrator reactivates the account."
            : "They will be able to sign in and use UniServe again."
        }
        confirmLabel={isActive ? "Deactivate" : "Activate"}
        destructive={isActive}
        isPending={statusMutation.isPending}
        onConfirm={() =>
          statusMutation.mutate(
            { userId: user._id, isActive: !isActive },
            { onSuccess: () => setDialog(null) },
          )
        }
      />
    </>
  );
}
