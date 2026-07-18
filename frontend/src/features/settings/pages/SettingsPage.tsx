// ─────────────────────────────────────────────────────────────────────────────
// SettingsPage
// Extracted from the original monolithic App.tsx (RCC OMP).
// Behavior, styling and Tailwind classes are unchanged from the original.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { LayoutDashboard, Settings, Bell, Shield, ChevronRight, Lock, Check, ShieldCheck } from "lucide-react";
import { toast } from "sonner";


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
  const [toggles, setToggles] = useState({ emailNotifs: true, pushNotifs: true, smsAlerts: false, maintenanceAlerts: true, backupAlerts: true, qaAlerts: true, criticalOnly: false, darkMode: false, compactView: false, autoRefresh: true, twoFactor: false, sessionTimeout: true });
  const toggle = (key: keyof typeof toggles) => setToggles(t => ({ ...t, [key]: !t[key] }));

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
              <SettingsInput label="Portal Name" value="RCC OMP – Operations Management Portal" />
              <SettingsInput label="Organization" value="Rajaram Consumer Care Pvt. Ltd." />
              <SettingsInput label="Default Language" value="English (India)" />
              <div className="mb-4">
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Date Format</label>
                <select className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-slate-700">
                  <option>DD/MM/YYYY</option><option>MM/DD/YYYY</option><option>YYYY-MM-DD</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Timezone</label>
                <select className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-slate-700">
                  <option>Asia/Kolkata (IST, UTC+5:30)</option><option>UTC</option>
                </select>
              </div>
              <SettingsToggle label="Auto-refresh dashboards" desc="Refresh data every 60 seconds" value={toggles.autoRefresh} onChange={() => toggle("autoRefresh")} />
              <SettingsToggle label="Compact view" desc="Reduce card and table padding" value={toggles.compactView} onChange={() => toggle("compactView")} />
              <button onClick={() => toast.success("Settings saved!")} className="mt-4 flex items-center gap-2 h-9 px-5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"><Check size={13} /> Save Changes</button>
            </div>
          )}

          {section === "notifications" && (
            <div className="max-w-xl">
              <h2 className="text-sm font-bold text-slate-900 mb-5">Notification Preferences</h2>
              <div className="space-y-0">
                <SettingsToggle label="Email Notifications" desc="Receive important alerts via email" value={toggles.emailNotifs} onChange={() => toggle("emailNotifs")} />
                <SettingsToggle label="In-app Push Notifications" desc="Browser push notifications" value={toggles.pushNotifs} onChange={() => toggle("pushNotifs")} />
                <SettingsToggle label="SMS Alerts" desc="Critical alerts via SMS" value={toggles.smsAlerts} onChange={() => toggle("smsAlerts")} />
                <SettingsToggle label="Maintenance Alerts" desc="PM due, overdue, completed" value={toggles.maintenanceAlerts} onChange={() => toggle("maintenanceAlerts")} />
                <SettingsToggle label="Backup Alerts" desc="Backup success and failure" value={toggles.backupAlerts} onChange={() => toggle("backupAlerts")} />
                <SettingsToggle label="QA Alerts" desc="Inspection results and audits" value={toggles.qaAlerts} onChange={() => toggle("qaAlerts")} />
                <SettingsToggle label="Critical Only Mode" desc="Only receive critical severity alerts" value={toggles.criticalOnly} onChange={() => toggle("criticalOnly")} />
              </div>
              <button onClick={() => toast.success("Preferences saved!")} className="mt-4 flex items-center gap-2 h-9 px-5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"><Check size={13} /> Save</button>
            </div>
          )}

          {section === "security" && (
            <div className="max-w-xl">
              <h2 className="text-sm font-bold text-slate-900 mb-5">Security Settings</h2>
              <div className="mb-5">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Change Password</h3>
                <SettingsInput label="Current Password" value="" type="password" placeholder="••••••••" />
                <SettingsInput label="New Password" value="" type="password" placeholder="••••••••" />
                <SettingsInput label="Confirm New Password" value="" type="password" placeholder="••••••••" />
                <button onClick={() => toast.success("Password updated!")} className="flex items-center gap-2 h-9 px-5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"><Lock size={13} /> Update Password</button>
              </div>
              <div className="border-t border-slate-100 pt-5">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Authentication</h3>
                <SettingsToggle label="Two-Factor Authentication" desc="Require OTP on login (TOTP app)" value={toggles.twoFactor} onChange={() => toggle("twoFactor")} />
                <SettingsToggle label="Session Timeout (30 min)" desc="Auto-logout after inactivity" value={toggles.sessionTimeout} onChange={() => toggle("sessionTimeout")} />
              </div>
              <div className="border-t border-slate-100 pt-5 mt-5">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Active Sessions</h3>
                {activeSessions.length > 0 ? (
                  activeSessions.map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl mb-2">
                      <div>
                        <div className="text-xs font-semibold text-slate-900 flex items-center gap-2">{s.device}{s.current && <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-1.5 rounded">Current</span>}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{s.ip} · {s.time}</div>
                      </div>
                      {!s.current && <button onClick={() => toast.error("Session terminated.")} className="text-[11px] font-semibold text-red-600 hover:text-red-800 transition-colors">Revoke</button>}
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                    No active sessions are currently recorded. Session activity will appear here once users sign in.
                  </div>
                )}
              </div>
            </div>
          )}

          {section === "roles" && (
            <div className="max-w-xl">
              <h2 className="text-sm font-bold text-slate-900 mb-3">Roles & Permissions</h2>
              <p className="text-sm text-slate-600 mb-4">Manage roles, permissions and assignments from the User & Role Management page.</p>
              <button onClick={() => (window.location.href = '/admin')} className="flex items-center gap-2 h-9 px-4 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"><ShieldCheck size={13} /> Open User & Role Management</button>
            </div>
          )}

          {/* Any module-specific settings removed — Settings only exposes General, Notifications, Security and Roles */}
        </div>
      </div>
    </div>
  );
}
