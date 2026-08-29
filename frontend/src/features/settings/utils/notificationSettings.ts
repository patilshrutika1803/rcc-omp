export const NOTIFICATION_SETTINGS_STORAGE_KEY = "rccomp.settings.notifications";
export const NOTIFICATION_SETTINGS_EVENT = "rccomp:notification-settings-change";

export type NotificationSettings = {
  inAppPushNotifications: boolean;
  smsAlerts: boolean;
  maintenanceAlerts: boolean;
  backupAlerts: boolean;
  qaAlerts: boolean;
};

export const NOTIFICATION_SETTINGS_DEFAULTS: NotificationSettings = {
  inAppPushNotifications: true,
  smsAlerts: false,
  maintenanceAlerts: true,
  backupAlerts: true,
  qaAlerts: true,
};

function readStoredNotificationSettings(): Partial<NotificationSettings> | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(NOTIFICATION_SETTINGS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<NotificationSettings>;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function emitNotificationSettingsChanged(settings: NotificationSettings) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(NOTIFICATION_SETTINGS_EVENT, {
      detail: settings,
    })
  );
}

export function loadNotificationSettings(): NotificationSettings {
  const defaults = NOTIFICATION_SETTINGS_DEFAULTS;
  const stored = readStoredNotificationSettings();

  if (!stored) {
    return defaults;
  }

  return {
    inAppPushNotifications: Boolean(stored.inAppPushNotifications ?? defaults.inAppPushNotifications),
    smsAlerts: Boolean(stored.smsAlerts ?? defaults.smsAlerts),
    maintenanceAlerts: Boolean(stored.maintenanceAlerts ?? defaults.maintenanceAlerts),
    backupAlerts: Boolean(stored.backupAlerts ?? defaults.backupAlerts),
    qaAlerts: Boolean(stored.qaAlerts ?? defaults.qaAlerts),
  };
}

export function saveNotificationSettings(settings: NotificationSettings): NotificationSettings | null {
  const defaults = NOTIFICATION_SETTINGS_DEFAULTS;
  const next: NotificationSettings = {
    inAppPushNotifications: Boolean(settings.inAppPushNotifications ?? defaults.inAppPushNotifications),
    smsAlerts: Boolean(settings.smsAlerts ?? defaults.smsAlerts),
    maintenanceAlerts: Boolean(settings.maintenanceAlerts ?? defaults.maintenanceAlerts),
    backupAlerts: Boolean(settings.backupAlerts ?? defaults.backupAlerts),
    qaAlerts: Boolean(settings.qaAlerts ?? defaults.qaAlerts),
  };

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(NOTIFICATION_SETTINGS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      return null;
    }
  }

  emitNotificationSettingsChanged(next);
  return next;
}

export function areInAppPushNotificationsEnabled(): boolean {
  return loadNotificationSettings().inAppPushNotifications;
}

export function areSmsAlertsEnabled(): boolean {
  return loadNotificationSettings().smsAlerts;
}

export function areMaintenanceAlertsEnabled(): boolean {
  return loadNotificationSettings().maintenanceAlerts;
}

export function areBackupAlertsEnabled(): boolean {
  return loadNotificationSettings().backupAlerts;
}

export function areQAAlertsEnabled(): boolean {
  return loadNotificationSettings().qaAlerts;
}

export function shouldSurfaceInAppNotification(_severity: "critical" | "warning" | "info" | "success" | string): boolean {
  const settings = loadNotificationSettings();

  if (!settings.inAppPushNotifications) {
    return false;
  }

  return true;
}
