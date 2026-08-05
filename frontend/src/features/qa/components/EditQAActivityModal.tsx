import { X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import { toast } from "sonner";
import type { QAActivity, QAActivityFormState } from "../types/qa";
import { DEPARTMENTS, PRIORITY_OPTIONS, REMINDER_OPTIONS } from "../constants/qaConstants";
import { getMissingFields } from "../utils/qaValidation";

interface EditQAActivityModalProps {
  activity: QAActivity;
  onClose: () => void;
  onSave: (updated: QAActivity) => void;
}

export function EditQAActivityModal({ activity, onClose, onSave }: EditQAActivityModalProps) {
  const initialForm = useMemo<QAActivityFormState>(() => ({
    qmsNumber: activity.qmsNumber,
    qmsType: activity.qmsType,
    qmsDescription: activity.qmsDescription,
    department: activity.department,
    targetDate: activity.targetDate,
    dueDate: activity.dueDate,
    reminder: activity.reminder,
    priority: activity.priority,
    assignedUser: activity.assignedUser,
    action: "",
  }), [activity]);

  const [form, setForm] = useState<QAActivityFormState>(initialForm);
  const [invalid, setInvalid] = useState<Record<string, boolean>>({});
  const qmsNumberRef = useRef<HTMLInputElement | null>(null);
  const qmsTypeRef = useRef<HTMLInputElement | null>(null);
  const qmsDescriptionRef = useRef<HTMLTextAreaElement | null>(null);
  const departmentRef = useRef<HTMLSelectElement | null>(null);
  const dueDateRef = useRef<HTMLInputElement | null>(null);
  const reminderRef = useRef<HTMLSelectElement | null>(null);

  const handleSave = () => {
    const missing = getMissingFields(form);
    if (missing.length > 0) {
      const labels = missing.map((key) => {
        switch (key) {
          case "qmsNumber":
            return "QMS Number";
          case "qmsType":
            return "QMS Type";
          case "qmsDescription":
            return "QMS Description";
          case "department":
            return "Department";
          case "dueDate":
            return "Due Date";
          case "reminder":
            return "Reminder";
          default:
            return key;
        }
      });
      const map: Record<string, boolean> = {};
      missing.forEach((key) => (map[key] = true));
      setInvalid(map);
      toast.error(`Validation Failed: ${labels.join(", ")}`);

      const first = missing[0];
      const refMap: Record<string, RefObject<HTMLElement | null>> = {
        qmsNumber: qmsNumberRef,
        qmsType: qmsTypeRef,
        qmsDescription: qmsDescriptionRef,
        department: departmentRef,
        dueDate: dueDateRef,
        reminder: reminderRef,
      };
      const el = refMap[first]?.current as HTMLElement | null;
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setInvalid({});
    onSave({
      ...activity,
      qmsNumber: form.qmsNumber,
      qmsType: form.qmsType,
      qmsDescription: form.qmsDescription,
      department: form.department,
      targetDate: form.targetDate,
      dueDate: form.dueDate || form.targetDate,
      reminder: form.reminder,
      priority: form.priority,
      assignedUser: form.assignedUser,
      status: activity.status,
    });
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/45 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Edit QA Activity</h2>
            <p className="text-xs text-slate-500">Update the activity details below.</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-4 overflow-y-auto p-5 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">QMS Number *</label>
            <input ref={qmsNumberRef} value={form.qmsNumber} onChange={(event) => setForm({ ...form, qmsNumber: event.target.value })} className={`h-9 w-full rounded-lg border px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${invalid.qmsNumber ? "border-red-500 ring-2 ring-red-100" : "border-slate-300"}`} />
            {invalid.qmsNumber && <div className="mt-1 text-xs text-red-600">QMS Number is required.</div>}
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">QMS Type *</label>
            <input ref={qmsTypeRef} value={form.qmsType} onChange={(event) => setForm({ ...form, qmsType: event.target.value })} className={`h-9 w-full rounded-lg border px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${invalid.qmsType ? "border-red-500 ring-2 ring-red-100" : "border-slate-300"}`} />
            {invalid.qmsType && <div className="mt-1 text-xs text-red-600">QMS Type is required.</div>}
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-slate-700">QMS Description *</label>
            <textarea ref={qmsDescriptionRef} rows={4} value={form.qmsDescription} onChange={(event) => setForm({ ...form, qmsDescription: event.target.value })} className={`w-full resize-none rounded-lg border p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${invalid.qmsDescription ? "border-red-500 ring-2 ring-red-100" : "border-slate-300"}`} />
            {invalid.qmsDescription && <div className="mt-1 text-xs text-red-600">QMS Description is required.</div>}
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Department *</label>
            <select ref={departmentRef} value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} className={`h-9 w-full rounded-lg border px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${invalid.department ? "border-red-500 ring-2 ring-red-100" : "border-slate-300"}`}>
              {DEPARTMENTS.map((department) => (
                <option key={department}>{department}</option>
              ))}
            </select>
            {invalid.department && <div className="mt-1 text-xs text-red-600">Department is required.</div>}
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Priority</label>
            <select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value as QAActivityFormState["priority"] })} className="h-9 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
              {PRIORITY_OPTIONS.map((priority) => (
                <option key={priority}>{priority}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Due Date *</label>
            <input ref={dueDateRef} type="date" value={form.dueDate || form.targetDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} className={`h-9 w-full rounded-lg border px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${invalid.dueDate ? "border-red-500 ring-2 ring-red-100" : "border-slate-300"}`} />
            {invalid.dueDate && <div className="mt-1 text-xs text-red-600">Due Date is required.</div>}
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Reminder *</label>
            <select ref={reminderRef} value={form.reminder} onChange={(event) => setForm({ ...form, reminder: event.target.value })} className={`h-9 w-full rounded-lg border px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${invalid.reminder ? "border-red-500 ring-2 ring-red-100" : "border-slate-300"}`}>
              {REMINDER_OPTIONS.map((reminder) => (
                <option key={reminder}>{reminder}</option>
              ))}
            </select>
            {invalid.reminder && <div className="mt-1 text-xs text-red-600">Reminder selection is required.</div>}
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Assigned User</label>
            <input value={form.assignedUser} onChange={(event) => setForm({ ...form, assignedUser: event.target.value })} className="h-9 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4 shrink-0 rounded-b-2xl">
          <button onClick={onClose} className="flex-1 min-w-[140px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50">Cancel</button>
          <button onClick={handleSave} className="flex-1 min-w-[140px] rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700">Save Changes</button>
        </div>
      </div>
    </div>
  );
}
