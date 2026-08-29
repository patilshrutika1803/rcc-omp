import { useState, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import type { PMRecord, PMStatus } from "../types/pm";
import type { SystemInventory } from "../../system-inventory/types/system";
import { daysUntil, calculateNextDue } from "../utils/pmDateUtils";
import { PM_PAGE_SIZE } from "../constants/pmConstants";
import type { PMViewMode } from "../components/PMToolbar";
import type { PMFilterState } from "../components/PMFilters";
import { loadPMState, savePMState, removePMArtifacts, type PersistedPMStateV1, type PMCompletionEvent } from "../utils/pmStorage";
import { calculateReminderDate, checkAndGenerateDueReminders, clearRemindersForPM } from "../utils/pmReminderUtils";
import type { PMChecklistSubmission } from "../components/ChecklistDrawer";
import preventiveMaintenanceService from "../services/preventiveMaintenanceService";
import { isDueDateTimeReached } from "../../shared/utils/recurringWorkflow";


const INITIAL_FILTERS: PMFilterState = {
  department: "",
  frequency: "",
  priority: "",
  status: "",
  dateFrom: "",
  dateTo: "",
};

export function usePreventiveMaintenance() {
  const completionClaims = useRef(new Set<string>());
  const [viewMode, setViewMode] = useState<PMViewMode>("table");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showSnoozeDialog, setShowSnoozeDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PMRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [quickFilter, setQuickFilter] = useState("All");
  const [sortField, setSortField] = useState<string>("nextDue");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = PM_PAGE_SIZE;

  // Backend-ready state: no hardcoded/demo maintenance records. Populated via API.
  const [pmRecords, setPmRecords] = useState<PMRecord[]>([]);
  // Completed PMs stored separately for history/audit trail (BUG 5)
  const [completedPMs, setCompletedPMs] = useState<PMRecord[]>([]);
  // State to toggle showing history view
  const [showHistory, setShowHistory] = useState(false);
  const [timelineLog, setTimelineLog] = useState<{ id: string; time: string; action: string; machine: string; user: string }[]>([]);

  // Backend-ready reference/lookup data (departments, assignable users, eligible systems).
  // Populated via API; empty by default so the UI never crashes with no data.
  const [departments, setDepartments] = useState<string[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const [eligibleSystems, setEligibleSystems] = useState<SystemInventory[]>([]);

  // Network / request lifecycle state, ready for real API integration.
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [filters, setFilters] = useState<PMFilterState>(INITIAL_FILTERS);


  useEffect(() => {
    if (typeof window !== "undefined") {
      const shouldOpen = window.sessionStorage.getItem("rcc_omp_pm_open_add");
      if (shouldOpen === "1") {
        setShowAddModal(true);
        window.sessionStorage.removeItem("rcc_omp_pm_open_add");
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadPMData() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const persisted: PersistedPMStateV1 = loadPMState();
        if (cancelled) return;

        const loadedRecords = Array.isArray(persisted.records) ? persisted.records : [];
        const loadedCompleted = Array.isArray(persisted.completedPMs) ? persisted.completedPMs : [];
        const mergedCompleted = [
          ...loadedCompleted,
          ...loadedRecords.filter(record => record.status === "Completed" && !loadedCompleted.some(completed => completed.id === record.id)),
        ];

        // Load PM records + persisted filters.
        setPmRecords(loadedRecords);
        // Load completed PMs from persisted state and retain completed records across reloads.
        setCompletedPMs(mergedCompleted);

        if (persisted.filters) {
          setSearchQuery(persisted.filters.searchQuery ?? "");
          setQuickFilter(persisted.filters.quickFilter ?? "All");
          setFilters(persisted.filters.filters);
        }

        const [systemsResult] = await Promise.all([
          preventiveMaintenanceService.getEligibleSystems(),
        ]);

        if (!cancelled) {
          setEligibleSystems(systemsResult);
          setDepartments([]);
          setUsers([]);
        }
      } catch (_err) {
        if (!cancelled) {
          setLoadError("Unable to load preventive maintenance data. Please try again.");
          setPmRecords([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadPMData();
    return () => {
      cancelled = true;
    };
  }, []);


  // Check for due reminders whenever PM records are loaded
  useEffect(() => {
    if (!isLoading && pmRecords.length > 0) {
      checkAndGenerateDueReminders(pmRecords);
    }
  }, [isLoading, pmRecords]);


  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, quickFilter, filters]);

  // Open PM drawer from Search Everywhere selection
  useEffect(() => {
    try {
      const selectedId = window.sessionStorage.getItem("rcc_omp_pm_selected_id");
      if (!selectedId) return;
      // Clear once read to avoid reopening on subsequent renders.
      window.sessionStorage.removeItem("rcc_omp_pm_selected_id");

      const found = pmRecords.find(r => r.id === selectedId);
      if (found) {
        setSelectedRecord(found);
        setShowDrawer(true);
      }
    } catch {
      // ignore
    }
    // pmRecords is intentionally included because we need the records loaded first.
  }, [pmRecords]);


  // Persist records + persisted filters + completedPMs whenever they change.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const state = loadPMState();
    const next: PersistedPMStateV1 = {
      ...state,
      records: pmRecords,
      completedPMs,
      filters: {
        searchQuery,
        quickFilter,
        filters,
      },
    };
    savePMState(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pmRecords, completedPMs, searchQuery, quickFilter, filters]);

  // Active records are used for KPIs and recurring workflow state, but completed
  // PMs must remain visible in the main list so their completed-specific actions
  // (including Export PDF) stay available.
  const activeRecords = useMemo(() => {
    return pmRecords.filter(r => r.status !== "Completed");
  }, [pmRecords]);

  const filteredData = useMemo(() => {
    let d = [...pmRecords];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      d = d.filter(r =>
        r.machine.toLowerCase().includes(q) ||
        r.machineId.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.user.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q) ||
        r.priority.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.frequency.toLowerCase().includes(q)
      );
    }

    if (quickFilter !== "All") d = d.filter(r => r.status === quickFilter);
    if (filters.department) d = d.filter(r => r.department === filters.department);
    if (filters.frequency) d = d.filter(r => r.frequency === filters.frequency);
    if (filters.priority) d = d.filter(r => r.priority === filters.priority);
    if (filters.status) d = d.filter(r => r.status === filters.status);

    d.sort((a, b) => {
      let cmp = 0;
      if (sortField === "nextDue") cmp = a.nextDue.localeCompare(b.nextDue);
      else if (sortField === "machine") cmp = a.machine.localeCompare(b.machine);
      else if (sortField === "priority") {
        const order: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };
        cmp = (order[a.priority] ?? 2) - (order[b.priority] ?? 2);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return d;
  }, [pmRecords, searchQuery, quickFilter, filters, sortField, sortDir]);

  const kpis = useMemo(() => ({
    total: activeRecords.length,
    dueToday: activeRecords.filter(r => r.status === "Due Today").length,
    upcoming: activeRecords.filter(r => r.status === "Upcoming" || r.status === "Scheduled").length,
    completed: completedPMs.length,
    overdue: activeRecords.filter(r => r.status === "Overdue").length,
  }), [activeRecords, completedPMs]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const pagedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const addTimelineEntry = (action: string, record: PMRecord) => {
    setTimelineLog(prev => [{
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      action, machine: record.machine, user: "Current User"
    }, ...prev.slice(0, 49)]);
  };

  const handleAddPM = (record: PMRecord) => {
    // Auto-calculate nextDue if not provided
    const finalRecord = { ...record };
    if (!finalRecord.nextDue && finalRecord.lastMaintenance && finalRecord.frequency) {
      finalRecord.nextDue = calculateNextDue(finalRecord.lastMaintenance, finalRecord.frequency);
    }
    // Calculate reminder date
    if (finalRecord.reminder && finalRecord.nextDue) {
      finalRecord.reminderDate = calculateReminderDate(finalRecord.nextDue, finalRecord.reminder);
    }
    try {
      setPmRecords(prev => [finalRecord, ...prev]);
      addTimelineEntry("Added", finalRecord);
      // Generate reminder notification if due
      checkAndGenerateDueReminders([finalRecord, ...pmRecords]);
      toast.success("Preventive Maintenance Schedule Added Successfully");
    } catch (_err) {
      toast.error("Failed to add maintenance schedule. Please try again.");
    }
  };

  const handleEditPM = (updated: PMRecord) => {
    // Update PM
    // PUT /api/pm-records/:id
    //
    // When due date or reminder changes:
    // 1. Remove old reminder notification(s)
    // 2. Recalculate reminder date
    // 3. Generate only one new reminder if applicable
    const finalRecord = { ...updated };

    // Check if due date or reminder option changed
    const originalRecord = pmRecords.find(r => r.id === updated.id);

    // Clear old reminders if due date or reminder option changed
    if (originalRecord && (
      originalRecord.nextDue !== updated.nextDue ||
      originalRecord.reminder !== updated.reminder
    )) {
      clearRemindersForPM(updated.id);
    }

    // Recalculate reminder date
    if (finalRecord.reminder && finalRecord.nextDue) {
      finalRecord.reminderDate = calculateReminderDate(finalRecord.nextDue, finalRecord.reminder);
    } else {
      finalRecord.reminderDate = undefined;
    }
    try {
      setPmRecords(prev => prev.map(r => r.id === updated.id ? finalRecord : r));
      addTimelineEntry("Updated", finalRecord);
      // Re-check reminders after edit — only generates one new notification due to duplicate check
      const updatedRecords = pmRecords.map(r => r.id === updated.id ? finalRecord : r);
      checkAndGenerateDueReminders(updatedRecords);
      toast.success("Maintenance Schedule Updated Successfully");
    } catch (_err) {
      toast.error("Failed to update maintenance schedule. Please try again.");
    }
  };

  const handleDeletePM = (record: PMRecord) => {
    setIsDeleting(true);
    try {
      setPmRecords(prev => prev.filter(r => r.id !== record.id));
      setCompletedPMs(prev => prev.filter(r => r.id !== record.id));
      removePMArtifacts(record);
      addTimelineEntry("Deleted", record);
      toast.success("Maintenance Deleted Successfully");
    } catch (_err) {
      toast.error("Failed to delete maintenance task. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false); setSelectedRecord(null);
    }
  };

  const handleCompletePM = (submission: PMChecklistSubmission) => {
    if (!selectedRecord) return;

    const currentRecord = pmRecords.find(record => record.id === selectedRecord.id) ?? selectedRecord;
    const persistedState = loadPMState();
    const persistedRecord = persistedState.records.find((record) => record.id === currentRecord.id);
    if (currentRecord.status === "Completed" || persistedRecord?.status === "Completed" || completionClaims.current.has(currentRecord.id)) {
      toast.info("Maintenance task is already completed.");
      return;
    }
    if (!isDueDateTimeReached(currentRecord.nextDue)) {
      toast.error("Cannot complete before the scheduled due date.");
      return;
    }

    const recurrenceKey = currentRecord.recurrenceId;
    const hasDuplicateCycle = [...pmRecords, ...completedPMs].some((record) =>
      record.id !== currentRecord.id &&
      ((recurrenceKey && record.recurrenceId === recurrenceKey) ||
        (!recurrenceKey && record.machine === currentRecord.machine && record.machineId === currentRecord.machineId && record.frequency === currentRecord.frequency)) &&
      record.status !== "Completed"
    );
    if (hasDuplicateCycle) {
      toast.error("A recurring PM task for this cycle already exists. Duplicate generation prevented.");
      setShowCompleteDialog(false);
      setSelectedRecord(null);
      return;
    }

    completionClaims.current.add(currentRecord.id);

    try {
      const today = new Date().toISOString().split("T")[0];
      const trimmedNotes = submission.notes.trim();

      // 1. Clear any pending reminder notifications for this PM (BUG 2)
      clearRemindersForPM(currentRecord.id);

      const shouldRecur = !!currentRecord.frequency && currentRecord.frequency !== "One Time";
      const completedCycleDueDate = currentRecord.nextDue || currentRecord.lastMaintenance || today;
      const nextDueDate = shouldRecur ? calculateNextDue(completedCycleDueDate, currentRecord.frequency) : "";
      const nextReminderDate = shouldRecur && nextDueDate && currentRecord.reminder ? calculateReminderDate(nextDueDate, currentRecord.reminder) : undefined;

      const newPMRecord: PMRecord | null = shouldRecur && nextDueDate ? {
        id: `temp-${Date.now()}`,
        machine: currentRecord.machine,
        machineId: currentRecord.machineId,
        systemId: currentRecord.systemId,
        systemName: currentRecord.systemName,
        systemType: currentRecord.systemType,
        department: currentRecord.department,
        location: currentRecord.location,
        assignedUser: currentRecord.assignedUser,
        model: currentRecord.model,
        user: currentRecord.user,
        frequency: currentRecord.frequency,
        reminder: currentRecord.reminder,
        reminderDate: nextReminderDate,
        checklist: currentRecord.checklist || currentRecord.description,
        priority: currentRecord.priority,
        lastMaintenance: completedCycleDueDate,
        nextDue: nextDueDate,
        scheduledNextDue: nextDueDate,
        status: "Upcoming" as PMStatus,
        description: currentRecord.description,
        recurrenceId: currentRecord.recurrenceId || `recur-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        parentId: currentRecord.id,
        history: [],
      } : null;

      const now = new Date();
      const completionTimeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
      const completedRecord: PMRecord = {
        ...currentRecord,
        status: "Completed" as PMStatus,
        lastMaintenance: completedCycleDueDate,
        nextDue: "",
        completionDate: today,
        completionNotes: trimmedNotes,
        scheduledNextDue: nextDueDate || "",
        history: [
          {
            date: today,
            user: "Current User",
            notes: trimmedNotes || "PM completed.",
            status: "Completed",
            completionTime: completionTimeStr,
            previousMaintenanceDate: currentRecord.lastMaintenance,
            previousDueDate: currentRecord.nextDue,
            frequency: currentRecord.frequency,
            priority: currentRecord.priority,
          },
          ...currentRecord.history,
        ],
      };
      completedRecord.checklistResponses = submission.items;

      setPmRecords(prev => {
        const withoutCurrent = prev.filter(r => r.id !== currentRecord.id);
        return newPMRecord ? [newPMRecord, completedRecord, ...withoutCurrent.filter(r => r.id !== newPMRecord.id)] : [completedRecord, ...withoutCurrent];
      });
      setCompletedPMs(prev => [completedRecord, ...prev.filter(record => record.id !== completedRecord.id)]);

      if (newPMRecord) {
        checkAndGenerateDueReminders([newPMRecord]);
      }

      try {
        const state = loadPMState();
        const completionEvent: PMCompletionEvent = {
          id: `comp-${Date.now()}`,
          pmId: completedRecord.id,
          completedAt: today,
          completedBy: "Current User",
          checklist: submission.items.map(item => `${item.number} ${item.label}`),
          completionNotes: trimmedNotes || "PM completed.",
          previousDueDate: currentRecord.nextDue,
          previousMaintenanceDate: currentRecord.lastMaintenance,
          frequency: currentRecord.frequency,
          status: "Completed",
          checklistResponses: submission.items,
        };
        const machineId = currentRecord.machineId;
        const existingHistory = state.completionHistory[machineId] || [];
        const currentRecords = state.records.length > 0 ? state.records : pmRecords;
        const dedupedRecords = currentRecords.filter(record => record.id !== currentRecord.id && record.id !== newPMRecord?.id);
        const nextRecords = newPMRecord ? [newPMRecord, completedRecord, ...dedupedRecords] : [completedRecord, ...dedupedRecords];
        const next: PersistedPMStateV1 = {
          ...state,
          records: nextRecords,
          completedPMs: [completedRecord, ...state.completedPMs.filter((record) => record.id !== completedRecord.id)],
          completionHistory: {
            ...state.completionHistory,
            [machineId]: [completionEvent, ...existingHistory.filter((event) => event.pmId !== completedRecord.id)],
          },
        };
        savePMState(next);
      } catch {
        // non-critical
      }

      addTimelineEntry("Completed", completedRecord);
      toast.success("Maintenance Completed Successfully. Next cycle has been scheduled.");
    } catch (_err) {
      toast.error("Failed to mark maintenance as complete. Please try again.");
    } finally {
      completionClaims.current.delete(currentRecord.id);
      setShowCompleteDialog(false);
      setSelectedRecord(null);
    }
  };

  const handleUndoCompletion = (record: PMRecord) => {
    if (record.status !== "Completed") {
      toast.error("This maintenance completion cannot be undone in its current state.");
      return;
    }

    const state = loadPMState();
    const generatedChild = [...state.records, ...state.completedPMs].find(
      (item) => item.id !== record.id && (item.parentId === record.id || (item.recurrenceId && item.recurrenceId === record.recurrenceId && item.status !== "Completed"))
    );
    const historyEntry = record.history[0];
    const previousDueDate = historyEntry?.previousDueDate || record.scheduledNextDue || record.lastMaintenance;
    const daysToDue = previousDueDate ? daysUntil(previousDueDate) : 0;
    const restored: PMRecord = {
      ...record,
      status: daysToDue < 0 ? "Overdue" : daysToDue === 0 ? "Due Today" : "Upcoming",
      nextDue: previousDueDate,
      lastMaintenance: historyEntry?.previousMaintenanceDate || record.lastMaintenance,
      scheduledNextDue: undefined,
      completionDate: undefined,
      completionNotes: undefined,
      checklistResponses: undefined,
      history: record.history.slice(1),
    };
    completionClaims.current.delete(record.id);

    const nextRecords = [restored, ...state.records.filter((item) => item.id !== record.id && item.id !== generatedChild?.id)];
    const nextState: PersistedPMStateV1 = {
      ...state,
      records: nextRecords,
      completedPMs: state.completedPMs.filter((item) => item.id !== record.id),
      completionHistory: Object.fromEntries(Object.entries(state.completionHistory).map(([key, events]) => [key, events.filter((event) => event.pmId !== record.id)])),
    };
    savePMState(nextState);
    setPmRecords(nextRecords);
    setCompletedPMs(nextState.completedPMs);
    if (generatedChild) clearRemindersForPM(generatedChild.id);
    clearRemindersForPM(restored.id);
    checkAndGenerateDueReminders([restored]);
    toast.success("Completion undone successfully.");
  };

  const handleSnoozePM = (newDate: string) => {
    if (!selectedRecord) return;
    if (isNaN(new Date(newDate).getTime())) {
      toast.error("Please select a valid snooze date.");
      return;
    }
    // TODO:
    // Snooze PM
    // POST /api/pm-records/:id/snooze { nextDue: newDate }
    const d = daysUntil(newDate);
    const newStatus: PMStatus = d < 0 ? "Overdue" : d === 0 ? "Due Today" : "Upcoming";
    const updated = { ...selectedRecord, nextDue: newDate, status: newStatus };
    try {
      setPmRecords(prev => prev.map(r => r.id === updated.id ? updated : r));
      addTimelineEntry("Snoozed", updated);
      toast.success("Maintenance Snoozed Successfully");
    } catch (_err) {
      toast.error("Failed to snooze maintenance task. Please try again.");
    } finally {
      setShowSnoozeDialog(false); setSelectedRecord(null);
    }
  };

  const handleDuplicate = (record: PMRecord) => {
    // TODO:
    // Create PM (duplicate)
    // const res = await fetch('/api/pm-records', { method: 'POST', body: JSON.stringify({ ...record, id: undefined, _id: undefined }) });
    // const saved = await res.json(); // backend generates the real id
    const dup = {
      ...record,
      // Temporary client-side id, replaced by the backend-generated id once wired up.
      id: `temp-${Date.now()}`,
      status: "Upcoming" as PMStatus,
      // Generate a new recurrenceId for the duplicate so it has its own cycle (BUG 4)
      recurrenceId: `recur-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      parentId: undefined,
      history: [],
    };
    setPmRecords(prev => [dup, ...prev]);
    toast.success("PM Task Duplicated Successfully");
  };

  const handleCheckAll = () => {
    // TODO:
    // This can move server-side (a scheduled job that recalculates status
    // for all records) once the backend is connected. For now it recalculates
    // client-side from each record's stored nextDue date.
    setPmRecords(prev => prev.map(r => {
      if (r.status === "Completed") return r;
      const d = daysUntil(r.nextDue);
      const status: PMStatus = d < 0 ? "Overdue" : d === 0 ? "Due Today" : "Upcoming";
      return { ...r, status };
    }));
    toast.success("Preventive Maintenance status refreshed successfully.");
  };

  const handleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const handleToggleHistory = () => {
    setShowHistory(prev => !prev);
  };

  return {
    // view state
    viewMode, setViewMode,
    showAddModal, setShowAddModal,
    showEditModal, setShowEditModal,
    showDrawer, setShowDrawer,
    showCompleteDialog, setShowCompleteDialog,
    showSnoozeDialog, setShowSnoozeDialog,
    showDeleteDialog, setShowDeleteDialog,
    selectedRecord, setSelectedRecord,
    isLoading,
    showFilters, setShowFilters,
    searchQuery, setSearchQuery,
    quickFilter, setQuickFilter,
    sortField, sortDir,
    currentPage, setCurrentPage,

    // data
    pmRecords: activeRecords,
    completedPMs,
    showHistory,
    timelineLog,
    departments,
    users,
    eligibleSystems,
    loadError,
    isDeleting,
    filters, setFilters,

    // derived
    filteredData,
    pagedData,
    totalPages,
    kpis,

    // handlers
    handleAddPM,
    handleEditPM,
    handleDeletePM,
    handleCompletePM,
    handleUndoCompletion,
    handleSnoozePM,
    handleDuplicate,
    handleCheckAll,
    handleSort,
    handleToggleHistory,
  };
}

export default usePreventiveMaintenance;
