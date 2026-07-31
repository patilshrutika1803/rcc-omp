import React, { useState } from "react";
import { MoreVertical, AlarmClock, CheckCircle2, ClipboardCheck, Copy, Download, Edit2, Eye, Trash2 } from "lucide-react";
import type { PMRecord } from "../types/pm";
import { machineIcon } from "../utils/pmHelpers";
import { daysUntil, formatDate, getRelativeLabel, getDueDateColor } from "../utils/pmDateUtils";
import { StatusBadge } from "./StatusBadge";
import { PriorityBadge } from "./PriorityBadge";

export function PMCardView({ data, onViewDetails, onEdit, onDuplicate, onComplete, onSnooze, onDelete, onViewChecklist, onExportPDF }: {
  data: PMRecord[];
  onViewDetails: (r: PMRecord) => void;
  onEdit: (r: PMRecord) => void;
  onDuplicate: (r: PMRecord) => void;
  onComplete: (r: PMRecord) => void;
  onSnooze: (r: PMRecord) => void;
  onDelete: (r: PMRecord) => void;
  onViewChecklist: (r: PMRecord) => void;
  onExportPDF: (r: PMRecord) => void;
}) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  if (data.length === 0) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {data.map(record => {
        const Icon = machineIcon(record.department);
        const isCompleted = record.status === "Completed";
        const displayDate = isCompleted ? record.lastMaintenance || record.nextDue : record.nextDue;
        const days = displayDate ? daysUntil(displayDate) : 0;
        const relativeLabel = isCompleted ? "Completed" : getRelativeLabel(record.nextDue);
        return (
          <div
            key={record.id}
            className="relative bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all group cursor-pointer flex flex-col"
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
                  onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === record.id ? null : record.id); }}
                  className="p-1 text-slate-300 hover:text-slate-600 rounded opacity-0 group-hover:opacity-100 transition-all"
                >
                  <MoreVertical size={15} />
                </button>
                {openMenuId === record.id && <div className="absolute right-4 top-12 z-50 bg-white border border-slate-200 rounded-xl shadow-lg py-1 w-44" onClick={e => e.stopPropagation()}>
                  <button onClick={() => { onViewDetails(record); setOpenMenuId(null); }} className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 w-full text-left"><Eye size={13} /> View Details</button>
                  {record.status === "Completed" ? <>
                    <button onClick={() => { onEdit(record); setOpenMenuId(null); }} className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 w-full text-left"><Edit2 size={13} /> Edit</button>
                    <button onClick={() => { onViewChecklist(record); setOpenMenuId(null); }} className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 w-full text-left"><ClipboardCheck size={13} /> View Checklist</button>
                    <button onClick={() => { onExportPDF(record); setOpenMenuId(null); }} className="flex items-center gap-2 px-3 py-2 text-xs text-blue-700 hover:bg-blue-50 w-full text-left"><Download size={13} /> Export PDF</button>
                  </> : <>
                    <button onClick={() => { onEdit(record); setOpenMenuId(null); }} className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 w-full text-left"><Edit2 size={13} /> Edit</button>
                    <button onClick={() => { onDuplicate(record); setOpenMenuId(null); }} className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 w-full text-left"><Copy size={13} /> Duplicate</button>
                    <button onClick={() => { onSnooze(record); setOpenMenuId(null); }} className="flex items-center gap-2 px-3 py-2 text-xs text-amber-700 hover:bg-amber-50 w-full text-left"><AlarmClock size={13} /> Snooze</button>
                    <button onClick={() => { onComplete(record); setOpenMenuId(null); }} className="flex items-center gap-2 px-3 py-2 text-xs text-emerald-700 hover:bg-emerald-50 w-full text-left"><CheckCircle2 size={13} /> Mark Complete</button>
                  </>}
                  <div className="border-t border-slate-100 mt-1 pt-1"><button onClick={() => { onDelete(record); setOpenMenuId(null); }} className="flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 w-full text-left"><Trash2 size={13} /> Delete</button></div>
                </div>}
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
                <div className={`rounded-lg p-2 ${isCompleted ? "bg-slate-50" : days < 0 ? "bg-red-50" : days === 0 ? "bg-blue-50" : "bg-amber-50"}`}>
                  <div className={`text-[10px] font-bold uppercase mb-0.5 ${isCompleted ? "text-slate-400" : days < 0 ? "text-red-400" : days === 0 ? "text-blue-400" : "text-amber-400"}`}>{isCompleted ? "Last PM" : "Due Date"}</div>
                  <div className={`font-bold text-[11px] ${isCompleted ? "text-slate-700" : getDueDateColor(days)}`}>
                    {formatDate(displayDate)}
                  </div>
                  <div className={`text-[10px] mt-0.5 font-medium ${isCompleted ? "text-slate-400" : days < 0 ? "text-red-400" : days === 0 ? "text-blue-400" : "text-amber-400"}`}>
                    {relativeLabel}
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
            {record.status !== "Completed" && <div className="border-t border-slate-100 px-4 py-3 flex gap-2" onClick={e => e.stopPropagation()}>
              <button onClick={() => onSnooze(record)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-100 rounded-lg hover:bg-amber-100 transition-colors"><AlarmClock size={12} /> Snooze</button>
              <button onClick={() => onComplete(record)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"><CheckCircle2 size={12} /> Complete</button>
            </div>}
          </div>
        );
      })}
    </div>
  );
}

export default PMCardView;
