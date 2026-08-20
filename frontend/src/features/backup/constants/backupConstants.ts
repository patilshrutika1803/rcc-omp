import type { BkpStatus, BkpType, WeeklyTrendPoint, StorageTrendPoint, BackupSubTab } from "../types/backup";
import { Archive } from "lucide-react";
import { DEPARTMENT_OPTIONS } from "../../../constants/departments";


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

export const BKP_STATUSES: BkpStatus[] = ["Completed", "Running", "Failed", "Scheduled", "Upcoming", "Paused", "Cancelled"];
export const BKP_TYPES: BkpType[] = ["Full", "Incremental", "Differential", "Snapshot"];

export const BKP_DEPARTMENTS = [...DEPARTMENT_OPTIONS];

export const BKP_FREQUENCIES = ["Daily", "Weekly", "Monthly", "Quarterly", "Half-Yearly", "Yearly", "One Time"];
export const BKP_REMINDER_OPTIONS = ["Same Day", "1 Day Before", "3 Days Before", "7 Days Before", "15 Days Before", "30 Days Before"];
export const BKP_PRIORITY_OPTIONS = ["Low", "Medium", "High", "Critical"] as const;

// "Backup Destination" and "Assigned User" are free-text fields (manually
// entered by the user) rather than fixed option lists — see BackupJobModal.

export const BKP_SUB_TABS: { id: BackupSubTab; label: string; icon: typeof Archive }[] = [
  { id: "jobs", label: "Backup Jobs", icon: Archive },
];

// KPI configuration used by the dashboard's Backup Type Mix donut/legend.
// Backup type mix — populated from real job data at runtime (see BackupTypeChart).
export const BKP_TYPE_MIX: { name: string; value: number; color: string }[] = [];
export const BKP_TYPE_MIX_BARS: { name: string; pct: number; color: string }[] = [];

// Weekly summary — computed from real job data at runtime (see SuccessRateChart).
export const BKP_WEEKLY_SUMMARY: { label: string; value: string; color: string; bar: string; pct: number }[] = [];

// Failed jobs — populated from real job data at runtime (see FailedJobsTable).
export const BKP_FAILED_JOBS_SAMPLE: { job: string; server: string; dt: string; err: string; dur: string; eng: string }[] = [];

export const BKP_DEFAULT_FORM_TIME = "02:00";
export const BKP_DEFAULT_FORM_QUOTA = 500;
