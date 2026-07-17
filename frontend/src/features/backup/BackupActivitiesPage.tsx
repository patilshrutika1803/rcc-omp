// ─────────────────────────────────────────────────────────────────────────────
// BackupActivitiesPage
// Refactored into a scalable feature-folder architecture. Behavior, styling,
// and Tailwind classes are unchanged from the original monolithic version.
// This file now only composes components and wires up the page-level hook.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import {
  LayoutDashboard, Archive, ChevronRight, Plus, RefreshCw, Download,
} from "lucide-react";

import { BackupDashboard } from "./components/dashboard/BackupDashboard";
import { BackupJobsTable } from "./components/jobs/BackupJobsTable";
import { BackupCalendarView } from "./components/dashboard/BackupCalendarView";
import { BackupJobDrawer } from "./components/jobs/BackupJobDrawer";
import { BackupJobModal } from "./components/jobs/BackupJobModal";
import { RunConfirmDialog, RunAllConfirmDialog } from "./components/jobs/BackupRunDialogs";

import { useBackupActivities } from "./hooks/useBackupActivities";
import { BKP_SUB_TABS } from "./constants/backupConstants";

export default function BackupActivitiesPage() {
  const {
    subTab, setSubTab,
    jobs,
    selectedJob, showDrawer, openJob, closeDrawer,
    showAddModal, setShowAddModal,
    editingJob, setEditingJob,
    runConfirmJob, setRunConfirmJob, confirmRunNow, executeRunNow,
    showRunAll, setShowRunAll, runAllProgress, executeRunAll,
    handleAddJob, handleEditJob, handleDuplicate, handleDelete,
  } = useBackupActivities();

  return (
    <div className="w-full max-w-[1600px] mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-2">
          <LayoutDashboard size={12} />
          <span>Dashboard</span>
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
              <p className="text-xs text-slate-500 font-medium mt-0.5">Monitor and manage all server backup jobs · IT Department</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 h-9 px-4 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
              <Plus size={14} /> Add Backup Job
            </button>
            <button onClick={() => setShowRunAll(true)} className="flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
              <RefreshCw size={14} /> Run All
            </button>
            <button className="flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
              <Download size={14} /> Export
            </button>
          </div>
        </div>

        {runAllProgress !== null && (
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-3">
            <RefreshCw size={14} className="text-blue-600 animate-spin shrink-0" style={{ animationDuration: "1.5s" }} />
            <div className="flex-1">
              <div className="flex justify-between text-xs font-semibold text-blue-700 mb-1">
                <span>Running all backup jobs sequentially…</span>
                <span>{runAllProgress}%</span>
              </div>
              <div className="w-full bg-blue-100 rounded-full h-1.5">
                <div className="h-1.5 rounded-full bg-blue-500 transition-all duration-500" style={{ width: `${runAllProgress}%` }} />
              </div>
            </div>
          </div>
        )}

        {/* Sub-tabs */}
        <div className="mt-5 flex items-center gap-1 border-b border-slate-200">
          {BKP_SUB_TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setSubTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors -mb-px ${
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

      {/* Tab content */}
      {subTab === "dashboard"  && <BackupDashboard jobs={jobs} onViewJob={openJob} />}
      {subTab === "jobs"       && (
        <BackupJobsTable
          jobs={jobs} onViewJob={openJob}
          onEdit={j => setEditingJob(j)}
          onRunNow={confirmRunNow}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
        />
      )}
      {subTab === "calendar"   && <BackupCalendarView jobs={jobs} />}

      {/* Drawer */}
      {showDrawer && selectedJob && (
        <BackupJobDrawer
          job={selectedJob} onClose={closeDrawer}
          onEdit={() => { setEditingJob(selectedJob); closeDrawer(); }}
          onRunNow={() => confirmRunNow(selectedJob)}
        />
      )}

      {showAddModal && <BackupJobModal mode="add" onSave={handleAddJob} onCancel={() => setShowAddModal(false)} />}
      {editingJob   && <BackupJobModal mode="edit" initial={editingJob} onSave={handleEditJob} onCancel={() => setEditingJob(null)} />}
      {runConfirmJob && <RunConfirmDialog job={runConfirmJob} onConfirm={executeRunNow} onCancel={() => setRunConfirmJob(null)} />}
      {showRunAll    && <RunAllConfirmDialog jobCount={jobs.length} onConfirm={executeRunAll} onCancel={() => setShowRunAll(false)} />}
    </div>
  );
}
