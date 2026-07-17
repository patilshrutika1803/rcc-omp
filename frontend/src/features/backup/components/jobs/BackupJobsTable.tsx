import React, { useMemo, useState } from "react";
import {
  Archive, RotateCcw, Eye, RefreshCw, Edit2, MoreHorizontal, Copy, FileText, Trash2,
  ArrowUpDown, ChevronUp, ChevronDown,
} from "lucide-react";
import type { BackupJob } from "../../types/backup";
import { filterAndSortJobs, userInitials } from "../../utils/backupHelpers";
import { BkpStatusBadge } from "./BackupStatusBadge";
import { BackupToolbar } from "./BackupToolbar";
import { BackupPagination } from "./BackupPagination";

export function BackupJobsTable({
  jobs, onViewJob, onEdit, onRunNow, onDuplicate, onDelete,
}: {
  jobs: BackupJob[];
  onViewJob: (j: BackupJob) => void;
  onEdit: (j: BackupJob) => void;
  onRunNow: (j: BackupJob) => void;
  onDuplicate: (j: BackupJob) => void;
  onDelete: (j: BackupJob) => void;
}) {
  const [search, setSearch]         = useState("");
  const [statusF, setStatusF]       = useState("");
  const [typeF, setTypeF]           = useState("");
  const [sortField, setSortField]   = useState("nextBackup");
  const [sortDir, setSortDir]       = useState<"asc"|"desc">("asc");
  const [openMoreId, setOpenMoreId] = useState<string | null>(null);

  const filtered = useMemo(
    () => filterAndSortJobs(jobs, search, statusF, typeF, sortField, sortDir),
    [jobs, search, statusF, typeF, sortField, sortDir]
  );

  const handleSort = (f: string) => {
    if (sortField === f) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(f); setSortDir("asc"); }
  };

  const SortIcon = ({ f }: { f: string }) =>
    sortField !== f ? <ArrowUpDown size={11} className="text-slate-300" /> :
    sortDir === "asc" ? <ChevronUp size={11} className="text-blue-500" /> : <ChevronDown size={11} className="text-blue-500" />;

  return (
    <div className="space-y-4" onClick={() => setOpenMoreId(null)}>
      {/* Toolbar */}
      <BackupToolbar
        search={search} onSearchChange={setSearch}
        statusF={statusF} onStatusChange={setStatusF}
        typeF={typeF} onTypeChange={setTypeF}
      />

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/50">
          <span className="text-xs font-semibold text-slate-500">
            Showing <span className="font-bold text-slate-900">{filtered.length}</span> of {jobs.length} jobs
          </span>
          <select className="h-7 px-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-600 focus:outline-none">
            <option>10 per page</option><option>25 per page</option><option>50 per page</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50/70 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-4 py-3"><button onClick={() => handleSort("name")} className="flex items-center gap-1.5 hover:text-slate-700">Job Name <SortIcon f="name" /></button></th>
                <th className="px-4 py-3">Frequency</th>
                <th className="px-4 py-3"><button onClick={() => handleSort("lastBackup")} className="flex items-center gap-1.5 hover:text-slate-700">Last Backup <SortIcon f="lastBackup" /></button></th>
                <th className="px-4 py-3"><button onClick={() => handleSort("nextBackup")} className="flex items-center gap-1.5 hover:text-slate-700">Next Backup <SortIcon f="nextBackup" /></button></th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Progress</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(job => (
                <tr key={job.id} className="hover:bg-blue-50/20 group cursor-pointer transition-colors" onClick={() => onViewJob(job)}>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center shrink-0">
                        <Archive size={12} className="text-blue-600" />
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
                          <div className="h-1.5 rounded-full bg-blue-500 transition-all" style={{ width: `${job.progress}%` }} />
                        </div>
                        <span className="text-[11px] font-bold text-blue-600">{job.progress}%</span>
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
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[9px] font-bold shrink-0">
                        {userInitials(job.user)}
                      </div>
                      <span className="text-xs text-slate-600">{job.user.split(" ")[0]}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button title="View" className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" onClick={() => onViewJob(job)}><Eye size={13} /></button>
                      <button title="Run Now" className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" onClick={() => onRunNow(job)}><RefreshCw size={13} /></button>
                      <button title="Edit" className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" onClick={() => onEdit(job)}><Edit2 size={13} /></button>
                      <div className="relative">
                        <button
                          title="More"
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                          onClick={e => { e.stopPropagation(); setOpenMoreId(openMoreId === job.id ? null : job.id); }}
                        >
                          <MoreHorizontal size={13} />
                        </button>
                        {openMoreId === job.id && (
                          <div className="absolute right-0 top-8 z-50 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1 animate-in fade-in zoom-in-95 duration-150">
                            <button className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors" onClick={() => { onDuplicate(job); setOpenMoreId(null); }}>
                              <Copy size={13} className="text-slate-400" /> Duplicate Backup Job
                            </button>
                            <button className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors" onClick={() => setOpenMoreId(null)}>
                              <FileText size={13} className="text-slate-400" /> Export as Word
                            </button>
                            <div className="my-1 border-t border-slate-100" />
                            <button className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors" onClick={() => { onDelete(job); setOpenMoreId(null); }}>
                              <Trash2 size={13} className="text-red-400" /> Delete Backup Job
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
