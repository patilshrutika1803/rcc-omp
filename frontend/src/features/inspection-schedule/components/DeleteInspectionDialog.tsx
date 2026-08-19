import React from "react";
import { AlertTriangle, X } from "lucide-react";
import type { InspectionScheduleRecord } from "../types/inspectionSchedule";

export function DeleteInspectionDialog({
  inspection,
  onClose,
  onConfirm,
}: {
  inspection: InspectionScheduleRecord;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const target = inspection.targetType === "System"
    ? inspection.systemSnapshot?.systemName ?? inspection.systemId
    : inspection.machineName ?? inspection.machineId;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-50 text-red-600"><AlertTriangle size={18} /></div>
            <h2 className="text-sm font-bold text-slate-900">Delete Inspection?</h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-2 text-slate-400 hover:text-slate-700 rounded-lg"><X size={18} /></button>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-slate-600">This inspection and its scheduled record will be permanently removed. This action cannot be undone.</p>
          <p className="mt-3 text-xs font-semibold text-slate-500">{target}</p>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700">Delete Inspection</button>
        </div>
      </div>
    </div>
  );
}