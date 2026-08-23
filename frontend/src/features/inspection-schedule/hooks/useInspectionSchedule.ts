import { useCallback, useEffect, useMemo, useState } from "react";
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
} from "../utils/inspectionScheduleUtils";
import { addNotification, removeInspectionNotifications } from "../../notificataions/utils/notificationStorage";
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
      if (!isCompletionDateValid(values.completionDate, selectedInspection.dueDate)) {
        toast.error(`Completion date cannot be before the inspection's due date (${selectedInspection.dueDate}).`);
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

      setCompletedInspections((prev) => [completedRecord, ...prev]);
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
      });

      const nextInspection = buildNextRecurringInspection(completedRecord);
      const created = createInspection(nextInspection);
      if (created.id === nextInspection.id) {
        setActiveInspections((prev) => [nextInspection, ...prev]);
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
        });
      }

      setShowCompleteDialog(false);
      setSelectedInspection(null);
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
    handleDeleteInspection,
    setSelectedInspection,
    inspectionTargets,
  };
}
