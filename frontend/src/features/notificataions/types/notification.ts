// ─────────────────────────────────────────────────────────────────────────────
// Notification domain types
// ─────────────────────────────────────────────────────────────────────────────

export type NotificationCategory =
  | "maintenance"
  | "qa"
  | "backup"
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
  read: boolean;
  archived: boolean;

  // PM Reminder fields (for Preventive Maintenance notifications)
  pmId?: string;
  machineId?: string;
  machineName?: string;
  department?: string;
  assignedUser?: string;
  dueDate?: string;
  notificationType?: string;
}

export type NotificationFilterId =
  | "all"
  | "unread"
  | "critical"
  | "warning"
  | NotificationCategory
  | "archived";

export interface NotificationFilter {
  id: NotificationFilterId;
  label: string;
  count: number;
}
