import React from "react";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { BKP_TYPE_MIX, BKP_TYPE_MIX_BARS } from "../../constants/backupConstants";

export function BackupTypeChart() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
      <h3 className="text-sm font-bold text-slate-900 mb-4">Backup Type Mix</h3>
      <div className="h-[140px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={BKP_TYPE_MIX}
              innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="value"
            >
              {BKP_TYPE_MIX.map((entry, index) => (
                <Cell key={`bkp-type-cell-${entry.name}-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <RechartsTooltip cursor={false} contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-bold text-slate-900">10</span>
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Jobs</span>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {BKP_TYPE_MIX_BARS.map(d => (
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
