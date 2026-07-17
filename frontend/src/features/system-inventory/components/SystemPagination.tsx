import React from "react";

export function SystemPagination({
  page,
  totalPages,
  filteredCount,
  onPrev,
  onNext,
  onPageSelect,
}: {
  page: number;
  totalPages: number;
  filteredCount: number;
  onPrev: () => void;
  onNext: () => void;
  onPageSelect: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/30">
      <span className="text-xs text-slate-500">Page {page} of {totalPages} · {filteredCount} system{filteredCount !== 1 ? "s" : ""}</span>
      <div className="flex items-center gap-1">
        <button disabled={page === 1} onClick={onPrev} className="h-7 px-2.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 transition-colors">Previous</button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
          <button key={p} onClick={() => onPageSelect(p)} className={`h-7 w-7 text-xs font-bold rounded-md transition-colors ${p === page ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{p}</button>
        ))}
        <button disabled={page === totalPages} onClick={onNext} className="h-7 px-2.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 transition-colors">Next</button>
      </div>
    </div>
  );
}
