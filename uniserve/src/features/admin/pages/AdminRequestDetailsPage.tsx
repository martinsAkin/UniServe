import { useParams } from "@tanstack/react-router";
import { RequestDetailsView } from "@/features/requests/components/RequestDetailsView";
import { useAdminRequest, useRequestHistory } from "../hooks/useAdmin";

export function AdminRequestDetailsPage() {
  const { id } = useParams({ from: "/admin/requests/$id" });
  const query = useAdminRequest(id);
  const history = useRequestHistory(id);

  return (
    <RequestDetailsView
      query={query}
      history={history}
      backTo="/admin/requests"
      breadcrumbs={[{ label: "Maintenance requests", to: "/admin/requests" }]}
    />
  );
}
