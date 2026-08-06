import React from "react";
import { CheckCircle2, CalendarClock, AlertTriangle } from "lucide-react";
import type { SystemInspectionRecord } from "../types/inspection";
import { daysUntil, formatDate } from "../../../shared/utils/dateHelpers";

export function InspectionHistoryPanel({ inspections }: { inspections: SystemInspectionRecord[] }) {
  if (inspections.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 text-center text-sm text-slate-500">
        No system inspection history available yet.
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
        <h3 className="text-sm font-bold text-slate-900">Completed Inspection History</h3>
        <p className="text-xs text-slate-500 mt-0.5">Completed inspection records are retained for audit and traceability.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[11px] text-slate-600 whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wide text-[10px] font-bold border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">System</th>
              <th className="px-4 py-3">Completed On</th>
              <th className="px-4 py-3">Next Due</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {inspections.map((inspection) => {
              const dueDiff = inspection.nextDueDate ? daysUntil(inspection.nextDueDate) : 0;
              return (
                <tr key={inspection.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-xs font-semibold text-slate-900">{inspection.systemName}</td>
                  <td className="px-4 py-3">{inspection.completionDate ? formatDate(inspection.completionDate) : "—"}</td>
                  <td className="px-4 py-3">{inspection.nextDueDate ? formatDate(inspection.nextDueDate) : "—"}</td>
                  <td className="px-4 py-3">{inspection.priority}</td>
                  <td className="px-4 py-3">{inspection.systemCategory}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold ${inspection.status === "Completed" ? "bg-emerald-50 text-emerald-700" : inspection.status === "Overdue" ? "bg-red-50 text-red-700" : inspection.status === "Due Today" ? "bg-amber-50 text-amber-700" : "bg-slate-50 text-slate-600"}`}>
                      {inspection.status === "Completed" ? <CheckCircle2 size={12} /> : inspection.status === "Overdue" ? <AlertTriangle size={12} /> : <CalendarClock size={12} />}
                      {inspection.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
