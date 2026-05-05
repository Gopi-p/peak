"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Point = { weekStart: string; volume: number; sessions: number };

export function VolumeTrendChart({
  points,
  bodyWeightKg,
}: {
  points: Point[];
  bodyWeightKg: number | null;
}) {
  if (points.length === 0)
    return <p className="text-muted-foreground text-sm">Not enough sessions yet.</p>;
  const enriched = points.map((p) => ({ ...p, bw: bodyWeightKg }));
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer>
        <ComposedChart data={enriched} margin={{ top: 12, right: 0, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.55} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="hsl(var(--outline-variant) / 0.4)" strokeDasharray="3 6" />
          <XAxis
            dataKey="weekStart"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          />
          <YAxis
            yAxisId="vol"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={42}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--surface-container-high))",
              border: "1px solid hsl(var(--outline-variant))",
              borderRadius: 12,
              color: "hsl(var(--foreground))",
            }}
          />
          <Area
            yAxisId="vol"
            type="monotone"
            dataKey="volume"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill="url(#volGrad)"
          />
          {bodyWeightKg && (
            <Line
              yAxisId="vol"
              type="monotone"
              dataKey="bw"
              stroke="hsl(var(--tertiary))"
              strokeDasharray="3 3"
              strokeWidth={1.5}
              dot={false}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
