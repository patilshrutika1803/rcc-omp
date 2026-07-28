import React, { useState } from "react";
import { Archive, Eye, CheckCircle2, Edit2, Copy, Trash2, MoreHorizontal, History as HistoryIcon, Download } from "lucide-react";
import type { BackupJob } from "../../types/backup";
import { BkpStatusBadge } from "./BackupStatusBadge";
import { userInitials } from "../../utils/backupHelpers";

export function BackupCardView({
  jobs,
  onViewJob,
  onViewExecution,
  onEdit,
  onRunNow,
  onDuplicate,
  onDelete,
  onExportPdf,
}: {
  jobs: BackupJob[];
  onViewJob: (job: BackupJob) => void;
  onViewExecution: (job: BackupJob) => void;
  onEdit: (job: BackupJob) => void;
  onRunNow: (job: BackupJob) => void;
  onDuplicate: (job: BackupJob) => void;
  onDelete: (job: BackupJob) => void;
  onExportPdf: (job: BackupJob) => void;
}) {
  const [openMoreId, setOpenMoreId] = useState<string | null>(null);
  if (jobs.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 text-center">
        <Archive size={32} className="text-slate-300 mx-auto mb-3" />
        <p className="text-sm font-bold text-slate-700">No backup jobs match the current filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {jobs.map(job => (
        <div key={job.id} className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                <Archive size={16} className="text-emerald-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{job.name}</h3>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">{job.id}</p>
              </div>
            </div>
            <BkpStatusBadge status={job.status} />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-600">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Frequency</p>
              <p className="mt-1 font-semibold">{job.frequency}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Last Backup</p>
              <p className="mt-1 font-semibold">{job.lastBackup}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Next Backup</p>
              <p className="mt-1 font-semibold">{job.nextBackup}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">User</p>
              <div className="mt-1 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[9px] font-bold">
                  {userInitials(job.user)}
                </div>
                <span>{job.user}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 border-t border-slate-100 pt-3 flex items-center justify-end gap-1.5">
            <button title="View Details" className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" onClick={() => onViewJob(job)}>
              <Eye size={13} />
            </button>
            {job.status === "Completed" ? (
              <>
                <button title="View Execution Form" className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-md transition-colors" onClick={() => onViewExecution(job)}>
                  <HistoryIcon size={13} />
                </button>
                <button title="Export PDF" className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" onClick={() => onExportPdf(job)}>
                  <Download size={13} />
                </button>
              </>
            ) : (
              <button title="Complete Backup" className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" onClick={() => onRunNow(job)}>
                <CheckCircle2 size={13} />
              </button>
            )}
            <button title="Edit" className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" onClick={() => onEdit(job)}>
              <Edit2 size={13} />
            </button>
            <div className="relative">
              <button title="More" className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors" onClick={event => { event.stopPropagation(); setOpenMoreId(openMoreId === job.id ? null : job.id); }}>
                <MoreHorizontal size={13} />
              </button>
              {openMoreId === job.id && (
                <div className="absolute right-0 top-8 z-50 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1 animate-in fade-in zoom-in-95 duration-150">
                  <button className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors" onClick={() => { onViewJob(job); setOpenMoreId(null); }}>
                    <Eye size={13} className="text-slate-400" /> View Details
                  </button>
                  {job.status !== "Completed" ? (
                    <>
                      <button className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors" onClick={() => { onEdit(job); setOpenMoreId(null); }}>
                        <Edit2 size={13} className="text-slate-400" /> Edit
                      </button>
                      <button className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors" onClick={() => { onDuplicate(job); setOpenMoreId(null); }}>
                        <Copy size={13} className="text-slate-400" /> Duplicate
                      </button>
                      <button className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 transition-colors" onClick={() => { onRunNow(job); setOpenMoreId(null); }}>
                        <CheckCircle2 size={13} className="text-emerald-500" /> Complete Backup
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors" onClick={() => { onViewExecution(job); setOpenMoreId(null); }}>
                        <HistoryIcon size={13} className="text-slate-400" /> View Execution Form
                      </button>
                      <button className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors" onClick={() => { onExportPdf(job); setOpenMoreId(null); }}>
                        <Download size={13} className="text-slate-400" /> Export PDF
                      </button>
                    </>
                  )}
                  <div className="my-1 border-t border-slate-100" />
                  <button className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors" onClick={() => { onDelete(job); setOpenMoreId(null); }}>
                    <Trash2 size={13} className="text-red-400" /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
