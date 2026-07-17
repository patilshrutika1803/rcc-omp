import type { QADepartmentBreakdownPoint } from "../types/qa";
import { EmptyState } from "./EmptyState";

interface DepartmentCompletionChartProps {
  departmentBreakdown: QADepartmentBreakdownPoint[];
}

export function DepartmentCompletionChart({ departmentBreakdown }: DepartmentCompletionChartProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex flex-col">
      <h3 className="text-sm font-bold text-slate-900 mb-4">Department Completion</h3>
      {departmentBreakdown.length === 0 ? (
        <EmptyState className="flex-1 flex flex-col items-center justify-center text-slate-400" iconSize={28} textClassName="text-xs font-medium" />
      ) : (
        <div className="flex-1 space-y-4">
          {departmentBreakdown.map(dept => (
            <div key={dept.name}>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700">{dept.name}</span>
                <span className="font-bold text-slate-900">{dept.score}% Complete</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className={`h-2 rounded-full ${dept.score >= 90 ? "bg-emerald-500" : dept.score >= 50 ? "bg-blue-500" : "bg-amber-500"}`} style={{ width: `${dept.score}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
