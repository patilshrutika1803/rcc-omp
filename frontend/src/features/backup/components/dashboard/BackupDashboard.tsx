import React from "react";
import { Archive } from "lucide-react";
import type { BackupJob } from "../../types/backup";
import { computeBackupKpi, computeSuccessRate, getTodayJobs } from "../../utils/backupCalculations";
import { KPICards } from "./KPICards";
import { BackupTimeline } from "./BackupTimeline";
import { BkpTypeBadge } from "../jobs/BackupTypeBadge";
import { BkpStatusBadge } from "../jobs/BackupStatusBadge";

export function BackupDashboard({ jobs, onViewJob }: { jobs: BackupJob[]; onViewJob: (j: BackupJob) => void }) {
  const kpi = computeBackupKpi(jobs);
  const successRate = computeSuccessRate(jobs, kpi);
  const todayJobs = getTodayJobs(jobs);
  const todayLabel = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="space-y-5">
      <KPICards kpi={kpi} successRate={successRate} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Today's Backup Jobs</h3>
            <span className="text-xs font-semibold text-slate-500">{todayJobs.length} jobs · {todayLabel}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-slate-50/70 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Job</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {todayJobs.map(job => (
                  <tr key={job.id} className="hover:bg-blue-50/20 cursor-pointer transition-colors" onClick={() => onViewJob(job)}>
                    <td className="px-5 py-3.5">
                      <div className="text-xs font-bold text-slate-900">{job.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{job.server}</div>
                    </td>
                    <td className="px-4 py-3.5"><BkpTypeBadge type={job.backupType} /></td>
                    <td className="px-4 py-3.5 text-xs text-slate-500 font-mono">{job.lastBackup?.split(" ")[1] ?? "—"}</td>
                    <td className="px-4 py-3.5 text-xs font-semibold text-slate-700">{job.sizeGB > 0 ? `${job.sizeGB} GB` : "—"}</td>
                    <td className="px-4 py-3.5"><BkpStatusBadge status={job.status} /></td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">{job.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {todayJobs.length === 0 && (
              <div className="py-16 text-center">
                <Archive size={32} className="text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-700">No Backup Records Found</p>
                <p className="text-xs text-slate-400 mt-1">Backup job activity will appear here once jobs are added.</p>
              </div>
            )}
          </div>
        </div>

        <BackupTimeline jobs={jobs} />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900">7-Day Success Trend</h3>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-500"><span className="w-2 h-2 rounded-sm bg-emerald-500 inline-block" /> Success</span>
            <span className="flex items-center gap-1.5 text-slate-500"><span className="w-2 h-2 rounded-sm bg-red-400 inline-block" /> Failed</span>
          </div>
        </div>
        <div className="h-[160px] flex items-center justify-center text-xs text-slate-400">
          No data available
        </div>
      </div>
    </div>
  );
}
