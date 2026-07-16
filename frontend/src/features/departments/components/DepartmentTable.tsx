// ─────────────────────────────────────────────────────────────────────────────
// DepartmentTable
// The department listing table, extracted from the original DeptDirectoryTab.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { ArrowUpDown, Edit2, Trash2, Layers } from "lucide-react";
import type { Department } from "../types/department";
import { DeptStatusBadge } from "./DepartmentCard";

export interface DepartmentTableProps {
  records: Department[];
  totalCount: number;
  sortField: string;
  sortDir: "asc" | "desc";
  onSort: (field: string) => void;
  onEdit: (d: Department) => void;
  onDelete: (d: Department) => void;
}

export default function DepartmentTable({
  records,
  totalCount,
  sortField,
  sortDir,
  onSort,
  onEdit,
  onDelete,
}: DepartmentTableProps) {
  const SortBtn = ({ field }: { field: string }) => (
    <button onClick={() => onSort(field)}>
      <ArrowUpDown size={11} className={sortField === field ? "text-blue-500" : "text-slate-300"} />
    </button>
  );

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/50">
        <span className="text-xs font-semibold text-slate-500">
          Showing <span className="font-bold text-slate-900">{records.length}</span> of {totalCount} departments
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="bg-slate-50/70 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
            <tr>
              <th className="px-5 py-3">
                <div className="flex items-center gap-1">
                  Department <SortBtn field="name" />
                </div>
              </th>
              <th className="px-4 py-3">Department Head</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">
                <div className="flex items-center gap-1">
                  Employees <SortBtn field="employees" />
                </div>
              </th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {records.map(dept => (
              <tr key={dept.id} className="hover:bg-blue-50/30 transition-colors group">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center shrink-0">
                      <Layers size={13} className="text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{dept.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{dept.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[9px] font-bold shrink-0">
                      {dept.head
                        .split(" ")
                        .map(n => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div>
                      <div className="text-xs text-slate-700 font-medium">{dept.head}</div>
                      {dept.manager && dept.manager !== dept.head && (
                        <div className="text-[10px] text-slate-400">Manager: {dept.manager}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-xs text-slate-600 max-w-[200px] truncate">
                  {dept.location || "—"}
                </td>
                <td className="px-4 py-3.5 text-xs font-semibold text-slate-900">{dept.employees}</td>
                <td className="px-4 py-3.5">
                  <DeptStatusBadge status={dept.status} />
                </td>
                <td className="px-4 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(dept)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => onDelete(dept)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-400">
                  No departments match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/30">
        <span className="text-xs text-slate-500">Page 1 of 1</span>
        <div className="flex items-center gap-1">
          <button disabled className="h-7 px-2.5 text-xs font-medium text-slate-400 bg-white border border-slate-200 rounded-md disabled:opacity-40">
            Previous
          </button>
          <button className="h-7 w-7 text-xs font-bold text-white bg-blue-600 rounded-md">1</button>
          <button disabled className="h-7 px-2.5 text-xs font-medium text-slate-400 bg-white border border-slate-200 rounded-md disabled:opacity-40">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
