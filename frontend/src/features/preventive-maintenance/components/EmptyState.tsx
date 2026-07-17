import React from "react";
import { Wrench, RefreshCw, Plus } from "lucide-react";

export function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mb-5">
        <Wrench size={28} className="text-blue-400" />
      </div>
      <h3 className="text-base font-bold text-slate-900 mb-2">No maintenance tasks found</h3>
      <p className="text-sm text-slate-500 max-w-xs mb-6">
        No records match your current filters. Try adjusting filters or create a new PM task.
      </p>
      <div className="flex gap-3">
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
          <RefreshCw size={14} /> Reset Filters
        </button>
        <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
          <Plus size={14} /> Add PM Task
        </button>
      </div>
    </div>
  );
}

export default EmptyState;
