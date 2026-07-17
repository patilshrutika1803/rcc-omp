import type { BackupJob } from "../types/backup";

export interface BackupKpi {
  total: number;
  successful: number;
  failed: number;
  running: number;
  totalGB: number;
}

export function computeBackupKpi(jobs: BackupJob[]): BackupKpi {
  return {
    total: jobs.length,
    successful: jobs.filter(j => j.status === "Completed").length,
    failed: jobs.filter(j => j.status === "Failed").length,
    running: jobs.filter(j => j.status === "Running").length,
    totalGB: jobs.reduce((s, j) => s + j.sizeGB, 0),
  };
}

export function computeSuccessRate(jobs: BackupJob[], kpi: BackupKpi): number {
  const nonScheduled = kpi.total - jobs.filter(j => j.status === "Scheduled").length;
  return nonScheduled > 0 ? Math.round((kpi.successful / nonScheduled) * 100) : 0;
}

export function getTodayJobs(jobs: BackupJob[]): BackupJob[] {
  return jobs.filter(j => j.lastBackup.startsWith("2026-07-03") || j.status === "Running");
}

export function computeUsedPct(sizeGB: number, quota: number): number {
  return quota > 0 ? Math.round((sizeGB / quota) * 100) : 0;
}
