import React from "react";
import { MoreVertical, AlarmClock, CheckCircle2 } from "lucide-react";
import type { PMRecord } from "../types/pm";
import { machineIcon } from "../utils/pmHelpers";
import { daysUntil, formatDate } from "../utils/pmDateUtils";
import { StatusBadge } from "./StatusBadge";
import { PriorityBadge } from "./PriorityBadge";

export function PMCardView({ data, onViewDetails, onComplete, onSnooze }: {
  data: PMRecord[];
  onViewDetails: (r: PMRecord) => void;
  onComplete: (r: PMRecord) => void;
  onSnooze: (r: PMRecord) => void;
}) {
  if (data.length === 0) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {data.map(record => {
        const Icon = machineIcon(record.department);
        const days = daysUntil(record.nextDue);
        return (
          <div
            key={record.id}
            className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all group cursor-pointer flex flex-col"
            onClick={() => onViewDetails(record)}
          >
            <div className="p-4 flex-1">
              {/* Card Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                    <Icon size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 leading-tight">{record.machine}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">{record.machineId}</div>
                  </div>
                </div>
                <button
                  onClick={e => e.stopPropagation()}
                  className="p-1 text-slate-300 hover:text-slate-600 rounded opacity-0 group-hover:opacity-100 transition-all"
                >
                  <MoreVertical size={15} />
                </button>
              </div>

              {/* Status + Priority */}
              <div className="flex gap-2 mb-4 flex-wrap">
                <StatusBadge status={record.status} />
                <PriorityBadge priority={record.priority} />
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                <div className="bg-slate-50 rounded-lg p-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Department</div>
                  <div className="font-semibold text-slate-700 text-[11px] truncate">{record.department}</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Frequency</div>
                  <div className="font-semibold text-slate-700 text-[11px]">{record.frequency}</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">User</div>
                  <div className="font-semibold text-slate-700 text-[11px] truncate">{record.user}</div>
                </div>
                <div className={`rounded-lg p-2 ${days < 0 ? "bg-red-50" : days === 0 ? "bg-blue-50" : "bg-amber-50"}`}>
                  <div className={`text-[10px] font-bold uppercase mb-0.5 ${days < 0 ? "text-red-400" : days === 0 ? "text-blue-400" : "text-amber-400"}`}>Due Date</div>
                  <div className={`font-bold text-[11px] ${days < 0 ? "text-red-700" : days === 0 ? "text-blue-700" : "text-amber-700"}`}>
                    {days === 0 ? "Today" : days < 0 ? `${Math.abs(days)}d overdue` : `In ${days}d`}
                  </div>
                </div>
              </div>

              {/* Progress indicator */}
              <div className="border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
                  <span>Last PM: {formatDate(record.lastMaintenance)}</span>
                  <span className="font-semibold text-slate-700">{record.history.length} records</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all ${days < 0 ? "bg-red-500" : days <= 3 ? "bg-amber-500" : "bg-emerald-500"}`}
                    style={{ width: `${Math.max(10, Math.min(100, 100 - (days / 30) * 100))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="border-t border-slate-100 px-4 py-3 flex gap-2" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => onSnooze(record)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-100 rounded-lg hover:bg-amber-100 transition-colors"
              >
                <AlarmClock size={12} /> Snooze
              </button>
              <button
                onClick={() => onComplete(record)}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <CheckCircle2 size={12} /> Complete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default PMCardView;
