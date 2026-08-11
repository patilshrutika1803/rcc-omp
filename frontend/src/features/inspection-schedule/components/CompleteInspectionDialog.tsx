import React, { useState } from "react";
import { X } from "lucide-react";
import type { InspectionScheduleRecord } from "../types/inspectionSchedule";

export function CompleteInspectionDialog({
  inspection,
  onClose,
  onConfirm,
}: {
  inspection: InspectionScheduleRecord;
  onClose: () => void;
  onConfirm: (values: { completedBy: string; completionDate: string; completionTime: string; completionNotes?: string }) => void;
}) {
  const now = new Date();
  const defaultDate = now.toISOString().slice(0, 10);
  const defaultTime = now.toTimeString().slice(0, 5);
  const [completedBy, setCompletedBy] = useState(inspection.assignedUser || "");
  const [completionDate, setCompletionDate] = useState(defaultDate);
  const [completionTime, setCompletionTime] = useState(defaultTime);
  const [completionNotes, setCompletionNotes] = useState("");

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Complete Inspection</h2>
            <p className="text-xs text-slate-500">Mark this inspection as completed and generate the next recurring schedule.</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-lg"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">Completed By</label>
            <input type="text" value={completedBy} onChange={(e) => setCompletedBy(e.target.value)} className="w-full h-11 px-3 border border-slate-300 rounded-xl text-sm focus:border-blue-500 focus:ring-blue-500/20" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">Completed At</label>
              <input type="date" value={completionDate} onChange={(e) => setCompletionDate(e.target.value)} className="w-full h-11 px-3 border border-slate-300 rounded-xl text-sm focus:border-blue-500 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">Time</label>
              <input type="time" value={completionTime} onChange={(e) => setCompletionTime(e.target.value)} className="w-full h-11 px-3 border border-slate-300 rounded-xl text-sm focus:border-blue-500 focus:ring-blue-500/20" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">Completion Notes / Findings</label>
            <textarea value={completionNotes} onChange={(e) => setCompletionNotes(e.target.value)} rows={4} className="w-full px-3 py-2 border border-slate-300 rounded-2xl text-sm focus:border-blue-500 focus:ring-blue-500/20"></textarea>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100">Cancel</button>
          <button onClick={() => onConfirm({ completedBy, completionDate, completionTime, completionNotes })} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">Confirm</button>
        </div>
      </div>
    </div>
  );
}
