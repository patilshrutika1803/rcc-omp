// ─────────────────────────────────────────────────────────────────────────────
// USER PROFILE
// Extracted verbatim from App.tsx — behavior, markup and styling unchanged.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import {
  LayoutDashboard,
  ChevronRight,
  Edit2,
  Shield,
  Building,
  Mail,
  Phone,
  Download,
  CheckCircle2,
  FileText,
  Server,
  Calendar as CalendarIcon,
  Check,
} from "lucide-react";
import { toast } from "sonner";

import { PM_DATA, StatusBadge } from "../../features/preventive-maintenance/PreventiveMaintenancePage";
import { SettingsToggle, SettingsInput } from "../../features/settings/pages/SettingsPage";
import { StatusChip } from "../../shared/components/EnterpriseUI";
import { formatDate } from "../../shared/utils/dateHelpers";

export function UserProfileContent() {
  const [tab, setTab] = useState<"overview" | "security" | "activity" | "tasks" | "preferences">("overview");
  const TABS = [{ id: "overview" as const, label: "Overview" }, { id: "security" as const, label: "Security" }, { id: "activity" as const, label: "Activity" }, { id: "tasks" as const, label: "My Tasks" }, { id: "preferences" as const, label: "Preferences" }];

  const myTasks = PM_DATA.filter(t => t.user === "Nikhil Sakat").slice(0, 4);

  return (
    <div className="w-full max-w-[1600px] mx-auto animate-in fade-in duration-300">
      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-2">
          <LayoutDashboard size={12} /><span>Dashboard</span><ChevronRight size={12} /><span className="text-slate-700 font-semibold">My Profile</span>
        </div>
      </div>

      {/* Profile Header */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">NS</div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border-2 border-white rounded-full shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors"><Edit2 size={12} className="text-slate-500" /></button>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-900">Nikhil Sakat</h1>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
              <span className="flex items-center gap-1"><Shield size={11} /> IT Head</span>
              <span className="flex items-center gap-1"><Building size={11} /> IT</span>
              <span className="flex items-center gap-1"><Mail size={11} /> nikhil.sakat@rajaram.com</span>
              <span className="flex items-center gap-1"><Phone size={11} /> +91 98212 00001</span>
            </div>
            <div className="flex items-center gap-2 mt-2.5">
              <StatusChip label="Active" variant="success" />
              <span className="text-[11px] text-slate-400 font-mono">EMP-ID: RCC-IT-001</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <button className="flex items-center gap-2 h-8 px-3 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"><Edit2 size={12} /> Edit Profile</button>
            <button onClick={() => toast.success("Report generated!")} className="flex items-center gap-2 h-8 px-3 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"><Download size={12} /> Download Summary</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-slate-200 mb-5 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-5 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${tab === t.id ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}>{t.label}</button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4">Personal Information</h3>
            <div className="grid grid-cols-2 gap-3">
              {[["Full Name","Nikhil Sakat"],["Employee ID","RCC-IT-001"],["Role","IT Head"],["Department","IT"],["Email","nikhil.sakat@rajaram.com"],["Phone","+91 98212 00001"],["Location","Head Office – Pune"],["Date of Joining","January 1, 2020"],["Permissions","Administrator"],["Manages","IT Department"]].map(([k,v]) => (
                <div key={k} className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{k}</div>
                  <div className="text-xs font-semibold text-slate-900">{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4">Stats</h3>
              {[{ label: "Tasks Completed", val: "148", icon: CheckCircle2, color: "text-emerald-600" },
                { label: "Reports Generated", val: "32", icon: FileText, color: "text-blue-600" },
                { label: "Machines Managed", val: "5", icon: Server, color: "text-slate-600" },
                { label: "Days Active", val: "4,554", icon: CalendarIcon, color: "text-purple-600" }].map((s, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0">
                  <s.icon size={15} className={s.color} />
                  <span className="flex-1 text-xs text-slate-600">{s.label}</span>
                  <span className="text-sm font-bold text-slate-900">{s.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "security" && (
        <div className="max-w-xl bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4">Security Settings</h3>
          <SettingsInput label="Current Password" value="" type="password" placeholder="••••••••" />
          <SettingsInput label="New Password" value="" type="password" placeholder="Minimum 12 characters" />
          <SettingsInput label="Confirm New Password" value="" type="password" placeholder="••••••••" />
          <button onClick={() => toast.success("Password updated!")} className="flex items-center gap-2 h-9 px-5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors mb-5"><Check size={13} /> Update Password</button>
          <div className="border-t border-slate-100 pt-4">
            <SettingsToggle label="Two-Factor Authentication" desc="Use an authenticator app for login" value={false} onChange={() => {}} />
          </div>
        </div>
      )}

      {tab === "activity" && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-5">Recent Activity</h3>
          <div className="relative border-l-2 border-slate-100 ml-3 space-y-5">
            {[
              { time: "2 hours ago", title: "Generated report: IT Department Health", color: "bg-blue-100" },
              { time: "4 hours ago", title: "Verified backup activity for July 2026", color: "bg-emerald-100" },
              { time: "Yesterday", title: "Approved QA document QMS-011", color: "bg-purple-100" },
              { time: "2 days ago", title: "Reviewed PM task assigned to Megha Jadhav", color: "bg-amber-100" },
              { time: "3 days ago", title: "Updated system inventory documentation", color: "bg-indigo-100" },
            ].map((item, i) => (
              <div key={i} className="relative pl-7">
                <div className={`absolute -left-[9px] top-0.5 w-4 h-4 rounded-full ${item.color} border-2 border-white`} />
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{item.time}</div>
                <div className="text-xs font-semibold text-slate-800">{item.title}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "tasks" && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100"><h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Assigned to Nikhil Sakat · {myTasks.length} tasks</h3></div>
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <tr><th className="px-5 py-3">Machine</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Due</th><th className="px-4 py-3">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myTasks.map((t, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-5 py-3.5 text-xs font-bold text-slate-900">{t.machine}</td>
                  <td className="px-4 py-3.5 text-xs text-slate-600">{t.frequency}</td>
                  <td className="px-4 py-3.5 text-xs text-slate-600">{formatDate(t.nextDue)}</td>
                  <td className="px-4 py-3.5"><StatusBadge status={t.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "preferences" && (
        <div className="max-w-xl bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4">Notification Preferences</h3>
          <div className="space-y-0">
            <SettingsToggle label="Email digests" desc="Daily summary email at 08:00" value={true} onChange={() => {}} />
            <SettingsToggle label="Critical alerts" desc="Immediate email for critical events" value={true} onChange={() => {}} />
            <SettingsToggle label="PM reminders" desc="Remind me 3 days before due" value={true} onChange={() => {}} />
            <SettingsToggle label="Report completion" desc="Notify when reports are ready" value={false} onChange={() => {}} />
          </div>
          <div className="border-t border-slate-100 pt-4 mt-2">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4">Display Preferences</h3>
            <SettingsToggle label="Default to card view" desc="Show cards instead of table by default" value={false} onChange={() => {}} />
            <SettingsToggle label="Show KPI tooltips" desc="Display help tooltips on KPI cards" value={true} onChange={() => {}} />
          </div>
          <button onClick={() => toast.success("Preferences saved!")} className="mt-4 flex items-center gap-2 h-9 px-5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"><Check size={13} /> Save</button>
        </div>
      )}
    </div>
  );
}

export default UserProfileContent;
