import type { BackupJob } from "../types/backup";

const BACKUP_STORAGE_KEY = "rcc_omp_backup_jobs_v1";

export function loadPersistedBackupJobs(): BackupJob[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(BACKUP_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as BackupJob[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function persistBackupJobs(jobs: BackupJob[]): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(jobs));
  } catch {
    // Ignore storage failures silently to keep the UI usable.
  }
}

export function buildBackupFileName(job: BackupJob): string {
  const slug = (job.name || "backup-report")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return `${slug || "backup-report"}-report.pdf`;
}
