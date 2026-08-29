// ─────────────────────────────────────────────────────────────────────────────
// SettingsPage
// Extracted from the original monolithic App.tsx (RCC OMP).
// Behavior, styling and Tailwind classes are unchanged from the original.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useState } from "react";
import { LayoutDashboard, Settings, Bell, Shield, ChevronRight, Check, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  loadGeneralSettings,
  saveGeneralSettings,
  type GeneralSettings,
  DEFAULT_DATE_FORMAT,
  DEFAULT_LANGUAGE,
  DEFAULT_ORGANIZATION,
  DEFAULT_PORTAL_NAME,
  DEFAULT_TIMEZONE,
} from "../utils/generalSettings";
import {
  loadNotificationSettings,
  saveNotificationSettings,
  type NotificationSettings,
  NOTIFICATION_SETTINGS_DEFAULTS,
} from "../utils/notificationSettings";


// ─────────────────────────────────────────────────────────────────────────────
// SETTINGS MODULE
// ─────────────────────────────────────────────────────────────────────────────

type SettingsSection = "general" | "notifications" | "security" | "roles";

export function SettingsToggle({ label, desc, value, onChange }: { label: string; desc?: string; value: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0">
      <div>
        <div className="text-sm font-semibold text-slate-900">{label}</div>
        {desc && <div className="text-xs text-slate-400 mt-0.5">{desc}</div>}
      </div>
      <button onClick={onChange} className={`relative w-11 h-6 rounded-full transition-colors ${value ? "bg-blue-600" : "bg-slate-300"}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );
}

export function SettingsInput({ label, value, type = "text", placeholder, onChange, readOnly }: { label: string; value: string; type?: string; placeholder?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; readOnly?: boolean }) {
  return (
    <div className="mb-4">
      <label className="text-xs font-semibold text-slate-700 mb-1.5 block">{label}</label>
      <input type={type} value={value} onChange={onChange} readOnly={readOnly} placeholder={placeholder}
        className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-400" />
    </div>
  );
}

export default function SettingsPage() {
  const [section, setSection] = useState<SettingsSection>("general");
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>(() => loadGeneralSettings());
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => loadNotificationSettings());

  const handleNotificationToggle = <K extends keyof NotificationSettings>(key: K) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  useEffect(() => {
    setGeneralSettings(loadGeneralSettings());
    setNotificationSettings(loadNotificationSettings());
  }, []);

  const handleGeneralChange = <K extends keyof GeneralSettings>(key: K, value: GeneralSettings[K]) => {
    setGeneralSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveGeneralSettings = () => {
    const next = saveGeneralSettings(generalSettings);
    setGeneralSettings(next);
    toast.success("Settings saved");
  };

  const handleSaveNotificationSettings = () => {
    const next = saveNotificationSettings(notificationSettings);
    if (!next) {
      toast.error("Unable to save notification preferences.");
      return;
    }

    setNotificationSettings(next);
    toast.success("Notification preferences saved");
  };

  const sidebar: { id: SettingsSection; label: string; icon: React.ComponentType<{ size?: number; className?: string }>; group?: string }[] = [
    { id: "general", label: "General", icon: Settings, group: "PORTAL" },
    { id: "notifications", label: "Notifications", icon: Bell, group: "" },
    { id: "security", label: "Security", icon: Shield, group: "ACCESS & CONTROL" },
    { id: "roles", label: "Roles & Permissions", icon: ShieldCheck, group: "" },
  ];

  const activeSessions: { device: string; ip: string; time: string; current: boolean }[] = [];

  return (
    <div className="w-full max-w-[1600px] mx-auto animate-in fade-in duration-300">
      <div className="mb-5">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-2">
          <LayoutDashboard size={12} /><span>Dashboard</span><ChevronRight size={12} /><span className="text-slate-700 font-semibold">Settings</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm shadow-blue-200"><Settings size={20} className="text-white" /></div>
          <div><h1 className="text-xl font-bold text-slate-900 tracking-tight">Settings</h1><p className="text-xs text-slate-500 mt-0.5">Configure portal, preferences and system</p></div>
        </div>
      </div>

      <div className="flex gap-5">
        <div className="w-56 shrink-0 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="py-2">
            {sidebar.map((item, _i) => (
              <React.Fragment key={item.id}>
                {item.group && <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-4 pt-4 pb-1.5">{item.group}</div>}
                <button onClick={() => setSection(item.id)} className={`w-full flex items-center gap-2.5 px-4 py-2 text-xs transition-colors ${section === item.id ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-600 hover:bg-slate-50 font-medium"}`}>
                  <item.icon size={14} className={section === item.id ? "text-blue-600" : "text-slate-400"} />
                  {item.label}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="flex-1 min-w-0 bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          {section === "general" && (
            <div className="max-w-xl">
              <h2 className="text-sm font-bold text-slate-900 mb-5">General Settings</h2>
              <SettingsInput
                label="Portal Name"
                value={generalSettings.portalName || DEFAULT_PORTAL_NAME}
                onChange={(event) => handleGeneralChange("portalName", event.target.value)}
              />
              <SettingsInput
                label="Organization"
                value={generalSettings.organization || DEFAULT_ORGANIZATION}
                onChange={(event) => handleGeneralChange("organization", event.target.value)}
              />
              <div className="mb-4">
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Default Language</label>
                <select
                  value={generalSettings.language || DEFAULT_LANGUAGE}
                  onChange={(event) => handleGeneralChange("language", event.target.value)}
                  className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-slate-700"
                >
                  <option value="English (India)">English (India)</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Date Format</label>
                <select
                  value={generalSettings.dateFormat || DEFAULT_DATE_FORMAT}
                  onChange={(event) => handleGeneralChange("dateFormat", event.target.value)}
                  className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-slate-700"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Timezone</label>
                <select
                  value={generalSettings.timezone || DEFAULT_TIMEZONE}
                  onChange={(event) => handleGeneralChange("timezone", event.target.value)}
                  className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-slate-700"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST, UTC+5:30)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
              <SettingsToggle
                label="Auto-refresh dashboards"
                desc="Refresh data every 60 seconds"
                value={generalSettings.autoRefresh}
                onChange={() => handleGeneralChange("autoRefresh", !generalSettings.autoRefresh)}
              />
              <SettingsToggle
                label="Compact view"
                desc="Reduce card and table padding"
                value={generalSettings.compactView}
                onChange={() => handleGeneralChange("compactView", !generalSettings.compactView)}
              />
              <button onClick={handleSaveGeneralSettings} className="mt-4 flex items-center gap-2 h-9 px-5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"><Check size={13} /> Save Changes</button>
            </div>
          )}

          {section === "notifications" && (
            <div className="max-w-xl">
              <h2 className="text-sm font-bold text-slate-900 mb-5">Notification Preferences</h2>
              <div className="space-y-0">
                <SettingsToggle label="In-app Push Notifications" desc="Surface existing in-app notification behavior" value={notificationSettings.inAppPushNotifications} onChange={() => handleNotificationToggle("inAppPushNotifications")} />
                <SettingsToggle label="SMS Alerts" desc="Critical alerts via SMS" value={notificationSettings.smsAlerts} onChange={() => handleNotificationToggle("smsAlerts")} />
                <SettingsToggle label="Maintenance Alerts" desc="PM due, overdue, completed" value={notificationSettings.maintenanceAlerts} onChange={() => handleNotificationToggle("maintenanceAlerts")} />
                <SettingsToggle label="Backup Alerts" desc="Backup success and failure" value={notificationSettings.backupAlerts} onChange={() => handleNotificationToggle("backupAlerts")} />
                <SettingsToggle label="QA Alerts" desc="Inspection results and audits" value={notificationSettings.qaAlerts} onChange={() => handleNotificationToggle("qaAlerts")} />
              </div>
              <button onClick={handleSaveNotificationSettings} className="mt-4 flex items-center gap-2 h-9 px-5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"><Check size={13} /> Save</button>
            </div>
          )}

          {section === "security" && (
            <div className="max-w-xl">
              <h2 className="text-sm font-bold text-slate-900 mb-5">Security</h2>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Password</div>
                <p className="text-sm text-slate-600 leading-6">
                  Password management will be handled through the secure authentication system when Supabase authentication is connected.
                </p>
              </div>
              <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
                Two-factor authentication and password changes are intentionally not implemented in this frontend-only phase.
              </div>
            </div>
          )}

          {section === "roles" && (
            <div className="max-w-xl">
              <h2 className="text-sm font-bold text-slate-900 mb-3">Roles & Permissions</h2>
              <p className="text-sm text-slate-600 mb-4">Manage roles, permissions and assignments from the User & Role Management page.</p>
              <button onClick={() => (window.location.href = '/user-management')} className="flex items-center gap-2 h-9 px-4 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"><ShieldCheck size={13} /> Open User & Role Management</button>
            </div>
          )}

          {/* Any module-specific settings removed — Settings only exposes General, Notifications, Security and Roles */}
        </div>
      </div>
    </div>
  );
}
