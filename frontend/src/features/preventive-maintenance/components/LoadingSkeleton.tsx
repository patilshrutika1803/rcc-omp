import React from "react";

export function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {/* KPI skeleton */}
      <div className="grid grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 h-24">
            <div className="h-3 bg-slate-200 rounded w-3/4 mb-3" />
            <div className="h-7 bg-slate-200 rounded w-1/2 mb-2" />
            <div className="h-2 bg-slate-100 rounded w-2/3" />
          </div>
        ))}
      </div>
      {/* Table skeleton */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="h-12 bg-slate-50 border-b border-slate-200" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-slate-100 last:border-0">
            <div className="w-8 h-8 bg-slate-100 rounded-lg shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-slate-200 rounded w-48" />
              <div className="h-2.5 bg-slate-100 rounded w-32" />
            </div>
            <div className="h-3 bg-slate-100 rounded w-20" />
            <div className="h-3 bg-slate-100 rounded w-16" />
            <div className="h-6 bg-slate-100 rounded w-20" />
            <div className="h-6 bg-slate-100 rounded w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default LoadingSkeleton;
