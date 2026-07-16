// ─────────────────────────────────────────────────────────────────────────────
// DepartmentEmployeeCard
// Extracted from the original TeamMembersTab / DeptDetailsTab (team section)
// in the monolithic DepartmentsPage.tsx. UI/behavior unchanged.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { Mail } from "lucide-react";
import type { Employee } from "../types/department";
import { empAvailCfg, workloadColorCfg } from "../utils/departmentHelpers";

export interface DepartmentEmployeeCardProps {
  employee: Employee;
  /** "full" = the rich card used in Team Members grid, "compact" = the smaller card used in Details > Team */
  variant?: "full" | "compact";
}

export default function DepartmentEmployeeCard({ employee: emp, variant = "full" }: DepartmentEmployeeCardProps) {
  const avCfg = empAvailCfg(emp.availability);

  if (variant === "compact") {
    return (
      <div className="flex items-start gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl hover:border-blue-200 transition-colors">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${emp.avatarColor}`}>
          {emp.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-slate-900">{emp.name}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{emp.role}</div>
          <div className="text-[10px] font-mono text-slate-400 mt-0.5">{emp.employeeId}</div>
          <div className="mt-2">
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${avCfg.bg} ${avCfg.text} ${avCfg.border}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${avCfg.dot}`} />
              {emp.availability}
            </span>
          </div>
        </div>
      </div>
    );
  }

  const wl = workloadColorCfg(emp.workload);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col">
      <div className="p-5 flex-1">
        <div className="flex items-start gap-3 mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold shrink-0 border ${emp.avatarColor}`}>
            {emp.initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-slate-900 leading-tight">{emp.name}</div>
            <div className="text-xs text-slate-500 mt-0.5 leading-snug">{emp.role}</div>
            <div className="mt-1.5">
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${avCfg.bg} ${avCfg.text} ${avCfg.border}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${avCfg.dot}`} />
                {emp.availability}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3 text-[10px]">
          {[
            { label: "Employee ID", val: emp.employeeId },
            { label: "Department", val: emp.department.split(" ")[0] },
            { label: "Phone", val: emp.phone },
            { label: "Machines", val: `${emp.assignedMachines} assigned` },
          ].map(item => (
            <div key={item.label} className="bg-slate-50 rounded-lg p-2">
              <div className="text-slate-400 font-bold uppercase tracking-wide mb-0.5">{item.label}</div>
              <div className="text-slate-700 font-semibold truncate" title={item.val}>
                {item.val}
              </div>
            </div>
          ))}
        </div>

        <div className="text-[10px] text-slate-400 truncate mb-2 flex items-center gap-1">
          <Mail size={9} className="shrink-0" />
          {emp.email}
        </div>

        <div>
          <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1.5">
            <span>Current Workload</span>
            <span className={`font-bold ${wl.text}`}>{emp.workload}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div className={`h-1.5 rounded-full ${wl.bar}`} style={{ width: `${emp.workload}%` }} />
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 px-4 py-3 flex gap-2">
        <button className="flex-1 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
          View Profile
        </button>
        <button className="flex-1 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
          Assign Task
        </button>
      </div>
    </div>
  );
}
