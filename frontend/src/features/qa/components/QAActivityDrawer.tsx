import { useMemo, useState, useRef } from "react";
import { CheckSquare, X, AlertTriangle, Edit2, Copy, CheckCircle2, Trash2, Clock3 } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "../../../shared/utils/dateHelpers";
import type { QAActivity, QAActivityFormState } from "../types/qa";
import { DEPARTMENTS, PRIORITY_OPTIONS, REMINDER_OPTIONS } from "../constants/qaConstants";
import { activeStatusColor, isOverdue } from "../utils/qaHelpers";
import { validateActionNote, getMissingFields } from "../utils/qaValidation";

interface QAActivityDrawerProps {
  record: QAActivity;
  onClose: () => void;
  onUpdate: (updated: QAActivity, newActionNote?: string) => void;
  onEdit: () => void;
  onComplete: (note: string, completedBy?: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onSnooze: () => void;
}

export function QAActivityDrawer({ record, onClose, onUpdate, onEdit, onComplete, onDuplicate, onDelete, onSnooze }: QAActivityDrawerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [invalidEdit, setInvalidEdit] = useState<Record<string, boolean>>({});
  const qmsNumberRef = useRef<HTMLInputElement | null>(null);
  const qmsTypeRef = useRef<HTMLInputElement | null>(null);
  const qmsDescriptionRef = useRef<HTMLTextAreaElement | null>(null);
  const departmentRef = useRef<HTMLSelectElement | null>(null);
  const dueDateRef = useRef<HTMLInputElement | null>(null);
  const reminderRef = useRef<HTMLSelectElement | null>(null);
  const [editForm, setEditForm] = useState<QAActivityFormState>({
    qmsNumber: record.qmsNumber,
    qmsType: record.qmsType,
    qmsDescription: record.qmsDescription,
    department: record.department,
    targetDate: record.targetDate,
    dueDate: record.dueDate,
    reminder: record.reminder,
    priority: record.priority,
    assignedUser: record.assignedUser,
    action: "",
  });
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completeNote, setCompleteNote] = useState("");
  const [completedBy, setCompletedBy] = useState("");
  const [completedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const statusClasses = useMemo(() => activeStatusColor(record.status), [record.status]);
  const isCompleted = record.status === "Completed";

  const handleSaveEdit = () => {
    const missingKeys = getMissingFields(editForm);
    if (missingKeys.length > 0) {
      const labels = missingKeys.map((k) => {
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
      missingKeys.forEach((k) => (map[k] = true));
      setInvalidEdit(map);
      toast.error(`Validation Failed: ${labels.join(", ")}`);
      const first = missingKeys[0];
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
    setInvalidEdit({});
    onUpdate({
      ...record,
      qmsNumber: editForm.qmsNumber,
      qmsType: editForm.qmsType,
      qmsDescription: editForm.qmsDescription,
      department: editForm.department,
      targetDate: editForm.targetDate,
      dueDate: editForm.dueDate || editForm.targetDate,
      reminder: editForm.reminder,
      priority: editForm.priority,
      assignedUser: editForm.assignedUser,
      status: record.status,
    });
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex">
      <div className="flex-1 bg-slate-900/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="w-[560px] bg-white border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center shrink-0">
                <CheckSquare size={18} className="text-blue-600" />
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
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusClasses.bg} ${statusClasses.text} ${statusClasses.border}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${statusClasses.dot}`} />
              {record.status}
            </span>
            {isOverdue(record) && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border bg-red-50 text-red-700 border-red-200">
                <AlertTriangle size={12} /> Overdue
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {isEditing ? (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Edit QA Activity</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">QMS Number *</label>
                  <input ref={qmsNumberRef} value={editForm.qmsNumber} onChange={(event) => setEditForm({ ...editForm, qmsNumber: event.target.value })} className={`w-full h-9 px-3 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none ${invalidEdit.qmsNumber ? "border-red-500 ring-2 ring-red-100" : "border-slate-300"}`} />
                  {invalidEdit.qmsNumber && <div className="text-xs text-red-600 mt-1">QMS Number is required.</div>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">QMS Type *</label>
                  <input ref={qmsTypeRef} value={editForm.qmsType} onChange={(event) => setEditForm({ ...editForm, qmsType: event.target.value })} className={`w-full h-9 px-3 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none ${invalidEdit.qmsType ? "border-red-500 ring-2 ring-red-100" : "border-slate-300"}`} />
                  {invalidEdit.qmsType && <div className="text-xs text-red-600 mt-1">QMS Type is required.</div>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">QMS Description *</label>
                  <textarea ref={qmsDescriptionRef} rows={4} value={editForm.qmsDescription} onChange={(event) => setEditForm({ ...editForm, qmsDescription: event.target.value })} className={`w-full p-3 text-sm rounded-lg resize-none outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${invalidEdit.qmsDescription ? "border-red-500 ring-2 ring-red-100" : "border border-slate-300"}`} />
                  {invalidEdit.qmsDescription && <div className="text-xs text-red-600 mt-1">QMS Description is required.</div>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <select ref={departmentRef} value={editForm.department} onChange={(event) => setEditForm({ ...editForm, department: event.target.value })} className={`w-full h-9 px-3 text-sm rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${invalidEdit.department ? "border-red-500 ring-2 ring-red-100" : "border border-slate-300"}`}>
                    {DEPARTMENTS.map((department) => <option key={department}>{department}</option>)}
                  </select>
                  {invalidEdit.department && <div className="text-xs text-red-600 mt-1">Department is required.</div>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                  <select value={editForm.priority} onChange={(event) => setEditForm({ ...editForm, priority: event.target.value as QAActivity["priority"] })} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none">
                    {PRIORITY_OPTIONS.map((priority) => <option key={priority}>{priority}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
                  <input ref={dueDateRef} type="date" value={editForm.dueDate || editForm.targetDate} onChange={(event) => setEditForm({ ...editForm, dueDate: event.target.value })} className={`w-full h-9 px-3 text-sm rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${invalidEdit.dueDate ? "border-red-500 ring-2 ring-red-100" : "border border-slate-300"}`} />
                  {invalidEdit.dueDate && <div className="text-xs text-red-600 mt-1">Due Date is required.</div>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Reminder</label>
                  <select ref={reminderRef} value={editForm.reminder} onChange={(event) => setEditForm({ ...editForm, reminder: event.target.value })} className={`w-full h-9 px-3 text-sm rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${invalidEdit.reminder ? "border-red-500 ring-2 ring-red-100" : "border border-slate-300"}`}>
                    {REMINDER_OPTIONS.map((reminder) => <option key={reminder}>{reminder}</option>)}
                  </select>
                  {invalidEdit.reminder && <div className="text-xs text-red-600 mt-1">Reminder selection is required.</div>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned User</label>
                  <input value={editForm.assignedUser} onChange={(event) => setEditForm({ ...editForm, assignedUser: event.target.value })} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Department</div>
                    <div className="text-sm font-semibold text-slate-900">{record.department}</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">{isCompleted ? "Current Due Date" : "Due Date"}</div>
                    <div className="text-sm font-semibold text-slate-900">{record.dueDate || record.targetDate ? formatDate(record.dueDate || record.targetDate) : "—"}</div>
                  </div>
                  {isCompleted ? (
                    <>
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Completed Date</div>
                        <div className="text-sm font-semibold text-slate-900">{record.completionDate ? formatDate(record.completionDate) : "—"}</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Reminder</div>
                        <div className="text-sm font-semibold text-slate-900">{record.reminder}</div>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Assigned User</div>
                        <div className="text-sm font-semibold text-slate-900">{record.assignedUser || "Unassigned"}</div>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Priority</div>
                        <div className="text-sm font-semibold text-slate-900">{record.priority}</div>
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-700 mb-2">QMS Description</div>
                  <div className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-4 border border-slate-100">
                    {record.qmsDescription || "No description provided."}
                  </div>
                </div>

                {isCompleted && (
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-700">Completion Notes</div>
                    <div className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-4 border border-slate-100">
                      {record.completionNotes || "No completion notes were recorded."}
                    </div>
                    {record.completedBy && (
                      <div className="text-xs text-slate-500">Completed by {record.completedBy}</div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-6 sm:py-4 shrink-0">
          {isEditing ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <button onClick={() => setIsEditing(false)} className="flex-1 min-w-[140px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50">Cancel</button>
              <button onClick={handleSaveEdit} className="flex-1 min-w-[140px] rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700">Save Changes</button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button onClick={onEdit} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100"><Edit2 size={13} /> Edit</button>
              <button onClick={() => setShowCompleteModal(true)} className="flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"><CheckCircle2 size={13} /> Complete Activity</button>
              <button onClick={onDuplicate} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100"><Copy size={13} /> Duplicate</button>
              <button onClick={onSnooze} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100"><Clock3 size={13} /> Snooze</button>
              <button onClick={onDelete} className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100"><Trash2 size={13} /> Delete</button>
            </div>
          )}
        </div>
        {showCompleteModal && (
          <div className="absolute inset-0 z-40 flex items-center justify-center">
            <div className="absolute inset-0 bg-slate-900/30" onClick={() => setShowCompleteModal(false)} />
            <div className="bg-white rounded-xl shadow-2xl w-[520px] z-50 p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Complete QA Activity</h3>
              <p className="text-xs text-slate-500 mb-3">Capture the completion details for this QA activity.</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Completion Notes *</label>
                  <textarea rows={5} value={completeNote} onChange={(event) => setCompleteNote(event.target.value)} placeholder="Corrective actions, observations, follow-up notes..." className="w-full p-3 text-sm border border-slate-300 rounded-lg resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Completed By</label>
                  <input value={completedBy} onChange={(event) => setCompletedBy(event.target.value)} placeholder="Current User" className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Completed Date</label>
                  <input value={completedDate} disabled className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg bg-slate-50 text-slate-500" />
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-4">
                <button onClick={() => { setShowCompleteModal(false); setCompleteNote(""); setCompletedBy(""); }} className="py-2 px-3 text-xs font-semibold bg-white border border-slate-300 rounded-lg">Cancel</button>
                <button onClick={() => {
                  const result = validateActionNote(completeNote);
                  if (!result.valid) { toast.error(result.message); return; }
                  onComplete(completeNote.trim(), completedBy.trim() || undefined);
                  setShowCompleteModal(false);
                  setCompleteNote("");
                  setCompletedBy("");
                }} className="py-2 px-3 text-xs font-semibold text-white bg-emerald-600 rounded-lg">Complete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
