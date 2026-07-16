// ─────────────────────────────────────────────────────────────────────────────
// DepartmentTeamMembers
// Extracted from the original TeamMembersTab in the monolithic
// DepartmentsPage.tsx. UI/behavior unchanged.
//
// NOTE: Not wired into the exported DepartmentsPage in the original file.
// Preserved here, unused-but-available, to avoid removing any feature.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useMemo, useState } from "react";
import { Search, Plus } from "lucide-react";
import type { Employee } from "../types/department";
import { AVAILABILITY_OPTIONS, DEPARTMENTS } from "../constants/departmentConfig";
import { filterEmployees } from "../utils/departmentHelpers";
import DepartmentEmployeeCard from "./DepartmentEmployeeCard";

export interface DepartmentTeamMembersProps {
  employees: Employee[];
}

export default function DepartmentTeamMembers({ employees }: DepartmentTeamMembersProps) {
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterAvail, setFilterAvail] = useState("");

  const filtered = useMemo(
    () => filterEmployees(employees, { search, filterDept, filterAvail }),
    [employees, search, filterDept, filterAvail]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search employees, roles..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-4 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-400"
          />
        </div>
        <select
          value={filterDept}
          onChange={e => setFilterDept(e.target.value)}
          className="h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-slate-700"
        >
          <option value="">All Departments</option>
          {DEPARTMENTS.map(d => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select
          value={filterAvail}
          onChange={e => setFilterAvail(e.target.value)}
          className="h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-slate-700"
        >
          <option value="">All Availability</option>
          {AVAILABILITY_OPTIONS.map(a => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">{filtered.length} members</span>
          <button className="flex items-center gap-1.5 h-9 px-4 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            <Plus size={13} /> Add Employee
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white border border-slate-200 rounded-xl shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-2">No employees found</h3>
          <p className="text-sm text-slate-500 max-w-xs">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filtered.map(emp => (
            <DepartmentEmployeeCard key={emp.id} employee={emp} variant="full" />
          ))}
        </div>
      )}
    </div>
  );
}
