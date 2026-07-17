// ─────────────────────────────────────────────────────────────────────────────
// SystemInventoryPage
// Renamed & refactored from the original "Machines" module (RCC OMP).
// This module is a pure Asset Inventory Management System — it is NOT an IoT
// monitoring dashboard. All health/monitoring/analytics widgets have been
// removed. Styling and Tailwind design language are unchanged from the
// original module.
//
// Backend-ready: no demo/mock data. Systems are seeded from
// systemInventoryService (empty by default) and are intended to be
// populated from the backend via that service layer.
//
// This page is intentionally thin: all state and CRUD orchestration live in
// useSystemInventory(); all backend I/O goes through systemInventoryService.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { LayoutDashboard, Server, ChevronRight, Plus, Download } from "lucide-react";

import { useSystemInventory } from "./hooks/useSystemInventory";
import { DEPARTMENTS } from "./constants/systemConstants";

import { SystemInventoryTable } from "./components/SystemInventoryTable";
import { AddSystemModal } from "./components/AddSystemModal";
import { SystemDetailsDrawer } from "./components/SystemDetailsDrawer";
import { DeleteConfirmDialog } from "./components/DeleteConfirmDialog";

export default function SystemInventoryPage() {
  const {
    systems,
    showAddModal,
    editingSystem,
    openAddModal,
    closeAddModal,
    openEditModal,
    viewingSystem,
    openDrawer,
    closeDrawer,
    editFromDrawer,
    deletingSystem,
    openDeleteDialog,
    closeDeleteDialog,
    handleSave,
    handleDelete,
  } = useSystemInventory();

  return (
    <div className="w-full max-w-[1600px] mx-auto animate-in fade-in duration-300">
      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-2">
          <LayoutDashboard size={12} />
          <span>Dashboard</span>
          <ChevronRight size={12} />
          <span className="text-slate-700 font-semibold">System Inventory</span>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm shadow-blue-200">
              <Server size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">System Inventory</h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Manage laptops, desktop PCs and printers across the organization · {systems.length} system{systems.length !== 1 ? "s" : ""} registered
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
              <Download size={13} /> Export
            </button>
            <button onClick={openAddModal}
              className="flex items-center gap-1.5 h-9 px-4 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
              <Plus size={14} /> Add System
            </button>
          </div>
        </div>
      </div>

      <SystemInventoryTable
        systems={systems}
        onView={openDrawer}
        onEdit={openEditModal}
        onDelete={openDeleteDialog}
      />

      {/* ── MODALS & OVERLAYS ── */}
      {showAddModal && (
        <AddSystemModal
          onClose={closeAddModal}
          onSave={handleSave}
          editRecord={editingSystem ?? undefined}
          departments={DEPARTMENTS}
        />
      )}
      {viewingSystem && (
        <SystemDetailsDrawer
          system={viewingSystem}
          onClose={closeDrawer}
          onEdit={editFromDrawer}
        />
      )}
      {deletingSystem && (
        <DeleteConfirmDialog
          system={deletingSystem}
          onClose={closeDeleteDialog}
          onConfirm={() => handleDelete(deletingSystem)}
        />
      )}
    </div>
  );
}
