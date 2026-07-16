// ─────────────────────────────────────────────────────────────────────────────
// DepartmentDetails
// Extracted from the original DeptDetailsTab in the monolithic
// DepartmentsPage.tsx. UI/behavior unchanged.
//
// NOTE: In the original file this tab was defined but not wired into the
// exported DepartmentsPage. It is preserved here, unused-but-available, to
// avoid removing any feature.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { Layers, Edit2, FileSpreadsheet, UserCheck, User, Server, AlertTriangle, Table2, FileText } from "lucide-react";
import type { Department, Employee } from "../types/department";
import { DEPARTMENT_DETAIL_SECTIONS } from "../constants/departmentConfig";
import { budgetUtilizationPct, mchStatusCfg } from "../utils/departmentHelpers";
import { DeptStatusBadge, ScoreBadge } from "./DepartmentCard";
import { MonthlyKPIGrid } from "./DepartmentKPICards";
import { RecentActivities } from "./DepartmentActivities";
import DepartmentEmployeeCard from "./DepartmentEmployeeCard";

/** Minimal machine shape needed for the "Assigned Machines" panel */
export interface DepartmentMachine {
  id: string;
  name: string;
  status: string;
  department: string;
}

export interface DepartmentReportItem {
  title: string;
  date: string;
  type: string;
  size: string;
}

export interface DepartmentDetailsProps {
  department: Department | null;
  employees: Employee[];
  machines: DepartmentMachine[];
  reports: DepartmentReportItem[];
  onGoToDirectory: () => void;
}

export default function DepartmentDetails({
  department: dept,
  employees: deptEmployees,
  machines: deptMachines,
  reports,
  onGoToDirectory,
}: DepartmentDetailsProps) {
  const [section, setSection] = useState<(typeof DEPARTMENT_DETAIL_SECTIONS)[number]["id"]>("overview");

  if (!dept) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mb-5">
          <Layers size={28} className="text-blue-400" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-2">No Department Selected</h3>
        <p className="text-sm text-slate-500 max-w-xs mb-6">
          Select a department from the Directory to view its full profile, KPIs and team.
        </p>
        <button
          onClick={onGoToDirectory}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Table2 size={14} /> Browse Directory
        </button>
      </div>
    );
  }

  const budgetPct = budgetUtilizationPct(dept);

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0">
              <Layers size={26} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{dept.name}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className="text-xs font-mono text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                  {dept.id}
                </span>
                <DeptStatusBadge status={dept.status} />
                <ScoreBadge score={dept.performanceScore} />
              </div>
              <p className="text-xs text-slate-500 mt-3 max-w-xl leading-relaxed">{dept.description}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <button className="flex items-center gap-2 h-8 px-3 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <Edit2 size={12} /> Edit Department
            </button>
            <button className="flex items-center gap-2 h-8 px-3 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <FileSpreadsheet size={12} /> Generate Report
            </button>
            <button className="flex items-center gap-2 h-8 px-3 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
              <UserCheck size={12} /> Assign Manager
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          {[
            { label: "Department Head", value: dept.head },
            { label: "Manager", value: dept.manager },
            { label: "Location", value: dept.location },
            { label: "Headcount", value: `${dept.employees} employees` },
          ].map(item => (
            <div key={item.label} className="bg-slate-50 border border-slate-100 rounded-xl p-3">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{item.label}</div>
              <div className="text-xs font-semibold text-slate-900 leading-tight">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-0 border-b border-slate-200 overflow-x-auto">
        {DEPARTMENT_DETAIL_SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            className={`px-5 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
              section === s.id ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {section === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4">Workload & Resources</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Employees", val: dept.employees, icon: User, color: "text-blue-600", bg: "bg-blue-50" },
                  { label: "Machines", val: dept.machines, icon: Server, color: "text-slate-600", bg: "bg-slate-50" },
                  { label: "Open Tasks", val: dept.openPM + dept.openQA, icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
                ].map(item => (
                  <div key={item.label} className={`${item.bg} border border-slate-100 rounded-xl p-4 text-center`}>
                    <item.icon size={20} className={`${item.color} mx-auto mb-2`} />
                    <div className="text-2xl font-bold text-slate-900">{item.val}</div>
                    <div className="text-[10px] text-slate-500 font-semibold">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <RecentActivities activities={dept.recentActivities} title="Recent Activities" />
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4">Budget Utilization</h3>
              <div className="text-center mb-3">
                <div className="text-2xl font-bold text-slate-900">₹{dept.budgetUsed}L</div>
                <div className="text-xs text-slate-400">of ₹{dept.budget}L allocated</div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 mb-2">
                <div
                  className={`h-3 rounded-full transition-all ${
                    budgetPct > 90 ? "bg-red-500" : budgetPct > 75 ? "bg-amber-500" : "bg-blue-600"
                  }`}
                  style={{ width: `${budgetPct}%` }}
                />
              </div>
              <div
                className={`text-xs font-bold text-center ${
                  budgetPct > 90 ? "text-red-600" : budgetPct > 75 ? "text-amber-600" : "text-blue-600"
                }`}
              >
                {budgetPct}% used
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4">Assigned Machines</h3>
              <div className="space-y-2">
                {deptMachines.length === 0 ? (
                  <div className="text-xs text-slate-400 text-center py-4">No machines assigned</div>
                ) : (
                  deptMachines.slice(0, 4).map(m => {
                    const cfg = mchStatusCfg(m.status);
                    return (
                      <div key={m.id} className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-lg border border-slate-100">
                        <div className={`w-2 h-2 rounded-full ${cfg.dot} shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-slate-900 truncate">{m.name.split("–")[0].trim()}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{m.id}</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {section === "kpis" && <MonthlyKPIGrid kpis={dept.monthlyKPIs} />}

      {section === "tasks" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {[
            { label: "Open PM Tasks", val: dept.openPM, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", desc: "Preventive maintenance pending" },
            { label: "Open QA Items", val: dept.openQA, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200", desc: "QA inspections & audits" },
            { label: "Backup Jobs", val: dept.backupJobs, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", desc: "Scheduled backup operations" },
          ].map((t, i) => (
            <div key={i} className={`bg-white border border-slate-200 rounded-xl shadow-sm p-5 border-l-4 ${t.border}`}>
              <div className={`text-3xl font-bold ${t.color} mb-1`}>{t.val}</div>
              <div className="text-sm font-bold text-slate-900">{t.label}</div>
              <div className="text-xs text-slate-400 mt-1">{t.desc}</div>
            </div>
          ))}
        </div>
      )}

      {section === "team" && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {dept.name} Team · {deptEmployees.length} members
            </h3>
          </div>
          {deptEmployees.length === 0 ? (
            <div className="text-xs text-slate-400 text-center py-12">No employees found</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-5">
              {deptEmployees.map(emp => (
                <DepartmentEmployeeCard key={emp.id} employee={emp} variant="compact" />
              ))}
            </div>
          )}
        </div>
      )}

      {section === "reports" && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4">Recent Reports · {dept.name}</h3>
          {reports.length === 0 ? (
            <div className="text-xs text-slate-400 text-center py-8">No reports available</div>
          ) : (
            <div className="space-y-3">
              {reports.map((r, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
                  <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center shrink-0">
                    <FileText size={18} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">{r.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {r.type} · {r.date} · {r.size}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button className="h-7 px-2.5 text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                      Preview
                    </button>
                    <button className="h-7 px-2.5 text-[11px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
