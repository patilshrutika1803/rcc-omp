import React from "react";
import { CalendarClock, Archive } from "lucide-react";
import type { BackupJob } from "../../types/backup";
import { groupJobsForTimeline } from "../../utils/backupHelpers";
import { BkpStatusBadge } from "../jobs/BackupStatusBadge";

function Section({ title, items, accent }: { title: string; items: BackupJob[]; accent: string }) {
  if (!items.length) return null;
  return (
    <div className="mb-5">
      <div className={`flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider ${accent}`}>
        <div className="w-1.5 h-1.5 rounded-full bg-current" />
        {title}
        <span className="ml-auto font-bold text-current bg-current/10 px-2 py-0.5 rounded-full text-[10px]">{items.length}</span>
      </div>
      <div className="space-y-2">
        {items.map(j => (
          <div key={j.id} className="flex items-center gap-3 p-2.5 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
            <div className="w-7 h-7 bg-slate-50 rounded-lg flex items-center justify-center shrink-0 border border-slate-100">
              <Archive size={12} className="text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">{j.name}</div>
              <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                <span>{j.server}</span><span>·</span>
                <span>{j.status === "Running" ? j.nextBackup.split(" ")[1] : j.nextBackup.split(" ")[1]}</span>
              </div>
            </div>
            <BkpStatusBadge status={j.status} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function BackupTimeline({ jobs }: { jobs: BackupJob[] }) {
  const { today, tomorrow, later } = groupJobsForTimeline(jobs);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-5">
        <CalendarClock size={16} className="text-blue-500" /> Backup Timeline
      </h3>
      <Section title="Today & Running" items={today}    accent="text-blue-600"  />
      <Section title="Tomorrow"        items={tomorrow}  accent="text-slate-600" />
      <Section title="Coming Up"       items={later}     accent="text-slate-400" />
      {jobs.length === 0 && (
        <div className="py-8 text-center">
          <CalendarClock size={28} className="text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-700">No Backup Records Found</p>
          <p className="text-[11px] text-slate-400 mt-1">Scheduled and running jobs will show up here.</p>
        </div>
      )}
    </div>
  );
}
