// ─────────────────────────────────────────────────────────────────────────────
// App.tsx — Application controller for RCC OMP
// (Rajaram Consumer Care Operations Management Portal)
//
// This file is now ONLY responsible for:
//  - Global navigation (NAV_ITEMS, sidebar, mobile drawer)
//  - Top header (search, notifications bell, profile menu)
//  - Routing between feature pages (activeNav switch)
//  - Auth flow (login / signup / forgot / reset) — unchanged, not part of
//    the 10 required feature extractions
//  - Global search overlay, user profile, role management and help center
//    screens — these are not part of the 10 required feature pages, so per
//    the refactor instructions they remain here rather than being split out
//  - Global state that spans the whole app shell (auth view, sidebar state)
//
// All feature-specific UI, state and mock data now live in
// src/features/<feature>/pages/<Feature>Page.tsx
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useMemo } from "react";
import {
  Monitor,
  LayoutDashboard,
  Wrench,
  Archive,
  CheckSquare,
  Server,
  BarChart2,
  FileText,
  Settings,
  LogOut,
  Search,
  Bell,
  ChevronDown,
  User,
  Shield,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  Clock,
  Calendar as CalendarIcon,
  CheckCircle2,
  Menu,
  X,
  Mail,
  Lock,
  ArrowLeft,
  Check,
  Download,
  Eye,
  Edit2,
  ChevronUp,
  Layers,
  BookOpen,
  MessageSquare,
  HelpCircle,
  UserPlus,
  UserX,
  ShieldCheck,
  Phone,
  Building
} from "lucide-react";
import { Toaster, toast } from "sonner";

// Feature pages
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import PreventiveMaintenancePage, { PM_DATA, StatusBadge } from "../features/preventive-maintenance/pages/PreventiveMaintenancePage";
import BackupActivitiesPage from "../features/backup/pages/BackupActivitiesPage";
import QAPage from "../features/qa/pages/QAPage";
import SystemInventoryPage, { SYSTEMS } from "../features/system-inventory/pages/SystemInventoryPage";

import DepartmentsPage, { DEPT_RECORDS, EMPLOYEES } from "../features/departments/pages/DepartmentsPage";
import ReportsPage, { ALL_REPORTS } from "../features/reports/pages/ReportsPage";
import NotificationsPage from "../features/notificataions/pages/NotificationsPage";
import NotesPage from "../features/notes/pages/NotesPage";
import SettingsPage, { SettingsToggle, SettingsInput } from "../features/settings/pages/SettingsPage";

// Shared
import { StatusChip } from "../shared/components/EnterpriseUI";
import { formatDate } from "../shared/utils/dateHelpers";

type NavItem = {
  id: string;
  icon: React.ComponentType<any>;
  label: string;
  badge?: string;
};

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "maintenance", icon: Wrench, label: "Preventive Maintenance" },
  { id: "backup", icon: Archive, label: "Backup Activities" },
  { id: "qa", icon: CheckSquare, label: "QA Activities" },
  { id: "machines", icon: Server, label: "System Inventory" },
  { id: "departments", icon: BarChart2, label: "Departments" },
  { id: "reports", icon: BarChart2, label: "Reports" },
  { id: "notifications", icon: Bell, label: "Notifications" },
  { id: "notes", icon: FileText, label: "Notes" },
  { id: "settings", icon: Settings, label: "Settings" },
];



// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL SEARCH OVERLAY
// ─────────────────────────────────────────────────────────────────────────────

const SEARCH_ITEMS = [
...SYSTEMS.map(s => ({ type: "Machine", label: s.systemName, sub: s.systemId + " · " + s.department, status: s.status })),
  ...DEPT_RECORDS.map(d => ({ type: "Department", label: d.name, sub: d.head + " · " + d.employees + " employees", status: d.status })),
  ...EMPLOYEES.map(e => ({ type: "Employee", label: e.name, sub: e.role + " · " + e.department, status: e.availability })),
  ...ALL_REPORTS.map(r => ({ type: "Report", label: r.title, sub: r.type + " · " + r.date, status: r.status })),
  // Notes items removed (no demo data). Will be populated via notesService/Supabase later.
];

const RECENT_SEARCHES = ["HVAC critical alert", "Backup BK-2001", "Rajesh Kumar", "Production PM schedule", "QA Audit July"];

function GlobalSearchOverlay({ onClose, onNavigate }: { onClose: () => void; onNavigate: (nav: string) => void }) {
  const [query, setQuery] = useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => { inputRef.current?.focus(); }, []);

  const results = useMemo(() => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    return SEARCH_ITEMS.filter(item => item.label.toLowerCase().includes(q) || item.sub.toLowerCase().includes(q)).slice(0, 12);
  }, [query]);

  const typeIcon: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
    Machine: Server, Department: Layers, Employee: User, Report: FileText, Note: FileText,
  };
  const typeNav: Record<string, string> = { Machine: "machines", Department: "departments", Employee: "departments", Report: "reports", Note: "notes" };

  const grouped = results.reduce((acc, item) => { (acc[item.type] = acc[item.type] || []).push(item); return acc; }, {} as Record<string, typeof results>);

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center pt-20 px-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input ref={inputRef} type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search machines, reports, employees, notes..."
            className="flex-1 text-sm text-slate-900 bg-transparent border-none focus:outline-none placeholder-slate-400" />
          <div className="flex items-center gap-2">
            <kbd className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">Esc</kbd>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"><X size={16} /></button>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {!query && (
            <div className="p-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Recent Searches</div>
              {RECENT_SEARCHES.map((s, i) => (
                <button key={i} onClick={() => setQuery(s)} className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors text-left">
                  <Clock size={13} className="text-slate-300 shrink-0" />
                  <span className="text-sm text-slate-600">{s}</span>
                </button>
              ))}
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 mt-4">Quick Navigate</div>
              <div className="grid grid-cols-3 gap-2">
                {[["Machines","machines",Server],["Reports","reports",FileText],["Notes","notes",BookOpen],["Departments","departments",Layers],["Notifications","notifications",Bell],["Settings","settings",Settings]].map(([label, nav, Icon]: any) => (
                  <button key={label} onClick={() => { onNavigate(nav); onClose(); }} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all text-left">
                    <Icon size={14} className="text-slate-400" /><span className="text-xs font-semibold text-slate-700">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {query && results.length === 0 && (
            <div className="p-8 text-center">
              <Search size={24} className="text-slate-200 mx-auto mb-2" />
              <div className="text-sm font-bold text-slate-600 mb-1">No results for "{query}"</div>
              <div className="text-xs text-slate-400">Try a different keyword or browse modules.</div>
            </div>
          )}

          {query && Object.entries(grouped).map(([type, items]) => {
            const Icon = typeIcon[type] || FileText;
            return (
              <div key={type}>
                <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border-y border-slate-100">{type}s</div>
                {items.map((item, i) => (
                  <button key={i} onClick={() => { onNavigate(typeNav[type] || "dashboard"); onClose(); toast.success(`Navigating to ${item.label}`); }}
                    className="flex items-center gap-3 w-full px-4 py-3 hover:bg-blue-50/50 transition-colors text-left border-b border-slate-50">
                    <div className="w-8 h-8 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center shrink-0"><Icon size={13} className="text-blue-600" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-900 truncate">{item.label}</div>
                      <div className="text-[11px] text-slate-400 truncate">{item.sub}</div>
                    </div>
                    {item.status && <span className="text-[10px] text-slate-400 shrink-0">{item.status}</span>}
                    <ChevronRight size={13} className="text-slate-300 shrink-0" />
                  </button>
                ))}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3 text-[10px] text-slate-400">
            <span className="flex items-center gap-1"><kbd className="bg-white border border-slate-200 px-1 rounded text-[9px]">↑↓</kbd> Navigate</span>
            <span className="flex items-center gap-1"><kbd className="bg-white border border-slate-200 px-1 rounded text-[9px]">↵</kbd> Open</span>
            <span className="flex items-center gap-1"><kbd className="bg-white border border-slate-200 px-1 rounded text-[9px]">Esc</kbd> Close</span>
          </div>
          <div className="text-[10px] text-slate-400">{results.length > 0 ? `${results.length} result${results.length !== 1 ? "s" : ""}` : ""}</div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// USER PROFILE
// ─────────────────────────────────────────────────────────────────────────────

function UserProfileContent() {
  const [tab, setTab] = useState<"overview" | "security" | "activity" | "tasks" | "preferences">("overview");
  const TABS = [{ id: "overview" as const, label: "Overview" }, { id: "security" as const, label: "Security" }, { id: "activity" as const, label: "Activity" }, { id: "tasks" as const, label: "My Tasks" }, { id: "preferences" as const, label: "Preferences" }];

  const myTasks = PM_DATA.filter(t => t.user === "Arjun Rao").slice(0, 4);

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
            <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">AS</div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border-2 border-white rounded-full shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors"><Edit2 size={12} className="text-slate-500" /></button>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-900">Arun Sharma</h1>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
              <span className="flex items-center gap-1"><Shield size={11} /> IT Admin</span>
              <span className="flex items-center gap-1"><Building size={11} /> IT Infrastructure</span>
              <span className="flex items-center gap-1"><Mail size={11} /> arun.sharma@rajaram.com</span>
              <span className="flex items-center gap-1"><Phone size={11} /> +91 98212 11012</span>
            </div>
            <div className="flex items-center gap-2 mt-2.5">
              <StatusChip label="Active" variant="success" />
              <span className="text-[11px] text-slate-400 font-mono">EMP-ID: RCC-EMP-2014-012</span>
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
              {[["Full Name","Arun Sharma"],["Employee ID","RCC-EMP-2014-012"],["Role","IT Admin"],["Department","IT Department"],["Email","arun.sharma@rajaram.com"],["Phone","+91 98212 11012"],["Location","Head Office – Pune"],["Date of Joining","January 15, 2014"],["Reporting To","Rakesh Malhotra (COO)"],["Manages","12 IT users"]].map(([k,v]) => (
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
              { time: "2 hours ago", title: "Generated report: Plant-Wide Machine Health", color: "bg-blue-100" },
              { time: "4 hours ago", title: "Updated machine MCH-HVAC-SR1 status to Critical", color: "bg-red-100" },
              { time: "Yesterday", title: "Completed backup audit for July 2026", color: "bg-emerald-100" },
              { time: "2 days ago", title: "Assigned PM task to Rajesh Kumar", color: "bg-amber-100" },
              { time: "3 days ago", title: "Updated Cisco Catalyst firmware documentation", color: "bg-purple-100" },
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
          <div className="px-5 py-4 border-b border-slate-100"><h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Assigned to Arjun Rao · {myTasks.length} tasks</h3></div>
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

// ─────────────────────────────────────────────────────────────────────────────
// ROLE & PERMISSION MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

function RoleManagementContent() {
  const [tab, setTab] = useState<"users" | "roles" | "matrix" | "logs">("users");
  const TABS = [{ id: "users" as const, label: "Users" }, { id: "roles" as const, label: "Roles" }, { id: "matrix" as const, label: "Permission Matrix" }, { id: "logs" as const, label: "Access Logs" }];
  const [search, setSearch] = useState("");

  const filteredEmployees = EMPLOYEES.filter(e => !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.employeeId.toLowerCase().includes(search.toLowerCase()));

  const MODULES = ["Dashboard","Machines","Maintenance","QA","Backup","Departments","Reports","Notifications","Notes","Settings","Admin"];
  const ROLE_PERMS: Record<string, string[]> = {
    "Super Admin": MODULES,
    "IT Admin": ["Dashboard","Machines","Maintenance","Backup","Departments","Reports","Notifications","Notes","Settings"],
    "Department Head": ["Dashboard","Machines","Maintenance","QA","Departments","Reports","Notifications","Notes"],
    "User": ["Dashboard","Machines","Maintenance","QA","Reports","Notifications"],
    "QA Inspector": ["Dashboard","QA","Reports","Notifications"],
    "Viewer": ["Dashboard","Reports"],
  };

  const ROLES_LIST = Object.keys(ROLE_PERMS);

  const ACCESS_LOGS = [
    { user: "Arun Sharma", action: "Login", resource: "Portal", time: "2026-07-03 09:12:04", result: "Success" },
    { user: "Vikram Singh", action: "View", resource: "Machine MCH-HVAC-SR1", time: "2026-07-03 10:02:11", result: "Success" },
    { user: "Unknown", action: "Login failed", resource: "Portal", time: "2026-07-03 10:30:00", result: "Failed" },
    { user: "Arjun Rao", action: "Edit", resource: "Backup BK-2003", time: "2026-07-03 11:15:22", result: "Success" },
    { user: "Priya Nair", action: "Export", resource: "QA Report", time: "2026-07-03 13:44:10", result: "Success" },
    { user: "Anita Desai", action: "Delete", resource: "Note NOTE-004", time: "2026-07-02 16:20:55", result: "Denied" },
  ];

  return (
    <div className="w-full max-w-[1600px] mx-auto animate-in fade-in duration-300">
      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-2">
          <Settings size={12} /><span>Settings</span><ChevronRight size={12} /><span className="text-slate-700 font-semibold">User & Role Management</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm shadow-blue-200"><ShieldCheck size={20} className="text-white" /></div>
            <div><h1 className="text-xl font-bold text-slate-900 tracking-tight">User & Role Management</h1><p className="text-xs text-slate-500 mt-0.5">{EMPLOYEES.length} users · {ROLES_LIST.length} roles</p></div>
          </div>
          <button onClick={() => toast.success("Invite sent!")} className="flex items-center gap-1.5 h-9 px-4 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"><UserPlus size={13} /> Invite User</button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-5">
        <div className="flex overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`px-5 py-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${tab === t.id ? "border-blue-600 text-blue-600 bg-blue-50/50" : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}>{t.label}</button>
          ))}
        </div>
      </div>

      {tab === "users" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative w-72">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="w-full h-9 pl-9 pr-4 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-400" />
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-slate-50/70 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr><th className="px-5 py-3">User</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Department</th><th className="px-4 py-3">Employee ID</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${emp.avatarColor}`}>{emp.initials}</div>
                        <div><div className="text-xs font-bold text-slate-900">{emp.name}</div><div className="text-[10px] text-slate-400">{emp.email}</div></div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600">{emp.role.split(" ").slice(-2).join(" ")}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-600">{emp.department}</td>
                    <td className="px-4 py-3.5 text-xs font-mono text-slate-500">{emp.employeeId}</td>
                    <td className="px-4 py-3.5"><StatusChip label={emp.status} variant={emp.status === "Active" ? "success" : emp.status === "On Leave" ? "warning" : "neutral"} /></td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"><Edit2 size={13} /></button>
                        <button onClick={() => toast.error("User deactivated.")} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"><UserX size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "roles" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ROLES_LIST.map(role => (
            <div key={role} className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-blue-600" />
                  <span className="text-sm font-bold text-slate-900">{role}</span>
                </div>
                <div className="flex gap-1.5">
                  <button className="h-7 px-2.5 text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"><Edit2 size={11} /></button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {ROLE_PERMS[role].map(p => <span key={p} className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded font-medium">{p}</span>)}
              </div>
              <div className="mt-3 text-[10px] text-slate-400">{EMPLOYEES.length > 0 ? Math.floor(Math.random() * 6 + 1) : 0} users assigned</div>
            </div>
          ))}
        </div>
      )}

      {tab === "matrix" && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider sticky left-0 bg-slate-50">Module</th>
                  {ROLES_LIST.map(r => <th key={r} className="px-3 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center whitespace-nowrap">{r.replace(" ", " ")}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {MODULES.map(mod => (
                  <tr key={mod} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-2.5 text-xs font-semibold text-slate-900 sticky left-0 bg-white">{mod}</td>
                    {ROLES_LIST.map(role => (
                      <td key={role} className="px-3 py-2.5 text-center">
                        {ROLE_PERMS[role].includes(mod)
                          ? <CheckCircle2 size={14} className="text-emerald-500 mx-auto" />
                          : <div className="w-3.5 h-3.5 rounded-full bg-slate-100 mx-auto" />}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "logs" && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50/70 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <tr><th className="px-5 py-3">User</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Resource</th><th className="px-4 py-3">Timestamp</th><th className="px-4 py-3">Result</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ACCESS_LOGS.map((log, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 text-xs font-semibold text-slate-900">{log.user}</td>
                  <td className="px-4 py-3.5 text-xs text-slate-600">{log.action}</td>
                  <td className="px-4 py-3.5 text-xs text-slate-500">{log.resource}</td>
                  <td className="px-4 py-3.5 text-xs font-mono text-slate-400">{log.time}</td>
                  <td className="px-4 py-3.5"><StatusChip label={log.result} variant={log.result === "Success" ? "success" : log.result === "Failed" ? "error" : "warning"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HELP CENTER
// ─────────────────────────────────────────────────────────────────────────────

function HelpCenterContent() {
  const [tab, setTab] = useState<"faq" | "docs" | "tickets" | "status" | "releases">("faq");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const TABS = [{ id: "faq" as const, label: "FAQ" }, { id: "docs" as const, label: "Documentation" }, { id: "tickets" as const, label: "Support Tickets" }, { id: "status" as const, label: "System Status" }, { id: "releases" as const, label: "Release Notes" }];

  const FAQS = [
    { q: "How do I schedule a preventive maintenance task?", a: "Navigate to Preventive Maintenance from the sidebar, click 'Add PM', fill in the machine, department, frequency and due date, and assign an user. The task will appear in the schedule and the user will be notified." },
    { q: "How do I generate a custom report?", a: "Go to Reports Center from the sidebar, click 'New Report', then use the 4-step Custom Report Builder to choose your category, date range, departments, output format and delivery schedule." },
    { q: "How are machine health scores calculated?", a: "Health scores (0-100) are derived from a combination of: last maintenance status, outstanding alerts, operational uptime, sensor readings (temperature, CPU, memory), and days since last PM relative to the scheduled frequency." },
    { q: "What does 'Under Maintenance' status mean for a machine?", a: "It means the machine is currently powered down and has an active maintenance task in progress. It will not appear in live monitoring as actively operating. Update the status once the task is complete." },
    { q: "How do I export data from the portal?", a: "Most modules have an 'Export' button in the top-right toolbar. Reports can be exported as PDF or Excel. Table data can typically be exported as CSV. Go to Settings > Import/Export for full data dumps." },
    { q: "How do I add a new machine to the inventory?", a: "Navigate to Machines > Machine Inventory and click 'Add Machine'. Fill in all required fields including Machine ID, Department, Location, Assigned User, and purchase/warranty dates." },
    { q: "Can I receive alerts when a backup fails?", a: "Yes. Go to Settings > Backup Settings and enable 'Email on failure'. You can also configure Notification Preferences to receive in-app and SMS alerts for backup failures." },
    { q: "How do I reset my password?", a: "You can change your password from Settings > Security, or from My Profile > Security tab. If locked out, contact your IT administrator to reset your credentials." },
  ];

  const DOCS = [
    { title: "Quick Start Guide", category: "Getting Started", pages: 12, updated: "2026-07-01" },
    { title: "Preventive Maintenance Module – User Manual", category: "Modules", pages: 28, updated: "2026-06-15" },
    { title: "Backup Activities Setup & Configuration", category: "Modules", pages: 18, updated: "2026-06-10" },
    { title: "QA Activities & Inspection Workflows", category: "Modules", pages: 22, updated: "2026-05-28" },
    { title: "Machine Management & Asset Register", category: "Modules", pages: 35, updated: "2026-07-01" },
    { title: "Reports Center & Custom Report Builder", category: "Modules", pages: 20, updated: "2026-07-01" },
    { title: "User & Role Administration Guide", category: "HR & Admin", pages: 15, updated: "2026-06-01" },
    { title: "API Integration Reference", category: "Developer", pages: 48, updated: "2026-05-15" },
    { title: "Data Import & Export Guide", category: "HR & Admin", pages: 10, updated: "2026-06-20" },
    { title: "Troubleshooting Common Issues", category: "Support", pages: 24, updated: "2026-07-02" },
  ];

  const TICKETS = [
    { id: "TKT-001", subject: "Backup BK-2005 failure - VMware ESXi", priority: "High", status: "Open", created: "2026-07-03", assignee: "Support Team" },
    { id: "TKT-002", subject: "HVAC sensor data not updating in portal", priority: "Critical", status: "In Progress", created: "2026-07-02", assignee: "Vikram Singh" },
    { id: "TKT-003", subject: "Custom report builder - date filter bug", priority: "Medium", status: "Resolved", created: "2026-06-28", assignee: "Dev Team" },
    { id: "TKT-004", subject: "Password reset for Ganesh Murthy", priority: "Low", status: "Resolved", created: "2026-06-25", assignee: "IT Admin" },
  ];

  const SERVICES = [
    { name: "Portal Application", status: "Operational", uptime: "99.97%" },
    { name: "Database (PostgreSQL)", status: "Operational", uptime: "99.99%" },
    { name: "Backup Service", status: "Degraded", uptime: "98.40%" },
    { name: "Email Notifications", status: "Operational", uptime: "99.85%" },
    { name: "Machine Heartbeat API", status: "Operational", uptime: "99.92%" },
    { name: "Report Generation Engine", status: "Operational", uptime: "99.78%" },
  ];

  return (
    <div className="w-full max-w-[1600px] mx-auto animate-in fade-in duration-300">
      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-2">
          <LayoutDashboard size={12} /><span>Dashboard</span><ChevronRight size={12} /><span className="text-slate-700 font-semibold">Help Center</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm shadow-blue-200"><HelpCircle size={20} className="text-white" /></div>
            <div><h1 className="text-xl font-bold text-slate-900 tracking-tight">Help Center</h1><p className="text-xs text-slate-500 mt-0.5">Documentation, FAQs, support and system status</p></div>
          </div>
          <button onClick={() => toast.success("Support ticket created!")} className="flex items-center gap-1.5 h-9 px-4 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"><MessageSquare size={13} /> New Support Ticket</button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-5">
        <div className="flex overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`px-5 py-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${tab === t.id ? "border-blue-600 text-blue-600 bg-blue-50/50" : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}>{t.label}</button>
          ))}
        </div>
      </div>

      {tab === "faq" && (
        <div className="max-w-3xl space-y-2">
          {FAQS.map((faq, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <button className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span className="text-sm font-semibold text-slate-900 pr-4">{faq.q}</span>
                {openFaq === i ? <ChevronUp size={16} className="text-blue-600 shrink-0" /> : <ChevronDown size={16} className="text-slate-400 shrink-0" />}
              </button>
              {openFaq === i && <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">{faq.a}</div>}
            </div>
          ))}
        </div>
      )}

      {tab === "docs" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {DOCS.map((doc, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center shrink-0"><BookOpen size={18} className="text-blue-600" /></div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-900 mb-1">{doc.title}</div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded font-medium text-slate-600">{doc.category}</span>
                  <span>{doc.pages} pages</span><span>·</span><span>Updated {doc.updated}</span>
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button className="h-7 px-2.5 text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"><Eye size={11} /></button>
                <button onClick={() => toast.success("Downloading...")} className="h-7 px-2.5 text-[11px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"><Download size={11} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "tickets" && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-slate-50/70 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr><th className="px-5 py-3">Ticket</th><th className="px-4 py-3">Priority</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Assignee</th><th className="px-4 py-3">Created</th><th className="px-4 py-3 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {TICKETS.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="text-xs font-bold text-slate-900">{t.subject}</div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">{t.id}</div>
                    </td>
                    <td className="px-4 py-3.5"><StatusChip label={t.priority} variant={t.priority === "Critical" ? "error" : t.priority === "High" ? "warning" : t.priority === "Medium" ? "info" : "neutral"} /></td>
                    <td className="px-4 py-3.5"><StatusChip label={t.status} variant={t.status === "Resolved" ? "success" : t.status === "In Progress" ? "info" : "warning"} /></td>
                    <td className="px-4 py-3.5 text-xs text-slate-600">{t.assignee}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">{t.created}</td>
                    <td className="px-4 py-3.5 text-right">
                      <button className="h-7 px-2.5 text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "status" && (
        <div className="max-w-2xl space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
            <div><div className="text-sm font-bold text-emerald-900">All Core Systems Operational</div><div className="text-xs text-emerald-700 mt-0.5">Last checked: July 3, 2026 at 10:00 IST</div></div>
          </div>
          {SERVICES.map((s, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${s.status === "Operational" ? "bg-emerald-500" : s.status === "Degraded" ? "bg-amber-500" : "bg-red-500"}`} />
                <span className="text-sm font-semibold text-slate-900">{s.name}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="font-mono">{s.uptime} uptime (30d)</span>
                <StatusChip label={s.status} variant={s.status === "Operational" ? "success" : s.status === "Degraded" ? "warning" : "error"} />
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "releases" && (
        <div className="max-w-2xl space-y-4">
          {[
            { version: "7.0.0", date: "July 1, 2026", highlights: ["Machines Management Module launched","Departments Module with full team management","Asset Analytics & QR Code generation","Machine Floor Map with real-time status"] },
            { version: "6.5.0", date: "April 10, 2026", highlights: ["QA Activities Module with full inspection workflow","Backup Activities dashboard redesign","Advanced filter engine for all tables","Scheduled report delivery via email"] },
            { version: "6.0.0", date: "January 5, 2026", highlights: ["Preventive Maintenance calendar view","Multi-department performance dashboard","API key management","Dark mode (beta)"] },
          ].map((r, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">v{r.version}</span>
                  {i === 0 && <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded">Latest</span>}
                </div>
                <span className="text-xs text-slate-400">{r.date}</span>
              </div>
              <ul className="space-y-1.5">
                {r.highlights.map((h, j) => (
                  <li key={j} className="flex items-start gap-2 text-xs text-slate-600"><CheckCircle2 size={12} className="text-emerald-500 mt-0.5 shrink-0" />{h}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── SHELL ────────────────────────────────────────────────────────────────────

function DashboardApp({
  onLogout,
  initialRoutePath,
}: {
  onLogout: () => void;
  initialRoutePath?: string;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [activeNav, setActiveNav] = useState(() => {
    const path = initialRoutePath ?? "";
    if (path.startsWith("/preventive-maintenance")) return "maintenance";
    if (path.startsWith("/backup-activities")) return "backup";
    if (path.startsWith("/qa-activities")) return "qa";
    if (path.startsWith("/system-inventory")) return "machines";
    if (path.startsWith("/departments")) return "departments";
    if (path.startsWith("/reports")) return "reports";
    if (path.startsWith("/notifications")) return "notifications";
    if (path.startsWith("/notes")) return "notes";
    if (path.startsWith("/settings")) return "settings";
    return "dashboard";
  });
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);



  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 1024) setIsMobileDrawerOpen(false); };
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setIsSearchOpen(o => !o); }
      if (e.key === "Escape") setIsSearchOpen(false);
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleKey);
    return () => { window.removeEventListener("resize", handleResize); window.removeEventListener("keydown", handleKey); };
  }, []);

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden w-full">
      {/* SIDEBAR */}
      <aside className={`hidden lg:flex flex-col bg-white border-r border-slate-200 transition-all duration-300 z-20 ${isSidebarCollapsed ? "w-[68px]" : "w-64"}`}>
        <div className="flex items-center h-16 px-4 border-b border-slate-100 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <Monitor size={16} className="text-white" />
          </div>
          {!isSidebarCollapsed && (
            <div className="ml-3 overflow-hidden whitespace-nowrap">
              <div className="text-sm font-bold text-slate-900 tracking-tight">RCC OMP</div>
              <div className="text-[10px] text-slate-400 tracking-wider font-semibold">PORTAL</div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          {!isSidebarCollapsed && <div className="text-[10px] font-bold text-slate-400 tracking-widest px-5 mb-2">MAIN MENU</div>}
          <nav className="px-3 space-y-0.5">
            {NAV_ITEMS.map(item => {
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id)}
                  className={`w-full flex items-center h-10 px-2 rounded-lg transition-colors group relative ${isActive ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                  title={isSidebarCollapsed ? item.label : undefined}
                >
                  <item.icon size={18} className={`shrink-0 ${isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}`} />
                  {!isSidebarCollapsed && <span className={`ml-3 text-sm font-medium ${isActive ? "font-semibold" : ""}`}>{item.label}</span>}
                  {!isSidebarCollapsed && item.badge && (
                    <span className="ml-auto bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{item.badge}</span>
                  )}
                  {isActive && <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-blue-600" />}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-3 border-t border-slate-100 shrink-0">
          <button onClick={onLogout} className="w-full flex items-center h-10 px-2 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors" title={isSidebarCollapsed ? "Logout" : undefined}>
            <LogOut size={18} className="shrink-0" />
            {!isSidebarCollapsed && <span className="ml-3 text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* MOBILE DRAWER */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsMobileDrawerOpen(false)} />
          <div className="absolute top-0 left-0 bottom-0 w-64 bg-white flex flex-col shadow-2xl">
            <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                  <Monitor size={16} className="text-white" />
                </div>
                <div className="ml-3">
                  <div className="text-sm font-bold text-slate-900 tracking-tight">RCC OMP</div>
                </div>
              </div>
              <button onClick={() => setIsMobileDrawerOpen(false)} className="p-1 text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
              <div className="text-[10px] font-bold text-slate-400 tracking-widest px-5 mb-2">MAIN MENU</div>
              <nav className="px-3 space-y-1">
                {NAV_ITEMS.map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveNav(item.id); setIsMobileDrawerOpen(false); }}
                    className={`w-full flex items-center h-10 px-3 rounded-lg transition-colors ${activeNav === item.id ? "bg-blue-50 text-blue-600 font-semibold" : "text-slate-600 hover:bg-slate-50 font-medium"}`}
                  >
                    <item.icon size={18} className={activeNav === item.id ? "text-blue-600" : "text-slate-400"} />
                    <span className="ml-3 text-sm">{item.label}</span>
                    {item.badge && <span className="ml-auto bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{item.badge}</span>}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        {/* TOP NAV */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 lg:px-6 flex items-center justify-between shrink-0 z-10 shadow-sm">
          <div className="flex items-center flex-1 gap-4">
            <button className="lg:hidden p-1 text-slate-500 hover:text-slate-900" onClick={() => setIsMobileDrawerOpen(true)}>
              <Menu size={20} />
            </button>
            <button className="hidden lg:flex p-1.5 text-slate-400 hover:bg-slate-100 rounded-md transition-colors" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
              {isSidebarCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
            </button>
            <button onClick={() => setIsSearchOpen(true)} className="hidden sm:flex items-center gap-2 w-64 max-w-md h-9 pl-3 pr-3 text-sm bg-slate-50 border border-slate-200 rounded-lg hover:border-blue-400 hover:bg-white transition-all text-slate-400">
              <Search size={15} className="shrink-0" />
              <span className="flex-1 text-left text-sm">Search everywhere...</span>
              <kbd className="text-[10px] font-bold bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded border border-slate-300 shrink-0">⌘K</kbd>
            </button>
          </div>

          <div className="flex items-center gap-3 lg:gap-5">
            <div className="hidden md:block text-xs font-medium text-slate-500">
              {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </div>
            <button onClick={() => setActiveNav("notifications")} className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="w-px h-6 bg-slate-200 hidden sm:block" />
            <div className="relative">
              <button className="flex items-center gap-2 lg:gap-3 p-1 rounded-lg hover:bg-slate-50 transition-colors" onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}>
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold shrink-0">AS</div>
                <div className="hidden lg:block text-left">
                  <div className="text-sm font-semibold text-slate-900 leading-tight">Arun Sharma</div>
                  <div className="text-[11px] text-slate-500 font-medium">IT Admin</div>
                </div>
                <ChevronDown size={14} className="text-slate-400 hidden lg:block" />
              </button>
              {isProfileMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <div className="text-sm font-bold text-slate-900">Arun Sharma</div>
                      <div className="text-xs text-slate-500">arun.sharma@rajaram.com</div>
                    </div>
                    <div className="py-1">
                      <button onClick={() => { setActiveNav("profile"); setIsProfileMenuOpen(false); }} className="w-full px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2"><User size={14} /> My Profile</button>
                      <button onClick={() => { setActiveNav("settings"); setIsProfileMenuOpen(false); }} className="w-full px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2"><Settings size={14} /> Preferences</button>
                      <button onClick={() => { setActiveNav("help"); setIsProfileMenuOpen(false); }} className="w-full px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2"><HelpCircle size={14} /> Help Center</button>
                      <button onClick={() => { setActiveNav("admin"); setIsProfileMenuOpen(false); }} className="w-full px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2"><ShieldCheck size={14} /> User Management</button>
                    </div>
                    <div className="py-1 border-t border-slate-100">
                      <button onClick={onLogout} className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><LogOut size={14} /> Sign Out</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 lg:p-6 xl:p-8 flex flex-col">
            {activeNav === "dashboard"   && <DashboardPage />}
            {activeNav === "maintenance" && <PreventiveMaintenancePage />}
            {activeNav === "backup"      && <BackupActivitiesPage />}
            {activeNav === "qa"          && <QAPage />}
{activeNav === "machines"     && <SystemInventoryPage />}
            {activeNav === "departments"  && <DepartmentsPage />}
            {activeNav === "reports"      && <ReportsPage />}
            {activeNav === "notifications"&& <NotificationsPage />}
            {activeNav === "notes"        && <NotesPage />}
            {activeNav === "settings"     && <SettingsPage />}
            {activeNav === "profile"      && <UserProfileContent />}
            {activeNav === "admin"        && <RoleManagementContent />}
            {activeNav === "help"         && <HelpCenterContent />}
            {!["dashboard","maintenance","backup","qa","machines","departments","reports","notifications","notes","settings","profile","admin","help"].includes(activeNav) && (
              <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm p-8 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4"><LayoutDashboard size={24} className="text-blue-600" /></div>
                <h2 className="text-lg font-bold text-slate-900">{NAV_ITEMS.find(n => n.id === activeNav)?.label}</h2>
                <p className="text-sm text-slate-500 max-w-sm mt-2">This module is under development.</p>
              </div>
            )}

            {isSearchOpen && <GlobalSearchOverlay onClose={() => setIsSearchOpen(false)} onNavigate={(nav) => setActiveNav(nav)} />}
            <footer className="mt-8 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs font-medium text-slate-400 gap-2">
              <div>© 2026 Rajaram Consumer Care Pvt. Ltd.</div>
              <div className="flex items-center gap-4">
                <span className="bg-slate-200/50 text-slate-500 px-2 py-0.5 rounded-md">Internal Use Only</span>
                <span>RCC OMP v7.0.0</span>
              </div>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────

function AuthHeader() {
  return (
    <div className="flex justify-center mb-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
          <Monitor size={20} className="text-white" />
        </div>
        <div className="text-left">
          <div className="text-xl font-bold text-slate-900 tracking-tight leading-none">RCC OMP</div>
          <div className="text-[10px] text-slate-500 tracking-widest font-bold mt-0.5">PORTAL</div>
        </div>
      </div>
    </div>
  );
}

function AuthContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 font-sans">
      <AuthHeader />
      <div className="w-full max-w-[420px] bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 p-8 sm:p-10 relative overflow-hidden">
        {children}
      </div>
      <footer className="mt-12 text-center text-xs text-slate-500 font-medium">
        © 2026 Rajaram Consumer Care Pvt. Ltd.<br />Internal Use Only
      </footer>
    </div>
  );
}

function InputField({ label, type = "text", placeholder, icon: Icon }: any) {
  return (
    <div className="mb-4">
      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">{label}</label>
      <div className="relative">
        {Icon && <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />}
        <input
          type={type}
          placeholder={placeholder}
          className={`w-full h-11 ${Icon ? "pl-10" : "pl-3"} pr-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-400`}
        />
      </div>
    </div>
  );
}

function LoginView({ onNavigate, onLogin }: any) {
  return (
    <AuthContainer>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome Back</h1>
        <p className="text-sm text-slate-500 mt-2">Sign in to your enterprise account.</p>
      </div>
      <form onSubmit={e => { e.preventDefault(); onLogin(); }}>
        <InputField label="Email" type="email" placeholder="name@rajaram.com" icon={Mail} />
        <InputField label="Password" type="password" placeholder="••••••••" icon={Lock} />
        <div className="flex items-center justify-between mb-6">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 focus:ring-2" />
            <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Remember me</span>
          </label>
          <button type="button" onClick={() => onNavigate("forgot")} className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">Forgot Password?</button>
        </div>
        <button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center">Login to Portal</button>
      </form>
      <div className="mt-8 text-center">
        <span className="text-sm text-slate-500">Don't have an account? </span>
        <button type="button" onClick={() => onNavigate("signup")} className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">Create Account</button>
      </div>
    </AuthContainer>
  );
}

function SignUpView({ onNavigate }: any) {
  return (
    <AuthContainer>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create Account</h1>
        <p className="text-sm text-slate-500 mt-2">Request access to the Operations Portal.</p>
      </div>
      <form onSubmit={e => { e.preventDefault(); onNavigate("login"); }}>
        <InputField label="Full Name" placeholder="e.g. Arun Sharma" icon={User} />
        <InputField label="Official Company Email" type="email" placeholder="name@rajaram.com" icon={Mail} />
        <InputField label="Employee ID" placeholder="e.g. EMP-2024-089" icon={CheckSquare} />
        <InputField label="Password" type="password" placeholder="Create a strong password" icon={Lock} />
        <InputField label="Confirm Password" type="password" placeholder="Confirm your password" icon={Lock} />
        <button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center mt-6">Submit Request</button>
      </form>
      <div className="mt-8 text-center">
        <span className="text-sm text-slate-500">Already have an account? </span>
        <button type="button" onClick={() => onNavigate("login")} className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">Log in</button>
      </div>
    </AuthContainer>
  );
}

function ForgotView({ onNavigate }: any) {
  return (
    <AuthContainer>
      <button onClick={() => onNavigate("login")} className="absolute top-6 left-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
        <ArrowLeft size={18} />
      </button>
      <div className="text-center mb-8 mt-2">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reset Password</h1>
        <p className="text-sm text-slate-500 mt-2">Enter your official email to receive a secure reset link.</p>
      </div>
      <form onSubmit={e => { e.preventDefault(); onNavigate("reset"); }}>
        <InputField label="Official Email" type="email" placeholder="name@rajaram.com" icon={Mail} />
        <button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center mt-2">Send Reset Link</button>
      </form>
      <div className="mt-8 text-center">
        <button type="button" onClick={() => onNavigate("login")} className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors flex items-center justify-center gap-2 mx-auto">Back to Login</button>
      </div>
    </AuthContainer>
  );
}

function ResetView({ onNavigate }: any) {
  return (
    <AuthContainer>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Set New Password</h1>
        <p className="text-sm text-slate-500 mt-2">Please create a strong password for your account.</p>
      </div>
      <form onSubmit={e => { e.preventDefault(); onNavigate("login"); }}>
        <InputField label="New Password" type="password" placeholder="••••••••" icon={Lock} />
        <div className="mb-5 -mt-1">
          <div className="flex items-center gap-1 mb-1.5">
            <div className="h-1.5 flex-1 rounded-full bg-blue-600" />
            <div className="h-1.5 flex-1 rounded-full bg-blue-600" />
            <div className="h-1.5 flex-1 rounded-full bg-slate-200" />
          </div>
          <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            <Check size={12} className="text-blue-600" /> Good strength
          </div>
        </div>
        <InputField label="Confirm Password" type="password" placeholder="••••••••" icon={Lock} />
        <button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center mt-6">Update Password</button>
      </form>
    </AuthContainer>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

type ViewState = "login" | "signup" | "forgot" | "reset" | "app";

import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router";
import LoginPage from "../pages/LoginPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import RegisterPage from "../pages/RegisterPage";
import { AuthProvider } from "../auth/AuthProvider";
import { ProtectedRoute } from "../auth/ProtectedRoute";
import { logout as logoutAuth } from "../auth/auth";
import { useNavigate } from "react-router";


function LogoutAndRedirect({ closeProfileDropdown }: { closeProfileDropdown?: () => void }) {
  const navigate = useNavigate();

  const onLogout = () => {
    logoutAuth();
    try {
      sessionStorage.clear();
    } catch {
      // ignore
    }

    closeProfileDropdown?.();
    navigate("/login", { replace: true });
  };

  const location = useLocation();

  return (
    <DashboardApp
      onLogout={onLogout}
      initialRoutePath={location.pathname}
    />
  );
}




export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="bottom-right" richColors closeButton toastOptions={{ duration: 3000 }} />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <LogoutAndRedirect />
              </ProtectedRoute>
            }
          />



          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/register" element={<RegisterPage />} />


          <Route
            path="/preventive-maintenance"
            element={
              <ProtectedRoute>
                <PreventiveMaintenancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/backup-activities"
            element={
              <ProtectedRoute>
                <BackupActivitiesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/qa-activities"
            element={
              <ProtectedRoute>
                <QAPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/system-inventory"
            element={
              <ProtectedRoute>
                <SystemInventoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/departments"
            element={
              <ProtectedRoute>
                <DepartmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notes"
            element={
              <ProtectedRoute>
                <NotesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>

      </BrowserRouter>
    </AuthProvider>
  );
}

