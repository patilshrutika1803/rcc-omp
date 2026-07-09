// ─────────────────────────────────────────────────────────────────────────────
// QAPage
// Extracted from the original monolithic App.tsx (RCC OMP).
// Behavior, styling and Tailwind classes are unchanged from the original.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useMemo } from "react";
import {
  LayoutDashboard,
  CheckSquare,
  Server,
  Search,
  ChevronRight,
  Clock,
  CheckCircle2,
  X,
  Plus,
  MoreHorizontal,
  AlertTriangle,
  XCircle,
  Filter,
  Download,
  Eye,
  Edit2,
  Trash2,
  RefreshCw,
  Printer,
  TrendingUp,
  Copy,
  Columns,
  List,
  Loader2
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { formatDate } from "../../../shared/utils/dateHelpers";
import { PriorityBadge } from "../../preventive-maintenance/pages/PreventiveMaintenancePage";

const USERS = [
  "Rajesh Kumar", "Priya Nair", "Suresh Babu", "Anita Desai",
  "Vikram Singh", "Meena Pillai", "Arjun Rao", "Deepa Iyer"
];

const DEPARTMENTS = ["Quality Assurance", "Quality Control", "Production", "Warehouse", "Engineering", "Purchase & Accounts", "HR & Admin", "Environmental Health & Safety", "IT Department"];

// ─────────────────────────────────────────────────────────────────────────────
// QA ACTIVITIES MODULE
// ─────────────────────────────────────────────────────────────────────────────

type QAStatus = "Pending" | "In Review" | "Completed" | "Cancelled";
type QAResult = "Pass" | "Fail" | "Conditional Pass" | "N/A";
type QASeverity = "Critical" | "High" | "Medium" | "Low";

interface QAInspection {
  id: string;
  machine: string;
  department: string;
  user: string;
  dueDate: string;
  priority: QASeverity;
  status: QAStatus;
  result: QAResult;
  notes: string;
  timeline: { time: string; title: string; desc: string; color: string }[];
}

const INITIAL_QA_INSPECTIONS: QAInspection[] = [
  { id: "QA-3001", machine: "Filling Machine Line A", department: "Production", user: "Rajesh Kumar", dueDate: "2026-07-03", priority: "High", status: "Completed", result: "Pass", notes: "All parameters within normal operational limits. Routine wear observed but acceptable.", timeline: [{ time: "Jul 03, 4:30 PM", title: "Inspection Completed", desc: "Submitted by Rajesh Kumar", color: "bg-emerald-100 text-emerald-600" }] },
  { id: "QA-3002", machine: "Air Compressor - Prod", department: "Production", user: "Suresh Babu", dueDate: "2026-07-03", priority: "Critical", status: "In Review", result: "Conditional Pass", notes: "Minor vibration detected, scheduled for check.", timeline: [{ time: "Jul 03, 10:00 AM", title: "In Review", desc: "Pending manager approval", color: "bg-blue-100 text-blue-600" }] },
  { id: "QA-3003", machine: "Packaging Machine Line B", department: "Production", user: "Priya Nair", dueDate: "2026-07-02", priority: "Medium", status: "Completed", result: "Pass", notes: "Operating normally.", timeline: [{ time: "Jul 02, 3:00 PM", title: "Inspection Completed", desc: "Submitted by Priya Nair", color: "bg-emerald-100 text-emerald-600" }] },
  { id: "QA-3004", machine: "Core Network Switch", department: "IT Department", user: "Vikram Singh", dueDate: "2026-07-02", priority: "High", status: "Completed", result: "Fail", notes: "Critical failure detected in routing table.", timeline: [{ time: "Jul 02, 11:15 AM", title: "Inspection Completed", desc: "Submitted by Vikram Singh", color: "bg-red-100 text-red-600" }] },
  { id: "QA-3005", machine: "HVAC Unit - Server Room", department: "IT Department", user: "Meena Pillai", dueDate: "2026-07-04", priority: "High", status: "Pending", result: "N/A", notes: "", timeline: [{ time: "Jul 04, 9:00 AM", title: "Scheduled", desc: "Added to QA Calendar", color: "bg-slate-100 text-slate-600" }] },
  { id: "QA-3006", machine: "Conveyor Belt - WH", department: "Warehouse", user: "Suresh Babu", dueDate: "2026-07-01", priority: "Medium", status: "Completed", result: "Pass", notes: "No issues found.", timeline: [{ time: "Jul 01, 2:00 PM", title: "Inspection Completed", desc: "Submitted by Suresh Babu", color: "bg-emerald-100 text-emerald-600" }] },
  { id: "QA-3007", machine: "Quality Lab Autoclave", department: "Quality Control", user: "Anita Desai", dueDate: "2026-07-05", priority: "Critical", status: "Pending", result: "N/A", notes: "", timeline: [{ time: "Jul 05, 8:00 AM", title: "Scheduled", desc: "Added to QA Calendar", color: "bg-slate-100 text-slate-600" }] },
  { id: "QA-3008", machine: "Diesel Generator - BKP", department: "Engineering", user: "Rajesh Kumar", dueDate: "2026-07-01", priority: "Critical", status: "Completed", result: "Pass", notes: "Generator tested under full load. Passed.", timeline: [{ time: "Jul 01, 10:30 AM", title: "Inspection Completed", desc: "Submitted by Rajesh Kumar", color: "bg-emerald-100 text-emerald-600" }] },
  { id: "QA-3009", machine: "Label Printer - Pack", department: "Production", user: "Deepa Iyer", dueDate: "2026-07-03", priority: "Low", status: "Pending", result: "N/A", notes: "", timeline: [{ time: "Jul 03, 9:00 AM", title: "Scheduled", desc: "Added to QA Calendar", color: "bg-slate-100 text-slate-600" }] },
  { id: "QA-3010", machine: "Chiller Unit - Prod", department: "Engineering", user: "Meena Pillai", dueDate: "2026-06-30", priority: "High", status: "In Review", result: "Fail", notes: "Cooling efficiency below 70%.", timeline: [{ time: "Jun 30, 4:00 PM", title: "In Review", desc: "Pending manager approval", color: "bg-blue-100 text-blue-600" }] },
];


function qaStatusCfg(status: QAStatus) {
  switch (status) {
    case "Completed":   return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" };
    case "Pending":     return { bg: "bg-slate-50",   text: "text-slate-600",   border: "border-slate-200",   dot: "bg-slate-400" };
    case "In Review":   return { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-500" };
    case "Cancelled":   return { bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",     dot: "bg-red-500" };
    default:            return { bg: "bg-slate-50",   text: "text-slate-600",   border: "border-slate-200",   dot: "bg-slate-400" };
  }
}

function QAStatusBadge({ status }: { status: QAStatus }) {
  const c = qaStatusCfg(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status}
    </span>
  );
}

function QAResultBadge({ result }: { result: QAResult }) {
  let c = { bg: "bg-slate-100", text: "text-slate-600" };
  if (result === "Pass") c = { bg: "bg-emerald-100", text: "text-emerald-700" };
  if (result === "Fail") c = { bg: "bg-red-100", text: "text-red-700" };
  if (result === "Conditional Pass") c = { bg: "bg-amber-100", text: "text-amber-700" };
  
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${c.bg} ${c.text}`}>
      {result}
    </span>
  );
}

function QAInspectionDrawer({
  record,
  onClose,
  onUpdate,
}: {
  record: QAInspection;
  onClose: () => void;
  onUpdate: (updated: QAInspection, timelineEntry?: { title: string; desc: string; color: string }) => void;
}) {
  const [tab, setTab] = useState<"info" | "timeline">("info");
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Edit state
  const [editForm, setEditForm] = useState(record);

  // Update status state
  const [statusForm, setStatusForm] = useState({ status: record.status, remarks: "" });

  const handleExport = () => {
    // Placeholder – Word export will be implemented in a future release
  };

  const handleSaveEdit = () => {
    if (!editForm.department || !editForm.dueDate || !editForm.user) {
      toast.error("Validation Failed: Please fill in all required fields.");
      return;
    }
    onUpdate(editForm, {
      title: "Inspection Edited",
      desc: "Details were modified",
      color: "bg-blue-100 text-blue-600"
    });
    toast.success("Inspection Updated Successfully");
    setIsEditing(false);
  };

  const handleUpdateStatus = () => {
    onUpdate({ ...record, status: statusForm.status as QAStatus }, {
      title: `Status Updated: ${statusForm.status}`,
      desc: statusForm.remarks || "No remarks provided",
      color: "bg-amber-100 text-amber-600"
    });
    toast.success("Inspection Status Updated Successfully");
    setIsUpdatingStatus(false);
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
                <h2 className="text-sm font-bold text-slate-900">{record.department}</h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{record.id} · {record.machine}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <QAStatusBadge status={record.status} />
            <QAResultBadge result={record.result} />
            <PriorityBadge priority={record.priority} />
          </div>
        </div>

        {!isEditing && !isUpdatingStatus && (
          <div className="px-6 border-b border-slate-100 flex gap-0">
            {[
              { id: "info", label: "Inspection Details" },
              { id: "timeline", label: "History Timeline" },
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
              <h3 className="text-sm font-bold text-slate-900 mb-2">Edit Inspection</h3>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department *</label>
                <select value={editForm.department} onChange={e => setEditForm({...editForm, department: e.target.value})} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none">{DEPARTMENTS.map(d=><option key={d}>{d}</option>)}</select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Inspector *</label>
                <select value={editForm.user} onChange={e => setEditForm({...editForm, user: e.target.value})} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none">{USERS.map(e=><option key={e}>{e}</option>)}</select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date *</label>
                <input type="date" value={editForm.dueDate} onChange={e => setEditForm({...editForm, dueDate: e.target.value})} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                <select value={editForm.priority} onChange={e => setEditForm({...editForm, priority: e.target.value as any})} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none">
                  <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value as any})} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none">
                  <option>Pending</option><option>In Review</option><option>Completed</option><option>Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Result</label>
                <select value={editForm.result} onChange={e => setEditForm({...editForm, result: e.target.value as any})} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none">
                  <option>Pass</option><option>Fail</option><option>Conditional Pass</option><option>N/A</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Inspector Notes</label>
                <textarea rows={4} value={editForm.notes} onChange={e => setEditForm({...editForm, notes: e.target.value})} className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none" />
              </div>
            </div>
          ) : isUpdatingStatus ? (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Update Status</h3>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                <select value={statusForm.status} onChange={e => setStatusForm({...statusForm, status: e.target.value as any})} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none">
                  <option>Pending</option><option>In Review</option><option>Completed</option><option>Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Optional Remarks</label>
                <textarea rows={4} placeholder="Add a note about this status change..." value={statusForm.remarks} onChange={e => setStatusForm({...statusForm, remarks: e.target.value})} className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none" />
              </div>
            </div>
          ) : (
            <>
              {tab === "info" && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Inspector</div>
                      <div className="text-sm font-semibold text-slate-900">{record.user}</div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Due Date</div>
                      <div className="text-sm font-semibold text-slate-900">{formatDate(record.dueDate)}</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs font-bold text-slate-700 mb-2">Inspector Notes</div>
                    <div className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-4 border border-slate-100">
                      {record.notes || "No notes provided."}
                    </div>
                  </div>
                </div>
              )}

              {tab === "timeline" && (
                <div>
                  <div className="text-xs font-bold text-slate-700 mb-4">Audit Timeline</div>
                  <div className="relative border-l-2 border-slate-100 ml-2 space-y-5">
                    {record.timeline.map((log, i) => (
                      <div key={i} className="relative pl-6">
                        <div className={`absolute -left-[9px] top-0.5 w-4 h-4 rounded-full border-2 border-slate-200 flex items-center justify-center ${log.color.split(' ')[0]}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${log.color.split(' ')[1]}`} />
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{log.time}</div>
                        <div className="text-xs font-bold text-slate-800">{log.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{log.desc}</div>
                      </div>
                    ))}
                  </div>
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
          ) : isUpdatingStatus ? (
            <>
              <button onClick={() => setIsUpdatingStatus(false)} className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleUpdateStatus} className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                Update
              </button>
            </>
          ) : (
            <>
              <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
                <Download size={13} /> Export Word
              </button>
              <button onClick={() => { setIsEditing(true); setEditForm(record); }} className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
                <Edit2 size={13} /> Edit Inspection
              </button>
              <button onClick={() => { setIsUpdatingStatus(true); setStatusForm({ status: record.status, remarks: "" }); }} className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                Update Status
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function QAPage() {
  const [subTab, setSubTab] = useState<"dashboard"|"inspections">("dashboard");
  const [inspections, setInspections] = useState(INITIAL_QA_INSPECTIONS);
  const [search, setSearch] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<QAInspection | null>(null);

  // Loaders
  const [isLoading, setIsLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // New Inspection State
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState<Partial<QAInspection>>({
    department: "Production",
    user: "",
    dueDate: "",
    priority: "Medium",
    status: "Pending",
    result: "N/A",
    notes: ""
  });

  // Filter & Columns State
  const [showFilters, setShowFilters] = useState(false);
  const [showColumns, setShowColumns] = useState(false);
  const [filters, setFilters] = useState({ department: "", user: "", status: "", priority: "", dueDate: "" });
  const [columns, setColumns] = useState({ department: true, user: true, dueDate: true, priority: true, status: true, result: true });

  const subTabs = [
    { id: "dashboard",   label: "QA Dashboard",     icon: LayoutDashboard },
    { id: "inspections", label: "Inspection List",  icon: CheckSquare },
  ] as const;

  // Filtered Data
  const filteredInspections = useMemo(() => {
    return inspections.filter(r => {
      const matchSearch = !search || 
        r.id.toLowerCase().includes(search.toLowerCase()) || 
        r.department.toLowerCase().includes(search.toLowerCase()) || 
        r.user.toLowerCase().includes(search.toLowerCase()) ||
        r.priority.toLowerCase().includes(search.toLowerCase()) ||
        r.status.toLowerCase().includes(search.toLowerCase()) ||
        r.result.toLowerCase().includes(search.toLowerCase());
        
      const matchDept = !filters.department || r.department === filters.department;
      const matchEng = !filters.user || r.user === filters.user;
      const matchStatus = !filters.status || r.status === filters.status;
      const matchPriority = !filters.priority || r.priority === filters.priority;
      const matchDate = !filters.dueDate || r.dueDate === filters.dueDate;

      return matchSearch && matchDept && matchEng && matchStatus && matchPriority && matchDate;
    });
  }, [inspections, search, filters]);

  // Handlers
  const handleUpdateRecord = (updated: QAInspection, timelineEntry?: {title: string; desc: string; color: string}) => {
    setIsLoading(true);
    setTimeout(() => {
      setInspections(prev => prev.map(p => {
        if (p.id === updated.id) {
          const newTimeline = timelineEntry ? [{ ...timelineEntry, time: "Just now" }, ...p.timeline] : p.timeline;
          return { ...updated, timeline: newTimeline };
        }
        return p;
      }));
      if (selectedRecord && selectedRecord.id === updated.id) {
        setSelectedRecord({ ...updated, timeline: timelineEntry ? [{ ...timelineEntry, time: "Just now" }, ...updated.timeline] : updated.timeline });
      }
      setIsLoading(false);
    }, 400);
  };

  const handleCreate = () => {
    if (!newForm.department || !newForm.user || !newForm.dueDate) {
      toast.error("Validation Failed: Please fill all required fields");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      const newRec: QAInspection = {
        id: `QA-${Math.floor(1000 + Math.random() * 9000)}`,
        machine: "New Inspection Task",
        department: newForm.department!,
        user: newForm.user!,
        dueDate: newForm.dueDate!,
        priority: newForm.priority as QASeverity,
        status: newForm.status as QAStatus,
        result: newForm.result as QAResult,
        notes: newForm.notes || "",
        timeline: [{ time: "Just now", title: "Inspection Created", desc: "System", color: "bg-slate-100 text-slate-600" }]
      };
      setInspections([newRec, ...inspections]);
      setShowNew(false);
      setNewForm({ department: "Production", user: "", dueDate: "", priority: "Medium", status: "Pending", result: "N/A", notes: "" });
      toast.success("Inspection Created Successfully");
      setIsLoading(false);
    }, 600);
  };

  const handleDelete = (id: string) => {
    setInspections(prev => prev.filter(p => p.id !== id));
  };
  
  const handleDuplicate = (rec: QAInspection) => {
    const dup = { ...rec, id: `QA-${Math.floor(1000 + Math.random() * 9000)}`, timeline: [{ time: "Just now", title: "Inspection Created", desc: "Duplicated", color: "bg-slate-100 text-slate-600" }] };
    setInspections([dup, ...inspections]);
    toast.success("Inspection Duplicated");
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
              <p className="text-xs text-slate-500 font-medium mt-0.5">Manage quality inspections across all departments</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowNew(true)} className="flex items-center gap-1.5 h-9 px-4 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
              <Plus size={14} /> New Inspection
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
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      )}

      {/* Tab Content */}
      {subTab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {[
              { label: "Total QA Tasks", val: inspections.length, icon: CheckSquare, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Passed", val: inspections.filter(i=>i.result==='Pass').length, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "Failed", val: inspections.filter(i=>i.result==='Fail').length, icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
              { label: "Pending Reviews", val: inspections.filter(i=>i.status==='In Review').length, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
              { label: "Critical Issues", val: inspections.filter(i=>i.priority==='Critical').length, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
              { label: "Pass Rate", val: Math.round((inspections.filter(i=>i.result==='Pass').length / Math.max(inspections.filter(i=>i.result!=='N/A').length, 1))*100)+"%", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
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
                <h3 className="text-sm font-bold text-slate-900">Quality Trend (30 Days)</h3>
                <select className="text-xs border border-slate-200 rounded p-1 text-slate-600 bg-slate-50 outline-none">
                  <option>All Departments</option>
                  <option>Production</option>
                  <option>IT Infrastructure</option>
                </select>
              </div>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { name: "Week 1", pass: 40, fail: 5 }, { name: "Week 2", pass: 45, fail: 3 },
                    { name: "Week 3", pass: 38, fail: 8 }, { name: "Week 4", pass: 52, fail: 2 }
                  ]} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748B" }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748B" }} />
                    <RechartsTooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0" }} />
                    <Area type="monotone" dataKey="pass" stackId="1" stroke="#10B981" fill="#D1FAE5" />
                    <Area type="monotone" dataKey="fail" stackId="2" stroke="#F87171" fill="#FEE2E2" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex flex-col">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Department Performance</h3>
              <div className="flex-1 space-y-4">
                {[
                  { name: "Production", score: 94 },
                  { name: "IT Department", score: 88 },
                  { name: "Warehouse", score: 98 },
                  { name: "Engineering", score: 82 },
                  { name: "Quality Control", score: 100 },
                ].map(dept => (
                  <div key={dept.name}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-700">{dept.name}</span>
                      <span className="font-bold text-slate-900">{dept.score}% Pass</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className={`h-2 rounded-full ${dept.score >= 90 ? "bg-emerald-500" : dept.score >= 80 ? "bg-blue-500" : "bg-amber-500"}`} style={{ width: `${dept.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {subTab === "inspections" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 relative">
            <div className="relative w-72">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by ID, Dept, Priority..."
                className="w-full h-9 pl-9 pr-4 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            
            <button onClick={() => setShowFilters(!showFilters)} className={`h-9 px-3 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${showFilters || Object.values(filters).some(x=>x) ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-white text-slate-600 border border-slate-300'}`}>
              <Filter size={14}/> Filter
            </button>
            
            <button onClick={() => setShowColumns(!showColumns)} className="h-9 px-3 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg flex items-center gap-1.5 ml-auto">
              <Columns size={14}/> Columns
            </button>

            {/* Filter Popover */}
            {showFilters && (
              <div className="absolute top-11 left-[300px] w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-20 p-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold text-slate-900">Filters</h3>
                  <button onClick={() => { setFilters({ department: "", user: "", status: "", priority: "", dueDate: "" }); toast.success("Filters Reset"); setShowFilters(false); }} className="text-xs text-blue-600 hover:text-blue-700 font-medium">Reset All</button>
                </div>
                <div className="space-y-3">
                  <div><label className="text-xs font-semibold text-slate-600 block mb-1">Department</label><select value={filters.department} onChange={e=>setFilters({...filters, department: e.target.value})} className="w-full h-8 px-2 text-sm border rounded"><option value="">All Departments</option>{DEPARTMENTS.map(d=><option key={d}>{d}</option>)}</select></div>
                  <div><label className="text-xs font-semibold text-slate-600 block mb-1">Inspector</label><select value={filters.user} onChange={e=>setFilters({...filters, user: e.target.value})} className="w-full h-8 px-2 text-sm border rounded"><option value="">All Inspectors</option>{USERS.map(e=><option key={e}>{e}</option>)}</select></div>
                  <div><label className="text-xs font-semibold text-slate-600 block mb-1">Status</label><select value={filters.status} onChange={e=>setFilters({...filters, status: e.target.value})} className="w-full h-8 px-2 text-sm border rounded"><option value="">All Statuses</option><option>Pending</option><option>In Review</option><option>Completed</option><option>Cancelled</option></select></div>
                  <div><label className="text-xs font-semibold text-slate-600 block mb-1">Priority</label><select value={filters.priority} onChange={e=>setFilters({...filters, priority: e.target.value})} className="w-full h-8 px-2 text-sm border rounded"><option value="">All Priorities</option><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select></div>
                  <div><label className="text-xs font-semibold text-slate-600 block mb-1">Due Date</label><input type="date" value={filters.dueDate} onChange={e=>setFilters({...filters, dueDate: e.target.value})} className="w-full h-8 px-2 text-sm border rounded" /></div>
                  <button onClick={() => { setShowFilters(false); toast.success("Filters Applied"); }} className="w-full h-8 bg-slate-900 text-white text-xs font-bold rounded-lg mt-2">Apply Filters</button>
                </div>
              </div>
            )}

            {/* Columns Popover */}
            {showColumns && (
              <div className="absolute top-11 right-0 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-20 p-2 animate-in fade-in zoom-in-95 duration-200">
                {Object.keys(columns).map(col => (
                  <label key={col} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer">
                    <input type="checkbox" checked={(columns as any)[col]} onChange={e => setColumns({...columns, [col]: e.target.checked})} className="rounded border-slate-300 text-blue-600" />
                    <span className="text-sm font-medium text-slate-700 capitalize">{col.replace(/([A-Z])/g, ' $1').trim()}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden min-h-[400px]">
            {filteredInspections.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                <CheckSquare size={32} className="mb-2 text-slate-300" />
                <p className="text-sm font-medium">No results found.</p>
              </div>
            ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-slate-50/70 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">Inspection ID</th>
                    {columns.department && <th className="px-4 py-3">Department</th>}
                    {columns.user && <th className="px-4 py-3">Inspector</th>}
                    {columns.dueDate && <th className="px-4 py-3">Due Date</th>}
                    {columns.priority && <th className="px-4 py-3">Priority</th>}
                    {columns.status && <th className="px-4 py-3">Status</th>}
                    {columns.result && <th className="px-4 py-3">Result</th>}
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredInspections.map(record => (
                    <tr key={record.id} className="hover:bg-slate-50 cursor-pointer group" onClick={() => setSelectedRecord(record)}>
                      <td className="px-4 py-3.5 text-xs font-mono font-bold text-slate-600">{record.id}</td>
                      {columns.department && <td className="px-4 py-3.5">
                        <div className="text-xs font-bold text-slate-900">{record.department}</div>
                        <div className="text-[10px] text-slate-500">{record.machine}</div>
                      </td>}
                      {columns.user && <td className="px-4 py-3.5 text-xs font-semibold text-slate-700">{record.user}</td>}
                      {columns.dueDate && <td className="px-4 py-3.5 text-xs text-slate-500">{formatDate(record.dueDate)}</td>}
                      {columns.priority && <td className="px-4 py-3.5"><PriorityBadge priority={record.priority} /></td>}
                      {columns.status && <td className="px-4 py-3.5"><QAStatusBadge status={record.status} /></td>}
                      {columns.result && <td className="px-4 py-3.5"><QAResultBadge result={record.result} /></td>}
                      <td className="px-4 py-3.5 text-right relative" onClick={e=>e.stopPropagation()}>
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
                                <button onClick={() => { setSelectedRecord(record); setOpenMenuId(null); }} className="w-full px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"><RefreshCw size={14} /> Update Status</button>
                                <button onClick={() => { handleGlobalExport(); setOpenMenuId(null); }} className="w-full px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"><Download size={14} /> Export Word</button>
                                <button onClick={() => { handleDuplicate(record); setOpenMenuId(null); }} className="w-full px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"><Copy size={14} /> Duplicate Inspection</button>
                                <div className="h-px bg-slate-100 my-1" />
                                <button onClick={() => { handleDelete(record.id); setOpenMenuId(null); }} className="w-full px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"><Trash2 size={14} /> Delete Inspection</button>
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

      {/* New Inspection Modal */}
      {showNew && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowNew(false)} />
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">New Inspection</h2>
              <button onClick={() => setShowNew(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department *</label>
                <select value={newForm.department} onChange={e=>setNewForm({...newForm, department: e.target.value})} className="w-full h-9 px-3 text-sm border rounded-lg">{DEPARTMENTS.map(d=><option key={d}>{d}</option>)}</select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Inspector *</label>
                <select value={newForm.user} onChange={e=>setNewForm({...newForm, user: e.target.value})} className="w-full h-9 px-3 text-sm border rounded-lg"><option value="">Select Inspector</option>{USERS.map(e=><option key={e}>{e}</option>)}</select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date *</label>
                <input type="date" value={newForm.dueDate} onChange={e=>setNewForm({...newForm, dueDate: e.target.value})} className="w-full h-9 px-3 text-sm border rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                  <select value={newForm.priority} onChange={e=>setNewForm({...newForm, priority: e.target.value as any})} className="w-full h-9 px-3 text-sm border rounded-lg"><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select value={newForm.status} onChange={e=>setNewForm({...newForm, status: e.target.value as any})} className="w-full h-9 px-3 text-sm border rounded-lg"><option>Pending</option><option>In Review</option><option>Completed</option><option>Cancelled</option></select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Result</label>
                <select value={newForm.result} onChange={e=>setNewForm({...newForm, result: e.target.value as any})} className="w-full h-9 px-3 text-sm border rounded-lg"><option>Pass</option><option>Fail</option><option>Conditional Pass</option><option>N/A</option></select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
                <textarea rows={3} value={newForm.notes} onChange={e=>setNewForm({...newForm, notes: e.target.value})} className="w-full p-3 text-sm border rounded-lg resize-none" />
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex gap-3 rounded-b-xl">
              <button onClick={() => setShowNew(false)} className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={handleCreate} className="flex-1 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">Create Inspection</button>
            </div>
          </div>
        </div>
      )}

      {selectedRecord && <QAInspectionDrawer record={selectedRecord} onClose={() => setSelectedRecord(null)} onUpdate={handleUpdateRecord} />}
    </div>
  );
}
