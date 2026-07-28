import type { BackupJob } from "../types/backup";
import type { Notification } from "../../notificataions/types/notification";
import {
  addNotification,
  hasNotificationForBackup,
  removeBackupNotifications,
} from "../../notificataions/utils/notificationStorage";
import { calculateNextDueDate, calculateReminderDate as calculateSharedReminderDate } from "../../shared/utils/recurringWorkflow";

const REMINDER_DAYS_MAP: Record<string, number> = {
  "Same Day": 0,
  "1 Day Before": 1,
  "3 Days Before": 3,
  "7 Days Before": 7,
  "15 Days Before": 15,
  "30 Days Before": 30,
};

function parseBackupDateValue(value: string): Date | null {
  if (!value) return null;
  const trimmed = value.trim();
  const [datePart, timePart] = trimmed.split(/\s+/);
  const candidate = timePart ? `${datePart}T${timePart}` : `${datePart}T00:00`;
  const parsed = new Date(candidate);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDateOnly(date: Date): string {
  return date.toISOString().split("T")[0];
}

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
  nextBackup: string,
  reminderOption: string | undefined
): string | undefined {
  if (!reminderOption || !nextBackup) return undefined;
  const days = REMINDER_DAYS_MAP[reminderOption];
  if (days === undefined) return undefined;

  return calculateSharedReminderDate(nextBackup, reminderOption);
}

export function calculateNextBackupDate(
  currentNextBackup: string,
  frequency: string,
  backupTime?: string
): string {
  const parsed = parseBackupDateValue(currentNextBackup);
  if (!parsed) {
    const fallback = new Date();
    if (backupTime) {
      const [hours, minutes] = backupTime.split(":").map((v) => Number(v));
      if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
        fallback.setHours(hours, minutes, 0, 0);
      }
    }
    return `${fallback.toISOString().split("T")[0]} ${backupTime ?? "02:00"}`;
  }

  const candidateDate = calculateNextDueDate(currentNextBackup.split(" ")[0], frequency);
  if (!candidateDate) {
    parsed.setDate(parsed.getDate() + 1);
    const fallbackDate = parsed.toISOString().split("T")[0];
    const timePart = backupTime ?? currentNextBackup.split(" ")[1] ?? "02:00";
    return `${fallbackDate} ${timePart}`;
  }

  const timePart = backupTime ?? currentNextBackup.split(" ")[1] ?? "02:00";
  return `${candidateDate} ${timePart}`;
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
  const message = `Backup Activity:\n${job.name}\n\nDue Date:\n${formatDateDisplay(job.nextBackup.split(" ")[0] || job.nextBackup)}\n\nDepartment:\n${job.department}\n\nPriority:\n${job.priority || "Medium"}\n\nBackup Type:\n${job.backupType}\n\nNotification Type:\nBackup Activity`;

  return {
    id: `backup-reminder-${job.id}-${Date.now()}`,
    title: "Backup Activity Reminder",
    message,
    category: "backup",
    severity,
    time: timeStr,
    read: false,
    archived: false,
    backupJobId: job.id,
    backupJobName: job.name,
    department: job.department,
    assignedUser: job.user,
    dueDate: job.nextBackup.split(" ")[0],
    notificationType: "Backup Activity",
    priority: job.priority || "Medium",
    backupType: job.backupType,
  };
}

export function generateBackupReminderIfDue(job: BackupJob): boolean {
  if (!job.reminder) return false;
  const reminderDate = job.reminderDate || calculateReminderDate(job.nextBackup, job.reminder);
  if (!reminderDate) return false;

  const today = new Date().toISOString().split("T")[0];
  if (reminderDate > today) return false;
  if (hasNotificationForBackup(job.id)) return false;
  if (job.status === "Completed") return false;

  const notification = generateBackupReminderNotification(job);
  addNotification(notification);
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
  nextBackup: string,
  reminderDate: string | undefined,
  id: string
): BackupJob {
  return {
    ...source,
    id,
    status: "Upcoming",
    progress: 0,
    lastBackup: completedAt,
    nextBackup,
    reminderDate,
    lastVerified: source.lastVerified || "Pending",
    history: [],
    recurringParentId: source.id,
  };
}
