import React, { useEffect, useMemo, useState } from "react";
import { X, CalendarDays, Clock3, Archive, CheckCircle2 } from "lucide-react";
import type { BackupJob } from "../../types/backup";
import {
  validateBackupExecutionForm,
  type BackupExecutionFormErrors,
  type BackupExecutionFormValues,
} from "../../utils/backupExecutionValidation";
import { calculateNextBackupDate, calculateReminderDate } from "../../utils/backupReminderUtils";

const INSTITUTION_OPTIONS = ["SCADA", "System", "Server", "Database", "Other"] as const;
const INSTRUMENT_OPTIONS = ["IR", "UV", "HPLC", "GC", "PLC", "SCADA", "Server", "Desktop", "Laptop", "Other"] as const;
const UNIT_OPTIONS = ["KB", "MB", "GB", "TB"] as const;

export function BackupExecutionForm({
  job,
  mode = "complete",
  onClose,
  onSubmit,
}: {
  job: BackupJob;
  mode?: "complete" | "view";
  onClose: () => void;
  onSubmit: (values: BackupExecutionFormValues, job: BackupJob) => void;
}) {
  const getDisplayText = (value?: string | null) => {
    const trimmed = value?.trim();
    return trimmed && trimmed !== "—" ? trimmed : "";
  };

  const resolveFirstValidValue = (...values: Array<string | undefined | null>) => {
    return values.map(getDisplayText).find((value) => value !== "");
  };

  const historyDetails = job.history[0]?.executionDetails ?? job.executionData;
  const initialValues = useMemo<BackupExecutionFormValues>(() => ({
    institutionName: mode === "view" ? resolveFirstValidValue(
      job.institutionName,
      job.executionData?.institutionName,
      historyDetails?.institutionName,
    ) ?? "" : "",
    system: mode === "view" ? getDisplayText(historyDetails?.system) || job.server || "" : job.server || "",
    department: mode === "view" ? getDisplayText(historyDetails?.department) || job.department || "" : job.department || "",
    backupFrequency: mode === "view" ? getDisplayText(historyDetails?.backupFrequency) || job.frequency || "" : job.frequency || "",
    systemId: mode === "view" ? getDisplayText(historyDetails?.systemId) || job.systemId || "" : job.systemId || "",
    instrumentName: mode === "view" ? getDisplayText(historyDetails?.instrumentName) : "",
    backupDate: mode === "view" ? getDisplayText(historyDetails?.backupDate) : "",
    backupTime: mode === "view" ? getDisplayText(historyDetails?.backupTime) : "",
    backupSize: mode === "view" ? String(historyDetails?.backupSize ?? "") : "",
    unit: mode === "view" ? historyDetails?.unit || "GB" : "GB",
    doneBy: mode === "view" ? getDisplayText(historyDetails?.doneBy) : "",
    verifiedBy: mode === "view" ? resolveFirstValidValue(
      historyDetails?.verifiedBy,
      job.executionData?.verifiedBy,
      job.verifiedBy,
      job.lastVerified,
    ) ?? "" : "",
    executionNotes: mode === "view" ? getDisplayText(historyDetails?.executionNotes) : "",
  }), [job, mode, historyDetails]);

  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<BackupExecutionFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    setValues(initialValues);
    setErrors({});
    if (mode === "view") {
      setIsSubmitting(false);
    }
  }, [initialValues, mode]);

  const handleFieldChange = (field: keyof BackupExecutionFormValues, nextValue: string) => {
    setValues(current => ({ ...current, [field]: nextValue }));
    setErrors(current => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (mode === "view") {
      return;
    }
    const nextErrors = validateBackupExecutionForm(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    onSubmit(values, job);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 px-4 py-6">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 bg-emerald-50/70 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <Archive size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Backup Execution Form</h2>
              <p className="text-xs text-slate-500">Complete the execution details before finalizing the backup.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto px-6 py-5">
          {/* Scheduling preview (read-only) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 mb-2">
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">Due Date</label>
              <input value={job.nextDueDate || job.nextBackup.split(" ")[0] || job.originalDueDate || ""} readOnly className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600" />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">Last Due Date</label>
              <input value={(job.lastDueDate || job.lastBackup || job.lastBackupDate || "").split(" ")[0] || ""} readOnly className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600" />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">Next Due (Preview)</label>
              <input value={job.frequency && job.frequency !== "One Time" ? calculateNextBackupDate(job.nextBackup || `${job.nextDueDate || job.dueDate} ${job.backupTime}`, job.frequency, values.backupTime) : ""} readOnly className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600" />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">Reminder / Next Reminder</label>
              <input value={job.reminder ? `${job.reminder} ⇢ ${job.reminderDate ?? (job.nextDueDate || job.nextBackup ? calculateReminderDate(job.nextDueDate || job.nextBackup, job.reminder) : "")}` : ""} readOnly className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">Institution Name</label>
              <input
                value={values.institutionName}
                onChange={event => handleFieldChange("institutionName", event.target.value)}
                list="institution-options"
                readOnly={mode === "view"}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <datalist id="institution-options">
                {INSTITUTION_OPTIONS.map(option => (
                  <option key={option} value={option} />
                ))}
              </datalist>
              {errors.institutionName && <p className="mt-1 text-[11px] text-red-600">{errors.institutionName}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">System</label>
              <input
                value={values.system}
                onChange={event => handleFieldChange("system", event.target.value)}
                readOnly={mode === "view"}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">Department</label>
              <input
                value={values.department}
                readOnly
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">Backup Frequency</label>
              <input
                value={values.backupFrequency}
                readOnly
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">System ID</label>
              <input
                value={values.systemId}
                readOnly
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">Instrument Name</label>
              <select
                value={values.instrumentName}
                onChange={event => handleFieldChange("instrumentName", event.target.value)}
                disabled={mode === "view"}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-100"
              >
                <option value="">Select instrument</option>
                {INSTRUMENT_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              {errors.instrumentName && <p className="mt-1 text-[11px] text-red-600">{errors.instrumentName}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">Backup Date</label>
              <div className="relative">
                <CalendarDays size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={values.backupDate}
                  onChange={event => handleFieldChange("backupDate", event.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              {errors.backupDate && <p className="mt-1 text-[11px] text-red-600">{errors.backupDate}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">Backup Time</label>
              <div className="relative">
                <Clock3 size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="time"
                  value={values.backupTime}
                  onChange={event => handleFieldChange("backupTime", event.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              {errors.backupTime && <p className="mt-1 text-[11px] text-red-600">{errors.backupTime}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">Backup Size</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={values.backupSize}
                onChange={event => handleFieldChange("backupSize", event.target.value)}
                readOnly={mode === "view"}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              {errors.backupSize && <p className="mt-1 text-[11px] text-red-600">{errors.backupSize}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">Unit</label>
              <select
                value={values.unit}
                onChange={event => handleFieldChange("unit", event.target.value)}
                disabled={mode === "view"}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-100"
              >
                <option value="">Select unit</option>
                {UNIT_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              {errors.unit && <p className="mt-1 text-[11px] text-red-600">{errors.unit}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">Done By</label>
              <input
                value={values.doneBy}
                onChange={event => handleFieldChange("doneBy", event.target.value)}
                readOnly={mode === "view"}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              {errors.doneBy && <p className="mt-1 text-[11px] text-red-600">{errors.doneBy}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">Verified By</label>
              <input
                value={values.verifiedBy}
                onChange={event => handleFieldChange("verifiedBy", event.target.value)}
                readOnly={mode === "view"}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              {errors.verifiedBy && <p className="mt-1 text-[11px] text-red-600">{errors.verifiedBy}</p>}
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">Execution Notes</label>
            <textarea
              value={values.executionNotes}
              onChange={event => handleFieldChange("executionNotes", event.target.value)}
              rows={4}
              readOnly={mode === "view"}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            {errors.executionNotes && <p className="mt-1 text-[11px] text-red-600">{errors.executionNotes}</p>}
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50">
              Close
            </button>
            {mode !== "view" && (
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
              >
                <CheckCircle2 size={15} />
                {isSubmitting ? "Submitting..." : "Save Execution"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
