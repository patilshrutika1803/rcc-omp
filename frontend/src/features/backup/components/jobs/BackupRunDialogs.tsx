import React from "react";
import { RefreshCw } from "lucide-react";
import type { BackupJob } from "../../types/backup";

export function RunConfirmDialog({ job, onConfirm, onCancel }: { job: BackupJob; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm z-10 animate-in fade-in zoom-in-95 duration-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center">
            <RefreshCw size={18} className="text-emerald-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Run this backup now?</h2>
            <p className="text-xs text-slate-500 mt-0.5">{job.name}</p>
          </div>
        </div>
        <p className="text-xs text-slate-600 mb-6 leading-relaxed">This will immediately trigger the backup job outside its scheduled window. Any currently running jobs will not be interrupted.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors">Run Backup</button>
        </div>
      </div>
    </div>
  );
}

export function RunAllConfirmDialog({ jobCount, onConfirm, onCancel }: { jobCount: number; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm z-10 animate-in fade-in zoom-in-95 duration-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center">
            <RefreshCw size={18} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Run All Backup Jobs?</h2>
            <p className="text-xs text-slate-500 mt-0.5">{jobCount} jobs will be executed sequentially</p>
          </div>
        </div>
        <p className="text-xs text-slate-600 mb-6 leading-relaxed">This will trigger all {jobCount} backup jobs sequentially. The process may take several minutes to complete.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">Run All</button>
        </div>
      </div>
    </div>
  );
}
