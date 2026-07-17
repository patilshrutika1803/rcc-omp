import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PMRecord } from "../types/pm";
import { CALENDAR_LEGEND } from "../constants/pmConstants";

export function PMCalendarView({ data }: { data: PMRecord[] }) {
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState({ year: now.getFullYear(), month: now.getMonth() }); // 0-indexed month

  const monthName = new Date(currentMonth.year, currentMonth.month, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const firstDay = new Date(currentMonth.year, currentMonth.month, 1).getDay();
  const daysInMonth = new Date(currentMonth.year, currentMonth.month + 1, 0).getDate();
  const today = new Date();

  const getTasksForDay = (day: number) => {
    const dateStr = `${currentMonth.year}-${String(currentMonth.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return data.filter(r => r.nextDue === dateStr || r.lastMaintenance === dateStr);
  };

  const prevMonth = () => {
    setCurrentMonth(prev => {
      const m = prev.month === 0 ? 11 : prev.month - 1;
      const y = prev.month === 0 ? prev.year - 1 : prev.year;
      return { year: y, month: m };
    });
  };

  const nextMonth = () => {
    setCurrentMonth(prev => {
      const m = prev.month === 11 ? 0 : prev.month + 1;
      const y = prev.month === 11 ? prev.year + 1 : prev.year;
      return { year: y, month: m };
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-bold text-slate-900">{monthName}</h3>
          <div className="flex gap-1">
            {CALENDAR_LEGEND.map(l => (
              <div key={l.label} className="flex items-center gap-1 text-[10px] text-slate-500 ml-2">
                <div className={`w-2 h-2 rounded-full ${l.color}`} />
                {l.label}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={prevMonth} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setCurrentMonth({ year: new Date().getFullYear(), month: new Date().getMonth() })}
            className="px-3 py-1 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Today
          </button>
          <button onClick={nextMonth} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 border-b border-slate-100">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
          <div key={d} className="py-3 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {/* Empty cells for offset */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="min-h-[110px] border-b border-r border-slate-100 bg-slate-50/30 p-2">
            <span className="text-[11px] text-slate-300">
              {new Date(currentMonth.year, currentMonth.month, -firstDay + i + 1).getDate()}
            </span>
          </div>
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayDate = new Date(currentMonth.year, currentMonth.month, day);
          const isToday = dayDate.toDateString() === today.toDateString();
          const tasks = getTasksForDay(day);
          const isWeekend = dayDate.getDay() === 0 || dayDate.getDay() === 6;

          return (
            <div
              key={day}
              className={`min-h-[110px] border-b border-r border-slate-100 p-2 transition-colors hover:bg-slate-50/50 ${
                isWeekend ? "bg-slate-50/20" : "bg-white"
              }`}
            >
              <div className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold mb-1.5 ${
                isToday ? "bg-blue-600 text-white" : "text-slate-700"
              }`}>
                {day}
              </div>
              <div className="space-y-1">
                {tasks.slice(0, 3).map(task => {
                  const isOverdue = task.status === "Overdue";
                  const isDue = task.status === "Due Today";
                  const isCompleted = task.status === "Completed";
                  return (
                    <div
                      key={task.id}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold truncate border cursor-pointer hover:opacity-80 ${
                        isOverdue ? "bg-red-50 text-red-700 border-red-200"
                        : isDue ? "bg-blue-50 text-blue-700 border-blue-200"
                        : isCompleted ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-50 text-slate-600 border-slate-200"
                      }`}
                      title={`${task.machine} — ${task.user}`}
                    >
                      {task.machine.split(" ").slice(0, 2).join(" ")}
                    </div>
                  );
                })}
                {tasks.length > 3 && (
                  <div className="text-[10px] text-slate-400 font-medium pl-1">+{tasks.length - 3} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PMCalendarView;
