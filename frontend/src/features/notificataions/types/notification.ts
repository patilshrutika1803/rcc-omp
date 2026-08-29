// ─────────────────────────────────────────────────────────────────────────────
// Notification domain types
// ─────────────────────────────────────────────────────────────────────────────

export type NotificationCategory =
  | "inspection"
  | "maintenance"
  | "qa"
  | "backup"
  | "monthly-hard-disk"
  | "machine"
  | "department"
  | "system";

export type NotificationSeverity = "critical" | "warning" | "info" | "success";

export interface Notification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  severity: NotificationSeverity;
  time: string;
  createdAt?: string;
  route?: string;
  notificationKey?: string;
  read: boolean;
  archived: boolean;
  deleted?: boolean;
  deletedAt?: string;

  // Reminder fields for Preventive Maintenance, Backup, and QA notifications
  pmId?: string;
  machineId?: string;
  machineName?: string;
  systemId?: string;
  systemName?: string;
  department?: string;
  assignedUser?: string;
  dueDate?: string;
  notificationType?: string;
  inspectionScheduleId?: string;
  backupJobId?: string;
  backupJobName?: string;
  hardDiskCycleId?: string;
  hardDiskReminderType?: string;
  priority?: string;
  backupType?: string;
  qaActivityId?: string;
  qaActivityNumber?: string;
  systemInspectionId?: string;
}

export type NotificationFilterId =
  | "all"
  | "unread"
  | "critical"
  | "warning"
  | NotificationCategory
  | "archived"
  | "trash";

export interface NotificationFilter {
  id: NotificationFilterId;
  label: string;
  count: number;
}
