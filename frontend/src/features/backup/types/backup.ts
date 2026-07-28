// ─────────────────────────────────────────────────────────────────────────────
// Backup module — shared types
// ─────────────────────────────────────────────────────────────────────────────

export type BkpStatus = "Completed" | "Running" | "Failed" | "Scheduled" | "Upcoming" | "Paused" | "Cancelled";
export type BkpType = "Full" | "Incremental" | "Differential" | "Snapshot";

export interface BackupJobExecutionDetails {
  institutionName: string;
  system: string;
  department: string;
  backupFrequency: string;
  systemId: string;
  instrumentName: string;
  backupDate: string;
  backupTime: string;
  backupSize: number;
  unit: string;
  doneBy: string;
  verifiedBy: string;
  executionNotes: string;
}

export interface BackupJobHistoryEntry {
  date: string;
  status: BkpStatus;
  duration: string;
  sizeGB: number;
  executionDetails?: BackupJobExecutionDetails;
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
  reminder?: string;
  reminderDate?: string;
  priority?: "Low" | "Medium" | "High" | "Critical";
  recurringParentId?: string;
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
  priority: "Low" | "Medium" | "High" | "Critical";
  reminder: string;
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

export type BackupSubTab = "jobs" | "calendar";
