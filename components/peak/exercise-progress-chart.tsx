"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type Point = { date: string; topWeight: number; e1rm: number };

export function ExerciseProgressChart({ points }: { points: Point[] }) {
  if (points.length === 0) {
    return <p className="text-muted-foreground text-sm">Not enough data yet.</p>;
  }
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
          <Line
            type="monotone"
            dataKey="e1rm"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ r: 3, fill: "hsl(var(--primary))" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
