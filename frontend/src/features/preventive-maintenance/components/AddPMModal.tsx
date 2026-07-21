import React, { useState, useEffect, useRef } from "react";
import { Wrench, X, RefreshCw, Plus } from "lucide-react";
import type { PMRecord, PMPriority, PMStatus } from "../types/pm";
import type { SystemInventory } from "../../system-inventory/types/system";

import { FREQUENCIES, REMINDER_OPTIONS, PRIORITY_OPTIONS, INITIAL_STATUS_OPTIONS } from "../constants/pmConstants";
import { daysUntil, calculateNextDue } from "../utils/pmDateUtils";
import { SystemSearchDropdown } from "./SystemSearchDropdown";
import { PM_DEPARTMENT_OPTIONS } from "../constants/departmentAndUserConstants";

export function AddPMModal({ onClose, onSave, editRecord, departments: _departments, users: _users, eligibleSystems = [] }: { onClose: () => void; onSave: (record: PMRecord) => void; editRecord?: PMRecord; departments: string[]; users: string[]; eligibleSystems?: SystemInventory[] }) {
  const isEdit = !!editRecord;

  const [creationMode, setCreationMode] = useState<"existing" | "manual">(
    editRecord?.systemId ? "existing" : "manual"
  );

  const initialSystem = editRecord?.systemId
    ? eligibleSystems.find(s => s.systemId === editRecord.systemId) ?? null
    : null;

  const [selectedSystem, setSelectedSystem] = useState<SystemInventory | null>(initialSystem);

  // Track if user has manually edited the due date
  const manuallyEditedDueDate = useRef(false);

  const [form, setForm] = useState({
    machine: editRecord?.machine ?? "",
    machineId: editRecord?.machineId ?? "",
    department: editRecord?.department ?? "",
    location: editRecord?.location ?? "",
    user: editRecord?.user ?? "",
    frequency: editRecord?.frequency ?? "Monthly",
    priority: editRecord?.priority ?? "High",
    reminder: editRecord?.reminder ?? "1 Day Before",
    lastMaintenanceDate: editRecord?.lastMaintenance ?? new Date().toISOString().split("T")[0],
    dueDate: editRecord?.nextDue ?? "",
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

  // Auto-calculate due date when frequency or lastMaintenanceDate changes
  // Only if user has not manually edited the due date
  useEffect(() => {
    if (manuallyEditedDueDate.current) return;
    if (!form.frequency || !form.lastMaintenanceDate) return;
    const calculated = calculateNextDue(form.lastMaintenanceDate, form.frequency);
    if (calculated) {
      setForm(prev => ({ ...prev, dueDate: calculated }));
    }
  }, [form.frequency, form.lastMaintenanceDate]);

  const handleSelectSystem = (system: SystemInventory) => {
    setSelectedSystem(system);
    setForm(prev => ({
      ...prev,
      machine: system.systemName,
      machineId: system.systemId,
      department: system.department,
      location: system.location,
      user: system.assignedUser,
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
      // If dueDate is empty and not manually edited, calculate it
      let finalDueDate = form.dueDate;
      if (!finalDueDate && form.lastMaintenanceDate && form.frequency) {
        finalDueDate = calculateNextDue(form.lastMaintenanceDate, form.frequency);
      }
      const d = daysUntil(finalDueDate);
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
        reminder: form.reminder,
        checklist: form.description.trim(),
        lastMaintenance: form.lastMaintenanceDate,
        nextDue: finalDueDate,
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

              {/* Auto-filled from the selected system — editable fields */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Department</label>
                  <select
                    value={form.department}
                    disabled
                    className="w-full h-9 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                  >
                    {PM_DEPARTMENT_OPTIONS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Location</label>
                  <input type="text" value={form.location} readOnly placeholder="Auto-filled"
                    className="w-full h-9 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-500 placeholder-slate-400 cursor-not-allowed" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Assigned User <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.user}
                    onChange={e => { setForm({ ...form, user: e.target.value }); setErrors(prev => ({ ...prev, user: "" })); }}
                    placeholder="Enter assigned user"
                    className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 placeholder-slate-400"
                  />
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
                  <select
                    value={form.department}
                    onChange={e => setForm({ ...form, department: e.target.value })}
                    className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
                  >
                    <option value="">Select Department</option>
                    {PM_DEPARTMENT_OPTIONS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
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
                    placeholder="Enter assigned user"
                    onChange={e => { setForm({ ...form, user: e.target.value }); setErrors(prev => ({ ...prev, user: "" })); }}
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
                {REMINDER_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Priority <span className="text-red-500">*</span></label>
              <select
                value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value as PMPriority })}
                className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
              >
                {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
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
                onChange={e => {
                  manuallyEditedDueDate.current = true;
                  setForm({ ...form, dueDate: e.target.value });
                  setErrors(prev => ({ ...prev, dueDate: "" }));
                }}
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
              {INITIAL_STATUS_OPTIONS.map(s => (
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

export default AddPMModal;

