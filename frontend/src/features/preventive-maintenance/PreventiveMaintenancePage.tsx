// ─────────────────────────────────────────────────────────────────────────────
// PreventiveMaintenancePage
// Refactored into a modular feature structure. Behavior, styling and Tailwind
// classes are unchanged from the original monolithic version.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";

import { usePreventiveMaintenance } from "./hooks/usePreventiveMaintenance";

import { PMToolbar } from "./components/PMToolbar";
import { PMFilters } from "./components/PMFilters";
import { KPISection } from "./components/KPISection";
import { LoadingSkeleton } from "./components/LoadingSkeleton";
import { EmptyState } from "./components/EmptyState";
import { PMTableView } from "./components/PMTableView";
import { PMCardView } from "./components/PMCardView";
import { PMCalendarView } from "./components/PMCalendarView";
import { MaintenanceTimeline } from "./components/MaintenanceTimeline";
import { AddPMModal } from "./components/AddPMModal";
import { MachineDrawer } from "./components/MachineDrawer";
import { CompleteDialog } from "./components/CompleteDialog";
import { SnoozeDialog } from "./components/SnoozeDialog";
import { DeleteDialog } from "./components/DeleteDialog";
import { PriorityBadge } from "./components/PriorityBadge";

// Re-exported for backward compatibility — other modules may still import
// these badges, the legacy PM_DATA constant, or PM types from this file path.
export { StatusBadge } from "./components/StatusBadge";
export { PriorityBadge } from "./components/PriorityBadge";
export { PM_DATA } from "./constants/pmConstants";
export type { PMRecord, PMPriority, PMStatus } from "./types/pm";

export default function PreventiveMaintenancePage() {
  const pm = usePreventiveMaintenance();

  return (
    <div className="w-full max-w-[1600px] mx-auto animate-in fade-in duration-300">

      {/* ── HEADER / TOOLBAR ── */}
      <PMToolbar
        viewMode={pm.viewMode}
        onViewModeChange={pm.setViewMode}
        onAddClick={() => pm.setShowAddModal(true)}
        showHistory={pm.showHistory}
        onToggleHistory={pm.handleToggleHistory}
        completedCount={pm.completedPMs.length}
      />

      {/* ── SEARCH + FILTERS ── */}
      <PMFilters
        searchQuery={pm.searchQuery}
        onSearchQueryChange={pm.setSearchQuery}
        quickFilter={pm.quickFilter}
        onQuickFilterChange={pm.setQuickFilter}
        pmRecords={pm.pmRecords}
        showFilters={pm.showFilters}
        onToggleFilters={() => pm.setShowFilters(!pm.showFilters)}
        filters={pm.filters}
        onFiltersChange={pm.setFilters}
        departments={pm.departments}
      />

      {/* ── KPI CARDS ── */}
      {!pm.isLoading && <KPISection kpis={pm.kpis} />}

      {/* ── LOADING ── */}
      {pm.isLoading && <LoadingSkeleton />}

      {/* ── HISTORY VIEW ── */}
      {!pm.isLoading && pm.showHistory && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-700">Audit Trail / Completed PM History</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {pm.completedPMs.length} completed maintenance record(s)
            </p>
          </div>
          {pm.completedPMs.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-xs text-slate-400 font-medium">No completed PM records yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-slate-50/70 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">Machine</th>
                    <th className="px-4 py-3">Completion Date</th>
                    <th className="px-4 py-3">Completion Time</th>
                    <th className="px-4 py-3">Previous Last Maintenance</th>
                    <th className="px-4 py-3">Previous Due Date</th>
                    <th className="px-4 py-3">Frequency</th>
                    <th className="px-4 py-3">Assigned User</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {pm.completedPMs.map(record => {
                    const latestHistory = record.history && record.history.length > 0 ? record.history[0] : null;
                    return (
                      <tr key={record.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="text-xs font-bold text-slate-900">{record.machine}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{record.machineId}</div>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-emerald-600 font-semibold">
                          {record.completionDate || "\u2014"}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-500">
                          {latestHistory?.completionTime || "\u2014"}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-500">
                          {latestHistory?.previousMaintenanceDate || record.lastMaintenance || "\u2014"}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-500">
                          {latestHistory?.previousDueDate || record.nextDue || "\u2014"}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md font-medium">
                            {record.frequency}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[9px] font-bold shrink-0">
                              {record.user.split(" ").map(n => n[0]).join("")}
                            </div>
                            <span className="text-xs text-slate-600 font-medium">{record.user}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <PriorityBadge priority={record.priority} />
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-500 max-w-[200px]">
                          {latestHistory?.notes ? (
                            <span className="truncate block" title={latestHistory.notes}>
                              {latestHistory.notes}
                            </span>
                          ) : (
                            "\u2014"
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── ACTIVE VIEW ── */}
      {!pm.isLoading && !pm.showHistory && (
        <>
          {pm.viewMode === "table" && (
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
              <div className="xl:col-span-3">
                <PMTableView
                  filteredData={pm.filteredData}
                  pagedData={pm.pagedData}
                  currentPage={pm.currentPage}
                  totalPages={pm.totalPages}
                  onPageChange={pm.setCurrentPage}
                  sortField={pm.sortField}
                  sortDir={pm.sortDir}
                  onSort={pm.handleSort}
                  onRowClick={r => { pm.setSelectedRecord(r); pm.setShowDrawer(true); }}
                  onView={r => { pm.setSelectedRecord(r); pm.setShowDrawer(true); }}
                  onEdit={r => { pm.setSelectedRecord(r); pm.setShowEditModal(true); }}
                  onDuplicate={pm.handleDuplicate}
                  onComplete={r => { pm.setSelectedRecord(r); pm.setShowCompleteDialog(true); }}
                  onSnooze={r => { pm.setSelectedRecord(r); pm.setShowSnoozeDialog(true); }}
                  onDelete={r => { pm.setSelectedRecord(r); pm.setShowDeleteDialog(true); }}
                  onAdd={() => pm.setShowAddModal(true)}
                  onResetFilters={() => {
                    pm.setSearchQuery("");
                    pm.setQuickFilter("All");
                    pm.setFilters({ department: "", frequency: "", priority: "", status: "", dateFrom: "", dateTo: "" });
                  }}
                />
              </div>
              <div className="xl:col-span-1">
                <MaintenanceTimeline data={pm.filteredData} />
              </div>
            </div>
          )}

          {pm.viewMode === "card" && (
            <div>
              {pm.filteredData.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
                  <EmptyState onAdd={() => pm.setShowAddModal(true)} />
                </div>
              ) : (
                <PMCardView
                  data={pm.filteredData}
                  onViewDetails={r => { pm.setSelectedRecord(r); pm.setShowDrawer(true); }}
                  onComplete={r => { pm.setSelectedRecord(r); pm.setShowCompleteDialog(true); }}
                  onSnooze={r => { pm.setSelectedRecord(r); pm.setShowSnoozeDialog(true); }}
                />
              )}
            </div>
          )}

          {pm.viewMode === "calendar" && (
            <PMCalendarView data={pm.filteredData} />
          )}
        </>
      )}

      {/* ── MODALS & OVERLAYS ── */}
      {pm.showAddModal && (
        <AddPMModal
          onClose={() => pm.setShowAddModal(false)}
          onSave={pm.handleAddPM}
          departments={pm.departments}
          users={pm.users}
          eligibleSystems={pm.eligibleSystems}
          existingRecords={pm.pmRecords}
        />
      )}
      {pm.showEditModal && pm.selectedRecord && (
        <AddPMModal
          onClose={() => { pm.setShowEditModal(false); pm.setSelectedRecord(null); }}
          onSave={pm.handleEditPM}
          editRecord={pm.selectedRecord}
          departments={pm.departments}
          users={pm.users}
          eligibleSystems={pm.eligibleSystems}
          existingRecords={pm.pmRecords}
        />
      )}
      {pm.showDrawer && pm.selectedRecord && (
        <MachineDrawer
          record={pm.selectedRecord}
          onClose={() => pm.setShowDrawer(false)}
          onEdit={(r) => { pm.setShowDrawer(false); pm.setSelectedRecord(r); pm.setShowEditModal(true); }}
          onComplete={(r) => { pm.setSelectedRecord(r); pm.setShowCompleteDialog(true); }}
          onSnooze={(r) => { pm.setSelectedRecord(r); pm.setShowSnoozeDialog(true); }}
        />
      )}
      {pm.showCompleteDialog && pm.selectedRecord && (
        <CompleteDialog
          record={pm.selectedRecord}
          onClose={() => { pm.setShowCompleteDialog(false); pm.setSelectedRecord(null); }}
          onConfirm={pm.handleCompletePM}
        />
      )}
      {pm.showSnoozeDialog && pm.selectedRecord && (
        <SnoozeDialog
          record={pm.selectedRecord}
          onClose={() => { pm.setShowSnoozeDialog(false); pm.setSelectedRecord(null); }}
          onSnooze={pm.handleSnoozePM}
        />
      )}
      {pm.showDeleteDialog && pm.selectedRecord && (
        <DeleteDialog
          record={pm.selectedRecord}
          onClose={() => { pm.setShowDeleteDialog(false); pm.setSelectedRecord(null); }}
          onConfirm={() => pm.handleDeletePM(pm.selectedRecord!)}
        />
      )}
    </div>
  );
}
