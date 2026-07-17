import React from "react";

export function BackupPagination() {
  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/30">
      <span className="text-xs text-slate-500">Page 1 of 1</span>
      <div className="flex items-center gap-1">
        <button className="h-7 px-2.5 text-xs font-medium text-slate-400 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40" disabled>Previous</button>
        <button className="h-7 w-7 text-xs font-bold text-white bg-blue-600 rounded-md">1</button>
        <button className="h-7 px-2.5 text-xs font-medium text-slate-400 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40" disabled>Next</button>
      </div>
    </div>
  );
}
