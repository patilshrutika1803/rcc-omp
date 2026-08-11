import React from "react";
import { X, CalendarClock, Layers } from "lucide-react";
import type { InspectionScheduleRecord } from "../types/inspectionSchedule";
import { formatDateDisplay } from "../utils/inspectionScheduleUtils";

export function InspectionDetailsDrawer({
  inspection,
  onClose,
  onEdit,
  onComplete,
}: {
  inspection: InspectionScheduleRecord;
  onClose: () => void;
  onEdit: (inspection: InspectionScheduleRecord) => void;
  onComplete: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
              <Layers size={18} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">{inspection.targetType === "System" ? inspection.systemSnapshot?.systemName : inspection.machineName}</h2>
              <p className="text-xs text-slate-500">{inspection.targetType} inspection details</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-3xl bg-slate-50 border border-slate-200 p-4">
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold mb-3">Target</div>
                <div className="text-sm font-semibold text-slate-900">{inspection.targetType === "System" ? inspection.systemSnapshot?.systemName : inspection.machineName}</div>
                <div className="text-[11px] text-slate-500 mt-1">{inspection.targetType === "System" ? inspection.systemId : inspection.machineId}</div>
              </div>
              <div className="rounded-3xl bg-slate-50 border border-slate-200 p-4">
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold mb-3">Status</div>
                <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-[11px] font-semibold ${inspection.status === "Overdue" ? "bg-red-50 text-red-600" : inspection.status === "Due Today" ? "bg-amber-50 text-amber-700" : inspection.status === "Completed" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                  {inspection.status}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-3xl bg-white border border-slate-200 p-4 space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Inspection</h3>
                <div className="text-sm font-semibold text-slate-900">{inspection.frequency}</div>
                <div className="text-xs text-slate-500">Last Inspection: {formatDateDisplay(inspection.lastInspectionDate)}</div>
                <div className="text-xs text-slate-500">Due Date: {formatDateDisplay(inspection.dueDate)}</div>
                <div className="text-xs text-slate-500">Due Time: {inspection.dueTime}</div>
                <div className="text-xs text-slate-500">Reminder: {inspection.reminderOption} at {inspection.reminderTime}</div>
              </div>
              <div className="rounded-3xl bg-white border border-slate-200 p-4 space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Assignment</h3>
                <div className="text-sm font-semibold text-slate-900">{inspection.department}</div>
                <div className="text-xs text-slate-500">Assigned User: {inspection.assignedUser}</div>
                {inspection.targetType === "Machine" && (
                  <>
                    <div className="text-xs text-slate-500">Machine Type: {inspection.machineType}</div>
                    <div className="text-xs text-slate-500">Location: {inspection.location}</div>
                  </>
                )}
              </div>
            </div>

            <div className="rounded-3xl bg-white border border-slate-200 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 mb-3">Details</h3>
              <div className="grid grid-cols-1 gap-3 text-sm text-slate-700">
                <div><span className="font-semibold">Category:</span> {inspection.category}</div>
                <div><span className="font-semibold">Priority:</span> {inspection.priority}</div>
                <div><span className="font-semibold">Description:</span> {inspection.description || "—"}</div>
                <div><span className="font-semibold">Created At:</span> {formatDateDisplay(inspection.createdAt.split("T")[0])}</div>
                <div><span className="font-semibold">Updated At:</span> {formatDateDisplay(inspection.updatedAt.split("T")[0])}</div>
                <div><span className="font-semibold">Completion Count:</span> {inspection.history.length}</div>
              </div>
            </div>

            <div className="rounded-3xl bg-white border border-slate-200 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 mb-3">History</h3>
              {inspection.history.length === 0 ? (
                <div className="text-sm text-slate-500">No completed history yet.</div>
              ) : (
                <div className="space-y-3">
                  {inspection.history.map((history) => (
                    <div key={history.id} className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
                      <div className="font-semibold text-slate-900">{formatDateDisplay(history.date)} {history.time}</div>
                      <div className="text-slate-500">By {history.completedBy}</div>
                      <div className="text-slate-500">Notes: {history.completionNotes || "—"}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">Close</button>
          {inspection.status !== "Completed" && (
            <button onClick={onComplete} className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors">Complete</button>
          )}
          <button onClick={() => onEdit(inspection)} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">Edit</button>
        </div>
      </div>
    </div>
  );
}
