import { format } from "date-fns";
import { STATUS_LABELS } from "@/lib/constants";
import { downloadCsv, toCsv } from "@/utils/csv";
import type { ReportFilters } from "@/services/report.service";
import type { MaintenanceRequest } from "@/types/domain";

const HEADERS = [
  "Request ID",
  "Title",
  "Description",
  "Location",
  "Requester",
  "Requester email",
  "Assigned officer",
  "Status",
  "Created",
  "Completed",
  "Completion note",
];

const iso = (value: string) => new Date(value).toISOString();

export function exportRequestsCsv(requests: MaintenanceRequest[], filters: ReportFilters) {
  const rows = requests.map((request) => [
    request._id,
    request.title,
    request.description,
    request.location,
    request.author.username,
    request.author.email,
    request.assignedOfficer?.username,
    STATUS_LABELS[request.status],
    iso(request.createdAt),
    // A completed request cannot be modified afterwards, so its last update is its completion time.
    request.status === "completed" ? iso(request.updatedAt) : "",
    request.completionNote,
  ]);

  const parts = [
    "uniserve-requests",
    filters.status,
    filters.startDate && `from-${filters.startDate}`,
    filters.endDate && `to-${filters.endDate}`,
    format(new Date(), "yyyyMMdd-HHmm"),
  ].filter(Boolean);

  downloadCsv(`${parts.join("_")}.csv`, toCsv(HEADERS, rows));
}
