import React from "react";
import { Trash2 } from "lucide-react";
import type { PMRecord } from "../types/pm";

export function DeleteDialog({ record, onClose, onConfirm }: { record: PMRecord; onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-12 bg-red-50 border border-red-200 rounded-xl flex items-center justify-center shrink-0">
            <Trash2 size={24} className="text-red-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Delete Maintenance Task</h3>
            <p className="text-xs text-slate-500 mt-0.5">This action cannot be undone</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
          <div className="text-xs font-bold text-slate-900 mb-1">{record.machine}</div>
          <div className="text-xs text-slate-500 font-mono">{record.machineId} · {record.department}</div>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
            <Trash2 size={15} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteDialog;
