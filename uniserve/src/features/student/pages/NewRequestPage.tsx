import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { useForm, useWatch } from "react-hook-form";
import { FormField } from "@/components/shared/FormField";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { REQUEST_LIMITS } from "@/lib/constants";
import { useCreateRequest } from "@/features/requests/hooks/useRequests";
import {
  createRequestSchema,
  type CreateRequestValues,
} from "@/features/requests/schemas/request.schema";

export function NewRequestPage() {
  const navigate = useNavigate();
  const createRequest = useCreateRequest();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateRequestValues>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: { title: "", description: "", location: "" },
  });
  const descriptionLength = useWatch({ control, name: "description" }).length;

  const onSubmit = (values: CreateRequestValues) =>
    createRequest.mutate(values, {
      onSuccess: (request) =>
        void navigate({ to: "/student/requests/$id", params: { id: request._id } }),
    });

  return (
    <>
      <PageHeader
        title="Submit a request"
        description="Tell us what needs fixing and where. You can follow progress from your dashboard."
        breadcrumbs={[{ label: "My requests", to: "/student/requests" }, { label: "New request" }]}
      />
      <Card className="max-w-2xl">
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <FormField
              id="title"
              label="Title"
              error={errors.title?.message}
              hint="A short summary, e.g. “Broken ceiling light”."
            >
              <Input
                id="title"
                maxLength={REQUEST_LIMITS.title}
                aria-invalid={!!errors.title}
                {...register("title")}
              />
            </FormField>
            <FormField
              id="location"
              label="Location"
              error={errors.location?.message}
              hint="Building, floor and room, e.g. “Science Block, Room 204”."
            >
              <Input
                id="location"
                maxLength={REQUEST_LIMITS.location}
                aria-invalid={!!errors.location}
                {...register("location")}
              />
            </FormField>
            <FormField id="description" label="Description" error={errors.description?.message}>
              <Textarea
                id="description"
                rows={6}
                maxLength={REQUEST_LIMITS.description}
                aria-invalid={!!errors.description}
                {...register("description")}
              />
              <p className="text-right text-xs text-ink-muted">
                {descriptionLength}/{REQUEST_LIMITS.description}
              </p>
            </FormField>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => void navigate({ to: "/student/requests" })}
                disabled={createRequest.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" loading={createRequest.isPending}>
                Submit request
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
