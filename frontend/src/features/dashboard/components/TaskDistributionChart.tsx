// ─────────────────────────────────────────────────────────────────────────────
// TaskDistributionChart
// Donut chart of task distribution by category. Data comes via props.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import type { TaskDistributionSlice } from "../types/dashboard";

interface TaskDistributionChartProps {
  data: TaskDistributionSlice[];
  total: number;
}

export default function TaskDistributionChart({ data, total }: TaskDistributionChartProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
      <h3 className="text-sm font-bold text-slate-900 mb-4">Task Distribution</h3>
      <div className="h-[160px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} innerRadius={55} outerRadius={75} paddingAngle={2} dataKey="value">
              {data.map((entry, index) => (
                <Cell key={`dash-dist-cell-${entry.name}-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <RechartsTooltip cursor={false} contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-slate-900">{total}</span>
          <span className="text-[10px] text-slate-500 uppercase font-semibold">Total</span>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {data.map((d) => (
          <div key={d.name} className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: d.color }} />
              <span className="text-slate-600 font-medium">{d.name}</span>
            </div>
            <span className="font-bold text-slate-900">{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
