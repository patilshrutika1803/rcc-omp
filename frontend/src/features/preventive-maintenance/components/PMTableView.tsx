import React, { useState, useRef, useEffect } from "react";
import {
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  MoreHorizontal,
  Eye,
  Edit2,
  Copy,
  CheckCircle2,
  AlarmClock,
  Trash2,
  ClipboardCheck,
  Download,
} from "lucide-react";
import type { PMRecord } from "../types/pm";
import { machineIcon } from "../utils/pmHelpers";
import { daysUntil, formatDate, getRelativeLabel, getDueDateColor } from "../utils/pmDateUtils";
import { StatusBadge } from "./StatusBadge";
import { PriorityBadge } from "./PriorityBadge";
import { EmptyState } from "./EmptyState";
import { PMPagination } from "./PMPagination";

export function PMTableView({
  filteredData,
  pagedData,
  currentPage,
  totalPages,
  onPageChange,
  sortField,
  sortDir,
  onSort,
  onRowClick,
  onView,
  onEdit,
  onDuplicate,
  onComplete,
  onSnooze,
  onDelete,
  onViewChecklist,
  onExportPDF,
  onAdd,
  onResetFilters,
}: {
  filteredData: PMRecord[];
  pagedData: PMRecord[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number | ((p: number) => number)) => void;
  sortField: string;
  sortDir: "asc" | "desc";
  onSort: (field: string) => void;
  onRowClick: (r: PMRecord) => void;
  onView: (r: PMRecord) => void;
  onEdit: (r: PMRecord) => void;
  onDuplicate: (r: PMRecord) => void;
  onComplete: (r: PMRecord) => void;
  onSnooze: (r: PMRecord) => void;
  onDelete: (r: PMRecord) => void;
  onViewChecklist: (r: PMRecord) => void;
  onExportPDF: (r: PMRecord) => void;
  onAdd: () => void;
  onResetFilters?: () => void;
}) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ArrowUpDown size={12} className="text-slate-300" />;
    return sortDir === "asc"
      ? <ChevronUp size={12} className="text-blue-500" />
      : <ChevronDown size={12} className="text-blue-500" />;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/50">
        <span className="text-xs font-semibold text-slate-500">
          Showing <span className="font-bold text-slate-900">{pagedData.length}</span> of {filteredData.length} records
        </span>
      </div>

      {filteredData.length === 0 ? (
        <EmptyState onAdd={onAdd} onResetFilters={onResetFilters} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50/70 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">
                  <button onClick={() => onSort("machine")} className="flex items-center gap-1.5 hover:text-slate-700 transition-colors">
                    Machine <SortIcon field="machine" />
                  </button>
                </th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Frequency</th>
                <th className="px-4 py-3">Last PM</th>
                <th className="px-4 py-3">
                  <button onClick={() => onSort("nextDue")} className="flex items-center gap-1.5 hover:text-slate-700 transition-colors">
                    Next Due <SortIcon field="nextDue" />
                  </button>
                </th>
                <th className="px-4 py-3">
                  <button onClick={() => onSort("priority")} className="flex items-center gap-1.5 hover:text-slate-700 transition-colors">
                    Priority <SortIcon field="priority" />
                  </button>
                </th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {pagedData.map(record => {
                const Icon = machineIcon(record.department);
                const isCompleted = record.status === "Completed";
                const displayDate = isCompleted ? record.lastMaintenance || record.nextDue : record.nextDue;
                const days = displayDate ? daysUntil(displayDate) : 0;
                return (
                  <tr
                    key={record.id}
                    className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                    onClick={() => onRowClick(record)}
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center shrink-0">
                          <Icon size={13} className="text-blue-600" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">{record.machine}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{record.machineId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-slate-600 font-medium">{record.department}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md font-medium">
                        <RotateCcw size={10} /> {record.frequency}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-slate-500">{formatDate(record.lastMaintenance)}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div>
                        <div className={`text-xs font-bold ${isCompleted ? "text-slate-700" : getDueDateColor(days)}`}>
                          {formatDate(displayDate)}
                        </div>
                        <div className={`text-[10px] mt-0.5 font-medium ${isCompleted ? "text-slate-400" : days < 0 ? "text-red-400" : days === 0 ? "text-blue-400" : "text-slate-400"}`}>
                          {isCompleted ? "Completed" : getRelativeLabel(record.nextDue)}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <PriorityBadge priority={record.priority} />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[9px] font-bold shrink-0">
                          {record.user.split(" ").map(n => n[0]).join("")}
                        </div>
                        <span className="text-xs text-slate-600 font-medium">{record.user.split(" ")[0]}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={record.status} />
                    </td>
                    <td className="px-4 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                      <div className="relative flex items-center justify-end" ref={openMenuId === record.id ? menuRef : undefined}>
                        <button
                          onClick={() => setOpenMenuId(openMenuId === record.id ? null : record.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <MoreHorizontal size={14} />
                        </button>
                        {openMenuId === record.id && (
                          <div className="absolute right-0 top-8 z-50 bg-white border border-slate-200 rounded-xl shadow-lg py-1 w-44">
                            <button
                              onClick={() => { onView(record); setOpenMenuId(null); }}
                              className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 w-full text-left"
                            >
                              <Eye size={13} /> View Details
                            </button>
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
                            <div className="border-t border-slate-100 mt-1 pt-1">
                              <button
                                onClick={() => { onDelete(record); setOpenMenuId(null); }}
                                className="flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 w-full text-left"
                              >
                                <Trash2 size={13} /> Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <PMPagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  );
}

export default PMTableView;
