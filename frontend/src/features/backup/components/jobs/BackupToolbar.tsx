import React from "react";
import { Search } from "lucide-react";
import type { BkpStatus, BkpType } from "../../types/backup";
import { BKP_STATUSES, BKP_TYPES } from "../../constants/backupConstants";

export function BackupToolbar({
  search, onSearchChange, statusF, onStatusChange, typeF, onTypeChange,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  statusF: string;
  onStatusChange: (v: string) => void;
  typeF: string;
  onTypeChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative w-72">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search} onChange={e => onSearchChange(e.target.value)}
          placeholder="Search jobs..."
          className="w-full h-9 pl-9 pr-4 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-400"
        />
      </div>
      <select value={statusF} onChange={e => onStatusChange(e.target.value)} className="h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-400 text-slate-700">
        <option value="">All Statuses</option>
        {(BKP_STATUSES as BkpStatus[]).map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <select value={typeF} onChange={e => onTypeChange(e.target.value)} className="h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-400 text-slate-700">
        <option value="">All Types</option>
        {(BKP_TYPES as BkpType[]).map(t => <option key={t} value={t}>{t}</option>)}
      </select>
    </div>
  );
}
