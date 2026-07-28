import { useState, useEffect, useMemo } from "react";
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


const INITIAL_FILTERS: PMFilterState = {
  department: "",
  frequency: "",
  priority: "",
  status: "",
  dateFrom: "",
  dateTo: "",
};

export function usePreventiveMaintenance() {
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
    let cancelled = false;

    async function loadPMData() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const persisted: PersistedPMStateV1 = loadPMState();
        if (cancelled) return;

        // Load PM records + persisted filters.
        setPmRecords(Array.isArray(persisted.records) ? persisted.records : []);
        // Load completed PMs from persisted state (BUG 5)
        setCompletedPMs(Array.isArray(persisted.completedPMs) ? persisted.completedPMs : []);

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

  // Completed PMs remain in the main record list so their record actions stay available.
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
    const today = new Date().toISOString().split("T")[0];
    const trimmedNotes = submission.notes.trim();

    // 1. Clear any pending reminder notifications for this PM (BUG 2)
    clearRemindersForPM(selectedRecord.id);

    // 2. Use the recurrenceId for duplicate detection (BUG 4).
    // If the selected PM has a recurrenceId, check if there's already an
    // active PM (non-Completed) with the same recurrenceId.
    // This is a stable identifier that persists across edits.
    const recurrenceKey = selectedRecord.recurrenceId;
    if (recurrenceKey) {
      const existingNext = pmRecords.find(
        r =>
          r.id !== selectedRecord.id &&
          r.recurrenceId === recurrenceKey &&
          r.status !== "Completed"
      );
      if (existingNext) {
        toast.error("A recurring PM task for this cycle already exists. Duplicate generation prevented.");
        setShowCompleteDialog(false);
        setSelectedRecord(null);
        return;
      }
    } else {
      // Fallback for older records without recurrenceId: check machineId + frequency
      const existingNext = pmRecords.find(
        r =>
          r.id !== selectedRecord.id &&
          r.machine === selectedRecord.machine &&
          r.machineId === selectedRecord.machineId &&
          r.frequency === selectedRecord.frequency &&
          r.status !== "Completed"
      );
      if (existingNext) {
        toast.error("A recurring PM task for this machine and frequency already exists.");
        setShowCompleteDialog(false);
        setSelectedRecord(null);
        return;
      }
    }

    try {
      const shouldRecur = !!selectedRecord.frequency && selectedRecord.frequency !== "One Time";
      const nextDueDate = shouldRecur ? calculateNextDue(today, selectedRecord.frequency) : "";
      const nextReminderDate = shouldRecur && nextDueDate && selectedRecord.reminder ? calculateReminderDate(nextDueDate, selectedRecord.reminder) : undefined;

      const newPMRecord: PMRecord | null = shouldRecur && nextDueDate ? {
        id: `temp-${Date.now()}`,
        machine: selectedRecord.machine,
        machineId: selectedRecord.machineId,
        systemId: selectedRecord.systemId,
        systemName: selectedRecord.systemName,
        systemType: selectedRecord.systemType,
        department: selectedRecord.department,
        location: selectedRecord.location,
        assignedUser: selectedRecord.assignedUser,
        model: selectedRecord.model,
        user: selectedRecord.user,
        frequency: selectedRecord.frequency,
        reminder: selectedRecord.reminder,
        reminderDate: nextReminderDate,
        checklist: selectedRecord.checklist || selectedRecord.description,
        priority: selectedRecord.priority,
        lastMaintenance: today,
        nextDue: nextDueDate,
        status: "Upcoming" as PMStatus,
        description: selectedRecord.description,
        recurrenceId: selectedRecord.recurrenceId || `recur-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        parentId: selectedRecord.id,
        history: [],
      } : null;

      // 5. Mark the current record as completed
      const now = new Date();
      const completionTimeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
      const completedRecord: PMRecord = {
        ...selectedRecord,
        status: "Completed" as PMStatus,
        lastMaintenance: today,
        completionDate: today,
        completionNotes: trimmedNotes,
        history: [
          {
            date: today,
            user: "Current User",
            notes: trimmedNotes || "PM completed.",
            status: "Completed",
            completionTime: completionTimeStr,
            previousMaintenanceDate: selectedRecord.lastMaintenance,
            previousDueDate: selectedRecord.nextDue,
            frequency: selectedRecord.frequency,
            priority: selectedRecord.priority,
          },
          ...selectedRecord.history,
        ],
      };
      completedRecord.checklistResponses = submission.items;

      // Save the completed checklist and create the next recurring PM together.
      setPmRecords(prev => {
        if (!newPMRecord) {
          return [completedRecord, ...prev.filter(r => r.id !== selectedRecord.id)];
        }
        return [newPMRecord, completedRecord, ...prev.filter(r => r.id !== selectedRecord.id)];
      });
      setCompletedPMs(prev => [completedRecord, ...prev]);

      // BUG 2: Generate a fresh reminder ONLY for the new recurring PM
      if (newPMRecord) {
        checkAndGenerateDueReminders([newPMRecord]);
      }

      // 6. Store completion event in storage
      try {
        const state = loadPMState();
        const completionEvent: PMCompletionEvent = {
          id: `comp-${Date.now()}`,
          pmId: completedRecord.id,
          completedAt: today,
          completedBy: "Current User",
          checklist: submission.items.map(item => `${item.number} ${item.label}`),
          completionNotes: trimmedNotes || "PM completed.",
          previousDueDate: selectedRecord.nextDue,
          previousMaintenanceDate: selectedRecord.lastMaintenance,
          frequency: selectedRecord.frequency,
          status: "Completed",
          checklistResponses: submission.items,
        };
        const machineId = selectedRecord.machineId;
        const existingHistory = state.completionHistory[machineId] || [];
        const next: PersistedPMStateV1 = {
          ...state,
          completionHistory: {
            ...state.completionHistory,
            [machineId]: [completionEvent, ...existingHistory],
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
      setShowCompleteDialog(false);
      setSelectedRecord(null);
    }
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
    handleSnoozePM,
    handleDuplicate,
    handleCheckAll,
    handleSort,
    handleToggleHistory,
  };
}

export default usePreventiveMaintenance;
