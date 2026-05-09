"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Row = { muscle: string; sets: number; mev: number; mav: number; mrv: number };

/**
 * Horizontal bar chart — one row per muscle group. Vertical layout broke on
 * narrow phones because 12 rotated tick labels overflowed the chart height.
 * Bar color shifts amber/green/red depending on which volume zone (MEV / MAV
 * / MRV) the week's set count lands in, so the chart doubles as a quick
 * "are you in the productive range?" check.
 */
export function WeeklySetsChart({ data }: { data: Row[] }) {
  const max = Math.max(...data.map((r) => Math.max(r.sets, r.mrv)), 8);
  return (
    <div className="w-full" style={{ height: data.length * 28 + 24 }}>
      <ResponsiveContainer>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 4, right: 12, left: 0, bottom: 0 }}
          barCategoryGap={4}
        >
          <CartesianGrid
            stroke="hsl(var(--outline-variant) / 0.4)"
            strokeDasharray="3 6"
            horizontal={false}
          />
          <XAxis
            type="number"
            domain={[0, Math.ceil(max / 4) * 4]}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="muscle"
            width={72}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval={0}
          />
          <Tooltip
            cursor={{ fill: "hsl(var(--surface-high) / 0.4)" }}
            contentStyle={{
              background: "hsl(var(--surface-container-high))",
              border: "1px solid hsl(var(--outline-variant))",
              borderRadius: 12,
              color: "hsl(var(--foreground))",
            }}
            formatter={(v: number, _name: string, item: any) => {
              const r = item.payload as Row;
              return [`${v} sets · MEV ${r.mev} / MAV ${r.mav} / MRV ${r.mrv}`, r.muscle];
            }}
          />
          <Bar dataKey="sets" radius={[0, 4, 4, 0]}>
            {data.map((r, i) => (
              <Cell key={i} fill={zoneColor(r)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function zoneColor(r: Row): string {
  if (r.sets >= r.mrv) return "hsl(var(--destructive))";
  if (r.sets >= r.mev) return "hsl(var(--primary))";
  if (r.sets > 0) return "hsl(var(--tertiary))";
  return "hsl(var(--surface-bright))";
}
