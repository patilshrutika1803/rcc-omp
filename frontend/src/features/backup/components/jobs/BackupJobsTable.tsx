import React, { useMemo, useState } from "react";
import {
  Archive, RotateCcw, Eye, CheckCircle2, Edit2, MoreHorizontal, Copy, Trash2,
  ArrowUpDown, ChevronUp, ChevronDown, Download, History as HistoryIcon,
} from "lucide-react";
import type { BackupJob } from "../../types/backup";
import { bkpCompare, matchesBackupJobSearchAndFilters, userInitials } from "../../utils/backupHelpers";
import { BkpStatusBadge } from "./BackupStatusBadge";
import { BackupPagination } from "./BackupPagination";

export function BackupJobsTable({
  jobs,
  searchQuery,
  statusFilter,
  typeFilter,
  onViewJob,
  onViewExecution,
  onEdit,
  onRunNow,
  onDuplicate,
  onSnooze,
  onDelete,
  onExportPdf,
}: {
  jobs: BackupJob[];
  searchQuery: string;
  statusFilter: string;
  typeFilter: string;
  onViewJob: (j: BackupJob) => void;
  onViewExecution: (j: BackupJob) => void;
  onEdit: (j: BackupJob) => void;
  onRunNow: (j: BackupJob) => void;
  onDuplicate: (j: BackupJob) => void;
  onSnooze: (j: BackupJob) => void;
  onDelete: (j: BackupJob) => void;
  onExportPdf: (j: BackupJob) => void;
}) {
  const [sortField, setSortField] = useState("nextBackup");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [openMoreId, setOpenMoreId] = useState<string | null>(null);

  const filtered = useMemo(
    () => [...jobs]
      .filter((job) => matchesBackupJobSearchAndFilters(job, searchQuery, statusFilter, typeFilter))
      .sort((a, b) => bkpCompare(a, b, sortField, sortDir)),
    [jobs, searchQuery, statusFilter, typeFilter, sortField, sortDir]
  );

  const handleSort = (field: string) => {
    if (sortField === field) setSortDir(current => current === "asc" ? "desc" : "asc");
    else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ field }: { field: string }) =>
    sortField !== field ? <ArrowUpDown size={11} className="text-slate-300" /> :
      sortDir === "asc" ? <ChevronUp size={11} className="text-blue-500" /> : <ChevronDown size={11} className="text-blue-500" />;

  return (
    <div className="space-y-4" onClick={() => setOpenMoreId(null)}>
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/50">
          <span className="text-xs font-semibold text-slate-500">
            Showing <span className="font-bold text-slate-900">{filtered.length}</span> of {jobs.length} jobs
          </span>
          <span className="text-[11px] text-slate-400">Sorted by {sortField}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50/70 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-4 py-3"><button onClick={() => handleSort("name")} className="flex items-center gap-1.5 hover:text-slate-700">Job Name <SortIcon field="name" /></button></th>
                <th className="px-4 py-3">Frequency</th>
                <th className="px-4 py-3"><button onClick={() => handleSort("lastBackup")} className="flex items-center gap-1.5 hover:text-slate-700">Last Backup <SortIcon field="lastBackup" /></button></th>
                <th className="px-4 py-3"><button onClick={() => handleSort("nextBackup")} className="flex items-center gap-1.5 hover:text-slate-700">Next Backup <SortIcon field="nextBackup" /></button></th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Progress</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(job => (
                <tr key={job.id} className="hover:bg-emerald-50/20 group cursor-pointer transition-colors" onClick={() => onViewJob(job)}>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                        <Archive size={12} className="text-emerald-600" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{job.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{job.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                      <RotateCcw size={10} /> {job.frequency}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-500 font-mono">{job.lastBackup}</td>
                  <td className="px-4 py-3.5 text-xs text-slate-500 font-mono">{job.nextBackup}</td>
                  <td className="px-4 py-3.5"><BkpStatusBadge status={job.status} /></td>
                  <td className="px-4 py-3.5">
                    {job.status === "Running" ? (
                      <div className="flex items-center gap-2 min-w-[80px]">
                        <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                          <div className="h-1.5 rounded-full bg-emerald-500 transition-all" style={{ width: `${job.progress}%` }} />
                        </div>
                        <span className="text-[11px] font-bold text-emerald-600">{job.progress}%</span>
                      </div>
                    ) : job.status === "Completed" ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-full bg-emerald-100 rounded-full h-1.5 min-w-[60px]">
                          <div className="h-1.5 rounded-full bg-emerald-500 w-full" />
                        </div>
                        <span className="text-[11px] font-bold text-emerald-600">100%</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[9px] font-bold shrink-0">
                        {userInitials(job.user)}
                      </div>
                      <span className="text-xs text-slate-600">{job.user.split(" ")[0]}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right" onClick={event => event.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button title="View Details" className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" onClick={() => onViewJob(job)}><Eye size={13} /></button>
                      {job.status === "Completed" ? (
                        <>
                          <button title="View Execution Form" className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-md transition-colors" onClick={() => onViewExecution(job)}><HistoryIcon size={13} /></button>
                          <button title="Export PDF" className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" onClick={() => onExportPdf(job)}><Download size={13} /></button>
                        </>
                      ) : (
                        <button title="Complete Backup" className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" onClick={() => onRunNow(job)}><CheckCircle2 size={13} /></button>
                      )}
                      <button title="Edit" className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" onClick={() => onEdit(job)}><Edit2 size={13} /></button>
                      <div className="relative">
                        <button
                          title="More"
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                          onClick={event => { event.stopPropagation(); setOpenMoreId(openMoreId === job.id ? null : job.id); }}
                        >
                          <MoreHorizontal size={13} />
                        </button>
                        {openMoreId === job.id && (
                          <div className="absolute right-0 top-8 z-50 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1 animate-in fade-in zoom-in-95 duration-150">
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
                                <button className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors" onClick={() => { onSnooze(job); setOpenMoreId(null); }}>
                                  <HistoryIcon size={13} className="text-slate-400" /> Snooze
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <Archive size={32} className="text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700">No Backup Records Found</p>
              <p className="text-xs text-slate-400 mt-1">
                {jobs.length === 0 ? "Get started by adding your first backup job." : "Try adjusting your search or filters."}
              </p>
            </div>
          )}
        </div>

        {filtered.length > 0 && <BackupPagination />}
      </div>
    </div>
  );
}
