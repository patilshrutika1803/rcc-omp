import type { BkpStatus, BkpType, BackupJob } from "../types/backup";

export interface BackupJobFilters {
  status: string;
  type: string;
  department: string;
  frequency: string;
  priority: string;
  institutionName: string;
  dueDate: string;
}

export function bkpStatusCfg(status: BkpStatus) {
  switch (status) {
    case "Completed":  return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" };
    case "Running":    return { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    dot: "bg-blue-500"    };
    case "Failed":     return { bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",     dot: "bg-red-500"     };
    case "Scheduled":  return { bg: "bg-slate-50",   text: "text-slate-600",   border: "border-slate-200",   dot: "bg-slate-400"   };
    case "Upcoming":   return { bg: "bg-sky-50",     text: "text-sky-700",    border: "border-sky-200",    dot: "bg-sky-500"     };
    case "Paused":     return { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-500"   };
    case "Cancelled":  return { bg: "bg-slate-50",   text: "text-slate-400",   border: "border-slate-200",   dot: "bg-slate-300"   };
    default:           return { bg: "bg-slate-50",   text: "text-slate-600",   border: "border-slate-200",   dot: "bg-slate-400"   };
  }
}

export function bkpTypeCfg(type: BkpType) {
  switch (type) {
    case "Full":         return { bg: "bg-blue-50",    text: "text-blue-700"    };
    case "Incremental":  return { bg: "bg-purple-50",  text: "text-purple-700"  };
    case "Differential": return { bg: "bg-indigo-50",  text: "text-indigo-700"  };
    case "Snapshot":     return { bg: "bg-teal-50",    text: "text-teal-700"    };
  }
}

export function matchesBackupJobSearchAndFilters(
  job: BackupJob,
  search: string,
  statusF: string,
  typeF: string,
  filters?: Partial<BackupJobFilters>
): boolean {
  if (search) {
    const q = search.toLowerCase();
    const latestExecution = job.history[0]?.executionDetails;
    const matchesSearch =
      job.name.toLowerCase().includes(q) ||
      job.id.toLowerCase().includes(q) ||
      job.department.toLowerCase().includes(q) ||
      (latestExecution?.institutionName ?? "").toLowerCase().includes(q);
    if (!matchesSearch) return false;
  }

  if (statusF && job.status !== statusF) return false;
  if (typeF && job.backupType !== typeF) return false;
  if (filters?.department && job.department !== filters.department) return false;
  if (filters?.frequency && job.frequency !== filters.frequency) return false;
  if (filters?.priority && (job.priority || "Medium") !== filters.priority) return false;
  const latestExecution = job.history[0]?.executionDetails;
  if (filters?.institutionName && !((latestExecution?.institutionName ?? "").toLowerCase().includes(filters.institutionName.toLowerCase()))) return false;
  if (filters?.dueDate && job.nextBackup.split(" ")[0] !== filters.dueDate) return false;
  return true;
}

export function bkpMatchesSearch(job: BackupJob, search: string): boolean {
  return matchesBackupJobSearchAndFilters(job, search, "", "", undefined);
}

export function bkpMatchesFilters(job: BackupJob, statusF: string, typeF: string, filters?: Partial<BackupJobFilters>): boolean {
  return matchesBackupJobSearchAndFilters(job, "", statusF, typeF, filters);
}

export function bkpCompare(a: BackupJob, b: BackupJob, sortField: string, sortDir: "asc" | "desc"): number {
  const av = a[sortField as keyof BackupJob]?.toString() ?? "";
  const bv = b[sortField as keyof BackupJob]?.toString() ?? "";
  const cmp = sortField === "sizeGB" ? a.sizeGB - b.sizeGB : av.localeCompare(bv);
  return sortDir === "asc" ? cmp : -cmp;
}

export function filterAndSortJobs(
  jobs: BackupJob[],
  search: string,
  statusF: string,
  typeF: string,
  sortField: string,
  sortDir: "asc" | "desc",
  filters?: Partial<BackupJobFilters>
): BackupJob[] {
  let d = jobs.filter(j => bkpMatchesSearch(j, search) && bkpMatchesFilters(j, statusF, typeF, filters));
  d = [...d].sort((a, b) => bkpCompare(a, b, sortField, sortDir));
  return d;
}

export function getJobsForDay(jobs: BackupJob[], year: number, month: number, day: number): BackupJob[] {
  const prefix = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return jobs.filter(j => j.lastBackup.startsWith(prefix) || j.nextBackup.startsWith(prefix));
}

export function isJobNextOnDay(job: BackupJob, year: number, month: number, day: number): boolean {
  return job.nextBackup.startsWith(`${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
}

export function groupJobsForTimeline(jobs: BackupJob[]) {
  const today = jobs.filter(j => j.nextBackup.startsWith("2026-07-03") || j.status === "Running" || j.status === "Failed");
  const tomorrow = jobs.filter(j => j.nextBackup.startsWith("2026-07-04"));
  const later = jobs.filter(j => !j.nextBackup.startsWith("2026-07-03") && !j.nextBackup.startsWith("2026-07-04"));
  return { today, tomorrow, later };
}

export function userInitials(user: string): string {
  return user.split(" ").map(n => n[0]).join("");
}
