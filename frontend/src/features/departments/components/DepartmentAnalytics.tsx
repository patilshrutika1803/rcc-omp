// ─────────────────────────────────────────────────────────────────────────────
// DepartmentAnalytics
// Extracted from the original DeptAnalyticsTab in the monolithic
// DepartmentsPage.tsx. UI/behavior unchanged.
//
// NOTE: Not wired into the exported DepartmentsPage in the original file.
// Preserved here, unused-but-available, to avoid removing any feature.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import type { DepartmentAnalyticsMonthly } from "../types/department";
import {
  ProductivityTrendChart,
  PerformanceComparisonChart,
  MachineUtilizationChart,
} from "./DepartmentCharts";

export interface DepartmentAnalyticsSummaryKPI {
  label: string;
  value: string;
  trend: string;
  color: string;
}

export interface EmployeeUtilizationEntry {
  name: string;
  workload: number;
}

export interface DepartmentAnalyticsProps {
  summaryKpis: DepartmentAnalyticsSummaryKPI[];
  monthlyAnalytics: DepartmentAnalyticsMonthly[];
  performanceComparison: { name: string; score: number; employees: number }[];
  employeeUtilization: EmployeeUtilizationEntry[];
}

export default function DepartmentAnalytics({
  summaryKpis,
  monthlyAnalytics,
  performanceComparison,
  employeeUtilization,
}: DepartmentAnalyticsProps) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryKpis.map((kpi, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{kpi.label}</div>
            <div className={`text-2xl font-bold ${kpi.color} mb-1`}>{kpi.value}</div>
            <div className={`text-[11px] font-semibold ${kpi.trend.startsWith("↑") ? "text-emerald-500" : "text-red-500"}`}>
              {kpi.trend} MoM
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <ProductivityTrendChart data={monthlyAnalytics} />
        <PerformanceComparisonChart data={performanceComparison} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <MachineUtilizationChart data={monthlyAnalytics} />

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Employee Utilization</h3>
          {employeeUtilization.length === 0 ? (
            <div className="text-xs text-slate-400 text-center py-8">No data available</div>
          ) : (
            <div className="space-y-2.5">
              {employeeUtilization.map((e, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-20 text-[10px] font-semibold text-slate-600 truncate">{e.name}</div>
                  <div className="flex-1 bg-slate-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${e.workload >= 85 ? "bg-red-500" : e.workload >= 70 ? "bg-amber-500" : "bg-blue-500"}`}
                      style={{ width: `${e.workload}%` }}
                    />
                  </div>
                  <span
                    className={`text-[10px] font-bold w-9 text-right ${
                      e.workload >= 85 ? "text-red-600" : e.workload >= 70 ? "text-amber-600" : "text-blue-600"
                    }`}
                  >
                    {e.workload}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
