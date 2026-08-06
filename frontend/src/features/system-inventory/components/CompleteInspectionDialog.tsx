import React, { useState } from "react";
import { X, Check } from "lucide-react";

export type CompleteInspectionValues = {
  inspectionDate: string;
  inspectionTime: string;
  completedBy: string;
  verifiedBy?: string;
  verificationStatus?: string;
  observations?: string;
  correctiveActions?: string;
  completionNotes?: string;
  remarks?: string;
};

export function CompleteInspectionDialog({ onClose, onConfirm, systemName }: { onClose: () => void; onConfirm: (values: CompleteInspectionValues) => void; systemName?: string }) {
  const [values, setValues] = useState<CompleteInspectionValues>(() => {
    const today = new Date().toISOString().split("T")[0];
    const time = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    return { inspectionDate: today, inspectionTime: time, completedBy: "", verifiedBy: "", verificationStatus: "", observations: "", correctiveActions: "", completionNotes: "", remarks: "" };
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: keyof CompleteInspectionValues, v: string) => setValues(prev => ({ ...prev, [k]: v }));

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!values.inspectionDate) e.inspectionDate = "Required";
    if (!values.inspectionTime) e.inspectionTime = "Required";
    if (!values.completedBy || !values.completedBy.trim()) e.completedBy = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleConfirm = () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      onConfirm(values);
    } finally {
      setIsSaving(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Complete Inspection</h2>
            <p className="text-xs text-slate-500">Complete inspection for {systemName ?? "this system"}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"><X size={16} /></button>
        </div>
        <div className="p-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">Inspection Date *</label>
              <input type="date" value={values.inspectionDate} onChange={e => set("inspectionDate", e.target.value)} className={`w-full h-9 px-3 text-sm border rounded-lg ${errors.inspectionDate ? "border-red-400" : "border-slate-300"}`} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">Inspection Time *</label>
              <input type="time" value={values.inspectionTime} onChange={e => set("inspectionTime", e.target.value)} className={`w-full h-9 px-3 text-sm border rounded-lg ${errors.inspectionTime ? "border-red-400" : "border-slate-300"}`} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">Completed By *</label>
              <input value={values.completedBy} onChange={e => set("completedBy", e.target.value)} className={`w-full h-9 px-3 text-sm border rounded-lg ${errors.completedBy ? "border-red-400" : "border-slate-300"}`} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">Verified By</label>
              <input value={values.verifiedBy} onChange={e => set("verifiedBy", e.target.value)} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">Verification Status</label>
              <select value={values.verificationStatus} onChange={e => set("verificationStatus", e.target.value)} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg">
                <option value="">Select status</option>
                <option value="Verified">Verified</option>
                <option value="Not Verified">Not Verified</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">Attachment</label>
              <div className="w-full h-9 px-3 text-sm border border-dashed border-slate-300 rounded-lg flex items-center justify-between text-slate-500">No attachment</div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">Observations</label>
            <textarea value={values.observations} onChange={e => set("observations", e.target.value)} rows={3} className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg resize-none" />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">Corrective Actions</label>
            <textarea value={values.correctiveActions} onChange={e => set("correctiveActions", e.target.value)} rows={2} className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg resize-none" />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">Completion Notes</label>
            <textarea value={values.completionNotes} onChange={e => set("completionNotes", e.target.value)} rows={2} className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg resize-none" />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">Remarks</label>
            <textarea value={values.remarks} onChange={e => set("remarks", e.target.value)} rows={2} className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg resize-none" />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">Cancel</button>
          <button onClick={handleConfirm} disabled={isSaving} className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-70">
            <Check size={14} /> {isSaving ? "Saving..." : "Complete Inspection"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CompleteInspectionDialog;
