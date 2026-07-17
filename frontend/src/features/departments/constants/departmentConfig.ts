// ─────────────────────────────────────────────────────────────────────────────
// Department feature — constants / configuration
// Extracted from the original monolithic DepartmentsPage.tsx.
// No behavior changes — values only.
// ─────────────────────────────────────────────────────────────────────────────

import type { DeptTab } from "../types/department";
import type * as React from "react";
import {
  Table2,
  Calendar as CalendarIcon,
} from "lucide-react";
import { ALLOWED_USER_NAMES } from "../../../auth/userDirectory";

/** Department status dropdown / filter options */
export const DEPARTMENT_STATUS_OPTIONS = ["Active", "Under Review", "Restructuring"] as const;

/** Employee availability dropdown / filter options */
export const AVAILABILITY_OPTIONS = ["Available", "Busy", "On Leave", "Remote"] as const;

/**
 * Static list of department names.
 * NOTE: kept as a constant for now (used for filters/dropdowns). Once
 * departmentService.ts is wired to Supabase, this should be replaced by the
 * live department list returned from getDepartments().
 */
export const DEPARTMENTS = [
  "Quality Assurance",
  "Quality Control",
  "Production",
  "Warehouse",
  "Engineering",
  "Purchase & Accounts",
  "HR & Admin",
  "Environmental Health & Safety",
  "IT Department",
];

/**
 * Static list of assignable users for the Department Form modal
 * "Assign Users" section.
 * NOTE: kept as a constant for now. Once departmentService.ts (or a future
 * userService.ts) is wired to Supabase, this should come from the backend.
 */
export const USERS = ALLOWED_USER_NAMES;

/** Top-level tab configuration for DepartmentPage */
export const DEPARTMENT_TABS: {
  id: DeptTab;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  { id: "directory", label: "Department Directory", icon: Table2 },
  { id: "calendar", label: "Calendar", icon: CalendarIcon },
];

/** Sections within the Department Details view */
export const DEPARTMENT_DETAIL_SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "kpis", label: "Monthly KPIs" },
  { id: "tasks", label: "Tasks & Workload" },
  { id: "team", label: "Team" },
  { id: "reports", label: "Recent Reports" },
] as const;

/** Calendar event type filter options */
export const CALENDAR_EVENT_TYPES = [
  { id: "all", label: "All Events" },
  { id: "maintenance", label: "Maintenance" },
  { id: "review", label: "Reviews" },
  { id: "audit", label: "Audits" },
  { id: "training", label: "Training" },
  { id: "meeting", label: "Meetings" },
  { id: "shutdown", label: "Shutdowns" },
];

/** Calendar legend swatches */
export const CALENDAR_LEGEND = [
  { color: "bg-blue-400", label: "Maintenance" },
  { color: "bg-purple-400", label: "Review" },
  { color: "bg-red-400", label: "Audit" },
  { color: "bg-amber-400", label: "Training" },
  { color: "bg-indigo-400", label: "Meeting" },
  { color: "bg-slate-400", label: "Shutdown" },
];

/** Report type badge colors, keyed by report type label */
export const REPORT_TYPE_COLORS: Record<string, string> = {
  "Monthly Summary": "bg-blue-50 text-blue-700 border-blue-200",
  "Performance Report": "bg-purple-50 text-purple-700 border-purple-200",
  "Maintenance Report": "bg-amber-50 text-amber-700 border-amber-200",
  "QA Report": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Backup Report": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Machine Report": "bg-cyan-50 text-cyan-700 border-cyan-200",
};

/** Dashboard performance trend legend (Performance Overview chart) */
export const PERFORMANCE_TREND_LEGEND: [string, string][] = [
  ["#2563EB", "Production"],
  ["#7C3AED", "IT Infra"],
  ["#D97706", "Warehouse"],
  ["#EF4444", "Engineering"],
  ["#10B981", "QA"],
];

/** Task distribution chart legend (dashboard) */
export const TASK_DIST_LEGEND: [string, string][] = [
  ["bg-blue-600", "Open PM"],
  ["bg-purple-600", "Open QA"],
  ["bg-emerald-500", "Backup"],
];
