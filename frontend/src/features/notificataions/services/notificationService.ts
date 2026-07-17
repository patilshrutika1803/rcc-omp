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

export const notificationService = {
  /**
   * Fetch all notifications for the current user/tenant.
   * TODO: replace with Supabase query (e.g. supabase.from('notifications').select('*'))
   */
  async getNotifications(): Promise<Notification[]> {
    return [];
  },

  /**
   * Mark a single notification as read.
   * TODO: replace with Supabase update call.
   */
  async markAsRead(_id: string): Promise<void> {
    return;
  },

  /**
   * Mark all notifications as read.
   * TODO: replace with Supabase bulk update / RPC call.
   */
  async markAllAsRead(): Promise<void> {
    return;
  },

  /**
   * Archive a notification.
   * TODO: replace with Supabase update call.
   */
  async archiveNotification(_id: string): Promise<void> {
    return;
  },

  /**
   * Delete a notification.
   * TODO: replace with Supabase delete call.
   */
  async deleteNotification(_id: string): Promise<void> {
    return;
  },

  /**
   * Create a new notification.
   * TODO: this will typically be invoked server-side (AWS backend / Supabase
   * function) in response to events from other modules, not directly from
   * the client. Kept here to complete the service contract.
   */
  async createNotification(_notification: Omit<Notification, "id">): Promise<Notification | null> {
    return null;
  },

  /**
   * Clear all notifications.
   * TODO: replace with Supabase bulk delete call.
   */
  async clearNotifications(): Promise<void> {
    return;
  },
};
