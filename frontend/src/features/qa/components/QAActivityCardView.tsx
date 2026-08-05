import { useState } from "react";
import { Eye, Edit2, Copy, Clock3, CheckCircle2, Trash2, MoreHorizontal } from "lucide-react";
import type { QAActivity } from "../types/qa";
import { formatDate } from "../../../shared/utils/dateHelpers";
import { activeStatusColor } from "../utils/qaHelpers";

interface QAActivityCardViewProps {
  activities: QAActivity[];
  onView: (activity: QAActivity) => void;
  onEdit: (activity: QAActivity) => void;
  onDuplicate: (activity: QAActivity) => void;
  onDelete: (id: string) => void;
  onSnooze: (activity: QAActivity) => void;
}

export function QAActivityCardView({ activities, onView, onEdit, onDuplicate, onDelete, onSnooze }: QAActivityCardViewProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  if (activities.length === 0) {
    return <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">No QA activities found.</div>;
  }

    const displayDate = (value?: string) => {
    if (!value) return "—";
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? "—" : formatDate(value);
  };

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {activities.map((activity) => {
        const statusClasses = activeStatusColor(activity.status);
        return (
          <div key={activity.id} className="relative overflow-visible rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">{activity.qmsNumber}</div>
                <div className="text-xs text-slate-500">{activity.qmsType}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative inline-block">
                  <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === activity.id ? null : activity.id); }} className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"><MoreHorizontal size={14} /></button>
                  {openMenuId === activity.id && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setOpenMenuId(null)} />
                      <div className="absolute right-0 top-8 z-40 w-44 rounded-lg border border-slate-200 bg-white py-1 text-left shadow-xl animate-in fade-in zoom-in-95 duration-100">
                        <button onClick={() => { onView(activity); setOpenMenuId(null); }} className="w-full px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"><Eye size={14} /> View</button>
                        <button onClick={() => { onEdit(activity); setOpenMenuId(null); }} className="w-full px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"><Edit2 size={14} /> Edit</button>
                        <button onClick={() => { onView(activity); setOpenMenuId(null); }} className="w-full px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"><CheckCircle2 size={14} /> Complete</button>
                        <button onClick={() => { onSnooze(activity); setOpenMenuId(null); }} className="w-full px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"><Clock3 size={14} /> Snooze</button>
                        <button onClick={() => { onDuplicate(activity); setOpenMenuId(null); }} className="w-full px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"><Copy size={14} /> Duplicate</button>
                        <button onClick={() => { onDelete(activity.id); setOpenMenuId(null); }} className="w-full px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"><Trash2 size={14} /> Delete</button>
                      </div>
                    </>
                  )}
                </div>
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusClasses.bg} ${statusClasses.text} ${statusClasses.border}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${statusClasses.dot}`} />
                {activity.status}
                </span>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Department</span>
                <span className="font-semibold text-slate-700">{activity.department}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Due Date</span>
                <span className="font-semibold text-slate-700">{displayDate(activity.dueDate || activity.targetDate)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Reminder</span>
                <span className="font-semibold text-slate-700">{activity.reminder}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Priority</span>
                <span className="font-semibold text-slate-700">{activity.priority}</span>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => onView(activity)} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"><Eye size={12} /> View</button>
              <button onClick={() => onEdit(activity)} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"><Edit2 size={12} /> Edit</button>
              <button onClick={() => onView(activity)} className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100"><CheckCircle2 size={12} /> Complete</button>
              <button onClick={() => onDuplicate(activity)} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"><Copy size={12} /> Duplicate</button>
              <button onClick={() => onDelete(activity.id)} className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-[11px] font-semibold text-red-600 hover:bg-red-100"><Trash2 size={12} /> Delete</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
