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

import { useState, useEffect, useCallback, useMemo } from "react";
import type { SystemInventory } from "../types/system";
import type { SystemInspectionRecord } from "../types/inspection";
import {
  getSystems,
  createSystem,
  updateSystem,
  deleteSystem as deleteSystemService,
} from "../services/systemInventoryService";
import {
  getActiveInspections,
  getCompletedInspections,
  createInspection,
  updateInspection,
  deleteActiveInspectionsForSystem,
  completeInspection,
  replaceSystemInspections,
} from "../services/systemInspectionService";
import {
  buildInitialInspectionForSystem,
  syncInspectionWithSystem,
  getInspectionStatus,
} from "../utils/inspectionHelpers";
import { calculateNextDueDate, calculateReminderDate } from "../../shared/utils/recurringWorkflow";
import { checkAndGenerateDueInspectionReminders } from "../utils/inspectionReminderUtils";
import { clearRemindersForInspection, buildRecurringInspection } from "../utils/inspectionReminderUtils";

export function useSystemInventory() {
  const [systems, setSystems] = useState<SystemInventory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inspections, setInspections] = useState<SystemInspectionRecord[]>([]);
  const [completedInspections, setCompletedInspections] = useState<SystemInspectionRecord[]>([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSystem, setEditingSystem] = useState<SystemInventory | null>(null);
  const [viewingSystem, setViewingSystem] = useState<SystemInventory | null>(null);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [deletingSystem, setDeletingSystem] = useState<SystemInventory | null>(null);

  // Backend-ready: seeded from the service layer (empty by default).
  // TODO: GET /api/system-inventory — fetch and setSystems(data) on mount.
  useEffect(() => {
    let cancelled = false;

    async function loadPage() {
      setIsLoading(true);
      try {
        const res = await getSystems();
        if (cancelled) return;

        const systemsData = res.data ?? [];
        setSystems(systemsData);

        const activeInspections = getActiveInspections();
        const completed = getCompletedInspections();

        const loadedActive: SystemInspectionRecord[] = [];
        for (const system of systemsData) {
          const existing = activeInspections.find((inspection) => inspection.systemId === system.systemId);
          if (existing) {
            const synced = syncInspectionWithSystem(system, existing);
            if (JSON.stringify(synced) !== JSON.stringify(existing)) {
              updateInspection(synced);
            }
            loadedActive.push(synced);
          } else {
            const newInspection = buildInitialInspectionForSystem(system);
            createInspection(newInspection);
            loadedActive.push(newInspection);
          }
        }

        setInspections(loadedActive);
        setCompletedInspections(completed);
        // Ensure persisted active inspections are deduplicated and match our loaded active list
        try {
          for (const inspection of loadedActive) {
            replaceSystemInspections(inspection.systemId, [inspection]);
          }
        } catch (err) {
          // noop
        }
        if (!cancelled) {
          checkAndGenerateDueInspectionReminders(loadedActive);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadPage();
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

  const openCompleteDialog = useCallback(() => {
    setShowCompleteDialog(true);
  }, []);

  const closeCompleteDialog = useCallback(() => {
    setShowCompleteDialog(false);
  }, []);

  const openDeleteDialog = useCallback((system: SystemInventory) => {
    setDeletingSystem(system);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setDeletingSystem(null);
  }, []);

  const inspectionKpis = useMemo(() => ({
    total: inspections.length,
    dueToday: inspections.filter((inspection) => inspection.status === "Due Today").length,
    upcoming: inspections.filter((inspection) => inspection.status === "Upcoming").length,
    completed: completedInspections.length,
    overdue: inspections.filter((inspection) => inspection.status === "Overdue").length,
  }), [inspections, completedInspections]);

  const handleSave = useCallback(
    async (record: SystemInventory) => {
      // Persist via the service layer. Later this becomes a real
      // Supabase insert/update — the call sites here don't need to change.
      if (editingSystem) {
        const res = await updateSystem(editingSystem.systemId, record);
        if (res.data) {
          setSystems(prev => prev.map(s => (s.systemId === editingSystem.systemId ? res.data! : s)));

          const existingInspection = inspections.find((inspection) => inspection.systemId === editingSystem.systemId);
          if (existingInspection) {
            // Detect whether inspection settings were changed on the system record
            const prevSettings = editingSystem?.inspectionSettings ? JSON.stringify(editingSystem.inspectionSettings) : undefined;
            const nextSettings = res.data.inspectionSettings ? JSON.stringify(res.data.inspectionSettings) : undefined;
            if (prevSettings !== nextSettings && res.data.inspectionSettings) {
              // Regenerate active inspection using the new settings while preserving completed history
              const freq = res.data.inspectionSettings.frequency;
              const orig = res.data.inspectionSettings.lastInspection ?? existingInspection.originalDueDate;
              const nextDue = res.data.inspectionSettings.nextInspection ?? (calculateNextDueDate(orig, freq) || existingInspection.nextDueDate);
              const reminder = res.data.inspectionSettings.reminder;
              const reminderDate = calculateReminderDate(nextDue, reminder);

              const updatedInspection: SystemInspectionRecord = {
                ...existingInspection,
                systemName: res.data.systemName,
                systemType: res.data.systemType,
                systemCategory: res.data.systemCategory,
                department: res.data.department,
                location: res.data.location,
                assignedUser: res.data.assignedUser,
                frequency: freq,
                originalDueDate: orig,
                nextDueDate: nextDue,
                scheduledNextDue: nextDue,
                reminder: reminder,
                reminderDate,
                priority: res.data.inspectionSettings.priority,
                status: getInspectionStatus(nextDue, existingInspection.status),
              };

              const saved = updateInspection(updatedInspection);
              setInspections(prev => prev.map((inspection) => (inspection.id === saved.id ? saved : inspection)));
              // Re-evaluate reminders/notifications for the updated inspection
              try { checkAndGenerateDueInspectionReminders([saved]); } catch {}
            } else {
              const synced = syncInspectionWithSystem(res.data, {
                ...existingInspection,
                systemId: res.data.systemId,
              });
              const saved = updateInspection(synced);
              setInspections(prev => prev.map((inspection) => (inspection.id === saved.id ? saved : inspection)));
              try { checkAndGenerateDueInspectionReminders([saved]); } catch {}
            }
          } else {
            const newInspection = buildInitialInspectionForSystem(res.data);
            createInspection(newInspection);
            setInspections(prev => [newInspection, ...prev]);
          }
        }
      } else {
        const res = await createSystem(record);
        if (res.data) {
          setSystems(prev => [res.data!, ...prev]);
          const newInspection = buildInitialInspectionForSystem(res.data);
          createInspection(newInspection);
          setInspections(prev => [newInspection, ...prev]);
          try { checkAndGenerateDueInspectionReminders([newInspection]); } catch {}
        }
      }
      setEditingSystem(null);
    },
      [editingSystem, inspections]
  );

    type CompleteValues = {
      inspectionDate: string;
      inspectionTime: string;
      completedBy: string;
      verifiedBy?: string;
      verificationStatus?: string;
      observations?: string;
      correctiveActions?: string;
      completionNotes?: string;
      remarks?: string;
    };

    const handleCompleteInspection = useCallback((values: CompleteValues) => {
      if (!viewingSystem) return;
      // Find active inspection for this system
      const active = inspections.find(i => i.systemId === viewingSystem.systemId);
      if (!active) return;

      // Prevent duplicate next generation: mirror Backup duplicate detection
      const recurrenceKey = active.recurrenceId;
      const existingNext = recurrenceKey
        ? inspections.some((candidate) => candidate.id !== active.id && candidate.recurrenceId === recurrenceKey && candidate.status !== "Completed")
        : inspections.some((candidate) => candidate.id !== active.id && candidate.systemId === active.systemId && candidate.status !== "Completed");
      if (existingNext) {
        return; // duplicate exists
      }

      try {
        // Clear any pending reminder notifications for the active inspection
        try { clearRemindersForInspection(active.id); } catch {}

        // Use the actual completion date/time for next-cycle calculations (do not reuse previous due)
        const completedDate = values.inspectionDate || new Date().toISOString().split("T")[0];
        const completedTime = values.inspectionTime || new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

        const completed: SystemInspectionRecord = {
          ...active,
          status: "Completed",
          completionDate: completedDate,
          completionTime: completedTime,
          completedBy: values.completedBy,
          verifiedBy: values.verifiedBy,
          completionNotes: values.completionNotes,
          observations: values.observations,
          correctiveActions: values.correctiveActions,
          remarks: values.remarks,
          history: [
            {
              inspectionId: active.id,
              recurrenceId: active.recurrenceId,
              date: completedDate,
              time: completedTime,
              completedBy: values.completedBy,
              verifiedBy: values.verifiedBy,
              verificationStatus: values.verificationStatus,
              observations: values.observations,
              correctiveActions: values.correctiveActions,
              remarks: values.remarks,
              completionNotes: values.completionNotes,
              previousDueDate: active.nextDueDate || active.originalDueDate,
              nextScheduledDue: undefined,
              frequency: active.frequency,
              priority: active.priority,
              status: "Completed",
            },
            ...active.history,
          ],
        };

        // Determine recurrence and next inspection using completion date
        const shouldRecur = !!active.frequency && active.frequency !== "One Time";
        let newInspection: SystemInspectionRecord | null = null;
        if (shouldRecur && active.frequency) {
          const completedCycleDueDate = completedDate; // IMPORTANT: calculate from completion date
          const nextDue = calculateNextDueDate(completedCycleDueDate, active.frequency) || "";
          const reminderDate = calculateReminderDate(nextDue, active.reminder);
          // build next inspection record
          newInspection = buildRecurringInspection(active, completedDate, nextDue, reminderDate, `insp-${Date.now()}-${Math.random().toString(36).slice(2,8)}`);
        }

        // Persist to UI state
        setInspections(prev => {
          const without = prev.filter(i => i.id !== active.id);
          const next = newInspection ? [newInspection, ...without] : without;
          return next;
        });

        // Add to completed list (immutable history)
        setCompletedInspections(prev => [completed, ...prev]);

        // Persist to storage via service layer
        completeInspection(completed);
        if (newInspection) createInspection(newInspection);

        // regenerate reminders/notifications for next inspection
        if (newInspection) try { checkAndGenerateDueInspectionReminders([newInspection]); } catch {}
      } catch (err) {
        // noop for now
      }
    }, [viewingSystem, inspections]);

  const handleDelete = useCallback(async (system: SystemInventory) => {
    // TODO: DELETE /api/system-inventory/:id
    await deleteSystemService(system.systemId);
    setSystems(prev => prev.filter(s => s.systemId !== system.systemId));
    setInspections(prev => prev.filter((inspection) => inspection.systemId !== system.systemId));
    deleteActiveInspectionsForSystem(system.systemId);
    setDeletingSystem(null);
    setViewingSystem(null);
  }, []);

  return {
    // list state
    systems,
    isLoading,
    inspectionKpis,
    completedInspections,

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
    // complete dialog
    showCompleteDialog,
    openCompleteDialog,
    closeCompleteDialog,
    handleCompleteInspection,

    // delete dialog
    deletingSystem,
    openDeleteDialog,
    closeDeleteDialog,

    // actions
    handleSave,
    handleDelete,
  };
}
