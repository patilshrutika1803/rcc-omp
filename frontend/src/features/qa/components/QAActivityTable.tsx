import { MoreHorizontal, Eye, Edit2, Download, Copy, Trash2 } from "lucide-react";
import { formatDate } from "../../../shared/utils/dateHelpers";
import type { QAActivity, QAColumnsState, QAFiltersState } from "../types/qa";
import { QASearchBar } from "./QASearchBar";
import { QAFilters } from "./QAFilters";
import { QAColumnSelector } from "./QAColumnSelector";
import { QACompletedBadge } from "./QACompletedBadge";
import { EmptyState } from "./EmptyState";

interface QAActivityTableProps {
  filteredActivities: QAActivity[];

  search: string;
  setSearch: (value: string) => void;

  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  filters: QAFiltersState;
  setFilters: (filters: QAFiltersState) => void;

  showColumns: boolean;
  setShowColumns: (show: boolean) => void;
  columns: QAColumnsState;
  setColumns: (columns: QAColumnsState) => void;

  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;

  setSelectedRecord: (record: QAActivity | null) => void;
  handleGlobalExport: () => void;
  handleDuplicate: (record: QAActivity) => void;
  handleDelete: (id: string) => void;
}

export function QAActivityTable({
  filteredActivities,
  search,
  setSearch,
  showFilters,
  setShowFilters,
  filters,
  setFilters,
  showColumns,
  setShowColumns,
  columns,
  setColumns,
  openMenuId,
  setOpenMenuId,
  setSelectedRecord,
  handleGlobalExport,
  handleDuplicate,
  handleDelete,
}: QAActivityTableProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 relative">
        <QASearchBar search={search} onSearchChange={setSearch} />

        <QAFilters filters={filters} setFilters={setFilters} showFilters={showFilters} setShowFilters={setShowFilters} />

        <QAColumnSelector columns={columns} setColumns={setColumns} showColumns={showColumns} setShowColumns={setShowColumns} />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden min-h-[400px]">
        {filteredActivities.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-slate-50/70 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">QMS Number</th>
                  {columns.qmsType && <th className="px-4 py-3">QMS Type</th>}
                  {columns.department && <th className="px-4 py-3">Department</th>}
                  {columns.targetDate && <th className="px-4 py-3">Target Date</th>}
                  {columns.reminder && <th className="px-4 py-3">Reminder</th>}
                  {columns.completed && <th className="px-4 py-3">Completed</th>}
                  {columns.action && <th className="px-4 py-3">Action</th>}
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredActivities.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50 cursor-pointer group" onClick={() => setSelectedRecord(record)}>
                    <td className="px-4 py-3.5 text-xs font-mono font-bold text-slate-600">{record.qmsNumber}</td>
                    {columns.qmsType && <td className="px-4 py-3.5 text-xs font-semibold text-slate-700">{record.qmsType}</td>}
                    {columns.department && <td className="px-4 py-3.5 text-xs font-semibold text-slate-700">{record.department}</td>}
                    {columns.targetDate && <td className="px-4 py-3.5 text-xs text-slate-500">{formatDate(record.targetDate)}</td>}
                    {columns.reminder && <td className="px-4 py-3.5 text-xs text-slate-500">{record.reminder}</td>}
                    {columns.completed && <td className="px-4 py-3.5"><QACompletedBadge status={record.completed} /></td>}
                    {columns.action && <td className="px-4 py-3.5 text-xs text-slate-500 max-w-[220px] truncate">{record.actionHistory[0]?.note || "—"}</td>}
                    <td className="px-4 py-3.5 text-right relative" onClick={e => e.stopPropagation()}>
                      <div className="relative inline-block">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === record.id ? null : record.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                        >
                          <MoreHorizontal size={14} />
                        </button>
                        {openMenuId === record.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                            <div className="absolute right-0 top-8 w-48 bg-white border border-slate-200 rounded-lg shadow-xl z-20 py-1 text-left animate-in fade-in zoom-in-95 duration-100">
                              <button onClick={() => { setSelectedRecord(record); setOpenMenuId(null); }} className="w-full px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"><Eye size={14} /> View</button>
                              <button onClick={() => { setSelectedRecord(record); setOpenMenuId(null); }} className="w-full px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"><Edit2 size={14} /> Edit</button>
                              <button onClick={() => { handleGlobalExport(); setOpenMenuId(null); }} className="w-full px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"><Download size={14} /> Export Word</button>
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
