import { describe, expect, it } from "vitest";
import type { MaintenanceRequest } from "@/types/domain";
import { countByStatus } from "./request-stats";

const request = (status: MaintenanceRequest["status"]) => ({ status }) as MaintenanceRequest;

describe("countByStatus", () => {
  it("returns zero for every status when there are no requests", () => {
    expect(countByStatus([])).toEqual({ active: 0, "in-progress": 0, completed: 0, cancelled: 0 });
  });

  it("counts each status", () => {
    const counts = countByStatus([
      request("active"),
      request("active"),
      request("completed"),
      request("in-progress"),
    ]);
    expect(counts).toEqual({ active: 2, "in-progress": 1, completed: 1, cancelled: 0 });
  });
});
