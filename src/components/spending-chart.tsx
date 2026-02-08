"use client";

import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import { useBills } from "@/lib/use-bills";

const CHART_HEIGHT = 100;

export function SpendingChart() {
  const { chartData } = useBills();

  return (
    <div className="px-5 -mb-2">
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <AreaChart
          data={chartData}
          margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.25} />
              <stop
                offset="100%"
                stopColor="var(--accent)"
                stopOpacity={0.02}
              />
            </linearGradient>
          </defs>
          <YAxis hide domain={[0, "dataMax + 1000"]} />
          <Area
            type="natural"
            dataKey="amount"
            stroke="var(--accent)"
            strokeWidth={2}
            fill="url(#spendGradient)"
            dot={false}
            activeDot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
