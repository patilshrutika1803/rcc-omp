import React, { useState, useMemo } from "react";
import { X, AlertCircle } from "lucide-react";
import { isDueDateTimeReached } from "../../shared/utils/recurringWorkflow";
import type { InspectionScheduleRecord } from "../types/inspectionSchedule";
import { combineDateTime, isCompletionDateValid as validateCompletionDate } from "../utils/inspectionScheduleUtils";

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
  const [validationError, setValidationError] = useState<string | null>(null);

  const completionDateIsValid = useMemo(() => {
    const due = combineDateTime(inspection.dueDate, inspection.dueTime);
    const completion = combineDateTime(completionDate, completionTime);
    const dueReached = isDueDateTimeReached(inspection.dueDate, inspection.dueTime);
    return dueReached && validateCompletionDate(completionDate, inspection.dueDate) && Boolean(due && completion && completion.getTime() >= due.getTime());
  }, [completionDate, completionTime, inspection.dueDate, inspection.dueTime]);

  const handleConfirm = () => {
    if (!completionDateIsValid) {
      setValidationError(
        `Cannot complete before the scheduled due date (${inspection.dueDate} ${inspection.dueTime}).`
      );
      return;
    }
    
    setValidationError(null);
    onConfirm({ completedBy, completionDate, completionTime, completionNotes });
  };

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
              <input type="date" value={completionDate} onChange={(e) => { setCompletionDate(e.target.value); setValidationError(null); }} className="w-full h-11 px-3 border border-slate-300 rounded-xl text-sm focus:border-blue-500 focus:ring-blue-500/20" />
              <div className="text-[10px] text-slate-500 mt-1">Due: {inspection.dueDate} at {inspection.dueTime}</div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">Time</label>
              <input type="time" value={completionTime} onChange={(e) => { setCompletionTime(e.target.value); setValidationError(null); }} className="w-full h-11 px-3 border border-slate-300 rounded-xl text-sm focus:border-blue-500 focus:ring-blue-500/20" />
            </div>
          </div>
          {validationError && (
            <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">{validationError}</p>
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">Completion Notes / Findings</label>
            <textarea value={completionNotes} onChange={(e) => setCompletionNotes(e.target.value)} rows={4} className="w-full px-3 py-2 border border-slate-300 rounded-2xl text-sm focus:border-blue-500 focus:ring-blue-500/20"></textarea>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100">Cancel</button>
          <button onClick={handleConfirm} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!completionDateIsValid}>Confirm</button>
        </div>
      </div>
    </div>
  );
}
