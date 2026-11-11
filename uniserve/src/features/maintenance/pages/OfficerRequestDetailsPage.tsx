import { useParams } from "@tanstack/react-router";
import { RequestDetailsView } from "@/features/requests/components/RequestDetailsView";
import { useRequest } from "@/features/requests/hooks/useRequests";

export function OfficerRequestDetailsPage() {
  const { id } = useParams({ from: "/officer/requests/$id" });
  const query = useRequest(id);

  return (
    <RequestDetailsView
      query={query}
      backTo="/officer/requests"
      breadcrumbs={[{ label: "Assigned requests", to: "/officer/requests" }]}
    />
  );
}
