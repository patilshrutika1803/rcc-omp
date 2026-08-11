import React, { useMemo, useState } from "react";
import { Archive, CalendarDays, CheckCircle2, ClipboardList, Download, Edit3, History, Plus, Search, SlidersHorizontal, Trash2, Truck, PackageCheck, RotateCcw, Eye } from "lucide-react";
import { useMonthlyHardDiskTracker } from "./hooks/useMonthlyHardDiskTracker";
import type { HardDiskCycle, HardDiskCycleFormValues } from "./types/hardDisk";
import { HDD_PRIORITY_OPTIONS, HDD_REMINDER_OPTIONS } from "./constants/hardDiskConstants";
import { exportHardDiskCyclePdf } from "./utils/hardDiskPdf";

const emptyFormValues = (): HardDiskCycleFormValues => ({
  month: "",
  dispatchDate: "",
  expectedReturnDate: "",
  reminderBeforeReturn: "5 Days Before",
  priority: "Medium",
  preparedBy: "",
  responsiblePerson: "",
  remarks: "",
});

function formatMonthLabel(monthKey: string): string {
  const [yearText, monthText] = monthKey.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

export default function MonthlyHardDiskTrackerPage() {
  const {
    cycles,
    completedHistory,
    filteredCycles,
    selectedCycle,
    showModal,
    editingCycle,
    showCompletionModal,
    showDrawer,
    showHistory,
    searchQuery,
    showFilters,
    filters,
    kpis,
    setShowModal,
    setEditingCycle,
    setShowCompletionModal,
    setShowHistory,
    setSearchQuery,
    setShowFilters,
    setFilters,
    openCycle,
    closeDrawer,
    submitCycle,
    updateCycleStatus,
    completeCycle,
    markAccountabilityCompleted,
    recordReturn,
    removeCycle,
    updateCycle,
  } = useMonthlyHardDiskTracker();

  const [formValues, setFormValues] = useState<HardDiskCycleFormValues>(emptyFormValues());
  const [completionForm, setCompletionForm] = useState({
    returnDate: "",
    returnTime: "",
    receivedBy: "",
    verifiedBy: "",
    hardDiskCondition: "Good",
    backupVerification: "Verified",
    remarks: "",
    completionNotes: "",
  });

  const openCreateModal = () => {
    setFormValues(emptyFormValues());
    setEditingCycle(null);
    setShowModal(true);
  };

  const openEditModal = (cycle: HardDiskCycle) => {
    setEditingCycle(cycle);
    setFormValues({
      month: cycle.month,
      dispatchDate: cycle.dispatchDate,
      expectedReturnDate: cycle.expectedReturnDate,
      reminderBeforeReturn: cycle.reminderBeforeReturn,
      priority: cycle.priority,
      preparedBy: cycle.preparedBy,
      responsiblePerson: cycle.responsiblePerson,
      remarks: cycle.remarks,
    });
    setShowModal(true);
  };

  const openCompletion = (cycle: HardDiskCycle) => {
    setCompletionForm({
      returnDate: cycle.expectedReturnDate,
      returnTime: "16:00",
      receivedBy: cycle.responsiblePerson,
      verifiedBy: cycle.preparedBy,
      hardDiskCondition: "Good",
      backupVerification: "Verified",
      remarks: cycle.remarks,
      completionNotes: "Completed successfully",
    });
    setShowCompletionModal(true);
    setEditingCycle(cycle);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (editingCycle) {
      updateCycle(editingCycle, formValues);
    } else {
      submitCycle(formValues);
    }
  };

  const handleCompletionSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (editingCycle) {
      completeCycle(editingCycle, {
        returnDate: completionForm.returnDate,
        returnTime: completionForm.returnTime,
        receivedBy: completionForm.receivedBy,
        verifiedBy: completionForm.verifiedBy,
        hardDiskCondition: completionForm.hardDiskCondition,
        backupVerification: completionForm.backupVerification,
        remarks: completionForm.remarks,
        completionNotes: completionForm.completionNotes,
      }, completionForm.receivedBy);
    }
  };

  const [showAccountabilityModal, setShowAccountabilityModal] = useState(false);
  const [accountabilityForm, setAccountabilityForm] = useState({ completedBy: "", completedAt: "", notes: "" });
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnForm, setReturnForm] = useState({ returnDate: "", returnedBy: "", receivedBy: "", returnNotes: "" });

  const openAccountability = (cycle: HardDiskCycle) => {
    setEditingCycle(cycle);
    setAccountabilityForm({ completedBy: cycle.responsiblePerson || "", completedAt: new Date().toISOString().split("T")[0], notes: "" });
    setShowAccountabilityModal(true);
  };

  const handleAccountabilitySubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingCycle) return;
    markAccountabilityCompleted(editingCycle, accountabilityForm.completedBy, accountabilityForm.completedAt, accountabilityForm.notes);
    setShowAccountabilityModal(false);
    setEditingCycle(null);
  };

  const openReturn = (cycle: HardDiskCycle) => {
    setEditingCycle(cycle);
    setReturnForm({ returnDate: new Date().toISOString().split("T")[0], returnedBy: cycle.responsiblePerson || "", receivedBy: cycle.preparedBy || "", returnNotes: "" });
    setShowReturnModal(true);
  };

  const handleReturnSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingCycle) return;
    recordReturn(editingCycle, {
      returnDate: returnForm.returnDate,
      returnedBy: returnForm.returnedBy,
      receivedBy: returnForm.receivedBy,
      returnNotes: returnForm.returnNotes,
    }, returnForm.receivedBy);
    setShowReturnModal(false);
    setEditingCycle(null);
  };

  const nextStatusMap: Record<string, string[]> = {
    Created: ["Ready for Dispatch"],
    "Ready for Dispatch": ["Dispatched from RCC"],
    "Dispatched from RCC": ["Received at RSB"],
    "Received at RSB": ["Monthly Backup Completed"],
    "Monthly Backup Completed": ["Return Pending"],
    "Return Pending": ["Returned from RSB"],
    "Returned from RSB": ["Received at RCC"],
    "Received at RCC": ["Cycle Completed"],
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto animate-in fade-in duration-300">
      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-2">
          <Archive size={12} />
          <span>Operations</span>
          <span className="text-slate-700 font-semibold">Monthly Hard Disk Tracker</span>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center shadow-sm">
              <HardDriveIcon />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Monthly Hard Disk Tracker</h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Track the single official backup disk across RCC and RSB every month</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={openCreateModal} className="flex items-center gap-1.5 h-9 px-4 text-xs font-semibold text-white bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors shadow-sm">
              <Plus size={14} /> Create Monthly Cycle
            </button>
            <button onClick={() => setShowHistory((value) => !value)} className={`flex items-center gap-1.5 h-9 px-3 text-xs font-semibold rounded-lg transition-colors border ${showHistory ? "bg-slate-700 text-white border-slate-700" : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"}`}>
              <History size={14} /> History
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mb-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-400">{kpi.label}</div>
            <div className="mt-2 text-xl font-bold text-slate-900">{kpi.value}</div>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search month, cycle ID, person" className="w-full h-9 pl-9 pr-4 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all" />
        </div>
        <button onClick={() => setShowFilters((value) => !value)} className={`ml-auto flex items-center gap-1.5 h-9 px-3 text-xs font-semibold border rounded-lg transition-colors ${showFilters ? "bg-slate-100 text-slate-800 border-slate-300" : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"}`}>
          <SlidersHorizontal size={14} /> Filters
        </button>
      </div>

      {showFilters && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 mb-5">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Month</label>
              <input type="month" value={filters.month} onChange={(event) => setFilters((current) => ({ ...current, month: event.target.value }))} className="w-full h-8 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Status</label>
              <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))} className="w-full h-8 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg">
                <option value="">All</option>
                <option value="Created">Created</option>
                <option value="Ready for Dispatch">Ready for Dispatch</option>
                <option value="Dispatched from RCC">Dispatched from RCC</option>
                <option value="Received at RSB">Received at RSB</option>
                <option value="Monthly Backup Completed">Monthly Backup Completed</option>
                <option value="Return Pending">Return Pending</option>
                <option value="Returned from RSB">Returned from RSB</option>
                <option value="Received at RCC">Received at RCC</option>
                <option value="Cycle Completed">Cycle Completed</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Priority</label>
              <select value={filters.priority} onChange={(event) => setFilters((current) => ({ ...current, priority: event.target.value }))} className="w-full h-8 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg">
                <option value="">All</option>
                {HDD_PRIORITY_OPTIONS.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Reminder Status</label>
              <select value={filters.reminderStatus} onChange={(event) => setFilters((current) => ({ ...current, reminderStatus: event.target.value }))} className="w-full h-8 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg">
                <option value="">All</option>
                <option value="Pending">Pending</option>
                <option value="Triggered">Triggered</option>
                <option value="Completed">Completed</option>
                <option value="Skipped">Skipped</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {!showHistory ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-slate-50/70 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Month</th>
                  <th className="px-4 py-3">Cycle ID</th>
                  <th className="px-4 py-3">Current Status</th>
                  <th className="px-4 py-3">Dispatch Date</th>
                  <th className="px-4 py-3">Expected Return Date</th>
                  <th className="px-4 py-3">Accountability Date</th>
                  <th className="px-4 py-3">Accountability Status</th>
                  <th className="px-4 py-3">Actual Return Date</th>
                  <th className="px-4 py-3">Current Holder</th>
                  <th className="px-4 py-3">Reminder Status</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredCycles.map((cycle) => (
                  <tr key={cycle.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-4 py-3.5 text-xs font-semibold text-slate-900">{formatMonthLabel(cycle.month)}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-500 font-mono">{cycle.cycleId}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-600">{cycle.status}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">{cycle.dispatchDate}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">{cycle.expectedReturnDate}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">{(() => {
                      const date = new Date(cycle.expectedReturnDate);
                      const offset = 5; // default is 5 days before unless option changed
                      date.setDate(date.getDate() - offset);
                      return date.toISOString().split("T")[0];
                    })()}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">{cycle.accountabilityStatus || "Pending"}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">{cycle.actualReturnDate || "—"}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">{cycle.currentHolder}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">{cycle.reminderStatus}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">{cycle.priority}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button title="View" onClick={() => openCycle(cycle)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md"><Eye size={14} /></button>
                        <button title="Edit" onClick={() => openEditModal(cycle)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md"><Edit3 size={14} /></button>
                        <button title="Dispatch" onClick={() => updateCycleStatus(cycle, "Dispatched from RCC", "Hard disk dispatched", cycle.responsiblePerson)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md"><Truck size={14} /></button>
                        <button title="Receive at RSB" onClick={() => updateCycleStatus(cycle, "Received at RSB", "Hard disk received at RSB", cycle.responsiblePerson)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"><PackageCheck size={14} /></button>
                        <button title="Accountability" onClick={() => openAccountability(cycle)} className="p-1.5 text-slate-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-md"><RotateCcw size={14} /></button>
                        <button title="Mark Returned" onClick={() => openReturn(cycle)} className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-md"><RotateCcw size={14} /></button>
                        <button title="Complete" onClick={() => openCompletion(cycle)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md"><CheckCircle2 size={14} /></button>
                        <button title="Export PDF" onClick={() => exportHardDiskCyclePdf(cycle)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md"><Download size={14} /></button>
                        <button title="Delete" onClick={() => removeCycle(cycle)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-700">Completed Monthly Cycle History</h3>
            <p className="text-xs text-slate-500 mt-0.5">Immutable completion history for each monthly cycle</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-slate-50/70 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Month</th>
                  <th className="px-4 py-3">Cycle ID</th>
                  <th className="px-4 py-3">Return Date</th>
                  <th className="px-4 py-3">Completed Date</th>
                  <th className="px-4 py-3">Completed By</th>
                  <th className="px-4 py-3">Verified By</th>
                  <th className="px-4 py-3">Condition</th>
                  <th className="px-4 py-3">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {completedHistory.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-4 py-3.5 text-xs font-semibold text-slate-900">{formatMonthLabel(record.month)}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-500 font-mono">{record.cycleId}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">{record.returnDate}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">{record.completedDate}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">{record.completedBy}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">{record.verifiedBy}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">{record.hardDiskCondition}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">{record.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{editingCycle ? "Edit Monthly Cycle" : "Create Monthly Cycle"}</h3>
                <p className="text-xs text-slate-500 mt-1">Mirror the same monthly lifecycle used in the enterprise operations modules</p>
              </div>
              <button onClick={() => { setShowModal(false); setEditingCycle(null); }} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Month *</label>
                <input type="month" required value={formValues.month} onChange={(event) => setFormValues((current) => ({ ...current, month: event.target.value }))} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Dispatch Date *</label>
                <input type="date" required value={formValues.dispatchDate} onChange={(event) => setFormValues((current) => ({ ...current, dispatchDate: event.target.value }))} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Expected Return Date *</label>
                <input type="date" required value={formValues.expectedReturnDate} onChange={(event) => setFormValues((current) => ({ ...current, expectedReturnDate: event.target.value }))} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Reminder Before Return</label>
                <select value={formValues.reminderBeforeReturn} onChange={(event) => setFormValues((current) => ({ ...current, reminderBeforeReturn: event.target.value }))} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg">
                  {HDD_REMINDER_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Priority</label>
                <select value={formValues.priority} onChange={(event) => setFormValues((current) => ({ ...current, priority: event.target.value as HardDiskCycleFormValues["priority"] }))} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg">
                  {HDD_PRIORITY_OPTIONS.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Prepared By *</label>
                <input required value={formValues.preparedBy} onChange={(event) => setFormValues((current) => ({ ...current, preparedBy: event.target.value }))} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Responsible Person *</label>
                <input required value={formValues.responsiblePerson} onChange={(event) => setFormValues((current) => ({ ...current, responsiblePerson: event.target.value }))} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg" />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Remarks</label>
                <textarea value={formValues.remarks} onChange={(event) => setFormValues((current) => ({ ...current, remarks: event.target.value }))} rows={3} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg" />
              </div>
              <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => { setShowModal(false); setEditingCycle(null); }} className="h-9 px-4 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="h-9 px-4 text-sm font-semibold text-white bg-slate-800 rounded-lg">Save Cycle</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCompletionModal && editingCycle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Complete Monthly Cycle</h3>
                <p className="text-xs text-slate-500 mt-1">Capture return details, verification, and completion notes</p>
              </div>
              <button onClick={() => { setShowCompletionModal(false); setEditingCycle(null); }} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <form onSubmit={handleCompletionSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Return Date *</label>
                <input type="date" required value={completionForm.returnDate} onChange={(event) => setCompletionForm((current) => ({ ...current, returnDate: event.target.value }))} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Return Time *</label>
                <input type="time" required value={completionForm.returnTime} onChange={(event) => setCompletionForm((current) => ({ ...current, returnTime: event.target.value }))} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Received By *</label>
                <input required value={completionForm.receivedBy} onChange={(event) => setCompletionForm((current) => ({ ...current, receivedBy: event.target.value }))} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Verified By</label>
                <input value={completionForm.verifiedBy} onChange={(event) => setCompletionForm((current) => ({ ...current, verifiedBy: event.target.value }))} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Hard Disk Condition</label>
                <select value={completionForm.hardDiskCondition} onChange={(event) => setCompletionForm((current) => ({ ...current, hardDiskCondition: event.target.value }))} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg">
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Needs Attention">Needs Attention</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Backup Verification</label>
                <select value={completionForm.backupVerification} onChange={(event) => setCompletionForm((current) => ({ ...current, backupVerification: event.target.value }))} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg">
                  <option value="Verified">Verified</option>
                  <option value="Pending Review">Pending Review</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Remarks</label>
                <textarea value={completionForm.remarks} onChange={(event) => setCompletionForm((current) => ({ ...current, remarks: event.target.value }))} rows={2} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg" />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Completion Notes</label>
                <textarea value={completionForm.completionNotes} onChange={(event) => setCompletionForm((current) => ({ ...current, completionNotes: event.target.value }))} rows={3} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg" />
              </div>
              <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => { setShowCompletionModal(false); setEditingCycle(null); }} className="h-9 px-4 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="h-9 px-4 text-sm font-semibold text-white bg-slate-800 rounded-lg">Save Completion</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAccountabilityModal && editingCycle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Capture Accountability</h3>
                <p className="text-xs text-slate-500 mt-1">Record accountability confirmation before month-end</p>
              </div>
              <button onClick={() => { setShowAccountabilityModal(false); setEditingCycle(null); }} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <form onSubmit={handleAccountabilitySubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Completed By *</label>
                <input required value={accountabilityForm.completedBy} onChange={(e) => setAccountabilityForm((c) => ({ ...c, completedBy: e.target.value }))} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Completed At *</label>
                <input type="date" required value={accountabilityForm.completedAt} onChange={(e) => setAccountabilityForm((c) => ({ ...c, completedAt: e.target.value }))} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg" />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Notes</label>
                <textarea value={accountabilityForm.notes} onChange={(e) => setAccountabilityForm((c) => ({ ...c, notes: e.target.value }))} rows={3} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg" />
              </div>
              <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => { setShowAccountabilityModal(false); setEditingCycle(null); }} className="h-9 px-4 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="h-9 px-4 text-sm font-semibold text-white bg-slate-800 rounded-lg">Save Accountability</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showReturnModal && editingCycle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Record Return</h3>
                <p className="text-xs text-slate-500 mt-1">Capture return details when RSB returns the hard disk</p>
              </div>
              <button onClick={() => { setShowReturnModal(false); setEditingCycle(null); }} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <form onSubmit={handleReturnSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Return Date *</label>
                <input type="date" required value={returnForm.returnDate} onChange={(e) => setReturnForm((c) => ({ ...c, returnDate: e.target.value }))} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Returned By</label>
                <input value={returnForm.returnedBy} onChange={(e) => setReturnForm((c) => ({ ...c, returnedBy: e.target.value }))} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Received By</label>
                <input value={returnForm.receivedBy} onChange={(e) => setReturnForm((c) => ({ ...c, receivedBy: e.target.value }))} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg" />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Return Notes</label>
                <textarea value={returnForm.returnNotes} onChange={(e) => setReturnForm((c) => ({ ...c, returnNotes: e.target.value }))} rows={3} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg" />
              </div>
              <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => { setShowReturnModal(false); setEditingCycle(null); }} className="h-9 px-4 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="h-9 px-4 text-sm font-semibold text-white bg-slate-800 rounded-lg">Save Return</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDrawer && selectedCycle && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white shadow-2xl border-l border-slate-200 overflow-auto">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Cycle Details</p>
                <h3 className="text-lg font-bold text-slate-900">{selectedCycle.cycleId}</h3>
              </div>
              <button onClick={closeDrawer} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-slate-200 p-3"><div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Month</div><div className="font-semibold text-slate-800">{formatMonthLabel(selectedCycle.month)}</div></div>
              <div className="rounded-lg border border-slate-200 p-3"><div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Status</div><div className="font-semibold text-slate-800">{selectedCycle.status}</div></div>
              <div className="rounded-lg border border-slate-200 p-3"><div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Prepared By</div><div className="font-semibold text-slate-800">{selectedCycle.preparedBy}</div></div>
              <div className="rounded-lg border border-slate-200 p-3"><div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Responsible Person</div><div className="font-semibold text-slate-800">{selectedCycle.responsiblePerson}</div></div>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-3"><CalendarDays size={16} className="text-slate-500" /><h4 className="text-sm font-bold text-slate-800">Timeline</h4></div>
              <div className="space-y-2">
                {selectedCycle.history.map((entry) => (
                  <div key={entry.id} className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                    <div className="font-semibold text-slate-800">{entry.label}</div>
                    <div className="text-xs mt-1">{entry.date} {entry.time} • {entry.user}</div>
                    <div className="text-xs mt-1">{entry.remarks}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-3"><ClipboardList size={16} className="text-slate-500" /><h4 className="text-sm font-bold text-slate-800">Remarks</h4></div>
              <p className="text-sm text-slate-600">{selectedCycle.remarks || "No remarks captured."}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function HardDriveIcon() {
  return <Archive size={20} className="text-white" />;
}
