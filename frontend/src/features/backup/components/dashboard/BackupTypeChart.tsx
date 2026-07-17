import React from "react";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import type { BackupJob } from "../../types/backup";

const TYPE_COLORS: Record<string, string> = {
  Full: "#3B82F6",
  Incremental: "#8B5CF6",
  Differential: "#6366F1",
  Snapshot: "#14B8A6",
};
const TYPE_BAR_COLORS: Record<string, string> = {
  Full: "bg-blue-500",
  Incremental: "bg-purple-500",
  Differential: "bg-indigo-500",
  Snapshot: "bg-teal-500",
};

export function BackupTypeChart({ jobs }: { jobs: BackupJob[] }) {
  const counts: Record<string, number> = {};
  for (const j of jobs) counts[j.backupType] = (counts[j.backupType] ?? 0) + 1;
  const total = jobs.length;
  const data = Object.entries(counts).map(([name, value]) => ({ name, value, color: TYPE_COLORS[name] ?? "#94A3B8" }));
  const bars = data.map(d => ({ name: d.name, pct: total > 0 ? Math.round((d.value / total) * 100) : 0, color: TYPE_BAR_COLORS[d.name] ?? "bg-slate-400" }));

  if (total === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex flex-col items-center justify-center min-h-[220px]">
        <h3 className="text-sm font-bold text-slate-900 mb-2">Backup Type Mix</h3>
        <p className="text-xs text-slate-400">No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
      <h3 className="text-sm font-bold text-slate-900 mb-4">Backup Type Mix</h3>
      <div className="h-[140px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="value">
              {data.map((entry, index) => (
                <Cell key={`bkp-type-cell-${entry.name}-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <RechartsTooltip cursor={false} contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-bold text-slate-900">{total}</span>
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Jobs</span>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {bars.map(d => (
          <div key={d.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-sm ${d.color}`} />
              <span className="text-slate-600 font-medium">{d.name}</span>
            </div>
            <span className="font-bold text-slate-800">{d.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
