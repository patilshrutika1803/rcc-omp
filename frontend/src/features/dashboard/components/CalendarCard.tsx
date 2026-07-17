// ─────────────────────────────────────────────────────────────────────────────
// CalendarCard
// Month calendar grid with task/overdue markers driven by props.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CalendarEvent } from "../types/dashboard";
import { CALENDAR_WEEKDAY_LABELS } from "../constants/dashboardConfig";

interface CalendarCardProps {
  monthLabel: string;
  today: number;
  daysInMonth: number;
  leadingDays: number[];
  events: CalendarEvent[];
}

export default function CalendarCard({ monthLabel, today, daysInMonth, leadingDays, events }: CalendarCardProps) {
  const eventsByDay = new Map(events.map((e) => [e.day, e]));

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-slate-900">{monthLabel}</h3>
        <div className="flex gap-1">
          <button className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100"><ChevronLeft size={16} /></button>
          <button className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100"><ChevronRight size={16} /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {CALENDAR_WEEKDAY_LABELS.map((d, i) => (
          <div key={i} className="text-[10px] font-bold text-slate-400">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {leadingDays.map((d) => (
          <div key={`cal-prev-${d}`} className="p-1.5 text-slate-300">{d}</div>
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const isToday = day === today;
          const event = eventsByDay.get(day);
          const hasTask = Boolean(event?.hasTask);
          const isOverdue = Boolean(event?.isOverdue);
          return (
            <div key={day} className={`p-1.5 rounded-md relative cursor-pointer ${isToday ? "bg-blue-600 text-white font-bold" : "text-slate-700 hover:bg-slate-100"} ${hasTask && !isToday ? "font-semibold" : ""}`}>
              {day}
              {hasTask && !isToday && (
                <div className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${isOverdue ? "bg-red-500" : "bg-blue-500"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
