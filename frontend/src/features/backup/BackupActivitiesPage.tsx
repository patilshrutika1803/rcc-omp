// ─────────────────────────────────────────────────────────────────────────────
// BackupActivitiesPage
// Redesigned to mirror the Preventive Maintenance architecture while keeping
// the backup module scoped to jobs and history.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import {
  Archive,
  ChevronRight,
  Download,
  Grid3x3,
  History,
  ListFilter,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Table2,
} from "lucide-react";

import { BackupJobsTable } from "./components/jobs/BackupJobsTable";
import { BackupCardView } from "./components/jobs/BackupCardView";
import { BackupJobDrawer } from "./components/jobs/BackupJobDrawer";
import { BackupJobModal } from "./components/jobs/BackupJobModal";
import { BackupExecutionForm } from "./components/jobs/BackupExecutionForm";

import { useBackupActivities } from "./hooks/useBackupActivities";
import { BKP_STATUSES, BKP_TYPES, BKP_SUB_TABS, BKP_DEPARTMENTS, BKP_FREQUENCIES, BKP_PRIORITY_OPTIONS } from "./constants/backupConstants";
import { exportBackupJobPdf } from "./utils/backupPdf";
import { getBackupStorage, getLatestBackupExecution, resolveBackupInstitution, resolveBackupVerifiedBy } from "./utils/backupHelpers";

const viewToggleOptions = [
  { id: "table", icon: Table2, title: "Table View" },
  { id: "card", icon: Grid3x3, title: "Card View" },
] as const;

export default function BackupActivitiesPage() {
  const {
    subTab, setSubTab,
    viewMode, setViewMode,
    showHistory, setShowHistory,
    searchQuery, setSearchQuery,
    showFilters, setShowFilters,
    filters, setFilters,
    filteredJobs,
    completedJobs,
    filteredCompletedJobs,
    jobs,
    selectedJob, showDrawer, openJob, closeDrawer,
    showAddModal, setShowAddModal,
    editingJob, setEditingJob,
    showExecutionForm, completingJob, executionFormMode, openCompletionForm, openExecutionReview, submitCompletionForm, cancelCompletionForm, handleUndoCompletion,
    handleAddJob, handleEditJob, handleDuplicate, handleSnooze, handleDelete,
  } = useBackupActivities();

  return (
    <div className="w-full max-w-[1600px] mx-auto animate-in fade-in duration-300">
      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-2">
          <Archive size={12} />
          <span>Backup</span>
          <ChevronRight size={12} />
          <span className="text-slate-700 font-semibold">Backup Activities</span>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-sm shadow-emerald-200">
              <Archive size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Backup Activities</h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Manage backup jobs and schedules across the IT estate</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 h-9 px-4 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <Plus size={14} /> Add Backup Job
            </button>
            <button
              onClick={() => setShowHistory(value => !value)}
              className={`flex items-center gap-1.5 h-9 px-3 text-xs font-semibold rounded-lg transition-colors border ${showHistory ? "bg-slate-700 text-white border-slate-700" : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"}`}
            >
              <History size={14} />
              History
              {completedJobs.length > 0 && (
                <span className={`ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${showHistory ? "bg-slate-500 text-white" : "bg-slate-200 text-slate-600"}`}>
                  {filteredCompletedJobs.length}
                </span>
              )}
            </button>
            <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200 ml-1">
              {viewToggleOptions.map(view => {
                const Icon = view.icon;
                return (
                  <button
                    key={view.id}
                    title={view.title}
                    onClick={() => setViewMode(view.id as typeof viewMode)}
                    className={`p-1.5 rounded-md transition-all ${viewMode === view.id ? "bg-white shadow-sm text-emerald-600" : "text-slate-400 hover:text-slate-700"}`}
                  >
                    <Icon size={15} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={event => setSearchQuery(event.target.value)}
              placeholder="Search job name or ID"
              className="w-full h-9 pl-9 pr-4 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder-slate-400"
            />
          </div>
          <button
            onClick={() => setShowFilters(value => !value)}
            className={`ml-auto flex items-center gap-1.5 h-9 px-3 text-xs font-semibold border rounded-lg transition-colors ${showFilters ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"}`}
          >
            <SlidersHorizontal size={14} /> Filters
            {(filters.status || filters.type) && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 ml-0.5" />}
          </button>
        </div>

        {showFilters && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 mb-5 mt-5 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-700 flex items-center gap-2">
                <ListFilter size={14} className="text-emerald-500" /> Advanced Filters
              </h3>
              <button
                onClick={() => setFilters({ status: "", type: "", department: "", frequency: "", priority: "", institutionName: "", dueDate: "" })}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 transition-colors"
              >
                <RefreshCw size={12} /> Reset
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Status</label>
                <select value={filters.status} onChange={event => setFilters(current => ({ ...current, status: event.target.value }))} className="w-full h-8 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700">
                  <option value="">All Statuses</option>
                  {BKP_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Type</label>
                <select value={filters.type} onChange={event => setFilters(current => ({ ...current, type: event.target.value }))} className="w-full h-8 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700">
                  <option value="">All Types</option>
                  {BKP_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Department</label>
                <select value={filters.department} onChange={event => setFilters(current => ({ ...current, department: event.target.value }))} className="w-full h-8 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700">
                  <option value="">All Departments</option>
                  {BKP_DEPARTMENTS.map(department => <option key={department} value={department}>{department}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Frequency</label>
                <select value={filters.frequency} onChange={event => setFilters(current => ({ ...current, frequency: event.target.value }))} className="w-full h-8 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700">
                  <option value="">All Frequencies</option>
                  {BKP_FREQUENCIES.map(frequency => <option key={frequency} value={frequency}>{frequency}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Priority</label>
                <select value={filters.priority} onChange={event => setFilters(current => ({ ...current, priority: event.target.value }))} className="w-full h-8 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700">
                  <option value="">All Priorities</option>
                  {BKP_PRIORITY_OPTIONS.map(priority => <option key={priority} value={priority}>{priority}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Institution</label>
                <input value={filters.institutionName} onChange={event => setFilters(current => ({ ...current, institutionName: event.target.value }))} placeholder="Search institution" className="w-full h-8 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Due Date</label>
                <input type="date" value={filters.dueDate} onChange={event => setFilters(current => ({ ...current, dueDate: event.target.value }))} className="w-full h-8 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700" />
              </div>
            </div>
          </div>
        )}

        <div className="mt-5 flex items-center gap-1 border-b border-slate-200">
          {BKP_SUB_TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors -mb-px ${
                  subTab === tab.id
                    ? "border-emerald-600 text-emerald-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {showHistory && (
        <div className="mb-6 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-700">Completed Backup History</h3>
            <p className="text-xs text-slate-500 mt-0.5">{filteredCompletedJobs.length} completed job(s)</p>
          </div>
          {filteredCompletedJobs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No completed backup jobs yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-slate-50/70 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">Backup Activity</th>
                    <th className="px-4 py-3">Completed Date</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Institution</th>
                    <th className="px-4 py-3">Storage</th>
                    <th className="px-4 py-3">Done By</th>
                    <th className="px-4 py-3">Verified By</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredCompletedJobs.map(job => (
                    (() => {
                      const execution = getLatestBackupExecution(job);
                      const storage = getBackupStorage(job, execution);
                      return <tr key={job.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="text-xs font-bold text-slate-900">{job.name}</div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-500 font-mono">{job.lastBackup}</td>
                      <td className="px-4 py-3.5 text-xs text-slate-500">{job.department}</td>
                      <td className="px-4 py-3.5 text-xs text-slate-500">{resolveBackupInstitution(job, execution)}</td>
                      <td className="px-4 py-3.5 text-xs text-slate-500">{storage.used} {storage.unit} / {storage.quotaGB} GB</td>
                      <td className="px-4 py-3.5 text-xs text-slate-500">{execution?.doneBy || job.completedBy || job.user}</td>
                      <td className="px-4 py-3.5 text-xs text-slate-500">{resolveBackupVerifiedBy(job, execution)}</td>
                      <td className="px-4 py-3.5 text-xs text-emerald-600 font-semibold">Completed</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button title="View Details" onClick={() => openJob(job)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md"><Archive size={14} /></button>
                          <button title="View Execution Form" onClick={() => openExecutionReview(job)} className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-md"><History size={14} /></button>
                          <button title="Export PDF" onClick={() => exportBackupJobPdf(job)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"><Download size={14} /></button>
                          <button title="Undo Completion" onClick={() => { if (window.confirm("Undo Completion?\n\nThis will restore the task to its previous active state. Any generated recurring record/history changes will be safely reversed.")) handleUndoCompletion(job); }} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md"><RefreshCw size={14} /></button>
                          <button title="Delete" onClick={() => handleDelete(job)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md">✕</button>
                        </div>
                      </td>
                      </tr>;
                    })()
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {!showHistory && subTab === "jobs" && (
        <>
          {viewMode === "table" && (
            <BackupJobsTable
              jobs={filteredJobs}
              searchQuery={searchQuery}
              statusFilter={filters.status}
              typeFilter={filters.type}
              onViewJob={openJob}
              onViewExecution={openExecutionReview}
              onEdit={job => setEditingJob(job)}
              onRunNow={openCompletionForm}
              onDuplicate={handleDuplicate}
              onSnooze={handleSnooze}
              onDelete={handleDelete}
              onExportPdf={exportBackupJobPdf}
            />
          )}
          {viewMode === "card" && (
            <BackupCardView
              jobs={filteredJobs}
              onViewJob={openJob}
              onEdit={job => setEditingJob(job)}
              onRunNow={openCompletionForm}
              onViewExecution={openExecutionReview}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onExportPdf={exportBackupJobPdf}
            />
          )}
        </>
      )}

      {showDrawer && selectedJob && (
        <BackupJobDrawer
          job={selectedJob}
          onClose={closeDrawer}
          onEdit={() => { setEditingJob(selectedJob); closeDrawer(); }}
          onRunNow={() => openCompletionForm(selectedJob)}
          onViewExecution={() => openExecutionReview(selectedJob)}
          onUndo={() => { if (window.confirm("Undo Completion?\n\nThis will restore the task to its previous active state. Any generated recurring record/history changes will be safely reversed.")) { handleUndoCompletion(selectedJob); closeDrawer(); } }}
        />
      )}

      {showAddModal && <BackupJobModal mode="add" onSave={handleAddJob} onCancel={() => setShowAddModal(false)} />}
      {editingJob && <BackupJobModal mode="edit" initial={editingJob} onSave={handleEditJob} onCancel={() => setEditingJob(null)} />}
      {showExecutionForm && completingJob && (
        <BackupExecutionForm
          job={completingJob}
          mode={executionFormMode}
          onClose={cancelCompletionForm}
          onSubmit={submitCompletionForm}
        />
      )}
    </div>
  );
}
