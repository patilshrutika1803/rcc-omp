import type { BackupJob } from "../types/backup";

const BACKUP_STORAGE_KEY = "rcc_omp_backup_jobs_v1";

export interface PersistedBackupState {
  activeJobs: BackupJob[];
  completedJobs: BackupJob[];
}

export function loadPersistedBackupJobs(): PersistedBackupState {
  if (typeof window === "undefined") return { activeJobs: [], completedJobs: [] };

  try {
    const raw = window.localStorage.getItem(BACKUP_STORAGE_KEY);
    if (!raw) return { activeJobs: [], completedJobs: [] };

    const parsed = JSON.parse(raw) as PersistedBackupState | BackupJob[];
    if (Array.isArray(parsed)) {
      return { activeJobs: parsed, completedJobs: [] };
    }

    return {
      activeJobs: Array.isArray(parsed.activeJobs) ? parsed.activeJobs : [],
      completedJobs: Array.isArray(parsed.completedJobs) ? parsed.completedJobs : [],
    };
  } catch {
    return { activeJobs: [], completedJobs: [] };
  }
}

export function persistBackupJobs(activeJobs: BackupJob[], completedJobs: BackupJob[]): void {
  if (typeof window === "undefined") return;

  try {
    const payload: PersistedBackupState = { activeJobs, completedJobs };
    window.localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(payload));
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
