import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { STATUS_CHART_COLORS } from "@/lib/status-colors";
import { REQUEST_STATUSES, STATUS_LABELS } from "@/lib/constants";
import type { StatusCounts } from "@/types/domain";

export function StatusDistributionChart({
  counts,
  height = 260,
}: {
  counts: StatusCounts;
  height?: number;
}) {
  const data = REQUEST_STATUSES.map((status) => ({
    status,
    name: STATUS_LABELS[status],
    value: counts[status],
  })).filter((entry) => entry.value > 0);

  if (data.length === 0) {
    return <p className="py-16 text-center text-sm text-ink-soft">No requests to chart yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius="58%"
          outerRadius="85%"
          paddingAngle={2}
        >
          {data.map((entry) => (
            <Cell key={entry.status} fill={STATUS_CHART_COLORS[entry.status]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend verticalAlign="bottom" iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  );
}
