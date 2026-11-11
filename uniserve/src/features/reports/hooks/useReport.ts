import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { reportService, type ReportFilters } from "@/services/report.service";

export function useReport(filters: ReportFilters) {
  return useQuery({
    queryKey: queryKeys.admin.report(filters),
    queryFn: () => reportService.getRequestRecords(filters),
    placeholderData: keepPreviousData,
  });
}
