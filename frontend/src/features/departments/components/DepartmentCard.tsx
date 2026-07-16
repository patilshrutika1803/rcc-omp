// ─────────────────────────────────────────────────────────────────────────────
// DepartmentCard + shared badges (DeptStatusBadge, ScoreBadge)
// Extracted verbatim from the original monolithic DepartmentsPage.tsx.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { Layers } from "lucide-react";
import type { Department, DepartmentStatus } from "../types/department";
import { deptStatusCfg, scoreColorCfg } from "../utils/departmentHelpers";

export function DeptStatusBadge({ status }: { status: DepartmentStatus }) {
  const c = deptStatusCfg(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide border ${c.bg} ${c.text} ${c.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} shrink-0`} /> {status}
    </span>
  );
}

export function ScoreBadge({ score }: { score: number }) {
  const c = scoreColorCfg(score);
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${c}`}>
      {score}%
    </span>
  );
}

export interface DepartmentCardProps {
  department: Department;
  onClick?: (d: Department) => void;
}

/**
 * Compact department row used in the "Department Performance" list
 * on the Dashboard tab.
 */
export default function DepartmentCard({ department, onClick }: DepartmentCardProps) {
  return (
    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onClick?.(department)}>
      <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
        <Layers size={13} className="text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
            {department.name}
          </span>
          <span
            className={`text-[11px] font-bold ml-2 ${
              department.performanceScore >= 85
                ? "text-emerald-600"
                : department.performanceScore >= 70
                ? "text-amber-600"
                : "text-red-600"
            }`}
          >
            {department.performanceScore}%
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full ${
              department.performanceScore >= 85
                ? "bg-emerald-500"
                : department.performanceScore >= 70
                ? "bg-amber-500"
                : "bg-red-500"
            }`}
            style={{ width: `${department.performanceScore}%` }}
          />
        </div>
      </div>
    </div>
  );
}
