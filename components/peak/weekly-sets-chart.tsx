"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";

type Row = { muscle: string; sets: number; mev: number; mav: number; mrv: number };

export function WeeklySetsChart({ data }: { data: Row[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="hsl(var(--outline-variant) / 0.4)" strokeDasharray="3 6" />
          <XAxis
            dataKey="muscle"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval={0}
            angle={-30}
            textAnchor="end"
            height={50}
          />
          <YAxis
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={28}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--surface-container-high))",
              border: "1px solid hsl(var(--outline-variant))",
              borderRadius: 12,
              color: "hsl(var(--foreground))",
            }}
            formatter={(v: number, name: string) => [v, name]}
          />
          <Bar dataKey="sets" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
