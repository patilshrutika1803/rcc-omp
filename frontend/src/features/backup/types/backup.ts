// ─────────────────────────────────────────────────────────────────────────────
// Backup module — shared types
// ─────────────────────────────────────────────────────────────────────────────

export type BkpStatus = "Completed" | "Running" | "Failed" | "Scheduled" | "Paused" | "Cancelled";
export type BkpType = "Full" | "Incremental" | "Differential" | "Snapshot";

export interface BackupJobHistoryEntry {
  date: string;
  status: BkpStatus;
  duration: string;
  sizeGB: number;
}

export interface BackupJob {
  id: string;
  name: string;
  server: string;
  backupType: BkpType;
  frequency: string;
  lastBackup: string;
  nextBackup: string;
  status: BkpStatus;
  progress: number;
  user: string;
  sizeGB: number;
  destination: string;
  retention: string;
  duration: string;
  department: string;
  lastVerified: string;
  recoveryPoints: number;
  compressionRatio: string;
  quota: number;
  description: string;
  history: BackupJobHistoryEntry[];
}

export interface BackupJobFormData {
  name: string;
  department: string;
  backupType: BkpType;
  frequency: string;
  destination: string;
  backupTime: string;
  user: string;
  quota: number;
  description: string;
}

export interface WeeklyTrendPoint {
  day: string;
  success: number;
  failed: number;
  total: number;
  storage: number;
}

export interface StorageTrendPoint {
  month: string;
  used: number;
  capacity: number;
}

export type BackupSubTab = "dashboard" | "jobs" | "calendar";
