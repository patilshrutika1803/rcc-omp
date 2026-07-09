// ─────────────────────────────────────────────────────────────────────────────
// NotificationsPage
// Extracted from the original monolithic App.tsx (RCC OMP).
// Behavior, styling and Tailwind classes are unchanged from the original.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import {
  LayoutDashboard,
  Archive,
  Server,
  Search,
  Bell,
  ChevronRight,
  CheckCircle2,
  Info,
  AlertTriangle,
  SlidersHorizontal,
  Trash2
} from "lucide-react";
import { toast } from "sonner";


// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATIONS MODULE
// ─────────────────────────────────────────────────────────────────────────────

interface Notification {
  id: string; title: string; message: string; category: "maintenance" | "qa" | "backup" | "machine" | "department" | "system";
  severity: "critical" | "warning" | "info" | "success"; time: string; read: boolean; archived: boolean;
}

const ALL_NOTIFICATIONS: Notification[] = [
  { id: "N-001", title: "Critical: HVAC Coolant Leak", message: "Server Room HVAC unit MCH-HVAC-SR1 is reporting a critical coolant leak. Server room temperature is rising rapidly. Immediate action required.", category: "machine", severity: "critical", time: "20 min ago", read: false, archived: false },
  { id: "N-002", title: "Critical: Water Treatment Overdue", message: "Water Treatment Plant MCH-WTP-001 maintenance is overdue by 18 days. TDS levels elevated at 450 ppm. Escalated to management.", category: "maintenance", severity: "critical", time: "1 hour ago", read: false, archived: false },
  { id: "N-003", title: "VMware ESXi Snapshot Backup Failed", message: "Scheduled snapshot backup BK-2005 for VMH-ESX-001 failed at 04:00. 0 GB transferred. Retry scheduled for 06:00.", category: "backup", severity: "warning", time: "2 hours ago", read: false, archived: false },
  { id: "N-004", title: "Air Compressor: High Oil Temperature", message: "Air Compressor MCH-ACP-003 oil temperature elevated to 68°C (limit: 65°C). Maintenance overdue by 5 days.", category: "machine", severity: "warning", time: "15 min ago", read: false, archived: false },
  { id: "N-005", title: "PM Task Due Today: Filling Machine", message: "Preventive maintenance PM-2041 for Filling Machine Line A is due today. Assigned to Rajesh Kumar.", category: "maintenance", severity: "info", time: "3 hours ago", read: true, archived: false },
  { id: "N-006", title: "QA Inspection Passed: Batch B-1441", message: "Quality inspection for batch B-1441 passed all parameters. Cleared for dispatch by Deepa Iyer.", category: "qa", severity: "success", time: "4 hours ago", read: true, archived: false },
  { id: "N-007", title: "ERP Backup Completed Successfully", message: "Full backup BK-2001 for SRV-ERP-001 completed. 245 GB transferred in 1h 23m. Recovery points: 28.", category: "backup", severity: "success", time: "5 hours ago", read: true, archived: false },
  { id: "N-008", title: "Chiller Unit Maintenance Overdue", message: "Chiller Unit MCH-CHL-PH1 maintenance is 8 days overdue. Refrigerant pressure below optimal range.", category: "maintenance", severity: "warning", time: "8 days ago", read: true, archived: false },
  { id: "N-009", title: "Engineering Department Under Review", message: "Engineering Department performance review scheduled for 2026-07-08 with COO Office. Please prepare KPI summary.", category: "department", severity: "info", time: "1 day ago", read: true, archived: false },
  { id: "N-010", title: "CNC Lathe Machine Offline", message: "CNC Lathe Machine MCH-CNC-001 went offline 2 days ago due to power failure. Spindle drive fault detected.", category: "machine", severity: "critical", time: "2 days ago", read: false, archived: false },
  { id: "N-011", title: "Firmware Update Available: Cisco Switch", message: "New firmware IOS-XE 17.10.1 available for Cisco Catalyst 9500 (MCH-NSW-DC1). Scheduled maintenance window required.", category: "system", severity: "info", time: "1 day ago", read: true, archived: false },
  { id: "N-012", title: "Monthly KPI Review Reminder", message: "Monthly KPI Review for Production department is scheduled for 2026-07-10. Please ensure dashboards are updated.", category: "department", severity: "info", time: "6 hours ago", read: false, archived: false },
  { id: "N-013", title: "QA Audit Scheduled: GMP Compliance", message: "GMP Compliance Audit for Quality Control department scheduled for 2026-07-15 by Regulatory Team.", category: "qa", severity: "info", time: "2 days ago", read: true, archived: false },
  { id: "N-014", title: "System: Storage Utilization at 61%", message: "Backup storage pool NAS-BACKUP-01 is at 61% capacity (1,210 GB of 2,000 GB). Consider expanding capacity.", category: "system", severity: "info", time: "3 hours ago", read: true, archived: false },
  { id: "N-015", title: "Resource Conflict: July 12th", message: "Meena Pillai is double-booked on July 12: HVAC critical repair and Chiller PM overlap. Please reschedule.", category: "department", severity: "warning", time: "5 hours ago", read: false, archived: false },
];

function NotifIcon({ severity }: { severity: Notification["severity"] }) {
  if (severity === "critical") return <div className="w-9 h-9 bg-red-50 border border-red-200 rounded-xl flex items-center justify-center shrink-0"><AlertTriangle size={16} className="text-red-600" /></div>;
  if (severity === "warning") return <div className="w-9 h-9 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-center shrink-0"><AlertTriangle size={16} className="text-amber-600" /></div>;
  if (severity === "success") return <div className="w-9 h-9 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center shrink-0"><CheckCircle2 size={16} className="text-emerald-600" /></div>;
  return <div className="w-9 h-9 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center shrink-0"><Info size={16} className="text-blue-600" /></div>;
}

function NotifCard({ n, onRead, onDelete, onArchive }: { n: Notification; onRead: () => void; onDelete: () => void; onArchive: () => void }) {
  const borderColor = n.severity === "critical" ? "border-l-red-500" : n.severity === "warning" ? "border-l-amber-500" : n.severity === "success" ? "border-l-emerald-500" : "border-l-blue-500";
  return (
    <div className={`bg-white border border-slate-200 border-l-4 ${borderColor} rounded-xl shadow-sm p-4 hover:shadow-md transition-all ${!n.read ? "bg-blue-50/20" : ""}`}>
      <div className="flex items-start gap-3">
        <NotifIcon severity={n.severity} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className={`text-xs font-bold ${!n.read ? "text-slate-900" : "text-slate-700"}`}>{n.title}</div>
            <div className="flex items-center gap-1 shrink-0">
              {!n.read && <span className="w-2 h-2 rounded-full bg-blue-600" />}
              <span className="text-[10px] text-slate-400">{n.time}</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed mb-2">{n.message}</p>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded capitalize ${n.severity === "critical" ? "bg-red-50 text-red-600" : n.severity === "warning" ? "bg-amber-50 text-amber-600" : n.severity === "success" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"}`}>{n.severity}</span>
            <span className="text-[10px] text-slate-400 capitalize">{n.category}</span>
            <div className="ml-auto flex items-center gap-1">
              {!n.read && <button onClick={onRead} className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 transition-colors">Mark read</button>}
              <button onClick={onArchive} className="p-1 text-slate-300 hover:text-slate-500 rounded transition-colors"><Archive size={12} /></button>
              <button onClick={onDelete} className="p-1 text-slate-300 hover:text-red-500 rounded transition-colors"><Trash2 size={12} /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(ALL_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");

  const markRead = (id: string) => setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => { setNotifications(ns => ns.map(n => ({ ...n, read: true }))); toast.success("All notifications marked as read."); };
  const deleteNotif = (id: string) => { setNotifications(ns => ns.filter(n => n.id !== id)); toast.error("Notification deleted."); };
  const archiveNotif = (id: string) => { setNotifications(ns => ns.map(n => n.id === id ? { ...n, archived: true } : n)); toast.success("Archived."); };

  const filters = [
    { id: "all", label: "All", count: notifications.filter(n => !n.archived).length },
    { id: "unread", label: "Unread", count: notifications.filter(n => !n.read && !n.archived).length },
    { id: "critical", label: "Critical", count: notifications.filter(n => n.severity === "critical" && !n.archived).length },
    { id: "warning", label: "Warnings", count: notifications.filter(n => n.severity === "warning" && !n.archived).length },
    { id: "maintenance", label: "Maintenance", count: notifications.filter(n => n.category === "maintenance" && !n.archived).length },
    { id: "qa", label: "QA", count: notifications.filter(n => n.category === "qa" && !n.archived).length },
    { id: "backup", label: "Backup", count: notifications.filter(n => n.category === "backup" && !n.archived).length },
    { id: "machine", label: "Machine", count: notifications.filter(n => n.category === "machine" && !n.archived).length },
    { id: "department", label: "Department", count: notifications.filter(n => n.category === "department" && !n.archived).length },
    { id: "system", label: "System", count: notifications.filter(n => n.category === "system" && !n.archived).length },
    { id: "archived", label: "Archived", count: notifications.filter(n => n.archived).length },
  ];

  const displayed = notifications.filter(n => {
    if (activeFilter === "archived") return n.archived;
    if (n.archived) return false;
    if (activeFilter === "unread") return !n.read;
    if (activeFilter === "critical") return n.severity === "critical";
    if (activeFilter === "warning") return n.severity === "warning";
    if (["maintenance","qa","backup","machine","department","system"].includes(activeFilter)) return n.category === activeFilter;
    return true;
  }).filter(n => !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.message.toLowerCase().includes(search.toLowerCase()));

  const unreadCount = notifications.filter(n => !n.read && !n.archived).length;

  return (
    <div className="w-full max-w-[1600px] mx-auto animate-in fade-in duration-300">
      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-2">
          <LayoutDashboard size={12} /><span>Dashboard</span><ChevronRight size={12} /><span className="text-slate-700 font-semibold">Notifications</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm shadow-blue-200 relative">
              <Bell size={20} className="text-white" />
              {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unreadCount}</span>}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Notification Center</h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{unreadCount} unread · {notifications.filter(n => !n.archived).length} total</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={markAllRead} className="flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"><CheckCircle2 size={13} /> Mark All Read</button>
            <button className="flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"><SlidersHorizontal size={13} /> Preferences</button>
          </div>
        </div>
      </div>

      <div className="flex gap-5">
        {/* Sidebar */}
        <div className="w-52 shrink-0">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Categories</div>
            <div className="py-1.5">
              {filters.map(f => (
                <button key={f.id} onClick={() => setActiveFilter(f.id)} className={`w-full flex items-center justify-between px-4 py-2 text-xs transition-colors ${activeFilter === f.id ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-600 hover:bg-slate-50 font-medium"}`}>
                  <span className="capitalize">{f.label}</span>
                  {f.count > 0 && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeFilter === f.id ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>{f.count}</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 min-w-0 space-y-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search notifications..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-4 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-400" />
          </div>

          {displayed.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-12 text-center">
              <Bell size={32} className="text-slate-200 mx-auto mb-3" />
              <div className="text-sm font-bold text-slate-700 mb-1">No notifications</div>
              <div className="text-xs text-slate-400">All clear in this category.</div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {displayed.map(n => (
                <NotifCard key={n.id} n={n} onRead={() => markRead(n.id)} onDelete={() => deleteNotif(n.id)} onArchive={() => archiveNotif(n.id)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
