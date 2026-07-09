// ─────────────────────────────────────────────────────────────────────────────
// SystemInventoryPage
// Renamed & refactored from the original "Machines" module (RCC OMP).
// This module is a pure Asset Inventory Management System — it is NOT an IoT
// monitoring dashboard. All health/monitoring/analytics widgets have been
// removed. Styling and Tailwind design language are unchanged from the
// original module.
//
// Backend-ready: no demo/mock data. SYSTEMS starts empty and is intended to
// be populated from MongoDB via the Express API endpoints noted in the
// TODO comments below.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useMemo } from "react";
import {
  LayoutDashboard,
  Server,
  Monitor,
  Laptop,
  Printer,
  Search,
  ChevronRight,
  Info,
  Plus,
  Filter,
  Download,
  Eye,
  Edit2,
  Trash2,
  X,
  CalendarClock,
  RefreshCw,
} from "lucide-react";
import { daysUntil, formatDate } from "../../../shared/utils/dateHelpers";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const DEPARTMENTS = [
  "Quality Assurance",
  "Quality Control",
  "Production",
  "Warehouse",
  "Engineering",
  "Purchase & Accounts",
  "HR & Admin",
  "Environmental Health & Safety",
  "IT Department",
];

// Only these three system types are supported.
const SYSTEM_TYPES = ["Laptop", "Desktop PC", "Printer"] as const;

const STATUS_OPTIONS = ["Active", "Inactive", "Under Repair", "Disposed"] as const;

// Preventive Maintenance is only applicable to Laptop / Desktop PC.
// Printers never participate in PM.
const PM_ELIGIBLE_TYPES = ["Laptop", "Desktop PC"];

const PM_FREQUENCIES = ["Daily", "Weekly", "Monthly", "Quarterly", "Half-Yearly", "Yearly"] as const;
const PM_PRIORITIES = ["Critical", "High", "Medium", "Low"] as const;
const PM_REMINDERS = ["Same Day", "1 Day Before", "3 Days Before", "1 Week Before"] as const;

// ─────────────────────────────────────────────────────────────────────────────
// TYPES (backend-ready — shaped for MongoDB / Express / REST)
// ─────────────────────────────────────────────────────────────────────────────

export type SystemType = (typeof SYSTEM_TYPES)[number];
export type SystemStatus = (typeof STATUS_OPTIONS)[number];
export type PMFrequency = (typeof PM_FREQUENCIES)[number];
export type PMPriority = (typeof PM_PRIORITIES)[number];

export interface SystemPMSettings {
  frequency: PMFrequency;
  lastMaintenance: string;
  nextDue: string;
  priority: PMPriority;
  description: string;
  assignedUser: string;
  reminder: string;
}

export interface SystemInventory {
  _id?: string; // MongoDB document id (populated by backend on save)
  systemId: string;
  systemName: string;
  systemType: SystemType | "";
  department: string;
  location: string;
  assignedUser: string;
  brand: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  warrantyExpiry: string;
  status: SystemStatus;
  pmSettings?: SystemPMSettings;
  createdAt: string;
  updatedAt: string;
}

// Backend-ready: starts empty. No hardcoded/demo/mock records.
// TODO: GET /api/system-inventory -> replace/seed this list from MongoDB.
export const SYSTEMS: SystemInventory[] = [];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function statusConfig(status: SystemStatus | "") {
  switch (status) {
    case "Active":        return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" };
    case "Inactive":      return { bg: "bg-slate-50",   text: "text-slate-600",   border: "border-slate-200",   dot: "bg-slate-400" };
    case "Under Repair":  return { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-500" };
    case "Disposed":      return { bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",     dot: "bg-red-500" };
    default:              return { bg: "bg-slate-50",   text: "text-slate-600",   border: "border-slate-200",   dot: "bg-slate-400" };
  }
}

function typeIcon(type: string) {
  switch (type) {
    case "Laptop":     return Laptop;
    case "Desktop PC": return Monitor;
    case "Printer":    return Printer;
    default:           return Server;
  }
}

function emptySystem(): SystemInventory {
  return {
    systemId: "",
    systemName: "",
    systemType: "",
    department: "",
    location: "",
    assignedUser: "",
    brand: "",
    model: "",
    serialNumber: "",
    purchaseDate: "",
    warrantyExpiry: "",
    status: "Active",
    pmSettings: undefined,
    createdAt: "",
    updatedAt: "",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED UI PIECES
// ─────────────────────────────────────────────────────────────────────────────

export function SystemStatusBadge({ status }: { status: SystemStatus | "" }) {
  const cfg = statusConfig(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} shrink-0`} />
      {status || "—"}
    </span>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mb-5">
        <Server size={28} className="text-blue-400" />
      </div>
      <h3 className="text-base font-bold text-slate-900 mb-2">No systems registered yet</h3>
      <p className="text-sm text-slate-500 max-w-xs mb-6">
        No records match your current filters, or no systems have been added yet. Add a system to get started.
      </p>
      <div className="flex gap-3">
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
          <RefreshCw size={14} /> Reset Filters
        </button>
        <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
          <Plus size={14} /> Add System
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADD / EDIT SYSTEM MODAL
// ─────────────────────────────────────────────────────────────────────────────

function AddSystemModal({
  onClose,
  onSave,
  editRecord,
  departments,
}: {
  onClose: () => void;
  onSave: (record: SystemInventory) => void;
  editRecord?: SystemInventory;
  departments: string[];
}) {
  const isEdit = !!editRecord;
  const [form, setForm] = useState<SystemInventory>(editRecord ? { ...editRecord } : emptySystem());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const showPmSection = form.systemType === "Laptop" || form.systemType === "Desktop PC";

  const updateField = (key: keyof SystemInventory, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: "" }));
  };

  const updatePm = (key: keyof SystemPMSettings, value: string) => {
    setForm(prev => ({
      ...prev,
      pmSettings: {
        frequency: prev.pmSettings?.frequency ?? "Monthly",
        lastMaintenance: prev.pmSettings?.lastMaintenance ?? "",
        nextDue: prev.pmSettings?.nextDue ?? "",
        priority: prev.pmSettings?.priority ?? "Medium",
        description: prev.pmSettings?.description ?? "",
        assignedUser: prev.pmSettings?.assignedUser ?? "",
        reminder: prev.pmSettings?.reminder ?? "1 Day Before",
        [key]: value,
      },
    }));
  };

  const handleTypeChange = (value: string) => {
    const nextType = value as SystemType | "";
    setForm(prev => ({
      ...prev,
      systemType: nextType,
      // Printers never carry PM settings.
      pmSettings: nextType === "Laptop" || nextType === "Desktop PC" ? prev.pmSettings : undefined,
    }));
    setErrors(prev => ({ ...prev, systemType: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.systemType) e.systemType = "System Type is required";
    if (!form.department) e.department = "Department is required";
    if (!form.location.trim()) e.location = "Location is required";
    if (!form.systemId.trim()) e.systemId = "System ID is required";
    if (!form.systemName.trim()) e.systemName = "System Name is required";
    if (!form.assignedUser.trim()) e.assignedUser = "Assigned User is required";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setIsSaving(true);

    // TODO: Create / Update System Inventory record
    // const res = await fetch(isEdit ? `/api/system-inventory/${editRecord?._id}` : '/api/system-inventory', {
    //   method: isEdit ? 'PUT' : 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(payload),
    // });
    // const saved = await res.json(); // MongoDB generates _id / timestamps on save

    setTimeout(() => {
      const now = new Date().toISOString();
      const record: SystemInventory = {
        ...form,
        systemId: form.systemId.trim(),
        systemName: form.systemName.trim(),
        location: form.location.trim(),
        assignedUser: form.assignedUser.trim(),
        createdAt: editRecord?.createdAt || now,
        updatedAt: now,
      };
      setIsSaving(false);
      onSave(record);
      onClose();
    }, 500);
  };

  const fieldClass = (key: string) =>
    `w-full h-9 px-3 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 ${errors[key] ? "border-red-400" : "border-slate-300"}`;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
              <Server size={18} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">{isEdit ? "Edit System" : "Add System"}</h2>
              <p className="text-xs text-slate-500">{isEdit ? "Update this system's inventory record" : "Register a new system into the inventory"}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">System Type <span className="text-red-500">*</span></label>
              <select value={form.systemType} onChange={e => handleTypeChange(e.target.value)} className={fieldClass("systemType")}>
                <option value="">Select system type</option>
                {SYSTEM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.systemType && <p className="text-[11px] text-red-500 mt-1">{errors.systemType}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Department <span className="text-red-500">*</span></label>
              <select value={form.department} onChange={e => updateField("department", e.target.value)} className={fieldClass("department")}>
                <option value="">Select department</option>
                {(departments.length ? departments : DEPARTMENTS).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              {errors.department && <p className="text-[11px] text-red-500 mt-1">{errors.department}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Location <span className="text-red-500">*</span></label>
              <input type="text" placeholder="e.g. Production Floor – Block A" value={form.location}
                onChange={e => updateField("location", e.target.value)} className={fieldClass("location") + " placeholder-slate-400"} />
              {errors.location && <p className="text-[11px] text-red-500 mt-1">{errors.location}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">System ID <span className="text-red-500">*</span></label>
              <input type="text" placeholder="e.g. SYS-IT-001" value={form.systemId}
                onChange={e => updateField("systemId", e.target.value)} className={fieldClass("systemId") + " placeholder-slate-400 font-mono"} />
              {errors.systemId && <p className="text-[11px] text-red-500 mt-1">{errors.systemId}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">System Name <span className="text-red-500">*</span></label>
              <input type="text" placeholder="e.g. Finance Desktop – Accounts" value={form.systemName}
                onChange={e => updateField("systemName", e.target.value)} className={fieldClass("systemName") + " placeholder-slate-400"} />
              {errors.systemName && <p className="text-[11px] text-red-500 mt-1">{errors.systemName}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Assigned User <span className="text-red-500">*</span></label>
              <input type="text" placeholder="e.g. Rajesh Kumar" value={form.assignedUser}
                onChange={e => updateField("assignedUser", e.target.value)} className={fieldClass("assignedUser") + " placeholder-slate-400"} />
              {errors.assignedUser && <p className="text-[11px] text-red-500 mt-1">{errors.assignedUser}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Brand</label>
              <input type="text" placeholder="e.g. Dell, HP, Lenovo" value={form.brand}
                onChange={e => updateField("brand", e.target.value)} className={fieldClass("brand") + " placeholder-slate-400"} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Model</label>
              <input type="text" placeholder="e.g. Latitude 5420" value={form.model}
                onChange={e => updateField("model", e.target.value)} className={fieldClass("model") + " placeholder-slate-400"} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Serial Number</label>
              <input type="text" placeholder="e.g. SN-2024-0091" value={form.serialNumber}
                onChange={e => updateField("serialNumber", e.target.value)} className={fieldClass("serialNumber") + " placeholder-slate-400 font-mono"} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Status</label>
              <select value={form.status} onChange={e => updateField("status", e.target.value)} className={fieldClass("status")}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Purchase Date</label>
              <input type="date" value={form.purchaseDate} onChange={e => updateField("purchaseDate", e.target.value)} className={fieldClass("purchaseDate")} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Warranty Expiry</label>
              <input type="date" value={form.warrantyExpiry} onChange={e => updateField("warrantyExpiry", e.target.value)} className={fieldClass("warrantyExpiry")} />
            </div>
          </div>

          {/* ── Preventive Maintenance Settings — Laptop / Desktop PC only ── */}
          {showPmSection && (
            <div className="border border-blue-100 bg-blue-50/40 rounded-xl p-4 space-y-4">
              <div className="flex items-center gap-2">
                <CalendarClock size={15} className="text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900">Preventive Maintenance Settings</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Maintenance Frequency</label>
                  <select value={form.pmSettings?.frequency ?? "Monthly"} onChange={e => updatePm("frequency", e.target.value)}
                    className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700">
                    {PM_FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Priority</label>
                  <select value={form.pmSettings?.priority ?? "Medium"} onChange={e => updatePm("priority", e.target.value)}
                    className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700">
                    {PM_PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Last Maintenance Date</label>
                  <input type="date" value={form.pmSettings?.lastMaintenance ?? ""} onChange={e => updatePm("lastMaintenance", e.target.value)}
                    className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Next Due Date</label>
                  <input type="date" value={form.pmSettings?.nextDue ?? ""} onChange={e => updatePm("nextDue", e.target.value)}
                    className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Assigned Maintenance User</label>
                  <input type="text" placeholder="e.g. Suresh Babu" value={form.pmSettings?.assignedUser ?? ""}
                    onChange={e => updatePm("assignedUser", e.target.value)}
                    className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Reminder</label>
                  <select value={form.pmSettings?.reminder ?? "1 Day Before"} onChange={e => updatePm("reminder", e.target.value)}
                    className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700">
                    {PM_REMINDERS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Maintenance Description</label>
                <textarea placeholder="Describe the maintenance checklist / scope..." value={form.pmSettings?.description ?? ""}
                  onChange={e => updatePm("description", e.target.value)} rows={3}
                  className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-400 resize-none" />
              </div>

              <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <Info size={12} className="shrink-0" />
                These settings are saved on the system record. This system will automatically become available for selection inside Preventive Maintenance.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <p className="text-[11px] text-slate-400">Fields marked with <span className="text-red-500">*</span> are required</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} disabled={isSaving}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-70">
              {isSaving ? (<><RefreshCw size={14} className="animate-spin" /> Saving...</>) : (<><Plus size={14} /> {isEdit ? "Update System" : "Save System"}</>)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM DETAILS DRAWER (view-only)
// ─────────────────────────────────────────────────────────────────────────────

function SystemDetailsDrawer({ system, onClose, onEdit }: { system: SystemInventory; onClose: () => void; onEdit: () => void }) {
  const TypeIcon = typeIcon(system.systemType);
  const wDays = system.warrantyExpiry ? daysUntil(system.warrantyExpiry) : null;

  const rows: [string, string][] = [
    ["System ID", system.systemId],
    ["System Name", system.systemName],
    ["Type", system.systemType || "—"],
    ["Department", system.department],
    ["Location", system.location],
    ["Assigned User", system.assignedUser],
    ["Brand", system.brand || "—"],
    ["Model", system.model || "—"],
    ["Serial Number", system.serialNumber || "—"],
    ["Purchase Date", system.purchaseDate ? formatDate(system.purchaseDate) : "—"],
    ["Warranty Expiry", system.warrantyExpiry ? formatDate(system.warrantyExpiry) : "—"],
  ];

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
              <TypeIcon size={18} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">{system.systemName || "System Details"}</h2>
              <p className="text-xs text-slate-500 font-mono">{system.systemId}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <SystemStatusBadge status={system.status} />

          <div className="space-y-3">
            {rows.map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-4 text-xs border-b border-slate-100 pb-2.5">
                <span className="font-semibold text-slate-400 uppercase tracking-wide shrink-0">{label}</span>
                <span className="text-slate-700 text-right font-medium">{value}</span>
              </div>
            ))}
            {wDays !== null && (
              <div className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-lg inline-block ${wDays < 0 ? "bg-red-50 text-red-600" : wDays < 90 ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>
                {wDays < 0 ? "Warranty expired" : `${wDays} days of warranty remaining`}
              </div>
            )}
          </div>

          {system.pmSettings && (
            <div className="border border-blue-100 bg-blue-50/40 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 mb-1">
                <CalendarClock size={14} className="text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900">Preventive Maintenance Settings</h3>
              </div>
              {[
                ["Frequency", system.pmSettings.frequency],
                ["Priority", system.pmSettings.priority],
                ["Last Maintenance", system.pmSettings.lastMaintenance ? formatDate(system.pmSettings.lastMaintenance) : "—"],
                ["Next Due", system.pmSettings.nextDue ? formatDate(system.pmSettings.nextDue) : "—"],
                ["Assigned Maintenance User", system.pmSettings.assignedUser || "—"],
                ["Reminder", system.pmSettings.reminder || "—"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-semibold text-slate-800">{value}</span>
                </div>
              ))}
              {system.pmSettings.description && (
                <p className="text-xs text-slate-600 pt-1.5 border-t border-blue-100 mt-1.5">{system.pmSettings.description}</p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
            Close
          </button>
          <button onClick={onEdit} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Edit2 size={14} /> Edit System
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE CONFIRM DIALOG
// ─────────────────────────────────────────────────────────────────────────────

function DeleteConfirmDialog({ system, onClose, onConfirm }: { system: SystemInventory; onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-2">Remove system?</h3>
        <p className="text-xs text-slate-500 mb-5">
          This will permanently remove <span className="font-semibold text-slate-700">{system.systemName || system.systemId}</span> from the inventory.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2">
            <Trash2 size={14} /> Remove
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM INVENTORY TABLE (search + filters + table)
// ─────────────────────────────────────────────────────────────────────────────

function SystemInventoryTable({
  systems,
  onView,
  onEdit,
  onDelete,
}: {
  systems: SystemInventory[];
  onView: (s: SystemInventory) => void;
  onEdit: (s: SystemInventory) => void;
  onDelete: (s: SystemInventory) => void;
}) {
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const PER = 8;

  const filtered = useMemo(() => {
    let d = [...systems];
    if (search) {
      const q = search.toLowerCase();
      d = d.filter(s =>
        s.systemId.toLowerCase().includes(q) ||
        s.systemName.toLowerCase().includes(q) ||
        s.assignedUser.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q)
      );
    }
    if (filterDept) d = d.filter(s => s.department === filterDept);
    if (filterType) d = d.filter(s => s.systemType === filterType);
    if (filterStatus) d = d.filter(s => s.status === filterStatus);
    return d;
  }, [systems, search, filterDept, filterType, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER));
  const paged = filtered.slice((page - 1) * PER, page * PER);
  const hasFilters = !!(search || filterDept || filterType || filterStatus);

  const resetFilters = () => { setSearch(""); setFilterDept(""); setFilterType(""); setFilterStatus(""); setPage(1); };

  return (
    <div className="space-y-4">
      {/* Search + Filters toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by System ID, Name, Assigned User or Department..."
            className="w-full h-9 pl-9 pr-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all placeholder-slate-400"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-slate-400 shrink-0" />
          <select value={filterDept} onChange={e => { setFilterDept(e.target.value); setPage(1); }}
            className="h-9 px-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
            <option value="">All Departments</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }}
            className="h-9 px-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
            <option value="">All Types</option>
            {SYSTEM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
            className="h-9 px-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
            <option value="">All Status</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {hasFilters && (
            <button onClick={resetFilters} className="h-9 px-2.5 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState onAdd={() => {}} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-4 py-3">System ID</th>
                    <th className="px-4 py-3">System Name</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Assigned User</th>
                    <th className="px-4 py-3">Purchase Date</th>
                    <th className="px-4 py-3">Warranty</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {paged.map(system => {
                    const TypeIcon = typeIcon(system.systemType);
                    const wDays = system.warrantyExpiry ? daysUntil(system.warrantyExpiry) : null;
                    return (
                      <tr key={system.systemId || system._id} onClick={() => onView(system)} className="hover:bg-blue-50/30 transition-colors group cursor-pointer">
                        <td className="px-4 py-3.5 text-xs font-mono font-semibold text-slate-700">{system.systemId}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center shrink-0">
                              <TypeIcon size={13} className="text-blue-600" />
                            </div>
                            <div className="text-xs font-bold text-slate-900">{system.systemName}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-[11px] font-medium bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md text-slate-600">{system.systemType}</span>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-600 font-medium">{system.department}</td>
                        <td className="px-4 py-3.5 text-xs text-slate-500 max-w-[140px]">
                          <span className="truncate block" title={system.location}>{system.location}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[9px] font-bold shrink-0">
                              {system.assignedUser.split(" ").filter(Boolean).map(n => n[0]).join("").slice(0, 2) || "—"}
                            </div>
                            <span className="text-xs text-slate-600 font-medium">{system.assignedUser.split(" ")[0]}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-500">{system.purchaseDate ? formatDate(system.purchaseDate) : "—"}</td>
                        <td className="px-4 py-3.5">
                          {system.warrantyExpiry ? (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${wDays !== null && wDays < 0 ? "bg-red-50 text-red-600 border border-red-200" : wDays !== null && wDays < 90 ? "bg-amber-50 text-amber-600 border border-amber-200" : "bg-emerald-50 text-emerald-600 border border-emerald-200"}`}>
                              {wDays !== null && wDays < 0 ? "Expired" : formatDate(system.warrantyExpiry)}
                            </span>
                          ) : <span className="text-[10px] text-slate-400">—</span>}
                        </td>
                        <td className="px-4 py-3.5"><SystemStatusBadge status={system.status} /></td>
                        <td className="px-4 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => onView(system)} title="View" className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"><Eye size={14} /></button>
                            <button onClick={() => onEdit(system)} title="Edit" className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"><Edit2 size={14} /></button>
                            <button onClick={() => onDelete(system)} title="Delete" className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/30">
              <span className="text-xs text-slate-500">Page {page} of {totalPages} · {filtered.length} system{filtered.length !== 1 ? "s" : ""}</span>
              <div className="flex items-center gap-1">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="h-7 px-2.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 transition-colors">Previous</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)} className={`h-7 w-7 text-xs font-bold rounded-md transition-colors ${p === page ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{p}</button>
                ))}
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="h-7 px-2.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 transition-colors">Next</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM INVENTORY MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function SystemInventoryPage() {
  // Backend-ready local state, seeded from SYSTEMS (empty by default).
  // TODO: GET /api/system-inventory — fetch and setSystems(data) on mount.
  const [systems, setSystems] = useState<SystemInventory[]>(SYSTEMS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSystem, setEditingSystem] = useState<SystemInventory | null>(null);
  const [viewingSystem, setViewingSystem] = useState<SystemInventory | null>(null);
  const [deletingSystem, setDeletingSystem] = useState<SystemInventory | null>(null);

  const handleSave = (record: SystemInventory) => {
    setSystems(prev => {
      const exists = prev.some(s => s.systemId === record.systemId && (editingSystem ? s.systemId === editingSystem.systemId : true));
      if (editingSystem) {
        return prev.map(s => (s.systemId === editingSystem.systemId ? record : s));
      }
      return [record, ...prev];
    });
    setEditingSystem(null);
  };

  const handleDelete = (system: SystemInventory) => {
    // TODO: DELETE /api/system-inventory/:id
    setSystems(prev => prev.filter(s => s.systemId !== system.systemId));
    setDeletingSystem(null);
    setViewingSystem(null);
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto animate-in fade-in duration-300">
      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-2">
          <LayoutDashboard size={12} />
          <span>Dashboard</span>
          <ChevronRight size={12} />
          <span className="text-slate-700 font-semibold">System Inventory</span>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm shadow-blue-200">
              <Server size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">System Inventory</h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Manage laptops, desktop PCs and printers across the organization · {systems.length} system{systems.length !== 1 ? "s" : ""} registered
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
              <Download size={13} /> Export
            </button>
            <button onClick={() => { setEditingSystem(null); setShowAddModal(true); }}
              className="flex items-center gap-1.5 h-9 px-4 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
              <Plus size={14} /> Add System
            </button>
          </div>
        </div>
      </div>

      <SystemInventoryTable
        systems={systems}
        onView={setViewingSystem}
        onEdit={s => { setEditingSystem(s); setShowAddModal(true); }}
        onDelete={setDeletingSystem}
      />

      {/* ── MODALS & OVERLAYS ── */}
      {showAddModal && (
        <AddSystemModal
          onClose={() => { setShowAddModal(false); setEditingSystem(null); }}
          onSave={handleSave}
          editRecord={editingSystem ?? undefined}
          departments={DEPARTMENTS}
        />
      )}
      {viewingSystem && (
        <SystemDetailsDrawer
          system={viewingSystem}
          onClose={() => setViewingSystem(null)}
          onEdit={() => { setEditingSystem(viewingSystem); setViewingSystem(null); setShowAddModal(true); }}
        />
      )}
      {deletingSystem && (
        <DeleteConfirmDialog
          system={deletingSystem}
          onClose={() => setDeletingSystem(null)}
          onConfirm={() => handleDelete(deletingSystem)}
        />
      )}
    </div>
  );
}
