import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import type { QATrendPoint } from "../types/qa";
import { EmptyState } from "./EmptyState";

interface TrendChartProps {
  trendData: QATrendPoint[];
}

export function TrendChart({ trendData }: TrendChartProps) {
  return (
    <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900">QA Activity Trend</h3>
      </div>
      <div className="h-[250px]">
        {trendData.length === 0 ? (
          <EmptyState className="h-full flex flex-col items-center justify-center text-slate-400" iconSize={28} textClassName="text-xs font-medium" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748B" }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748B" }} allowDecimals={false} />
              <RechartsTooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0" }} />
              <Area type="monotone" dataKey="completed" stackId="1" stroke="#10B981" fill="#D1FAE5" />
              <Area type="monotone" dataKey="pending" stackId="1" stroke="#94A3B8" fill="#F1F5F9" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
