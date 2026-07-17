import React from "react";
import { Search, SlidersHorizontal, ListFilter, RefreshCw } from "lucide-react";
import type { PMRecord } from "../types/pm";
import { FREQUENCIES, QUICK_FILTERS, STATUS_FILTER_OPTIONS, PRIORITY_OPTIONS } from "../constants/pmConstants";

export interface PMFilterState {
  department: string;
  frequency: string;
  priority: string;
  status: string;
  dateFrom: string;
  dateTo: string;
}

export function PMFilters({
  searchQuery,
  onSearchQueryChange,
  quickFilter,
  onQuickFilterChange,
  pmRecords,
  showFilters,
  onToggleFilters,
  filters,
  onFiltersChange,
  departments,
}: {
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  quickFilter: string;
  onQuickFilterChange: (f: string) => void;
  pmRecords: PMRecord[];
  showFilters: boolean;
  onToggleFilters: () => void;
  filters: PMFilterState;
  onFiltersChange: (f: PMFilterState) => void;
  departments: string[];
}) {
  const advancedFilterFields = [
    { label: "Department", key: "department" as const, opts: ["", ...departments], placeholder: "All Departments" },
    { label: "Frequency", key: "frequency" as const, opts: ["", ...FREQUENCIES], placeholder: "All Frequencies" },
    { label: "Priority", key: "priority" as const, opts: ["", ...PRIORITY_OPTIONS], placeholder: "All Priorities" },
    { label: "Status", key: "status" as const, opts: ["", ...STATUS_FILTER_OPTIONS], placeholder: "All Statuses" },
  ];

  return (
    <>
      {/* Search + Quick Filters row */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="relative w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search machines, users..."
            value={searchQuery}
            onChange={e => onSearchQueryChange(e.target.value)}
            className="w-full h-9 pl-9 pr-4 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {QUICK_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => onQuickFilterChange(f)}
              className={`h-8 px-3 text-xs font-semibold rounded-lg transition-all border ${
                quickFilter === f
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              {f}
              {f !== "All" && (
                <span className={`ml-1.5 text-[10px] font-bold ${quickFilter === f ? "text-blue-200" : "text-slate-400"}`}>
                  {pmRecords.filter(r => r.status === f).length}
                </span>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={onToggleFilters}
          className={`ml-auto flex items-center gap-1.5 h-9 px-3 text-xs font-semibold border rounded-lg transition-colors ${
            showFilters
              ? "bg-blue-50 text-blue-700 border-blue-200"
              : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
          }`}
        >
          <SlidersHorizontal size={14} /> Filters
          {Object.values(filters).some(v => v) && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 ml-0.5" />
          )}
        </button>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 mb-5 mt-5 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-700 flex items-center gap-2">
              <ListFilter size={14} className="text-blue-500" /> Advanced Filters
            </h3>
            <button
              onClick={() => onFiltersChange({ department: "", frequency: "", priority: "", status: "", dateFrom: "", dateTo: "" })}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
            >
              <RefreshCw size={12} /> Reset All
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            {advancedFilterFields.map(f => (
              <div key={f.key}>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">{f.label}</label>
                <select
                  value={filters[f.key]}
                  onChange={e => onFiltersChange({ ...filters, [f.key]: e.target.value })}
                  className="w-full h-8 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700"
                >
                  <option value="">{f.placeholder}</option>
                  {f.opts.filter(Boolean).map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Date From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={e => onFiltersChange({ ...filters, dateFrom: e.target.value })}
                className="w-full h-8 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Date To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={e => onFiltersChange({ ...filters, dateTo: e.target.value })}
                className="w-full h-8 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PMFilters;
