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

      {/* ── MAIN CONTENT ── */}
      {!pm.isLoading && (
        <>
          {pm.viewMode === "table" && (
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
              {/* TABLE */}
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
                />
              </div>

              {/* TIMELINE SIDEBAR */}
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
