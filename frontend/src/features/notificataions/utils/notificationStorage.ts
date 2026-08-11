// ─────────────────────────────────────────────────────────────────────────────
// Notification Storage
//
// Shared localStorage layer for all notifications (including PM-generated
// reminders). This is the single source of truth for notification persistence.
//
// Future migration: Replace each function body with the corresponding
// Supabase/AWS API call. The function signatures stay the same so no
// consumer code needs to change.
// ─────────────────────────────────────────────────────────────────────────────

import type { Notification } from "../types/notification";

const STORAGE_KEY = "rcc_omp_notifications";

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function loadNotifications(): Notification[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const parsed = safeJsonParse<Notification[]>(raw);
  return Array.isArray(parsed) ? parsed : [];
}

export function saveNotifications(notifications: Notification[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
}

function emitNotificationChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("notifications:changed"));
}

export function addNotification(notification: Notification): void {
  if (notification.notificationKey) {
    const notifications = loadNotifications();
    if (notifications.some((n) => n.notificationKey === notification.notificationKey)) return;
    notifications.unshift(notification);
    saveNotifications(notifications);
    emitNotificationChange();
    return;
  }

  const notifications = loadNotifications();
  notifications.unshift(notification);
  saveNotifications(notifications);
  emitNotificationChange();
}

export function removeNotification(id: string): void {
  const notifications = loadNotifications().filter((n) => n.id !== id);
  saveNotifications(notifications);
  emitNotificationChange();
}

export function updateNotification(
  id: string,
  updates: Partial<Notification>
): void {
  const notifications = loadNotifications().map((n) =>
    n.id === id ? { ...n, ...updates } : n
  );
  saveNotifications(notifications);
  emitNotificationChange();
}

/**
 * Remove all pending (unread) PM reminder notifications for a given PM id.
 * Used when a PM is completed — clear its pending reminders.
 */
export function removePMNotifications(pmId: string): void {
  const notifications = loadNotifications().filter(
    (n) => n.pmId !== pmId
  );
  saveNotifications(notifications);
  emitNotificationChange();
}

export function removeBackupNotifications(backupJobId: string): void {
  const notifications = loadNotifications().filter(
    (n) => n.backupJobId !== backupJobId
  );
  saveNotifications(notifications);
  emitNotificationChange();
}

export function removeQANotifications(qaActivityId: string): void {
  const notifications = loadNotifications().filter(
    (n) => n.qaActivityId !== qaActivityId
  );
  saveNotifications(notifications);
  emitNotificationChange();
}

/**
 * Check if a notification already exists for a given PM id + reminder cycle.
 * Prevents duplicate reminder notifications.
 */
export function hasNotificationForPM(pmId: string): boolean {
  const notifications = loadNotifications();
  return notifications.some((n) => n.pmId === pmId && !n.read);
}

export function hasNotificationForBackup(backupJobId: string): boolean {
  const notifications = loadNotifications();
  return notifications.some((n) => n.backupJobId === backupJobId && !n.read);
}

export function hasNotificationForQA(qaActivityId: string): boolean {
  const notifications = loadNotifications();
  return notifications.some((n) => n.qaActivityId === qaActivityId && !n.read);
}

export function removeSystemInspectionNotifications(systemInspectionId: string): void {
  const notifications = loadNotifications().filter(
    (n) => !(n.systemInspectionId === systemInspectionId && !n.read)
  );
  saveNotifications(notifications);
  emitNotificationChange();
}

export function hasNotificationForSystemInspection(systemInspectionId: string): boolean {
  const notifications = loadNotifications();
  return notifications.some((n) => n.systemInspectionId === systemInspectionId);
}

export function removeInspectionNotifications(inspectionScheduleId: string): void {
  const notifications = loadNotifications().filter(
    (n) => !(n.inspectionScheduleId === inspectionScheduleId && !n.read)
  );
  saveNotifications(notifications);
  emitNotificationChange();
}

export function hasNotificationForInspection(inspectionScheduleId: string): boolean {
  const notifications = loadNotifications();
  return notifications.some(
    (n) => n.inspectionScheduleId === inspectionScheduleId && !n.read
  );
}

/**
 * Get the count of unread notifications.
 */
export function getUnreadCount(): number {
  return loadNotifications().filter((n) => !n.read && !n.archived).length;
}

/**
 * Mark all notifications as read.
 */
export function markAllAsRead(): void {
  const notifications = loadNotifications().map((n) => ({ ...n, read: true }));
  saveNotifications(notifications);
  emitNotificationChange();
}

