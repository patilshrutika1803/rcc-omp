import { X, RotateCcw, Edit2, CheckCircle2, Archive, FileDown, ClipboardList } from "lucide-react";
import type { BackupJob } from "../../types/backup";
import { computeUsedPct } from "../../utils/backupCalculations";
import { BkpStatusBadge } from "./BackupStatusBadge";
import { BkpTypeBadge } from "./BackupTypeBadge";
import { exportBackupJobPdf } from "../../utils/backupPdf";

export function BackupJobDrawer({ job, onClose, onEdit, onRunNow, onViewExecution }: {
  job: BackupJob;
  onClose: () => void;
  onEdit: () => void;
  onRunNow: () => void;
  onViewExecution: () => void;
}) {
  const usedPct = computeUsedPct(job.sizeGB, job.quota);
  const latestExecution = job.history[0]?.executionDetails;
  const isCompleted = job.status === "Completed";
  const reminderLabel = job.reminder || "None";
  const dueDateLabel = job.nextBackup || "—";

  return (
    <div className="fixed inset-0 z-[60] flex">
      <div className="flex-1 bg-slate-900/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="w-full max-w-[540px] bg-white border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 max-h-screen">
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center shrink-0">
                <Archive size={18} className="text-blue-600" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-slate-900 truncate">{job.name}</h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">{job.id} · {job.server || "Backup Job"}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors shrink-0">
              <X size={18} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <BkpStatusBadge status={job.status} />
            <BkpTypeBadge type={job.backupType} />
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
              <RotateCcw size={10} /> {job.frequency}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="space-y-4">
            {job.status === "Running" && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex justify-between text-xs font-semibold text-blue-700 mb-2">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> Running…</span>
                  <span>{job.progress}%</span>
                </div>
                <div className="w-full bg-blue-100 rounded-full h-2">
                  <div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${job.progress}%` }} />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(isCompleted ? [
                { label: "Execution Details", value: `${latestExecution?.backupDate || job.lastBackup} · ${latestExecution?.backupTime || "—"}` },
                { label: "Backup Size", value: `${latestExecution?.backupSize || job.sizeGB} ${latestExecution?.unit || "GB"}` },
                { label: "Done By", value: latestExecution?.doneBy || job.user },
                { label: "Verified By", value: latestExecution?.verifiedBy || job.lastVerified || "—" },
                { label: "Backup Date", value: latestExecution?.backupDate || job.lastBackup || "—" },
                { label: "Backup Time", value: latestExecution?.backupTime || "—" },
              ] : [
                { label: "Job Information", value: job.name },
                { label: "Institution", value: latestExecution?.institutionName || "—" },
                { label: "Department", value: job.department },
                { label: "Frequency", value: job.frequency },
                { label: "Reminder", value: reminderLabel },
                { label: "Priority", value: job.priority || "Medium" },
                { label: "Due Date", value: dueDateLabel },
              ]).map((item) => (
                <div key={item.label} className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{item.label}</div>
                  <div className="text-xs font-semibold text-slate-900 break-words">{item.value}</div>
                </div>
              ))}
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex justify-between items-center mb-3 gap-2">
                <span className="text-xs font-bold text-slate-700">Storage Used</span>
                <span className="text-sm font-bold text-slate-900">{job.sizeGB} GB / {job.quota} GB</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 mb-2">
                <div className={`h-2.5 rounded-full ${usedPct > 80 ? "bg-red-500" : usedPct > 60 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${Math.min(usedPct, 100)}%` }} />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Used: {job.sizeGB} GB</span>
                <span>Quota: {job.quota} GB</span>
              </div>
            </div>

            {isCompleted ? (
              <div className="space-y-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-emerald-700 font-semibold">Execution Details</div>
                    <div className="mt-1 text-slate-700">{latestExecution?.backupDate || job.lastBackup} · {latestExecution?.backupTime || "—"}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-emerald-700 font-semibold">Done By</div>
                    <div className="mt-1 text-slate-700">{latestExecution?.doneBy || job.user}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-emerald-700 font-semibold">Verified By</div>
                    <div className="mt-1 text-slate-700">{latestExecution?.verifiedBy || job.lastVerified || "—"}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-emerald-700 font-semibold">Backup Size</div>
                    <div className="mt-1 text-slate-700">{latestExecution?.backupSize || job.sizeGB} {latestExecution?.unit || "GB"}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-emerald-700 font-semibold">Backup Date</div>
                    <div className="mt-1 text-slate-700">{latestExecution?.backupDate || job.lastBackup || "—"}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-emerald-700 font-semibold">Backup Time</div>
                    <div className="mt-1 text-slate-700">{latestExecution?.backupTime || "—"}</div>
                  </div>
                </div>
                {latestExecution?.executionNotes && (
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-emerald-700 font-semibold">Execution Notes</div>
                    <div className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{latestExecution.executionNotes}</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
                <div className="text-xs text-emerald-600 font-semibold mb-1">Last Verified</div>
                <div className="text-sm font-bold text-emerald-800">{job.lastVerified}</div>
              </div>
            )}

            {job.description && (
              <div>
                <div className="text-xs font-bold text-slate-700 mb-2">Description</div>
                <div className="text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-xl p-3 leading-relaxed">{job.description}</div>
              </div>
            )}
          </div>
        </div>

        <div className="px-4 sm:px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-wrap gap-2 shrink-0">
          <button onClick={onEdit} className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
            <Edit2 size={13} /> Edit
          </button>
          {isCompleted ? (
            <>
              <button onClick={() => { onViewExecution(); onClose(); }} className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-200 rounded-lg hover:bg-sky-100 transition-colors">
                <ClipboardList size={13} /> View Execution Form
              </button>
              <button onClick={() => exportBackupJobPdf(job)} className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                <FileDown size={13} /> Export PDF
              </button>
            </>
          ) : (
            <button onClick={onRunNow} className="flex-1 min-w-[180px] flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors">
              <CheckCircle2 size={13} /> Complete Backup
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
