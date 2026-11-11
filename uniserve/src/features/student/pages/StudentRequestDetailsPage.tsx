import { useParams } from "@tanstack/react-router";
import { RequestDetailsView } from "@/features/requests/components/RequestDetailsView";
import { useRequest } from "@/features/requests/hooks/useRequests";

export function StudentRequestDetailsPage() {
  const { id } = useParams({ from: "/student/requests/$id" });
  const query = useRequest(id);

  return (
    <RequestDetailsView
      query={query}
      backTo="/student/requests"
      breadcrumbs={[{ label: "My requests", to: "/student/requests" }]}
    />
  );
}
