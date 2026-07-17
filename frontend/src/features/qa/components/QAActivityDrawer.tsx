import { useState } from "react";
import {
  CheckSquare,
  X,
  AlertTriangle,
  Download,
  Edit2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "../../../shared/utils/dateHelpers";
import type { CompletedStatus, QAActivity, QAActivityFormState } from "../types/qa";
import { DEPARTMENTS, REMINDER_OPTIONS } from "../constants/qaConstants";
import { isOverdue } from "../utils/qaHelpers";
import { validateActionNote, validateEditQAActivity } from "../utils/qaValidation";
import { QACompletedBadge } from "./QACompletedBadge";

interface QAActivityDrawerProps {
  record: QAActivity;
  onClose: () => void;
  onUpdate: (updated: QAActivity, newActionNote?: string) => void;
}

export function QAActivityDrawer({ record, onClose, onUpdate }: QAActivityDrawerProps) {
  const [tab, setTab] = useState<"info" | "history">("info");
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingAction, setIsAddingAction] = useState(false);

  const [editForm, setEditForm] = useState<QAActivityFormState>({
    qmsNumber: record.qmsNumber,
    qmsType: record.qmsType,
    qmsDescription: record.qmsDescription,
    department: record.department,
    targetDate: record.targetDate,
    reminder: record.reminder,
    completed: record.completed,
    action: "",
  });

  const [actionNote, setActionNote] = useState("");

  const handleExport = () => {
    // Placeholder – Word export will be implemented in a future release
  };

  const handleSaveEdit = () => {
    const result = validateEditQAActivity(editForm);
    if (!result.valid) {
      toast.error(result.message);
      return;
    }
    onUpdate({
      ...record,
      qmsNumber: editForm.qmsNumber,
      qmsType: editForm.qmsType,
      qmsDescription: editForm.qmsDescription,
      department: editForm.department,
      targetDate: editForm.targetDate,
      reminder: editForm.reminder,
      completed: editForm.completed,
    });
    toast.success("QA Activity Updated Successfully");
    setIsEditing(false);
  };

  const handleSaveAction = () => {
    const result = validateActionNote(actionNote);
    if (!result.valid) {
      toast.error(result.message);
      return;
    }
    onUpdate(record, actionNote.trim());
    toast.success("Action Recorded Successfully");
    setActionNote("");
    setIsAddingAction(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex">
      <div className="flex-1 bg-slate-900/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="w-[540px] bg-white border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 border border-purple-100 rounded-xl flex items-center justify-center shrink-0">
                <CheckSquare size={18} className="text-purple-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">{record.qmsType}</h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{record.qmsNumber} · {record.department}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <QACompletedBadge status={record.completed} />
            {isOverdue(record) && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border bg-red-50 text-red-700 border-red-200">
                <AlertTriangle size={12} /> Overdue
              </span>
            )}
          </div>
        </div>

        {!isEditing && !isAddingAction && (
          <div className="px-6 border-b border-slate-100 flex gap-0">
            {[
              { id: "info", label: "Activity Details" },
              { id: "history", label: "Action History" },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id as any)} className={`px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${tab === t.id ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
                {t.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {isEditing ? (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Edit QA Activity</h3>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">QMS Number *</label>
                <input value={editForm.qmsNumber} onChange={e => setEditForm({ ...editForm, qmsNumber: e.target.value })} placeholder="QMS-001" className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">QMS Type *</label>
                <input value={editForm.qmsType} onChange={e => setEditForm({ ...editForm, qmsType: e.target.value })} placeholder="SOP, Protocol, CAPA..." className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">QMS Description *</label>
                <textarea rows={4} value={editForm.qmsDescription} onChange={e => setEditForm({ ...editForm, qmsDescription: e.target.value })} className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department *</label>
                <select value={editForm.department} onChange={e => setEditForm({ ...editForm, department: e.target.value })} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none">
                  {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Date *</label>
                <input type="date" value={editForm.targetDate} onChange={e => setEditForm({ ...editForm, targetDate: e.target.value })} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reminder *</label>
                <select value={editForm.reminder} onChange={e => setEditForm({ ...editForm, reminder: e.target.value })} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none">
                  {REMINDER_OPTIONS.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Completed</label>
                <select value={editForm.completed} onChange={e => setEditForm({ ...editForm, completed: e.target.value as CompletedStatus })} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none">
                  <option>Pending</option>
                  <option>Completed</option>
                </select>
              </div>
            </div>
          ) : isAddingAction ? (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Add Action / Remark</h3>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Action</label>
                <textarea rows={6} placeholder="Corrective actions, follow-up notes, observations, remarks..." value={actionNote} onChange={e => setActionNote(e.target.value)} className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none" />
              </div>
            </div>
          ) : (
            <>
              {tab === "info" && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Department</div>
                      <div className="text-sm font-semibold text-slate-900">{record.department}</div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Target Date</div>
                      <div className="text-sm font-semibold text-slate-900">{formatDate(record.targetDate)}</div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Reminder</div>
                      <div className="text-sm font-semibold text-slate-900">{record.reminder}</div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">QMS Type</div>
                      <div className="text-sm font-semibold text-slate-900">{record.qmsType}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-slate-700 mb-2">QMS Description</div>
                    <div className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-4 border border-slate-100">
                      {record.qmsDescription || "No description provided."}
                    </div>
                  </div>
                </div>
              )}

              {tab === "history" && (
                <div>
                  <div className="text-xs font-bold text-slate-700 mb-4">Action History</div>
                  {record.actionHistory.length === 0 ? (
                    <div className="text-sm text-slate-400 bg-slate-50 rounded-xl p-6 border border-slate-100 text-center">
                      No actions recorded yet.
                    </div>
                  ) : (
                    <div className="relative border-l-2 border-slate-100 ml-2 space-y-5">
                      {record.actionHistory.map((entry, i) => (
                        <div key={i} className="relative pl-6">
                          <div className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full border-2 border-slate-200 bg-blue-100 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                          </div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{entry.time}</div>
                          <div className="text-[11px] text-slate-600 whitespace-pre-wrap">{entry.note}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex gap-3 shrink-0">
          {isEditing ? (
            <>
              <button onClick={() => setIsEditing(false)} className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSaveEdit} className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                Save Changes
              </button>
            </>
          ) : isAddingAction ? (
            <>
              <button onClick={() => { setIsAddingAction(false); setActionNote(""); }} className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSaveAction} className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                Save Action
              </button>
            </>
          ) : (
            <>
              <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
                <Download size={13} /> Export Word
              </button>
              <button onClick={() => {
                setIsEditing(true);
                setEditForm({
                  qmsNumber: record.qmsNumber,
                  qmsType: record.qmsType,
                  qmsDescription: record.qmsDescription,
                  department: record.department,
                  targetDate: record.targetDate,
                  reminder: record.reminder,
                  completed: record.completed,
                  action: "",
                });
              }} className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
                <Edit2 size={13} /> Edit
              </button>
              <button onClick={() => { setIsAddingAction(true); setActionNote(""); }} className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                <RefreshCw size={13} /> Add Action
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
