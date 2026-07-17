import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";
import { BKP_WEEKLY_TREND, BKP_WEEKLY_SUMMARY } from "../../constants/backupConstants";

export function SuccessRateChart() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
      {/* Success Rate Chart */}
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
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={BKP_WEEKLY_TREND} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748B" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748B" }} />
              <RechartsTooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0", fontSize: "12px" }} />
              <Bar dataKey="success" name="Success" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={36} />
              <Bar dataKey="failed"  name="Failed"  fill="#F87171" radius={[4, 4, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary stats */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex flex-col justify-between">
        <h3 className="text-sm font-bold text-slate-900 mb-4">7-Day Summary</h3>
        <div className="space-y-4 flex-1">
          {BKP_WEEKLY_SUMMARY.map(s => (
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
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="text-[11px] text-slate-500 mb-1">Overall Success Rate</div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-emerald-600">90.5%</span>
            <span className="text-xs text-emerald-500 font-semibold mb-1 flex items-center gap-0.5">
              <TrendingUp size={12} /> +2.1%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
