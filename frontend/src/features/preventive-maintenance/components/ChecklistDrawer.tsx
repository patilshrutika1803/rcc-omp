import React, { useState } from "react";
import { CheckCircle2, ClipboardCheck, Loader2, X } from "lucide-react";
import type { PMChecklistItem, PMChecklistStatus, PMRecord } from "../types/pm";
import { formatDate } from "../utils/pmDateUtils";
import { SOP_CHECKLIST } from "../constants/pmConstants";

export type PMChecklistSubmission = { notes: string; items: PMChecklistItem[] };
type ChecklistDrawerProps = { record: PMRecord; onClose: () => void; onSubmit?: (submission: PMChecklistSubmission) => void; readOnly?: boolean };

function createItems(record: PMRecord): PMChecklistItem[] {
  return SOP_CHECKLIST.map(item => {
    const saved = record.checklistResponses?.find(response => response.number === item.number || response.label === item.label);
    return { ...item, status: saved?.status ?? "Completed", observation: saved?.observation ?? "" };
  });
}

const detailFields = [
  ["Due Date of Preventive Maintenance", (record: PMRecord) => formatDate(record.nextDue)],
  ["Preventive Maintenance Performed On", (record: PMRecord) => formatDate(record.completionDate || new Date().toISOString())],
  ["Department Name", (record: PMRecord) => record.department],
  ["System Code", (record: PMRecord) => record.systemId || record.machineId],
  ["Machine Name", (record: PMRecord) => record.machine || record.systemName],
  ["Machine ID", (record: PMRecord) => record.machineId],
  ["Assigned User", (record: PMRecord) => record.user || record.assignedUser],
  ["Frequency", (record: PMRecord) => record.frequency],
  ["Last Maintenance Date", (record: PMRecord) => formatDate(record.lastMaintenance)],
  ["Next Due Date", (record: PMRecord) => formatDate(record.nextDue)],
] as const;

export function ChecklistDrawer({ record, onClose, onSubmit, readOnly = false }: ChecklistDrawerProps) {
  const [items, setItems] = useState<PMChecklistItem[]>(() => createItems(record));
  const [notes, setNotes] = useState(record.completionNotes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canSubmit = items.every(item => item.status && item.observation.trim());
  const updateItem = (index: number, update: Partial<PMChecklistItem>) => setItems(previous => previous.map((item, itemIndex) => itemIndex === index ? { ...item, ...update } : item));
  const handleSubmit = () => { if (!onSubmit || !canSubmit) return; setIsSubmitting(true); onSubmit({ notes: notes.trim(), items }); };

  return (
    <div className="fixed inset-0 z-[80] flex">
      <div className="flex-1 bg-slate-900/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="w-full max-w-5xl bg-white border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center"><ClipboardCheck size={19} className="text-emerald-600" /></div><div><h2 className="text-sm font-bold text-slate-900">Preventive Maintenance Checklist</h2><p className="text-xs text-slate-500 mt-0.5">{readOnly ? "Completed checklist (read only)" : "Complete every SOP item before closing this PM"}</p></div></div>
          <div className="flex items-center gap-2"><button onClick={onClose} aria-label="Close checklist" className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"><X size={18} /></button></div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <section><h3 className="text-xs font-bold text-slate-700 mb-3">Maintenance Details</h3><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{detailFields.map(([label, getValue]) => <div key={label} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5"><div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</div><div className="text-sm font-semibold text-slate-900 mt-1">{getValue(record) || "\u2014"}</div></div>)}</div></section>
          <section><div className="flex items-center justify-between mb-3"><h3 className="text-xs font-bold text-slate-700">Execution Activity</h3><span className="text-[11px] text-slate-500">{items.length} SOP items</span></div><div className="border border-slate-200 rounded-xl overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider"><tr><th className="px-3 py-3 w-16">Sr. No.</th><th className="px-3 py-3">Execution Activity</th><th className="px-3 py-3 w-40">Status</th><th className="px-3 py-3 w-72">Observation</th></tr></thead><tbody className="divide-y divide-slate-100">{items.map((item, index) => <tr key={item.number} className="align-top"><td className="px-3 py-3 text-xs font-bold text-slate-500">{item.number}</td><td className="px-3 py-3 text-sm text-slate-700 leading-5">{item.label}</td><td className="px-3 py-3">{readOnly ? <span className="text-xs font-semibold text-emerald-700">{item.status}</span> : <select value={item.status} onChange={event => updateItem(index, { status: event.target.value as PMChecklistStatus })} className="w-full px-2 py-2 text-xs bg-white border border-slate-300 rounded-lg"><option value="Completed">Completed</option><option value="Not Required">Not Required</option></select>}</td><td className="px-3 py-3">{readOnly ? <p className="text-xs text-slate-600 whitespace-pre-wrap">{item.observation || "\u2014"}</p> : <textarea value={item.observation} onChange={event => updateItem(index, { observation: event.target.value })} rows={2} placeholder="Enter observation" className="w-full px-2 py-2 text-xs bg-white border border-slate-300 rounded-lg resize-y" />}</td></tr>)}</tbody></table></div></section>
          <section><label htmlFor="pm-checklist-notes" className="text-xs font-semibold text-slate-700 mb-1.5 block">Completion Notes</label><textarea id="pm-checklist-notes" value={notes} onChange={event => setNotes(event.target.value)} readOnly={readOnly} rows={5} placeholder="Optional completion notes" className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg resize-y read-only:bg-slate-50" /></section>
        </div>
        {!readOnly && <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center gap-3 shrink-0"><span className="text-xs text-slate-500 flex-1">{canSubmit ? "Ready to submit" : "Select a status and enter an observation for every item."}</span><button onClick={onClose} className="px-4 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg">Cancel</button><button onClick={handleSubmit} disabled={!canSubmit || isSubmitting} className="px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-lg disabled:opacity-50 flex items-center gap-2">{isSubmitting ? <><Loader2 size={15} className="animate-spin" /> Saving Checklist...</> : <><CheckCircle2 size={15} /> Submit Checklist</>}</button></div>}
      </div>
    </div>
  );
}

export default ChecklistDrawer;
