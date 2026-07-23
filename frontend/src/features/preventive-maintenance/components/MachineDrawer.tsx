import React, { useState, useMemo } from "react";
import {
  X,
  Edit2,
  AlarmClock,
  CheckCircle2,
  RotateCcw,
  User,
  Clock,
  ClipboardCheck,
} from "lucide-react";
import type { PMRecord } from "../types/pm";
import { machineIcon } from "../utils/pmHelpers";
import {
  daysUntil,
  formatDate,
  formatDateTime,
  getRelativeLabel,
  getDueDateBg,
  getDueDateLabelColor,
  getDueDateValueColor,
} from "../utils/pmDateUtils";
import { FREQUENCY_INTERVAL_DAYS } from "../constants/pmConstants";
import { StatusBadge } from "./StatusBadge";
import { PriorityBadge } from "./PriorityBadge";

export function MachineDrawer({ record, onClose, onEdit, onComplete, onSnooze, onViewChecklist }: { record: PMRecord; onClose: () => void; onEdit: (r: PMRecord) => void; onComplete: (r: PMRecord) => void; onSnooze: (r: PMRecord) => void; onViewChecklist?: (r: PMRecord) => void }) {
  const [tab, setTab] = useState<"info" | "history" | "schedule">("info");

  const Icon = machineIcon(record.department);

  const tabs = [
    { id: "info", label: "Machine Info" },
    { id: "history", label: "History" },
    { id: "schedule", label: "Schedule" },
  ] as const;

  return (
    <div className="fixed inset-0 z-[60] flex">
      <div className="flex-1 bg-slate-900/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="w-full max-w-[520px] bg-white border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center shrink-0">
                <Icon size={18} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">{record.machine}</h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{record.machineId}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={record.status} />
            <PriorityBadge priority={record.priority} />
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
              <RotateCcw size={10} /> {record.frequency}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 border-b border-slate-100 flex gap-0">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
                tab === t.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {tab === "info" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Department", value: record.department },
                  { label: "Location", value: record.location },
                  { label: "Model", value: record.model },
                  { label: "User", value: record.user },
                  { label: "Frequency", value: record.frequency },
                ].map(item => (
                  <div key={item.label} className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{item.label}</div>
                    <div className="text-sm font-semibold text-slate-900">{item.value}</div>
                  </div>
                ))}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-700 mb-2">Maintenance Description</div>
                <div className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-4 border border-slate-100">
                  {record.description || "\u2014"}
                </div>
              </div>
              {/* Next Due — always calculated from the stored nextDue value */}
              {(() => {
                const days = daysUntil(record.nextDue);
                const relativeLabel = getRelativeLabel(record.nextDue);
                const bgClass = getDueDateBg(days);
                const labelColorClass = getDueDateLabelColor(days);
                const valueColorClass = getDueDateValueColor(days);
                return (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
                      <div className="text-xs text-emerald-600 font-semibold mb-1">Last Maintenance</div>
                      <div className="text-sm font-bold text-emerald-800">{formatDate(record.lastMaintenance)}</div>
                    </div>
                    <div className={`rounded-xl p-3 text-center border ${bgClass}`}>
                      <div className={`text-xs font-semibold mb-1 ${labelColorClass}`}>
                        Next Due
                      </div>
                      <div className={`text-sm font-bold ${valueColorClass}`}>
                        {formatDate(record.nextDue)}
                      </div>
                      <div className={`text-[10px] mt-0.5 font-medium ${labelColorClass}`}>
                        {relativeLabel}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {tab === "history" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-slate-700">Maintenance History</h3>
                <span className="text-[11px] text-slate-500">{record.history.length} records</span>
              </div>
              {record.history.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-xs text-slate-400 font-medium">No maintenance history recorded yet.</p>
                </div>
              ) : (
                record.history.map((h, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{formatDate(h.date)}</span>
                        {h.completionTime && (
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock size={10} /> {h.completionTime}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {h.status || "Completed"}
                      </span>
                    </div>
                    {h.notes && (
                      <div className="text-xs text-slate-700 leading-relaxed mb-3 bg-slate-50 rounded-lg p-3 border border-slate-100">
                        {h.notes}
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <User size={11} /> {h.user}
                      </span>
                      {h.previousMaintenanceDate && (
                        <span className="flex items-center gap-1">
                          Previous PM: {formatDate(h.previousMaintenanceDate)}
                        </span>
                      )}
                      {h.previousDueDate && (
                        <span className="flex items-center gap-1">
                          Previous Due: {formatDate(h.previousDueDate)}
                        </span>
                      )}
                      {h.frequency && (
                        <span className="flex items-center gap-1">
                          <RotateCcw size={10} /> {h.frequency}
                        </span>
                      )}
                      {h.priority && <PriorityBadge priority={h.priority as any} />}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "schedule" && (
            <div className="space-y-4">
              <div className="text-xs font-bold text-slate-700 mb-4">Upcoming Schedule</div>
              {[0, 1, 2, 3].map(i => {
                const dueDate = new Date(record.nextDue);
                const interval = FREQUENCY_INTERVAL_DAYS[record.frequency] || 30;
                dueDate.setDate(dueDate.getDate() + i * interval);
                const isFirst = i === 0;
                return (
                  <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border ${isFirst ? "bg-blue-50 border-blue-200" : "bg-white border-slate-200"}`}>
                    <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center shrink-0 ${isFirst ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                      <span className="text-[10px] font-bold leading-none">{dueDate.toLocaleDateString("en-IN", { month: "short" })}</span>
                      <span className="text-lg font-bold leading-none">{dueDate.getDate()}</span>
                    </div>
                    <div className="flex-1">
                      <div className={`text-xs font-bold ${isFirst ? "text-blue-900" : "text-slate-900"}`}>
                        {isFirst ? "Next Due (Current)" : `${record.frequency} PM`}
                      </div>
                      <div className={`text-[11px] mt-0.5 ${isFirst ? "text-blue-600" : "text-slate-500"}`}>
                        {dueDate.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                      </div>
                    </div>
                    {isFirst && <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded">Upcoming</span>}
                  </div>
                );
              })}
            </div>
          )}


        </div>

        {/* Drawer Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex gap-3 shrink-0">
          {record.status === "Completed" ? <>
            <button onClick={() => onViewChecklist?.(record)} className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
              <ClipboardCheck size={13} /> View Checklist
            </button>
          </> : <>
            <button onClick={() => onEdit(record)} className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
              <Edit2 size={13} /> Edit
            </button>
            <button onClick={() => onSnooze(record)} className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors">
              <AlarmClock size={13} /> Snooze
            </button>
            <button onClick={() => onComplete(record)} className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors">
              <CheckCircle2 size={13} /> Mark Complete
            </button>
          </>}
        </div>
      </div>
    </div>
  );
}

export default MachineDrawer;
