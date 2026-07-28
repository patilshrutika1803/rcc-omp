import {
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  CalendarClock,
} from "lucide-react";
import type { QAActivity, QAActivityFormState, QAColumnsState, QAFiltersState } from "../types/qa";

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
  "Same Day",
  "1 Day Before",
  "3 Days Before",
  "7 Days Before",
  "15 Days Before",
  "30 Days Before",
];

export const PRIORITY_OPTIONS = ["Low", "Medium", "High", "Critical"] as const;
export const FREQUENCY_OPTIONS = ["Daily", "Weekly", "Monthly", "Quarterly", "Half-Yearly", "Yearly", "One Time"];

export const INITIAL_QA_ACTIVITIES: QAActivity[] = [];

export const EMPTY_FORM: QAActivityFormState = {
  qmsNumber: "",
  qmsType: "",
  qmsDescription: "",
  department: DEPARTMENTS[0],
  targetDate: "",
  dueDate: "",
  reminder: REMINDER_OPTIONS[0],
  priority: "Medium",
  assignedUser: "",
  frequency: "Monthly",
  action: "",
};

export const DEFAULT_FILTERS: QAFiltersState = {
  department: "",
  reminder: "",
  status: "",
  priority: "",
  targetDate: "",
};

export const DEFAULT_COLUMNS: QAColumnsState = {
  qmsType: true,
  department: true,
  dueDate: true,
  lastDueDate: false,
  reminder: true,
  frequency: true,
  priority: true,
  status: true,
  action: true,
};

export const KPI_CARD_CONFIG = [
  { key: "totalCount", label: "Total QA Activities", icon: CheckSquare, color: "text-blue-600", bg: "bg-blue-50" },
  { key: "pendingCount", label: "Upcoming", icon: Clock, color: "text-slate-600", bg: "bg-slate-100" },
  { key: "completedCount", label: "Completed", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  { key: "overdueCount", label: "Overdue", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
  { key: "upcomingCount", label: "Paused", icon: CalendarClock, color: "text-amber-600", bg: "bg-amber-50" },
] as const;

export const TABLE_COLUMNS: { key: keyof QAColumnsState; label: string }[] = [
  { key: "qmsType", label: "QMS Type" },
  { key: "department", label: "Department" },
  { key: "lastDueDate", label: "Last Due" },
  { key: "dueDate", label: "Due Date" },
  { key: "reminder", label: "Reminder" },
  { key: "frequency", label: "Frequency" },
  { key: "priority", label: "Priority" },
  { key: "status", label: "Status" },
  { key: "action", label: "Action" },
];
