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
const DELETE_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function isExpiredDeletedNotification(notification: Notification): boolean {
  if (!notification.deleted || !notification.deletedAt) {
    return false;
  }

  const deletedAt = new Date(notification.deletedAt).getTime();
  if (Number.isNaN(deletedAt)) {
    return false;
  }

  return Date.now() - deletedAt > DELETE_RETENTION_MS;
}

export function loadNotifications(): Notification[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const parsed = safeJsonParse<Notification[]>(raw);
  if (!Array.isArray(parsed)) return [];

  const active = parsed.filter((notification) => !isExpiredDeletedNotification(notification));
  if (active.length !== parsed.length) {
    saveNotifications(active);
  }

  return active;
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
  const duplicateKey = notification.notificationKey ?? notification.id;
  const notifications = loadNotifications();

  if (duplicateKey) {
    const hasDuplicate = notifications.some(
      (n) =>
        (n.notificationKey && n.notificationKey === duplicateKey) ||
        n.id === duplicateKey
    );
    if (hasDuplicate) return;
  }

  notifications.unshift(notification);
  saveNotifications(notifications);
  emitNotificationChange();
}

export function removeNotification(id: string): void {
  const notifications = loadNotifications().map((n) =>
    n.id === id
      ? {
          ...n,
          deleted: true,
          deletedAt: n.deletedAt || new Date().toISOString(),
          archived: false,
        }
      : n
  );
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
export function hasNotificationForPM(pmId: string, notificationKey?: string): boolean {
  const notifications = loadNotifications();
  return notifications.some((n) => n.pmId === pmId && (!notificationKey || n.notificationKey === notificationKey) && !n.read);
}

export function hasNotificationForBackup(backupJobId: string, notificationKey?: string): boolean {
  const notifications = loadNotifications();
  return notifications.some((n) => n.backupJobId === backupJobId && (!notificationKey || n.notificationKey === notificationKey) && !n.read);
}

export function hasNotificationForQA(qaActivityId: string, notificationKey?: string): boolean {
  const notifications = loadNotifications();
  return notifications.some((n) => n.qaActivityId === qaActivityId && (!notificationKey || n.notificationKey === notificationKey) && !n.read);
}

export function removeSystemInspectionNotifications(systemInspectionId: string): void {
  const notifications = loadNotifications().filter(
    (n) => !(n.systemInspectionId === systemInspectionId && !n.read)
  );
  saveNotifications(notifications);
  emitNotificationChange();
}

export function hasNotificationForSystemInspection(systemInspectionId: string, notificationKey?: string): boolean {
  const notifications = loadNotifications();
  return notifications.some((n) => n.systemInspectionId === systemInspectionId && (!notificationKey || n.notificationKey === notificationKey));
}

export function removeInspectionNotifications(inspectionScheduleId: string): void {
  const notifications = loadNotifications().filter(
    (n) => !(n.inspectionScheduleId === inspectionScheduleId && !n.read)
  );
  saveNotifications(notifications);
  emitNotificationChange();
}

export function hasNotificationForInspection(inspectionScheduleId: string, notificationKey?: string): boolean {
  const notifications = loadNotifications();
  return notifications.some(
    (n) => n.inspectionScheduleId === inspectionScheduleId && (!notificationKey || n.notificationKey === notificationKey) && !n.read
  );
}

/**
 * Get the count of unread notifications.
 */
export function getUnreadCount(): number {
  return loadNotifications().filter((n) => !n.read && !n.archived && !n.deleted).length;
}

/**
 * Mark all notifications as read.
 */
export function markAllAsRead(): void {
  const notifications = loadNotifications().map((n) => ({ ...n, read: true }));
  saveNotifications(notifications);
  emitNotificationChange();
}

