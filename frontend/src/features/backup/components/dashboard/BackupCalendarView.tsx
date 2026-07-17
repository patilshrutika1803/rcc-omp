import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { BackupJob } from "../../types/backup";
import { getJobsForDay, isJobNextOnDay } from "../../utils/backupHelpers";
import { BKP_CALENDAR_LEGEND, BKP_CALENDAR_WEEKDAYS } from "../../constants/backupConstants";

export function BackupCalendarView({ jobs }: { jobs: BackupJob[] }) {
  const [currentMonth, setCurrentMonth] = useState({ year: 2026, month: 6 });
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set());

  const monthName = new Date(currentMonth.year, currentMonth.month, 1)
    .toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const firstDay    = new Date(currentMonth.year, currentMonth.month, 1).getDay();
  const daysInMonth = new Date(currentMonth.year, currentMonth.month + 1, 0).getDate();
  const today       = new Date("2026-07-03");

  const prev = () => { setCurrentMonth(p => ({ year: p.month === 0 ? p.year - 1 : p.year, month: p.month === 0 ? 11 : p.month - 1 })); setExpandedDays(new Set()); };
  const next = () => { setCurrentMonth(p => ({ year: p.month === 11 ? p.year + 1 : p.year, month: p.month === 11 ? 0  : p.month + 1 })); setExpandedDays(new Set()); };

  const toggleDay = (day: number) => setExpandedDays(prev => {
    const s = new Set(prev);
    s.has(day) ? s.delete(day) : s.add(day);
    return s;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Calendar header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-bold text-slate-900">{monthName}</h3>
          <div className="flex gap-3 text-[11px]">
            {BKP_CALENDAR_LEGEND.map(l => (
              <div key={l.label} className="flex items-center gap-1.5 text-slate-500">
                <div className={`w-2 h-2 rounded-full ${l.color}`} /> {l.label}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={prev} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"><ChevronLeft size={16} /></button>
          <button onClick={() => { setCurrentMonth({ year: 2026, month: 6 }); setExpandedDays(new Set()); }} className="px-3 py-1 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Today</button>
          <button onClick={next} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"><ChevronRight size={16} /></button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-slate-100">
        {BKP_CALENDAR_WEEKDAYS.map(d => (
          <div key={`bkp-cal-hdr-${d}`} className="py-3 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`bkp-cal-empty-${i}`} className="min-h-[100px] border-b border-r border-slate-100 bg-slate-50/30 p-2">
            <span className="text-[11px] text-slate-300">
              {new Date(currentMonth.year, currentMonth.month, -firstDay + i + 1).getDate()}
            </span>
          </div>
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day        = i + 1;
          const dayDate    = new Date(currentMonth.year, currentMonth.month, day);
          const isToday    = dayDate.toDateString() === today.toDateString();
          const dayJobs    = getJobsForDay(jobs, currentMonth.year, currentMonth.month, day);
          const isWknd     = dayDate.getDay() === 0 || dayDate.getDay() === 6;
          const isExpanded = expandedDays.has(day);
          const overflow   = dayJobs.length - 3;
          const visible    = isExpanded ? dayJobs : dayJobs.slice(0, 3);
          return (
            <div key={`bkp-cal-day-${day}`} className={`min-h-[100px] border-b border-r border-slate-100 p-2 transition-colors hover:bg-slate-50/50 ${isWknd ? "bg-slate-50/20" : "bg-white"}`}>
              <div className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold mb-1 ${isToday ? "bg-blue-600 text-white" : "text-slate-700"}`}>
                {day}
              </div>
              <div className="space-y-1">
                {visible.map((j, ji) => {
                  const isNext = isJobNextOnDay(j, currentMonth.year, currentMonth.month, day);
                  const dotColor = isNext ? "bg-slate-50 text-slate-600 border-slate-200"
                    : j.status === "Completed" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : j.status === "Failed"    ? "bg-red-50 text-red-700 border-red-200"
                    : j.status === "Running"   ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-slate-50 text-slate-600 border-slate-200";
                  return (
                    <div key={`bkp-cal-job-${j.id}-${ji}`} className={`px-1.5 py-0.5 rounded text-[10px] font-semibold truncate border cursor-pointer hover:opacity-80 ${dotColor}`} title={j.name}>
                      {j.name.split(" ").slice(0, 2).join(" ")}
                    </div>
                  );
                })}
                {overflow > 0 && !isExpanded && (
                  <button onClick={() => toggleDay(day)} className="text-[10px] text-blue-500 pl-1 hover:text-blue-700 font-semibold w-full text-left hover:underline">
                    +{overflow} more
                  </button>
                )}
                {isExpanded && overflow > 0 && (
                  <button onClick={() => toggleDay(day)} className="text-[10px] text-slate-400 pl-1 hover:text-slate-600 font-semibold w-full text-left hover:underline">
                    Show less
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
