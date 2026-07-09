// ─────────────────────────────────────────────────────────────────────────────
// QAPage
// QA Activities module — production-ready frontend, prepared for future
// AWS backend / database (MongoDB, PostgreSQL) integration via REST APIs.
// Styling and structural patterns preserved from the original implementation.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useMemo } from "react";
import {
  LayoutDashboard,
  CheckSquare,
  Search,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  CalendarClock,
  X,
  Plus,
  MoreHorizontal,
  Filter,
  Download,
  Eye,
  Edit2,
  Trash2,
  RefreshCw,
  Copy,
  Columns,
  Loader2
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { formatDate } from "../../../shared/utils/dateHelpers";

// ─────────────────────────────────────────────────────────────────────────────
// QA ACTIVITIES MODULE
// ─────────────────────────────────────────────────────────────────────────────

const DEPARTMENTS = [
  "Quality Assurance",
  "Quality Control",
  "Production",
  "Warehouse",
  "Engineering",
  "Purchase and Accounts",
  "HR Admin",
  "Environment Health and Safety",
  "IT",
  "Microbiology",
];

const REMINDER_OPTIONS = [
  "1 Day Before",
  "3 Days Before",
  "1 Week Before",
  "Monthly",
  "Quarterly",
  "Half Yearly",
  "Yearly",
];

type CompletedStatus = "Pending" | "Completed";

// A single action / follow-up / remark entry. QA Activities can accumulate
// multiple action entries over time (corrective actions, observations, etc).
interface QAActionEntry {
  time: string;
  note: string;
}

// Core QA Activity record. This shape maps directly to the future backend
// document / row (MongoDB document or PostgreSQL row) so integration later
// requires minimal changes — only the data-access functions below need to
// be swapped from local state to real HTTP calls.
interface QAActivity {
  id: string;
  qmsNumber: string;
  qmsType: string;
  qmsDescription: string;
  department: string;
  targetDate: string;
  reminder: string;
  completed: CompletedStatus;
  actionHistory: QAActionEntry[];
  createdAt: string;
  updatedAt: string;
}

// No demo / sample records. Table, dashboard and charts must all render a
// clean empty state until real data is created or fetched from the backend.
const INITIAL_QA_ACTIVITIES: QAActivity[] = [];

// ─────────────────────────────────────────────────────────────────────────────
// DATA ACCESS LAYER (currently local state — swap for REST/AWS calls later)
// ─────────────────────────────────────────────────────────────────────────────
// These functions intentionally mirror the shape of a real API client so
// that connecting to an AWS backend (API Gateway + Lambda, MongoDB, or
// PostgreSQL) later only requires replacing the function bodies below with
// real `fetch`/`axios` calls against REST endpoints, e.g.:
//   GET    /api/qa-activities
//   POST   /api/qa-activities
//   PATCH  /api/qa-activities/:id
//   DELETE /api/qa-activities/:id

async function apiFetchQAActivities(): Promise<QAActivity[]> {
  // TODO: Replace with real API call, e.g.
  // const res = await fetch("/api/qa-activities");
  // return res.json();
  return Promise.resolve([]);
}

async function apiCreateQAActivity(payload: Omit<QAActivity, "id" | "createdAt" | "updatedAt">): Promise<QAActivity> {
  // TODO: Replace with real API call, e.g.
  // const res = await fetch("/api/qa-activities", { method: "POST", body: JSON.stringify(payload) });
  // return res.json();
  const now = new Date().toISOString();
  return Promise.resolve({
    ...payload,
    id: `QMS-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  });
}

async function apiUpdateQAActivity(updated: QAActivity): Promise<QAActivity> {
  // TODO: Replace with real API call, e.g.
  // const res = await fetch(`/api/qa-activities/${updated.id}`, { method: "PATCH", body: JSON.stringify(updated) });
  // return res.json();
  return Promise.resolve({ ...updated, updatedAt: new Date().toISOString() });
}

async function apiDeleteQAActivity(id: string): Promise<void> {
  // TODO: Replace with real API call, e.g.
  // await fetch(`/api/qa-activities/${id}`, { method: "DELETE" });
  return Promise.resolve();
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function isOverdue(activity: QAActivity): boolean {
  if (activity.completed === "Completed" || !activity.targetDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(activity.targetDate);
  return target < today;
}

function isUpcoming(activity: QAActivity): boolean {
  if (activity.completed === "Completed" || !activity.targetDate) return false;
  return !isOverdue(activity);
}

function completedStatusCfg(status: CompletedStatus) {
  switch (status) {
    case "Completed": return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" };
    case "Pending":   return { bg: "bg-slate-50",   text: "text-slate-600",   border: "border-slate-200",   dot: "bg-slate-400" };
    default:          return { bg: "bg-slate-50",   text: "text-slate-600",   border: "border-slate-200",   dot: "bg-slate-400" };
  }
}

function QACompletedBadge({ status }: { status: CompletedStatus }) {
  const c = completedStatusCfg(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status}
    </span>
  );
}

interface QAActivityFormState {
  qmsNumber: string;
  qmsType: string;
  qmsDescription: string;
  department: string;
  targetDate: string;
  reminder: string;
  completed: CompletedStatus;
  action: string;
}

const EMPTY_FORM: QAActivityFormState = {
  qmsNumber: "",
  qmsType: "",
  qmsDescription: "",
  department: DEPARTMENTS[0],
  targetDate: "",
  reminder: REMINDER_OPTIONS[0],
  completed: "Pending",
  action: "",
};

// ─────────────────────────────────────────────────────────────────────────────
// DRAWER — View / Edit / Add Action
// ─────────────────────────────────────────────────────────────────────────────

function QAActivityDrawer({
  record,
  onClose,
  onUpdate,
}: {
  record: QAActivity;
  onClose: () => void;
  onUpdate: (updated: QAActivity, newActionNote?: string) => void;
}) {
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
    if (!editForm.qmsNumber || !editForm.qmsType || !editForm.qmsDescription || !editForm.department || !editForm.targetDate || !editForm.reminder) {
      toast.error("Validation Failed: Please fill in all required fields.");
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
    if (!actionNote.trim()) {
      toast.error("Please enter an action / remark before saving.");
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

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function QAPage() {
  const [subTab, setSubTab] = useState<"dashboard" | "activities">("dashboard");
  const [activities, setActivities] = useState<QAActivity[]>(INITIAL_QA_ACTIVITIES);
  const [search, setSearch] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<QAActivity | null>(null);

  // Loaders
  const [isLoading, setIsLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // New QA Activity State
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState<QAActivityFormState>(EMPTY_FORM);

  // Filter & Columns State
  const [showFilters, setShowFilters] = useState(false);
  const [showColumns, setShowColumns] = useState(false);
  const [filters, setFilters] = useState({ department: "", reminder: "", completed: "", targetDate: "" });
  const [columns, setColumns] = useState({ qmsType: true, department: true, targetDate: true, reminder: true, completed: true, action: true });

  const subTabs = [
    { id: "dashboard",  label: "QA Dashboard",  icon: LayoutDashboard },
    { id: "activities", label: "Activity List", icon: CheckSquare },
  ] as const;

  // Filtered Data
  const filteredActivities = useMemo(() => {
    return activities.filter(r => {
      const matchSearch = !search ||
        r.qmsNumber.toLowerCase().includes(search.toLowerCase()) ||
        r.qmsType.toLowerCase().includes(search.toLowerCase()) ||
        r.department.toLowerCase().includes(search.toLowerCase()) ||
        r.qmsDescription.toLowerCase().includes(search.toLowerCase());

      const matchDept = !filters.department || r.department === filters.department;
      const matchReminder = !filters.reminder || r.reminder === filters.reminder;
      const matchCompleted = !filters.completed || r.completed === filters.completed;
      const matchDate = !filters.targetDate || r.targetDate === filters.targetDate;

      return matchSearch && matchDept && matchReminder && matchCompleted && matchDate;
    });
  }, [activities, search, filters]);

  // Dashboard metrics
  const totalCount = activities.length;
  const pendingCount = activities.filter(a => a.completed === "Pending").length;
  const completedCount = activities.filter(a => a.completed === "Completed").length;
  const overdueCount = activities.filter(isOverdue).length;
  const upcomingCount = activities.filter(isUpcoming).length;

  // Monthly trend derived from real target dates (empty gracefully when no data)
  const trendData = useMemo(() => {
    if (activities.length === 0) return [];
    const buckets: Record<string, { name: string; pending: number; completed: number }> = {};
    activities.forEach(a => {
      if (!a.targetDate) return;
      const d = new Date(a.targetDate);
      const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
      if (!buckets[key]) buckets[key] = { name: key, pending: 0, completed: 0 };
      if (a.completed === "Completed") buckets[key].completed += 1;
      else buckets[key].pending += 1;
    });
    return Object.values(buckets);
  }, [activities]);

  // Department completion breakdown derived from real data
  const departmentBreakdown = useMemo(() => {
    if (activities.length === 0) return [];
    const map: Record<string, { total: number; completed: number }> = {};
    activities.forEach(a => {
      if (!map[a.department]) map[a.department] = { total: 0, completed: 0 };
      map[a.department].total += 1;
      if (a.completed === "Completed") map[a.department].completed += 1;
    });
    return Object.entries(map).map(([name, v]) => ({
      name,
      score: Math.round((v.completed / v.total) * 100),
    }));
  }, [activities]);

  // ───────────────────────────────────────────────────────────────────────
  // Handlers — currently operate on local state, wired through the API
  // layer above so the swap to a real AWS backend is a small, isolated change.
  // ───────────────────────────────────────────────────────────────────────

  const handleUpdateRecord = (updated: QAActivity, newActionNote?: string) => {
    setIsLoading(true);
    const withAction: QAActivity = newActionNote
      ? { ...updated, actionHistory: [{ time: "Just now", note: newActionNote }, ...updated.actionHistory] }
      : updated;

    apiUpdateQAActivity(withAction)
      .then(saved => {
        setActivities(prev => prev.map(p => (p.id === saved.id ? saved : p)));
        if (selectedRecord && selectedRecord.id === saved.id) {
          setSelectedRecord(saved);
        }
        toast.success("QA Activity Updated Successfully");
      })
      .catch(() => toast.error("Failed to update QA Activity"))
      .finally(() => setIsLoading(false));
  };

  const handleCreate = () => {
    if (!newForm.qmsNumber || !newForm.qmsType || !newForm.qmsDescription || !newForm.department || !newForm.targetDate || !newForm.reminder) {
      toast.error("Validation Failed: Please fill all required fields");
      return;
    }
    setIsLoading(true);
    const payload: Omit<QAActivity, "id" | "createdAt" | "updatedAt"> = {
      qmsNumber: newForm.qmsNumber,
      qmsType: newForm.qmsType,
      qmsDescription: newForm.qmsDescription,
      department: newForm.department,
      targetDate: newForm.targetDate,
      reminder: newForm.reminder,
      completed: newForm.completed,
      actionHistory: newForm.action.trim() ? [{ time: "Just now", note: newForm.action.trim() }] : [],
    };

    apiCreateQAActivity(payload)
      .then(created => {
        setActivities(prev => [created, ...prev]);
        setShowNew(false);
        setNewForm(EMPTY_FORM);
        toast.success("QA Activity Created Successfully");
      })
      .catch(() => toast.error("Failed to create QA Activity"))
      .finally(() => setIsLoading(false));
  };

  const handleDelete = (id: string) => {
    apiDeleteQAActivity(id)
      .then(() => {
        setActivities(prev => prev.filter(p => p.id !== id));
        toast.success("QA Activity Deleted");
      })
      .catch(() => toast.error("Failed to delete QA Activity"));
  };

  const handleDuplicate = (rec: QAActivity) => {
    const payload: Omit<QAActivity, "id" | "createdAt" | "updatedAt"> = {
      qmsNumber: `${rec.qmsNumber}-COPY`,
      qmsType: rec.qmsType,
      qmsDescription: rec.qmsDescription,
      department: rec.department,
      targetDate: rec.targetDate,
      reminder: rec.reminder,
      completed: "Pending",
      actionHistory: [],
    };
    apiCreateQAActivity(payload)
      .then(created => {
        setActivities(prev => [created, ...prev]);
        toast.success("QA Activity Duplicated");
      })
      .catch(() => toast.error("Failed to duplicate QA Activity"));
  };

  const handleGlobalExport = () => {
    // Placeholder – Word export will be implemented in a future release
  };

  // Render ...
  return (
    <div className="w-full max-w-[1600px] mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-2">
          <LayoutDashboard size={12} />
          <span>Dashboard</span>
          <ChevronRight size={12} />
          <span className="text-slate-700 font-semibold">QA Activities</span>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm shadow-blue-200">
              <CheckSquare size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Quality Assurance</h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Manage QA activities across all departments</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowNew(true)} className="flex items-center gap-1.5 h-9 px-4 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
              <Plus size={14} /> New QA Activity
            </button>
            <button onClick={handleGlobalExport} className="flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
              <Download size={14} /> Export Word
            </button>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="mt-5 flex items-center gap-1 border-b border-slate-200 overflow-x-auto hide-scrollbar">
          {subTabs.map(t => (
            <button
              key={t.id}
              onClick={() => setSubTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors -mb-px whitespace-nowrap ${
                subTab === t.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              <t.icon size={14} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      )}

      {/* Tab Content */}
      {subTab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
            {[
              { label: "Total QA Activities", val: totalCount, icon: CheckSquare, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Pending", val: pendingCount, icon: Clock, color: "text-slate-600", bg: "bg-slate-100" },
              { label: "Completed", val: completedCount, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "Overdue", val: overdueCount, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
              { label: "Upcoming", val: upcomingCount, icon: CalendarClock, color: "text-amber-600", bg: "bg-amber-50" },
            ].map((kpi, i) => (
              <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{kpi.label}</span>
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center ${kpi.bg}`}>
                    <kpi.icon size={14} className={kpi.color} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900 mt-1">{kpi.val}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900">QA Activity Trend</h3>
              </div>
              <div className="h-[250px]">
                {trendData.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <CheckSquare size={28} className="mb-2 text-slate-300" />
                    <p className="text-xs font-medium">No QA Activities Found</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748B" }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748B" }} allowDecimals={false} />
                      <RechartsTooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0" }} />
                      <Area type="monotone" dataKey="completed" stackId="1" stroke="#10B981" fill="#D1FAE5" />
                      <Area type="monotone" dataKey="pending" stackId="1" stroke="#94A3B8" fill="#F1F5F9" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex flex-col">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Department Completion</h3>
              {departmentBreakdown.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                  <CheckSquare size={28} className="mb-2 text-slate-300" />
                  <p className="text-xs font-medium">No QA Activities Found</p>
                </div>
              ) : (
                <div className="flex-1 space-y-4">
                  {departmentBreakdown.map(dept => (
                    <div key={dept.name}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-semibold text-slate-700">{dept.name}</span>
                        <span className="font-bold text-slate-900">{dept.score}% Complete</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className={`h-2 rounded-full ${dept.score >= 90 ? "bg-emerald-500" : dept.score >= 50 ? "bg-blue-500" : "bg-amber-500"}`} style={{ width: `${dept.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {subTab === "activities" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 relative">
            <div className="relative w-72">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by QMS No., Type, Dept..."
                className="w-full h-9 pl-9 pr-4 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <button onClick={() => setShowFilters(!showFilters)} className={`h-9 px-3 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${showFilters || Object.values(filters).some(x => x) ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-white text-slate-600 border border-slate-300'}`}>
              <Filter size={14} /> Filter
            </button>

            <button onClick={() => setShowColumns(!showColumns)} className="h-9 px-3 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg flex items-center gap-1.5 ml-auto">
              <Columns size={14} /> Columns
            </button>

            {/* Filter Popover */}
            {showFilters && (
              <div className="absolute top-11 left-[300px] w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-20 p-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold text-slate-900">Filters</h3>
                  <button onClick={() => { setFilters({ department: "", reminder: "", completed: "", targetDate: "" }); toast.success("Filters Reset"); setShowFilters(false); }} className="text-xs text-blue-600 hover:text-blue-700 font-medium">Reset All</button>
                </div>
                <div className="space-y-3">
                  <div><label className="text-xs font-semibold text-slate-600 block mb-1">Department</label><select value={filters.department} onChange={e => setFilters({ ...filters, department: e.target.value })} className="w-full h-8 px-2 text-sm border rounded"><option value="">All Departments</option>{DEPARTMENTS.map(d => <option key={d}>{d}</option>)}</select></div>
                  <div><label className="text-xs font-semibold text-slate-600 block mb-1">Reminder</label><select value={filters.reminder} onChange={e => setFilters({ ...filters, reminder: e.target.value })} className="w-full h-8 px-2 text-sm border rounded"><option value="">All Reminders</option>{REMINDER_OPTIONS.map(r => <option key={r}>{r}</option>)}</select></div>
                  <div><label className="text-xs font-semibold text-slate-600 block mb-1">Completed</label><select value={filters.completed} onChange={e => setFilters({ ...filters, completed: e.target.value })} className="w-full h-8 px-2 text-sm border rounded"><option value="">All</option><option>Pending</option><option>Completed</option></select></div>
                  <div><label className="text-xs font-semibold text-slate-600 block mb-1">Target Date</label><input type="date" value={filters.targetDate} onChange={e => setFilters({ ...filters, targetDate: e.target.value })} className="w-full h-8 px-2 text-sm border rounded" /></div>
                  <button onClick={() => { setShowFilters(false); toast.success("Filters Applied"); }} className="w-full h-8 bg-slate-900 text-white text-xs font-bold rounded-lg mt-2">Apply Filters</button>
                </div>
              </div>
            )}

            {/* Columns Popover */}
            {showColumns && (
              <div className="absolute top-11 right-0 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-20 p-2 animate-in fade-in zoom-in-95 duration-200">
                {Object.keys(columns).map(col => (
                  <label key={col} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer">
                    <input type="checkbox" checked={(columns as any)[col]} onChange={e => setColumns({ ...columns, [col]: e.target.checked })} className="rounded border-slate-300 text-blue-600" />
                    <span className="text-sm font-medium text-slate-700 capitalize">{col.replace(/([A-Z])/g, ' $1').trim()}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden min-h-[400px]">
            {filteredActivities.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                <CheckSquare size={32} className="mb-2 text-slate-300" />
                <p className="text-sm font-medium">No QA Activities Found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                  <thead className="bg-slate-50/70 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3">QMS Number</th>
                      {columns.qmsType && <th className="px-4 py-3">QMS Type</th>}
                      {columns.department && <th className="px-4 py-3">Department</th>}
                      {columns.targetDate && <th className="px-4 py-3">Target Date</th>}
                      {columns.reminder && <th className="px-4 py-3">Reminder</th>}
                      {columns.completed && <th className="px-4 py-3">Completed</th>}
                      {columns.action && <th className="px-4 py-3">Action</th>}
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredActivities.map(record => (
                      <tr key={record.id} className="hover:bg-slate-50 cursor-pointer group" onClick={() => setSelectedRecord(record)}>
                        <td className="px-4 py-3.5 text-xs font-mono font-bold text-slate-600">{record.qmsNumber}</td>
                        {columns.qmsType && <td className="px-4 py-3.5 text-xs font-semibold text-slate-700">{record.qmsType}</td>}
                        {columns.department && <td className="px-4 py-3.5 text-xs font-semibold text-slate-700">{record.department}</td>}
                        {columns.targetDate && <td className="px-4 py-3.5 text-xs text-slate-500">{formatDate(record.targetDate)}</td>}
                        {columns.reminder && <td className="px-4 py-3.5 text-xs text-slate-500">{record.reminder}</td>}
                        {columns.completed && <td className="px-4 py-3.5"><QACompletedBadge status={record.completed} /></td>}
                        {columns.action && <td className="px-4 py-3.5 text-xs text-slate-500 max-w-[220px] truncate">{record.actionHistory[0]?.note || "—"}</td>}
                        <td className="px-4 py-3.5 text-right relative" onClick={e => e.stopPropagation()}>
                          <div className="relative inline-block">
                            <button
                              onClick={() => setOpenMenuId(openMenuId === record.id ? null : record.id)}
                              className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                            >
                              <MoreHorizontal size={14} />
                            </button>
                            {openMenuId === record.id && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                                <div className="absolute right-0 top-8 w-48 bg-white border border-slate-200 rounded-lg shadow-xl z-20 py-1 text-left animate-in fade-in zoom-in-95 duration-100">
                                  <button onClick={() => { setSelectedRecord(record); setOpenMenuId(null); }} className="w-full px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"><Eye size={14} /> View</button>
                                  <button onClick={() => { setSelectedRecord(record); setOpenMenuId(null); }} className="w-full px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"><Edit2 size={14} /> Edit</button>
                                  <button onClick={() => { handleGlobalExport(); setOpenMenuId(null); }} className="w-full px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"><Download size={14} /> Export Word</button>
                                  <button onClick={() => { handleDuplicate(record); setOpenMenuId(null); }} className="w-full px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"><Copy size={14} /> Duplicate</button>
                                  <div className="h-px bg-slate-100 my-1" />
                                  <button onClick={() => { handleDelete(record.id); setOpenMenuId(null); }} className="w-full px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"><Trash2 size={14} /> Delete</button>
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New QA Activity Modal */}
      {showNew && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowNew(false)} />
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center shrink-0">
              <h2 className="text-lg font-bold text-slate-900">New QA Activity</h2>
              <button onClick={() => setShowNew(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
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
              <button onClick={() => setShowNew(false)} className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={handleCreate} className="flex-1 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">Create QA Activity</button>
            </div>
          </div>
        </div>
      )}

      {selectedRecord && <QAActivityDrawer record={selectedRecord} onClose={() => setSelectedRecord(null)} onUpdate={handleUpdateRecord} />}
    </div>
  );
}
