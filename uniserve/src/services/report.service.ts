import { adminService } from "./admin.service";
import type { MaintenanceRequest, RequestStatus } from "@/types/domain";

export interface ReportFilters {
  status?: RequestStatus;
  officerId?: string;
  startDate?: string;
  endDate?: string;
}

const PAGE_SIZE = 100;

function isWithinRange(request: MaintenanceRequest, { startDate, endDate }: ReportFilters) {
  const created = new Date(request.createdAt).getTime();
  if (startDate && created < new Date(`${startDate}T00:00:00`).getTime()) return false;
  if (endDate && created > new Date(`${endDate}T23:59:59.999`).getTime()) return false;
  return true;
}

export const reportService = {
  /**
   * No reporting endpoint exists yet (GET /admin/reports/requests). Reports are built from
   * the real records of GET /admin/requests. Status and officer filters are applied server-side;
   * the date range is applied client-side because the API has no date parameters.
   */
  async getRequestRecords(filters: ReportFilters): Promise<MaintenanceRequest[]> {
    const fetchPage = (page: number) =>
      adminService.listRequests({
        page,
        limit: PAGE_SIZE,
        status: filters.status,
        officerId: filters.officerId,
        sort: "oldest",
      });

    const first = await fetchPage(1);
    const records: MaintenanceRequest[] = [...first.requests];

    for (let page = 2; page <= first.pagination.totalPages; page += 1) {
      records.push(...(await fetchPage(page)).requests);
    }

    return records.filter((request) => isWithinRange(request, filters));
  },
};
