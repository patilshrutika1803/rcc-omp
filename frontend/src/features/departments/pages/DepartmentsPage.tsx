// ─────────────────────────────────────────────────────────────────────────────
// DepartmentsPage
// Extracted from the original monolithic App.tsx (RCC OMP).
// Behavior, styling and Tailwind classes are unchanged from the original.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useMemo } from "react";
import {
  LayoutDashboard,
  Server,
  FileText,
  Search,
  User,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  X,
  Mail,
  Check,
  Plus,
  Activity,
  AlertTriangle,
  ChevronLeft,
  Download,
  FileSpreadsheet,
  Table2,
  Eye,
  Edit2,
  Trash2,
  RefreshCw,
  CalendarClock,
  TrendingUp,
  UserCheck,
  Layers,
  ArrowUpDown,
  ExternalLink,
  Key,
  Sun,
  Phone
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { toast } from "sonner";
import { daysUntil } from "../../../shared/utils/dateHelpers";
import { SYSTEMS } from "../../system-inventory/pages/SystemInventoryPage";

// Backward-compatible helpers adapted from the original Machines module.
// Departments UI expects these for status dot rendering.
function mchStatusCfg(status: string) {
  switch (status) {
    case "Active":
      return { dot: "bg-emerald-500" };
    case "Inactive":
      return { dot: "bg-slate-400" };
    case "Under Repair":
      return { dot: "bg-amber-500" };
    case "Disposed":
      return { dot: "bg-red-500" };
    default:
      return { dot: "bg-slate-400" };
  }
}

// Backward-compatible export expected by the existing page.
const MACHINES = SYSTEMS as unknown as Array<any>;


const USERS = [
  "Rajesh Kumar", "Priya Nair", "Suresh Babu", "Anita Desai",
  "Vikram Singh", "Meena Pillai", "Arjun Rao", "Deepa Iyer"
];

const DEPARTMENTS = ["Quality Assurance", "Quality Control", "Production", "Warehouse", "Engineering", "Purchase & Accounts", "HR & Admin", "Environmental Health & Safety", "IT Department"];

// ─────────────────────────────────────────────────────────────────────────────
// DEPARTMENTS MODULE
// ─────────────────────────────────────────────────────────────────────────────

// ─── DEPARTMENT FORM MODAL ────────────────────────────────────────────────────
function DeptFormModal({ mode, initial, onSave, onCancel }: {
  mode: "add" | "edit";
  initial?: DeptRecord;
  onSave: (d: Partial<DeptRecord> & { assignedUsers: string[] }) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name:        initial?.name        ?? "",
    head:        initial?.head        ?? "",
    manager:     initial?.manager     ?? "",
    location:    initial?.location    ?? "",
    employees:   initial?.employees   ?? 0,
    status:      initial?.status      ?? "Active" as DeptRecord["status"],
    description: initial?.description ?? "",
  });
  const [assignedUsers, setAssignedUsers] = useState<string[]>(
    initial ? USERS.filter(u => EMPLOYEES.some(e => e.name === u && e.department === initial.name)) : []
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Department name is required";
    if (!form.head.trim()) e.head = "Department head is required";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSaving(true);
    setTimeout(() => { onSave({ ...form, assignedUsers }); }, 500);
  };

  const toggleUser = (u: string) =>
    setAssignedUsers(prev => prev.includes(u) ? prev.filter(x => x !== u) : [...prev, u]);

  const fc = (k: string) =>
    `w-full h-9 px-3 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors[k] ? "border-red-400" : "border-slate-300"}`;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
              <Layers size={18} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">{mode === "add" ? "Add Department" : "Edit Department"}</h2>
              <p className="text-xs text-slate-500">{mode === "add" ? "Create a new department" : "Update department information"}</p>
            </div>
          </div>
          <button onClick={onCancel} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Department Name <span className="text-red-500">*</span></label>
              <input value={form.name} onChange={e => { setForm({...form, name: e.target.value}); setErrors(p => ({...p, name: ""})); }}
                placeholder="e.g. Quality Assurance" className={fc("name")} />
              {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value as DeptRecord["status"]})}
                className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-slate-700">
                {["Active","Under Review","Restructuring"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Department Head <span className="text-red-500">*</span></label>
              <input value={form.head} onChange={e => { setForm({...form, head: e.target.value}); setErrors(p => ({...p, head: ""})); }}
                placeholder="e.g. Arun Sharma" className={fc("head")} />
              {errors.head && <p className="text-[11px] text-red-500 mt-1">{errors.head}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Manager</label>
              <input value={form.manager} onChange={e => setForm({...form, manager: e.target.value})}
                placeholder="e.g. Vikram Singh" className={fc("manager")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Location</label>
              <input value={form.location} onChange={e => setForm({...form, location: e.target.value})}
                placeholder="e.g. Block A – 1st Floor" className={fc("location")} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Headcount</label>
              <input type="number" min={0} value={form.employees} onChange={e => setForm({...form, employees: Number(e.target.value)})}
                className={fc("employees")} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              rows={2} placeholder="Describe the department's responsibilities..."
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none placeholder-slate-400" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-2 block">Assign Users</label>
            <div className="grid grid-cols-2 gap-2">
              {USERS.map(u => (
                <button key={u} onClick={() => toggleUser(u)} type="button"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                    assignedUsers.includes(u)
                      ? "bg-blue-50 border-blue-300 text-blue-700"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${assignedUsers.includes(u) ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"}`}>
                    {u.split(" ").map(n => n[0]).join("").slice(0,2)}
                  </div>
                  {u}
                  {assignedUsers.includes(u) && <Check size={11} className="ml-auto text-blue-600" />}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <p className="text-[11px] text-slate-400">Fields marked <span className="text-red-500">*</span> are required</p>
          <div className="flex gap-3">
            <button onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={saving}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-70">
              {saving ? <><RefreshCw size={14} className="animate-spin" /> Saving...</> : <><Check size={14} /> {mode === "add" ? "Add Department" : "Save Changes"}</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export interface Employee {
  id: string; name: string; role: string; department: string;
  email: string; phone: string; employeeId: string;
  workload: number; assignedMachines: number; availability: "Available" | "Busy" | "On Leave" | "Remote";
  status: "Active" | "On Leave" | "Inactive";
  initials: string; avatarColor: string;
}

interface DeptRecord {
  id: string; name: string; head: string; manager: string;
  location: string; employees: number; machines: number;
  openPM: number; openQA: number; backupJobs: number;
  performanceScore: number; status: "Active" | "Under Review" | "Restructuring";
  budget: number; budgetUsed: number;
  description: string;
  recentActivities: { time: string; action: string; by: string }[];
  monthlyKPIs: { label: string; value: string; trend: "up" | "down" | "flat" }[];
}

export const DEPT_RECORDS: DeptRecord[] = [
  {
    id: "DEPT-001", name: "Production", head: "Rakesh Malhotra", manager: "Priya Nair",
    location: "Production Floor – Block A, B, C", employees: 42, machines: 8,
    openPM: 4, openQA: 7, backupJobs: 2, performanceScore: 87,
    status: "Active", budget: 48, budgetUsed: 38,
    description: "Manages all manufacturing operations including filling, packaging, labelling and quality-inline checks for consumer care product lines.",
    recentActivities: [
      { time: "2 hours ago",  action: "PM task PM-2041 marked In Progress", by: "Rajesh Kumar" },
      { time: "Yesterday",    action: "Line A throughput target met – 12,400 bottles", by: "Rakesh Malhotra" },
      { time: "2 days ago",   action: "QA inspection QI-3012 passed for batch B-1441", by: "Priya Nair" },
      { time: "3 days ago",   action: "CNC machine MCH-CNC-001 reported offline", by: "Rajesh Kumar" },
    ],
    monthlyKPIs: [
      { label: "Output (Units)", value: "3,84,000", trend: "up" },
      { label: "OEE", value: "78.4%", trend: "up" },
      { label: "Defect Rate", value: "0.32%", trend: "down" },
      { label: "PM Compliance", value: "91%", trend: "flat" },
    ],
  },
  {
    id: "DEPT-002", name: "IT Department", head: "Arun Sharma", manager: "Vikram Singh",
    location: "Data Center – 2nd Floor, Server Room 1 & 2", employees: 12, machines: 5,
    openPM: 3, openQA: 2, backupJobs: 10, performanceScore: 94,
    status: "Active", budget: 28, budgetUsed: 19,
    description: "Responsible for all IT infrastructure, network, server management, backup operations, cybersecurity, and enterprise software availability.",
    recentActivities: [
      { time: "30 min ago",   action: "ERP Full Backup BK-2001 completed successfully", by: "Arjun Rao" },
      { time: "3 hours ago",  action: "HVAC critical alert raised – server room temp elevated", by: "Vikram Singh" },
      { time: "Yesterday",    action: "Cisco Catalyst firmware upgraded to 17.9.4", by: "Vikram Singh" },
      { time: "2 days ago",   action: "VMware ESXi snapshot backup failed – ticket raised", by: "Arjun Rao" },
    ],
    monthlyKPIs: [
      { label: "Uptime", value: "99.7%", trend: "up" },
      { label: "Backup Success", value: "94.2%", trend: "down" },
      { label: "Incidents Resolved", value: "18/20", trend: "up" },
      { label: "Avg Response Time", value: "4.2h", trend: "flat" },
    ],
  },
  {
    id: "DEPT-003", name: "Warehouse", head: "Sudhir Patil", manager: "Suresh Babu",
    location: "Warehouse Block – Zone A, B, C", employees: 28, machines: 3,
    openPM: 2, openQA: 3, backupJobs: 1, performanceScore: 79,
    status: "Active", budget: 18, budgetUsed: 14,
    description: "Manages inbound and outbound logistics, raw material storage, finished goods inventory, and dispatch for all product lines.",
    recentActivities: [
      { time: "1 hour ago",   action: "Conveyor belt PM due – scheduled for today", by: "Suresh Babu" },
      { time: "Yesterday",    action: "Inventory cycle count completed – Zone B", by: "Sudhir Patil" },
      { time: "3 days ago",   action: "New pallet batch received – SKU GR-2281", by: "Suresh Babu" },
      { time: "4 days ago",   action: "Dispatch target achieved – 98.5% on-time", by: "Sudhir Patil" },
    ],
    monthlyKPIs: [
      { label: "Dispatch Accuracy", value: "98.5%", trend: "up" },
      { label: "Inventory Turns", value: "7.2x", trend: "flat" },
      { label: "Space Utilization", value: "84%", trend: "up" },
      { label: "Damage Rate", value: "0.18%", trend: "down" },
    ],
  },
  {
    id: "DEPT-004", name: "Engineering", head: "Ramesh Nair", manager: "Meena Pillai",
    location: "Engineering Block – Ground Floor, Generator Shed", employees: 10, machines: 4,
    openPM: 3, openQA: 1, backupJobs: 0, performanceScore: 72,
    status: "Under Review", budget: 22, budgetUsed: 20,
    description: "Manages plant maintenance, power systems, chiller units, compressed air, utility systems and engineering support to ensure uninterrupted plant operations.",
    recentActivities: [
      { time: "2 hours ago",  action: "Water Treatment Plant critical alert raised", by: "Suresh Babu" },
      { time: "Yesterday",    action: "Diesel Generator monthly PM completed", by: "Rajesh Kumar" },
      { time: "2 days ago",   action: "Chiller maintenance overdue – escalated", by: "Ramesh Nair" },
      { time: "5 days ago",   action: "Power factor correction capacitor serviced", by: "Meena Pillai" },
    ],
    monthlyKPIs: [
      { label: "Power Availability", value: "99.1%", trend: "flat" },
      { label: "Energy Efficiency", value: "82.3%", trend: "down" },
      { label: "Water Consumption", value: "4,200 KL", trend: "up" },
      { label: "PM Completion", value: "68%", trend: "down" },
    ],
  },
  {
    id: "DEPT-005", name: "Quality Control", head: "Dr. Anita Desai", manager: "Deepa Iyer",
    location: "Quality Lab – Room 204, Inline QA Stations", employees: 16, machines: 2,
    openPM: 1, openQA: 5, backupJobs: 1, performanceScore: 91,
    status: "Active", budget: 14, budgetUsed: 10,
    description: "Responsible for product quality assurance, lab testing, QA audits, GMP compliance, batch release and incoming raw material inspection.",
    recentActivities: [
      { time: "4 hours ago",  action: "Autoclave early PM completed – all validations passed", by: "Anita Desai" },
      { time: "Yesterday",    action: "Batch B-1441 cleared for dispatch after QA", by: "Deepa Iyer" },
      { time: "2 days ago",   action: "Monthly GMP audit report submitted", by: "Dr. Anita Desai" },
      { time: "3 days ago",   action: "New SOP SOQ-2026-07 approved and deployed", by: "Deepa Iyer" },
    ],
    monthlyKPIs: [
      { label: "First Pass Yield", value: "97.8%", trend: "up" },
      { label: "Audit Score", value: "94/100", trend: "up" },
      { label: "Defects Detected", value: "12", trend: "down" },
      { label: "Lab TAT", value: "4.1h", trend: "flat" },
    ],
  },
  {
    id: "DEPT-006", name: "HR & Admin", head: "Sunita Bose", manager: "Deepa Iyer",
    location: "Admin Block – 1st Floor", employees: 8, machines: 0,
    openPM: 0, openQA: 0, backupJobs: 2, performanceScore: 83,
    status: "Active", budget: 8, budgetUsed: 6,
    description: "Manages HR operations, facility administration, procurement, vendor management, payroll coordination and compliance reporting.",
    recentActivities: [
      { time: "1 day ago",    action: "Q2 HR payroll processing completed", by: "Sunita Bose" },
      { time: "2 days ago",   action: "Vendor contract renewal for AMC services approved", by: "Sunita Bose" },
      { time: "4 days ago",   action: "Annual leave calendar Q3 published", by: "Deepa Iyer" },
      { time: "6 days ago",   action: "New safety compliance training scheduled", by: "Sunita Bose" },
    ],
    monthlyKPIs: [
      { label: "Payroll Accuracy", value: "100%", trend: "flat" },
      { label: "Vendor TAT", value: "3.2 days", trend: "down" },
      { label: "Compliance Score", value: "96%", trend: "up" },
      { label: "Grievances Open", value: "1", trend: "flat" },
    ],
  },
];

export const EMPLOYEES: Employee[] = [
  { id: "EMP-001", name: "Rajesh Kumar", role: "Senior Maintenance User", department: "Production", email: "rajesh.kumar@rajaram.com", phone: "+91 98201 11001", employeeId: "RCC-EMP-2018-001", workload: 85, assignedMachines: 4, availability: "Busy", status: "Active", initials: "RK", avatarColor: "bg-blue-100 text-blue-700" },
  { id: "EMP-002", name: "Priya Nair", role: "Quality & Production Lead", department: "Production", email: "priya.nair@rajaram.com", phone: "+91 98202 11002", employeeId: "RCC-EMP-2019-002", workload: 72, assignedMachines: 2, availability: "Available", status: "Active", initials: "PN", avatarColor: "bg-purple-100 text-purple-700" },
  { id: "EMP-003", name: "Suresh Babu", role: "Mechanical User", department: "Production", email: "suresh.babu@rajaram.com", phone: "+91 98203 11003", employeeId: "RCC-EMP-2017-003", workload: 90, assignedMachines: 5, availability: "Busy", status: "Active", initials: "SB", avatarColor: "bg-emerald-100 text-emerald-700" },
  { id: "EMP-004", name: "Anita Desai", role: "QA Lab Manager", department: "Quality Control", email: "anita.desai@rajaram.com", phone: "+91 98204 11004", employeeId: "RCC-EMP-2016-004", workload: 60, assignedMachines: 1, availability: "Available", status: "Active", initials: "AD", avatarColor: "bg-rose-100 text-rose-700" },
  { id: "EMP-005", name: "Vikram Singh", role: "Network & Systems Admin", department: "IT Department", email: "vikram.singh@rajaram.com", phone: "+91 98205 11005", employeeId: "RCC-EMP-2020-005", workload: 78, assignedMachines: 2, availability: "Remote", status: "Active", initials: "VS", avatarColor: "bg-indigo-100 text-indigo-700" },
  { id: "EMP-006", name: "Meena Pillai", role: "HVAC & Utilities User", department: "Engineering", email: "meena.pillai@rajaram.com", phone: "+91 98206 11006", employeeId: "RCC-EMP-2018-006", workload: 95, assignedMachines: 3, availability: "Busy", status: "Active", initials: "MP", avatarColor: "bg-amber-100 text-amber-700" },
  { id: "EMP-007", name: "Arjun Rao", role: "IT Infrastructure User", department: "IT Department", email: "arjun.rao@rajaram.com", phone: "+91 98207 11007", employeeId: "RCC-EMP-2021-007", workload: 68, assignedMachines: 3, availability: "Available", status: "Active", initials: "AR", avatarColor: "bg-cyan-100 text-cyan-700" },
  { id: "EMP-008", name: "Deepa Iyer", role: "QA Compliance Analyst", department: "Quality Control", email: "deepa.iyer@rajaram.com", phone: "+91 98208 11008", employeeId: "RCC-EMP-2022-008", workload: 55, assignedMachines: 1, availability: "Available", status: "Active", initials: "DI", avatarColor: "bg-teal-100 text-teal-700" },
  { id: "EMP-009", name: "Ramesh Nair", role: "Engineering Department Head", department: "Engineering", email: "ramesh.nair@rajaram.com", phone: "+91 98209 11009", employeeId: "RCC-EMP-2015-009", workload: 40, assignedMachines: 0, availability: "Available", status: "Active", initials: "RN", avatarColor: "bg-orange-100 text-orange-700" },
  { id: "EMP-010", name: "Sudhir Patil", role: "Warehouse Operations Head", department: "Warehouse", email: "sudhir.patil@rajaram.com", phone: "+91 98210 11010", employeeId: "RCC-EMP-2016-010", workload: 62, assignedMachines: 0, availability: "Available", status: "Active", initials: "SP", avatarColor: "bg-lime-100 text-lime-700" },
  { id: "EMP-011", name: "Kavita Sharma", role: "Production Supervisor", department: "Production", email: "kavita.sharma@rajaram.com", phone: "+91 98211 11011", employeeId: "RCC-EMP-2019-011", workload: 80, assignedMachines: 2, availability: "Busy", status: "Active", initials: "KS", avatarColor: "bg-pink-100 text-pink-700" },
  { id: "EMP-012", name: "Arun Sharma", role: "IT Administrator", department: "IT Department", email: "arun.sharma@rajaram.com", phone: "+91 98212 11012", employeeId: "RCC-EMP-2014-012", workload: 50, assignedMachines: 0, availability: "Available", status: "Active", initials: "AS", avatarColor: "bg-blue-200 text-blue-800" },
  { id: "EMP-013", name: "Sunita Bose", role: "HR & Admin Head", department: "HR & Admin", email: "sunita.bose@rajaram.com", phone: "+91 98213 11013", employeeId: "RCC-EMP-2013-013", workload: 45, assignedMachines: 0, availability: "Available", status: "Active", initials: "SB", avatarColor: "bg-violet-100 text-violet-700" },
  { id: "EMP-014", name: "Mohan Krishnan", role: "Electrical Maintenance User", department: "Engineering", email: "mohan.k@rajaram.com", phone: "+91 98214 11014", employeeId: "RCC-EMP-2020-014", workload: 70, assignedMachines: 2, availability: "Remote", status: "Active", initials: "MK", avatarColor: "bg-red-100 text-red-700" },
  { id: "EMP-015", name: "Lakshmi Venkat", role: "QA Inspector", department: "Quality Control", email: "lakshmi.v@rajaram.com", phone: "+91 98215 11015", employeeId: "RCC-EMP-2023-015", workload: 65, assignedMachines: 1, availability: "Available", status: "Active", initials: "LV", avatarColor: "bg-fuchsia-100 text-fuchsia-700" },
  { id: "EMP-016", name: "Ganesh Murthy", role: "Warehouse Supervisor", department: "Warehouse", email: "ganesh.m@rajaram.com", phone: "+91 98216 11016", employeeId: "RCC-EMP-2021-016", workload: 58, assignedMachines: 0, availability: "On Leave", status: "On Leave", initials: "GM", avatarColor: "bg-slate-100 text-slate-600" },
];

function deptStatusCfg(status: DeptRecord["status"]) {
  switch (status) {
    case "Active":          return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" };
    case "Under Review":    return { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-500" };
    case "Restructuring":   return { bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",     dot: "bg-red-500" };
  }
}

function empAvailCfg(av: Employee["availability"]) {
  switch (av) {
    case "Available": return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" };
    case "Busy":      return { bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",     dot: "bg-red-500" };
    case "On Leave":  return { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-500" };
    case "Remote":    return { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    dot: "bg-blue-500" };
  }
}

function DeptStatusBadge({ status }: { status: DeptRecord["status"] }) {
  const c = deptStatusCfg(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} shrink-0`} /> {status}
    </span>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const c = score >= 90 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : score >= 75 ? "bg-blue-50 text-blue-700 border-blue-200" : score >= 60 ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-red-50 text-red-700 border-red-200";
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${c}`}>{score}%</span>;
}

// ─── 1. DEPARTMENT DASHBOARD ──────────────────────────────────────────────────

const DEPT_MONTHLY_PERF = [
  { month: "Jan", production: 82, it: 96, warehouse: 74, utilities: 78, qa: 89 },
  { month: "Feb", production: 85, it: 95, warehouse: 76, utilities: 75, qa: 91 },
  { month: "Mar", production: 80, it: 97, warehouse: 79, utilities: 71, qa: 90 },
  { month: "Apr", production: 88, it: 94, warehouse: 77, utilities: 74, qa: 93 },
  { month: "May", production: 84, it: 96, warehouse: 80, utilities: 70, qa: 91 },
  { month: "Jun", production: 87, it: 93, warehouse: 79, utilities: 72, qa: 91 },
  { month: "Jul", production: 87, it: 94, warehouse: 79, utilities: 72, qa: 91 },
];

const TASK_DIST = DEPT_RECORDS.map(d => ({
  name: d.name.split(" ")[0], pm: d.openPM, qa: d.openQA, backup: d.backupJobs,
}));

function DeptDashboardTab({ onViewDetails }: { onViewDetails: (d: DeptRecord) => void }) {
  const totalDepts = DEPT_RECORDS.length;
  const activeDepts = DEPT_RECORDS.filter(d => d.status === "Active").length;
  const totalEmployees = DEPT_RECORDS.reduce((s, d) => s + d.employees, 0);
  const activeMachines = MACHINES.filter(m => m.status === "Healthy" || m.status === "Warning").length;
  const openTasks = DEPT_RECORDS.reduce((s, d) => s + d.openPM + d.openQA, 0);
  const avgPerf = Math.round(DEPT_RECORDS.reduce((s, d) => s + d.performanceScore, 0) / DEPT_RECORDS.length);

  const PIE_COLORS = ["#2563EB", "#7C3AED", "#D97706", "#16A34A", "#DC2626", "#0891B2"];

  const recentActivities = DEPT_RECORDS.flatMap(d =>
    d.recentActivities.slice(0, 1).map(a => ({ ...a, dept: d.name }))
  ).slice(0, 6);

  const upcomingReviews = [
    { dept: "Engineering", date: "2026-07-08", type: "Performance Review", reviewer: "COO Office" },
    { dept: "Production", date: "2026-07-10", type: "Monthly KPI Review", reviewer: "Plant Manager" },
    { dept: "IT Department", date: "2026-07-12", type: "Security Audit", reviewer: "CISO" },
    { dept: "Quality Control", date: "2026-07-15", type: "GMP Compliance Audit", reviewer: "Regulatory Team" },
    { dept: "Warehouse", date: "2026-07-18", type: "Inventory Audit", reviewer: "Finance Team" },
  ];

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {[
          { label: "Total Departments", val: totalDepts,     icon: Layers,       bg: "bg-blue-50",    border: "border-blue-100",    text: "text-blue-600",    sub: "All divisions" },
          { label: "Active",            val: activeDepts,    icon: CheckCircle2, bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-600", sub: "Fully operational" },
          { label: "Total Employees",   val: totalEmployees, icon: User,         bg: "bg-indigo-50",  border: "border-indigo-100",  text: "text-indigo-600",  sub: "All headcount" },
          { label: "Active Machines",   val: activeMachines, icon: Server,       bg: "bg-slate-50",   border: "border-slate-200",   text: "text-slate-600",   sub: "Running assets" },
          { label: "Open Tasks",        val: openTasks,      icon: AlertTriangle,bg: "bg-amber-50",   border: "border-amber-100",   text: "text-amber-600",   sub: "Pending actions" },
          { label: "Avg Performance",   val: `${avgPerf}%`,  icon: TrendingUp,   bg: "bg-purple-50",  border: "border-purple-100",  text: "text-purple-600",  sub: "Monthly score" },
        ].map((kpi, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-tight">{kpi.label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${kpi.bg} border ${kpi.border}`}>
                <kpi.icon size={15} className={kpi.text} />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">{kpi.val}</div>
            <div className="text-[11px] font-medium text-slate-400">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Performance Overview + Task Dist */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        <div className="xl:col-span-3 bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Department Performance Overview</h3>
              <p className="text-xs text-slate-400 mt-0.5">Monthly performance score trend · 2026</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
              {[["#2563EB","Production"],["#7C3AED","IT Infra"],["#D97706","Warehouse"],["#EF4444","Engineering"],["#10B981","QA"]].map(([c,l]) => (
                <span key={l} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: c }} />{l}
                </span>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={DEPT_MONTHLY_PERF} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} domain={[60, 100]} />
              <RechartsTooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E2E8F0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} />
              <Area type="monotone" dataKey="production" stroke="#2563EB" fill="#EFF6FF" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="it" stroke="#7C3AED" fill="#F5F3FF" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="warehouse" stroke="#D97706" fill="#FFFBEB" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="utilities" stroke="#EF4444" fill="#FEF2F2" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="qa" stroke="#10B981" fill="#ECFDF5" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Task Distribution by Department</h3>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={TASK_DIST} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <RechartsTooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E2E8F0" }} />
              <Bar dataKey="pm" name="Open PM" fill="#2563EB" radius={[4, 4, 0, 0]} stackId="a" />
              <Bar dataKey="qa" name="Open QA" fill="#7C3AED" radius={[0, 0, 0, 0]} stackId="a" />
              <Bar dataKey="backup" name="Backup Jobs" fill="#10B981" radius={[4, 4, 0, 0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-3 text-[11px] text-slate-500 justify-center">
            {[["bg-blue-600","Open PM"],["bg-purple-600","Open QA"],["bg-emerald-500","Backup"]].map(([c,l]) => (
              <span key={l} className="flex items-center gap-1.5"><span className={`w-2 h-2 rounded-sm ${c}`} />{l}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activities + Upcoming Reviews + Dept Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Activity size={15} className="text-blue-500" /> Recent Department Activities
          </h3>
          <div className="relative border-l-2 border-slate-100 ml-2 space-y-4">
            {recentActivities.map((a, i) => (
              <div key={i} className="relative pl-5">
                <div className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{a.time} · {a.dept}</div>
                <div className="text-xs font-semibold text-slate-800 leading-snug">{a.action}</div>
                <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1"><User size={9} />{a.by}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <CalendarClock size={15} className="text-purple-500" /> Upcoming Reviews
          </h3>
          <div className="space-y-2.5">
            {upcomingReviews.map((r, i) => {
              const days = daysUntil(r.date);
              return (
                <div key={i} className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-100 rounded-xl hover:border-slate-200 transition-colors">
                  <div className="w-10 h-10 rounded-lg flex flex-col items-center justify-center bg-white border border-slate-200 shrink-0">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">{new Date(r.date).toLocaleDateString("en-IN",{month:"short"})}</span>
                    <span className="text-sm font-bold text-slate-700 leading-none">{new Date(r.date).getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">{r.type}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{r.dept} · {r.reviewer}</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${days <= 3 ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-500"}`}>{days}d</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Layers size={15} className="text-slate-400" /> Department Performance
          </h3>
          <div className="space-y-3">
            {DEPT_RECORDS.map((d, i) => (
              <div key={i} className="flex items-center gap-3 cursor-pointer group" onClick={() => onViewDetails(d)}>
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                  <Layers size={13} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">{d.name}</span>
                    <span className={`text-[11px] font-bold ml-2 ${d.performanceScore >= 85 ? "text-emerald-600" : d.performanceScore >= 70 ? "text-amber-600" : "text-red-600"}`}>{d.performanceScore}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${d.performanceScore >= 85 ? "bg-emerald-500" : d.performanceScore >= 70 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${d.performanceScore}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 2. DEPARTMENT DIRECTORY ──────────────────────────────────────────────────

function DeptDirectoryTab({ records, onEdit, onDelete }: {
  records: DeptRecord[];
  onEdit: (d: DeptRecord) => void;
  onDelete: (d: DeptRecord) => void;
}) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filtered = useMemo(() => {
    let d = [...records];
    if (search) { const q = search.toLowerCase(); d = d.filter(r => r.name.toLowerCase().includes(q) || r.head.toLowerCase().includes(q) || r.location.toLowerCase().includes(q)); }
    if (filterStatus) d = d.filter(r => r.status === filterStatus);
    d.sort((a, b) => {
      let cmp = 0;
      if (sortField === "name") cmp = a.name.localeCompare(b.name);
      else if (sortField === "employees") cmp = a.employees - b.employees;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return d;
  }, [records, search, filterStatus, sortField, sortDir]);

  const SortBtn = ({ field }: { field: string }) => (
    <button onClick={() => { if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortField(field); setSortDir("asc"); } }}>
      <ArrowUpDown size={11} className={sortField === field ? "text-blue-500" : "text-slate-300"} />
    </button>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search departments, heads, location..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-4 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-400" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-slate-700">
          <option value="">All Statuses</option>
          {["Active","Under Review","Restructuring"].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/50">
          <span className="text-xs font-semibold text-slate-500">Showing <span className="font-bold text-slate-900">{filtered.length}</span> of {records.length} departments</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50/70 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-5 py-3"><div className="flex items-center gap-1">Department <SortBtn field="name" /></div></th>
                <th className="px-4 py-3">Department Head</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3"><div className="flex items-center gap-1">Employees <SortBtn field="employees" /></div></th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map(dept => (
                <tr key={dept.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center shrink-0">
                        <Layers size={13} className="text-blue-600" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{dept.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{dept.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[9px] font-bold shrink-0">
                        {dept.head.split(" ").map(n => n[0]).join("").slice(0,2)}
                      </div>
                      <div>
                        <div className="text-xs text-slate-700 font-medium">{dept.head}</div>
                        {dept.manager && dept.manager !== dept.head && <div className="text-[10px] text-slate-400">Manager: {dept.manager}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-600 max-w-[200px] truncate">{dept.location || "—"}</td>
                  <td className="px-4 py-3.5 text-xs font-semibold text-slate-900">{dept.employees}</td>
                  <td className="px-4 py-3.5"><DeptStatusBadge status={dept.status} /></td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onEdit(dept)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Edit"><Edit2 size={14} /></button>
                      <button onClick={() => onDelete(dept)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-400">No departments match your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/30">
          <span className="text-xs text-slate-500">Page 1 of 1</span>
          <div className="flex items-center gap-1">
            <button disabled className="h-7 px-2.5 text-xs font-medium text-slate-400 bg-white border border-slate-200 rounded-md disabled:opacity-40">Previous</button>
            <button className="h-7 w-7 text-xs font-bold text-white bg-blue-600 rounded-md">1</button>
            <button disabled className="h-7 px-2.5 text-xs font-medium text-slate-400 bg-white border border-slate-200 rounded-md disabled:opacity-40">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 3. DEPARTMENT DETAILS ─────────────────────────────────────────────────────

function DeptDetailsTab({ dept, onGoToDirectory }: { dept: DeptRecord | null; onGoToDirectory: () => void }) {
  const [section, setSection] = useState<"overview" | "kpis" | "tasks" | "team" | "reports">("overview");
  if (!dept) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mb-5">
          <Layers size={28} className="text-blue-400" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-2">No Department Selected</h3>
        <p className="text-sm text-slate-500 max-w-xs mb-6">Select a department from the Directory to view its full profile, KPIs and team.</p>
        <button onClick={onGoToDirectory} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
          <Table2 size={14} /> Browse Directory
        </button>
      </div>
    );
  }

  const deptEmployees = EMPLOYEES.filter(e => e.department === dept.name);
  const deptMachines = MACHINES.filter(m => m.department === dept.name);
  const budgetPct = Math.round((dept.budgetUsed / dept.budget) * 100);

  const sections = [
    { id: "overview", label: "Overview" }, { id: "kpis", label: "Monthly KPIs" },
    { id: "tasks", label: "Tasks & Workload" }, { id: "team", label: "Team" }, { id: "reports", label: "Recent Reports" },
  ] as const;

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0">
              <Layers size={26} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{dept.name}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className="text-xs font-mono text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">{dept.id}</span>
                <DeptStatusBadge status={dept.status} />
                <ScoreBadge score={dept.performanceScore} />
              </div>
              <p className="text-xs text-slate-500 mt-3 max-w-xl leading-relaxed">{dept.description}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <button className="flex items-center gap-2 h-8 px-3 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"><Edit2 size={12} /> Edit Department</button>
            <button className="flex items-center gap-2 h-8 px-3 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"><FileSpreadsheet size={12} /> Generate Report</button>
            <button className="flex items-center gap-2 h-8 px-3 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"><UserCheck size={12} /> Assign Manager</button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          {[
            { label: "Department Head", value: dept.head },
            { label: "Manager", value: dept.manager },
            { label: "Location", value: dept.location },
            { label: "Headcount", value: `${dept.employees} employees` },
          ].map(item => (
            <div key={item.label} className="bg-slate-50 border border-slate-100 rounded-xl p-3">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{item.label}</div>
              <div className="text-xs font-semibold text-slate-900 leading-tight">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-0 border-b border-slate-200 overflow-x-auto">
        {sections.map(s => (
          <button key={s.id} onClick={() => setSection(s.id as typeof section)} className={`px-5 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${section === s.id ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
            {s.label}
          </button>
        ))}
      </div>

      {section === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4">Workload & Resources</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Employees", val: dept.employees, icon: User, color: "text-blue-600", bg: "bg-blue-50" },
                  { label: "Machines", val: dept.machines, icon: Server, color: "text-slate-600", bg: "bg-slate-50" },
                  { label: "Open Tasks", val: dept.openPM + dept.openQA, icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
                ].map(item => (
                  <div key={item.label} className={`${item.bg} border border-slate-100 rounded-xl p-4 text-center`}>
                    <item.icon size={20} className={`${item.color} mx-auto mb-2`} />
                    <div className="text-2xl font-bold text-slate-900">{item.val}</div>
                    <div className="text-[10px] text-slate-500 font-semibold">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4">Recent Activities</h3>
              <div className="relative border-l-2 border-slate-100 ml-2 space-y-4">
                {dept.recentActivities.map((a, i) => (
                  <div key={i} className="relative pl-5">
                    <div className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{a.time}</div>
                    <div className="text-xs font-semibold text-slate-800 leading-snug">{a.action}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1"><User size={9} />{a.by}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4">Budget Utilization</h3>
              <div className="text-center mb-3">
                <div className="text-2xl font-bold text-slate-900">₹{dept.budgetUsed}L</div>
                <div className="text-xs text-slate-400">of ₹{dept.budget}L allocated</div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 mb-2">
                <div className={`h-3 rounded-full transition-all ${budgetPct > 90 ? "bg-red-500" : budgetPct > 75 ? "bg-amber-500" : "bg-blue-600"}`} style={{ width: `${budgetPct}%` }} />
              </div>
              <div className={`text-xs font-bold text-center ${budgetPct > 90 ? "text-red-600" : budgetPct > 75 ? "text-amber-600" : "text-blue-600"}`}>{budgetPct}% used</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4">Assigned Machines</h3>
              <div className="space-y-2">
                {deptMachines.length === 0 ? (
                  <div className="text-xs text-slate-400 text-center py-4">No machines assigned</div>
                ) : deptMachines.slice(0, 4).map(m => {
                  const cfg = mchStatusCfg(m.status);
                  return (
                    <div key={m.id} className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <div className={`w-2 h-2 rounded-full ${cfg.dot} shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-slate-900 truncate">{m.name.split("–")[0].trim()}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{m.id}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {section === "kpis" && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4">Monthly KPIs · July 2026</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {dept.monthlyKPIs.map((kpi, i) => (
              <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-5 text-center">
                <div className="text-2xl font-bold text-slate-900 mb-1">{kpi.value}</div>
                <div className="text-xs font-semibold text-slate-600 mb-2">{kpi.label}</div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${kpi.trend === "up" ? "bg-emerald-50 text-emerald-600" : kpi.trend === "down" ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-500"}`}>
                  {kpi.trend === "up" ? "↑ Improving" : kpi.trend === "down" ? "↓ Declining" : "→ Stable"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {section === "tasks" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {[
            { label: "Open PM Tasks", val: dept.openPM, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", desc: "Preventive maintenance pending" },
            { label: "Open QA Items", val: dept.openQA, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200", desc: "QA inspections & audits" },
            { label: "Backup Jobs", val: dept.backupJobs, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", desc: "Scheduled backup operations" },
          ].map((t, i) => (
            <div key={i} className={`bg-white border border-slate-200 rounded-xl shadow-sm p-5 border-l-4 ${t.border}`}>
              <div className={`text-3xl font-bold ${t.color} mb-1`}>{t.val}</div>
              <div className="text-sm font-bold text-slate-900">{t.label}</div>
              <div className="text-xs text-slate-400 mt-1">{t.desc}</div>
            </div>
          ))}
        </div>
      )}

      {section === "team" && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{dept.name} Team · {deptEmployees.length} members</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-5">
            {deptEmployees.map(emp => {
              const avCfg = empAvailCfg(emp.availability);
              return (
                <div key={emp.id} className="flex items-start gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl hover:border-blue-200 transition-colors">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${emp.avatarColor}`}>{emp.initials}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900">{emp.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{emp.role}</div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">{emp.employeeId}</div>
                    <div className="mt-2">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${avCfg.bg} ${avCfg.text} ${avCfg.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${avCfg.dot}`} />{emp.availability}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {section === "reports" && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4">Recent Reports · {dept.name}</h3>
          <div className="space-y-3">
            {[
              { title: `${dept.name} – June 2026 Monthly Report`, date: "2026-07-01", type: "Monthly Summary", size: "2.4 MB" },
              { title: `${dept.name} – Q2 2026 Performance Report`, date: "2026-07-03", type: "Quarterly Report", size: "4.8 MB" },
              { title: `${dept.name} – Maintenance Cost Analysis`, date: "2026-06-28", type: "Cost Analysis", size: "1.2 MB" },
            ].map((r, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
                <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center shrink-0">
                  <FileText size={18} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">{r.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{r.type} · {r.date} · {r.size}</div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button className="h-7 px-2.5 text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Preview</button>
                  <button className="h-7 px-2.5 text-[11px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">Download</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 4. TEAM MEMBERS ──────────────────────────────────────────────────────────

function TeamMembersTab() {
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterAvail, setFilterAvail] = useState("");

  const filtered = useMemo(() => {
    let d = [...EMPLOYEES];
    if (search) { const q = search.toLowerCase(); d = d.filter(e => e.name.toLowerCase().includes(q) || e.role.toLowerCase().includes(q) || e.employeeId.toLowerCase().includes(q)); }
    if (filterDept) d = d.filter(e => e.department === filterDept);
    if (filterAvail) d = d.filter(e => e.availability === filterAvail);
    return d;
  }, [search, filterDept, filterAvail]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search employees, roles..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-4 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-400" />
        </div>
        <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-slate-700">
          <option value="">All Departments</option>
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={filterAvail} onChange={e => setFilterAvail(e.target.value)} className="h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-slate-700">
          <option value="">All Availability</option>
          {["Available","Busy","On Leave","Remote"].map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">{filtered.length} members</span>
          <button className="flex items-center gap-1.5 h-9 px-4 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"><Plus size={13} /> Add Employee</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {filtered.map(emp => {
          const avCfg = empAvailCfg(emp.availability);
          const wlColor = emp.workload >= 85 ? "bg-red-500" : emp.workload >= 70 ? "bg-amber-500" : "bg-emerald-500";
          const wlText = emp.workload >= 85 ? "text-red-600" : emp.workload >= 70 ? "text-amber-600" : "text-emerald-600";
          return (
            <div key={emp.id} className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col">
              <div className="p-5 flex-1">
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold shrink-0 border ${emp.avatarColor}`}>{emp.initials}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-slate-900 leading-tight">{emp.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5 leading-snug">{emp.role}</div>
                    <div className="mt-1.5">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${avCfg.bg} ${avCfg.text} ${avCfg.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${avCfg.dot}`} />{emp.availability}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3 text-[10px]">
                  {[
                    { label: "Employee ID", val: emp.employeeId },
                    { label: "Department", val: emp.department.split(" ")[0] },
                    { label: "Phone", val: emp.phone },
                    { label: "Machines", val: `${emp.assignedMachines} assigned` },
                  ].map(item => (
                    <div key={item.label} className="bg-slate-50 rounded-lg p-2">
                      <div className="text-slate-400 font-bold uppercase tracking-wide mb-0.5">{item.label}</div>
                      <div className="text-slate-700 font-semibold truncate" title={item.val}>{item.val}</div>
                    </div>
                  ))}
                </div>

                <div className="text-[10px] text-slate-400 truncate mb-2 flex items-center gap-1">
                  <Mail size={9} className="shrink-0" />{emp.email}
                </div>

                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1.5">
                    <span>Current Workload</span>
                    <span className={`font-bold ${wlText}`}>{emp.workload}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${wlColor}`} style={{ width: `${emp.workload}%` }} />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 px-4 py-3 flex gap-2">
                <button className="flex-1 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">View Profile</button>
                <button className="flex-1 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">Assign Task</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── 5. DEPARTMENT ANALYTICS ──────────────────────────────────────────────────

const DEPT_ANALYTICS_MONTHLY = [
  { month: "Jan", taskCompletion: 88, machineUtil: 72, backupSuccess: 92, qaPass: 95 },
  { month: "Feb", taskCompletion: 85, machineUtil: 74, backupSuccess: 96, qaPass: 93 },
  { month: "Mar", taskCompletion: 91, machineUtil: 69, backupSuccess: 91, qaPass: 97 },
  { month: "Apr", taskCompletion: 87, machineUtil: 76, backupSuccess: 94, qaPass: 96 },
  { month: "May", taskCompletion: 83, machineUtil: 78, backupSuccess: 89, qaPass: 94 },
  { month: "Jun", taskCompletion: 90, machineUtil: 75, backupSuccess: 93, qaPass: 98 },
  { month: "Jul", taskCompletion: 88, machineUtil: 74, backupSuccess: 94, qaPass: 97 },
];

const EMP_UTIL = EMPLOYEES.slice(0, 8).map(e => ({ name: e.name.split(" ")[0], workload: e.workload }));

function DeptAnalyticsTab() {
  const deptPerfBar = DEPT_RECORDS.map(d => ({ name: d.name.split(" ")[0], score: d.performanceScore, employees: d.employees }));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Avg Task Completion", value: "88.4%", trend: "↑ +2.1%", color: "text-emerald-600" },
          { label: "Machine Utilization", value: "74.2%", trend: "↑ +1.8%", color: "text-blue-600" },
          { label: "Backup Success Rate", value: "94.1%", trend: "↓ -0.9%", color: "text-amber-600" },
          { label: "QA Pass Rate", value: "96.8%", trend: "↑ +0.6%", color: "text-purple-600" },
        ].map((kpi, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{kpi.label}</div>
            <div className={`text-2xl font-bold ${kpi.color} mb-1`}>{kpi.value}</div>
            <div className={`text-[11px] font-semibold ${kpi.trend.startsWith("↑") ? "text-emerald-500" : "text-red-500"}`}>{kpi.trend} MoM</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <div className="mb-5"><h3 className="text-sm font-bold text-slate-900">Monthly Productivity Trend</h3><p className="text-xs text-slate-400 mt-0.5">Key operational metrics · 2026 YTD</p></div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={DEPT_ANALYTICS_MONTHLY} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} domain={[60, 100]} />
              <RechartsTooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E2E8F0" }} />
              <Area type="monotone" dataKey="taskCompletion" name="Task Completion" stroke="#2563EB" fill="#EFF6FF" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="qaPass" name="QA Pass Rate" stroke="#10B981" fill="#ECFDF5" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="backupSuccess" name="Backup Success" stroke="#7C3AED" fill="#F5F3FF" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <div className="mb-5"><h3 className="text-sm font-bold text-slate-900">Department Performance Comparison</h3><p className="text-xs text-slate-400 mt-0.5">Current month performance score</p></div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={deptPerfBar} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} width={70} />
              <RechartsTooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E2E8F0" }} />
              <Bar dataKey="score" name="Performance Score" fill="#2563EB" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <div className="mb-5"><h3 className="text-sm font-bold text-slate-900">Machine Utilization Trend</h3><p className="text-xs text-slate-400 mt-0.5">Average % across all departments</p></div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={DEPT_ANALYTICS_MONTHLY} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} domain={[60, 85]} />
              <RechartsTooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E2E8F0" }} />
              <Area type="monotone" dataKey="machineUtil" name="Utilization %" stroke="#F59E0B" fill="#FFFBEB" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Employee Utilization</h3>
          <div className="space-y-2.5">
            {EMP_UTIL.map((e, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-20 text-[10px] font-semibold text-slate-600 truncate">{e.name}</div>
                <div className="flex-1 bg-slate-100 rounded-full h-2">
                  <div className={`h-2 rounded-full ${e.workload >= 85 ? "bg-red-500" : e.workload >= 70 ? "bg-amber-500" : "bg-blue-500"}`} style={{ width: `${e.workload}%` }} />
                </div>
                <span className={`text-[10px] font-bold w-9 text-right ${e.workload >= 85 ? "text-red-600" : e.workload >= 70 ? "text-amber-600" : "text-blue-600"}`}>{e.workload}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 6. DEPARTMENT CALENDAR ────────────────────────────────────────────────────

const DEPT_CALENDAR_EVENTS = [
  { date: "2026-07-03", title: "PM Due – Filling Machine", type: "maintenance", dept: "Production", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { date: "2026-07-05", title: "Core Network Switch PM", type: "maintenance", dept: "IT Infra", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { date: "2026-07-07", title: "Diesel Generator PM", type: "maintenance", dept: "Engineering", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { date: "2026-07-08", title: "Engineering Performance Review", type: "review", dept: "Engineering", color: "bg-purple-100 text-purple-700 border-purple-200" },
  { date: "2026-07-08", title: "Weekly QA Audit – Batch B-14", type: "qa", dept: "QA", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { date: "2026-07-10", title: "Monthly KPI Review", type: "review", dept: "Production", color: "bg-purple-100 text-purple-700 border-purple-200" },
  { date: "2026-07-10", title: "Packaging Machine Maintenance", type: "maintenance", dept: "Production", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { date: "2026-07-12", title: "IT Security Audit", type: "audit", dept: "IT Infra", color: "bg-red-100 text-red-700 border-red-200" },
  { date: "2026-07-12", title: "Autoclave PM – Quality Lab", type: "maintenance", dept: "QA", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { date: "2026-07-14", title: "Safety Training – All Depts", type: "training", dept: "HR", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { date: "2026-07-15", title: "UPS System Half-Yearly PM", type: "maintenance", dept: "IT Infra", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { date: "2026-07-15", title: "GMP Compliance Audit", type: "audit", dept: "QA", color: "bg-red-100 text-red-700 border-red-200" },
  { date: "2026-07-18", title: "Warehouse Inventory Audit", type: "audit", dept: "Warehouse", color: "bg-red-100 text-red-700 border-red-200" },
  { date: "2026-07-20", title: "Fire Suppression Annual PM", type: "maintenance", dept: "IT Infra", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { date: "2026-07-21", title: "Q2 All-Hands Meeting", type: "meeting", dept: "All", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  { date: "2026-07-22", title: "Machine Shutdown – Line A", type: "shutdown", dept: "Production", color: "bg-slate-100 text-slate-600 border-slate-300" },
  { date: "2026-07-25", title: "ERP Maintenance Window", type: "shutdown", dept: "IT Infra", color: "bg-slate-100 text-slate-600 border-slate-300" },
  { date: "2026-07-28", title: "Monthly Management Review", type: "review", dept: "All", color: "bg-purple-100 text-purple-700 border-purple-200" },
];

function DeptCalendarTab() {
  const [currentMonth, setCurrentMonth] = useState({ year: 2026, month: 6 });
  const [filterType, setFilterType] = useState("all");

  const monthName = new Date(currentMonth.year, currentMonth.month, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const firstDay = new Date(currentMonth.year, currentMonth.month, 1).getDay();
  const daysInMonth = new Date(currentMonth.year, currentMonth.month + 1, 0).getDate();
  const today = new Date("2026-07-03");

  const getEvents = (day: number) => {
    const dateStr = `${currentMonth.year}-${String(currentMonth.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return DEPT_CALENDAR_EVENTS.filter(e => e.date === dateStr && (filterType === "all" || e.type === filterType));
  };

  const eventTypes = [
    { id: "all", label: "All Events" }, { id: "maintenance", label: "Maintenance" },
    { id: "review", label: "Reviews" }, { id: "audit", label: "Audits" },
    { id: "training", label: "Training" }, { id: "meeting", label: "Meetings" }, { id: "shutdown", label: "Shutdowns" },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <h3 className="text-sm font-bold text-slate-900">{monthName}</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { color: "bg-blue-400", label: "Maintenance" }, { color: "bg-purple-400", label: "Review" },
                { color: "bg-red-400", label: "Audit" }, { color: "bg-amber-400", label: "Training" },
                { color: "bg-indigo-400", label: "Meeting" }, { color: "bg-slate-400", label: "Shutdown" },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1 text-[10px] text-slate-500">
                  <div className={`w-2 h-2 rounded-full ${l.color}`} />{l.label}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentMonth(p => { const m = p.month === 0 ? 11 : p.month - 1; return { year: p.month === 0 ? p.year - 1 : p.year, month: m }; })} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"><ChevronLeft size={16} /></button>
            <button onClick={() => setCurrentMonth({ year: 2026, month: 6 })} className="px-3 py-1 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Today</button>
            <button onClick={() => setCurrentMonth(p => { const m = p.month === 11 ? 0 : p.month + 1; return { year: p.month === 11 ? p.year + 1 : p.year, month: m }; })} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"><ChevronRight size={16} /></button>
          </div>
        </div>

        <div className="px-5 py-2 border-b border-slate-100 flex gap-2 overflow-x-auto">
          {eventTypes.map(t => (
            <button key={t.id} onClick={() => setFilterType(t.id)} className={`h-7 px-3 text-[11px] font-semibold rounded-lg whitespace-nowrap transition-colors ${filterType === t.id ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{t.label}</button>
          ))}
        </div>

        <div className="grid grid-cols-7 border-b border-slate-100">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
            <div key={d} className="py-3 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`e${i}`} className="min-h-[110px] border-b border-r border-slate-100 bg-slate-50/30 p-2">
              <span className="text-[11px] text-slate-300">{new Date(currentMonth.year, currentMonth.month, -firstDay + i + 1).getDate()}</span>
            </div>
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayDate = new Date(currentMonth.year, currentMonth.month, day);
            const isToday = dayDate.toDateString() === today.toDateString();
            const events = getEvents(day);
            const isWkd = dayDate.getDay() === 0 || dayDate.getDay() === 6;
            return (
              <div key={day} className={`min-h-[110px] border-b border-r border-slate-100 p-2 transition-colors hover:bg-slate-50/50 ${isWkd ? "bg-slate-50/20" : "bg-white"}`}>
                <div className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold mb-1.5 ${isToday ? "bg-blue-600 text-white" : "text-slate-700"}`}>{day}</div>
                <div className="space-y-1">
                  {events.slice(0, 3).map((ev, ei) => (
                    <div key={ei} className={`px-1.5 py-0.5 rounded text-[10px] font-semibold truncate border cursor-pointer hover:opacity-80 ${ev.color}`} title={ev.title}>{ev.title}</div>
                  ))}
                  {events.length > 3 && <div className="text-[10px] text-slate-400 font-medium pl-1">+{events.length - 3} more</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── 7. RESOURCE ALLOCATION ────────────────────────────────────────────────────

function ResourceAllocationTab() {
  const deptUsers = DEPT_RECORDS.map(dept => ({
    dept: dept.name.split(" ")[0],
    fullDept: dept.name,
    users: EMPLOYEES.filter(e => e.department === dept.name).length,
    available: EMPLOYEES.filter(e => e.department === dept.name && e.availability === "Available").length,
    busy: EMPLOYEES.filter(e => e.department === dept.name && e.availability === "Busy").length,
    machines: dept.machines,
    openCapacity: Math.max(0, 100 - Math.round(EMPLOYEES.filter(e => e.department === dept.name).reduce((s, e) => s + e.workload, 0) / Math.max(EMPLOYEES.filter(e => e.department === dept.name).length, 1))),
  }));

  const conflicts = [
    { date: "2026-07-07", user: "Rajesh Kumar", conflict: "Generator PM + CNC repair overlap", dept: "Production", severity: "High" },
    { date: "2026-07-12", user: "Meena Pillai", conflict: "HVAC critical + Chiller PM scheduled", dept: "Engineering", severity: "Critical" },
    { date: "2026-07-15", user: "Arjun Rao", conflict: "UPS PM + Fire Suppression annual PM", dept: "IT Infra", severity: "Medium" },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Users", val: EMPLOYEES.length, color: "text-blue-600" },
          { label: "Available Now", val: EMPLOYEES.filter(e => e.availability === "Available").length, color: "text-emerald-600" },
          { label: "Currently Busy", val: EMPLOYEES.filter(e => e.availability === "Busy").length, color: "text-red-600" },
          { label: "On Leave / Remote", val: EMPLOYEES.filter(e => e.availability === "On Leave" || e.availability === "Remote").length, color: "text-amber-600" },
        ].map((kpi, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{kpi.label}</div>
            <div className={`text-3xl font-bold ${kpi.color}`}>{kpi.val}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Users by Department</h3>
          <div className="space-y-3">
            {deptUsers.map((d, i) => (
              <div key={i} className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-xs font-bold text-slate-900">{d.fullDept}</span>
                    <span className="text-[10px] text-slate-400 ml-2">{d.users} users · {d.machines} machines</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">{100 - d.openCapacity}% utilized</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                  <div className={`h-2 rounded-full ${100 - d.openCapacity >= 85 ? "bg-red-500" : 100 - d.openCapacity >= 70 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${100 - d.openCapacity}%` }} />
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" />{d.available} available</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" />{d.busy} busy</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-300" />{d.users - d.available - d.busy} other</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <AlertTriangle size={15} className="text-red-500" /> Upcoming Resource Conflicts
            </h3>
            <div className="space-y-3">
              {conflicts.map((c, i) => {
                const cls = c.severity === "Critical" ? "border-red-200 bg-red-50" : c.severity === "High" ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-slate-50";
                const tc = c.severity === "Critical" ? "text-red-700" : c.severity === "High" ? "text-amber-700" : "text-slate-600";
                return (
                  <div key={i} className={`rounded-xl border p-4 ${cls}`}>
                    <div className="flex items-start justify-between mb-1.5">
                      <div className="text-xs font-bold text-slate-900">{c.user}</div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${tc}`}>{c.severity}</span>
                    </div>
                    <div className={`text-[11px] font-medium ${tc}`}>{c.conflict}</div>
                    <div className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-2">
                      <CalendarIcon size={9} />{c.date} · {c.dept}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Resource Utilization Summary</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={deptUsers.map(d => ({ name: d.dept, utilized: 100 - d.openCapacity, free: d.openCapacity }))} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <RechartsTooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E2E8F0" }} />
                <Bar dataKey="utilized" name="Utilized %" fill="#2563EB" stackId="a" radius={[0, 0, 4, 4]} />
                <Bar dataKey="free" name="Free Capacity %" fill="#E2E8F0" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 8. DEPARTMENT REPORTS ─────────────────────────────────────────────────────

function DeptReportsTab() {
  const reports = [
    { id: "RPT-001", title: "Monthly Operations Summary – July 2026", dept: "All Departments", type: "Monthly Summary", date: "2026-07-01", size: "4.8 MB", pages: 24, status: "Ready" },
    { id: "RPT-002", title: "Production Department – Q2 2026 Performance", dept: "Production", type: "Performance Report", date: "2026-07-03", size: "3.2 MB", pages: 18, status: "Ready" },
    { id: "RPT-003", title: "IT Infrastructure – Maintenance & Uptime Report", dept: "IT Department", type: "Maintenance Report", date: "2026-07-02", size: "2.1 MB", pages: 12, status: "Ready" },
    { id: "RPT-004", title: "Quality Control – QA Audit Report June 2026", dept: "Quality Control", type: "QA Report", date: "2026-07-01", size: "1.8 MB", pages: 10, status: "Ready" },
    { id: "RPT-005", title: "All Departments – Backup Activity Summary", dept: "IT Department", type: "Backup Report", date: "2026-07-03", size: "1.4 MB", pages: 8, status: "Ready" },
    { id: "RPT-006", title: "Plant-Wide Machine Health & Asset Report", dept: "All Departments", type: "Machine Report", date: "2026-07-02", size: "5.6 MB", pages: 32, status: "Ready" },
    { id: "RPT-007", title: "Engineering Department – Energy Audit Report", dept: "Engineering", type: "Performance Report", date: "2026-06-30", size: "2.8 MB", pages: 15, status: "Under Review" },
    { id: "RPT-008", title: "HR & Administration – Q2 Compliance Report", dept: "HR & Admin", type: "Monthly Summary", date: "2026-06-28", size: "1.1 MB", pages: 6, status: "Ready" },
  ];

  const typeColors: Record<string, string> = {
    "Monthly Summary":    "bg-blue-50 text-blue-700 border-blue-200",
    "Performance Report": "bg-purple-50 text-purple-700 border-purple-200",
    "Maintenance Report": "bg-amber-50 text-amber-700 border-amber-200",
    "QA Report":          "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Backup Report":      "bg-indigo-50 text-indigo-700 border-indigo-200",
    "Machine Report":     "bg-cyan-50 text-cyan-700 border-cyan-200",
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Department Reports</h3>
          <p className="text-xs text-slate-400 mt-0.5">{reports.length} reports available</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 h-9 px-3 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"><FileSpreadsheet size={13} /> Export All</button>
          <button className="flex items-center gap-2 h-9 px-4 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"><Plus size={13} /> Generate Report</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {reports.map(r => (
          <div key={r.id} className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all p-5">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center shrink-0">
                <FileText size={20} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="text-xs font-bold text-slate-900 leading-snug">{r.title}</div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${r.status === "Ready" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{r.status}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${typeColors[r.type] || "bg-slate-50 text-slate-600 border-slate-200"}`}>{r.type}</span>
                  <span className="text-[10px] text-slate-400">{r.dept}</span>
                  <span className="text-[10px] text-slate-400">{r.date}</span>
                  <span className="text-[10px] text-slate-400">{r.pages} pages · {r.size}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 h-7 px-2.5 text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"><Eye size={11} /> Preview</button>
                  <button className="flex items-center gap-1.5 h-7 px-2.5 text-[11px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"><Download size={11} /> PDF</button>
                  <button className="flex items-center gap-1.5 h-7 px-2.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"><FileSpreadsheet size={11} /> Excel</button>
                  <button className="flex items-center gap-1.5 h-7 px-2.5 text-[11px] font-semibold text-slate-500 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"><ExternalLink size={11} /> Share</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── DEPARTMENTS MAIN ──────────────────────────────────────────────────────────

type DeptTab = "directory" | "calendar";

export default function DepartmentsPage() {
  const [activeTab, setActiveTab] = useState<DeptTab>("directory");
  const [depts, setDepts] = useState<DeptRecord[]>(DEPT_RECORDS);
  const [showForm, setShowForm] = useState<"add" | "edit" | null>(null);
  const [editingDept, setEditingDept] = useState<DeptRecord | null>(null);
  const [deletingDept, setDeletingDept] = useState<DeptRecord | null>(null);

  const handleAdd = () => { setEditingDept(null); setShowForm("add"); };
  const handleEdit = (d: DeptRecord) => { setEditingDept(d); setShowForm("edit"); };
  const handleDeleteRequest = (d: DeptRecord) => setDeletingDept(d);

  const handleSave = (data: Partial<DeptRecord> & { assignedUsers: string[] }) => {
    if (showForm === "add") {
      const newDept: DeptRecord = {
        id: `DEPT-${String(depts.length + 1).padStart(3, "0")}`,
        name: data.name ?? "", head: data.head ?? "", manager: data.manager ?? "",
        location: data.location ?? "", employees: data.employees ?? 0, machines: 0,
        openPM: 0, openQA: 0, backupJobs: 0, performanceScore: 0,
        status: data.status ?? "Active", budget: 0, budgetUsed: 0,
        description: data.description ?? "", recentActivities: [], monthlyKPIs: [],
      };
      setDepts(prev => [...prev, newDept]);
      toast.success(`Department "${newDept.name}" created successfully.`);
    } else if (showForm === "edit" && editingDept) {
      setDepts(prev => prev.map(d => d.id !== editingDept.id ? d : {
        ...d, name: data.name ?? d.name, head: data.head ?? d.head,
        manager: data.manager ?? d.manager, location: data.location ?? d.location,
        employees: data.employees ?? d.employees, status: data.status ?? d.status,
        description: data.description ?? d.description,
      }));
      toast.success("Department updated successfully.");
    }
    setShowForm(null);
    setEditingDept(null);
  };

  const handleDeleteConfirm = () => {
    if (!deletingDept) return;
    setDepts(prev => prev.filter(d => d.id !== deletingDept.id));
    toast.success(`Department "${deletingDept.name}" deleted.`);
    setDeletingDept(null);
  };

  const TABS: { id: DeptTab; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
    { id: "directory",  label: "Department Directory", icon: Table2 },
    { id: "calendar",   label: "Calendar",             icon: CalendarIcon },
  ];

  return (
    <div className="w-full max-w-[1600px] mx-auto animate-in fade-in duration-300">
      {showForm && (
        <DeptFormModal mode={showForm} initial={editingDept ?? undefined}
          onSave={handleSave} onCancel={() => { setShowForm(null); setEditingDept(null); }} />
      )}
      {deletingDept && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setDeletingDept(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 bg-red-50 border border-red-200 rounded-xl flex items-center justify-center shrink-0"><Trash2 size={24} className="text-red-600" /></div>
              <div><h3 className="text-sm font-bold text-slate-900">Delete Department</h3><p className="text-xs text-slate-500 mt-0.5">This action cannot be undone.</p></div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
              <div className="text-xs font-bold text-slate-900">{deletingDept.name}</div>
              <div className="text-xs text-slate-500 font-mono mt-0.5">{deletingDept.id} · Head: {deletingDept.head}</div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeletingDept(null)} className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={handleDeleteConfirm} className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"><Trash2 size={15} /> Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-2">
          <LayoutDashboard size={12} /><span>Dashboard</span><ChevronRight size={12} />
          <span className="text-slate-700 font-semibold">Departments</span>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm shadow-blue-200">
              <Layers size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Departments</h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Manage organizational units and performance · {depts.length} departments
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleAdd} className="flex items-center gap-1.5 h-9 px-4 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"><Plus size={14} /> Add Department</button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-5 overflow-hidden">
        <div className="flex overflow-x-auto">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors shrink-0 ${
                  isActive ? "border-blue-600 text-blue-600 bg-blue-50/50" : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}>
                <tab.icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="animate-in fade-in duration-200">
        {activeTab === "directory" && <DeptDirectoryTab records={depts} onEdit={handleEdit} onDelete={handleDeleteRequest} />}
        {activeTab === "calendar"  && <DeptCalendarTab />}
      </div>
    </div>
  );
}
