"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function BodyWeightChart({ points }: { points: { date: string; kg: number }[] }) {
  if (points.length === 0)
    return <p className="text-muted-foreground text-sm">No body weight logged yet.</p>;
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer>
        <LineChart data={points} margin={{ top: 12, right: 0, left: -16, bottom: 0 }}>
          <CartesianGrid stroke="hsl(var(--outline-variant) / 0.4)" strokeDasharray="3 6" />
          <XAxis
            dataKey="date"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) =>
              new Date(v).toLocaleDateString(undefined, { month: "short", day: "numeric" })
            }
          />
          <YAxis
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            domain={["dataMin - 1", "dataMax + 1"]}
            width={36}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--surface-container-high))",
              border: "1px solid hsl(var(--outline-variant))",
              borderRadius: 12,
              color: "hsl(var(--foreground))",
            }}
          />
          <Line type="monotone" dataKey="kg" stroke="hsl(var(--tertiary))" strokeWidth={2} dot={{ r: 2 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
