import {
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  CalendarClock,
  LayoutDashboard,
} from "lucide-react";
import type { QAActivity, QAActivityFormState, QAColumnsState, QAFiltersState, QASubTab } from "../types/qa";

// ─────────────────────────────────────────────────────────────────────────────
// QA MODULE — CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

export const DEPARTMENTS = [
  "Quality Assurance",
  "Quality Control",
  "Production",
  "Warehouse",
  "Engineering",
  "Purchase and Accounts",
  "HR Admin",
  "Environment Health and Safety",
  "IT",
  "Microbiology",
];

export const REMINDER_OPTIONS = [
  "1 Day Before",
  "3 Days Before",
  "1 Week Before",
  "Monthly",
  "Quarterly",
  "Half Yearly",
  "Yearly",
];

// No demo / sample records. Table, dashboard and charts must all render a
// clean empty state until real data is created or fetched from the backend.
export const INITIAL_QA_ACTIVITIES: QAActivity[] = [];

export const EMPTY_FORM: QAActivityFormState = {
  qmsNumber: "",
  qmsType: "",
  qmsDescription: "",
  department: DEPARTMENTS[0],
  targetDate: "",
  reminder: REMINDER_OPTIONS[0],
  completed: "Pending",
  action: "",
};

export const DEFAULT_FILTERS: QAFiltersState = {
  department: "",
  reminder: "",
  completed: "",
  targetDate: "",
};

export const DEFAULT_COLUMNS: QAColumnsState = {
  qmsType: true,
  department: true,
  targetDate: true,
  reminder: true,
  completed: true,
  action: true,
};

export const QA_SUB_TABS: { id: QASubTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "QA Dashboard", icon: LayoutDashboard },
  { id: "activities", label: "Activity List", icon: CheckSquare },
];

// KPI card configuration for the dashboard. `key` maps to the corresponding
// computed count in useQA (see hooks/useQA.ts).
export const KPI_CARD_CONFIG = [
  { key: "totalCount", label: "Total QA Activities", icon: CheckSquare, color: "text-blue-600", bg: "bg-blue-50" },
  { key: "pendingCount", label: "Pending", icon: Clock, color: "text-slate-600", bg: "bg-slate-100" },
  { key: "completedCount", label: "Completed", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  { key: "overdueCount", label: "Overdue", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
  { key: "upcomingCount", label: "Upcoming", icon: CalendarClock, color: "text-amber-600", bg: "bg-amber-50" },
] as const;

// Table column configuration — order + label used when rendering headers.
export const TABLE_COLUMNS: { key: keyof QAColumnsState; label: string }[] = [
  { key: "qmsType", label: "QMS Type" },
  { key: "department", label: "Department" },
  { key: "targetDate", label: "Target Date" },
  { key: "reminder", label: "Reminder" },
  { key: "completed", label: "Completed" },
  { key: "action", label: "Action" },
];
