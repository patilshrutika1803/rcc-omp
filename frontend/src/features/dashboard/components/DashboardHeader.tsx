// ─────────────────────────────────────────────────────────────────────────────
// DashboardHeader
// Greeting, live date/time, and top action buttons.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { Archive, Wrench, CheckSquare, FileText, Upload } from "lucide-react";

interface DashboardHeaderProps {
  greetingName: string;
  greetingText: string;
  dateTimeText: string;
  onAddBackup?: () => void;
  onAddPM?: () => void;
  onAddQA?: () => void;
  onAddNote?: () => void;
  onExportReport?: () => void;
}

export default function DashboardHeader({
  greetingName,
  greetingText,
  dateTimeText,
  onAddBackup,
  onAddPM,
  onAddQA,
  onAddNote,
  onExportReport,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{greetingText}, {greetingName}</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">{dateTimeText}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onAddBackup}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 shadow-sm transition-all"
        >
          <Archive size={14} className="text-slate-400" /> Add Backup
        </button>
        <button
          type="button"
          onClick={onAddPM}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 shadow-sm transition-all"
        >
          <Wrench size={14} className="text-slate-400" /> Add PM
        </button>
        <button
          type="button"
          onClick={onAddQA}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 shadow-sm transition-all"
        >
          <CheckSquare size={14} className="text-slate-400" /> Add QA
        </button>
        <button
          type="button"
          onClick={onAddNote}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 shadow-sm transition-all"
        >
          <FileText size={14} className="text-slate-400" /> Add Note
        </button>
        <div className="w-px h-5 bg-slate-300 mx-1 hidden sm:block" />
        <button
          type="button"
          onClick={onExportReport}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-sm transition-all"
        >
          <Upload size={14} /> Export Report
        </button>
      </div>
    </div>
  );
}
