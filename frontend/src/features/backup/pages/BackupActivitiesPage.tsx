// ─────────────────────────────────────────────────────────────────────────────
// BackupActivitiesPage
// Extracted from the original monolithic App.tsx (RCC OMP).
// Behavior, styling and Tailwind classes are unchanged from the original.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useMemo } from "react";
import {
  Monitor,
  LayoutDashboard,
  Archive,
  Server,
  FileText,
  Search,
  ChevronDown,
  User,
  ChevronRight,
  Clock,
  Calendar as CalendarIcon,
  CheckCircle2,
  X,
  Info,
  Mail,
  Plus,
  MoreHorizontal,
  AlertTriangle,
  XCircle,
  ChevronLeft,
  Download,
  Eye,
  Edit2,
  Trash2,
  RefreshCw,
  ChevronUp,
  RotateCcw,
  CalendarClock,
  TrendingUp,
  ArrowUpDown,
  Copy,
  Database,
  Type,
  Sun
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { toast } from "sonner";


// ─────────────────────────────────────────────────────────────────────────────
// BACKUP ACTIVITIES MODULE
// ─────────────────────────────────────────────────────────────────────────────

type BkpStatus = "Completed" | "Running" | "Failed" | "Scheduled" | "Paused" | "Cancelled";
type BkpType = "Full" | "Incremental" | "Differential" | "Snapshot";

interface BackupJob {
  id: string;
  name: string;
  server: string;
  backupType: BkpType;
  frequency: string;
  lastBackup: string;
  nextBackup: string;
  status: BkpStatus;
  progress: number;
  user: string;
  sizeGB: number;
  destination: string;
  retention: string;
  duration: string;
  department: string;
  lastVerified: string;
  recoveryPoints: number;
  compressionRatio: string;
  quota: number;
  description: string;
  history: { date: string; status: BkpStatus; duration: string; sizeGB: number }[];
}

const BACKUP_JOBS: BackupJob[] = [
  {
    id: "BK-2001", name: "ERP Full Backup", server: "SRV-ERP-001", backupType: "Full",
    frequency: "Daily", lastBackup: "2026-07-03 02:00", nextBackup: "2026-07-04 02:00",
    status: "Completed", progress: 100, user: "Arjun Rao", sizeGB: 245,
    destination: "NAS-BACKUP-01 / Pool-A", retention: "30 Days", duration: "1h 23m",
    department: "IT Department", lastVerified: "2026-07-02", recoveryPoints: 28,
    compressionRatio: "3.2:1", quota: 500, description: "Daily full backup of the ERP system including all modules and databases.",
    history: [
      { date: "2026-07-03 02:00", status: "Completed", duration: "1h 23m", sizeGB: 245 },
      { date: "2026-07-02 02:00", status: "Completed", duration: "1h 21m", sizeGB: 242 },
      { date: "2026-07-01 02:00", status: "Completed", duration: "1h 25m", sizeGB: 240 },
      { date: "2026-06-30 02:00", status: "Failed",    duration: "—",      sizeGB: 0   },
      { date: "2026-06-29 02:00", status: "Completed", duration: "1h 19m", sizeGB: 238 },
    ]
  },
  {
    id: "BK-2002", name: "Active Directory Backup", server: "SRV-AD-001", backupType: "Full",
    frequency: "Weekly", lastBackup: "2026-06-29 01:00", nextBackup: "2026-07-06 01:00",
    status: "Scheduled", progress: 0, user: "Vikram Singh", sizeGB: 18,
    destination: "NAS-BACKUP-01 / Pool-B", retention: "90 Days", duration: "12m",
    department: "IT Department", lastVerified: "2026-06-29", recoveryPoints: 12,
    compressionRatio: "4.1:1", quota: 100, description: "Weekly full backup of Active Directory services and domain controllers.",
    history: [
      { date: "2026-06-29 01:00", status: "Completed", duration: "12m",  sizeGB: 18 },
      { date: "2026-06-22 01:00", status: "Completed", duration: "11m",  sizeGB: 17 },
      { date: "2026-06-15 01:00", status: "Completed", duration: "13m",  sizeGB: 18 },
      { date: "2026-06-08 01:00", status: "Completed", duration: "11m",  sizeGB: 17 },
    ]
  },
  {
    id: "BK-2003", name: "File Server Incremental", server: "SRV-FILE-001", backupType: "Incremental",
    frequency: "Daily", lastBackup: "2026-07-03 03:30", nextBackup: "2026-07-04 03:30",
    status: "Running", progress: 67, user: "Rajesh Kumar", sizeGB: 112,
    destination: "TAPE-LIB-01 / Slot-4", retention: "60 Days", duration: "~45m",
    department: "IT Department", lastVerified: "2026-07-01", recoveryPoints: 58,
    compressionRatio: "2.8:1", quota: 300, description: "Daily incremental backup of the shared file server.",
    history: [
      { date: "2026-07-03 03:30", status: "Running",   duration: "~45m",  sizeGB: 112 },
      { date: "2026-07-02 03:30", status: "Completed", duration: "48m",   sizeGB: 108 },
      { date: "2026-07-01 03:30", status: "Completed", duration: "44m",   sizeGB: 105 },
      { date: "2026-06-30 03:30", status: "Completed", duration: "50m",   sizeGB: 110 },
      { date: "2026-06-29 03:30", status: "Failed",    duration: "—",     sizeGB: 0   },
    ]
  },
  {
    id: "BK-2004", name: "Exchange Mail Backup", server: "SRV-EXCH-001", backupType: "Differential",
    frequency: "Daily", lastBackup: "2026-07-03 01:00", nextBackup: "2026-07-04 01:00",
    status: "Completed", progress: 100, user: "Priya Nair", sizeGB: 380,
    destination: "NAS-BACKUP-02 / Pool-A", retention: "45 Days", duration: "2h 10m",
    department: "IT Department", lastVerified: "2026-07-03", recoveryPoints: 42,
    compressionRatio: "2.5:1", quota: 600, description: "Daily differential backup of Exchange mail server and mailboxes.",
    history: [
      { date: "2026-07-03 01:00", status: "Completed", duration: "2h 10m", sizeGB: 380 },
      { date: "2026-07-02 01:00", status: "Completed", duration: "2h 05m", sizeGB: 375 },
      { date: "2026-07-01 01:00", status: "Completed", duration: "2h 18m", sizeGB: 378 },
      { date: "2026-06-30 01:00", status: "Completed", duration: "2h 08m", sizeGB: 372 },
    ]
  },
  {
    id: "BK-2005", name: "VMware ESXi Snapshot", server: "VMH-ESX-001", backupType: "Snapshot",
    frequency: "Daily", lastBackup: "2026-07-03 04:00", nextBackup: "2026-07-04 04:00",
    status: "Failed", progress: 0, user: "Arjun Rao", sizeGB: 0,
    destination: "SAN-BACKUP-01 / LUN-12", retention: "14 Days", duration: "—",
    department: "IT Department", lastVerified: "2026-07-01", recoveryPoints: 10,
    compressionRatio: "N/A", quota: 800, description: "Daily VMware ESXi hypervisor snapshot for all virtual machines.",
    history: [
      { date: "2026-07-03 04:00", status: "Failed",    duration: "—",      sizeGB: 0   },
      { date: "2026-07-02 04:00", status: "Completed", duration: "55m",    sizeGB: 520 },
      { date: "2026-07-01 04:00", status: "Completed", duration: "58m",    sizeGB: 515 },
      { date: "2026-06-30 04:00", status: "Completed", duration: "52m",    sizeGB: 510 },
    ]
  },
  {
    id: "BK-2006", name: "HR Database Backup", server: "SRV-HRM-001", backupType: "Full",
    frequency: "Weekly", lastBackup: "2026-06-30 00:30", nextBackup: "2026-07-07 00:30",
    status: "Scheduled", progress: 0, user: "Meena Pillai", sizeGB: 62,
    destination: "NAS-BACKUP-01 / Pool-C", retention: "180 Days", duration: "32m",
    department: "Human Resources", lastVerified: "2026-06-30", recoveryPoints: 24,
    compressionRatio: "5.1:1", quota: 200, description: "Weekly full backup of HR management system and employee records.",
    history: [
      { date: "2026-06-30 00:30", status: "Completed", duration: "32m", sizeGB: 62 },
      { date: "2026-06-23 00:30", status: "Completed", duration: "30m", sizeGB: 60 },
      { date: "2026-06-16 00:30", status: "Completed", duration: "31m", sizeGB: 59 },
    ]
  },
  {
    id: "BK-2007", name: "CRM Database Backup", server: "SRV-CRM-001", backupType: "Incremental",
    frequency: "Daily", lastBackup: "2026-07-03 02:30", nextBackup: "2026-07-04 02:30",
    status: "Completed", progress: 100, user: "Deepa Iyer", sizeGB: 88,
    destination: "NAS-BACKUP-02 / Pool-B", retention: "30 Days", duration: "28m",
    department: "Sales", lastVerified: "2026-07-02", recoveryPoints: 30,
    compressionRatio: "3.8:1", quota: 250, description: "Daily incremental backup of CRM database and customer data.",
    history: [
      { date: "2026-07-03 02:30", status: "Completed", duration: "28m", sizeGB: 88 },
      { date: "2026-07-02 02:30", status: "Completed", duration: "27m", sizeGB: 86 },
      { date: "2026-07-01 02:30", status: "Completed", duration: "29m", sizeGB: 85 },
      { date: "2026-06-30 02:30", status: "Completed", duration: "26m", sizeGB: 84 },
    ]
  },
  {
    id: "BK-2008", name: "Production SQL Server", server: "SRV-SQL-002", backupType: "Differential",
    frequency: "Daily", lastBackup: "2026-07-03 00:00", nextBackup: "2026-07-04 00:00",
    status: "Completed", progress: 100, user: "Suresh Babu", sizeGB: 195,
    destination: "NAS-BACKUP-01 / Pool-D", retention: "30 Days", duration: "48m",
    department: "Production", lastVerified: "2026-07-02", recoveryPoints: 30,
    compressionRatio: "3.0:1", quota: 500, description: "Daily differential backup of production SQL Server databases.",
    history: [
      { date: "2026-07-03 00:00", status: "Completed", duration: "48m", sizeGB: 195 },
      { date: "2026-07-02 00:00", status: "Completed", duration: "45m", sizeGB: 190 },
      { date: "2026-07-01 00:00", status: "Failed",    duration: "—",   sizeGB: 0   },
      { date: "2026-06-30 00:00", status: "Completed", duration: "47m", sizeGB: 188 },
    ]
  },
  {
    id: "BK-2009", name: "Web Server Backup", server: "SRV-WEB-001", backupType: "Incremental",
    frequency: "Daily", lastBackup: "2026-07-03 05:00", nextBackup: "2026-07-04 05:00",
    status: "Completed", progress: 100, user: "Anita Desai", sizeGB: 24,
    destination: "NAS-BACKUP-02 / Pool-C", retention: "14 Days", duration: "8m",
    department: "IT Department", lastVerified: "2026-07-03", recoveryPoints: 14,
    compressionRatio: "4.5:1", quota: 100, description: "Daily incremental backup of web server files and configurations.",
    history: [
      { date: "2026-07-03 05:00", status: "Completed", duration: "8m",  sizeGB: 24 },
      { date: "2026-07-02 05:00", status: "Completed", duration: "7m",  sizeGB: 23 },
      { date: "2026-07-01 05:00", status: "Completed", duration: "8m",  sizeGB: 24 },
    ]
  },
  {
    id: "BK-2010", name: "System Logs Archive", server: "SRV-LOG-001", backupType: "Full",
    frequency: "Weekly", lastBackup: "2026-07-01 06:00", nextBackup: "2026-07-08 06:00",
    status: "Scheduled", progress: 0, user: "Vikram Singh", sizeGB: 45,
    destination: "TAPE-LIB-01 / Slot-8", retention: "365 Days", duration: "18m",
    department: "IT Department", lastVerified: "2026-07-01", recoveryPoints: 52,
    compressionRatio: "6.2:1", quota: 150, description: "Weekly full backup of system and application logs for compliance.",
    history: [
      { date: "2026-07-01 06:00", status: "Completed", duration: "18m", sizeGB: 45 },
      { date: "2026-06-24 06:00", status: "Completed", duration: "16m", sizeGB: 42 },
      { date: "2026-06-17 06:00", status: "Completed", duration: "17m", sizeGB: 40 },
    ]
  },
];

const BKP_WEEKLY_TREND = [
  { day: "Jun 27", success: 8, failed: 1, total: 9, storage: 1142 },
  { day: "Jun 28", success: 9, failed: 0, total: 9, storage: 1158 },
  { day: "Jun 29", success: 7, failed: 2, total: 9, storage: 1165 },
  { day: "Jun 30", success: 8, failed: 1, total: 9, storage: 1170 },
  { day: "Jul 1",  success: 9, failed: 0, total: 9, storage: 1180 },
  { day: "Jul 2",  success: 9, failed: 0, total: 9, storage: 1192 },
  { day: "Jul 3",  success: 7, failed: 1, total: 10,storage: 1159 },
];

const BKP_STORAGE_TREND = [
  { month: "Jan", used: 820, capacity: 2000 },
  { month: "Feb", used: 890, capacity: 2000 },
  { month: "Mar", used: 960, capacity: 2000 },
  { month: "Apr", used: 1020, capacity: 2000 },
  { month: "May", used: 1090, capacity: 2000 },
  { month: "Jun", used: 1192, capacity: 2000 },
  { month: "Jul", used: 1210, capacity: 2000 },
];

function bkpStatusCfg(status: BkpStatus) {
  switch (status) {
    case "Completed":  return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" };
    case "Running":    return { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    dot: "bg-blue-500"    };
    case "Failed":     return { bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",     dot: "bg-red-500"     };
    case "Scheduled":  return { bg: "bg-slate-50",   text: "text-slate-600",   border: "border-slate-200",   dot: "bg-slate-400"   };
    case "Paused":     return { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-500"   };
    case "Cancelled":  return { bg: "bg-slate-50",   text: "text-slate-400",   border: "border-slate-200",   dot: "bg-slate-300"   };
    default:           return { bg: "bg-slate-50",   text: "text-slate-600",   border: "border-slate-200",   dot: "bg-slate-400"   };
  }
}

function bkpTypeCfg(type: BkpType) {
  switch (type) {
    case "Full":         return { bg: "bg-blue-50",    text: "text-blue-700"    };
    case "Incremental":  return { bg: "bg-purple-50",  text: "text-purple-700"  };
    case "Differential": return { bg: "bg-indigo-50",  text: "text-indigo-700"  };
    case "Snapshot":     return { bg: "bg-teal-50",    text: "text-teal-700"    };
  }
}

function BkpStatusBadge({ status }: { status: BkpStatus }) {
  const c = bkpStatusCfg(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} shrink-0 ${status === "Running" ? "animate-pulse" : ""}`} />
      {status}
    </span>
  );
}

function BkpTypeBadge({ type }: { type: BkpType }) {
  const c = bkpTypeCfg(type);
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${c.bg} ${c.text}`}>
      {type}
    </span>
  );
}

// ─── JOB DETAILS DRAWER ───────────────────────────────────────────────────────
function BackupJobDrawer({ job, onClose, onEdit, onRunNow }: {
  job: BackupJob;
  onClose: () => void;
  onEdit: () => void;
  onRunNow: () => void;
}) {
  const [tab, setTab] = useState<"info" | "history" | "timeline">("info");
  const tabs = [
    { id: "info",     label: "Job Info"    },
    { id: "history",  label: "Run History" },
    { id: "timeline", label: "Timeline"    },
  ] as const;

  const usedPct = job.quota > 0 ? Math.round((job.sizeGB / job.quota) * 100) : 0;

  return (
    <div className="fixed inset-0 z-[60] flex">
      <div className="flex-1 bg-slate-900/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="w-[540px] bg-white border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center shrink-0">
                <Archive size={18} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">{job.name}</h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{job.id} · {job.server}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <BkpStatusBadge status={job.status} />
            <BkpTypeBadge type={job.backupType} />
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
              <RotateCcw size={10} /> {job.frequency}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-6">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${tab === t.id ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {tab === "info" && (
            <div className="space-y-5">
              {job.status === "Running" && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex justify-between text-xs font-semibold text-blue-700 mb-2">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> Running…</span>
                    <span>{job.progress}%</span>
                  </div>
                  <div className="w-full bg-blue-100 rounded-full h-2">
                    <div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${job.progress}%` }} />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Department",  value: job.department  },
                  { label: "Destination", value: job.destination },
                  { label: "Last Backup", value: job.lastBackup  },
                  { label: "Next Backup", value: job.nextBackup  },
                  { label: "Frequency",   value: job.frequency   },
                  { label: "Backup Type", value: job.backupType  },
                ].map(item => (
                  <div key={item.label} className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{item.label}</div>
                    <div className="text-xs font-semibold text-slate-900">{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Storage card */}
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-slate-700">Storage Used</span>
                  <span className="text-sm font-bold text-slate-900">{job.sizeGB} GB / {job.quota} GB</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 mb-2">
                  <div
                    className={`h-2.5 rounded-full ${usedPct > 80 ? "bg-red-500" : usedPct > 60 ? "bg-amber-500" : "bg-emerald-500"}`}
                    style={{ width: `${Math.min(usedPct, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Used: {job.sizeGB} GB</span>
                  <span>Quota: {job.quota} GB</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
                  <div className="text-xs text-emerald-600 font-semibold mb-1">Last Verified</div>
                  <div className="text-sm font-bold text-emerald-800">{job.lastVerified}</div>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
                  <div className="text-xs text-blue-600 font-semibold mb-1">Recovery Points</div>
                  <div className="text-sm font-bold text-blue-800">{job.recoveryPoints} points</div>
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-700 mb-2">Assigned User</div>
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl p-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                    {job.user.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{job.user}</div>
                    <div className="text-[11px] text-slate-500">{job.department}</div>
                  </div>
                </div>
              </div>

              {job.description && (
                <div>
                  <div className="text-xs font-bold text-slate-700 mb-2">Description</div>
                  <div className="text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-xl p-3 leading-relaxed">{job.description}</div>
                </div>
              )}
            </div>
          )}

          {tab === "history" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-slate-700">Run History</h3>
                <span className="text-[11px] text-slate-400">{job.history.length} records</span>
              </div>
              {job.history.length === 0 && (
                <div className="py-10 text-center text-sm text-slate-400">No run history yet.</div>
              )}
              {job.history.map((h, i) => {
                const c = bkpStatusCfg(h.status);
                return (
                  <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-900 font-mono">{h.date}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${c.bg} ${c.text} ${c.border}`}>{h.status}</span>
                    </div>
                    <div className="flex gap-4 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1"><Clock size={10} /> {h.duration}</span>
                      {h.sizeGB > 0 && <span>{h.sizeGB} GB</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === "timeline" && (
            <div>
              <div className="text-xs font-bold text-slate-700 mb-4">Execution Timeline</div>
              <div className="relative border-l-2 border-slate-100 ml-2 space-y-5">
                {[
                  { time: "2 mins ago",   title: "Status updated", desc: `Job status changed to ${job.status}`,                         color: "bg-blue-400"    },
                  { time: job.lastBackup, title: "Job executed",   desc: `${job.backupType} backup completed in ${job.duration}`,        color: "bg-emerald-400" },
                  { time: "Scheduled",    title: "Job scheduled",  desc: `Next run: ${job.nextBackup}`,                                  color: "bg-slate-300"   },
                  { time: "On creation",  title: "Job created",    desc: `Backup job configured by ${job.user}`,                     color: "bg-slate-200"   },
                ].map((log, i) => (
                  <div key={i} className="relative pl-6">
                    <div className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center">
                      <div className={`w-1.5 h-1.5 rounded-full ${log.color}`} />
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{log.time}</div>
                    <div className="text-xs font-bold text-slate-800">{log.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{log.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex gap-3 shrink-0">
          <button onClick={onEdit} className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
            <Edit2 size={13} /> Edit
          </button>
          {job.status === "Running" && (
            <button className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors">
              <XCircle size={13} /> Cancel
            </button>
          )}
          <button onClick={onRunNow} className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
            <RefreshCw size={13} /> Run Now
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── BACKUP ANALYTICS ─────────────────────────────────────────────────────────
function BackupAnalytics() {
  return (
    <div className="space-y-5">
      {/* Top row: Success Rate + Storage Trend */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Success Rate Chart */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Backup Success Rate</h3>
              <p className="text-xs text-slate-500 mt-0.5">Daily successful vs failed jobs — last 7 days</p>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /> Success</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-400 inline-block" /> Failed</span>
            </div>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={BKP_WEEKLY_TREND} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748B" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748B" }} />
                <RechartsTooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0", fontSize: "12px" }} />
                <Bar dataKey="success" name="Success" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={36} />
                <Bar dataKey="failed"  name="Failed"  fill="#F87171" radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary stats */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-900 mb-4">7-Day Summary</h3>
          <div className="space-y-4 flex-1">
            {[
              { label: "Total Jobs Run", value: "63",    color: "text-slate-900", bar: "bg-blue-500",    pct: 100 },
              { label: "Successful",     value: "57",    color: "text-emerald-700", bar: "bg-emerald-500", pct: 90  },
              { label: "Failed",         value: "4",     color: "text-red-600",  bar: "bg-red-400",    pct: 6   },
              { label: "Avg. Duration",  value: "54m",   color: "text-slate-700", bar: "bg-indigo-400", pct: 60  },
            ].map(s => (
              <div key={s.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-600">{s.label}</span>
                  <span className={`font-bold ${s.color}`}>{s.value}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full ${s.bar}`} style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="text-[11px] text-slate-500 mb-1">Overall Success Rate</div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-emerald-600">90.5%</span>
              <span className="text-xs text-emerald-500 font-semibold mb-1 flex items-center gap-0.5">
                <TrendingUp size={12} /> +2.1%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row: Storage Trend + Daily Jobs Pie */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Storage trend */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Storage Usage Trend</h3>
              <p className="text-xs text-slate-500 mt-0.5">Monthly backup storage consumed (GB)</p>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
              2,000 GB Capacity
            </span>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={BKP_STORAGE_TREND} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="bkpGradStorage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#2563EB" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}    />
                  </linearGradient>
                  <linearGradient id="bkpGradCapacity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#94A3B8" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#94A3B8" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748B" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748B" }} />
                <RechartsTooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0", fontSize: "12px" }} formatter={(v: any) => [`${v} GB`]} />
                <Area type="monotone" dataKey="capacity" name="Capacity" stroke="#CBD5E1" strokeWidth={1.5} strokeDasharray="5 3" fill="url(#bkpGradCapacity)" />
                <Area type="monotone" dataKey="used"     name="Used"     stroke="#2563EB" strokeWidth={2}   fill="url(#bkpGradStorage)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Job type distribution */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Backup Type Mix</h3>
          <div className="h-[140px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "Full",         value: 30, color: "#3B82F6" },
                    { name: "Incremental",  value: 40, color: "#8B5CF6" },
                    { name: "Differential", value: 20, color: "#6366F1" },
                    { name: "Snapshot",     value: 10, color: "#14B8A6" },
                  ]}
                  innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="value"
                >
                  {[
                    { name: "Full",         value: 30, color: "#3B82F6" },
                    { name: "Incremental",  value: 40, color: "#8B5CF6" },
                    { name: "Differential", value: 20, color: "#6366F1" },
                    { name: "Snapshot",     value: 10, color: "#14B8A6" },
                  ].map((entry, index) => (
                    <Cell key={`bkp-type-cell-${entry.name}-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip cursor={false} contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-slate-900">10</span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Jobs</span>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {[
              { name: "Full",         pct: 30, color: "bg-blue-500"   },
              { name: "Incremental",  pct: 40, color: "bg-purple-500" },
              { name: "Differential", pct: 20, color: "bg-indigo-500" },
              { name: "Snapshot",     pct: 10, color: "bg-teal-500"   },
            ].map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-sm ${d.color}`} />
                  <span className="text-slate-600 font-medium">{d.name}</span>
                </div>
                <span className="font-bold text-slate-800">{d.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Failed jobs detail */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle size={15} className="text-red-500" /> Failed Jobs — Last 7 Days
          </h3>
          <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg">4 failures</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50/70 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-5 py-3">Job</th>
                <th className="px-4 py-3">Server</th>
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-4 py-3">Error</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {[
                { job: "ERP Full Backup",        server: "SRV-ERP-001", dt: "2026-06-30 02:00", err: "Network timeout during transfer",   dur: "8m",  eng: "Arjun Rao"    },
                { job: "VMware ESXi Snapshot",   server: "VMH-ESX-001", dt: "2026-07-03 04:00", err: "Snapshot consolidation failed",     dur: "4m",  eng: "Arjun Rao"    },
                { job: "File Server Incremental",server: "SRV-FILE-001",dt: "2026-06-29 03:30", err: "Insufficient destination storage",  dur: "12m", eng: "Rajesh Kumar" },
                { job: "Production SQL Server",  server: "SRV-SQL-002", dt: "2026-07-01 00:00", err: "SQL VSS writer timeout",            dur: "3m",  eng: "Suresh Babu"  },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-red-50/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <XCircle size={14} className="text-red-500 shrink-0" />
                      <span className="text-xs font-semibold text-slate-900">{row.job}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-slate-500">{row.server}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{row.dt}</td>
                  <td className="px-4 py-3 text-xs text-red-600 font-medium">{row.err}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{row.dur}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{row.eng}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── BACKUP CALENDAR VIEW ─────────────────────────────────────────────────────
function BackupCalendarView({ jobs }: { jobs: BackupJob[] }) {
  const [currentMonth, setCurrentMonth] = useState({ year: 2026, month: 6 });
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set());

  const monthName = new Date(currentMonth.year, currentMonth.month, 1)
    .toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const firstDay    = new Date(currentMonth.year, currentMonth.month, 1).getDay();
  const daysInMonth = new Date(currentMonth.year, currentMonth.month + 1, 0).getDate();
  const today       = new Date("2026-07-03");

  const getJobsForDay = (day: number) => {
    const prefix = `${currentMonth.year}-${String(currentMonth.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return jobs.filter(j => j.lastBackup.startsWith(prefix) || j.nextBackup.startsWith(prefix));
  };

  const prev = () => { setCurrentMonth(p => ({ year: p.month === 0 ? p.year - 1 : p.year, month: p.month === 0 ? 11 : p.month - 1 })); setExpandedDays(new Set()); };
  const next = () => { setCurrentMonth(p => ({ year: p.month === 11 ? p.year + 1 : p.year, month: p.month === 11 ? 0  : p.month + 1 })); setExpandedDays(new Set()); };

  const toggleDay = (day: number) => setExpandedDays(prev => {
    const s = new Set(prev);
    s.has(day) ? s.delete(day) : s.add(day);
    return s;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Calendar header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-bold text-slate-900">{monthName}</h3>
          <div className="flex gap-3 text-[11px]">
            {[
              { color: "bg-emerald-500", label: "Completed" },
              { color: "bg-blue-500",    label: "Running"   },
              { color: "bg-red-500",     label: "Failed"    },
              { color: "bg-slate-400",   label: "Scheduled" },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5 text-slate-500">
                <div className={`w-2 h-2 rounded-full ${l.color}`} /> {l.label}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={prev} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"><ChevronLeft size={16} /></button>
          <button onClick={() => { setCurrentMonth({ year: 2026, month: 6 }); setExpandedDays(new Set()); }} className="px-3 py-1 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Today</button>
          <button onClick={next} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"><ChevronRight size={16} /></button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-slate-100">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
          <div key={`bkp-cal-hdr-${d}`} className="py-3 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`bkp-cal-empty-${i}`} className="min-h-[100px] border-b border-r border-slate-100 bg-slate-50/30 p-2">
            <span className="text-[11px] text-slate-300">
              {new Date(currentMonth.year, currentMonth.month, -firstDay + i + 1).getDate()}
            </span>
          </div>
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day        = i + 1;
          const dayDate    = new Date(currentMonth.year, currentMonth.month, day);
          const isToday    = dayDate.toDateString() === today.toDateString();
          const dayJobs    = getJobsForDay(day);
          const isWknd     = dayDate.getDay() === 0 || dayDate.getDay() === 6;
          const isExpanded = expandedDays.has(day);
          const overflow   = dayJobs.length - 3;
          const visible    = isExpanded ? dayJobs : dayJobs.slice(0, 3);
          return (
            <div key={`bkp-cal-day-${day}`} className={`min-h-[100px] border-b border-r border-slate-100 p-2 transition-colors hover:bg-slate-50/50 ${isWknd ? "bg-slate-50/20" : "bg-white"}`}>
              <div className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold mb-1 ${isToday ? "bg-blue-600 text-white" : "text-slate-700"}`}>
                {day}
              </div>
              <div className="space-y-1">
                {visible.map((j, ji) => {
                  const isNext = j.nextBackup.startsWith(`${currentMonth.year}-${String(currentMonth.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
                  const dotColor = isNext ? "bg-slate-50 text-slate-600 border-slate-200"
                    : j.status === "Completed" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : j.status === "Failed"    ? "bg-red-50 text-red-700 border-red-200"
                    : j.status === "Running"   ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-slate-50 text-slate-600 border-slate-200";
                  return (
                    <div key={`bkp-cal-job-${j.id}-${ji}`} className={`px-1.5 py-0.5 rounded text-[10px] font-semibold truncate border cursor-pointer hover:opacity-80 ${dotColor}`} title={j.name}>
                      {j.name.split(" ").slice(0, 2).join(" ")}
                    </div>
                  );
                })}
                {overflow > 0 && !isExpanded && (
                  <button onClick={() => toggleDay(day)} className="text-[10px] text-blue-500 pl-1 hover:text-blue-700 font-semibold w-full text-left hover:underline">
                    +{overflow} more
                  </button>
                )}
                {isExpanded && overflow > 0 && (
                  <button onClick={() => toggleDay(day)} className="text-[10px] text-slate-400 pl-1 hover:text-slate-600 font-semibold w-full text-left hover:underline">
                    Show less
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── BACKUP TIMELINE ──────────────────────────────────────────────────────────
function BackupTimeline({ jobs }: { jobs: BackupJob[] }) {
  const today    = jobs.filter(j => j.nextBackup.startsWith("2026-07-03") || j.status === "Running" || j.status === "Failed");
  const tomorrow = jobs.filter(j => j.nextBackup.startsWith("2026-07-04"));
  const later    = jobs.filter(j => !j.nextBackup.startsWith("2026-07-03") && !j.nextBackup.startsWith("2026-07-04"));

  const Section = ({ title, items, accent }: { title: string; items: BackupJob[]; accent: string }) => {
    if (!items.length) return null;
    return (
      <div className="mb-5">
        <div className={`flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider ${accent}`}>
          <div className="w-1.5 h-1.5 rounded-full bg-current" />
          {title}
          <span className="ml-auto font-bold text-current bg-current/10 px-2 py-0.5 rounded-full text-[10px]">{items.length}</span>
        </div>
        <div className="space-y-2">
          {items.map(j => (
            <div key={j.id} className="flex items-center gap-3 p-2.5 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
              <div className="w-7 h-7 bg-slate-50 rounded-lg flex items-center justify-center shrink-0 border border-slate-100">
                <Archive size={12} className="text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">{j.name}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                  <span>{j.server}</span><span>·</span>
                  <span>{j.status === "Running" ? j.nextBackup.split(" ")[1] : j.nextBackup.split(" ")[1]}</span>
                </div>
              </div>
              <BkpStatusBadge status={j.status} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-5">
        <CalendarClock size={16} className="text-blue-500" /> Backup Timeline
      </h3>
      <Section title="Today & Running" items={today}    accent="text-blue-600"  />
      <Section title="Tomorrow"        items={tomorrow}  accent="text-slate-600" />
      <Section title="Coming Up"       items={later}     accent="text-slate-400" />
    </div>
  );
}

// ─── BACKUP DASHBOARD ─────────────────────────────────────────────────────────
function BackupDashboard({ jobs, onViewJob }: { jobs: BackupJob[]; onViewJob: (j: BackupJob) => void }) {
  const kpi = {
    total:       jobs.length,
    successful:  jobs.filter(j => j.status === "Completed").length,
    failed:      jobs.filter(j => j.status === "Failed").length,
    running:     jobs.filter(j => j.status === "Running").length,
    totalGB:     jobs.reduce((s, j) => s + j.sizeGB, 0),
  };
  const successRate = Math.round((kpi.successful / (kpi.total - jobs.filter(j => j.status === "Scheduled").length)) * 100);

  const todayJobs = jobs.filter(j => j.lastBackup.startsWith("2026-07-03") || j.status === "Running");

  return (
    <div className="space-y-5">
      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: "Total Jobs",       val: String(kpi.total),                  icon: Archive,      bg: "bg-blue-50",   border: "border-blue-100",   text: "text-blue-600",    sub: "All configured"      },
          { label: "Successful",       val: String(kpi.successful),             icon: CheckCircle2, bg: "bg-emerald-50",border: "border-emerald-100", text: "text-emerald-600", sub: "Completed today"     },
          { label: "Failed",           val: String(kpi.failed),                 icon: XCircle,      bg: "bg-red-50",    border: "border-red-100",    text: "text-red-600",     sub: "Needs attention"     },
          { label: "Running Now",      val: String(kpi.running),                icon: RefreshCw,    bg: "bg-blue-50",   border: "border-blue-100",   text: "text-blue-600",    sub: "In progress"         },
          { label: "Storage Used",     val: `${kpi.totalGB} GB`,               icon: Server,       bg: "bg-purple-50", border: "border-purple-100", text: "text-purple-600",  sub: "of 2,000 GB"         },
          { label: "Success Rate",     val: `${successRate}%`,                 icon: TrendingUp,   bg: "bg-emerald-50",border: "border-emerald-100", text: "text-emerald-600", sub: "Last 7 days"         },
        ].map((k, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-tight">{k.label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${k.bg} border ${k.border}`}>
                <k.icon size={15} className={`${k.text} ${k.label === "Running Now" ? "animate-spin" : ""}`} style={k.label === "Running Now" ? { animationDuration: "3s" } : {}} />
              </div>
            </div>
            <div className="text-xl font-bold text-slate-900 mb-1 leading-none">{k.val}</div>
            <div className="text-[11px] font-medium text-slate-400">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Today's jobs + timeline */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Today's Jobs Table */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Today's Backup Jobs</h3>
            <span className="text-xs font-semibold text-slate-500">{todayJobs.length} jobs · July 3, 2026</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-slate-50/70 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Job</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {todayJobs.map(job => (
                  <tr key={job.id} className="hover:bg-blue-50/20 cursor-pointer transition-colors" onClick={() => onViewJob(job)}>
                    <td className="px-5 py-3.5">
                      <div className="text-xs font-bold text-slate-900">{job.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{job.server}</div>
                    </td>
                    <td className="px-4 py-3.5"><BkpTypeBadge type={job.backupType} /></td>
                    <td className="px-4 py-3.5 text-xs text-slate-500 font-mono">{job.lastBackup.split(" ")[1]}</td>
                    <td className="px-4 py-3.5 text-xs font-semibold text-slate-700">{job.sizeGB > 0 ? `${job.sizeGB} GB` : "—"}</td>
                    <td className="px-4 py-3.5"><BkpStatusBadge status={job.status} /></td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">{job.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Timeline sidebar */}
        <BackupTimeline jobs={jobs} />
      </div>

      {/* Analytics preview strip */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900">7-Day Success Trend</h3>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-500"><span className="w-2 h-2 rounded-sm bg-emerald-500 inline-block" /> Success</span>
            <span className="flex items-center gap-1.5 text-slate-500"><span className="w-2 h-2 rounded-sm bg-red-400 inline-block" /> Failed</span>
          </div>
        </div>
        <div className="h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={BKP_WEEKLY_TREND} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94A3B8" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94A3B8" }} />
              <RechartsTooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0", fontSize: "12px" }} />
              <Bar dataKey="success" name="Success" fill="#10B981" radius={[3, 3, 0, 0]} maxBarSize={32} />
              <Bar dataKey="failed"  name="Failed"  fill="#F87171" radius={[3, 3, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ─── BACKUP JOBS TABLE ────────────────────────────────────────────────────────
function BackupJobsTable({
  jobs, onViewJob, onEdit, onRunNow, onDuplicate, onDelete,
}: {
  jobs: BackupJob[];
  onViewJob: (j: BackupJob) => void;
  onEdit: (j: BackupJob) => void;
  onRunNow: (j: BackupJob) => void;
  onDuplicate: (j: BackupJob) => void;
  onDelete: (j: BackupJob) => void;
}) {
  const [search, setSearch]         = useState("");
  const [statusF, setStatusF]       = useState("");
  const [typeF, setTypeF]           = useState("");
  const [sortField, setSortField]   = useState("nextBackup");
  const [sortDir, setSortDir]       = useState<"asc"|"desc">("asc");
  const [openMoreId, setOpenMoreId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let d = [...jobs];
    if (search)  d = d.filter(j => j.name.toLowerCase().includes(search.toLowerCase()) || j.id.toLowerCase().includes(search.toLowerCase()));
    if (statusF) d = d.filter(j => j.status === statusF);
    if (typeF)   d = d.filter(j => j.backupType === typeF);
    d.sort((a, b) => {
      const av = a[sortField as keyof BackupJob]?.toString() ?? "";
      const bv = b[sortField as keyof BackupJob]?.toString() ?? "";
      const cmp = sortField === "sizeGB" ? a.sizeGB - b.sizeGB : av.localeCompare(bv);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return d;
  }, [jobs, search, statusF, typeF, sortField, sortDir]);

  const handleSort = (f: string) => {
    if (sortField === f) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(f); setSortDir("asc"); }
  };

  const SortIcon = ({ f }: { f: string }) =>
    sortField !== f ? <ArrowUpDown size={11} className="text-slate-300" /> :
    sortDir === "asc" ? <ChevronUp size={11} className="text-blue-500" /> : <ChevronDown size={11} className="text-blue-500" />;

  return (
    <div className="space-y-4" onClick={() => setOpenMoreId(null)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search jobs..."
            className="w-full h-9 pl-9 pr-4 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-400"
          />
        </div>
        <select value={statusF} onChange={e => setStatusF(e.target.value)} className="h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-400 text-slate-700">
          <option value="">All Statuses</option>
          {(["Completed","Running","Failed","Scheduled","Paused","Cancelled"] as BkpStatus[]).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={typeF} onChange={e => setTypeF(e.target.value)} className="h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-400 text-slate-700">
          <option value="">All Types</option>
          {(["Full","Incremental","Differential","Snapshot"] as BkpType[]).map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/50">
          <span className="text-xs font-semibold text-slate-500">
            Showing <span className="font-bold text-slate-900">{filtered.length}</span> of {jobs.length} jobs
          </span>
          <select className="h-7 px-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-600 focus:outline-none">
            <option>10 per page</option><option>25 per page</option><option>50 per page</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50/70 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-4 py-3"><button onClick={() => handleSort("name")} className="flex items-center gap-1.5 hover:text-slate-700">Job Name <SortIcon f="name" /></button></th>
                <th className="px-4 py-3">Frequency</th>
                <th className="px-4 py-3"><button onClick={() => handleSort("lastBackup")} className="flex items-center gap-1.5 hover:text-slate-700">Last Backup <SortIcon f="lastBackup" /></button></th>
                <th className="px-4 py-3"><button onClick={() => handleSort("nextBackup")} className="flex items-center gap-1.5 hover:text-slate-700">Next Backup <SortIcon f="nextBackup" /></button></th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Progress</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(job => (
                <tr key={job.id} className="hover:bg-blue-50/20 group cursor-pointer transition-colors" onClick={() => onViewJob(job)}>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center shrink-0">
                        <Archive size={12} className="text-blue-600" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{job.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{job.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                      <RotateCcw size={10} /> {job.frequency}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-500 font-mono">{job.lastBackup}</td>
                  <td className="px-4 py-3.5 text-xs text-slate-500 font-mono">{job.nextBackup}</td>
                  <td className="px-4 py-3.5"><BkpStatusBadge status={job.status} /></td>
                  <td className="px-4 py-3.5">
                    {job.status === "Running" ? (
                      <div className="flex items-center gap-2 min-w-[80px]">
                        <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                          <div className="h-1.5 rounded-full bg-blue-500 transition-all" style={{ width: `${job.progress}%` }} />
                        </div>
                        <span className="text-[11px] font-bold text-blue-600">{job.progress}%</span>
                      </div>
                    ) : job.status === "Completed" ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-full bg-emerald-100 rounded-full h-1.5 min-w-[60px]">
                          <div className="h-1.5 rounded-full bg-emerald-500 w-full" />
                        </div>
                        <span className="text-[11px] font-bold text-emerald-600">100%</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[9px] font-bold shrink-0">
                        {job.user.split(" ").map(n => n[0]).join("")}
                      </div>
                      <span className="text-xs text-slate-600">{job.user.split(" ")[0]}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button title="View" className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" onClick={() => onViewJob(job)}><Eye size={13} /></button>
                      <button title="Run Now" className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" onClick={() => onRunNow(job)}><RefreshCw size={13} /></button>
                      <button title="Edit" className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" onClick={() => onEdit(job)}><Edit2 size={13} /></button>
                      <div className="relative">
                        <button
                          title="More"
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                          onClick={e => { e.stopPropagation(); setOpenMoreId(openMoreId === job.id ? null : job.id); }}
                        >
                          <MoreHorizontal size={13} />
                        </button>
                        {openMoreId === job.id && (
                          <div className="absolute right-0 top-8 z-50 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1 animate-in fade-in zoom-in-95 duration-150">
                            <button className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors" onClick={() => { onDuplicate(job); setOpenMoreId(null); }}>
                              <Copy size={13} className="text-slate-400" /> Duplicate Backup Job
                            </button>
                            <button className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors" onClick={() => setOpenMoreId(null)}>
                              <FileText size={13} className="text-slate-400" /> Export as Word
                            </button>
                            <div className="my-1 border-t border-slate-100" />
                            <button className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors" onClick={() => { onDelete(job); setOpenMoreId(null); }}>
                              <Trash2 size={13} className="text-red-400" /> Delete Backup Job
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <Archive size={32} className="text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700">No backup jobs found</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/30">
            <span className="text-xs text-slate-500">Page 1 of 1</span>
            <div className="flex items-center gap-1">
              <button className="h-7 px-2.5 text-xs font-medium text-slate-400 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40" disabled>Previous</button>
              <button className="h-7 w-7 text-xs font-bold text-white bg-blue-600 rounded-md">1</button>
              <button className="h-7 px-2.5 text-xs font-medium text-slate-400 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40" disabled>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── BACKUP JOB FORM MODAL ───────────────────────────────────────────────────
const BKP_DEPARTMENTS  = ["Quality Assurance","Quality Control","Production","Warehouse","Engineering","Purchase & Accounts","HR & Admin","Environmental Health & Safety","IT Department"];
const BKP_FREQUENCIES  = ["Daily","Weekly","Monthly","Quarterly","Hourly"];
const BKP_DESTINATIONS = ["NAS-BACKUP-01 / Pool-A","NAS-BACKUP-01 / Pool-B","NAS-BACKUP-01 / Pool-C","NAS-BACKUP-01 / Pool-D","NAS-BACKUP-02 / Pool-A","NAS-BACKUP-02 / Pool-B","NAS-BACKUP-02 / Pool-C","TAPE-LIB-01 / Slot-4","TAPE-LIB-01 / Slot-8","SAN-BACKUP-01 / LUN-12"];
const BKP_USERS    = ["Arjun Rao","Vikram Singh","Rajesh Kumar","Priya Nair","Meena Pillai","Suresh Babu","Deepa Iyer","Anita Desai"];

interface BackupJobFormData {
  name: string; department: string; backupType: BkpType;
  frequency: string; destination: string; backupTime: string;
  user: string; quota: number; description: string;
}

function BackupJobModal({ mode, initial, onSave, onCancel }: {
  mode: "add" | "edit";
  initial?: BackupJob;
  onSave: (d: BackupJobFormData) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<BackupJobFormData>({
    name:        initial?.name        ?? "",
    department:  initial?.department  ?? BKP_DEPARTMENTS[0],
    backupType:  initial?.backupType  ?? "Full",
    frequency:   initial?.frequency   ?? "Daily",
    destination: initial?.destination ?? BKP_DESTINATIONS[0],
    backupTime:  initial?.lastBackup?.split(" ")[1] ?? "02:00",
    user:    initial?.user    ?? BKP_USERS[0],
    quota:       initial?.quota       ?? 500,
    description: initial?.description ?? "",
  });

  const set = (k: keyof BackupJobFormData, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg z-10 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-center">
              <Archive size={15} className="text-emerald-600" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">{mode === "add" ? "Add Backup Job" : "Edit Backup Job"}</h2>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4 overflow-y-auto">
          <div>
            <div className="text-xs font-bold text-slate-700 mb-1">Backup Job Name <span className="text-red-500">*</span></div>
            <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. ERP Full Backup" className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-bold text-slate-700 mb-1">Department <span className="text-red-500">*</span></div>
              <select value={form.department} onChange={e => set("department", e.target.value)} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-400">
                {BKP_DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-700 mb-1">Backup Type <span className="text-red-500">*</span></div>
              <select value={form.backupType} onChange={e => set("backupType", e.target.value)} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-400">
                {(["Full","Incremental","Differential","Snapshot"] as BkpType[]).map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-bold text-slate-700 mb-1">Frequency</div>
              <select value={form.frequency} onChange={e => set("frequency", e.target.value)} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-400">
                {BKP_FREQUENCIES.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-700 mb-1">Backup Time</div>
              <input type="time" value={form.backupTime} onChange={e => set("backupTime", e.target.value)} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-400" />
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-700 mb-1">Backup Destination</div>
            <select value={form.destination} onChange={e => set("destination", e.target.value)} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-400">
              {BKP_DESTINATIONS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-bold text-slate-700 mb-1">Assigned User</div>
              <select value={form.user} onChange={e => set("user", e.target.value)} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-400">
                {BKP_USERS.map(e => <option key={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-700 mb-1">Quota (GB)</div>
              <input type="number" min={1} value={form.quota} onChange={e => set("quota", Number(e.target.value))} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-400" />
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-700 mb-1">Description</div>
            <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3} placeholder="Optional description..." className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none" />
          </div>
        </div>
        <div className="p-5 border-t border-slate-100 flex justify-end gap-3 shrink-0">
          <button onClick={onCancel} className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
          <button onClick={() => form.name.trim() && onSave(form)} disabled={!form.name.trim()} className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {mode === "add" ? "Save Backup Job" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function RunConfirmDialog({ job, onConfirm, onCancel }: { job: BackupJob; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm z-10 animate-in fade-in zoom-in-95 duration-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center">
            <RefreshCw size={18} className="text-emerald-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Run this backup now?</h2>
            <p className="text-xs text-slate-500 mt-0.5">{job.name}</p>
          </div>
        </div>
        <p className="text-xs text-slate-600 mb-6 leading-relaxed">This will immediately trigger the backup job outside its scheduled window. Any currently running jobs will not be interrupted.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors">Run Backup</button>
        </div>
      </div>
    </div>
  );
}

function RunAllConfirmDialog({ jobCount, onConfirm, onCancel }: { jobCount: number; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm z-10 animate-in fade-in zoom-in-95 duration-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center">
            <RefreshCw size={18} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Run All Backup Jobs?</h2>
            <p className="text-xs text-slate-500 mt-0.5">{jobCount} jobs will be executed sequentially</p>
          </div>
        </div>
        <p className="text-xs text-slate-600 mb-6 leading-relaxed">This will trigger all {jobCount} backup jobs sequentially. The process may take several minutes to complete.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">Run All</button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN BACKUP CONTENT ──────────────────────────────────────────────────────
export default function BackupActivitiesPage() {
  const [subTab, setSubTab]   = useState<"dashboard"|"jobs"|"calendar">("dashboard");
  const [jobs, setJobs]       = useState<BackupJob[]>(BACKUP_JOBS);
  const [selectedJob, setSelectedJob] = useState<BackupJob | null>(null);
  const [showDrawer, setShowDrawer]   = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingJob, setEditingJob]     = useState<BackupJob | null>(null);
  const [runConfirmJob, setRunConfirmJob] = useState<BackupJob | null>(null);
  const [showRunAll, setShowRunAll]       = useState(false);
  const [runAllProgress, setRunAllProgress] = useState<number | null>(null);

  const openJob = (j: BackupJob) => {
    const latest = jobs.find(jj => jj.id === j.id) ?? j;
    setSelectedJob(latest);
    setShowDrawer(true);
  };
  const closeDrawer = () => setShowDrawer(false);

  const subTabs = [
    { id: "dashboard", label: "Dashboard",   icon: LayoutDashboard },
    { id: "jobs",      label: "Backup Jobs", icon: Archive         },
    { id: "calendar",  label: "Calendar",    icon: CalendarIcon    },
    
  ] as const;

  const handleAddJob = (data: BackupJobFormData) => {
    const newJob: BackupJob = {
      id: `BK-${2011 + jobs.length}`,
      name: data.name, server: "SRV-NEW-001",
      backupType: data.backupType, frequency: data.frequency,
      lastBackup: "—", nextBackup: `2026-07-04 ${data.backupTime}`,
      status: "Scheduled", progress: 0,
      user: data.user, sizeGB: 0,
      destination: data.destination, retention: "30 Days", duration: "—",
      department: data.department, lastVerified: "—",
      recoveryPoints: 0, compressionRatio: "—",
      quota: data.quota, description: data.description, history: [],
    };
    setJobs(prev => [...prev, newJob]);
    setShowAddModal(false);
    toast.success(`Backup job "${data.name}" created successfully.`);
  };

  const handleEditJob = (data: BackupJobFormData) => {
    if (!editingJob) return;
    const update = (j: BackupJob): BackupJob => j.id !== editingJob.id ? j : {
      ...j, name: data.name, department: data.department,
      backupType: data.backupType, frequency: data.frequency,
      destination: data.destination, user: data.user,
      quota: data.quota, description: data.description,
    };
    setJobs(prev => prev.map(update));
    if (selectedJob?.id === editingJob.id) setSelectedJob(prev => prev ? update(prev) : null);
    setEditingJob(null);
    toast.success("Backup job updated successfully.");
  };

  const confirmRunNow = (j: BackupJob) => {
    setShowDrawer(false);
    setRunConfirmJob(j);
  };

  const executeRunNow = () => {
    const j = runConfirmJob;
    if (!j) return;
    setRunConfirmJob(null);
    const now = "2026-07-04 00:00";
    setJobs(prev => prev.map(jj => jj.id === j.id ? { ...jj, status: "Running", progress: 0 } : jj));

    let prog = 0;
    const tick = setInterval(() => {
      prog = Math.min(prog + Math.floor(Math.random() * 20) + 8, 100);
      if (prog >= 100) {
        clearInterval(tick);
        setJobs(prev => prev.map(jj => jj.id !== j.id ? jj : {
          ...jj, status: "Completed", progress: 100, lastBackup: now, nextBackup: "2026-07-05 00:00",
          history: [{ date: now, status: "Completed", duration: "12m", sizeGB: jj.sizeGB || 50 }, ...jj.history.slice(0, 9)],
        }));
        if (selectedJob?.id === j.id) setSelectedJob(prev => prev ? { ...prev, status: "Completed", progress: 100, lastBackup: now } : null);
        toast.success(`"${j.name}" completed successfully.`);
      } else {
        setJobs(prev => prev.map(jj => jj.id === j.id ? { ...jj, progress: prog } : jj));
      }
    }, 500);
  };

  const executeRunAll = () => {
    setShowRunAll(false);
    setRunAllProgress(0);
    const total = jobs.length;
    let done = 0;
    jobs.forEach((j, idx) => {
      setTimeout(() => {
        done++;
        const now = "2026-07-04 00:00";
        setRunAllProgress(Math.round((done / total) * 100));
        setJobs(prev => prev.map(jj => jj.id !== j.id ? jj : {
          ...jj, status: "Completed", progress: 100, lastBackup: now, nextBackup: "2026-07-05 00:00",
          history: [{ date: now, status: "Completed", duration: "15m", sizeGB: jj.sizeGB || 50 }, ...jj.history.slice(0, 9)],
        }));
        if (done === total) setTimeout(() => { setRunAllProgress(null); toast.success("All backup jobs completed successfully."); }, 600);
      }, idx * 400);
    });
  };

  const handleDuplicate = (j: BackupJob) => {
    const newJob: BackupJob = { ...j, id: `BK-${2011 + jobs.length}`, name: `${j.name} (Copy)`, status: "Scheduled", progress: 0, lastBackup: "—", history: [] };
    setJobs(prev => [...prev, newJob]);
    toast.success(`Duplicated "${j.name}".`);
  };

  const handleDelete = (j: BackupJob) => {
    setJobs(prev => prev.filter(jj => jj.id !== j.id));
    if (selectedJob?.id === j.id) setShowDrawer(false);
    toast.success(`Backup job "${j.name}" deleted.`);
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-2">
          <LayoutDashboard size={12} />
          <span>Dashboard</span>
          <ChevronRight size={12} />
          <span className="text-slate-700 font-semibold">Backup Activities</span>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-sm shadow-emerald-200">
              <Archive size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Backup Activities</h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Monitor and manage all server backup jobs · IT Department</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 h-9 px-4 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
              <Plus size={14} /> Add Backup Job
            </button>
            <button onClick={() => setShowRunAll(true)} className="flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
              <RefreshCw size={14} /> Run All
            </button>
            <button className="flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
              <Download size={14} /> Export
            </button>
          </div>
        </div>

        {runAllProgress !== null && (
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-3">
            <RefreshCw size={14} className="text-blue-600 animate-spin shrink-0" style={{ animationDuration: "1.5s" }} />
            <div className="flex-1">
              <div className="flex justify-between text-xs font-semibold text-blue-700 mb-1">
                <span>Running all backup jobs sequentially…</span>
                <span>{runAllProgress}%</span>
              </div>
              <div className="w-full bg-blue-100 rounded-full h-1.5">
                <div className="h-1.5 rounded-full bg-blue-500 transition-all duration-500" style={{ width: `${runAllProgress}%` }} />
              </div>
            </div>
          </div>
        )}

        {/* Sub-tabs */}
        <div className="mt-5 flex items-center gap-1 border-b border-slate-200">
          {subTabs.map(t => (
            <button
              key={t.id}
              onClick={() => setSubTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors -mb-px ${
                subTab === t.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              <t.icon size={14} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {subTab === "dashboard"  && <BackupDashboard jobs={jobs} onViewJob={openJob} />}
      {subTab === "jobs"       && (
        <BackupJobsTable
          jobs={jobs} onViewJob={openJob}
          onEdit={j => setEditingJob(j)}
          onRunNow={confirmRunNow}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
        />
      )}
      {subTab === "calendar"   && <BackupCalendarView jobs={jobs} />}
      

      {/* Drawer */}
      {showDrawer && selectedJob && (
        <BackupJobDrawer
          job={selectedJob} onClose={closeDrawer}
          onEdit={() => { setEditingJob(selectedJob); closeDrawer(); }}
          onRunNow={() => confirmRunNow(selectedJob)}
        />
      )}

      {showAddModal && <BackupJobModal mode="add" onSave={handleAddJob} onCancel={() => setShowAddModal(false)} />}
      {editingJob   && <BackupJobModal mode="edit" initial={editingJob} onSave={handleEditJob} onCancel={() => setEditingJob(null)} />}
      {runConfirmJob && <RunConfirmDialog job={runConfirmJob} onConfirm={executeRunNow} onCancel={() => setRunConfirmJob(null)} />}
      {showRunAll    && <RunAllConfirmDialog jobCount={jobs.length} onConfirm={executeRunAll} onCancel={() => setShowRunAll(false)} />}
    </div>
  );
}
