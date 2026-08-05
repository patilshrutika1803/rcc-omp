import React, { useState, useMemo } from "react";
import { Eye, Edit2, Trash2, Download } from "lucide-react";
import type { SystemInventory } from "../types/system";
import { SYSTEMS_PER_PAGE } from "../constants/systemConstants";
import { typeIcon, filterSystems, paginate, totalPagesFor, exportSystemsAsCsv } from "../utils/systemHelpers";
import { daysUntil, formatDate } from "../../../shared/utils/dateHelpers";
import { SystemStatusBadge } from "./SystemStatusBadge";
import { EmptyState } from "./EmptyState";
import { SystemToolbar } from "./SystemToolbar";
import { SystemPagination } from "./SystemPagination";

export function SystemInventoryTable({
  systems,
  onView,
  onEdit,
  onDelete,
  onAdd,
}: {
  systems: SystemInventory[];
  onView: (s: SystemInventory) => void;
  onEdit: (s: SystemInventory) => void;
  onDelete: (s: SystemInventory) => void;
  onAdd: () => void;
}) {
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const PER = SYSTEMS_PER_PAGE;

  const filtered = useMemo(
    () => filterSystems(systems, { search, department: filterDept, type: filterType, category: filterCategory, status: filterStatus }),
    [systems, search, filterDept, filterType, filterCategory, filterStatus]
  );

  const totalPages = totalPagesFor(filtered.length, PER);
  const paged = paginate(filtered, page, PER);
  const hasFilters = !!(search || filterDept || filterType || filterCategory || filterStatus);

  const resetFilters = () => { setSearch(""); setFilterDept(""); setFilterType(""); setFilterCategory(""); setFilterStatus(""); setPage(1); };

  return (
    <div className="space-y-4">
      {/* Search + Filters toolbar */}
      <div className="flex flex-col gap-4">
        <SystemToolbar
          search={search}
          onSearchChange={value => { setSearch(value); setPage(1); }}
          filterDept={filterDept}
          onFilterDeptChange={value => { setFilterDept(value); setPage(1); }}
          filterType={filterType}
          onFilterTypeChange={value => { setFilterType(value); setPage(1); }}
          filterCategory={filterCategory}
          onFilterCategoryChange={value => { setFilterCategory(value); setPage(1); }}
          filterStatus={filterStatus}
          onFilterStatusChange={value => { setFilterStatus(value); setPage(1); }}
          hasFilters={hasFilters}
          onResetFilters={resetFilters}
        />
        <div className="flex justify-end">
          <button
            onClick={() => exportSystemsAsCsv(filtered)}
            className="inline-flex items-center gap-2 h-9 px-3 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Download size={14} /> Export filtered
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState onAdd={onAdd} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-4 py-3">System ID</th>
                    <th className="px-4 py-3">System Name</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Assigned User</th>
                    <th className="px-4 py-3">Purchase Date</th>
                    <th className="px-4 py-3">Warranty</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {paged.map(system => {
                    const TypeIcon = typeIcon(system.systemType);
                    const wDays = system.warrantyExpiry ? daysUntil(system.warrantyExpiry) : null;
                    return (
                      <tr key={system.systemId || system._id} onClick={() => onView(system)} className="hover:bg-blue-50/30 transition-colors group cursor-pointer">
                        <td className="px-4 py-3.5 text-xs font-mono font-semibold text-slate-700">{system.systemId}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center shrink-0">
                              <TypeIcon size={13} className="text-blue-600" />
                            </div>
                            <div className="text-xs font-bold text-slate-900">{system.systemName}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-[11px] font-medium bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md text-slate-600">{system.systemType}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-[11px] uppercase font-semibold tracking-wide px-2 py-0.5 rounded-md border border-slate-200 bg-slate-50 text-slate-700">{system.systemCategory}</span>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-600 font-medium">{system.department}</td>
                        <td className="px-4 py-3.5 text-xs text-slate-500 max-w-[140px]">
                          <span className="truncate block" title={system.location}>{system.location}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[9px] font-bold shrink-0">
                              {system.assignedUser.split(" ").filter(Boolean).map(n => n[0]).join("").slice(0, 2) || "—"}
                            </div>
                            <span className="text-xs text-slate-600 font-medium">{system.assignedUser.split(" ")[0]}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-500">{system.purchaseDate ? formatDate(system.purchaseDate) : "—"}</td>
                        <td className="px-4 py-3.5">
                          {system.warrantyExpiry ? (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${wDays !== null && wDays < 0 ? "bg-red-50 text-red-600 border border-red-200" : wDays !== null && wDays < 90 ? "bg-amber-50 text-amber-600 border border-amber-200" : "bg-emerald-50 text-emerald-600 border border-emerald-200"}`}>
                              {wDays !== null && wDays < 0 ? "Expired" : formatDate(system.warrantyExpiry)}
                            </span>
                          ) : <span className="text-[10px] text-slate-400">—</span>}
                        </td>
                        <td className="px-4 py-3.5"><SystemStatusBadge status={system.status} /></td>
                        <td className="px-4 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => onView(system)} title="View" className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"><Eye size={14} /></button>
                            <button onClick={() => onEdit(system)} title="Edit" className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"><Edit2 size={14} /></button>
                            <button onClick={() => onDelete(system)} title="Delete" className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <SystemPagination
              page={page}
              totalPages={totalPages}
              filteredCount={filtered.length}
              onPrev={() => setPage(p => p - 1)}
              onNext={() => setPage(p => p + 1)}
              onPageSelect={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
