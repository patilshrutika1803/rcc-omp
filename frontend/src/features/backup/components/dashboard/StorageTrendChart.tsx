import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { BKP_STORAGE_TREND } from "../../constants/backupConstants";

export function StorageTrendChart() {
  return (
    <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Storage Usage Trend</h3>
          <p className="text-xs text-slate-500 mt-0.5">Monthly backup storage consumed (GB)</p>
        </div>
        <span className="text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
          2,000 GB Capacity
        </span>
      </div>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={BKP_STORAGE_TREND} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="bkpGradStorage" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#2563EB" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0}    />
              </linearGradient>
              <linearGradient id="bkpGradCapacity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#94A3B8" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#94A3B8" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748B" }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748B" }} />
            <RechartsTooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0", fontSize: "12px" }} formatter={(v: any) => [`${v} GB`]} />
            <Area type="monotone" dataKey="capacity" name="Capacity" stroke="#CBD5E1" strokeWidth={1.5} strokeDasharray="5 3" fill="url(#bkpGradCapacity)" />
            <Area type="monotone" dataKey="used"     name="Used"     stroke="#2563EB" strokeWidth={2}   fill="url(#bkpGradStorage)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
