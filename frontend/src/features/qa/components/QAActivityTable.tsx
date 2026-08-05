import { MoreHorizontal, Eye, Edit2, Copy, Trash2, CheckCircle2, Clock3 } from "lucide-react";
import { formatDate } from "../../../shared/utils/dateHelpers";
import type { QAActivity, QAColumnsState } from "../types/qa";
import { QAColumnSelector } from "./QAColumnSelector";
import { QACompletedBadge } from "./QACompletedBadge";
import { EmptyState } from "./EmptyState";

interface QAActivityTableProps {
  filteredActivities: QAActivity[];
  showColumns: boolean;
  setShowColumns: (show: boolean) => void;
  columns: QAColumnsState;
  setColumns: (columns: QAColumnsState) => void;
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
  onView: (record: QAActivity) => void;
  handleDuplicate: (record: QAActivity) => void;
  handleDelete: (id: string) => void;
  handleEdit: (record: QAActivity) => void;
  handleComplete?: (record: QAActivity) => void;
  handleSnooze: (record: QAActivity) => void;
}

export function QAActivityTable({
  filteredActivities,
  showColumns,
  setShowColumns,
  columns,
  setColumns,
  openMenuId,
  setOpenMenuId,
  onView,
  handleDuplicate,
  handleDelete,
  handleEdit,
  handleSnooze,
}: QAActivityTableProps) {
  const displayDate = (value?: string) => {
    if (!value) return "—";
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? "—" : formatDate(value);
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3 relative">
        <QAColumnSelector columns={columns} setColumns={setColumns} showColumns={showColumns} setShowColumns={setShowColumns} />
      </div>

      <div className="flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {filteredActivities.length === 0 ? (
          <div className="flex h-full min-h-[320px] items-center justify-center">
            <EmptyState />
          </div>
        ) : (
          <div className="h-full overflow-auto">
            <table className="min-w-full table-fixed border-collapse text-left whitespace-nowrap">
              <thead className="bg-slate-50/70 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">QMS Number</th>
                  {columns.qmsType && <th className="px-4 py-3">QMS Type</th>}
                  {columns.department && <th className="px-4 py-3">Department</th>}
                  {columns.dueDate && <th className="px-4 py-3">Due Date</th>}
                  {columns.reminder && <th className="px-4 py-3">Reminder</th>}
                  {columns.priority && <th className="px-4 py-3">Priority</th>}
                  {columns.status && <th className="px-4 py-3">Status</th>}
                  {columns.action && <th className="px-4 py-3">Action</th>}
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredActivities.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 cursor-pointer group" onClick={() => onView(record)}>
                    <td className="px-4 py-3.5 text-xs font-mono font-bold text-slate-600">{record.qmsNumber}</td>
                    {columns.qmsType && <td className="px-4 py-3.5 text-xs font-semibold text-slate-700">{record.qmsType}</td>}
                    {columns.department && <td className="px-4 py-3.5 text-xs font-semibold text-slate-700">{record.department}</td>}
                    {columns.dueDate && <td className="px-4 py-3.5 text-xs text-slate-500">{displayDate(record.dueDate || record.targetDate)}</td>}
                    {columns.reminder && <td className="px-4 py-3.5 text-xs text-slate-500">{record.reminder}</td>}
                    {columns.priority && <td className="px-4 py-3.5 text-xs text-slate-500">{record.priority}</td>}
                    {columns.status && <td className="px-4 py-3.5"><QACompletedBadge status={record.status} /></td>}
                    {columns.action && <td className="px-4 py-3.5 text-xs text-slate-500 max-w-[220px] truncate">{record.actionHistory[0]?.note || "—"}</td>}
                    <td className="px-4 py-3.5 text-right relative" onClick={(event) => event.stopPropagation()}>
                      <div className="relative inline-block">
                        <button onClick={() => setOpenMenuId(openMenuId === record.id ? null : record.id)} className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"><MoreHorizontal size={14} /></button>
                        {openMenuId === record.id && (
                          <>
                            <div className="fixed inset-0 z-30" onClick={() => setOpenMenuId(null)} />
                            <div className="absolute right-0 top-8 z-40 w-56 rounded-lg border border-slate-200 bg-white py-1 text-left shadow-xl animate-in fade-in zoom-in-95 duration-100">
                              <button onClick={() => { onView(record); setOpenMenuId(null); }} className="w-full px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"><Eye size={14} /> View</button>
                              <button onClick={() => { handleEdit(record); setOpenMenuId(null); }} className="w-full px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"><Edit2 size={14} /> Edit</button>
                              <button onClick={() => { onView(record); setOpenMenuId(null); }} className="w-full px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"><CheckCircle2 size={14} /> Complete</button>
                              <button onClick={() => { handleSnooze(record); setOpenMenuId(null); }} className="w-full px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"><Clock3 size={14} /> Snooze</button>
                              <button onClick={() => { handleDuplicate(record); setOpenMenuId(null); }} className="w-full px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"><Copy size={14} /> Duplicate</button>
                              <div className="h-px bg-slate-100 my-1" />
                              <button onClick={() => { handleDelete(record.id); setOpenMenuId(null); }} className="w-full px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"><Trash2 size={14} /> Delete</button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
