import { X } from "lucide-react";
import { useState, useRef } from "react";
import type { QAActivityFormState } from "../types/qa";
import { DEPARTMENTS, PRIORITY_OPTIONS, REMINDER_OPTIONS } from "../constants/qaConstants";
import { getMissingFields } from "../utils/qaValidation";
import { toast } from "sonner";

interface NewQAActivityModalProps {
  newForm: QAActivityFormState;
  setNewForm: (form: QAActivityFormState) => void;
  onClose: () => void;
  onCreate: () => void;
}

export function NewQAActivityModal({ newForm, setNewForm, onClose, onCreate }: NewQAActivityModalProps) {
  const [invalid, setInvalid] = useState<Record<string, boolean>>({});
  const qmsNumberRef = useRef<HTMLInputElement | null>(null);
  const qmsTypeRef = useRef<HTMLInputElement | null>(null);
  const qmsDescriptionRef = useRef<HTMLTextAreaElement | null>(null);
  const departmentRef = useRef<HTMLSelectElement | null>(null);
  const dueDateRef = useRef<HTMLInputElement | null>(null);
  const reminderRef = useRef<HTMLSelectElement | null>(null);

  const handleCreate = () => {
    const missing = getMissingFields(newForm);
    if (missing.length > 0) {
      const labels = missing.map((k) => {
        switch (k) {
          case "qmsNumber": return "QMS Number";
          case "qmsType": return "QMS Type";
          case "qmsDescription": return "QMS Description";
          case "department": return "Department";
          case "dueDate": return "Due Date";
          case "reminder": return "Reminder";
          default: return k;
        }
      });
      const map: Record<string, boolean> = {};
      missing.forEach(m => (map[m] = true));
      setInvalid(map);
      toast.error(`Validation Failed: ${labels.join(", ")}`);
      // focus & scroll first invalid
      const first = missing[0];
      const refMap: Record<string, any> = {
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
    // valid
    setInvalid({});
    onCreate();
  };
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center shrink-0">
          <h2 className="text-lg font-bold text-slate-900">New QA Activity</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>
        <div className="p-5 grid gap-4 md:grid-cols-2 overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">QMS Number *</label>
            <input ref={qmsNumberRef} value={newForm.qmsNumber} onChange={(event) => setNewForm({ ...newForm, qmsNumber: event.target.value })} placeholder="QMS-001" className={`w-full h-9 px-3 text-sm border rounded-lg ${invalid.qmsNumber ? "border-red-500 ring-2 ring-red-100" : ""}`} />
            {invalid.qmsNumber && <div className="text-xs text-red-600 mt-1">QMS Number is required.</div>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">QMS Type *</label>
            <input ref={qmsTypeRef} value={newForm.qmsType} onChange={(event) => setNewForm({ ...newForm, qmsType: event.target.value })} placeholder="SOP, Protocol, Validation, CAPA..." className={`w-full h-9 px-3 text-sm border rounded-lg ${invalid.qmsType ? "border-red-500 ring-2 ring-red-100" : ""}`} />
            {invalid.qmsType && <div className="text-xs text-red-600 mt-1">QMS Type is required.</div>}
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">QMS Description *</label>
            <textarea ref={qmsDescriptionRef} rows={3} value={newForm.qmsDescription} onChange={(event) => setNewForm({ ...newForm, qmsDescription: event.target.value })} className={`w-full p-3 text-sm border rounded-lg resize-none ${invalid.qmsDescription ? "border-red-500 ring-2 ring-red-100" : ""}`} />
            {invalid.qmsDescription && <div className="text-xs text-red-600 mt-1">QMS Description is required.</div>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Department *</label>
            <select ref={departmentRef} value={newForm.department} onChange={(event) => setNewForm({ ...newForm, department: event.target.value })} className={`w-full h-9 px-3 text-sm border rounded-lg ${invalid.department ? "border-red-500 ring-2 ring-red-100" : ""}`}>{DEPARTMENTS.map((department) => <option key={department}>{department}</option>)}</select>
            {invalid.department && <div className="text-xs text-red-600 mt-1">Department is required.</div>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
            <select value={newForm.priority} onChange={(event) => setNewForm({ ...newForm, priority: event.target.value as QAActivityFormState["priority"] })} className="w-full h-9 px-3 text-sm border rounded-lg">{PRIORITY_OPTIONS.map((priority) => <option key={priority}>{priority}</option>)}</select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date *</label>
            <input ref={dueDateRef} type="date" value={newForm.dueDate || newForm.targetDate} onChange={(event) => setNewForm({ ...newForm, dueDate: event.target.value })} className={`w-full h-9 px-3 text-sm border rounded-lg ${invalid.dueDate ? "border-red-500 ring-2 ring-red-100" : ""}`} />
            {invalid.dueDate && <div className="text-xs text-red-600 mt-1">Due Date is required.</div>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reminder *</label>
            <select ref={reminderRef} value={newForm.reminder} onChange={(event) => setNewForm({ ...newForm, reminder: event.target.value })} className={`w-full h-9 px-3 text-sm border rounded-lg ${invalid.reminder ? "border-red-500 ring-2 ring-red-100" : ""}`}>{REMINDER_OPTIONS.map((reminder) => <option key={reminder}>{reminder}</option>)}</select>
            {invalid.reminder && <div className="text-xs text-red-600 mt-1">Reminder selection is required.</div>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned User</label>
            <input value={newForm.assignedUser} onChange={(event) => setNewForm({ ...newForm, assignedUser: event.target.value })} className="w-full h-9 px-3 text-sm border rounded-lg" />
          </div>
        </div>
          <div className="p-5 border-t border-slate-100 bg-slate-50 flex gap-3 rounded-b-xl shrink-0">
          <button onClick={onClose} className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
          <button onClick={handleCreate} className="flex-1 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">Create QA Activity</button>
        </div>
      </div>
    </div>
  );
}
