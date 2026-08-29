// ─────────────────────────────────────────────────────────────────────────────
// useNotifications
//
// Owns all Notifications module state: list, search, active filter, loading,
// and all mutating actions (mark read, mark all read, archive, delete).
// Talks only to notificationService — never fabricates data itself.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import type { Notification, NotificationFilterId } from "../types/notification";
import { notificationService } from "../services/notificationService";
import { DEFAULT_FILTER } from "../constants/notificationConstants";
import { buildSidebarFilters, getDisplayedNotifications, getUnreadCount, getActiveTotalCount } from "../utils/notificationHelpers";

export function useNotifications() {
  const navigate = useNavigate();
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
    setNotifications((ns) => ns.map((n) =>
      n.id === id
        ? { ...n, deleted: true, deletedAt: new Date().toISOString(), archived: false }
        : n
    ));
    toast.success("Moved to Trash.");
    await notificationService.deleteNotification(id);
  }, []);

  const archiveNotif = useCallback(async (id: string) => {
    setNotifications((ns) => ns.map((n) => (n.id === id ? { ...n, archived: true } : n)));
    toast.success("Archived.");
    await notificationService.archiveNotification(id);
  }, []);

  const handleNotificationClick = useCallback(async (id: string, route?: string) => {
    if (!route) return;
    await markRead(id);
    navigate(route);
  }, [navigate, markRead]);

  /**
   * Handle clicking on a PM reminder notification.
   * Navigates to Preventive Maintenance page and auto-opens the PM drawer.
   */
  const handlePMNotificationClick = useCallback(async (id: string, pmId?: string) => {
    if (!pmId) return;
    await markRead(id);
    try {
      window.sessionStorage.setItem("rcc_omp_pm_selected_id", pmId);
    } catch {
      // ignore
    }
    navigate("/preventive-maintenance");
  }, [navigate, markRead]);

  const handleBackupNotificationClick = useCallback(async (id: string, backupJobId?: string) => {
    if (!backupJobId) return;
    await markRead(id);
    try {
      window.sessionStorage.setItem("rcc_omp_backup_selected_id", backupJobId);
    } catch {
      // ignore
    }
    window.location.assign("/backup-activities");
  }, [markRead]);

  const handleQANotificationClick = useCallback(async (id: string, qaActivityId?: string) => {
    if (!qaActivityId) return;
    await markRead(id);
    try {
      window.sessionStorage.setItem("rcc_omp_qa_selected_id", qaActivityId);
    } catch {
      // ignore
    }
    window.location.assign("/qa-activities");
  }, [markRead]);

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
    handlePMNotificationClick,
    handleBackupNotificationClick,
    handleQANotificationClick,
    handleNotificationClick,
  };
}
