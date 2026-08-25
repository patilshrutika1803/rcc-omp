import React from "react";
import { Undo2 } from "lucide-react";
import { formatDateDisplay } from "../utils/inspectionScheduleUtils";
import type { InspectionScheduleRecord } from "../types/inspectionSchedule";

export function InspectionHistoryPanel({ inspections, onUndo }: { inspections: InspectionScheduleRecord[]; onUndo: (inspection: InspectionScheduleRecord) => void }) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
        <h3 className="text-sm font-bold text-slate-700">Completed Inspection History</h3>
        <p className="text-xs text-slate-500 mt-0.5">Historic inspection records are preserved after completion.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left whitespace-nowrap">
          <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">Target</th>
              <th className="px-4 py-3">Target Type</th>
              <th className="px-4 py-3">Completed On</th>
              <th className="px-4 py-3">Previous Due Date</th>
              <th className="px-4 py-3">Next Due Date</th>
              <th className="px-4 py-3">Completed By</th>
              <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {inspections.map((inspection) => {
              const latestHistory = inspection.history[0];
              const completedDate = inspection.completionDate ?? latestHistory?.date ?? "—";
              const previousDue = latestHistory?.previousDueDate ?? inspection.dueDate;
              const nextDue = latestHistory?.nextDueDate ?? "—";
              return (
                <tr key={inspection.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-semibold text-slate-900">{inspection.targetType === "System" ? inspection.systemSnapshot?.systemName ?? inspection.systemId : inspection.machineName}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{inspection.targetType}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{completedDate !== "—" ? formatDateDisplay(completedDate) : "—"}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{previousDue ? formatDateDisplay(previousDue) : "—"}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{nextDue !== "—" ? formatDateDisplay(nextDue) : "—"}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{inspection.completedBy ?? "—"}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{inspection.priority}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-emerald-700">Completed</td>
                  <td className="px-4 py-3 text-right"><button title="Undo Completion" onClick={() => { if (window.confirm("Undo Completion?\n\nThis will restore the task to its previous active state. Any generated recurring record/history changes will be safely reversed.")) onUndo(inspection); }} className="inline-flex items-center gap-1.5 px-2 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-md"><Undo2 size={13} /> Undo Completion</button></td>
                </tr>
              );
            })}
            {inspections.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-sm text-slate-500">No completed inspections yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
