// ─────────────────────────────────────────────────────────────────────────────
// MachineHealthAndProgress
// Two-up grid: Machine Health Summary card + Department Progress card.
// Data comes via props.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import type { MachineHealthSummary, DepartmentProgress } from "../types/dashboard";

interface MachineHealthAndProgressProps {
  machineHealth: MachineHealthSummary;
  departmentProgress: DepartmentProgress[];
}

export default function MachineHealthAndProgress({ machineHealth, departmentProgress }: MachineHealthAndProgressProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-sm font-bold text-slate-900">Machine Health Summary</h3>
          <button className="text-xs text-blue-600 font-semibold hover:underline">View All</button>
        </div>
        <div className="flex items-center justify-between mb-6">
          <div className="text-center flex-1 border-r border-slate-100">
            <div className="text-2xl font-bold text-emerald-600">{machineHealth.healthy}</div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-1 flex items-center justify-center gap-1"><CheckCircle2 size={12} /> Healthy</div>
          </div>
          <div className="text-center flex-1 border-r border-slate-100">
            <div className="text-2xl font-bold text-amber-500">{machineHealth.warning}</div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-1 flex items-center justify-center gap-1"><AlertTriangle size={12} /> Warning</div>
          </div>
          <div className="text-center flex-1">
            <div className="text-2xl font-bold text-red-600">{machineHealth.critical}</div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-1 flex items-center justify-center gap-1"><XCircle size={12} /> Critical</div>
          </div>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex items-start gap-3">
          <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
          <div>
            <div className="text-xs font-bold text-slate-900">{machineHealth.alertTitle}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{machineHealth.alertDesc}</div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
        <h3 className="text-sm font-bold text-slate-900 mb-5">Department Progress</h3>
        <div className="space-y-4">
          {departmentProgress.map((dept) => (
            <div key={dept.name}>
              <div className="flex justify-between items-end mb-1.5">
                <span className="text-xs font-semibold text-slate-700">{dept.name}</span>
                <span className="text-xs font-bold text-slate-900">{dept.pct}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className={`h-1.5 rounded-full ${dept.color}`} style={{ width: `${dept.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
