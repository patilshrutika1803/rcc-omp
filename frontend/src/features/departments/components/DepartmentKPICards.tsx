// ─────────────────────────────────────────────────────────────────────────────
// DepartmentKPICards
// Extracted from the original DeptDashboardTab (top KPI row) and DeptDetailsTab
// (Monthly KPIs section) in the monolithic DepartmentsPage.tsx.
// UI/behavior unchanged.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { Layers, CheckCircle2, User, Server, AlertTriangle, TrendingUp } from "lucide-react";
import type { DepartmentDashboardStats, DepartmentKPI } from "../types/department";

export interface DashboardKPICardsProps {
  stats: DepartmentDashboardStats;
}

/** The 6-card KPI row shown at the top of the Dashboard tab */
export function DashboardKPICards({ stats }: DashboardKPICardsProps) {
  const cards = [
    { label: "Total Departments", val: stats.totalDepartments, icon: Layers, bg: "bg-blue-50", border: "border-blue-100", text: "text-blue-600", sub: "All divisions" },
    { label: "Active", val: stats.activeDepartments, icon: CheckCircle2, bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-600", sub: "Fully operational" },
    { label: "Total Employees", val: stats.totalEmployees, icon: User, bg: "bg-indigo-50", border: "border-indigo-100", text: "text-indigo-600", sub: "All headcount" },
    { label: "Active Machines", val: stats.activeMachines, icon: Server, bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-600", sub: "Running assets" },
    { label: "Open Tasks", val: stats.openTasks, icon: AlertTriangle, bg: "bg-amber-50", border: "border-amber-100", text: "text-amber-600", sub: "Pending actions" },
    { label: "Avg Performance", val: `${stats.avgPerformance}%`, icon: TrendingUp, bg: "bg-purple-50", border: "border-purple-100", text: "text-purple-600", sub: "Monthly score" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {cards.map((kpi, i) => (
        <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-tight">{kpi.label}</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${kpi.bg} border ${kpi.border}`}>
              <kpi.icon size={15} className={kpi.text} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mb-1">{kpi.val}</div>
          <div className="text-[11px] font-medium text-slate-400">{kpi.sub}</div>
        </div>
      ))}
    </div>
  );
}

export interface MonthlyKPIGridProps {
  kpis: DepartmentKPI[];
}

/** The Monthly KPIs grid shown in Department Details > KPIs section */
export function MonthlyKPIGrid({ kpis }: MonthlyKPIGridProps) {
  if (kpis.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4">Monthly KPIs</h3>
        <div className="text-xs text-slate-400 text-center py-8">No KPIs available</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4">Monthly KPIs</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-5 text-center">
            <div className="text-2xl font-bold text-slate-900 mb-1">{kpi.value}</div>
            <div className="text-xs font-semibold text-slate-600 mb-2">{kpi.label}</div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                kpi.trend === "up" ? "bg-emerald-50 text-emerald-600" : kpi.trend === "down" ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-500"
              }`}
            >
              {kpi.trend === "up" ? "↑ Improving" : kpi.trend === "down" ? "↓ Declining" : "→ Stable"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DashboardKPICards;
