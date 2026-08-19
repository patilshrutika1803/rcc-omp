import React, { useState } from "react";
import { CalendarClock, Plus, Search, Layers } from "lucide-react";
import { useInspectionSchedule } from "./hooks/useInspectionSchedule";
import { InspectionScheduleTable } from "./components/InspectionScheduleTable";
import { AddInspectionModal } from "./components/AddInspectionModal";
import { InspectionDetailsDrawer } from "./components/InspectionDetailsDrawer";
import { CompleteInspectionDialog } from "./components/CompleteInspectionDialog";
import { InspectionHistoryPanel } from "./components/InspectionHistoryPanel";
import { DeleteInspectionDialog } from "./components/DeleteInspectionDialog";
import type { InspectionScheduleRecord } from "./types/inspectionSchedule";
import {
  FILTER_TARGET_OPTIONS,
  FILTER_CATEGORY_OPTIONS,
  FILTER_STATUS_OPTIONS,
  FILTER_PRIORITY_OPTIONS,
} from "./constants/inspectionScheduleConstants";

export default function InspectionSchedulePage() {
  const {
    systems,
    activeInspections,
    completedInspections,
    kpis,
    isLoading,
    searchQuery,
    setSearchQuery,
    filterTarget,
    setFilterTarget,
    filterCategory,
    setFilterCategory,
    filterStatus,
    setFilterStatus,
    filterPriority,
    setFilterPriority,
    filterDepartment,
    setFilterDepartment,
    departmentOptions,
    showHistory,
    setShowHistory,
    showAddModal,
    openAddModal,
    closeAddModal,
    editingInspection,
    openEditModal,
    selectedInspection,
    openDetails,
    closeDetails,
    showCompleteDialog,
    openCompleteDialog,
    closeCompleteDialog,
    handleSaveInspection,
    handleCompleteInspection,
    handleDeleteInspection,
    setShowHistory: setHistory,
  } = useInspectionSchedule();
  const [deletingInspection, setDeletingInspection] = useState<InspectionScheduleRecord | null>(null);

  return (
    <div className="w-full max-w-[1600px] mx-auto animate-in fade-in duration-300">
      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-2">
          <CalendarClock size={12} />
          <span>Dashboard</span>
          <span className="text-slate-700 font-semibold">Inspection Schedule</span>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm shadow-blue-200">
              <Layers size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Inspection Schedule</h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Manage recurring inspections for systems and machines</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={openAddModal}
              className="flex items-center gap-2 h-9 px-4 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
              <Plus size={14} /> Add Inspection
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="md:col-span-1 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400 font-bold mb-3">Total Inspections</div>
          <div className="text-3xl font-bold text-slate-900">{kpis.total}</div>
        </div>
        <div className="md:col-span-1 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400 font-bold mb-3">Due Today</div>
          <div className="text-3xl font-bold text-slate-900">{kpis.dueToday}</div>
        </div>
        <div className="md:col-span-1 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400 font-bold mb-3">Upcoming</div>
          <div className="text-3xl font-bold text-slate-900">{kpis.upcoming}</div>
        </div>
        <div className="md:col-span-1 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400 font-bold mb-3">Completed</div>
          <div className="text-3xl font-bold text-slate-900">{kpis.completed}</div>
        </div>
        <div className="md:col-span-1 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400 font-bold mb-3">Overdue</div>
          <div className="text-3xl font-bold text-slate-900">{kpis.overdue}</div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm mb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <label className="sr-only" htmlFor="inspection-search">Search</label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  id="inspection-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search inspections..."
                  className="w-full h-11 pl-10 pr-3 text-sm border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-2 uppercase tracking-[0.2em]">Target Type</label>
              <select value={filterTarget} onChange={(e) => setFilterTarget(e.target.value as any)} className="w-full h-11 px-3 border border-slate-300 rounded-xl text-sm focus:border-blue-500 focus:ring-blue-500/20">
                {FILTER_TARGET_OPTIONS.map((option) => (<option key={option} value={option}>{option}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-2 uppercase tracking-[0.2em]">Category</label>
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full h-11 px-3 border border-slate-300 rounded-xl text-sm focus:border-blue-500 focus:ring-blue-500/20">
                {FILTER_CATEGORY_OPTIONS.map((option) => (<option key={option} value={option}>{option}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-2 uppercase tracking-[0.2em]">Status</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} className="w-full h-11 px-3 border border-slate-300 rounded-xl text-sm focus:border-blue-500 focus:ring-blue-500/20">
                {FILTER_STATUS_OPTIONS.map((option) => (<option key={option} value={option}>{option}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-2 uppercase tracking-[0.2em]">Priority</label>
              <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value as any)} className="w-full h-11 px-3 border border-slate-300 rounded-xl text-sm focus:border-blue-500 focus:ring-blue-500/20">
                {FILTER_PRIORITY_OPTIONS.map((option) => (<option key={option} value={option}>{option}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-2 uppercase tracking-[0.2em]">Department</label>
              <select value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)} className="w-full h-11 px-3 border border-slate-300 rounded-xl text-sm focus:border-blue-500 focus:ring-blue-500/20">
                {departmentOptions.map((department) => (<option key={department} value={department}>{department}</option>))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden mb-6">
        <InspectionScheduleTable
          data={activeInspections}
          onView={openDetails}
          onEdit={openEditModal}
          onComplete={openCompleteDialog}
          onDelete={setDeletingInspection}
        />
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-semibold text-slate-800">Completed Inspection History</div>
        <button onClick={() => setHistory(!showHistory)} className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 hover:text-blue-700">{showHistory ? "Hide" : "Show"} History</button>
      </div>

      {showHistory && (
        <InspectionHistoryPanel inspections={completedInspections} />
      )}

      {showAddModal && (
        <AddInspectionModal
          onClose={closeAddModal}
          onSave={handleSaveInspection}
          systems={systems}
          editRecord={editingInspection ?? undefined}
        />
      )}
      {selectedInspection && (
        <InspectionDetailsDrawer
          inspection={selectedInspection}
          onClose={closeDetails}
          onEdit={openEditModal}
          onComplete={() => openCompleteDialog(selectedInspection)}
        />
      )}
      {showCompleteDialog && selectedInspection && (
        <CompleteInspectionDialog
          inspection={selectedInspection}
          onClose={closeCompleteDialog}
          onConfirm={handleCompleteInspection}
        />
      )}
      {deletingInspection && (
        <DeleteInspectionDialog
          inspection={deletingInspection}
          onClose={() => setDeletingInspection(null)}
          onConfirm={() => {
            handleDeleteInspection(deletingInspection);
            setDeletingInspection(null);
          }}
        />
      )}
    </div>
  );
}
