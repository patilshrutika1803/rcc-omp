import React from "react";
import type { LucideIcon } from "lucide-react";

export interface KPICardData {
  label: string;
  val: number;
  icon: LucideIcon;
  bg: string;
  border: string;
  text: string;
  sub: string;
  subColor: string;
}

export function KPICard({ kpi }: { kpi: KPICardData }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-tight">{kpi.label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${kpi.bg} border ${kpi.border}`}>
          <kpi.icon size={15} className={kpi.text} />
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-900 mb-1">{kpi.val}</div>
      <div className={`text-[11px] font-medium ${kpi.subColor}`}>{kpi.sub}</div>
    </div>
  );
}

export default KPICard;
