import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import type { WeeklyTrendPoint } from "../../types/backup";

export function SuccessRateChart({ weeklyTrend }: { weeklyTrend: WeeklyTrendPoint[] }) {
  const totalSuccess = weeklyTrend.reduce((s, d) => s + (d.success ?? 0), 0);
  const totalFailed = weeklyTrend.reduce((s, d) => s + (d.failed ?? 0), 0);
  const totalJobs = totalSuccess + totalFailed;
  const successRate = totalJobs > 0 ? ((totalSuccess / totalJobs) * 100).toFixed(1) : null;

  const summary = totalJobs > 0 ? [
    { label: "Total Jobs Run", value: String(totalJobs), color: "text-slate-900", bar: "bg-blue-500", pct: 100 },
    { label: "Successful", value: String(totalSuccess), color: "text-emerald-700", bar: "bg-emerald-500", pct: totalJobs > 0 ? Math.round((totalSuccess / totalJobs) * 100) : 0 },
    { label: "Failed", value: String(totalFailed), color: "text-red-600", bar: "bg-red-400", pct: totalJobs > 0 ? Math.round((totalFailed / totalJobs) * 100) : 0 },
  ] : [];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
      <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Backup Success Rate</h3>
            <p className="text-xs text-slate-500 mt-0.5">Daily successful vs failed jobs — last 7 days</p>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /> Success</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-400 inline-block" /> Failed</span>
          </div>
        </div>
        <div className="h-[220px]">
          {weeklyTrend.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">No data available</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748B" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748B" }} />
                <RechartsTooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0", fontSize: "12px" }} />
                <Bar dataKey="success" name="Success" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={36} />
                <Bar dataKey="failed"  name="Failed"  fill="#F87171" radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex flex-col justify-between">
        <h3 className="text-sm font-bold text-slate-900 mb-4">7-Day Summary</h3>
        {summary.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-xs text-slate-400">No data available</div>
        ) : (
          <div className="space-y-4 flex-1">
            {summary.map(s => (
              <div key={s.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-600">{s.label}</span>
                  <span className={`font-bold ${s.color}`}>{s.value}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full ${s.bar}`} style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="text-[11px] text-slate-500 mb-1">Overall Success Rate</div>
          {successRate !== null ? (
            <div className="text-3xl font-bold text-emerald-600">{successRate}%</div>
          ) : (
            <div className="text-sm text-slate-400">No data available</div>
          )}
        </div>
      </div>
    </div>
  );
}
