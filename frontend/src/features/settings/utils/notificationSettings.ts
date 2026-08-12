export const NOTIFICATION_SETTINGS_STORAGE_KEY = "rccomp.settings.notifications";
export const NOTIFICATION_SETTINGS_EVENT = "rccomp:notification-settings-change";

export type NotificationSettings = {
  emailNotifications: boolean;
  inAppPushNotifications: boolean;
  smsAlerts: boolean;
  maintenanceAlerts: boolean;
  backupAlerts: boolean;
  qaAlerts: boolean;
  criticalOnlyMode: boolean;
};

export const NOTIFICATION_SETTINGS_DEFAULTS: NotificationSettings = {
  emailNotifications: true,
  inAppPushNotifications: true,
  smsAlerts: false,
  maintenanceAlerts: true,
  backupAlerts: true,
  qaAlerts: true,
  criticalOnlyMode: false,
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
    emailNotifications: Boolean(stored.emailNotifications ?? defaults.emailNotifications),
    inAppPushNotifications: Boolean(stored.inAppPushNotifications ?? defaults.inAppPushNotifications),
    smsAlerts: Boolean(stored.smsAlerts ?? defaults.smsAlerts),
    maintenanceAlerts: Boolean(stored.maintenanceAlerts ?? defaults.maintenanceAlerts),
    backupAlerts: Boolean(stored.backupAlerts ?? defaults.backupAlerts),
    qaAlerts: Boolean(stored.qaAlerts ?? defaults.qaAlerts),
    criticalOnlyMode: Boolean(stored.criticalOnlyMode ?? defaults.criticalOnlyMode),
  };
}

export function saveNotificationSettings(settings: NotificationSettings): NotificationSettings | null {
  const defaults = NOTIFICATION_SETTINGS_DEFAULTS;
  const next: NotificationSettings = {
    emailNotifications: Boolean(settings.emailNotifications ?? defaults.emailNotifications),
    inAppPushNotifications: Boolean(settings.inAppPushNotifications ?? defaults.inAppPushNotifications),
    smsAlerts: Boolean(settings.smsAlerts ?? defaults.smsAlerts),
    maintenanceAlerts: Boolean(settings.maintenanceAlerts ?? defaults.maintenanceAlerts),
    backupAlerts: Boolean(settings.backupAlerts ?? defaults.backupAlerts),
    qaAlerts: Boolean(settings.qaAlerts ?? defaults.qaAlerts),
    criticalOnlyMode: Boolean(settings.criticalOnlyMode ?? defaults.criticalOnlyMode),
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

export function isEmailNotificationsEnabled(): boolean {
  return loadNotificationSettings().emailNotifications;
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

export function isCriticalOnlyModeEnabled(): boolean {
  return loadNotificationSettings().criticalOnlyMode;
}

export function shouldSurfaceInAppNotification(severity: "critical" | "warning" | "info" | "success" | string): boolean {
  const settings = loadNotificationSettings();

  if (!settings.inAppPushNotifications) {
    return false;
  }

  if (settings.criticalOnlyMode) {
    return severity === "critical";
  }

  return true;
}
