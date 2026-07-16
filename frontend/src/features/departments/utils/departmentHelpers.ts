// ─────────────────────────────────────────────────────────────────────────────
// Department feature — helper / utility functions
// Extracted from the original monolithic DepartmentsPage.tsx.
// No behavior changes — pure functions only.
// ─────────────────────────────────────────────────────────────────────────────

import type { Department, DepartmentStatus, Employee } from "../types/department";

/** Badge styling config for a department's status */
export function deptStatusCfg(status: DepartmentStatus) {
  switch (status) {
    case "Active":
      return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" };
    case "Under Review":
      return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" };
    case "Restructuring":
      return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500" };
  }
}

/** Badge styling config for an employee's availability */
export function empAvailCfg(av: Employee["availability"]) {
  switch (av) {
    case "Available":
      return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" };
    case "Busy":
      return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500" };
    case "On Leave":
      return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" };
    case "Remote":
      return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-500" };
  }
}

/** Backward-compatible helper adapted from the original Machines module.
 *  Departments UI expects this for status dot rendering (assigned machines list). */
export function mchStatusCfg(status: string) {
  switch (status) {
    case "Active":
      return { dot: "bg-emerald-500" };
    case "Inactive":
      return { dot: "bg-slate-400" };
    case "Under Repair":
      return { dot: "bg-amber-500" };
    case "Disposed":
      return { dot: "bg-red-500" };
    default:
      return { dot: "bg-slate-400" };
  }
}

/** Score badge color classes based on a performance score (0-100) */
export function scoreColorCfg(score: number): string {
  if (score >= 90) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (score >= 75) return "bg-blue-50 text-blue-700 border-blue-200";
  if (score >= 60) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-red-50 text-red-700 border-red-200";
}

/** Budget utilization percentage, rounded */
export function budgetUtilizationPct(dept: Pick<Department, "budget" | "budgetUsed">): number {
  if (!dept.budget) return 0;
  return Math.round((dept.budgetUsed / dept.budget) * 100);
}

/** Average performance score across a list of departments, rounded */
export function avgPerformanceScore(depts: Department[]): number {
  if (depts.length === 0) return 0;
  return Math.round(depts.reduce((s, d) => s + d.performanceScore, 0) / depts.length);
}

/** Total headcount across a list of departments */
export function totalEmployeeCount(depts: Department[]): number {
  return depts.reduce((s, d) => s + d.employees, 0);
}

/** Total open tasks (PM + QA) across a list of departments */
export function totalOpenTasks(depts: Department[]): number {
  return depts.reduce((s, d) => s + d.openPM + d.openQA, 0);
}

/** Filters + sorts department records for the Directory table */
export function filterAndSortDepartments(
  records: Department[],
  opts: {
    search?: string;
    filterStatus?: string;
    sortField?: "name" | "employees";
    sortDir?: "asc" | "desc";
  }
): Department[] {
  const { search = "", filterStatus = "", sortField = "name", sortDir = "asc" } = opts;
  let d = [...records];

  if (search) {
    const q = search.toLowerCase();
    d = d.filter(
      r =>
        r.name.toLowerCase().includes(q) ||
        r.head.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q)
    );
  }
  if (filterStatus) d = d.filter(r => r.status === filterStatus);

  d.sort((a, b) => {
    let cmp = 0;
    if (sortField === "name") cmp = a.name.localeCompare(b.name);
    else if (sortField === "employees") cmp = a.employees - b.employees;
    return sortDir === "asc" ? cmp : -cmp;
  });

  return d;
}

/** Filters employees for the Team Members tab */
export function filterEmployees(
  employees: Employee[],
  opts: { search?: string; filterDept?: string; filterAvail?: string }
): Employee[] {
  const { search = "", filterDept = "", filterAvail = "" } = opts;
  let d = [...employees];

  if (search) {
    const q = search.toLowerCase();
    d = d.filter(
      e =>
        e.name.toLowerCase().includes(q) ||
        e.role.toLowerCase().includes(q) ||
        e.employeeId.toLowerCase().includes(q)
    );
  }
  if (filterDept) d = d.filter(e => e.department === filterDept);
  if (filterAvail) d = d.filter(e => e.availability === filterAvail);

  return d;
}

/** Initials from a full name, e.g. "Rajesh Kumar" -> "RK" */
export function initialsFromName(name: string): string {
  return name.split(" ").map(n => n[0]).join("").slice(0, 2);
}

/** Workload bar color based on percentage */
export function workloadColorCfg(workload: number): { bar: string; text: string } {
  if (workload >= 85) return { bar: "bg-red-500", text: "text-red-600" };
  if (workload >= 70) return { bar: "bg-amber-500", text: "text-amber-600" };
  return { bar: "bg-emerald-500", text: "text-emerald-600" };
}
