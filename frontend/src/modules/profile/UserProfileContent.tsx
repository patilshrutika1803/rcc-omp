// ─────────────────────────────────────────────────────────────────────────────
// USER PROFILE
// Extracted verbatim from App.tsx — behavior, markup and styling unchanged.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  ChevronRight,
  Edit2,
  Shield,
  Mail,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../auth/AuthProvider";
import { normalizeDepartment } from "../../auth/auth";

import { SettingsInput } from "../../features/settings/pages/SettingsPage";
import { StatusChip } from "../../shared/components/EnterpriseUI";
import { DEPARTMENT_OPTIONS } from "../../constants/departments";

export function UserProfileContent() {
  const { user, updateUser } = useAuth();
  const displayName = user?.name ?? "RCC OMP User";
  const displayEmail = user?.email ?? "unknown@example.com";
  const initials = displayName
    .split(" ")
    .map((segment) => segment[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const [tab, setTab] = useState<"overview" | "security">("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name ?? "",
    department: normalizeDepartment(user?.department),
    phone: user?.phone ?? "",
  });

  useEffect(() => {
    setForm({
      name: user?.name ?? "",
      department: normalizeDepartment(user?.department),
      phone: user?.phone ?? "",
    });
  }, [user?.name, user?.department, user?.phone]);

  const TABS = [{ id: "overview" as const, label: "Overview" }, { id: "security" as const, label: "Security" }];

  const handleSave = () => {
    const nextName = form.name.trim();
    const nextPhone = form.phone.trim();
    const nextDepartment = normalizeDepartment(form.department);

    updateUser({
      name: nextName || displayName,
      department: nextDepartment,
      phone: nextPhone || "+91 00000 00000",
    });
    toast.success("Profile updated");
    setIsEditing(false);
  };

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
            <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">{initials}</div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border-2 border-white rounded-full shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors"><Edit2 size={12} className="text-slate-500" /></button>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-900">{displayName}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
              <span className="flex items-center gap-1"><Shield size={11} /> Portal User</span>
              <span className="flex items-center gap-1"><Mail size={11} /> {displayEmail}</span>
            </div>
            <div className="flex items-center gap-2 mt-2.5">
              <StatusChip label="Active" variant="success" />
            </div>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <button onClick={() => setIsEditing((prev) => !prev)} className="flex items-center gap-2 h-8 px-3 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"><Edit2 size={12} /> {isEditing ? "Cancel Edit" : "Edit Profile"}</button>
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
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4">Personal Information</h3>
          {isEditing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <SettingsInput label="Full Name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Department</label>
                <select value={form.department} onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-blue-500/20 bg-white">
                  <option value="">Select Department</option>
                  {DEPARTMENT_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <SettingsInput label="Phone" value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} />
              <SettingsInput label="Role" value={user?.role ?? "Portal User"} readOnly />
              <SettingsInput label="Employee ID" value={user?.employeeId ?? "EMP-001"} readOnly />
              <SettingsInput label="Email" value={displayEmail} readOnly />
              <div className="sm:col-span-2 flex gap-2">
                <button onClick={handleSave} className="flex items-center gap-2 h-9 px-4 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"><Check size={13} /> Save Changes</button>
                <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 h-9 px-4 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                ["Full Name", displayName],
                ["Login ID / Email", displayEmail],
                ["Role", user?.role ?? "Portal User"],
                ["Department", normalizeDepartment(user?.department)],
                ["Employee ID", user?.employeeId ?? "EMP-001"],
                ["Phone", user?.phone ?? "+91 00000 00000"],
                ["Status", "Active"],
              ].map(([k,v]) => (
                <div key={k} className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{k}</div>
                  <div className="text-xs font-semibold text-slate-900">{v}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "security" && (
        <div className="max-w-xl bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4">Password</h3>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-600 leading-6">
              Password management will be handled through the secure authentication system when Supabase authentication is connected.
            </p>
          </div>
        </div>
      )}

      {/* "My Tasks" tab removed per project decision - no assigned-task UI remains */}

    </div>
  );
}

export default UserProfileContent;
