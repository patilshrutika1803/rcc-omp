// ─────────────────────────────────────────────────────────────────────────────
// DepartmentCalendar
// Extracted from the original DeptCalendarTab in the monolithic
// DepartmentsPage.tsx. UI/behavior unchanged. This tab IS rendered in the
// exported DepartmentsPage (Calendar tab).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { DepartmentCalendarEvent } from "../types/department";
import { CALENDAR_EVENT_TYPES, CALENDAR_LEGEND } from "../constants/departmentConfig";

export interface DepartmentCalendarProps {
  events: DepartmentCalendarEvent[];
  /** Reference "today" date and initial month/year to display. Defaults to the current date. */
  today?: Date;
  initialYear?: number;
  initialMonth?: number; // 0-indexed
}

export default function DepartmentCalendar({
  events,
  today = new Date(),
  initialYear = today.getFullYear(),
  initialMonth = today.getMonth(),
}: DepartmentCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState({ year: initialYear, month: initialMonth });
  const [filterType, setFilterType] = useState("all");

  const monthName = new Date(currentMonth.year, currentMonth.month, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
  const firstDay = new Date(currentMonth.year, currentMonth.month, 1).getDay();
  const daysInMonth = new Date(currentMonth.year, currentMonth.month + 1, 0).getDate();

  const getEvents = (day: number) => {
    const dateStr = `${currentMonth.year}-${String(currentMonth.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter(e => e.date === dateStr && (filterType === "all" || e.type === filterType));
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <h3 className="text-sm font-bold text-slate-900">{monthName}</h3>
            <div className="flex flex-wrap gap-2">
              {CALENDAR_LEGEND.map(l => (
                <div key={l.label} className="flex items-center gap-1 text-[10px] text-slate-500">
                  <div className={`w-2 h-2 rounded-full ${l.color}`} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() =>
                setCurrentMonth(p => {
                  const m = p.month === 0 ? 11 : p.month - 1;
                  return { year: p.month === 0 ? p.year - 1 : p.year, month: m };
                })
              }
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentMonth({ year: today.getFullYear(), month: today.getMonth() })}
              className="px-3 py-1 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Today
            </button>
            <button
              onClick={() =>
                setCurrentMonth(p => {
                  const m = p.month === 11 ? 0 : p.month + 1;
                  return { year: p.month === 11 ? p.year + 1 : p.year, month: m };
                })
              }
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="px-5 py-2 border-b border-slate-100 flex gap-2 overflow-x-auto">
          {CALENDAR_EVENT_TYPES.map(t => (
            <button
              key={t.id}
              onClick={() => setFilterType(t.id)}
              className={`h-7 px-3 text-[11px] font-semibold rounded-lg whitespace-nowrap transition-colors ${
                filterType === t.id ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-7 border-b border-slate-100">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
            <div key={d} className="py-3 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`e${i}`} className="min-h-[110px] border-b border-r border-slate-100 bg-slate-50/30 p-2">
              <span className="text-[11px] text-slate-300">
                {new Date(currentMonth.year, currentMonth.month, -firstDay + i + 1).getDate()}
              </span>
            </div>
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayDate = new Date(currentMonth.year, currentMonth.month, day);
            const isToday = dayDate.toDateString() === today.toDateString();
            const dayEvents = getEvents(day);
            const isWkd = dayDate.getDay() === 0 || dayDate.getDay() === 6;
            return (
              <div
                key={day}
                className={`min-h-[110px] border-b border-r border-slate-100 p-2 transition-colors hover:bg-slate-50/50 ${
                  isWkd ? "bg-slate-50/20" : "bg-white"
                }`}
              >
                <div
                  className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold mb-1.5 ${
                    isToday ? "bg-blue-600 text-white" : "text-slate-700"
                  }`}
                >
                  {day}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((ev, ei) => (
                    <div
                      key={ei}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold truncate border cursor-pointer hover:opacity-80 ${ev.color}`}
                      title={ev.title}
                    >
                      {ev.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-[10px] text-slate-400 font-medium pl-1">+{dayEvents.length - 3} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
