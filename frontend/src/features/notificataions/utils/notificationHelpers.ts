// ─────────────────────────────────────────────────────────────────────────────
// Reusable helper functions for the Notifications module
// ─────────────────────────────────────────────────────────────────────────────

import type {
  Notification,
  NotificationFilter,
  NotificationFilterId,
} from "../types/notification";
import { SIDEBAR_FILTER_DEFS, NOTIFICATION_CATEGORIES } from "../constants/notificationConstants";

// ── Severity / badge styling helpers ────────────────────────────────────────

export function getSeverityIconStyles(severity: Notification["severity"]) {
  if (severity === "critical") {
    return { wrapper: "bg-red-50 border border-red-200", icon: "text-red-600" };
  }
  if (severity === "warning") {
    return { wrapper: "bg-amber-50 border border-amber-200", icon: "text-amber-600" };
  }
  if (severity === "success") {
    return { wrapper: "bg-emerald-50 border border-emerald-200", icon: "text-emerald-600" };
  }
  return { wrapper: "bg-blue-50 border border-blue-200", icon: "text-blue-600" };
}

export function getSeverityBorderColor(severity: Notification["severity"]) {
  if (severity === "critical") return "border-l-red-500";
  if (severity === "warning") return "border-l-amber-500";
  if (severity === "success") return "border-l-emerald-500";
  return "border-l-blue-500";
}

export function getSeverityBadgeClasses(severity: Notification["severity"]) {
  if (severity === "critical") return "bg-red-50 text-red-600";
  if (severity === "warning") return "bg-amber-50 text-amber-600";
  if (severity === "success") return "bg-emerald-50 text-emerald-600";
  return "bg-blue-50 text-blue-600";
}

// ── Counting helpers ─────────────────────────────────────────────────────

export function getUnreadCount(notifications: Notification[]): number {
  return notifications.filter((n) => !n.read && !n.archived).length;
}

export function getActiveTotalCount(notifications: Notification[]): number {
  return notifications.filter((n) => !n.archived).length;
}

function countForFilter(notifications: Notification[], filterId: NotificationFilterId): number {
  if (filterId === "archived") return notifications.filter((n) => n.archived).length;
  if (filterId === "all") return notifications.filter((n) => !n.archived).length;
  if (filterId === "unread") return notifications.filter((n) => !n.read && !n.archived).length;
  if (filterId === "critical") {
    return notifications.filter((n) => n.severity === "critical" && !n.archived).length;
  }
  if (filterId === "warning") {
    return notifications.filter((n) => n.severity === "warning" && !n.archived).length;
  }
  if ((NOTIFICATION_CATEGORIES as string[]).includes(filterId)) {
    return notifications.filter((n) => n.category === filterId && !n.archived).length;
  }
  return 0;
}

// ── Filter list builder ─────────────────────────────────────────────────────

export function buildSidebarFilters(notifications: Notification[]): NotificationFilter[] {
  return SIDEBAR_FILTER_DEFS.map((def) => ({
    id: def.id,
    label: def.label,
    count: countForFilter(notifications, def.id),
  }));
}

// ── Filtering / search helpers ───────────────────────────────────────────────

export function filterNotifications(
  notifications: Notification[],
  activeFilter: NotificationFilterId
): Notification[] {
  return notifications.filter((n) => {
    if (activeFilter === "archived") return n.archived;
    if (n.archived) return false;
    if (activeFilter === "unread") return !n.read;
    if (activeFilter === "critical") return n.severity === "critical";
    if (activeFilter === "warning") return n.severity === "warning";
    if ((NOTIFICATION_CATEGORIES as string[]).includes(activeFilter)) {
      return n.category === activeFilter;
    }
    return true;
  });
}

export function searchNotifications(notifications: Notification[], search: string): Notification[] {
  if (!search) return notifications;
  const query = search.toLowerCase();
  return notifications.filter(
    (n) => n.title.toLowerCase().includes(query) || n.message.toLowerCase().includes(query)
  );
}

export function getDisplayedNotifications(
  notifications: Notification[],
  activeFilter: NotificationFilterId,
  search: string
): Notification[] {
  const filtered = filterNotifications(notifications, activeFilter);
  return searchNotifications(filtered, search);
}
