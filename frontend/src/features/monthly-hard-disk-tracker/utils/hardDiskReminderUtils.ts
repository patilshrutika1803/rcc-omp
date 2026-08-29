import type { HardDiskCycle, HardDiskReminderEntry } from "../types/hardDisk";
import type { Notification } from "../../notificataions/types/notification";
import { addNotification, loadNotifications } from "../../notificataions/utils/notificationStorage";
import { calculateReminderDate as calculateSharedReminderDate } from "../../shared/utils/recurringWorkflow";

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function parseLocalDateOnly(value: string): Date | null {
  if (!value) return null;

  const [yearText, monthText, dayText] = value.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  if ([year, month, day].some((part) => Number.isNaN(part))) return null;
  return new Date(year, month - 1, day);
}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateDisplay(value: string): string {
  const date = parseLocalDateOnly(value);
  if (!date) return value;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getReminderOffset(option: string): number | undefined {
  switch (option) {
    case "5 Days Before":
      return 5;
    case "7 Days Before":
      return 7;
    case "10 Days Before":
      return 10;
    case "15 Days Before":
      return 15;
    case "30 Days Before":
      return 30;
    default:
      return undefined;
  }
}

export function calculateHardDiskReminderDate(dueDate: string, reminderOption: string | undefined): string | undefined {
  if (!reminderOption || !dueDate) return undefined;

  const offset = getReminderOffset(reminderOption);
  if (offset !== undefined) {
    const parsed = parseLocalDateOnly(dueDate);
    if (!parsed) return undefined;
    parsed.setDate(parsed.getDate() - offset);
    return formatLocalDate(parsed);
  }

  return calculateSharedReminderDate(dueDate, reminderOption);
}

export function buildCycleReminders(cycle: HardDiskCycle): HardDiskReminderEntry[] {
  const reminders: HardDiskReminderEntry[] = [
    {
      id: makeId("reminder"),
      cycleId: cycle.id,
      type: "Prepare Hard Disk",
      dueDate: cycle.dispatchDate,
      status: "Pending",
    },
    {
      id: makeId("reminder"),
      cycleId: cycle.id,
      type: "Dispatch Hard Disk",
      dueDate: cycle.dispatchDate,
      status: "Pending",
    },
    {
      id: makeId("reminder"),
      cycleId: cycle.id,
      type: "Accountability Reminder",
      dueDate: calculateHardDiskReminderDate(cycle.expectedReturnDate, cycle.reminderBeforeReturn) || cycle.expectedReturnDate,
      status: "Pending",
    },
    {
      id: makeId("reminder"),
      cycleId: cycle.id,
      type: "Receive Hard Disk",
      dueDate: cycle.expectedReturnDate,
      status: "Pending",
    },
  ];

  return reminders;
}

function getNotificationSeverity(priority: string): Notification["severity"] {
  switch (priority) {
    case "Critical":
    case "High":
      return "critical";
    case "Medium":
      return "warning";
    default:
      return "info";
  }
}

export function hasHardDiskNotification(cycleId: string, notificationType: string): boolean {
  return loadNotifications().some((notification) => notification.hardDiskCycleId === cycleId && notification.hardDiskReminderType === notificationType && !notification.read);
}

export function addHardDiskNotification(cycle: HardDiskCycle, notificationType: string, title: string, message: string): void {
  if (hasHardDiskNotification(cycle.id, notificationType)) return;

  const now = new Date();
  const time = now.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const notification: Notification = {
    id: makeId("hdd-notification"),
    notificationKey: `hdd-${cycle.id}-${notificationType}`,
    title,
    message,
    category: "monthly-hard-disk",
    severity: getNotificationSeverity(cycle.priority),
    time,
    createdAt: new Date().toISOString(),
    read: false,
    archived: false,
    route: "/monthly-hard-disk-tracker",
    hardDiskCycleId: cycle.id,
    hardDiskReminderType: notificationType,
    department: cycle.responsiblePerson,
    assignedUser: cycle.responsiblePerson,
    dueDate: cycle.expectedReturnDate,
    notificationType: title,
    priority: cycle.priority,
  };

  addNotification(notification);
}

export function removeHardDiskNotifications(cycleId: string): void {
  const notifications = loadNotifications().filter((notification) => notification.hardDiskCycleId !== cycleId);
  if (typeof window !== "undefined") {
    window.localStorage.setItem("rcc_omp_notifications", JSON.stringify(notifications));
  }
}

export function generateInitialHardDiskNotifications(cycle: HardDiskCycle): void {
  addHardDiskNotification(
    cycle,
    "Cycle Created",
    "Monthly Hard Disk Cycle Created",
    `Cycle ${cycle.cycleId} for ${cycle.month} is ready. Dispatch date: ${formatDateDisplay(cycle.dispatchDate)}.`
  );

  addHardDiskNotification(
    cycle,
    "Dispatch Reminder",
    "Dispatch Reminder",
    `Prepare and dispatch the hard disk for ${cycle.month} before ${formatDateDisplay(cycle.dispatchDate)}.`
  );
}

export function generateLifecycleNotification(cycle: HardDiskCycle, status: string): void {
  const titleMap: Record<string, string> = {
    "Dispatched from RCC": "Hard Disk Dispatched",
    "Received at RSB": "Hard Disk Received at RSB",
    "Monthly Backup Completed": "Monthly Backup Completed",
    "Return Pending": "Accountability Reminder",
    "Returned from RSB": "Hard Disk Returned",
    "Received at RCC": "Hard Disk Received at RCC",
    "Cycle Completed": "Cycle Completed",
  };

  const messageMap: Record<string, string> = {
    "Dispatched from RCC": `The hard disk for ${cycle.month} has been dispatched to RSB.`,
    "Received at RSB": `The hard disk for ${cycle.month} has been received at RSB.`,
    "Monthly Backup Completed": `The monthly backup for ${cycle.month} is complete.`,
    "Return Pending": `The hard disk should be returned before ${formatDateDisplay(cycle.expectedReturnDate)}.`,
    "Returned from RSB": `The hard disk for ${cycle.month} has been returned from RSB.`,
    "Received at RCC": `The hard disk for ${cycle.month} has been received back at RCC.`,
    "Cycle Completed": `Cycle ${cycle.cycleId} for ${cycle.month} is now complete.`,
  };

  const title = titleMap[status] || "Hard Disk Tracker Update";
  const message = messageMap[status] || `Cycle ${cycle.cycleId} for ${cycle.month} moved to ${status}.`;
  addHardDiskNotification(cycle, status, title, message);
}

export function closePendingReminders(cycle: HardDiskCycle): HardDiskReminderEntry[] {
  return cycle.reminders.map((reminder) => ({ ...reminder, status: reminder.status === "Pending" ? "Completed" : reminder.status }));
}
