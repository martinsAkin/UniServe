import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { FormField } from "@/components/shared/FormField";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/input";
import { REQUEST_LIMITS } from "@/lib/constants";
import { completionNoteSchema, type CompletionNoteValues } from "../schemas/request.schema";

interface CompletionNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (completionNote: string) => void;
  isPending: boolean;
}

export function CompletionNoteDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending,
}: CompletionNoteDialogProps) {
  const [pendingNote, setPendingNote] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CompletionNoteValues>({
    resolver: zodResolver(completionNoteSchema),
    defaultValues: { completionNote: "" },
  });
  const length = useWatch({ control, name: "completionNote" }).length;

  const close = (next: boolean) => {
    if (isPending) return;
    if (!next) {
      setPendingNote(null);
      reset();
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent>
        {pendingNote === null ? (
          <form
            onSubmit={handleSubmit((values) => setPendingNote(values.completionNote.trim()))}
            noValidate
          >
            <DialogHeader>
              <DialogTitle>Complete this request</DialogTitle>
              <DialogDescription>
                Describe the work carried out. The requester and administrators will see this note.
              </DialogDescription>
            </DialogHeader>
            <FormField
              id="completionNote"
              label="Completion note"
              error={errors.completionNote?.message}
            >
              <Textarea
                id="completionNote"
                rows={5}
                maxLength={REQUEST_LIMITS.completionNote}
                aria-invalid={!!errors.completionNote}
                {...register("completionNote")}
              />
              <p className="text-right text-xs text-ink-muted">
                {length}/{REQUEST_LIMITS.completionNote}
              </p>
            </FormField>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => close(false)}>
                Cancel
              </Button>
              <Button type="submit">Continue</Button>
            </DialogFooter>
          </form>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Mark as completed?</DialogTitle>
              <DialogDescription>
                This closes the request and cannot be undone. Please check your note.
              </DialogDescription>
            </DialogHeader>
            <blockquote className="whitespace-pre-wrap break-words rounded-lg border border-line bg-canvas p-3 text-sm text-ink-soft">
              {pendingNote}
            </blockquote>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setPendingNote(null)} disabled={isPending}>
                Edit note
              </Button>
              <Button onClick={() => onSubmit(pendingNote)} loading={isPending}>
                Complete request
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
