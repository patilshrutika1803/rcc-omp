import React, { useState } from "react";
import { Server, X, CalendarClock, Info, RefreshCw, Plus } from "lucide-react";
import type { SystemInventory, SystemPMSettings, SystemType } from "../types/system";
import { DEPARTMENTS, SYSTEM_TYPES, SYSTEM_CATEGORIES, STATUS_OPTIONS, PM_FREQUENCIES, PM_PRIORITIES, PM_REMINDERS, INSPECTION_FREQUENCIES, INSPECTION_REMINDERS } from "../constants/systemConstants";
import { emptySystem, validateSystemForm } from "../utils/systemHelpers";
import { calculateNextDue } from "../../preventive-maintenance/utils/pmDateUtils";
import { calculateReminderDate } from "../../shared/utils/recurringWorkflow";

export function AddSystemModal({
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
    setForm(prev => {
      const currentPmSettings = prev.pmSettings ?? {
        frequency: "Monthly",
        lastMaintenance: "",
        nextDue: "",
        priority: "Medium",
        description: "",
        assignedUser: "",
        reminder: "1 Day Before",
      };

      const nextPmSettings = {
        ...currentPmSettings,
        [key]: value,
      };

      if (key === "frequency" || key === "lastMaintenance") {
        const frequency = key === "frequency" ? value : nextPmSettings.frequency;
        const lastMaintenance = key === "lastMaintenance" ? value : nextPmSettings.lastMaintenance;
        nextPmSettings.nextDue = frequency && lastMaintenance ? calculateNextDue(lastMaintenance, frequency) : "";
      }

      return {
        ...prev,
        pmSettings: nextPmSettings,
      };
    });
  };

  // Track if user manually edited inspection next date
  const [manuallyEditedInspectionDue, setManuallyEditedInspectionDue] = useState(false);

  const updateInspection = (key: string, value: string) => {
    setForm(prev => {
      const current = prev.inspectionSettings ?? {
        frequency: getDefaultInspectionFrequency(prev.systemCategory),
        lastInspection: "",
        nextInspection: "",
        priority: "Medium",
        reminder: "1 Day Before",
        description: "",
        assignedUser: "",
      } as any;

      const next = { ...current, [key]: value };

      if (key === "frequency" || key === "lastInspection") {
        const frequency = key === "frequency" ? value : next.frequency;
        const last = key === "lastInspection" ? value : next.lastInspection;
        next.nextInspection = frequency && last ? calculateNextDue(last, frequency) : next.nextInspection;
      }

      return { ...prev, inspectionSettings: next };
    });
  };

  function getDefaultInspectionFrequency(category: string) {
    return category === "GxP" ? "Monthly" : "Quarterly";
  }

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

  // If systemCategory changes, ensure inspection frequency defaults accordingly
  const handleCategoryChange = (value: string) => {
    updateField("systemCategory", value);
  };

  const validate = () => validateSystemForm(form);

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
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Category <span className="text-red-500">*</span></label>
              <select value={form.systemCategory} onChange={e => handleCategoryChange(e.target.value)} className={fieldClass("systemCategory")}>
                <option value="">Select category</option>
                {SYSTEM_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.systemCategory && <p className="text-[11px] text-red-500 mt-1">{errors.systemCategory}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
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

          {/* ── Inspection Settings ── */}
          <div className="border border-blue-100 bg-blue-50/40 rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2">
              <CalendarClock size={15} className="text-blue-600" />
              <h3 className="text-xs font-bold text-slate-900">Inspection Settings</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Inspection Frequency</label>
                <select value={form.inspectionSettings?.frequency ?? getDefaultInspectionFrequency(form.systemCategory)} onChange={e => { setManuallyEditedInspectionDue(false); updateInspection("frequency", e.target.value); }}
                  className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700">
                  {INSPECTION_FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Reminder</label>
                <select value={form.inspectionSettings?.reminder ?? "1 Day Before"} onChange={e => updateInspection("reminder", e.target.value)}
                  className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700">
                  {INSPECTION_REMINDERS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Priority</label>
                <select value={form.inspectionSettings?.priority ?? "Medium"} onChange={e => updateInspection("priority", e.target.value)}
                  className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700">
                  {PM_PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Last Inspection Date</label>
                <input type="date" value={form.inspectionSettings?.lastInspection ?? ""} onChange={e => { setManuallyEditedInspectionDue(false); updateInspection("lastInspection", e.target.value); }}
                  className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Next Inspection Due Date <span className="text-red-500">*</span></label>
                <input type="date" value={form.inspectionSettings?.nextInspection ?? ""} onChange={e => { setManuallyEditedInspectionDue(true); updateInspection("nextInspection", e.target.value); }}
                  className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Inspection Description</label>
              <textarea placeholder="Describe inspection items or scope..." value={form.inspectionSettings?.description ?? ""} onChange={e => updateInspection("description", e.target.value)} rows={3}
                className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-400 resize-none" />
            </div>

            <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <Info size={12} className="shrink-0" />
              These inspection settings are saved on the system record and used to generate the recurring inspection schedule.
            </p>
          </div>
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
