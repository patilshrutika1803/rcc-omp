// ─────────────────────────────────────────────────────────────────────────────
// System Inventory — Inspection Reminder Utilities
// Reuses the same notification lifecycle as Preventive Maintenance.
// ─────────────────────────────────────────────────────────────────────────────

import type { Notification } from "../../notificataions/types/notification";
import type { SystemInspectionRecord } from "../types/inspection";
import { addNotification, hasNotificationForSystemInspection, removeSystemInspectionNotifications } from "../../notificataions/utils/notificationStorage";
import { calculateReminderDate as calculateSharedReminderDate } from "../../shared/utils/recurringWorkflow";

export function calculateInspectionReminderDate(
  dueDate: string,
  reminderOption: string | undefined
): string | undefined {
  if (!reminderOption || !dueDate) return undefined;
  return calculateSharedReminderDate(dueDate, reminderOption);
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

function formatDateToDisplay(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function generateInspectionReminderNotification(inspection: SystemInspectionRecord): Notification {
  const now = new Date();
  const timeStr = now.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const severity = getSeverityFromPriority(inspection.priority);
  const title = "System Inspection Reminder";
  const message = `System:\n${inspection.systemName}\n\nIs due on\n${formatDateToDisplay(inspection.nextDueDate)}.\n\nDepartment:\n${inspection.department}\n\nPriority:\n${inspection.priority}\n\nAssigned User:\n${inspection.assignedUser}\n\nType:\nSystem Inspection`;

  return {
    id: `inspection-reminder-${inspection.id}-${Date.now()}`,
    notificationKey: `inspection-reminder-${inspection.id}-${inspection.reminderDate || inspection.nextDueDate}`,
    title,
    message,
    category: "inspection",
    severity,
    time: timeStr,
    createdAt: new Date().toISOString(),
    read: false,
    archived: false,
    route: "/inspection-schedule",
    systemInspectionId: inspection.id,
    systemId: inspection.systemId,
    systemName: inspection.systemName,
    department: inspection.department,
    assignedUser: inspection.assignedUser,
    dueDate: inspection.nextDueDate,
    notificationType: "System Inspection",
  };
}

export function generateReminderIfDue(inspection: SystemInspectionRecord): boolean {
  if (!inspection.reminder) return false;
  if (inspection.status === "Completed") return false;

  const reminderDate = inspection.reminderDate || calculateInspectionReminderDate(inspection.nextDueDate, inspection.reminder);
  if (!reminderDate) return false;

  const today = new Date().toISOString().split("T")[0];
  if (reminderDate > today) return false;

  if (hasNotificationForSystemInspection(inspection.id)) return false;

  const notification = generateInspectionReminderNotification(inspection);
  addNotification(notification);
  return true;
}

export function checkAndGenerateDueInspectionReminders(inspections: SystemInspectionRecord[]): number {
  let count = 0;
  for (const inspection of inspections) {
    if (generateReminderIfDue(inspection)) {
      count++;
    }
  }
  return count;
}

export function clearRemindersForInspection(inspectionId: string): void {
  removeSystemInspectionNotifications(inspectionId);
}

export function buildRecurringInspection(
  source: SystemInspectionRecord,
  completedAt: string,
  nextDueDate: string,
  nextReminderDate: string | undefined,
  id: string
): SystemInspectionRecord {
  return {
    ...source,
    id,
    status: "Upcoming",
    originalDueDate: completedAt,
    nextDueDate,
    scheduledNextDue: nextDueDate,
    reminderDate: nextReminderDate,
    history: [],
    recurrenceId: source.recurrenceId || `recur-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    parentId: source.id,
  } as SystemInspectionRecord;
}
