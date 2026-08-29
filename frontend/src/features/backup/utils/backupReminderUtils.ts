import type { BackupJob } from "../types/backup";
import type { Notification } from "../../notificataions/types/notification";
import {
  addNotification,
  hasNotificationForBackup,
  removeBackupNotifications,
} from "../../notificataions/utils/notificationStorage";
import {
  calculateNextDueDate,
  calculateReminderDate as calculateSharedReminderDate,
  getLocalTodayDateKey,
} from "../../shared/utils/recurringWorkflow";

function formatDateDisplay(dateStr: string): string {
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function calculateReminderDate(
  dueDate: string,
  reminderOption: string | undefined
): string | undefined {
  return calculateSharedReminderDate(dueDate, reminderOption);
}

export function calculateNextBackupDate(
  currentNextBackup: string,
  frequency: string,
  backupTime?: string
): string {
  const currentDate = currentNextBackup.split(" ")[0] || currentNextBackup;
  const nextDue = calculateNextDueDate(currentDate, frequency);
  if (!nextDue) return "";
  const timePart = backupTime ?? currentNextBackup.split(" ")[1] ?? "02:00";
  return `${nextDue} ${timePart}`;
}

export function getSeverityFromPriority(priority: string): Notification["severity"] {
  switch (priority) {
    case "Critical":
    case "High":
      return "critical";
    case "Medium":
      return "warning";
    case "Low":
      return "info";
    default:
      return "info";
  }
}

export function generateBackupReminderNotification(job: BackupJob): Notification {
  const now = new Date();
  const timeStr = now.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const severity = getSeverityFromPriority(job.priority || "Medium");
  const notificationKey = `backup-reminder-${job.id}-${job.reminderDate || job.nextDueDate || job.dueDate}`;
  const message = `Backup Activity:\n${job.name}\n\nIs due on\n${formatDateDisplay(job.nextDueDate || job.dueDate)}.\n\nDepartment:\n${job.department}\n\nPriority:\n${job.priority || "Medium"}\n\nBackup Type:\n${job.backupType}`;

  return {
    id: notificationKey,
    notificationKey,
    title: "Backup Activity Reminder",
    message,
    category: "backup",
    severity,
    time: timeStr,
    createdAt: new Date().toISOString(),
    read: false,
    archived: false,
    route: "/backup-activities",
    backupJobId: job.id,
    backupJobName: job.name,
    department: job.department,
    assignedUser: job.user,
    dueDate: job.nextDueDate || job.dueDate,
    notificationType: "Backup Activity",
    priority: job.priority || "Medium",
    backupType: job.backupType,
  };
}

export function generateBackupReminderIfDue(job: BackupJob): boolean {
  if (!job.reminder) return false;
  const reminderDate = job.reminderDate || calculateReminderDate(job.nextDueDate || job.dueDate, job.reminder);
  if (!reminderDate) return false;

  if (reminderDate > getLocalTodayDateKey()) return false;

  const notificationKey = `backup-reminder-${job.id}-${reminderDate}`;
  if (hasNotificationForBackup(job.id, notificationKey)) return false;
  if (job.status === "Completed") return false;

  const notification = generateBackupReminderNotification(job);
  addNotification({ ...notification, id: notificationKey, notificationKey });
  return true;
}

export function checkAndGenerateDueBackupReminders(jobs: BackupJob[]): number {
  let count = 0;
  for (const job of jobs) {
    if (generateBackupReminderIfDue(job)) {
      count += 1;
    }
  }
  return count;
}

export function clearRemindersForBackup(backupJobId: string): void {
  removeBackupNotifications(backupJobId);
}

export function buildRecurringBackupJob(
  source: BackupJob,
  completedAt: string,
  nextDueDate: string,
  nextReminderDate: string | undefined,
  id: string
): BackupJob {
  const nextBackup = `${nextDueDate} ${source.backupTime || "02:00"}`;
  const completedDate = completedAt.split(" ")[0] || nextDueDate;

  return {
    ...source,
    id,
    status: "Upcoming",
    lastDueDate: completedDate,
    lastBackupDate: completedDate,
    lastBackup: completedAt,
    dueDate: nextDueDate,
    nextDueDate,
    nextBackup,
    scheduledNextBackup: nextDueDate,
    reminderDate: nextReminderDate,
    nextReminderDate,
    progress: 0,
    history: [],
    recurrenceId: source.recurrenceId || `recur-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    parentId: source.id,
  };
}
