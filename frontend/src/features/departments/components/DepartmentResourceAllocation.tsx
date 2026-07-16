// ─────────────────────────────────────────────────────────────────────────────
// DepartmentResourceAllocation
// Extracted from the original ResourceAllocationTab in the monolithic
// DepartmentsPage.tsx. UI/behavior unchanged.
//
// NOTE: Not wired into the exported DepartmentsPage in the original file.
// Preserved here, unused-but-available, to avoid removing any feature.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { AlertTriangle, Calendar as CalendarIcon } from "lucide-react";
import type { ResourceConflict } from "../types/department";
import { ResourceUtilizationChart } from "./DepartmentCharts";

export interface DepartmentUsageEntry {
  dept: string;
  fullDept: string;
  users: number;
  available: number;
  busy: number;
  machines: number;
  openCapacity: number;
}

export interface ResourceAllocationSummaryKPI {
  label: string;
  val: number;
  color: string;
}

export interface DepartmentResourceAllocationProps {
  summaryKpis: ResourceAllocationSummaryKPI[];
  departmentUsage: DepartmentUsageEntry[];
  conflicts: ResourceConflict[];
}

export default function DepartmentResourceAllocation({
  summaryKpis,
  departmentUsage,
  conflicts,
}: DepartmentResourceAllocationProps) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryKpis.map((kpi, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{kpi.label}</div>
            <div className={`text-3xl font-bold ${kpi.color}`}>{kpi.val}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Users by Department</h3>
          {departmentUsage.length === 0 ? (
            <div className="text-xs text-slate-400 text-center py-8">No departments available</div>
          ) : (
            <div className="space-y-3">
              {departmentUsage.map((d, i) => (
                <div key={i} className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-xs font-bold text-slate-900">{d.fullDept}</span>
                      <span className="text-[10px] text-slate-400 ml-2">
                        {d.users} users · {d.machines} machines
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                      {100 - d.openCapacity}% utilized
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full ${
                        100 - d.openCapacity >= 85 ? "bg-red-500" : 100 - d.openCapacity >= 70 ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${100 - d.openCapacity}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      {d.available} available
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-400" />
                      {d.busy} busy
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-slate-300" />
                      {d.users - d.available - d.busy} other
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <AlertTriangle size={15} className="text-red-500" /> Upcoming Resource Conflicts
            </h3>
            {conflicts.length === 0 ? (
              <div className="text-xs text-slate-400 text-center py-8">No conflicts</div>
            ) : (
              <div className="space-y-3">
                {conflicts.map((c, i) => {
                  const cls =
                    c.severity === "Critical" ? "border-red-200 bg-red-50" : c.severity === "High" ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-slate-50";
                  const tc = c.severity === "Critical" ? "text-red-700" : c.severity === "High" ? "text-amber-700" : "text-slate-600";
                  return (
                    <div key={i} className={`rounded-xl border p-4 ${cls}`}>
                      <div className="flex items-start justify-between mb-1.5">
                        <div className="text-xs font-bold text-slate-900">{c.user}</div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${tc}`}>{c.severity}</span>
                      </div>
                      <div className={`text-[11px] font-medium ${tc}`}>{c.conflict}</div>
                      <div className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-2">
                        <CalendarIcon size={9} />
                        {c.date} · {c.dept}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <ResourceUtilizationChart
            data={departmentUsage.map(d => ({ name: d.dept, utilized: 100 - d.openCapacity, free: d.openCapacity }))}
          />
        </div>
      </div>
    </div>
  );
}
