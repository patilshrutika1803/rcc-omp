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

export interface BackupJobExecutionData {
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

export interface BackupJob {
  id: string;
  name: string;
  server: string;
  institutionName?: string;
  systemId?: string;
  backupType: BkpType;
  frequency: string;
  department: string;
  destination: string;
  quota: number;
  priority?: "Low" | "Medium" | "High" | "Critical";
  reminder?: string;
  notes?: string;
  status: BkpStatus;
  dueDate: string;
  lastDueDate?: string;
  nextDueDate: string;
  reminderDate?: string;
  nextReminderDate?: string;
  scheduledNextBackup?: string;
  nextBackup: string;
  backupTime: string;
  lastBackup?: string;
  lastBackupDate?: string;
  sizeGB: number;
  retention: string;
  duration: string;
  lastVerified: string;
  recoveryPoints: number;
  compressionRatio: string;
  description: string;
  history: BackupJobHistoryEntry[];
  executionData?: BackupJobExecutionData;
  completionDate?: string;
  completionRemarks?: string;
  completedBy?: string;
  completionNotes?: string;
  verifiedBy?: string;
  progress: number;
  user: string;
  // Recurrence tracking to mirror Preventive Maintenance architecture
  recurrenceId?: string;
  parentId?: string;
  originalDueDate?: string;
}

export interface BackupJobFormData {
  name: string;
  department: string;
  backupType: BkpType;
  frequency: string;
  systemId: string;
  initialDueDate: string;
  lastBackupDate?: string;
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
