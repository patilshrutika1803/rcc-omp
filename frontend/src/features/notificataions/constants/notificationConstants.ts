// ─────────────────────────────────────────────────────────────────────────────
// Static configuration for the Notifications module
// ─────────────────────────────────────────────────────────────────────────────

import type { NotificationCategory, NotificationFilterId } from "../types/notification";

export const DEFAULT_FILTER: NotificationFilterId = "all";

export const NOTIFICATION_CATEGORIES: NotificationCategory[] = [
  "inspection",
  "maintenance",
  "qa",
  "backup",
  "monthly-hard-disk",
  "machine",
  "department",
  "system",
];

// Base sidebar filter definitions (labels only — counts are computed at runtime
// in useNotifications / notificationHelpers).
export const SIDEBAR_FILTER_DEFS: { id: NotificationFilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "critical", label: "Critical" },
  { id: "warning", label: "Warnings" },
  { id: "inspection", label: "Inspection" },
  { id: "maintenance", label: "Maintenance" },
  { id: "qa", label: "QA" },
  { id: "backup", label: "Backup" },
  { id: "monthly-hard-disk", label: "Monthly Hard Disk" },
  { id: "machine", label: "Machine" },
  { id: "department", label: "Department" },
  { id: "system", label: "System" },
  { id: "archived", label: "Archived" },
];
