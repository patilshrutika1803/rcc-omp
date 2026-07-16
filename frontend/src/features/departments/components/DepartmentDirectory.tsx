// ─────────────────────────────────────────────────────────────────────────────
// DepartmentDirectory
// Extracted from the original DeptDirectoryTab in the monolithic
// DepartmentsPage.tsx. UI/behavior unchanged.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Department } from "../types/department";
import { DEPARTMENT_STATUS_OPTIONS } from "../constants/departmentConfig";
import { filterAndSortDepartments } from "../utils/departmentHelpers";
import DepartmentTable from "./DepartmentTable";

export interface DepartmentDirectoryProps {
  records: Department[];
  onEdit: (d: Department) => void;
  onDelete: (d: Department) => void;
}

export default function DepartmentDirectory({ records, onEdit, onDelete }: DepartmentDirectoryProps) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filtered = useMemo(
    () => filterAndSortDepartments(records, { search, filterStatus, sortField: sortField as "name" | "employees", sortDir }),
    [records, search, filterStatus, sortField, sortDir]
  );

  const handleSort = (field: string) => {
    if (sortField === field) setSortDir(d => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mb-5">
          <Search size={26} className="text-blue-400" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-2">No departments available</h3>
        <p className="text-sm text-slate-500 max-w-xs">
          Departments you create will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search departments, heads, location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-4 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-400"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-slate-700"
        >
          <option value="">All Statuses</option>
          {DEPARTMENT_STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <DepartmentTable
        records={filtered}
        totalCount={records.length}
        sortField={sortField}
        sortDir={sortDir}
        onSort={handleSort}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}
