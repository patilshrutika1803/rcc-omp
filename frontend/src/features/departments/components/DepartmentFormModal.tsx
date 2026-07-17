// ─────────────────────────────────────────────────────────────────────────────
// DepartmentFormModal
// Extracted verbatim (UI/behavior unchanged) from the original DeptFormModal
// in the monolithic DepartmentsPage.tsx.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { X, Layers, Check, RefreshCw } from "lucide-react";
import type { Department, DepartmentStatus } from "../types/department";
import { DEPARTMENT_STATUS_OPTIONS, USERS } from "../constants/departmentConfig";

export interface DepartmentFormModalProps {
  mode: "add" | "edit";
  initial?: Department;
  /** Users currently assigned to this department (used to pre-check the Assign Users list on edit) */
  initialAssignedUsers?: string[];
  onSave: (d: Partial<Department> & { assignedUsers: string[] }) => void;
  onCancel: () => void;
}

export default function DepartmentFormModal({
  mode,
  initial,
  initialAssignedUsers,
  onSave,
  onCancel,
}: DepartmentFormModalProps) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    head: initial?.head ?? "",
    manager: initial?.manager ?? "",
    location: initial?.location ?? "",
    employees: initial?.employees ?? 0,
    status: initial?.status ?? ("Active" as DepartmentStatus),
    description: initial?.description ?? "",
  });
  const [assignedUsers, setAssignedUsers] = useState<string[]>(initialAssignedUsers ?? []);
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
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setSaving(true);
    setTimeout(() => {
      onSave({ ...form, assignedUsers });
    }, 500);
  };

  const toggleUser = (u: string) =>
    setAssignedUsers(prev => (prev.includes(u) ? prev.filter(x => x !== u) : [...prev, u]));

  const fc = (k: string) =>
    `w-full h-9 px-3 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
      errors[k] ? "border-red-400" : "border-slate-300"
    }`;

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
              <h2 className="text-sm font-bold text-slate-900">
                {mode === "add" ? "Add Department" : "Edit Department"}
              </h2>
              <p className="text-xs text-slate-500">
                {mode === "add" ? "Create a new department" : "Update department information"}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                Department Name <span className="text-red-500">*</span>
              </label>
              <input
                value={form.name}
                onChange={e => {
                  setForm({ ...form, name: e.target.value });
                  setErrors(p => ({ ...p, name: "" }));
                }}
                placeholder="e.g. Quality Assurance"
                className={fc("name")}
              />
              {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Status</label>
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value as DepartmentStatus })}
                className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-slate-700"
              >
                {DEPARTMENT_STATUS_OPTIONS.map(s => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                Department Head <span className="text-red-500">*</span>
              </label>
              <input
                value={form.head}
                onChange={e => {
                  setForm({ ...form, head: e.target.value });
                  setErrors(p => ({ ...p, head: "" }));
                }}
                placeholder="e.g. Nikhil Sakat"
                className={fc("head")}
              />
              {errors.head && <p className="text-[11px] text-red-500 mt-1">{errors.head}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Manager</label>
              <input
                value={form.manager}
                onChange={e => setForm({ ...form, manager: e.target.value })}
                placeholder="e.g. Megha Jadhav"
                className={fc("manager")}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Location</label>
              <input
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Block A – 1st Floor"
                className={fc("location")}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Headcount</label>
              <input
                type="number"
                min={0}
                value={form.employees}
                onChange={e => setForm({ ...form, employees: Number(e.target.value) })}
                className={fc("employees")}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={2}
              placeholder="Describe the department's responsibilities..."
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none placeholder-slate-400"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-2 block">Assign Users</label>
            <div className="grid grid-cols-2 gap-2">
              {USERS.map(u => (
                <button
                  key={u}
                  onClick={() => toggleUser(u)}
                  type="button"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                    assignedUsers.includes(u)
                      ? "bg-blue-50 border-blue-300 text-blue-700"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                      assignedUsers.includes(u) ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {u
                      .split(" ")
                      .map(n => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  {u}
                  {assignedUsers.includes(u) && <Check size={11} className="ml-auto text-blue-600" />}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <p className="text-[11px] text-slate-400">
            Fields marked <span className="text-red-500">*</span> are required
          </p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              {saving ? (
                <>
                  <RefreshCw size={14} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Check size={14} /> {mode === "add" ? "Add Department" : "Save Changes"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
