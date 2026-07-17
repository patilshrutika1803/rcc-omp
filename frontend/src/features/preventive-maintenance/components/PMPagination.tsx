import React from "react";

export function PMPagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number | ((p: number) => number)) => void;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/30">
      <span className="text-xs text-slate-500">Page {currentPage} of {totalPages}</span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="h-7 px-2.5 text-xs font-medium text-slate-500 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 transition-colors"
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`h-7 w-7 text-xs font-bold rounded-md ${currentPage === p ? "text-white bg-blue-600" : "text-slate-600 bg-white border border-slate-200 hover:bg-slate-50"}`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="h-7 px-2.5 text-xs font-medium text-slate-500 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default PMPagination;
