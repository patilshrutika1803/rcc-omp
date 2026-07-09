// ─────────────────────────────────────────────────────────────────────────────
// SettingsPage
// Extracted from the original monolithic App.tsx (RCC OMP).
// Behavior, styling and Tailwind classes are unchanged from the original.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import {
  Monitor,
  LayoutDashboard,
  Archive,
  CheckSquare,
  Server,
  Settings,
  Bell,
  User,
  Shield,
  ChevronRight,
  Info,
  Mail,
  Lock,
  Check,
  Plus,
  Upload,
  Download,
  Edit2,
  Copy,
  Headphones,
  Key,
  Database,
  Palette,
  Send,
  Type,
  Moon,
  Sun,
  ShieldCheck,
  ClipboardList,
  Phone,
  Building,
  BadgeCheck,
  RotateCw
} from "lucide-react";
import { Area } from "recharts";
import { toast } from "sonner";


// ─────────────────────────────────────────────────────────────────────────────
// SETTINGS MODULE
// ─────────────────────────────────────────────────────────────────────────────

type SettingsSection = "general" | "profile" | "appearance" | "notifications" | "security" | "roles" | "machines" | "backup" | "qa" | "email" | "api" | "audit" | "system" | "import" | "license" | "about";

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

export function SettingsInput({ label, value, type = "text", placeholder }: { label: string; value: string; type?: string; placeholder?: string }) {
  return (
    <div className="mb-4">
      <label className="text-xs font-semibold text-slate-700 mb-1.5 block">{label}</label>
      <input type={type} defaultValue={value} placeholder={placeholder}
        className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-400" />
    </div>
  );
}

export default function SettingsPage() {
  const [section, setSection] = useState<SettingsSection>("general");
  const [toggles, setToggles] = useState({ emailNotifs: true, pushNotifs: true, smsAlerts: false, maintenanceAlerts: true, backupAlerts: true, qaAlerts: true, criticalOnly: false, darkMode: false, compactView: false, autoRefresh: true, twoFactor: false, sessionTimeout: true });
  const toggle = (key: keyof typeof toggles) => setToggles(t => ({ ...t, [key]: !t[key] }));

  const sidebar: { id: SettingsSection; label: string; icon: React.ComponentType<{ size?: number; className?: string }>; group?: string }[] = [
    { id: "general",  label: "General",           icon: Settings,     group: "ORGANIZATION" },
    { id: "profile",  label: "Company Profile",   icon: Building,     group: "" },
    { id: "appearance", label: "Appearance",      icon: Palette,      group: "PREFERENCES" },
    { id: "notifications", label: "Notifications",icon: Bell,         group: "" },
    { id: "security", label: "Security",          icon: Shield,       group: "ACCESS & CONTROL" },
    { id: "roles",    label: "Roles & Permissions",icon: ShieldCheck, group: "" },
    { id: "machines", label: "Machines Config",   icon: Server,       group: "MODULE SETTINGS" },
    { id: "backup",   label: "Backup Settings",   icon: Archive,      group: "" },
    { id: "qa",       label: "QA Settings",       icon: CheckSquare,  group: "" },
    { id: "email",    label: "Email Config",       icon: Mail,         group: "INTEGRATIONS" },
    { id: "api",      label: "API Keys",           icon: Key,          group: "" },
    { id: "audit",    label: "Audit Logs",         icon: ClipboardList,group: "SYSTEM" },
    { id: "system",   label: "System Logs",        icon: Database,     group: "" },
    { id: "import",   label: "Import / Export",    icon: Download,     group: "" },
    { id: "license",  label: "License",            icon: BadgeCheck,   group: "ABOUT" },
    { id: "about",    label: "About System",       icon: Info,         group: "" },
  ];

  const FAKE_AUDIT = [
    { action: "User login", user: "Arun Sharma", ip: "192.168.1.10", time: "2026-07-03 09:12:04" },
    { action: "Report generated", user: "Arun Sharma", ip: "192.168.1.10", time: "2026-07-03 09:45:22" },
    { action: "Machine edited: MCH-HVAC-SR1", user: "Vikram Singh", ip: "192.168.1.22", time: "2026-07-03 10:02:11" },
    { action: "PM marked complete: PM-2052", user: "Anita Desai", ip: "192.168.2.14", time: "2026-07-02 16:33:55" },
    { action: "Backup settings updated", user: "Arjun Rao", ip: "192.168.1.18", time: "2026-07-02 11:20:30" },
    { action: "User role changed: Priya Nair → Lead", user: "Arun Sharma", ip: "192.168.1.10", time: "2026-07-01 14:05:42" },
  ];

  const API_KEYS = [
    { name: "ERP Integration", key: "rcc_live_sk_••••••••••••4a2f", created: "2026-01-01", lastUsed: "2026-07-03", status: "Active" },
    { name: "HR System", key: "rcc_live_sk_••••••••••••b8c1", created: "2026-03-15", lastUsed: "2026-07-02", status: "Active" },
    { name: "Backup Service", key: "rcc_live_sk_••••••••••••3d09", created: "2026-05-10", lastUsed: "2026-07-03", status: "Active" },
    { name: "Legacy App (Deprecated)", key: "rcc_test_sk_••••••••••••9e77", created: "2025-08-01", lastUsed: "2026-01-15", status: "Revoked" },
  ];

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
        {/* Sidebar */}
        <div className="w-56 shrink-0 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="py-2">
            {sidebar.map((item, i) => (
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

        {/* Content */}
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

          {section === "profile" && (
            <div className="max-w-xl">
              <h2 className="text-sm font-bold text-slate-900 mb-5">Company Profile</h2>
              <div className="flex items-center gap-4 mb-5 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center"><Monitor size={28} className="text-white" /></div>
                <div><div className="text-sm font-bold text-slate-900">Rajaram Consumer Care Pvt. Ltd.</div><div className="text-xs text-slate-500 mt-1">CIN: U24234MH1998PTC112345</div></div>
                <button className="ml-auto text-xs font-semibold text-blue-600 hover:text-blue-800">Change Logo</button>
              </div>
              <SettingsInput label="Company Name" value="Rajaram Consumer Care Pvt. Ltd." />
              <SettingsInput label="CIN / Registration Number" value="U24234MH1998PTC112345" />
              <SettingsInput label="Address" value="Plot 12, MIDC Industrial Area, Pune – 411019" />
              <SettingsInput label="GSTIN" value="27AABCR1234M1ZX" />
              <SettingsInput label="Contact Email" value="operations@rajaram.com" type="email" />
              <SettingsInput label="Contact Phone" value="+91 20 2747 0000" />
              <button onClick={() => toast.success("Profile saved!")} className="mt-2 flex items-center gap-2 h-9 px-5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"><Check size={13} /> Save Changes</button>
            </div>
          )}

          {section === "appearance" && (
            <div className="max-w-xl">
              <h2 className="text-sm font-bold text-slate-900 mb-5">Appearance</h2>
              <div className="mb-5">
                <label className="text-xs font-semibold text-slate-700 mb-2 block">Theme</label>
                <div className="grid grid-cols-3 gap-3">
                  {[{ id: "light", label: "Light", icon: Sun }, { id: "dark", label: "Dark", icon: Moon }, { id: "system", label: "System", icon: Monitor }].map(t => (
                    <button key={t.id} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 text-xs font-semibold transition-all ${t.id === "light" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}>
                      <t.icon size={20} />{t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="text-xs font-semibold text-slate-700 mb-2 block">Primary Accent Color</label>
                <div className="flex gap-2">
                  {["#2563EB","#7C3AED","#059669","#DC2626","#D97706","#0891B2"].map(c => (
                    <button key={c} className={`w-8 h-8 rounded-full border-2 transition-all ${c === "#2563EB" ? "border-slate-900 scale-110" : "border-transparent hover:border-slate-400"}`} style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="text-xs font-semibold text-slate-700 mb-2 block">Sidebar Layout</label>
                <div className="flex gap-2">
                  {["Default (Expanded)", "Compact (Icons Only)"].map(l => (
                    <button key={l} className={`px-3 py-2 text-xs font-semibold rounded-lg border-2 transition-all ${l.includes("Default") ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600"}`}>{l}</button>
                  ))}
                </div>
              </div>
              <SettingsToggle label="Dark mode" desc="Switch to dark theme" value={toggles.darkMode} onChange={() => toggle("darkMode")} />
              <SettingsToggle label="Compact view" desc="Tighter spacing and padding" value={toggles.compactView} onChange={() => toggle("compactView")} />
              <button onClick={() => toast.success("Appearance saved!")} className="mt-2 flex items-center gap-2 h-9 px-5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"><Check size={13} /> Save</button>
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
                {[{ device: "Chrome on Windows – Pune Office", ip: "192.168.1.10", time: "Active now", current: true }, { device: "Chrome on MacBook – Remote", ip: "103.44.21.88", time: "1 day ago", current: false }].map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl mb-2">
                    <div>
                      <div className="text-xs font-semibold text-slate-900 flex items-center gap-2">{s.device}{s.current && <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-1.5 rounded">Current</span>}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{s.ip} · {s.time}</div>
                    </div>
                    {!s.current && <button onClick={() => toast.error("Session terminated.")} className="text-[11px] font-semibold text-red-600 hover:text-red-800 transition-colors">Revoke</button>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === "roles" && (
            <div>
              <h2 className="text-sm font-bold text-slate-900 mb-5">Roles & Permissions</h2>
              <div className="space-y-3 mb-6">
                {[
                  { role: "Super Admin", users: 1, perms: ["Full Access", "User Management", "System Config", "Audit Logs"] },
                  { role: "IT Admin", users: 2, perms: ["IT Modules", "Backup Mgmt", "Machine Config", "Reports"] },
                  { role: "Department Head", users: 6, perms: ["Own Department", "Reports", "Team Management"] },
                  { role: "User", users: 8, perms: ["PM Tasks", "Machine View", "QA Tasks"] },
                  { role: "QA Inspector", users: 3, perms: ["QA Module", "Inspection Reports"] },
                  { role: "Viewer", users: 12, perms: ["Dashboard", "Read-only Reports"] },
                ].map((r, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
                    <div className="w-9 h-9 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center shrink-0"><ShieldCheck size={16} className="text-blue-600" /></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-sm font-bold text-slate-900">{r.role}</span>
                        <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full font-semibold">{r.users} users</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {r.perms.map(p => <span key={p} className="text-[10px] bg-white border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-medium">{p}</span>)}
                      </div>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button className="h-7 px-2.5 text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"><Edit2 size={11} /></button>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => toast.success("New role created!")} className="flex items-center gap-2 h-9 px-4 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"><Plus size={13} /> Add New Role</button>
            </div>
          )}

          {section === "api" && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-bold text-slate-900">API Keys</h2>
                <button onClick={() => toast.success("New API key generated!")} className="flex items-center gap-1.5 h-9 px-4 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"><Plus size={13} /> Generate Key</button>
              </div>
              <div className="space-y-3">
                {API_KEYS.map((k, i) => (
                  <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-slate-900">{k.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${k.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>{k.status}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <code className="text-xs font-mono text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded flex-1">{k.key}</code>
                      <button onClick={() => toast.success("Copied!")} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded-md transition-colors"><Copy size={13} /></button>
                    </div>
                    <div className="text-[10px] text-slate-400">Created: {k.created} · Last used: {k.lastUsed}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === "audit" && (
            <div>
              <h2 className="text-sm font-bold text-slate-900 mb-5">Audit Logs</h2>
              <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <tr><th className="px-4 py-3">Action</th><th className="px-4 py-3">User</th><th className="px-4 py-3">IP Address</th><th className="px-4 py-3">Timestamp</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {FAKE_AUDIT.map((a, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-xs font-medium text-slate-900">{a.action}</td>
                        <td className="px-4 py-3 text-xs text-slate-600">{a.user}</td>
                        <td className="px-4 py-3 text-xs font-mono text-slate-500">{a.ip}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{a.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {section === "about" && (
            <div className="max-w-md">
              <div className="flex items-center gap-4 mb-6 p-5 bg-blue-50 border border-blue-100 rounded-2xl">
                <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center"><Monitor size={28} className="text-white" /></div>
                <div>
                  <div className="text-lg font-bold text-slate-900">RCC OMP</div>
                  <div className="text-xs text-slate-500">Enterprise Operations Management Portal</div>
                  <div className="text-xs font-bold text-blue-600 mt-1">Version 7.0.0</div>
                </div>
              </div>
              {[["Organization","Rajaram Consumer Care Pvt. Ltd."],["Build Date","July 1, 2026"],["Environment","Production"],["License","Enterprise – Unlimited Users"],["License Expiry","December 31, 2026"],["Support","support@rajaram.com"]].map(([k, v]) => (
                <div key={k} className="flex justify-between py-3 border-b border-slate-100 text-xs">
                  <span className="text-slate-500 font-medium">{k}</span>
                  <span className="font-semibold text-slate-900">{v}</span>
                </div>
              ))}
              <div className="flex gap-3 mt-5">
                <button onClick={() => toast.success("Support ticket opened!")} className="flex items-center gap-2 h-9 px-4 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"><Headphones size={13} /> Contact Support</button>
                <button onClick={() => toast.success("Checking for updates...")} className="flex items-center gap-2 h-9 px-4 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"><RotateCw size={13} /> Check Updates</button>
              </div>
            </div>
          )}

          {!["general","profile","appearance","notifications","security","roles","api","audit","about"].includes(section) && (
            <div>
              <h2 className="text-sm font-bold text-slate-900 mb-5">{sidebar.find(s => s.id === section)?.label}</h2>
              <div className="space-y-4">
                {section === "machines" && <>
                  <SettingsInput label="Default PM Reminder (days before)" value="3" />
                  <SettingsInput label="Health Score Warning Threshold (%)" value="60" />
                  <SettingsInput label="Health Score Critical Threshold (%)" value="30" />
                  <SettingsInput label="Heartbeat Interval (seconds)" value="60" />
                  <SettingsToggle label="Auto-assign PM tasks" desc="Assign to department head automatically" value={true} onChange={() => {}} />
                </>}
                {section === "backup" && <>
                  <SettingsInput label="Default Retention Period (days)" value="30" />
                  <SettingsInput label="Backup Destination (Primary)" value="NAS-BACKUP-01 / Pool-A" />
                  <SettingsInput label="Backup Destination (Secondary)" value="TAPE-LIB-01" />
                  <SettingsToggle label="Email on failure" desc="Send alert when backup fails" value={true} onChange={() => {}} />
                  <SettingsToggle label="Auto-verify backup integrity" desc="Verify checksums after each backup" value={true} onChange={() => {}} />
                </>}
                {section === "qa" && <>
                  <SettingsInput label="Default Inspection Frequency" value="Weekly" />
                  <SettingsInput label="Auto-escalate after (hours)" value="24" />
                  <SettingsToggle label="Require photo evidence" desc="Mandatory photo for failed inspections" value={false} onChange={() => {}} />
                  <SettingsToggle label="Auto-close passed inspections" desc="No manual approval required" value={true} onChange={() => {}} />
                </>}
                {section === "email" && <>
                  <SettingsInput label="SMTP Server" value="smtp.rajaram.com" />
                  <SettingsInput label="SMTP Port" value="587" />
                  <SettingsInput label="From Email" value="noreply@rajaram.com" />
                  <SettingsInput label="From Name" value="RCC OMP Portal" />
                  <SettingsInput label="SMTP Username" value="smtp_omp@rajaram.com" />
                  <SettingsInput label="SMTP Password" value="" type="password" placeholder="••••••••" />
                  <button onClick={() => toast.success("Test email sent!")} className="flex items-center gap-2 h-9 px-4 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"><Send size={13} /> Send Test Email</button>
                </>}
                {section === "system" && (
                  <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 font-mono text-xs text-emerald-400 overflow-x-auto">
                    <div>[2026-07-03 09:12:04] INFO  Portal started on port 3000</div>
                    <div>[2026-07-03 09:12:05] INFO  Database connection established (PostgreSQL)</div>
                    <div>[2026-07-03 09:45:22] INFO  Report RPT-001 generated by arun.sharma</div>
                    <div>[2026-07-03 10:02:11] INFO  Machine MCH-HVAC-SR1 status updated: Warning → Critical</div>
                    <div>[2026-07-03 10:05:00] INFO  Heartbeat check: 12/12 machines responding</div>
                    <div>[2026-07-03 10:15:00] <span className="text-red-400">WARN  Backup BK-2005 failed: snapshot timeout</span></div>
                    <div>[2026-07-03 10:20:44] INFO  Notification dispatched to Vikram Singh (email)</div>
                    <div className="text-slate-500 mt-2">── end of log ──</div>
                  </div>
                )}
                {section === "import" && (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-colors">
                      <Upload size={24} className="text-slate-300 mx-auto mb-3" />
                      <div className="text-sm font-bold text-slate-700">Drop file here or click to upload</div>
                      <div className="text-xs text-slate-400 mt-1">Supports .xlsx, .csv, .json (max 10MB)</div>
                      <button className="mt-3 flex items-center gap-2 h-8 px-4 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors mx-auto"><Upload size={12} /> Choose File</button>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => toast.success("Export started – file ready in 30s")} className="flex items-center gap-2 h-9 px-4 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"><Download size={13} /> Export All Data (.xlsx)</button>
                      <button onClick={() => toast.success("Export started – file ready in 30s")} className="flex items-center gap-2 h-9 px-4 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"><Download size={13} /> Export as JSON</button>
                    </div>
                  </div>
                )}
                {section === "license" && (
                  <div className="space-y-3">
                    {[["License Type","Enterprise – Unlimited Users"],["Licensed To","Rajaram Consumer Care Pvt. Ltd."],["License Key","RCC-ENT-2024-XXXXXX-XXXX (verified)"],["Valid From","January 1, 2024"],["Valid Until","December 31, 2026"],["Modules Licensed","All Modules"],["Support Tier","Priority Enterprise"]].map(([k, v]) => (
                      <div key={k} className="flex justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs">
                        <span className="text-slate-500 font-medium">{k}</span>
                        <span className="font-bold text-slate-900">{v}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {!["system","import","license"].includes(section) && (
                <button onClick={() => toast.success("Settings saved!")} className="mt-5 flex items-center gap-2 h-9 px-5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"><Check size={13} /> Save Changes</button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
