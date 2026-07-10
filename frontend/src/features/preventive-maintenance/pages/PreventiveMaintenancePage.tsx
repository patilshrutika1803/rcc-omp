// ─────────────────────────────────────────────────────────────────────────────
// PreventiveMaintenancePage
// Extracted from the original monolithic App.tsx (RCC OMP).
// Behavior, styling and Tailwind classes are unchanged from the original.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useMemo } from "react";
import {
  LayoutDashboard,
  Wrench,
  Archive,
  CheckSquare,
  Server,
  Search,
  ChevronDown,
  User,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  X,
  Info,
  Check,
  Plus,
  MoreHorizontal,
  Activity,
  AlertTriangle,
  ChevronLeft,
  Download,
  FileSpreadsheet,
  Table2,
  Grid3x3,
  SlidersHorizontal,
  Eye,
  Edit2,
  Trash2,
  Snooze,
  RefreshCw,
  ChevronUp,
  Cpu,
  Zap,
  RotateCcw,
  CalendarCheck,
  CalendarClock,
  UserCheck,
  Layers,
  AlarmClock,
  MoreVertical,
  ListFilter,
  ArrowUpDown,
  Copy,
  Flag
} from "lucide-react";
import { toast } from "sonner";
import LiveTimestamp from "../../../app/components/LiveTimestamp";
import type { PMRecord, PMPriority, PMStatus } from "@/features/preventive-maintenance/types/pm";
// System Inventory is the single source of truth for which systems can have
// a PM schedule. Only Laptop / Desktop PC records are PM-eligible; Printers
// never appear here.
// NOTE: adjust this relative path if System Inventory lives at a different
// location in your final folder structure.
import { SYSTEMS, type SystemInventory } from "../../system-inventory/pages/SystemInventoryPage";

const FREQUENCIES = ["Daily", "Weekly", "Bi-Weekly", "Monthly", "Quarterly", "Half-Yearly", "Yearly"];
const PM_ELIGIBLE_TYPES = ["Laptop", "Desktop PC"];

// Backward-compatible export for other modules that still import PM_DATA.
// Backend-ready: starts empty, no hardcoded/demo records.
export const PM_DATA: PMRecord[] = [];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function statusConfig(status: PMStatus) {
  switch (status) {
    case "Due Today":    return { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200",   dot: "bg-blue-600" };
    case "Overdue":     return { bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200",    dot: "bg-red-600" };
    case "Upcoming":    return { bg: "bg-slate-50",  text: "text-slate-600",  border: "border-slate-200",  dot: "bg-slate-400" };
    case "Completed":   return { bg: "bg-emerald-50",text: "text-emerald-700",border: "border-emerald-200",dot: "bg-emerald-500" };
    case "In Progress": return { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200",  dot: "bg-amber-500" };
    case "Scheduled":   return { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", dot: "bg-purple-500" };
    default:            return { bg: "bg-slate-50",  text: "text-slate-600",  border: "border-slate-200",  dot: "bg-slate-400" };
  }
}

function priorityConfig(priority: PMPriority) {
  switch (priority) {
    case "Critical": return { bg: "bg-red-50",    text: "text-red-700",    icon: "text-red-600" };
    case "High":     return { bg: "bg-orange-50", text: "text-orange-700", icon: "text-orange-500" };
    case "Medium":   return { bg: "bg-amber-50",  text: "text-amber-700",  icon: "text-amber-500" };
    case "Low":      return { bg: "bg-slate-50",  text: "text-slate-600",  icon: "text-slate-400" };
  }
}

function machineIcon(dept: string) {
  switch (dept) {
    case "IT Department": return Cpu;
    case "Production": return Layers;
    case "Warehouse": return Archive;
    case "Engineering": return Zap;
    case "Quality Control": return CheckSquare;
    default: return Server;
  }
}

function daysUntil(dateStr: string): number {
  const due = new Date(dateStr);
  const now = new Date();
  return Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}


function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// ─────────────────────────────────────────────────────────────────────────────
// PM MODULE COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

export function StatusBadge({ status }: { status: PMStatus }) {
  const cfg = statusConfig(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} shrink-0`} />
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: PMPriority }) {
  const cfg = priorityConfig(priority);
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}>
      <Flag size={10} className={cfg.icon} />
      {priority}
    </span>
  );
}

// ─── SKELETON ────────────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {/* KPI skeleton */}
      <div className="grid grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 h-24">
            <div className="h-3 bg-slate-200 rounded w-3/4 mb-3" />
            <div className="h-7 bg-slate-200 rounded w-1/2 mb-2" />
            <div className="h-2 bg-slate-100 rounded w-2/3" />
          </div>
        ))}
      </div>
      {/* Table skeleton */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="h-12 bg-slate-50 border-b border-slate-200" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-slate-100 last:border-0">
            <div className="w-8 h-8 bg-slate-100 rounded-lg shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-slate-200 rounded w-48" />
              <div className="h-2.5 bg-slate-100 rounded w-32" />
            </div>
            <div className="h-3 bg-slate-100 rounded w-20" />
            <div className="h-3 bg-slate-100 rounded w-16" />
            <div className="h-6 bg-slate-100 rounded w-20" />
            <div className="h-6 bg-slate-100 rounded w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── EMPTY STATE ─────────────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mb-5">
        <Wrench size={28} className="text-blue-400" />
      </div>
      <h3 className="text-base font-bold text-slate-900 mb-2">No maintenance tasks found</h3>
      <p className="text-sm text-slate-500 max-w-xs mb-6">
        No records match your current filters. Try adjusting filters or create a new PM task.
      </p>
      <div className="flex gap-3">
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
          <RefreshCw size={14} /> Reset Filters
        </button>
        <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
          <Plus size={14} /> Add PM Task
        </button>
      </div>
    </div>
  );
}

// ─── SEARCHABLE SYSTEM DROPDOWN ────────────────────────────────────────────────
// Replaces free-typed Machine ID entry. Lists only Laptop / Desktop PC systems
// pulled from System Inventory (Printers are excluded — they don't get PM).

function SystemSearchDropdown({
  systems,
  selected,
  onSelect,
  hasError,
}: {
  systems: SystemInventory[];
  selected: SystemInventory | null;
  onSelect: (system: SystemInventory) => void;
  hasError?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = useMemo(() => {
    if (!query) return systems;
    const q = query.toLowerCase();
    return systems.filter(s =>
      s.systemId.toLowerCase().includes(q) ||
      s.systemName.toLowerCase().includes(q) ||
      s.assignedUser.toLowerCase().includes(q)
    );
  }, [systems, query]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full h-9 px-3 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all flex items-center justify-between gap-2 ${hasError ? "border-red-400" : "border-slate-300"}`}
      >
        {selected ? (
          <span className="flex items-center gap-2 truncate">
            <span className="font-mono text-xs font-semibold text-slate-700">{selected.systemId}</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-700 truncate">{selected.systemName}</span>
          </span>
        ) : (
          <span className="text-slate-400">Search and select a system...</span>
        )}
        <ChevronDown size={14} className="text-slate-400 shrink-0" />
      </button>

      {open && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search System ID, name or user..."
                className="w-full h-8 pl-8 pr-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder-slate-400"
              />
            </div>
          </div>
          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-xs text-slate-400 text-center">No matching systems</div>
            ) : (
              filtered.map(s => (
                <button
                  key={s.systemId}
                  type="button"
                  onClick={() => { onSelect(s); setOpen(false); setQuery(""); }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-blue-50 transition-colors flex items-center justify-between gap-2 ${selected?.systemId === s.systemId ? "bg-blue-50" : ""}`}
                >
                  <span className="flex flex-col min-w-0">
                    <span className="font-semibold text-slate-800 truncate">{s.systemName}</span>
                    <span className="text-slate-400 font-mono">{s.systemId} · {s.systemType} · {s.department}</span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ADD PM MODAL ─────────────────────────────────────────────────────────────

function AddPMModal({ onClose, onSave, editRecord, departments, users }: { onClose: () => void; onSave: (record: PMRecord) => void; editRecord?: PMRecord; departments: string[]; users: string[] }) {
  const isEdit = !!editRecord;

  const [creationMode, setCreationMode] = useState<"existing" | "manual">(
    editRecord?.systemId ? "existing" : "manual"
  );

  const SYSTEM_MODE = creationMode;


  // Only Laptop / Desktop PC systems from System Inventory are eligible for PM.
  // TODO: GET /api/system-inventory?type=Laptop,Desktop PC — replace SYSTEMS
  // with the live backend list once the API is wired up.
  const eligibleSystems = useMemo(
    () => SYSTEMS.filter(s => PM_ELIGIBLE_TYPES.includes(s.systemType)),
    []
  );

  const initialSystem = editRecord?.systemId
    ? eligibleSystems.find(s => s.systemId === editRecord.systemId) ?? null
    : null;

  const [selectedSystem, setSelectedSystem] = useState<SystemInventory | null>(initialSystem);

  const [form, setForm] = useState({
    // Legacy UI fields
    machine: editRecord?.machine ?? "",
    machineId: editRecord?.machineId ?? "",
    department: editRecord?.department ?? "",
    location: editRecord?.location ?? "",
    user: editRecord?.user ?? "",
    frequency: editRecord?.frequency ?? "Monthly",
    priority: editRecord?.priority ?? "High",
    reminder: "1 Day Before",
    lastMaintenanceDate: editRecord?.lastMaintenance ?? new Date().toISOString().split("T")[0],
    dueDate: editRecord?.nextDue ?? new Date().toISOString().split("T")[0],

    // AWS-ready snapshot fields
    systemId: editRecord?.systemId ?? null,
    systemName: editRecord?.systemName ?? "",
    systemType: editRecord?.systemType ?? "",
    assignedUser: editRecord?.assignedUser ?? "",
    model: editRecord?.model ?? "",

    description: editRecord?.description ?? "",
    status: editRecord?.status ?? "Upcoming" as PMStatus,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleSelectSystem = (system: SystemInventory) => {
    setSelectedSystem(system);
    setForm(prev => ({
      ...prev,
      // PM legacy display fields
      machine: system.systemName,
      machineId: system.systemId,
      department: system.department,
      location: system.location,
      user: system.assignedUser,

      // Snapshot fields for AWS / backend compatibility
      systemId: system.systemId,
      systemName: system.systemName,
      systemType: system.systemType,
      assignedUser: system.assignedUser,
      model: system.model ?? prev.model,
    }));
    setErrors(prev => ({ ...prev, systemId: "", machineId: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};

    if (creationMode === "existing") {
      if (!form.systemId) e.systemId = "Please select a system";
    } else {
      if (!form.machine.trim()) e.machine = "Machine name is required";
      if (!form.machineId.trim()) e.machineId = "Machine ID is required";
    }

    if (!form.frequency) e.frequency = "Frequency is required";
    if (!form.priority) e.priority = "Priority is required";

    if (!form.lastMaintenanceDate || isNaN(new Date(form.lastMaintenanceDate).getTime())) {
      e.lastMaintenanceDate = "A valid last maintenance date is required";
    }
    if (!form.dueDate || isNaN(new Date(form.dueDate).getTime())) e.dueDate = "A valid due date is required";

    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setIsSaving(true);
    setTimeout(() => {
      const d = daysUntil(form.dueDate);
      const autoStatus: PMStatus = d < 0 ? "Overdue" : d === 0 ? "Due Today" : "Upcoming";

      const record: PMRecord = {
        id: editRecord?.id ?? `temp-${Date.now()}`,
        machine: form.machine.trim(),
        machineId: form.machineId.trim(),

        systemId: creationMode === "manual" ? null : form.systemId,
        systemName: creationMode === "manual" ? form.machine.trim() : form.systemName,
        systemType: creationMode === "manual" ? form.systemType || form.machine.trim() : form.systemType,

        department: form.department,
        location: form.location,
        assignedUser: form.user,

        model: creationMode === "manual" ? form.model : form.model,

        frequency: form.frequency,
        lastMaintenance: form.lastMaintenanceDate,
        nextDue: form.dueDate,
        priority: form.priority as PMPriority,
        user: form.user,
        status: autoStatus,
        description: form.description.trim(),

        history: editRecord?.history ?? [],
      };

      setIsSaving(false);
      onSave(record);
      onClose();
    }, 600);
  };

  const fieldClass = (key: string) =>
    `w-full h-9 px-3 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors[key] ? "border-red-400" : "border-slate-300"}`;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
              <Wrench size={18} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">{isEdit ? "Edit Preventive Maintenance" : "Add Preventive Maintenance"}</h2>
              <p className="text-xs text-slate-500">{isEdit ? "Update the PM schedule" : "Create a new PM schedule for a machine"}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Machine Source */}
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Machine Source</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCreationMode("existing")}
                className={`text-left px-3 py-2.5 rounded-lg border transition-all ${
                  creationMode === "existing"
                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/20"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <p className={`text-xs font-semibold ${creationMode === "existing" ? "text-blue-700" : "text-slate-700"}`}>
                  Existing System Inventory
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Create PM from an already registered machine.
                </p>
              </button>
              <button
                type="button"
                onClick={() => setCreationMode("manual")}
                className={`text-left px-3 py-2.5 rounded-lg border transition-all ${
                  creationMode === "manual"
                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/20"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <p className={`text-xs font-semibold ${creationMode === "manual" ? "text-blue-700" : "text-slate-700"}`}>
                  Manual Machine
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Create a maintenance schedule without System Inventory.
                </p>
              </button>
            </div>
          </div>

          {creationMode === "existing" ? (
            <>
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block">System <span className="text-red-500">*</span></label>
                <SystemSearchDropdown
                  systems={eligibleSystems}
                  selected={selectedSystem}
                  onSelect={handleSelectSystem}
                  hasError={!!errors.machineId}
                />
                {errors.machineId && <p className="text-[11px] text-red-500 mt-1">{errors.machineId}</p>}
                {eligibleSystems.length === 0 && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    No Laptop / Desktop PC systems are registered yet. Add one from System Inventory first.
                  </p>
                )}
              </div>

              {/* Auto-filled from the selected system — not editable here */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Department</label>
                  <input type="text" value={form.department} readOnly placeholder="Auto-filled"
                    className="w-full h-9 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-500 placeholder-slate-400 cursor-not-allowed" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Location</label>
                  <input type="text" value={form.location} readOnly placeholder="Auto-filled"
                    className="w-full h-9 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-500 placeholder-slate-400 cursor-not-allowed" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Assigned User</label>
                  <input type="text" value={form.user} readOnly placeholder="Auto-filled"
                    className="w-full h-9 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-500 placeholder-slate-400 cursor-not-allowed" />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Machine Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.machine}
                    onChange={e => { setForm({ ...form, machine: e.target.value }); setErrors(prev => ({ ...prev, machine: "" })); }}
                    placeholder="e.g. CNC Lathe #4"
                    className={fieldClass("machine") + " text-slate-700"}
                  />
                  {errors.machine && <p className="text-[11px] text-red-500 mt-1">{errors.machine}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Machine ID <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.machineId}
                    onChange={e => { setForm({ ...form, machineId: e.target.value }); setErrors(prev => ({ ...prev, machineId: "" })); }}
                    placeholder="e.g. MC-1042"
                    className={fieldClass("machineId") + " text-slate-700"}
                  />
                  {errors.machineId && <p className="text-[11px] text-red-500 mt-1">{errors.machineId}</p>}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Department <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.department}
                    onChange={e => setForm({ ...form, department: e.target.value })}
                    placeholder="e.g. Maintenance"
                    className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 placeholder-slate-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Location <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={e => setForm({ ...form, location: e.target.value })}
                    placeholder="e.g. Plant A - Bay 3"
                    className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 placeholder-slate-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Assigned User <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.user}
                    onChange={e => setForm({ ...form, user: e.target.value })}
                    placeholder="e.g. John Doe"
                    className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 placeholder-slate-400"
                  />
                </div>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Frequency <span className="text-red-500">*</span></label>
              <select
                value={form.frequency}
                onChange={e => setForm({ ...form, frequency: e.target.value })}
                className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
              >
                {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Reminder</label>
              <select
                value={form.reminder}
                onChange={e => setForm({ ...form, reminder: e.target.value })}
                className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
              >
                {["Same Day", "1 Day Before", "3 Days Before", "1 Week Before"].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Priority <span className="text-red-500">*</span></label>
              <select
                value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}
                className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
              >
                {["Critical", "High", "Medium", "Low"].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Last Maintenance Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={form.lastMaintenanceDate}
                onChange={e => { setForm({ ...form, lastMaintenanceDate: e.target.value }); setErrors(prev => ({ ...prev, lastMaintenanceDate: "" })); }}
                className={fieldClass("lastMaintenanceDate") + " text-slate-700"}
              />
              {errors.lastMaintenanceDate && <p className="text-[11px] text-red-500 mt-1">{errors.lastMaintenanceDate}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Due Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={form.dueDate}
                onChange={e => { setForm({ ...form, dueDate: e.target.value }); setErrors(prev => ({ ...prev, dueDate: "" })); }}
                className={fieldClass("dueDate") + " text-slate-700"}
              />
              {errors.dueDate && <p className="text-[11px] text-red-500 mt-1">{errors.dueDate}</p>}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Description / Checklist</label>
            <textarea
              placeholder="Describe the maintenance steps, checklist items, parts to inspect..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-400 resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Initial Status</label>
            <div className="flex gap-2 flex-wrap">
              {(["Scheduled", "Upcoming", "In Progress"] as PMStatus[]).map(s => (
                <button
                  key={s}
                  onClick={() => setForm({ ...form, status: s })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    form.status === s
                      ? "bg-blue-50 border-blue-300 text-blue-700"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <p className="text-[11px] text-slate-400">Fields marked with <span className="text-red-500">*</span> are required</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-70"
            >
              {isSaving ? (
                <><RefreshCw size={14} className="animate-spin" /> Saving...</>
              ) : (
                <><Plus size={14} /> {isEdit ? "Update PM Task" : "Save PM Task"}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── COMPLETE DIALOG ──────────────────────────────────────────────────────────

function CompleteDialog({ record, onClose, onConfirm }: { record: PMRecord; onClose: () => void; onConfirm: (notes: string) => void }) {
  const [completionNotes, setCompletionNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = () => {
    setIsLoading(true);
    setTimeout(() => {
      onConfirm(completionNotes);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle2 size={24} className="text-emerald-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Mark as Completed</h3>
            <p className="text-xs text-slate-500 mt-0.5">Confirm completion of this maintenance task</p>
          </div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5">
          <div className="text-xs font-bold text-slate-900 mb-1">{record.machine}</div>
          <div className="text-xs text-slate-500 font-mono">{record.machineId} · {record.department}</div>
          <div className="mt-2 flex items-center gap-3 text-xs text-slate-600">
            <span className="flex items-center gap-1"><CalendarIcon size={11} /> Due: {formatDate(record.nextDue)}</span>
            <span className="flex items-center gap-1"><UserCheck size={11} /> {record.user}</span>
          </div>
        </div>
        <div className="mb-5">
          <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Completion Notes</label>
          <textarea
            placeholder="Add any observations, parts replaced, or follow-up notes..."
            rows={3}
            value={completionNotes}
            onChange={e => setCompletionNotes(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none placeholder-slate-400"
          />
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleConfirm} disabled={isLoading} className="flex-1 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
            {isLoading ? <><RefreshCw size={14} className="animate-spin" /> Saving...</> : <><CheckCircle2 size={15} /> Confirm Complete</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SNOOZE DIALOG ────────────────────────────────────────────────────────────

function SnoozeDialog({ record, onClose, onSnooze }: { record: PMRecord; onClose: () => void; onSnooze: (newDate: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [customDate, setCustomDate] = useState("");

  const addDays = (dateStr: string, days: number): string => {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  };

  const options = [
    { label: "1 Day",  sublabel: formatDate(addDays(record.nextDue, 1)),  value: "1d" },
    { label: "3 Days", sublabel: formatDate(addDays(record.nextDue, 3)),  value: "3d" },
    { label: "7 Days", sublabel: formatDate(addDays(record.nextDue, 7)),  value: "7d" },
  ];

  const handleApply = () => {
    let newDate = "";
    if (selected === "1d") newDate = addDays(record.nextDue, 1);
    else if (selected === "3d") newDate = addDays(record.nextDue, 3);
    else if (selected === "7d") newDate = addDays(record.nextDue, 7);
    else if (selected === "custom" && customDate) newDate = customDate;

    if (!newDate) {
      toast.error("Please select a snooze option or pick a custom date.");
      return;
    }
    onSnooze(newDate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-12 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-center shrink-0">
            <AlarmClock size={24} className="text-amber-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Snooze Maintenance</h3>
            <p className="text-xs text-slate-500 mt-0.5">Postpone the due date for <span className="font-semibold text-slate-700">{record.machine}</span></p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => setSelected(opt.value)}
              className={`p-3 rounded-xl border-2 text-center transition-all ${
                selected === opt.value
                  ? "border-amber-400 bg-amber-50"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div className={`text-sm font-bold ${selected === opt.value ? "text-amber-700" : "text-slate-900"}`}>{opt.label}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{opt.sublabel}</div>
            </button>
          ))}
        </div>

        <div className="mb-5">
          <label className="text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5 block">
            <CalendarIcon size={12} /> Custom Date
          </label>
          <input
            type="date"
            value={customDate}
            onChange={e => { setCustomDate(e.target.value); setSelected("custom"); }}
            className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all"
          />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleApply} className="flex-1 py-2.5 text-sm font-semibold text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors flex items-center justify-center gap-2">
            <AlarmClock size={14} /> Apply Snooze
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DELETE DIALOG ────────────────────────────────────────────────────────────

function DeleteDialog({ record, onClose, onConfirm }: { record: PMRecord; onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-12 bg-red-50 border border-red-200 rounded-xl flex items-center justify-center shrink-0">
            <Trash2 size={24} className="text-red-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Delete Maintenance Task</h3>
            <p className="text-xs text-slate-500 mt-0.5">This action cannot be undone</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
          <div className="text-xs font-bold text-slate-900 mb-1">{record.machine}</div>
          <div className="text-xs text-slate-500 font-mono">{record.machineId} · {record.department}</div>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
            <Trash2 size={15} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MACHINE DETAILS DRAWER ───────────────────────────────────────────────────

function MachineDrawer({ record, onClose, onEdit, onComplete, onSnooze }: { record: PMRecord; onClose: () => void; onEdit: (r: PMRecord) => void; onComplete: (r: PMRecord) => void; onSnooze: (r: PMRecord) => void }) {
  const [tab, setTab] = useState<"info" | "history" | "schedule" | "timeline">("info");
  const Icon = machineIcon(record.department);
  const pCfg = priorityConfig(record.priority);
  const sCfg = statusConfig(record.status);

  const tabs = [
    { id: "info", label: "Machine Info" },
    { id: "history", label: "History" },
    { id: "schedule", label: "Schedule" },
    { id: "timeline", label: "Timeline" },
  ] as const;

  return (
    <div className="fixed inset-0 z-[60] flex">
      <div className="flex-1 bg-slate-900/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="w-[520px] bg-white border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center shrink-0">
                <Icon size={18} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">{record.machine}</h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{record.machineId}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={record.status} />
            <PriorityBadge priority={record.priority} />
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
              <RotateCcw size={10} /> {record.frequency}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 border-b border-slate-100 flex gap-0">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
                tab === t.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {tab === "info" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Department", value: record.department },
                  { label: "Location", value: record.location },
                  { label: "Model", value: record.model },
                  { label: "User", value: record.user },
                  { label: "Frequency", value: record.frequency },
                  { label: "Next Due", value: formatDate(record.nextDue) },
                ].map(item => (
                  <div key={item.label} className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{item.label}</div>
                    <div className="text-sm font-semibold text-slate-900">{item.value}</div>
                  </div>
                ))}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-700 mb-2">Maintenance Description</div>
                <div className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-4 border border-slate-100">
                  {record.description}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
                  <div className="text-xs text-emerald-600 font-semibold mb-1">Last Maintenance</div>
                  <div className="text-sm font-bold text-emerald-800">{formatDate(record.lastMaintenance)}</div>
                </div>
                <div className={`rounded-xl p-3 text-center border ${
                  daysUntil(record.nextDue) < 0
                    ? "bg-red-50 border-red-100"
                    : daysUntil(record.nextDue) === 0
                    ? "bg-blue-50 border-blue-100"
                    : "bg-amber-50 border-amber-100"
                }`}>
                  <div className={`text-xs font-semibold mb-1 ${daysUntil(record.nextDue) < 0 ? "text-red-600" : daysUntil(record.nextDue) === 0 ? "text-blue-600" : "text-amber-600"}`}>
                    Next Due
                  </div>
                  <div className={`text-sm font-bold ${daysUntil(record.nextDue) < 0 ? "text-red-800" : daysUntil(record.nextDue) === 0 ? "text-blue-800" : "text-amber-800"}`}>
                    {daysUntil(record.nextDue) === 0
                      ? "Today"
                      : daysUntil(record.nextDue) < 0
                      ? `${Math.abs(daysUntil(record.nextDue))}d overdue`
                      : `In ${daysUntil(record.nextDue)} days`}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "history" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-slate-700">Maintenance History</h3>
                <span className="text-[11px] text-slate-500">{record.history.length} records</span>
              </div>
              {record.history.map((h, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900">{formatDate(h.date)}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {h.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-700 leading-relaxed mb-2">{h.notes}</div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <User size={11} /> {h.user}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "schedule" && (
            <div className="space-y-4">
              <div className="text-xs font-bold text-slate-700 mb-4">Upcoming Schedule</div>
              {[0, 1, 2, 3].map(i => {
                const dueDate = new Date(record.nextDue);
                const freqMap: Record<string, number> = {
                  "Daily": 1, "Weekly": 7, "Bi-Weekly": 14,
                  "Monthly": 30, "Quarterly": 90, "Half-Yearly": 180, "Yearly": 365
                };
                const interval = freqMap[record.frequency] || 30;
                dueDate.setDate(dueDate.getDate() + i * interval);
                const isFirst = i === 0;
                return (
                  <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border ${isFirst ? "bg-blue-50 border-blue-200" : "bg-white border-slate-200"}`}>
                    <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center shrink-0 ${isFirst ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                      <span className="text-[10px] font-bold leading-none">{dueDate.toLocaleDateString("en-IN", { month: "short" })}</span>
                      <span className="text-lg font-bold leading-none">{dueDate.getDate()}</span>
                    </div>
                    <div className="flex-1">
                      <div className={`text-xs font-bold ${isFirst ? "text-blue-900" : "text-slate-900"}`}>
                        {isFirst ? "Next Due (Current)" : `${record.frequency} PM`}
                      </div>
                      <div className={`text-[11px] mt-0.5 ${isFirst ? "text-blue-600" : "text-slate-500"}`}>
                        {dueDate.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                      </div>
                    </div>
                    {isFirst && <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded">Upcoming</span>}
                  </div>
                );
              })}
            </div>
          )}

          {tab === "timeline" && (
            <div>
              <div className="text-xs font-bold text-slate-700 mb-4">Activity Timeline</div>
              <div className="relative border-l-2 border-slate-100 ml-2 space-y-5">
                {[
                  { time: "2 hours ago", title: "PM Task updated", desc: `Status changed to ${record.status}`, color: "bg-blue-100 text-blue-600" },
                  { time: formatDate(record.lastMaintenance), title: "Maintenance completed", desc: `Completed by ${record.user}`, color: "bg-emerald-100 text-emerald-600" },
                  { time: "PM created", title: "Task created", desc: "Recurring PM schedule added to the system", color: "bg-slate-100 text-slate-600" },
                ].map((log, i) => (
                  <div key={i} className="relative pl-6">
                    <div className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
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

        {/* Drawer Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex gap-3 shrink-0">
          <button onClick={() => onEdit(record)} className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
            <Edit2 size={13} /> Edit
          </button>
          <button onClick={() => onSnooze(record)} className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors">
            <AlarmClock size={13} /> Snooze
          </button>
          <button onClick={() => onComplete(record)} className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors">
            <CheckCircle2 size={13} /> Mark Complete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CARD VIEW ────────────────────────────────────────────────────────────────

function PMCardView({ data, onViewDetails, onComplete, onSnooze }: {
  data: PMRecord[];
  onViewDetails: (r: PMRecord) => void;
  onComplete: (r: PMRecord) => void;
  onSnooze: (r: PMRecord) => void;
}) {
  if (data.length === 0) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {data.map(record => {
        const Icon = machineIcon(record.department);
        const pCfg = priorityConfig(record.priority);
        const days = daysUntil(record.nextDue);
        return (
          <div
            key={record.id}
            className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all group cursor-pointer flex flex-col"
            onClick={() => onViewDetails(record)}
          >
            <div className="p-4 flex-1">
              {/* Card Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                    <Icon size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 leading-tight">{record.machine}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">{record.machineId}</div>
                  </div>
                </div>
                <button
                  onClick={e => e.stopPropagation()}
                  className="p-1 text-slate-300 hover:text-slate-600 rounded opacity-0 group-hover:opacity-100 transition-all"
                >
                  <MoreVertical size={15} />
                </button>
              </div>

              {/* Status + Priority */}
              <div className="flex gap-2 mb-4 flex-wrap">
                <StatusBadge status={record.status} />
                <PriorityBadge priority={record.priority} />
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                <div className="bg-slate-50 rounded-lg p-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Department</div>
                  <div className="font-semibold text-slate-700 text-[11px] truncate">{record.department}</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Frequency</div>
                  <div className="font-semibold text-slate-700 text-[11px]">{record.frequency}</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">User</div>
                  <div className="font-semibold text-slate-700 text-[11px] truncate">{record.user}</div>
                </div>
                <div className={`rounded-lg p-2 ${days < 0 ? "bg-red-50" : days === 0 ? "bg-blue-50" : "bg-amber-50"}`}>
                  <div className={`text-[10px] font-bold uppercase mb-0.5 ${days < 0 ? "text-red-400" : days === 0 ? "text-blue-400" : "text-amber-400"}`}>Due Date</div>
                  <div className={`font-bold text-[11px] ${days < 0 ? "text-red-700" : days === 0 ? "text-blue-700" : "text-amber-700"}`}>
                    {days === 0 ? "Today" : days < 0 ? `${Math.abs(days)}d overdue` : `In ${days}d`}
                  </div>
                </div>
              </div>

              {/* Progress indicator */}
              <div className="border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
                  <span>Last PM: {formatDate(record.lastMaintenance)}</span>
                  <span className="font-semibold text-slate-700">{record.history.length} records</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all ${days < 0 ? "bg-red-500" : days <= 3 ? "bg-amber-500" : "bg-emerald-500"}`}
                    style={{ width: `${Math.max(10, Math.min(100, 100 - (days / 30) * 100))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="border-t border-slate-100 px-4 py-3 flex gap-2" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => onSnooze(record)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-100 rounded-lg hover:bg-amber-100 transition-colors"
              >
                <AlarmClock size={12} /> Snooze
              </button>
              <button
                onClick={() => onComplete(record)}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <CheckCircle2 size={12} /> Complete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── CALENDAR VIEW ────────────────────────────────────────────────────────────

function PMCalendarView({ data }: { data: PMRecord[] }) {
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState({ year: now.getFullYear(), month: now.getMonth() }); // 0-indexed month

  const monthName = new Date(currentMonth.year, currentMonth.month, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const firstDay = new Date(currentMonth.year, currentMonth.month, 1).getDay();
  const daysInMonth = new Date(currentMonth.year, currentMonth.month + 1, 0).getDate();
  const today = new Date();

  const getTasksForDay = (day: number) => {
    const dateStr = `${currentMonth.year}-${String(currentMonth.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return data.filter(r => r.nextDue === dateStr || r.lastMaintenance === dateStr);
  };

  const prevMonth = () => {
    setCurrentMonth(prev => {
      const m = prev.month === 0 ? 11 : prev.month - 1;
      const y = prev.month === 0 ? prev.year - 1 : prev.year;
      return { year: y, month: m };
    });
  };

  const nextMonth = () => {
    setCurrentMonth(prev => {
      const m = prev.month === 11 ? 0 : prev.month + 1;
      const y = prev.month === 11 ? prev.year + 1 : prev.year;
      return { year: y, month: m };
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-bold text-slate-900">{monthName}</h3>
          <div className="flex gap-1">
            {[
              { color: "bg-blue-500", label: "Due Today" },
              { color: "bg-red-500", label: "Overdue" },
              { color: "bg-emerald-500", label: "Completed" },
              { color: "bg-slate-400", label: "Upcoming" },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1 text-[10px] text-slate-500 ml-2">
                <div className={`w-2 h-2 rounded-full ${l.color}`} />
                {l.label}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={prevMonth} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setCurrentMonth({ year: new Date().getFullYear(), month: new Date().getMonth() })}
            className="px-3 py-1 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Today
          </button>
          <button onClick={nextMonth} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 border-b border-slate-100">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
          <div key={d} className="py-3 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {/* Empty cells for offset */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="min-h-[110px] border-b border-r border-slate-100 bg-slate-50/30 p-2">
            <span className="text-[11px] text-slate-300">
              {new Date(currentMonth.year, currentMonth.month, -firstDay + i + 1).getDate()}
            </span>
          </div>
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayDate = new Date(currentMonth.year, currentMonth.month, day);
          const isToday = dayDate.toDateString() === today.toDateString();
          const tasks = getTasksForDay(day);
          const isWeekend = dayDate.getDay() === 0 || dayDate.getDay() === 6;

          return (
            <div
              key={day}
              className={`min-h-[110px] border-b border-r border-slate-100 p-2 transition-colors hover:bg-slate-50/50 ${
                isWeekend ? "bg-slate-50/20" : "bg-white"
              }`}
            >
              <div className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold mb-1.5 ${
                isToday ? "bg-blue-600 text-white" : "text-slate-700"
              }`}>
                {day}
              </div>
              <div className="space-y-1">
                {tasks.slice(0, 3).map(task => {
                  const isOverdue = task.status === "Overdue";
                  const isDue = task.status === "Due Today";
                  const isCompleted = task.status === "Completed";
                  return (
                    <div
                      key={task.id}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold truncate border cursor-pointer hover:opacity-80 ${
                        isOverdue ? "bg-red-50 text-red-700 border-red-200"
                        : isDue ? "bg-blue-50 text-blue-700 border-blue-200"
                        : isCompleted ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-50 text-slate-600 border-slate-200"
                      }`}
                      title={`${task.machine} — ${task.user}`}
                    >
                      {task.machine.split(" ").slice(0, 2).join(" ")}
                    </div>
                  );
                })}
                {tasks.length > 3 && (
                  <div className="text-[10px] text-slate-400 font-medium pl-1">+{tasks.length - 3} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MAINTENANCE TIMELINE ──────────────────────────────────────────────────────

function MaintenanceTimeline({ data }: { data: PMRecord[] }) {
  const today = data.filter(r => r.status === "Due Today" || r.status === "Overdue");
  const tomorrow = data.filter(r => {
    const d = daysUntil(r.nextDue);
    return d === 1;
  });
  const thisWeek = data.filter(r => {
    const d = daysUntil(r.nextDue);
    return d > 1 && d <= 7;
  });

  const Section = ({ title, items, accent }: { title: string; items: PMRecord[]; accent: string }) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-5">
        <div className={`flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider ${accent}`}>
          <div className="w-1.5 h-1.5 rounded-full bg-current" />
          {title}
          <span className="ml-auto font-bold text-current bg-current/10 px-2 py-0.5 rounded-full text-[10px]">
            {items.length}
          </span>
        </div>
        <div className="space-y-2">
          {items.map(r => {
            const Icon = machineIcon(r.department);
            return (
              <div key={r.id} className="flex items-center gap-3 p-2.5 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                <div className="w-7 h-7 bg-slate-50 rounded-lg flex items-center justify-center shrink-0 border border-slate-100">
                  <Icon size={12} className="text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">{r.machine}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                    <span>{r.user}</span>
                    <span>·</span>
                    <span>{r.frequency}</span>
                  </div>
                </div>
                <PriorityBadge priority={r.priority} />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <CalendarClock size={16} className="text-blue-500" /> Maintenance Timeline
        </h3>
      </div>
      <Section title="Due Today & Overdue" items={today} accent="text-red-600" />
      <Section title="Tomorrow" items={tomorrow} accent="text-amber-600" />
      <Section title="This Week" items={thisWeek} accent="text-blue-600" />
      {today.length === 0 && tomorrow.length === 0 && thisWeek.length === 0 && (
        <div className="text-center py-8">
          <CalendarCheck size={32} className="text-emerald-300 mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">All clear — no urgent maintenance in the next 7 days.</p>
        </div>
      )}
    </div>
  );
}

// ─── MAIN PM CONTENT ──────────────────────────────────────────────────────────

export default function PreventiveMaintenancePage() {
  const [viewMode, setViewMode] = useState<"table" | "card" | "calendar">("table");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showSnoozeDialog, setShowSnoozeDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PMRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [quickFilter, setQuickFilter] = useState("All");
  const [sortField, setSortField] = useState<string>("nextDue");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Backend-ready state: no hardcoded/demo maintenance records. Populated via API.
  const [pmRecords, setPmRecords] = useState<PMRecord[]>([]);
  const [timelineLog, setTimelineLog] = useState<{id: string; time: string; action: string; machine: string; user: string}[]>([]);

  // Backend-ready reference/lookup data (departments, assignable users).
  // Populated via API; empty by default so the UI never crashes with no data.
  const [departments, setDepartments] = useState<string[]>([]);
  const [users, setUsers] = useState<string[]>([]);

  // Network / request lifecycle state, ready for real API integration.
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [filters, setFilters] = useState({
    department: "",
    frequency: "",
    priority: "",
    status: "",
    dateFrom: "",
    dateTo: "",
  });

  const menuRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPMData() {
      setIsLoading(true);
      setLoadError(null);
      try {
        // TODO:
        // Fetch PM records
        // const res = await fetch('/api/pm-records');
        // if (!res.ok) throw new Error('Failed to fetch PM records');
        // const data = await res.json();
        // if (!cancelled) setPmRecords(Array.isArray(data) ? data : []);

        // TODO:
        // Fetch Machine List / Departments / Users
        // const [deptRes, userRes] = await Promise.all([
        //   fetch('/api/departments'),
        //   fetch('/api/users'),
        // ]);
        // if (!cancelled) {
        //   setDepartments(await deptRes.json());
        //   setUsers(await userRes.json());
        // }

        if (!cancelled) {
          // No backend connected yet — start from a clean, empty state.
          setPmRecords([]);
          setDepartments([]);
          setUsers([]);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError("Unable to load preventive maintenance data. Please try again.");
          setPmRecords([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadPMData();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, quickFilter, filters]);

  const quickFilters = ["All", "Due Today", "Overdue", "Upcoming", "Completed", "In Progress"];

  const filteredData = useMemo(() => {
    let d = [...pmRecords];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      d = d.filter(r =>
        r.machine.toLowerCase().includes(q) ||
        r.machineId.toLowerCase().includes(q) ||
        r.user.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q)
      );
    }
    if (quickFilter !== "All") d = d.filter(r => r.status === quickFilter);
    if (filters.department) d = d.filter(r => r.department === filters.department);
    if (filters.frequency) d = d.filter(r => r.frequency === filters.frequency);
    if (filters.priority) d = d.filter(r => r.priority === filters.priority);
    if (filters.status) d = d.filter(r => r.status === filters.status);

    d.sort((a, b) => {
      let cmp = 0;
      if (sortField === "nextDue") cmp = a.nextDue.localeCompare(b.nextDue);
      else if (sortField === "machine") cmp = a.machine.localeCompare(b.machine);
      else if (sortField === "priority") {
        const order = { Critical: 0, High: 1, Medium: 2, Low: 3 };
        cmp = order[a.priority] - order[b.priority];
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return d;
  }, [pmRecords, searchQuery, quickFilter, filters, sortField, sortDir]);

  const kpis = useMemo(() => ({
    total: pmRecords.length,
    dueToday: pmRecords.filter(r => r.status === "Due Today").length,
    upcoming: pmRecords.filter(r => r.status === "Upcoming" || r.status === "Scheduled").length,
    completed: pmRecords.filter(r => r.status === "Completed").length,
    overdue: pmRecords.filter(r => r.status === "Overdue").length,
  }), [pmRecords]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const pagedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const addTimelineEntry = (action: string, record: PMRecord) => {
    setTimelineLog(prev => [{
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      action, machine: record.machine, user: "Current User"
    }, ...prev.slice(0, 49)]);
  };

  const handleAddPM = (record: PMRecord) => {
    // TODO:
    // Create PM
    // POST /api/pm-records — the response contains the MongoDB-generated _id,
    // which should replace the temporary client-side id below.
    try {
      setPmRecords(prev => [record, ...prev]);
      addTimelineEntry("Added", record);
      toast.success("Preventive Maintenance Schedule Added Successfully");
    } catch (err) {
      toast.error("Failed to add maintenance schedule. Please try again.");
    }
  };

  const handleEditPM = (updated: PMRecord) => {
    // TODO:
    // Update PM
    // PUT /api/pm-records/:id
    try {
      setPmRecords(prev => prev.map(r => r.id === updated.id ? updated : r));
      addTimelineEntry("Updated", updated);
      toast.success("Maintenance Schedule Updated Successfully");
    } catch (err) {
      toast.error("Failed to update maintenance schedule. Please try again.");
    }
  };

  const handleDeletePM = (record: PMRecord) => {
    // TODO:
    // Delete PM
    // DELETE /api/pm-records/:id
    setIsDeleting(true);
    try {
      setPmRecords(prev => prev.filter(r => r.id !== record.id));
      addTimelineEntry("Deleted", record);
      toast.success("Maintenance Deleted Successfully");
    } catch (err) {
      toast.error("Failed to delete maintenance task. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false); setSelectedRecord(null);
    }
  };

  const handleCompletePM = (notes: string) => {
    if (!selectedRecord) return;
    // TODO:
    // Complete PM
    // POST /api/pm-records/:id/complete { notes }
    const today = new Date().toISOString().split("T")[0];
    const trimmedNotes = notes.trim();
    const updated = {
      ...selectedRecord,
      status: "Completed" as PMStatus,
      lastMaintenance: today,
      history: [{ date: today, user: "Current User", notes: trimmedNotes || "PM completed.", status: "Completed" }, ...selectedRecord.history]
    };
    try {
      setPmRecords(prev => prev.map(r => r.id === updated.id ? updated : r));
      addTimelineEntry("Completed", updated);
      toast.success("Maintenance Completed Successfully");
    } catch (err) {
      toast.error("Failed to mark maintenance as complete. Please try again.");
    } finally {
      setShowCompleteDialog(false); setSelectedRecord(null);
    }
  };

  const handleSnoozePM = (newDate: string) => {
    if (!selectedRecord) return;
    if (isNaN(new Date(newDate).getTime())) {
      toast.error("Please select a valid snooze date.");
      return;
    }
    // TODO:
    // Snooze PM
    // POST /api/pm-records/:id/snooze { nextDue: newDate }
    const d = daysUntil(newDate);
    const newStatus: PMStatus = d < 0 ? "Overdue" : d === 0 ? "Due Today" : "Upcoming";
    const updated = { ...selectedRecord, nextDue: newDate, status: newStatus };
    try {
      setPmRecords(prev => prev.map(r => r.id === updated.id ? updated : r));
      addTimelineEntry("Snoozed", updated);
      toast.success("Maintenance Snoozed Successfully");
    } catch (err) {
      toast.error("Failed to snooze maintenance task. Please try again.");
    } finally {
      setShowSnoozeDialog(false); setSelectedRecord(null);
    }
  };

  const handleDuplicate = (record: PMRecord) => {
    // TODO:
    // Create PM (duplicate)
    // const res = await fetch('/api/pm-records', { method: 'POST', body: JSON.stringify({ ...record, id: undefined, _id: undefined }) });
    // const saved = await res.json(); // MongoDB generates the real _id
    const dup = {
      ...record,
      // Temporary client-side id, replaced by the backend-generated _id once wired up.
      id: `temp-${Date.now()}`,
      status: "Upcoming" as PMStatus,
      history: [],
    };
    setPmRecords(prev => [dup, ...prev]);
    toast.success("PM Task Duplicated Successfully");
  };

  const handleCheckAll = () => {
    // TODO:
    // This can move server-side (a scheduled job that recalculates status
    // for all records) once the backend is connected. For now it recalculates
    // client-side from each record's stored nextDue date.
    setPmRecords(prev => prev.map(r => {
      if (r.status === "Completed") return r;
      const d = daysUntil(r.nextDue);
      const status: PMStatus = d < 0 ? "Overdue" : d === 0 ? "Due Today" : "Upcoming";
      return { ...r, status };
    }));
    toast.success("Preventive Maintenance status refreshed successfully.");
  };

  const handleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ArrowUpDown size={12} className="text-slate-300" />;
    return sortDir === "asc"
      ? <ChevronUp size={12} className="text-blue-500" />
      : <ChevronDown size={12} className="text-blue-500" />;
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto animate-in fade-in duration-300">

      {/* ── HEADER ── */}
      <div className="mb-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-2">
          <LayoutDashboard size={12} />
          <span>Dashboard</span>
          <ChevronRight size={12} />
          <span className="text-slate-700 font-semibold">Preventive Maintenance</span>
        </div>

        {/* Title row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm shadow-blue-200">
              <Wrench size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Preventive Maintenance</h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Schedule and track all machine maintenance activities · All Departments
              </p>
              <div className="mt-2 text-xs font-medium text-slate-600">
                <LiveTimestamp />
              </div>
            </div>

          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 h-9 px-4 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus size={14} /> Add PM
            </button>

            <button
              onClick={() => { toast.loading("Exporting..."); setTimeout(() => toast.success("Export Completed"), 1500); }}
              className="flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
              <Download size={14} /> Export PDF
            </button>
            <button className="flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
              <FileSpreadsheet size={14} /> Import Excel
            </button>

            {/* View Toggle */}
            <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200 ml-1">
              {[
                { id: "table", Icon: Table2, tip: "Table" },
                { id: "card",  Icon: Grid3x3, tip: "Card" },
                { id: "calendar", Icon: CalendarIcon, tip: "Calendar" },
              ].map(v => (
                <button
                  key={v.id}
                  onClick={() => setViewMode(v.id as any)}
                  title={v.tip}
                  className={`p-1.5 rounded-md transition-all ${
                    viewMode === v.id
                      ? "bg-white shadow-sm text-blue-600"
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  <v.Icon size={15} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search + Quick Filters row */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="relative w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search machines, users..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-400"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {quickFilters.map(f => (
              <button
                key={f}
                onClick={() => setQuickFilter(f)}
                className={`h-8 px-3 text-xs font-semibold rounded-lg transition-all border ${
                  quickFilter === f
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                {f}
                {f !== "All" && (
                  <span className={`ml-1.5 text-[10px] font-bold ${quickFilter === f ? "text-blue-200" : "text-slate-400"}`}>
                    {pmRecords.filter(r => r.status === f).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`ml-auto flex items-center gap-1.5 h-9 px-3 text-xs font-semibold border rounded-lg transition-colors ${
              showFilters
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
            }`}
          >
            <SlidersHorizontal size={14} /> Filters
            {Object.values(filters).some(v => v) && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 ml-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      {!isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
          {[
            {
              label: "Total PM", val: kpis.total, icon: Wrench,
              bg: "bg-blue-50", border: "border-blue-100", text: "text-blue-600",
              sub: "All schedules", subColor: "text-blue-400"
            },
            {
              label: "Due Today", val: kpis.dueToday, icon: CalendarClock,
              bg: "bg-amber-50", border: "border-amber-100", text: "text-amber-600",
              sub: "Requires attention", subColor: "text-amber-400"
            },
            {
              label: "Upcoming", val: kpis.upcoming, icon: CalendarIcon,
              bg: "bg-slate-50", border: "border-slate-100", text: "text-slate-600",
              sub: "Scheduled ahead", subColor: "text-slate-400"
            },
            {
              label: "Completed", val: kpis.completed, icon: CheckCircle2,
              bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-600",
              sub: "This period", subColor: "text-emerald-400"
            },
            {
              label: "Overdue", val: kpis.overdue, icon: AlertTriangle,
              bg: "bg-red-50", border: "border-red-100", text: "text-red-600",
              sub: "Immediate action", subColor: "text-red-400"
            },
          ].map((kpi, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-tight">{kpi.label}</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${kpi.bg} border ${kpi.border}`}>
                  <kpi.icon size={15} className={kpi.text} />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 mb-1">{kpi.val}</div>
              <div className={`text-[11px] font-medium ${kpi.subColor}`}>{kpi.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── ADVANCED FILTERS PANEL ── */}
      {showFilters && !isLoading && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 mb-5 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-700 flex items-center gap-2">
              <ListFilter size={14} className="text-blue-500" /> Advanced Filters
            </h3>
            <button
              onClick={() => setFilters({ department: "", frequency: "", priority: "", status: "", dateFrom: "", dateTo: "" })}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
            >
              <RefreshCw size={12} /> Reset All
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            {[
              {
                label: "Department", key: "department",
                opts: ["", ...departments], placeholder: "All Departments"
              },
              {
                label: "Frequency", key: "frequency",
                opts: ["", ...FREQUENCIES], placeholder: "All Frequencies"
              },
              {
                label: "Priority", key: "priority",
                opts: ["", "Critical", "High", "Medium", "Low"], placeholder: "All Priorities"
              },
              {
                label: "Status", key: "status",
                opts: ["", "Due Today", "Upcoming", "Completed", "Overdue", "In Progress", "Scheduled"], placeholder: "All Statuses"
              },
            ].map(f => (
              <div key={f.key}>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">{f.label}</label>
                <select
                  value={filters[f.key as keyof typeof filters]}
                  onChange={e => setFilters({ ...filters, [f.key]: e.target.value })}
                  className="w-full h-8 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700"
                >
                  <option value="">{f.placeholder}</option>
                  {f.opts.filter(Boolean).map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Date From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={e => setFilters({ ...filters, dateFrom: e.target.value })}
                className="w-full h-8 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Date To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={e => setFilters({ ...filters, dateTo: e.target.value })}
                className="w-full h-8 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── LOADING ── */}
      {isLoading && <LoadingSkeleton />}

      {/* ── MAIN CONTENT ── */}
      {!isLoading && (
        <>
          {viewMode === "table" && (
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
              {/* TABLE */}
              <div className="xl:col-span-3">
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/50">
                    <span className="text-xs font-semibold text-slate-500">
                      Showing <span className="font-bold text-slate-900">{pagedData.length}</span> of {filteredData.length} records
                    </span>
                  </div>

                  {filteredData.length === 0 ? (
                    <EmptyState onAdd={() => setShowAddModal(true)} />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-slate-50/70 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                          <tr>
                            <th className="px-4 py-3">
                              <button onClick={() => handleSort("machine")} className="flex items-center gap-1.5 hover:text-slate-700 transition-colors">
                                Machine <SortIcon field="machine" />
                              </button>
                            </th>
                            <th className="px-4 py-3">Department</th>
                            <th className="px-4 py-3">Frequency</th>
                            <th className="px-4 py-3">Last PM</th>
                            <th className="px-4 py-3">
                              <button onClick={() => handleSort("nextDue")} className="flex items-center gap-1.5 hover:text-slate-700 transition-colors">
                                Next Due <SortIcon field="nextDue" />
                              </button>
                            </th>
                            <th className="px-4 py-3">
                              <button onClick={() => handleSort("priority")} className="flex items-center gap-1.5 hover:text-slate-700 transition-colors">
                                Priority <SortIcon field="priority" />
                              </button>
                            </th>
                            <th className="px-4 py-3">User</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {pagedData.map(record => {
                            const Icon = machineIcon(record.department);
                            const days = daysUntil(record.nextDue);
                            return (
                              <tr
                                key={record.id}
                                className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                                onClick={() => { setSelectedRecord(record); setShowDrawer(true); }}
                              >
                                <td className="px-4 py-3.5">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center shrink-0">
                                      <Icon size={13} className="text-blue-600" />
                                    </div>
                                    <div>
                                      <div className="text-xs font-bold text-slate-900">{record.machine}</div>
                                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{record.machineId}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3.5">
                                  <span className="text-xs text-slate-600 font-medium">{record.department}</span>
                                </td>
                                <td className="px-4 py-3.5">
                                  <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md font-medium">
                                    <RotateCcw size={10} /> {record.frequency}
                                  </span>
                                </td>
                                <td className="px-4 py-3.5">
                                  <span className="text-xs text-slate-500">{formatDate(record.lastMaintenance)}</span>
                                </td>
                                <td className="px-4 py-3.5">
                                  <div>
                                    <div className={`text-xs font-bold ${days < 0 ? "text-red-600" : days === 0 ? "text-blue-600" : days <= 7 ? "text-amber-600" : "text-slate-700"}`}>
                                      {formatDate(record.nextDue)}
                                    </div>
                                    <div className={`text-[10px] mt-0.5 font-medium ${days < 0 ? "text-red-400" : days === 0 ? "text-blue-400" : "text-slate-400"}`}>
                                      {days === 0 ? "Today" : days < 0 ? `${Math.abs(days)}d ago` : `in ${days}d`}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3.5">
                                  <PriorityBadge priority={record.priority} />
                                </td>
                                <td className="px-4 py-3.5">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[9px] font-bold shrink-0">
                                      {record.user.split(" ").map(n => n[0]).join("")}
                                    </div>
                                    <span className="text-xs text-slate-600 font-medium">{record.user.split(" ")[0]}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3.5">
                                  <StatusBadge status={record.status} />
                                </td>
                                <td className="px-4 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                                  <div className="relative flex items-center justify-end" ref={openMenuId === record.id ? menuRef : undefined}>
                                    <button
                                      onClick={() => setOpenMenuId(openMenuId === record.id ? null : record.id)}
                                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                      <MoreHorizontal size={14} />
                                    </button>
                                    {openMenuId === record.id && (
                                      <div className="absolute right-0 top-8 z-50 bg-white border border-slate-200 rounded-xl shadow-lg py-1 w-44">
                                        <button
                                          onClick={() => { setSelectedRecord(record); setShowDrawer(true); setOpenMenuId(null); }}
                                          className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 w-full text-left"
                                        >
                                          <Eye size={13} /> View Details
                                        </button>
                                        <button
                                          onClick={() => { setSelectedRecord(record); setShowEditModal(true); setOpenMenuId(null); }}
                                          className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 w-full text-left"
                                        >
                                          <Edit2 size={13} /> Edit
                                        </button>
                                        <button
                                          onClick={() => { handleDuplicate(record); setOpenMenuId(null); }}
                                          className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 w-full text-left"
                                        >
                                          <Copy size={13} /> Duplicate
                                        </button>
                                        <button
                                          onClick={() => { setSelectedRecord(record); setShowCompleteDialog(true); setOpenMenuId(null); }}
                                          className="flex items-center gap-2 px-3 py-2 text-xs text-emerald-700 hover:bg-emerald-50 w-full text-left"
                                        >
                                          <CheckCircle2 size={13} /> Mark Complete
                                        </button>
                                        <button
                                          onClick={() => { setSelectedRecord(record); setShowSnoozeDialog(true); setOpenMenuId(null); }}
                                          className="flex items-center gap-2 px-3 py-2 text-xs text-amber-700 hover:bg-amber-50 w-full text-left"
                                        >
                                          <AlarmClock size={13} /> Snooze
                                        </button>
                                        <div className="border-t border-slate-100 mt-1 pt-1">
                                          <button
                                            onClick={() => { setSelectedRecord(record); setShowDeleteDialog(true); setOpenMenuId(null); }}
                                            className="flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 w-full text-left"
                                          >
                                            <Trash2 size={13} /> Delete
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>

                      {/* Pagination */}
                      <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/30">
                        <span className="text-xs text-slate-500">Page {currentPage} of {totalPages}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="h-7 px-2.5 text-xs font-medium text-slate-500 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 transition-colors"
                          >
                            Previous
                          </button>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                            <button
                              key={p}
                              onClick={() => setCurrentPage(p)}
                              className={`h-7 w-7 text-xs font-bold rounded-md ${currentPage === p ? "text-white bg-blue-600" : "text-slate-600 bg-white border border-slate-200 hover:bg-slate-50"}`}
                            >
                              {p}
                            </button>
                          ))}
                          <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="h-7 px-2.5 text-xs font-medium text-slate-500 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 transition-colors"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* TIMELINE SIDEBAR */}
              <div className="xl:col-span-1">
                <MaintenanceTimeline data={filteredData} />
              </div>
            </div>
          )}

          {viewMode === "card" && (
            <div>
              {filteredData.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
                  <EmptyState onAdd={() => setShowAddModal(true)} />
                </div>
              ) : (
                <PMCardView
                  data={filteredData}
                  onViewDetails={r => { setSelectedRecord(r); setShowDrawer(true); }}
                  onComplete={r => { setSelectedRecord(r); setShowCompleteDialog(true); }}
                  onSnooze={r => { setSelectedRecord(r); setShowSnoozeDialog(true); }}
                />
              )}
            </div>
          )}

          {viewMode === "calendar" && (
            <PMCalendarView data={filteredData} />
          )}
        </>
      )}

      {/* ── MODALS & OVERLAYS ── */}
      {showAddModal && <AddPMModal onClose={() => setShowAddModal(false)} onSave={handleAddPM} departments={departments} users={users} />}
      {showEditModal && selectedRecord && <AddPMModal onClose={() => { setShowEditModal(false); setSelectedRecord(null); }} onSave={handleEditPM} editRecord={selectedRecord} departments={departments} users={users} />}
      {showDrawer && selectedRecord && (
        <MachineDrawer
          record={selectedRecord}
          onClose={() => setShowDrawer(false)}
          onEdit={(r) => { setShowDrawer(false); setSelectedRecord(r); setShowEditModal(true); }}
          onComplete={(r) => { setSelectedRecord(r); setShowCompleteDialog(true); }}
          onSnooze={(r) => { setSelectedRecord(r); setShowSnoozeDialog(true); }}
        />
      )}
      {showCompleteDialog && selectedRecord && (
        <CompleteDialog
          record={selectedRecord}
          onClose={() => { setShowCompleteDialog(false); setSelectedRecord(null); }}
          onConfirm={handleCompletePM}
        />
      )}
      {showSnoozeDialog && selectedRecord && (
        <SnoozeDialog
          record={selectedRecord}
          onClose={() => { setShowSnoozeDialog(false); setSelectedRecord(null); }}
          onSnooze={handleSnoozePM}
        />
      )}
      {showDeleteDialog && selectedRecord && (
        <DeleteDialog
          record={selectedRecord}
          onClose={() => { setShowDeleteDialog(false); setSelectedRecord(null); }}
          onConfirm={() => handleDeletePM(selectedRecord)}
        />
      )}
    </div>
  );
}
