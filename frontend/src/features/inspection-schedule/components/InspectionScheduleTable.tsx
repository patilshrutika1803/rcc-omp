import React from "react";
import { formatDateDisplay } from "../utils/inspectionScheduleUtils";
import type { InspectionScheduleRecord } from "../types/inspectionSchedule";
import { Edit2, CheckCircle2, Eye, Trash2 } from "lucide-react";

export function InspectionScheduleTable({
  data,
  onView,
  onEdit,
  onComplete,
  onDelete,
}: {
  data: InspectionScheduleRecord[];
  onView: (inspection: InspectionScheduleRecord) => void;
  onEdit: (inspection: InspectionScheduleRecord) => void;
  onComplete: (inspection: InspectionScheduleRecord) => void;
  onDelete: (inspection: InspectionScheduleRecord) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left whitespace-nowrap">
        <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
          <tr>
            <th className="px-4 py-3">Target</th>
            <th className="px-4 py-3">Target Type</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Frequency</th>
            <th className="px-4 py-3">Last Inspection</th>
            <th className="px-4 py-3">Next Due Date</th>
            <th className="px-4 py-3">Due Time</th>
            <th className="px-4 py-3">Reminder</th>
            <th className="px-4 py-3">Priority</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-700">
          {data.map((inspection) => (
            <tr key={inspection.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                {inspection.targetType === "System" ? inspection.systemSnapshot?.systemName ?? inspection.systemId : inspection.machineName}
              </td>
              <td className="px-4 py-3 text-sm text-slate-600">{inspection.targetType}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{inspection.category}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{inspection.frequency}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{formatDateDisplay(inspection.lastInspectionDate)}</td>
              <td className="px-4 py-3 text-sm font-semibold text-slate-900">{formatDateDisplay(inspection.dueDate)}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{inspection.dueTime}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{inspection.reminderOption}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{inspection.priority}</td>
              <td className="px-4 py-3 text-sm font-semibold">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold ${inspection.status === "Overdue" ? "bg-red-50 text-red-600" : inspection.status === "Due Today" ? "bg-amber-50 text-amber-700" : inspection.status === "Completed" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                  {inspection.status}
                </span>
              </td>
              <td className="px-4 py-3 text-right space-x-1">
                <button onClick={() => onView(inspection)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"><Eye size={16} /></button>
                <button onClick={() => onEdit(inspection)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md"><Edit2 size={16} /></button>
                {inspection.status !== "Completed" && (
                  <button onClick={() => onComplete(inspection)} className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-md"><CheckCircle2 size={16} /></button>
                )}
                <button onClick={() => onDelete(inspection)} aria-label="Delete inspection" title="Delete inspection" className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md"><Trash2 size={16} /></button>
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={11} className="px-4 py-8 text-center text-sm text-slate-500">No inspections matched your filters.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
