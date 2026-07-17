// ─────────────────────────────────────────────────────────────────────────────
// backupService
//
// Placeholder service layer for the Backup Activities module. This is the ONLY
// intended communication point between the UI and a backend — no component
// should call fetch/Supabase/etc directly.
//
// These methods are stubs today: the module runs entirely on in-memory state
// managed by useBackupActivities. Wire each method up to a real backend later
// (AWS REST API, Supabase, S3 for artifact storage, etc.) without needing to
// change any component.
// ─────────────────────────────────────────────────────────────────────────────

import type { BackupJob, BackupJobFormData } from "../types/backup";

export async function getBackupJobs(): Promise<BackupJob[]> {
  // TODO: replace with a real fetch, e.g.:
  //   const res = await fetch("/api/backup-jobs");
  //   return res.json();
  //   const { data } = await supabase.from("backup_jobs").select("*");
  return [];
}

export async function createBackupJob(data: BackupJobFormData): Promise<BackupJob> {
  // TODO: POST /api/backup-jobs
  throw new Error("createBackupJob is not implemented — backend not connected yet.");
}

export async function updateBackupJob(id: string, data: BackupJobFormData): Promise<BackupJob> {
  // TODO: PATCH /api/backup-jobs/:id
  throw new Error("updateBackupJob is not implemented — backend not connected yet.");
}

export async function deleteBackupJob(id: string): Promise<void> {
  // TODO: DELETE /api/backup-jobs/:id
  throw new Error("deleteBackupJob is not implemented — backend not connected yet.");
}

export async function runBackupNow(id: string): Promise<void> {
  // TODO: POST /api/backup-jobs/:id/run
  throw new Error("runBackupNow is not implemented — backend not connected yet.");
}

export async function duplicateBackupJob(id: string): Promise<BackupJob> {
  // TODO: POST /api/backup-jobs/:id/duplicate
  throw new Error("duplicateBackupJob is not implemented — backend not connected yet.");
}

export async function exportBackupJob(id: string): Promise<Blob> {
  // TODO: GET /api/backup-jobs/:id/export
  throw new Error("exportBackupJob is not implemented — backend not connected yet.");
}
