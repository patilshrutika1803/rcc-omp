// ─────────────────────────────────────────────────────────────────────────────
// Notification Service
//
// This is a PLACEHOLDER service layer. It currently returns empty data and
// does NOT talk to any backend. It exists to define the contract that the
// rest of the app (hooks/components) will depend on.
//
// Future wiring:
//   notificationService.ts
//     -> Supabase (Database + Auth)
//       -> AWS Backend (REST APIs)
//         -> Realtime Notifications (Supabase Realtime)
//
// Notifications will eventually be pushed here from every module:
//   Preventive Maintenance, QA, Backup Activities, Departments,
//   System Inventory, Reports, Settings, Authentication.
//
// This page/service must NEVER fabricate notification data itself — it only
// relays whatever the backend provides.
// ─────────────────────────────────────────────────────────────────────────────

import type { Notification } from "../types/notification";
import {
  loadNotifications,
  saveNotifications,
  addNotification as storageAddNotification,
  markAllAsRead as storageMarkAllAsRead,
  removeNotification,
  updateNotification,
} from "../utils/notificationStorage";

export const notificationService = {
  /**
   * Fetch all notifications for the current user/tenant.
   * TODO: replace with Supabase query (e.g. supabase.from('notifications').select('*'))
   */
  async getNotifications(): Promise<Notification[]> {
    return loadNotifications();
  },

  /**
   * Mark a single notification as read.
   * TODO: replace with Supabase update call.
   */
  async markAsRead(id: string): Promise<void> {
    updateNotification(id, { read: true });
    return;
  },

  /**
   * Mark all notifications as read.
   * TODO: replace with Supabase bulk update / RPC call.
   */
  async markAllAsRead(): Promise<void> {
    storageMarkAllAsRead();
    return;
  },

  /**
   * Archive a notification.
   * TODO: replace with Supabase update call.
   */
  async archiveNotification(id: string): Promise<void> {
    updateNotification(id, { archived: true });
    return;
  },

  /**
   * Delete a notification.
   * TODO: replace with Supabase delete call.
   */
  async deleteNotification(id: string): Promise<void> {
    removeNotification(id);
    return;
  },

  /**
   * Create a new notification.
   * TODO: this will typically be invoked server-side (AWS backend / Supabase
   * function) in response to events from other modules, not directly from
   * the client. Kept here to complete the service contract.
   */
  async createNotification(_notification: Omit<Notification, "id">): Promise<Notification | null> {
    const newNotification: Notification = {
      ..._notification,
      id: `notif-${Date.now()}`,
      time: _notification.time || new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    storageAddNotification(newNotification);
    return newNotification;
  },

  /**
   * Clear all notifications.
   * TODO: replace with Supabase bulk delete call.
   */
  async clearNotifications(): Promise<void> {
    saveNotifications([]);
    return;
  },
};
