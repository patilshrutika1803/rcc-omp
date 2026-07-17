// ─────────────────────────────────────────────────────────────────────────────
// Preventive Maintenance — Constants
// Extracted verbatim from PreventiveMaintenancePage.tsx. No values changed.
// ─────────────────────────────────────────────────────────────────────────────

import type { PMStatus } from "../types/pm";

export const FREQUENCIES = ["Daily", "Weekly", "Bi-Weekly", "Monthly", "Quarterly", "Half-Yearly", "Yearly"];

// System Inventory is the single source of truth for which systems can have
// a PM schedule. Only Laptop / Desktop PC records are PM-eligible; Printers
// never appear here.
export const PM_ELIGIBLE_TYPES = ["Laptop", "Desktop PC"];

export const REMINDER_OPTIONS = ["Same Day", "1 Day Before", "3 Days Before", "1 Week Before"];

export const PRIORITY_OPTIONS = ["Critical", "High", "Medium", "Low"];

export const INITIAL_STATUS_OPTIONS: PMStatus[] = ["Scheduled", "Upcoming", "In Progress"];

export const STATUS_FILTER_OPTIONS = ["Due Today", "Upcoming", "Completed", "Overdue", "In Progress", "Scheduled"];

export const QUICK_FILTERS = ["All", "Due Today", "Overdue", "Upcoming", "Completed", "In Progress"];

export const SNOOZE_OPTIONS = [
  { label: "1 Day", value: "1d", days: 1 },
  { label: "3 Days", value: "3d", days: 3 },
  { label: "7 Days", value: "7d", days: 7 },
] as const;

export const CALENDAR_LEGEND = [
  { color: "bg-blue-500", label: "Due Today" },
  { color: "bg-red-500", label: "Overdue" },
  { color: "bg-emerald-500", label: "Completed" },
  { color: "bg-slate-400", label: "Upcoming" },
];

export const PM_PAGE_SIZE = 10;

// Interval (in days) used to project the next few upcoming maintenance dates
// in the Machine Drawer "Schedule" tab, keyed by frequency label.
export const FREQUENCY_INTERVAL_DAYS: Record<string, number> = {
  Daily: 1,
  Weekly: 7,
  "Bi-Weekly": 14,
  Monthly: 30,
  Quarterly: 90,
  "Half-Yearly": 180,
  Yearly: 365,
};

// Backward-compatible export for other modules that still import PM_DATA.
// Backend-ready: starts empty, no hardcoded/demo records.
import type { PMRecord } from "../types/pm";
export const PM_DATA: PMRecord[] = [];
