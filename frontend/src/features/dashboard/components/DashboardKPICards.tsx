// ─────────────────────────────────────────────────────────────────────────────
// DashboardKPICards
// Top row of KPI stat cards. Receives data via props - no mock data inside.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import type { DashboardKPI } from "../types/dashboard";

interface DashboardKPICardsProps {
  kpis: DashboardKPI[];
}

export default function DashboardKPICards({ kpis }: DashboardKPICardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {kpis.map((kpi, i) => (
        <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{kpi.label}</span>
            <div className={`w-7 h-7 rounded-md flex items-center justify-center ${kpi.bg} ${kpi.border} border`}>
              <kpi.icon size={14} className={kpi.color} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight mt-1">{kpi.val}</div>
        </div>
      ))}
    </div>
  );
}
