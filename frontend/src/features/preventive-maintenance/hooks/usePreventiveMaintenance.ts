import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import type { PMRecord, PMStatus } from "../types/pm";
import type { SystemInventory } from "../../system-inventory/types/system";
import { daysUntil, calculateNextDue } from "../utils/pmDateUtils";
import { PM_PAGE_SIZE } from "../constants/pmConstants";
import type { PMViewMode } from "../components/PMToolbar";
import type { PMFilterState } from "../components/PMFilters";
import { loadPMState, savePMState, type PersistedPMStateV1, type PMCompletionEvent } from "../utils/pmStorage";
import { calculateReminderDate, checkAndGenerateDueReminders, clearRemindersForPM } from "../utils/pmReminderUtils";


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
  const [timelineLog, setTimelineLog] = useState<{ id: string; time: string; action: string; machine: string; user: string }[]>([]);

  // Backend-ready reference/lookup data (departments, assignable users, eligible systems).
  // Populated via API; empty by default so the UI never crashes with no data.
  const [departments, setDepartments] = useState<string[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const [eligibleSystems, _setEligibleSystems] = useState<SystemInventory[]>([]);

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

        if (persisted.filters) {
          setSearchQuery(persisted.filters.searchQuery ?? "");
          setQuickFilter(persisted.filters.quickFilter ?? "All");
          setFilters(persisted.filters.filters);
        }

        // Lookups are empty until feature modules are wired.
        // UI uses fallbacks when empty.
        setDepartments([]);
        setUsers([]);
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


  // Persist records + persisted filters whenever they change.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const state = loadPMState();
    const next: PersistedPMStateV1 = {
      ...state,
      records: pmRecords,
      filters: {
        searchQuery,
        quickFilter,
        filters,
      },
    };
    savePMState(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pmRecords, searchQuery, quickFilter, filters]);

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
        const order = { Critical: 0, High: 1, Medium: 2, Low: 3 };
        cmp = order[a.priority] - order[b.priority];
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return d;
  }, [pmRecords, searchQuery, quickFilter, filters, sortField, sortDir]);

  const kpis = useMemo(() => ({
    total: pmRecords.length,
    dueToday: pmRecords.filter(r => r.status === "Due Today").length,
    upcoming: pmRecords.filter(r => r.status === "Upcoming" || r.status === "Scheduled").length,
    completed: pmRecords.filter(r => r.status === "Completed").length,
    overdue: pmRecords.filter(r => r.status === "Overdue").length,
  }), [pmRecords]);

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
    // TODO:
    // Update PM
    // PUT /api/pm-records/:id
    // Recalculate reminder date when due date or reminder changes
    const finalRecord = { ...updated };
    if (finalRecord.reminder && finalRecord.nextDue) {
      finalRecord.reminderDate = calculateReminderDate(finalRecord.nextDue, finalRecord.reminder);
    } else {
      finalRecord.reminderDate = undefined;
    }
    try {
      setPmRecords(prev => prev.map(r => r.id === updated.id ? finalRecord : r));
      addTimelineEntry("Updated", finalRecord);
      // Re-check reminders after edit
      const updatedRecords = pmRecords.map(r => r.id === updated.id ? finalRecord : r);
      checkAndGenerateDueReminders(updatedRecords);
      toast.success("Maintenance Schedule Updated Successfully");
    } catch (_err) {
      toast.error("Failed to update maintenance schedule. Please try again.");
    }
  };

  const handleDeletePM = (record: PMRecord) => {
    // TODO:
    // Delete PM
    // DELETE /api/pm-records/:id
    setIsDeleting(true);
    try {
      setPmRecords(prev => prev.filter(r => r.id !== record.id));
      addTimelineEntry("Deleted", record);
      toast.success("Maintenance Deleted Successfully");
    } catch (_err) {
      toast.error("Failed to delete maintenance task. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false); setSelectedRecord(null);
    }
  };

  const handleCompletePM = (notes: string) => {
    if (!selectedRecord) return;
    const today = new Date().toISOString().split("T")[0];
    const trimmedNotes = notes.trim();

    // 1. Clear any pending reminder notifications for this PM
    clearRemindersForPM(selectedRecord.id);

    // 2. Check for duplicate: don't create next cycle if there's already an
    // upcoming/scheduled record with same machine and frequency.
    const existingNext = pmRecords.find(
      r =>
        r.id !== selectedRecord.id &&
        r.machine === selectedRecord.machine &&
        r.machineId === selectedRecord.machineId &&
        r.frequency === selectedRecord.frequency &&
        (r.status === "Upcoming" || r.status === "Scheduled")
    );
    if (existingNext) {
      toast.error("A recurring PM task for this machine and frequency already exists.");
      setShowCompleteDialog(false);
      setSelectedRecord(null);
      return;
    }

    try {
      // 2. Mark the current record as completed
      const completedRecord: PMRecord = {
        ...selectedRecord,
        status: "Completed" as PMStatus,
        lastMaintenance: today,
        completionDate: today,
        history: [
          {
            date: today,
            user: "Current User",
            notes: trimmedNotes || "PM completed.",
            status: "Completed",
          },
          ...selectedRecord.history,
        ],
      };

      // 3. Compute next due date from completion date + frequency
      const nextDueDate = calculateNextDue(today, selectedRecord.frequency);

      // 4. Create the new recurring PM task (exactly one)
      const newPMRecord: PMRecord = {
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
        reminderDate: selectedRecord.reminder ? calculateReminderDate(nextDueDate, selectedRecord.reminder) : undefined,
        checklist: selectedRecord.checklist || selectedRecord.description,
        priority: selectedRecord.priority,
        lastMaintenance: today,
        nextDue: nextDueDate,
        status: "Upcoming" as PMStatus,
        description: selectedRecord.description,
        history: [],
      };

      setPmRecords(prev => {
        // Replace completed record and add new cycle
        const withoutCompleted = prev.map(r =>
          r.id === selectedRecord.id ? completedRecord : r
        );
        return [newPMRecord, ...withoutCompleted];
      });

      // 5. Generate a fresh reminder for the new recurring PM
      checkAndGenerateDueReminders([newPMRecord, ...pmRecords]);

      // 6. Store completion event in storage
      try {
        const state = loadPMState();
        const completionEvent: PMCompletionEvent = {
          id: `comp-${Date.now()}`,
          completedAt: today,
          completedBy: "Current User",
          checklist: [trimmedNotes || "PM completed."],
          completionNotes: trimmedNotes || "PM completed.",
          previousDueDate: selectedRecord.nextDue,
          previousMaintenanceDate: selectedRecord.lastMaintenance,
          frequency: selectedRecord.frequency,
          status: "Completed",
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
    pmRecords,
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
  };
}

export default usePreventiveMaintenance;
