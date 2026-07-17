import React from "react";
import { Trash2 } from "lucide-react";
import type { SystemInventory } from "../types/system";

export function DeleteConfirmDialog({ system, onClose, onConfirm }: { system: SystemInventory; onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-2">Remove system?</h3>
        <p className="text-xs text-slate-500 mb-5">
          This will permanently remove <span className="font-semibold text-slate-700">{system.systemName || system.systemId}</span> from the inventory.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2">
            <Trash2 size={14} /> Remove
          </button>
        </div>
      </div>
    </div>
  );
}
