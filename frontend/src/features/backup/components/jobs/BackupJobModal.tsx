import React, { useEffect, useState } from "react";
import { Archive, X } from "lucide-react";
import type { BackupJob, BackupJobFormData, BkpType } from "../../types/backup";
import { BKP_DEPARTMENTS, BKP_FREQUENCIES, BKP_TYPES, BKP_DEFAULT_FORM_TIME, BKP_DEFAULT_FORM_QUOTA, BKP_REMINDER_OPTIONS, BKP_PRIORITY_OPTIONS } from "../../constants/backupConstants";
import { calculateNextDueDate } from "../../../shared/utils/recurringWorkflow";
import { isBackupJobFormValid } from "../../utils/backupValidation";

export function BackupJobModal({ mode, initial, onSave, onCancel }: {
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
    systemId:    initial?.systemId    ?? "",
    initialDueDate: initial?.nextDueDate ?? initial?.dueDate ?? initial?.nextBackup?.split(" ")[0] ?? "",
    lastBackupDate: initial?.lastBackupDate ?? initial?.lastBackup ?? "",
    destination: initial?.destination ?? "",
    backupTime:  initial?.nextBackup?.split(" ")[1] ?? initial?.backupTime ?? BKP_DEFAULT_FORM_TIME,
    user:    initial?.user    ?? "",
    quota:       initial?.quota       ?? BKP_DEFAULT_FORM_QUOTA,
    description: initial?.description ?? "",
    priority: initial?.priority ?? "Medium",
    reminder: initial?.reminder ?? "1 Day Before",
  });
  const [hasManualInitialDueDate, setHasManualInitialDueDate] = useState(false);

  useEffect(() => {
    if (!form.frequency || form.frequency === "One Time" || !form.lastBackupDate) {
      if (!form.lastBackupDate && !form.initialDueDate) {
        setForm(current => ({ ...current, initialDueDate: current.initialDueDate }));
      }
      return;
    }

    if (hasManualInitialDueDate && form.initialDueDate) {
      return;
    }

    const autoInitialDueDate = calculateNextDueDate(form.lastBackupDate, form.frequency);
    if (!autoInitialDueDate) return;

    setForm((current) => {
      if (current.initialDueDate === autoInitialDueDate) return current;
      return { ...current, initialDueDate: autoInitialDueDate };
    });
  }, [form.frequency, form.lastBackupDate, hasManualInitialDueDate, form.initialDueDate]);

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
                {(BKP_TYPES as BkpType[]).map(t => <option key={t}>{t}</option>)}
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-bold text-slate-700 mb-1">Initial Due Date <span className="text-red-500">*</span></div>
              <input type="date" value={form.initialDueDate} onChange={e => { setHasManualInitialDueDate(true); set("initialDueDate", e.target.value); }} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-700 mb-1">Last Backup Date</div>
              <input type="date" value={form.lastBackupDate} onChange={e => set("lastBackupDate", e.target.value)} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-400" />
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-700 mb-1">System ID <span className="text-red-500">*</span></div>
            <input value={form.systemId} onChange={e => set("systemId", e.target.value)} placeholder="e.g. SYS-001" className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-bold text-slate-700 mb-1">Priority</div>
              <select value={form.priority} onChange={e => set("priority", e.target.value)} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-400">
                {BKP_PRIORITY_OPTIONS.map(priority => <option key={priority}>{priority}</option>)}
              </select>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-700 mb-1">Reminder</div>
              <select value={form.reminder} onChange={e => set("reminder", e.target.value)} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-400">
                {BKP_REMINDER_OPTIONS.map(option => <option key={option}>{option}</option>)}
              </select>
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-700 mb-1">Backup Destination <span className="text-red-500">*</span></div>
            <input
              value={form.destination}
              onChange={e => set("destination", e.target.value)}
              placeholder="e.g. NAS, AWS S3, Local Server, External HDD"
              className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-bold text-slate-700 mb-1">Assigned User <span className="text-red-500">*</span></div>
              <input
                value={form.user}
                onChange={e => set("user", e.target.value)}
                placeholder="Enter employee name"
                className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
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
          <button
            onClick={() => isBackupJobFormValid(form) && onSave(form)}
            disabled={!isBackupJobFormValid(form)}
            className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {mode === "add" ? "Save Backup Job" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
