import React, { useState } from "react";
import { CheckCircle2, Calendar as CalendarIcon, UserCheck, RefreshCw } from "lucide-react";
import type { PMRecord } from "../types/pm";
import { formatDate } from "../utils/pmDateUtils";

export function CompleteDialog({ record, onClose, onConfirm }: { record: PMRecord; onClose: () => void; onConfirm: (notes: string) => void }) {
  const [completionNotes, setCompletionNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = () => {
    setIsLoading(true);
    setTimeout(() => {
      onConfirm(completionNotes);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle2 size={24} className="text-emerald-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Mark as Completed</h3>
            <p className="text-xs text-slate-500 mt-0.5">Confirm completion of this maintenance task</p>
          </div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5">
          <div className="text-xs font-bold text-slate-900 mb-1">{record.machine}</div>
          <div className="text-xs text-slate-500 font-mono">{record.machineId} · {record.department}</div>
          <div className="mt-2 flex items-center gap-3 text-xs text-slate-600">
            <span className="flex items-center gap-1"><CalendarIcon size={11} /> Due: {formatDate(record.nextDue)}</span>
            <span className="flex items-center gap-1"><UserCheck size={11} /> {record.user}</span>
          </div>
        </div>
        <div className="mb-5">
          <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Completion Notes</label>
          <textarea
            placeholder="Add any observations, parts replaced, or follow-up notes..."
            rows={3}
            value={completionNotes}
            onChange={e => setCompletionNotes(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none placeholder-slate-400"
          />
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleConfirm} disabled={isLoading} className="flex-1 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
            {isLoading ? <><RefreshCw size={14} className="animate-spin" /> Saving...</> : <><CheckCircle2 size={15} /> Confirm Complete</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CompleteDialog;
