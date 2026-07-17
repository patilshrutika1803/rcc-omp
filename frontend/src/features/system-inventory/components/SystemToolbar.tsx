import React from "react";
import { Search, Filter } from "lucide-react";
import { DEPARTMENTS, SYSTEM_TYPES, STATUS_OPTIONS } from "../constants/systemConstants";

export function SystemToolbar({
  search,
  onSearchChange,
  filterDept,
  onFilterDeptChange,
  filterType,
  onFilterTypeChange,
  filterStatus,
  onFilterStatusChange,
  hasFilters,
  onResetFilters,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  filterDept: string;
  onFilterDeptChange: (value: string) => void;
  filterType: string;
  onFilterTypeChange: (value: string) => void;
  filterStatus: string;
  onFilterStatusChange: (value: string) => void;
  hasFilters: boolean;
  onResetFilters: () => void;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex flex-col lg:flex-row lg:items-center gap-3">
      <div className="relative flex-1">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search by System ID, Name, Assigned User or Department..."
          className="w-full h-9 pl-9 pr-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all placeholder-slate-400"
        />
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={14} className="text-slate-400 shrink-0" />
        <select value={filterDept} onChange={e => onFilterDeptChange(e.target.value)}
          className="h-9 px-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
          <option value="">All Departments</option>
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={filterType} onChange={e => onFilterTypeChange(e.target.value)}
          className="h-9 px-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
          <option value="">All Types</option>
          {SYSTEM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterStatus} onChange={e => onFilterStatusChange(e.target.value)}
          className="h-9 px-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
          <option value="">All Status</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {hasFilters && (
          <button onClick={onResetFilters} className="h-9 px-2.5 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors">
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
