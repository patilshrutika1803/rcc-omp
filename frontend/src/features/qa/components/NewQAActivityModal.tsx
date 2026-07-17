import { X } from "lucide-react";
import type { CompletedStatus, QAActivityFormState } from "../types/qa";
import { DEPARTMENTS, REMINDER_OPTIONS } from "../constants/qaConstants";

interface NewQAActivityModalProps {
  newForm: QAActivityFormState;
  setNewForm: (form: QAActivityFormState) => void;
  onClose: () => void;
  onCreate: () => void;
}

export function NewQAActivityModal({ newForm, setNewForm, onClose, onCreate }: NewQAActivityModalProps) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center shrink-0">
          <h2 className="text-lg font-bold text-slate-900">New QA Activity</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">QMS Number *</label>
            <input value={newForm.qmsNumber} onChange={e => setNewForm({ ...newForm, qmsNumber: e.target.value })} placeholder="QMS-001" className="w-full h-9 px-3 text-sm border rounded-lg" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">QMS Type *</label>
            <input value={newForm.qmsType} onChange={e => setNewForm({ ...newForm, qmsType: e.target.value })} placeholder="SOP, Protocol, Validation, CAPA..." className="w-full h-9 px-3 text-sm border rounded-lg" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">QMS Description *</label>
            <textarea rows={3} value={newForm.qmsDescription} onChange={e => setNewForm({ ...newForm, qmsDescription: e.target.value })} className="w-full p-3 text-sm border rounded-lg resize-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Department *</label>
            <select value={newForm.department} onChange={e => setNewForm({ ...newForm, department: e.target.value })} className="w-full h-9 px-3 text-sm border rounded-lg">{DEPARTMENTS.map(d => <option key={d}>{d}</option>)}</select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Date *</label>
            <input type="date" value={newForm.targetDate} onChange={e => setNewForm({ ...newForm, targetDate: e.target.value })} className="w-full h-9 px-3 text-sm border rounded-lg" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reminder *</label>
            <select value={newForm.reminder} onChange={e => setNewForm({ ...newForm, reminder: e.target.value })} className="w-full h-9 px-3 text-sm border rounded-lg">{REMINDER_OPTIONS.map(r => <option key={r}>{r}</option>)}</select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Completed</label>
            <select value={newForm.completed} onChange={e => setNewForm({ ...newForm, completed: e.target.value as CompletedStatus })} className="w-full h-9 px-3 text-sm border rounded-lg">
              <option>Pending</option>
              <option>Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Action</label>
            <textarea rows={3} placeholder="Corrective actions, follow-up notes, observations, remarks..." value={newForm.action} onChange={e => setNewForm({ ...newForm, action: e.target.value })} className="w-full p-3 text-sm border rounded-lg resize-none" />
          </div>
        </div>
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex gap-3 rounded-b-xl shrink-0">
          <button onClick={onClose} className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
          <button onClick={onCreate} className="flex-1 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">Create QA Activity</button>
        </div>
      </div>
    </div>
  );
}
