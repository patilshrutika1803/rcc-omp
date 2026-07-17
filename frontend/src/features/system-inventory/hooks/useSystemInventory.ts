// ─────────────────────────────────────────────────────────────────────────────
// useSystemInventory
//
// Owns all page-level state for the System Inventory module:
//   - systems list + loading state
//   - Add/Edit modal state
//   - Details drawer state
//   - Delete dialog state
//   - CRUD orchestration (delegates actual I/O to systemInventoryService)
//
// Search / filter / pagination remain local to SystemInventoryTable, exactly
// as in the original monolith, since they are presentation-scoped concerns
// of the table and were never part of the page's own state.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import type { SystemInventory } from "../types/system";
import {
  getSystems,
  createSystem,
  updateSystem,
  deleteSystem as deleteSystemService,
} from "../services/systemInventoryService";

export function useSystemInventory() {
  const [systems, setSystems] = useState<SystemInventory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSystem, setEditingSystem] = useState<SystemInventory | null>(null);
  const [viewingSystem, setViewingSystem] = useState<SystemInventory | null>(null);
  const [deletingSystem, setDeletingSystem] = useState<SystemInventory | null>(null);

  // Backend-ready: seeded from the service layer (empty by default).
  // TODO: GET /api/system-inventory — fetch and setSystems(data) on mount.
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    getSystems().then(res => {
      if (!cancelled && res.data) setSystems(res.data);
      if (!cancelled) setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const openAddModal = useCallback(() => {
    setEditingSystem(null);
    setShowAddModal(true);
  }, []);

  const openEditModal = useCallback((system: SystemInventory) => {
    setEditingSystem(system);
    setShowAddModal(true);
  }, []);

  const closeAddModal = useCallback(() => {
    setShowAddModal(false);
    setEditingSystem(null);
  }, []);

  const openDrawer = useCallback((system: SystemInventory) => {
    setViewingSystem(system);
  }, []);

  const closeDrawer = useCallback(() => {
    setViewingSystem(null);
  }, []);

  const editFromDrawer = useCallback(() => {
    if (!viewingSystem) return;
    setEditingSystem(viewingSystem);
    setViewingSystem(null);
    setShowAddModal(true);
  }, [viewingSystem]);

  const openDeleteDialog = useCallback((system: SystemInventory) => {
    setDeletingSystem(system);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setDeletingSystem(null);
  }, []);

  const handleSave = useCallback(
    async (record: SystemInventory) => {
      // Persist via the service layer. Later this becomes a real
      // Supabase insert/update — the call sites here don't need to change.
      if (editingSystem) {
        const res = await updateSystem(editingSystem.systemId, record);
        if (res.data) {
          setSystems(prev => prev.map(s => (s.systemId === editingSystem.systemId ? res.data! : s)));
        }
      } else {
        const res = await createSystem(record);
        if (res.data) {
          setSystems(prev => [res.data!, ...prev]);
        }
      }
      setEditingSystem(null);
    },
    [editingSystem]
  );

  const handleDelete = useCallback(async (system: SystemInventory) => {
    // TODO: DELETE /api/system-inventory/:id
    await deleteSystemService(system.systemId);
    setSystems(prev => prev.filter(s => s.systemId !== system.systemId));
    setDeletingSystem(null);
    setViewingSystem(null);
  }, []);

  return {
    // list state
    systems,
    isLoading,

    // add/edit modal
    showAddModal,
    editingSystem,
    openAddModal,
    openEditModal,
    closeAddModal,

    // details drawer
    viewingSystem,
    openDrawer,
    closeDrawer,
    editFromDrawer,

    // delete dialog
    deletingSystem,
    openDeleteDialog,
    closeDeleteDialog,

    // actions
    handleSave,
    handleDelete,
  };
}
