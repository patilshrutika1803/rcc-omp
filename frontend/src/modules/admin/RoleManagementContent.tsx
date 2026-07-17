// ─────────────────────────────────────────────────────────────────────────────
// ROLE & PERMISSION MANAGEMENT
// Extracted verbatim from App.tsx — behavior, markup and styling unchanged.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import {
  Settings,
  ChevronRight,
  ShieldCheck,
  UserPlus,
  Search,
  Edit2,
  UserX,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

import DepartmentPage from "../../features/departments/DepartmentPage";

// Local mock data used by RoleManagement UI (kept as-is from the previous architecture)
const EMPLOYEES = (DepartmentPage as any)?.EMPLOYEES ?? [
  {
    id: "E-001",
    employeeId: "RCC-IT-001",
    name: "Nikhil Sakat",
    email: "nikhil.sakat@rajaram.com",
    role: "IT Head",
    department: "IT",
    status: "Active",
    availability: "Available",
    initials: "NS",
    avatarColor: "bg-blue-50 text-blue-700 border border-blue-100",
  },
  {
    id: "E-002",
    employeeId: "RCC-IT-002",
    name: "Megha Jadhav",
    email: "megha.jadhav@rajaram.com",
    role: "IT Executive",
    department: "IT",
    status: "Active",
    availability: "Available",
    initials: "MJ",
    avatarColor: "bg-purple-50 text-purple-700 border border-purple-100",
  },
  {
    id: "E-003",
    employeeId: "RCC-IT-003",
    name: "Kiran Yadav",
    email: "kiran.yadav@rajaram.com",
    role: "IT Executive",
    department: "IT",
    status: "Active",
    availability: "Available",
    initials: "KY",
    avatarColor: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  },
];
import { StatusChip } from "../../shared/components/EnterpriseUI";

export function RoleManagementContent() {
  const [tab, setTab] = useState<"users" | "roles" | "matrix" | "logs">("users");
  const TABS = [{ id: "users" as const, label: "Users" }, { id: "roles" as const, label: "Roles" }, { id: "matrix" as const, label: "Permission Matrix" }, { id: "logs" as const, label: "Access Logs" }];
  const [search, setSearch] = useState("");

  const filteredEmployees = EMPLOYEES.filter((e: any) =>
    !search ||
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.employeeId.toLowerCase().includes(search.toLowerCase())
  );

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
    { user: "Nikhil Sakat", action: "Login", resource: "Portal", time: "2026-07-03 09:12:04", result: "Success" },
    { user: "Megha Jadhav", action: "View", resource: "Backup Dashboard", time: "2026-07-03 10:02:11", result: "Success" },
    { user: "Unknown", action: "Login failed", resource: "Portal", time: "2026-07-03 10:30:00", result: "Failed" },
    { user: "Kiran Yadav", action: "Edit", resource: "PM Record PM-2003", time: "2026-07-03 11:15:22", result: "Success" },
    { user: "Nikhil Sakat", action: "Export", resource: "QA Report", time: "2026-07-03 13:44:10", result: "Success" },
    { user: "Megha Jadhav", action: "Create", resource: "QA Activity QMS-011", time: "2026-07-02 16:20:55", result: "Success" },
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
                {filteredEmployees.map((emp: any) => (
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

export default RoleManagementContent;
