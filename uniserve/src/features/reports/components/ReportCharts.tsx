import { format, startOfMonth, differenceInCalendarDays } from "date-fns";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { STATUS_CHART_COLORS } from "@/lib/status-colors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { REQUEST_STATUSES, STATUS_LABELS } from "@/lib/constants";
import { countByStatus } from "@/utils/request-stats";
import type { MaintenanceRequest } from "@/types/domain";

const CHART_HEIGHT = 260;
const GRID = "#e2e8f0";

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <p className="text-xs text-ink-muted">{description}</p>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function buildTimeSeries(requests: MaintenanceRequest[]) {
  if (requests.length === 0) return { data: [], unit: "day" as const };
  const times = requests.map((request) => new Date(request.createdAt).getTime());
  const spanDays = differenceInCalendarDays(
    new Date(Math.max(...times)),
    new Date(Math.min(...times)),
  );
  const unit = spanDays > 62 ? ("month" as const) : ("day" as const);

  const buckets = new Map<string, { sort: number; label: string; count: number }>();
  for (const request of requests) {
    const created = new Date(request.createdAt);
    const bucketDate = unit === "month" ? startOfMonth(created) : created;
    const key = format(bucketDate, unit === "month" ? "yyyy-MM" : "yyyy-MM-dd");
    const entry = buckets.get(key) ?? {
      sort: bucketDate.getTime(),
      label: format(bucketDate, unit === "month" ? "MMM yyyy" : "d MMM"),
      count: 0,
    };
    entry.count += 1;
    buckets.set(key, entry);
  }
  return {
    data: [...buckets.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, value]) => value),
    unit,
  };
}

function buildOfficerSeries(requests: MaintenanceRequest[]) {
  const rows = new Map<string, Record<string, string | number>>();
  for (const request of requests) {
    const name = request.assignedOfficer?.username ?? "Unassigned";
    const row = rows.get(name) ?? {
      name,
      total: 0,
      ...Object.fromEntries(REQUEST_STATUSES.map((s) => [s, 0])),
    };
    row[request.status] = (row[request.status] as number) + 1;
    row.total = (row.total as number) + 1;
    rows.set(name, row);
  }
  return [...rows.values()].sort((a, b) => (b.total as number) - (a.total as number));
}

export function ReportCharts({ requests }: { requests: MaintenanceRequest[] }) {
  const counts = useMemo(() => countByStatus(requests), [requests]);
  const statusData = REQUEST_STATUSES.map((status) => ({
    status,
    name: STATUS_LABELS[status],
    value: counts[status],
  }));
  const timeSeries = useMemo(() => buildTimeSeries(requests), [requests]);
  const officerData = useMemo(() => buildOfficerSeries(requests), [requests]);
  const resolutionData = [
    { name: "Completed", value: counts.completed, color: STATUS_CHART_COLORS.completed },
    {
      name: "Unresolved",
      value: counts.active + counts["in-progress"],
      color: STATUS_CHART_COLORS.active,
    },
  ].filter((entry) => entry.value > 0);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ChartCard title="Requests by status">
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <BarChart data={statusData}>
            <CartesianGrid vertical={false} stroke={GRID} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              fontSize={12}
              width={32}
            />
            <Tooltip cursor={{ fill: "#f1f5f9" }} />
            <Bar dataKey="value" name="Requests" radius={[6, 6, 0, 0]}>
              {statusData.map((entry) => (
                <Cell key={entry.status} fill={STATUS_CHART_COLORS[entry.status]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Requests over time" description={`Submitted per ${timeSeries.unit}`}>
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <LineChart data={timeSeries.data}>
            <CartesianGrid vertical={false} stroke={GRID} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              fontSize={12}
              width={32}
            />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="count"
              name="Requests"
              stroke="#1d4ed8"
              strokeWidth={2.5}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Requests by maintenance officer">
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <BarChart data={officerData} layout="vertical" margin={{ left: 8 }}>
            <CartesianGrid horizontal={false} stroke={GRID} />
            <XAxis
              type="number"
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              fontSize={12}
            />
            <YAxis
              type="category"
              dataKey="name"
              tickLine={false}
              axisLine={false}
              fontSize={12}
              width={96}
            />
            <Tooltip cursor={{ fill: "#f1f5f9" }} />
            <Legend iconType="circle" />
            {REQUEST_STATUSES.map((status) => (
              <Bar
                key={status}
                dataKey={status}
                name={STATUS_LABELS[status]}
                stackId="officer"
                fill={STATUS_CHART_COLORS[status]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Completed vs unresolved" description="Cancelled requests are excluded">
        {resolutionData.length === 0 ? (
          <p className="py-16 text-center text-sm text-ink-soft">
            No completed or open requests in this range.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <PieChart>
              <Pie
                data={resolutionData}
                dataKey="value"
                nameKey="name"
                innerRadius="58%"
                outerRadius="85%"
                paddingAngle={2}
              >
                {resolutionData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
}
