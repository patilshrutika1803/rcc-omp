import type { BkpStatus, BkpType, WeeklyTrendPoint, StorageTrendPoint, BackupSubTab } from "../types/backup";
import { LayoutDashboard, Archive, Calendar as CalendarIcon } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// DATA SOURCE (backend-ready)
// Currently initialized empty. Replace this initial state / fetch logic with a
// real data source later — e.g.:
//   const { data } = await fetch("/api/backups").then(r => r.json());
//   const { data } = await supabase.from("backup_jobs").select("*");
//   const { data } = await db.collection("backup_jobs").find({}).toArray(); // MongoDB
//   const { data } = await pgPool.query("SELECT * FROM backup_jobs");      // PostgreSQL
// The BackupJob[] shape defined in types/backup.ts is the contract the backend
// response should conform to (or be mapped into) so no UI changes are required.
// ─────────────────────────────────────────────────────────────────────────────
export const BACKUP_JOBS: import("../types/backup").BackupJob[] = [];

// Weekly success/failure trend used by the analytics charts. Replace with an
// aggregation query (e.g. GROUP BY day) from the backend once available.
export const BKP_WEEKLY_TREND: WeeklyTrendPoint[] = [];

// Monthly storage usage trend used by the storage chart. Replace with an
// aggregation query from the backend once available.
export const BKP_STORAGE_TREND: StorageTrendPoint[] = [];

export const BKP_STATUSES: BkpStatus[] = ["Completed", "Running", "Failed", "Scheduled", "Paused", "Cancelled"];
export const BKP_TYPES: BkpType[] = ["Full", "Incremental", "Differential", "Snapshot"];

export const BKP_DEPARTMENTS = [
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

export const BKP_FREQUENCIES = ["Daily", "Weekly", "Monthly", "Quarterly", "Hourly"];
// "Backup Destination" and "Assigned User" are free-text fields (manually
// entered by the user) rather than fixed option lists — see BackupJobModal.

export const BKP_SUB_TABS: { id: BackupSubTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "jobs", label: "Backup Jobs", icon: Archive },
  { id: "calendar", label: "Calendar", icon: CalendarIcon },
];

// KPI configuration used by the dashboard's Backup Type Mix donut/legend.
export const BKP_TYPE_MIX = [
  { name: "Full", value: 30, color: "#3B82F6" },
  { name: "Incremental", value: 40, color: "#8B5CF6" },
  { name: "Differential", value: 20, color: "#6366F1" },
  { name: "Snapshot", value: 10, color: "#14B8A6" },
];

export const BKP_TYPE_MIX_BARS = [
  { name: "Full", pct: 30, color: "bg-blue-500" },
  { name: "Incremental", pct: 40, color: "bg-purple-500" },
  { name: "Differential", pct: 20, color: "bg-indigo-500" },
  { name: "Snapshot", pct: 10, color: "bg-teal-500" },
];

export const BKP_WEEKLY_SUMMARY = [
  { label: "Total Jobs Run", value: "63", color: "text-slate-900", bar: "bg-blue-500", pct: 100 },
  { label: "Successful", value: "57", color: "text-emerald-700", bar: "bg-emerald-500", pct: 90 },
  { label: "Failed", value: "4", color: "text-red-600", bar: "bg-red-400", pct: 6 },
  { label: "Avg. Duration", value: "54m", color: "text-slate-700", bar: "bg-indigo-400", pct: 60 },
];

export const BKP_FAILED_JOBS_SAMPLE = [
  { job: "ERP Full Backup", server: "SRV-ERP-001", dt: "2026-06-30 02:00", err: "Network timeout during transfer", dur: "8m", eng: "Arjun Rao" },
  { job: "VMware ESXi Snapshot", server: "VMH-ESX-001", dt: "2026-07-03 04:00", err: "Snapshot consolidation failed", dur: "4m", eng: "Arjun Rao" },
  { job: "File Server Incremental", server: "SRV-FILE-001", dt: "2026-06-29 03:30", err: "Insufficient destination storage", dur: "12m", eng: "Rajesh Kumar" },
  { job: "Production SQL Server", server: "SRV-SQL-002", dt: "2026-07-01 00:00", err: "SQL VSS writer timeout", dur: "3m", eng: "Suresh Babu" },
];

export const BKP_CALENDAR_LEGEND = [
  { color: "bg-emerald-500", label: "Completed" },
  { color: "bg-blue-500", label: "Running" },
  { color: "bg-red-500", label: "Failed" },
  { color: "bg-slate-400", label: "Scheduled" },
];

export const BKP_CALENDAR_WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const BKP_DEFAULT_FORM_TIME = "02:00";
export const BKP_DEFAULT_FORM_QUOTA = 500;
