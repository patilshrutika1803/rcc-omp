import React from "react";
import { CalendarClock, CalendarCheck } from "lucide-react";
import type { PMRecord } from "../types/pm";
import { machineIcon } from "../utils/pmHelpers";
import { daysUntil } from "../utils/pmDateUtils";
import { PriorityBadge } from "./PriorityBadge";

function TimelineSection({ title, items, accent }: { title: string; items: PMRecord[]; accent: string }) {
  if (items.length === 0) return null;
  return (
    <div className="mb-5">
      <div className={`flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider ${accent}`}>
        <div className="w-1.5 h-1.5 rounded-full bg-current" />
        {title}
        <span className="ml-auto font-bold text-current bg-current/10 px-2 py-0.5 rounded-full text-[10px]">
          {items.length}
        </span>
      </div>
      <div className="space-y-2">
        {items.map(r => {
          const Icon = machineIcon(r.department);
          return (
            <div key={r.id} className="flex items-center gap-3 p-2.5 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
              <div className="w-7 h-7 bg-slate-50 rounded-lg flex items-center justify-center shrink-0 border border-slate-100">
                <Icon size={12} className="text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">{r.machine}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                  <span>{r.user}</span>
                  <span>·</span>
                  <span>{r.frequency}</span>
                </div>
              </div>
              <PriorityBadge priority={r.priority} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MaintenanceTimeline({ data }: { data: PMRecord[] }) {
  // Timeline should display ONLY:
  // - Upcoming
  // - Due Today
  // - Overdue
  // - In Progress
  // Completed must disappear immediately.
  const overdue = data.filter(r => r.status === "Overdue" || daysUntil(r.nextDue) < 0);
  const dueToday = data.filter(r => r.status === "Due Today" || daysUntil(r.nextDue) === 0);
  const inProgress = data.filter(r => r.status === "In Progress");
  const upcoming = data.filter(r => {
    const d = daysUntil(r.nextDue);
    if (r.status === "Completed") return false;
    if (r.status === "Overdue" || d < 0) return false;
    if (r.status === "Due Today" || d === 0) return false;
    return true;
  });


  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <CalendarClock size={16} className="text-blue-500" /> Maintenance Timeline
        </h3>
      </div>
      <TimelineSection title="Overdue" items={overdue} accent="text-red-600" />
      <TimelineSection title="Due Today" items={dueToday} accent="text-blue-600" />
      <TimelineSection title="In Progress" items={inProgress} accent="text-amber-600" />
      <TimelineSection title="Upcoming" items={upcoming} accent="text-slate-700" />

      {overdue.length === 0 && dueToday.length === 0 && inProgress.length === 0 && upcoming.length === 0 && (
        <div className="text-center py-8">
          <CalendarCheck size={32} className="text-emerald-300 mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">No scheduled maintenance items to display.</p>
        </div>
      )}

    </div>
  );
}

export default MaintenanceTimeline;
