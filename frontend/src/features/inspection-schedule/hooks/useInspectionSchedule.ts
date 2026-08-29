import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SystemInventory } from "../../system-inventory/types/system";
import { getSystems } from "../../system-inventory/services/systemInventoryService";
import {
  completeInspection,
  createInspection,
  deleteActiveInspection,
  getActiveInspections,
  getCompletedInspections,
  isInspectionDeleted,
  updateInspection,
  undoInspectionCompletion,
} from "../services/inspectionScheduleService";
import type {
  InspectionScheduleRecord,
  InspectionStatus,
  InspectionTargetType,
  InspectionPriority,
} from "../types/inspectionSchedule";
import {
  buildCompletionHistoryEntry,
  buildNextRecurringInspection,
  buildSystemInspectionRecord,
  getFrequencyForCategory,
  getInspectionStatus,
  isCompletionDateValid,
  syncSystemInspectionWithSystem,
  combineDateTime,
} from "../utils/inspectionScheduleUtils";
import { addNotification, removeInspectionNotifications } from "../../notificataions/utils/notificationStorage";
import { isDueDateTimeReached } from "../../shared/utils/recurringWorkflow";
import type { InspectionHistoryEntry } from "../types/inspectionSchedule";
import { toast } from "sonner";

export function useInspectionSchedule() {
  const [systems, setSystems] = useState<SystemInventory[]>([]);
  const [activeInspections, setActiveInspections] = useState<InspectionScheduleRecord[]>([]);
  const [completedInspections, setCompletedInspections] = useState<InspectionScheduleRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTarget, setFilterTarget] = useState<"All" | InspectionTargetType>("All");
  const [filterCategory, setFilterCategory] = useState<"All" | string>("All");
  const [filterStatus, setFilterStatus] = useState<"All" | InspectionStatus>("All");
  const [filterPriority, setFilterPriority] = useState<"All" | InspectionPriority>("All");
  const [filterDepartment, setFilterDepartment] = useState<string>("All");
  const [showHistory, setShowHistory] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingInspection, setEditingInspection] = useState<InspectionScheduleRecord | null>(null);
  const [selectedInspection, setSelectedInspection] = useState<InspectionScheduleRecord | null>(null);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const completionClaims = useRef<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      const systemsResult = await getSystems();
      const loadedSystems = systemsResult.data ?? [];
      const persistedActive = getActiveInspections();
      const persistedCompleted = getCompletedInspections();

      const merged: InspectionScheduleRecord[] = [];
      const activeBySystemId = new Map<string, InspectionScheduleRecord>();

      for (const inspection of persistedActive.filter((item) => item.targetType === "System")) {
        if (inspection.systemId) {
          activeBySystemId.set(inspection.systemId, inspection);
        }
      }

      for (const system of loadedSystems) {
        const existing = activeBySystemId.get(system.systemId);
        if (existing) {
          const synced = syncSystemInspectionWithSystem(existing, system);
          merged.push(synced);
          if (JSON.stringify(synced) !== JSON.stringify(existing)) {
            updateInspection(synced);
          }
        } else if (!isInspectionDeleted(buildSystemInspectionRecord(system))) {
          const newInspection = buildSystemInspectionRecord(system);
          createInspection(newInspection);
          merged.push(newInspection);
        }
      }

      const orphaned = persistedActive.filter((inspection) => inspection.targetType === "Machine" || (inspection.targetType === "System" && !loadedSystems.some((system) => system.systemId === inspection.systemId)));
      merged.push(...orphaned);

      setSystems(loadedSystems);
      setActiveInspections(merged);
      setCompletedInspections(persistedCompleted);
      if (!cancelled) {
        setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredActiveInspections = useMemo(() => {
    return activeInspections.filter((inspection) => {
      if (filterTarget !== "All" && inspection.targetType !== filterTarget) return false;
      if (filterCategory !== "All" && inspection.category !== filterCategory) return false;
      if (filterStatus !== "All" && inspection.status !== filterStatus) return false;
      if (filterPriority !== "All" && inspection.priority !== filterPriority) return false;
      if (filterDepartment !== "All" && inspection.department !== filterDepartment) return false;
      const query = searchQuery.trim().toLowerCase();
      if (!query) return true;
      const targetName = inspection.targetType === "System" ? inspection.systemSnapshot?.systemName ?? "" : inspection.machineName ?? "";
      return (
        targetName.toLowerCase().includes(query) ||
        inspection.systemId?.toLowerCase().includes(query) ||
        inspection.machineId?.toLowerCase().includes(query) ||
        inspection.department.toLowerCase().includes(query) ||
        inspection.assignedUser.toLowerCase().includes(query)
      );
    });
  }, [activeInspections, filterTarget, filterCategory, filterStatus, filterPriority, filterDepartment, searchQuery]);

  const departmentOptions = useMemo(() => {
    const departments = new Set<string>();
    for (const system of systems) {
      if (system.department) departments.add(system.department);
    }
    for (const inspection of activeInspections) {
      if (inspection.department) departments.add(inspection.department);
    }
    return ["All", ...Array.from(departments).sort()];
  }, [systems, activeInspections]);

  const kpis = useMemo(() => ({
    total: activeInspections.length,
    dueToday: activeInspections.filter((inspection) => inspection.status === "Due Today").length,
    upcoming: activeInspections.filter((inspection) => inspection.status === "Upcoming").length,
    completed: completedInspections.length,
    overdue: activeInspections.filter((inspection) => inspection.status === "Overdue").length,
  }), [activeInspections, completedInspections]);

  const openAddModal = useCallback(() => {
    setEditingInspection(null);
    setShowAddModal(true);
  }, []);

  const openEditModal = useCallback((inspection: InspectionScheduleRecord) => {
    setEditingInspection(inspection);
    setShowAddModal(true);
  }, []);

  const closeAddModal = useCallback(() => {
    setShowAddModal(false);
    setEditingInspection(null);
  }, []);

  const openDetails = useCallback((inspection: InspectionScheduleRecord) => {
    setSelectedInspection(inspection);
  }, []);

  const closeDetails = useCallback(() => {
    setSelectedInspection(null);
  }, []);

  const openCompleteDialog = useCallback((inspection: InspectionScheduleRecord) => {
    setSelectedInspection(inspection);
    setShowCompleteDialog(true);
  }, []);

  const closeCompleteDialog = useCallback(() => {
    setShowCompleteDialog(false);
  }, []);

  const upsertInspection = useCallback(
    (record: InspectionScheduleRecord) => {
      const existing = activeInspections.find((item) => item.id === record.id);
      if (existing) {
        updateInspection(record);
        setActiveInspections((prev) => prev.map((item) => (item.id === record.id ? record : item)));
        setSelectedInspection((current) => (current?.id === record.id ? record : current));
        return;
      }
      const created = createInspection(record);
      setActiveInspections((prev) => [created, ...prev]);
    },
    [activeInspections]
  );

  const handleSaveInspection = useCallback(
    (record: InspectionScheduleRecord) => {
      if (record.targetType === "System") {
        const system = systems.find((item) => item.systemId === record.systemId);
        if (system) {
          // Update category based on system, but preserve user-selected frequency
          record.category = system.systemCategory === "GxP" ? "GxP" : "Non-GxP";
          // DO NOT override frequency - use the user's selected frequency
        }
      }
      record.status = getInspectionStatus(record.dueDate, record.dueTime, record.status === "Completed");
      record.reminderDate = record.dueDate;
      record.reminderTime = record.dueTime;
      record.updatedAt = new Date().toISOString();
      upsertInspection(record);
    },
    [systems, upsertInspection]
  );

  const handleCompleteInspection = useCallback(
    (values: { completedBy: string; completionDate: string; completionTime: string; completionNotes?: string }) => {
      if (!selectedInspection) return;
      const inspectionId = selectedInspection.id;
      if (completionClaims.current.has(inspectionId)) {
        toast.info("Inspection completion is already being processed.");
        return;
      }
      completionClaims.current.add(inspectionId);

      try {
        if (selectedInspection.status === "Completed" || getActiveInspections().some((item) => item.id === inspectionId && item.status === "Completed")) {
          toast.info("Inspection is already completed.");
          return;
        }

        if (!isDueDateTimeReached(selectedInspection.dueDate, selectedInspection.dueTime)) {
          toast.error("Cannot complete before the scheduled due date and time.");
          return;
        }

        if (!isCompletionDateValid(values.completionDate, selectedInspection.dueDate)) {
          toast.error(`Completion date cannot be before the inspection's due date (${selectedInspection.dueDate}).`);
          return;
        }

        const due = combineDateTime(selectedInspection.dueDate, selectedInspection.dueTime);
        const completion = combineDateTime(values.completionDate, values.completionTime);
        if (!due || !completion || completion.getTime() < due.getTime()) {
          toast.error("Cannot complete before the scheduled due date and time.");
          return;
        }

        const existingGenerated = getActiveInspections().some(
          (item) =>
            item.id !== inspectionId &&
            (item.parentId === inspectionId || (item.recurrenceId === selectedInspection.recurrenceId && item.status !== "Completed"))
        );

        if (existingGenerated) {
          toast.info("This inspection already has a generated recurring cycle.");
          return;
        }

        const now = new Date().toISOString();
        const historyEntry = buildCompletionHistoryEntry(
          selectedInspection,
          values.completedBy,
          values.completionDate,
          values.completionTime,
          values.completionNotes
        );
        const completedRecord: InspectionScheduleRecord = {
          ...selectedInspection,
          status: "Completed",
          completionDate: values.completionDate,
          completionTime: values.completionTime,
          completedBy: values.completedBy,
          completionNotes: values.completionNotes,
          updatedAt: now,
          history: [historyEntry, ...(selectedInspection.history ?? [])],
        };

        const wasCompleted = completeInspection(completedRecord);
        if (!wasCompleted) {
          setActiveInspections((prev) => prev.filter((item) => item.id !== completedRecord.id));
          setShowCompleteDialog(false);
          setSelectedInspection(null);
          return;
        }

        setCompletedInspections((prev) => [completedRecord, ...prev.filter((item) => item.id !== completedRecord.id)]);
        setActiveInspections((prev) => prev.filter((item) => item.id !== completedRecord.id));

        removeInspectionNotifications(completedRecord.id);

        addNotification({
          id: `inspection-completed-${completedRecord.id}-${Date.now()}`,
          title: "Inspection Completed",
          message: `${completedRecord.targetType} ${completedRecord.targetType === "System" ? completedRecord.systemSnapshot?.systemName ?? completedRecord.systemId : completedRecord.machineName} was completed on ${values.completionDate} at ${values.completionTime}.`,
          category: completedRecord.targetType === "System" ? "system" : "machine",
          severity: "success",
          time: new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
          read: false,
          archived: false,
          inspectionScheduleId: completedRecord.id,
          notificationType: "Inspection Completed",
          notificationKey: `inspection-completed-${completedRecord.id}`,
        });

        const nextInspection = buildNextRecurringInspection(completedRecord);
        const created = createInspection(nextInspection);
        if (created.id === nextInspection.id) {
          setActiveInspections((prev) => [nextInspection, ...prev.filter((item) => item.id !== nextInspection.id)]);
          addNotification({
            id: `inspection-generated-${nextInspection.id}-${Date.now()}`,
            title: "Next Inspection Generated",
            message: `${nextInspection.targetType} ${nextInspection.targetType === "System" ? nextInspection.systemSnapshot?.systemName ?? nextInspection.systemId : nextInspection.machineName} has a new inspection scheduled for ${nextInspection.dueDate}.`,
            category: nextInspection.targetType === "System" ? "system" : "machine",
            severity: "info",
            time: new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
            read: false,
            archived: false,
            inspectionScheduleId: nextInspection.id,
            notificationType: "Next Inspection Generated",
            notificationKey: `inspection-generated-${nextInspection.id}`,
          });
        }

        setShowCompleteDialog(false);
        setSelectedInspection(null);
      } finally {
        completionClaims.current.delete(inspectionId);
      }
    },
    [selectedInspection]
  );

  const handleDeleteInspection = useCallback((inspection: InspectionScheduleRecord) => {
    try {
      if (!deleteActiveInspection(inspection)) {
        toast.error("Inspection could not be found. Please refresh and try again.");
        return;
      }
      removeInspectionNotifications(inspection.id);
      setActiveInspections((prev) => prev.filter((item) => item.id !== inspection.id));
      setSelectedInspection((current) => (current?.id === inspection.id ? null : current));
      setShowCompleteDialog(false);
      toast.success("Inspection deleted successfully.");
    } catch {
      toast.error("Failed to delete inspection. Please try again.");
    }
  }, []);

  const handleUndoCompletion = useCallback((inspection: InspectionScheduleRecord) => {
    const generatedMatches = getActiveInspections().filter(
      (item) => item.id !== inspection.id && (item.parentId === inspection.id || (item.recurrenceId === inspection.recurrenceId && item.status !== "Completed"))
    );
    const generated = generatedMatches[0];
    const restored: InspectionScheduleRecord = {
      ...inspection,
      status: getInspectionStatus(inspection.dueDate, inspection.dueTime),
      completionDate: undefined,
      completionTime: undefined,
      completedBy: undefined,
      completionNotes: undefined,
      history: inspection.history.slice(1),
    };
    if (!undoInspectionCompletion(inspection.id, restored, generated?.id)) {
      toast.error("This inspection cannot be safely restored in its current state.");
      return;
    }
    setCompletedInspections((prev) => prev.filter((item) => item.id !== inspection.id));
    setActiveInspections((prev) => [restored, ...prev.filter((item) => item.id !== generated?.id && item.parentId !== inspection.id && !(item.recurrenceId === inspection.recurrenceId && item.id !== inspection.id && item.status !== "Completed"))]);
    removeInspectionNotifications(inspection.id);
    for (const candidate of generatedMatches) {
      removeInspectionNotifications(candidate.id);
    }
    toast.success("Completion undone successfully.");
  }, [activeInspections]);

  const inspectionTargets = useMemo(() => {
    return systems.map((system) => ({
      label: `${system.systemId} · ${system.systemName} · ${system.systemType} · ${system.systemCategory}`,
      value: system.systemId,
      system,
    }));
  }, [systems]);

  return {
    systems,
    isLoading,
    activeInspections: filteredActiveInspections,
    completedInspections,
    kpis,
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
    handleUndoCompletion,
    handleDeleteInspection,
    setSelectedInspection,
    inspectionTargets,
  };
}
