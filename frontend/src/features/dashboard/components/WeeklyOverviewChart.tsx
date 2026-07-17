// ─────────────────────────────────────────────────────────────────────────────
// WeeklyOverviewChart
// Area chart of completed tasks over the week. Data comes via props.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import type { WeeklyOverviewPoint } from "../types/dashboard";

interface WeeklyOverviewChartProps {
  data: WeeklyOverviewPoint[];
}

export default function WeeklyOverviewChart({ data }: WeeklyOverviewChartProps) {
  return (
    <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-slate-900">Weekly Tasks Overview</h3>
        <select className="text-xs border border-slate-200 rounded p-1 text-slate-600 bg-slate-50 outline-none">
          <option>Last 7 Days</option>
          <option>This Month</option>
        </select>
      </div>
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="dashGradCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748B" }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748B" }} />
            <RechartsTooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0", boxShadow: "0 4px 6px -1px rgba(0,0,0,.1)" }} labelStyle={{ fontWeight: "bold", color: "#0F172A", marginBottom: "4px" }} />
            <Area type="monotone" dataKey="completed" name="Completed Tasks" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#dashGradCompleted)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
