// ─────────────────────────────────────────────────────────────────────────────
// useNotifications
//
// Owns all Notifications module state: list, search, active filter, loading,
// and all mutating actions (mark read, mark all read, archive, delete).
// Talks only to notificationService — never fabricates data itself.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Notification, NotificationFilterId } from "../types/notification";
import { notificationService } from "../services/notificationService";
import { DEFAULT_FILTER } from "../constants/notificationConstants";
import { buildSidebarFilters, getDisplayedNotifications, getUnreadCount, getActiveTotalCount } from "../utils/notificationHelpers";

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeFilter, setActiveFilter] = useState<NotificationFilterId>(DEFAULT_FILTER);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markRead = useCallback(async (id: string) => {
    setNotifications((ns) => ns.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await notificationService.markAsRead(id);
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read.");
    await notificationService.markAllAsRead();
  }, []);

  const deleteNotif = useCallback(async (id: string) => {
    setNotifications((ns) => ns.filter((n) => n.id !== id));
    toast.error("Notification deleted.");
    await notificationService.deleteNotification(id);
  }, []);

  const archiveNotif = useCallback(async (id: string) => {
    setNotifications((ns) => ns.map((n) => (n.id === id ? { ...n, archived: true } : n)));
    toast.success("Archived.");
    await notificationService.archiveNotification(id);
  }, []);

  const filters = buildSidebarFilters(notifications);
  const displayed = getDisplayedNotifications(notifications, activeFilter, search);
  const unreadCount = getUnreadCount(notifications);
  const totalCount = getActiveTotalCount(notifications);

  return {
    notifications,
    displayed,
    filters,
    activeFilter,
    setActiveFilter,
    search,
    setSearch,
    unreadCount,
    totalCount,
    loading,
    markRead,
    markAllRead,
    deleteNotif,
    archiveNotif,
    refresh: loadNotifications,
  };
}
