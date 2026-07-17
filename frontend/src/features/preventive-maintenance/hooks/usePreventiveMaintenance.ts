import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import type { PMRecord, PMStatus } from "../types/pm";
import type { SystemInventory } from "../../system-inventory/types/system";
import { daysUntil } from "../utils/pmDateUtils";
import { PM_PAGE_SIZE } from "../constants/pmConstants";
import type { PMViewMode } from "../components/PMToolbar";
import type { PMFilterState } from "../components/PMFilters";

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
        // TODO:
        // Fetch PM records
        // const res = await fetch('/api/pm-records');
        // if (!res.ok) throw new Error('Failed to fetch PM records');
        // const data = await res.json();
        // if (!cancelled) setPmRecords(Array.isArray(data) ? data : []);

        // TODO:
        // Fetch Machine List / Departments / Users
        // const [deptRes, userRes] = await Promise.all([
        //   fetch('/api/departments'),
        //   fetch('/api/users'),
        // ]);
        // if (!cancelled) {
        //   setDepartments(await deptRes.json());
        //   setUsers(await userRes.json());
        // }

        if (!cancelled) {
          // No backend connected yet — start from a clean, empty state.
          setPmRecords([]);
          setDepartments([]);
          setUsers([]);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError("Unable to load preventive maintenance data. Please try again.");
          setPmRecords([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadPMData();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, quickFilter, filters]);

  const filteredData = useMemo(() => {
    let d = [...pmRecords];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      d = d.filter(r =>
        r.machine.toLowerCase().includes(q) ||
        r.machineId.toLowerCase().includes(q) ||
        r.user.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q)
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
    // TODO:
    // Create PM
    // POST /api/pm-records — the response contains the backend-generated id,
    // which should replace the temporary client-side id below.
    try {
      setPmRecords(prev => [record, ...prev]);
      addTimelineEntry("Added", record);
      toast.success("Preventive Maintenance Schedule Added Successfully");
    } catch (err) {
      toast.error("Failed to add maintenance schedule. Please try again.");
    }
  };

  const handleEditPM = (updated: PMRecord) => {
    // TODO:
    // Update PM
    // PUT /api/pm-records/:id
    try {
      setPmRecords(prev => prev.map(r => r.id === updated.id ? updated : r));
      addTimelineEntry("Updated", updated);
      toast.success("Maintenance Schedule Updated Successfully");
    } catch (err) {
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
    } catch (err) {
      toast.error("Failed to delete maintenance task. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false); setSelectedRecord(null);
    }
  };

  const handleCompletePM = (notes: string) => {
    if (!selectedRecord) return;
    // TODO:
    // Complete PM
    // POST /api/pm-records/:id/complete { notes }
    const today = new Date().toISOString().split("T")[0];
    const trimmedNotes = notes.trim();
    const updated = {
      ...selectedRecord,
      status: "Completed" as PMStatus,
      lastMaintenance: today,
      history: [{ date: today, user: "Current User", notes: trimmedNotes || "PM completed.", status: "Completed" }, ...selectedRecord.history]
    };
    try {
      setPmRecords(prev => prev.map(r => r.id === updated.id ? updated : r));
      addTimelineEntry("Completed", updated);
      toast.success("Maintenance Completed Successfully");
    } catch (err) {
      toast.error("Failed to mark maintenance as complete. Please try again.");
    } finally {
      setShowCompleteDialog(false); setSelectedRecord(null);
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
    } catch (err) {
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
