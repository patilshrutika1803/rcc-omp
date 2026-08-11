// ─────────────────────────────────────────────────────────────────────────────
// PM Reminder Utilities
//
// Core reminder logic for the Preventive Maintenance module.
// Calculates reminder dates, generates notification objects, and manages
// the lifecycle of reminder notifications.
//
// Designed for easy migration to backend:
// - Notification generation → Supabase Function / AWS Lambda
// - Duplicate check → database query
// ─────────────────────────────────────────────────────────────────────────────

import type { PMRecord } from "../types/pm";
import type { Notification } from "../../notificataions/types/notification";
import { REMINDER_DAYS_MAP } from "../constants/pmConstants";
import {
  addNotification,
  hasNotificationForPM,
  removePMNotifications,
} from "../../notificataions/utils/notificationStorage";
import { calculateReminderDate as calculateSharedReminderDate } from "../../shared/utils/recurringWorkflow";

/**
 * Calculate the reminder date for a PM record.
 * Reminder Date = Due Date - Reminder Days
 * Returns the date as YYYY-MM-DD string, or null if no reminder is set.
 */
export function calculateReminderDate(
  dueDate: string,
  reminderOption: string | undefined
): string | undefined {
  if (!reminderOption || !dueDate) return undefined;
  const days = REMINDER_DAYS_MAP[reminderOption];
  if (days === undefined) return undefined;

  return calculateSharedReminderDate(dueDate, reminderOption);
}

/**
 * Map PM priority to notification severity.
 */
export function getSeverityFromPriority(
  priority: string
): Notification["severity"] {
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

/**
 * Generate a severity label for the notification message based on priority.
 */
export function getPrioritySeverityLabel(priority: string): string {
  switch (priority) {
    case "Critical":
      return "High Priority PM";
    case "High":
      return "High Priority PM";
    case "Medium":
      return "Medium Priority PM";
    case "Low":
      return "Low Priority PM";
    default:
      return "Medium Priority PM";
  }
}

/**
 * Format a date string to a readable format like "22 Jul 2026".
 */
function formatDateToDisplay(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Create a notification object for a PM reminder.
 */
export function generateReminderNotification(pm: PMRecord): Notification {
  const now = new Date();
  const timeStr = now.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const severity = getSeverityFromPriority(pm.priority);
  const severityLabel = getPrioritySeverityLabel(pm.priority);

  const message = `Machine:\n${pm.machine}\n\nis due on\n${formatDateToDisplay(pm.nextDue)}.\n\nDepartment:\n${pm.department}\n\nPriority:\n${pm.priority}\n\nAssigned User:\n${pm.user || pm.assignedUser}\n\nType:\nPreventive Maintenance\n\nSeverity:\n${severityLabel}`;

  return {
    id: `pm-reminder-${pm.id}-${Date.now()}`,
    notificationKey: `pm-reminder-${pm.id}-${pm.reminderDate || pm.nextDue}`,
    title: "Preventive Maintenance Reminder",
    message,
    category: "maintenance",
    severity,
    time: timeStr,
    createdAt: new Date().toISOString(),
    read: false,
    archived: false,
    route: "/preventive-maintenance",
    pmId: pm.id,
    machineId: pm.machineId,
    machineName: pm.machine,
    department: pm.department,
    assignedUser: pm.user || pm.assignedUser,
    dueDate: pm.nextDue,
    notificationType: "Preventive Maintenance",
  };
}

/**
 * Generate a reminder notification for a PM record if:
 * 1. The PM has a reminder set
 * 2. The reminder date is today or already passed
 * 3. No duplicate reminder notification already exists
 *
 * Returns true if a notification was generated.
 */
export function generateReminderIfDue(pm: PMRecord): boolean {
  // Must have a reminder option
  if (!pm.reminder) return false;

  // Calculate reminder date
  const reminderDate = pm.reminderDate || calculateReminderDate(pm.nextDue, pm.reminder);
  if (!reminderDate) return false;

  // Check if reminder date is today or in the past
  const today = new Date().toISOString().split("T")[0];
  if (reminderDate > today) return false;

  // Check for duplicate (only one notification per reminder cycle)
  if (hasNotificationForPM(pm.id)) return false;

  // Don't generate reminders for completed PMs
  if (pm.status === "Completed") return false;

  // Generate and store the notification
  const notification = generateReminderNotification(pm);
  addNotification(notification);
  return true;
}

/**
 * Check all PM records and generate due reminders.
 * Called on app load and after PM operations.
 */
export function checkAndGenerateDueReminders(
  pmRecords: PMRecord[]
): number {
  let count = 0;
  for (const pm of pmRecords) {
    if (generateReminderIfDue(pm)) {
      count++;
    }
  }
  return count;
}

/**
 * Remove all pending reminder notifications for a given PM.
 * Called when a PM is completed.
 */
export function clearRemindersForPM(pmId: string): void {
  removePMNotifications(pmId);
}

