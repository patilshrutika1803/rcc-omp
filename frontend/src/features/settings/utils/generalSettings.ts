export const GENERAL_SETTINGS_STORAGE_KEY = "rccomp.settings.general";
export const GENERAL_SETTINGS_EVENT = "rccomp:general-settings-change";

export const DEFAULT_PORTAL_NAME = "RCC OMP – Operations Management Portal";
export const DEFAULT_ORGANIZATION = "Rajaram Consumer Care Pvt. Ltd.";
export const DEFAULT_LANGUAGE = "English (India)";
export const DEFAULT_DATE_FORMAT = "DD/MM/YYYY";
export const DEFAULT_TIMEZONE = "Asia/Kolkata";
export const DEFAULT_TIMEZONE_LABEL = "Asia/Kolkata (IST, UTC+5:30)";
export const DEFAULT_AUTO_REFRESH = true;
export const DEFAULT_COMPACT_VIEW = false;

export type GeneralSettings = {
  portalName: string;
  organization: string;
  language: string;
  dateFormat: string;
  timezone: string;
  autoRefresh: boolean;
  compactView: boolean;
};

export const GENERAL_SETTINGS_DEFAULTS: GeneralSettings = {
  portalName: DEFAULT_PORTAL_NAME,
  organization: DEFAULT_ORGANIZATION,
  language: DEFAULT_LANGUAGE,
  dateFormat: DEFAULT_DATE_FORMAT,
  timezone: DEFAULT_TIMEZONE,
  autoRefresh: DEFAULT_AUTO_REFRESH,
  compactView: DEFAULT_COMPACT_VIEW,
};

function readStoredSettings(): Partial<GeneralSettings> | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(GENERAL_SETTINGS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<GeneralSettings>;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function emitGeneralSettingsChanged(settings: GeneralSettings) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(GENERAL_SETTINGS_EVENT, {
      detail: settings,
    })
  );
}

export function loadGeneralSettings(): GeneralSettings {
  const defaults = GENERAL_SETTINGS_DEFAULTS;
  const stored = readStoredSettings();

  if (!stored) {
    return defaults;
  }

  const value: GeneralSettings = {
    portalName: typeof stored.portalName === "string" ? stored.portalName.trim() : defaults.portalName,
    organization: typeof stored.organization === "string" ? stored.organization.trim() : defaults.organization,
    language: typeof stored.language === "string" && stored.language.length > 0 ? stored.language : defaults.language,
    dateFormat: typeof stored.dateFormat === "string" && stored.dateFormat.length > 0 ? stored.dateFormat : defaults.dateFormat,
    timezone: typeof stored.timezone === "string" && stored.timezone.length > 0 ? stored.timezone : defaults.timezone,
    autoRefresh: Boolean(stored.autoRefresh ?? defaults.autoRefresh),
    compactView: Boolean(stored.compactView ?? defaults.compactView),
  };

  return {
    portalName: value.portalName || defaults.portalName,
    organization: value.organization || defaults.organization,
    language: value.language || defaults.language,
    dateFormat: value.dateFormat || defaults.dateFormat,
    timezone: value.timezone || defaults.timezone,
    autoRefresh: value.autoRefresh,
    compactView: value.compactView,
  };
}

export function saveGeneralSettings(settings: GeneralSettings): GeneralSettings {
  const defaults = GENERAL_SETTINGS_DEFAULTS;
  const next: GeneralSettings = {
    portalName: settings.portalName?.trim() || defaults.portalName,
    organization: settings.organization?.trim() || defaults.organization,
    language: settings.language || defaults.language,
    dateFormat: settings.dateFormat || defaults.dateFormat,
    timezone: settings.timezone || defaults.timezone,
    autoRefresh: Boolean(settings.autoRefresh),
    compactView: Boolean(settings.compactView),
  };

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(GENERAL_SETTINGS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      return next;
    }
  }

  emitGeneralSettingsChanged(next);
  return next;
}

export function applyGlobalCompactView(enabled: boolean) {
  if (typeof document === "undefined") {
    return;
  }

  document.body.classList.toggle("compact-view", enabled);
  document.body.setAttribute("data-compact", String(enabled));
}

export function syncGlobalGeneralSettings() {
  const resolved = loadGeneralSettings();
  applyGlobalCompactView(resolved.compactView);
  return resolved;
}
