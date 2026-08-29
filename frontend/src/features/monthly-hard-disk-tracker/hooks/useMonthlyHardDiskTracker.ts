import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { HardDiskCycle, HardDiskCycleFormValues, HardDiskFilters, HardDiskHistoryRecord, HardDiskReminderStatus, HardDiskReturnDetails } from "../types/hardDisk";
import { HDD_DEFAULT_FORM_VALUES } from "../constants/hardDiskConstants";
import { loadPersistedHardDiskCycles, persistHardDiskCycles } from "../utils/hardDiskStorage";
import { addHardDiskNotification, buildCycleReminders, calculateHardDiskReminderDate, closePendingReminders, generateInitialHardDiskNotifications, generateLifecycleNotification, removeHardDiskNotifications } from "../utils/hardDiskReminderUtils";
import { isDueDateTimeReached } from "../../shared/utils/recurringWorkflow";

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildCycleId(month: string): string {
  const normalized = month.replace(/\s+/g, "-").toUpperCase();
  return `HDD-${normalized}`;
}

function buildTimelineEntry(label: string, status: HardDiskCycle["status"], user: string, remarks: string): HardDiskCycle["history"][number] {
  const now = new Date();
  return {
    id: makeId("timeline"),
    status,
    label,
    date: now.toISOString().split("T")[0],
    time: now.toTimeString().split(" ")[0],
    user,
    remarks,
  };
}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function monthStartDateValue(monthKey: string): string {
  if (!monthKey) return "";
  const [yearText, monthText] = monthKey.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  if (!yearText || !monthText || Number.isNaN(year) || Number.isNaN(month)) return "";
  return formatLocalDate(new Date(year, month - 1, 1));
}

function monthEndDateValue(monthKey: string): string {
  if (!monthKey) return "";
  const [yearText, monthText] = monthKey.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  if (!yearText || !monthText || Number.isNaN(year) || Number.isNaN(month)) return "";
  return formatLocalDate(new Date(year, month, 0));
}

function nextMonthLabel(baseMonth: string): string {
  const [yearText, monthText] = baseMonth.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const next = new Date(year, month - 1, 1);
  next.setMonth(next.getMonth() + 1);
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(monthKey: string): string {
  const [yearText, monthText] = monthKey.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

function getMonthFromValue(value: string): string {
  if (!value) return "";
  return value;
}

function matchesSearch(cycle: HardDiskCycle, query: string): boolean {
  const haystack = `${cycle.month} ${cycle.cycleId} ${cycle.responsiblePerson} ${cycle.remarks}`.toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function matchesFilters(cycle: HardDiskCycle, filters: HardDiskFilters): boolean {
  if (filters.month && cycle.month !== filters.month) return false;
  if (filters.status && cycle.status !== filters.status) return false;
  if (filters.priority && cycle.priority !== filters.priority) return false;
  if (filters.reminderStatus && cycle.reminderStatus !== filters.reminderStatus) return false;
  if (filters.dateFrom && cycle.dispatchDate < filters.dateFrom) return false;
  if (filters.dateTo && cycle.dispatchDate > filters.dateTo) return false;
  return true;
}

export function useMonthlyHardDiskTracker() {
  const completionClaims = useRef(new Set<string>());
  const [cycles, setCycles] = useState<HardDiskCycle[]>(() => loadPersistedHardDiskCycles().activeCycles);
  const [completedHistory, setCompletedHistory] = useState<HardDiskHistoryRecord[]>(() => loadPersistedHardDiskCycles().completedHistory);
  const [selectedCycle, setSelectedCycle] = useState<HardDiskCycle | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCycle, setEditingCycle] = useState<HardDiskCycle | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<HardDiskFilters>({ month: "", status: "", priority: "", dateFrom: "", dateTo: "", reminderStatus: "" });
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    persistHardDiskCycles(cycles, completedHistory);
  }, [cycles, completedHistory, isHydrated]);

  const filteredCycles = useMemo(() => {
    return cycles.filter((cycle) => {
      const byQuery = searchQuery.trim() ? matchesSearch(cycle, searchQuery) : true;
      const byFilters = matchesFilters(cycle, filters);
      return byQuery && byFilters;
    });
  }, [cycles, filters, searchQuery]);

  const openCycle = (cycle: HardDiskCycle) => {
    setSelectedCycle(cycle);
    setShowDrawer(true);
  };

  const closeDrawer = () => {
    setShowDrawer(false);
    setSelectedCycle(null);
  };

  const submitCycle = (values: HardDiskCycleFormValues) => {
    const monthKey = getMonthFromValue(values.month);
    if (!monthKey) {
      toast.error("A month is required to create the cycle.");
      return;
    }

    const dispatchDate = monthStartDateValue(monthKey);
    const expectedReturnDate = monthEndDateValue(monthKey);
    const duplicate = cycles.some((cycle) => cycle.month === monthKey) || completedHistory.some((record) => record.month === monthKey);
    if (duplicate) {
      toast.error("A monthly cycle for this month already exists.");
      return;
    }

    const now = new Date();
    const newCycle: HardDiskCycle = {
      id: makeId("cycle"),
      cycleId: buildCycleId(monthKey),
      month: monthKey,
      dispatchDate,
      expectedReturnDate,
      currentHolder: "RCC",
      status: "Created",
      priority: values.priority,
      preparedBy: values.preparedBy,
      responsiblePerson: values.responsiblePerson,
      remarks: values.remarks,
      reminderBeforeReturn: values.reminderBeforeReturn,
      reminderStatus: "Pending",
      accountabilityStatus: "Pending",
      accountability: null,
      returnDetails: null,
      history: [buildTimelineEntry("Cycle Created", "Created", values.preparedBy, values.remarks || "Cycle created")],
      reminders: buildCycleReminders({
        id: makeId("cycle"),
        cycleId: buildCycleId(monthKey),
        month: monthKey,
        dispatchDate,
        expectedReturnDate,
        currentHolder: "RCC",
        status: "Created",
        priority: values.priority,
        preparedBy: values.preparedBy,
        responsiblePerson: values.responsiblePerson,
        remarks: values.remarks,
        reminderBeforeReturn: values.reminderBeforeReturn,
        reminderStatus: "Pending",
        accountabilityStatus: "Pending",
        accountability: null,
        returnDetails: null,
        history: [],
        reminders: [],
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      }),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    setCycles((prev) => [newCycle, ...prev]);
    generateInitialHardDiskNotifications(newCycle);
    setShowModal(false);
    setEditingCycle(null);
    toast.success(`Monthly cycle ${newCycle.cycleId} created.`);
  };

  const updateCycleStatus = (cycle: HardDiskCycle, nextStatus: HardDiskCycle["status"], remarks: string, user: string) => {
    if (nextStatus === "Dispatched from RCC" && !isDueDateTimeReached(cycle.dispatchDate)) {
      toast.error("Cannot dispatch before the configured dispatch date.");
      return;
    }

    const updatedHistory = [...cycle.history, buildTimelineEntry(nextStatus, nextStatus, user, remarks)];
    const updatedCycle: HardDiskCycle = {
      ...cycle,
      status: nextStatus,
      history: updatedHistory,
      currentHolder: nextStatus === "Dispatched from RCC" || nextStatus === "Received at RSB" || nextStatus === "Monthly Backup Completed" || nextStatus === "Return Pending" ? "RSB" : nextStatus === "Returned from RSB" || nextStatus === "Received at RCC" || nextStatus === "Cycle Completed" ? "RCC" : cycle.currentHolder,
      updatedAt: new Date().toISOString(),
    };

    setCycles((prev) => prev.map((item) => (item.id === cycle.id ? updatedCycle : item)));
    generateLifecycleNotification(updatedCycle, nextStatus);
    toast.success(`Cycle moved to ${nextStatus}.`);
  };

  const markAccountabilityCompleted = (cycle: HardDiskCycle, completedBy: string, completedAt: string, notes: string) => {
    const accountabilityDueDate = cycle.reminderBeforeReturn ? (calculateHardDiskReminderDate(cycle.expectedReturnDate, cycle.reminderBeforeReturn) || cycle.expectedReturnDate) : cycle.expectedReturnDate;
    if (!isDueDateTimeReached(accountabilityDueDate)) {
      toast.error("Cannot record accountability before the configured reminder date.");
      return;
    }

    const updated: HardDiskCycle = {
      ...cycle,
      accountabilityStatus: "Completed",
      accountability: { completedBy, completedAt, notes },
      reminders: cycle.reminders.map((r) => (r.type === "Accountability Reminder" && r.status === "Pending" ? { ...r, status: "Completed" } : r)),
      history: [...cycle.history, buildTimelineEntry("Accountability Completed", cycle.status, completedBy, notes)],
      updatedAt: new Date().toISOString(),
    };

    setCycles((prev) => prev.map((item) => (item.id === cycle.id ? updated : item)));
    addHardDiskNotification(cycle, "Accountability Completed", "Accountability Completed", `Accountability completed for ${cycle.month} by ${completedBy}.`);
    toast.success(`Accountability marked completed for ${cycle.cycleId}.`);
  };

  const recordReturn = (cycle: HardDiskCycle, details: HardDiskReturnDetails, user: string) => {
    if (!isDueDateTimeReached(cycle.expectedReturnDate)) {
      toast.error("Cannot record a return before the scheduled due date.");
      return;
    }

    const updated: HardDiskCycle = {
      ...cycle,
      actualReturnDate: details.returnDate,
      returnDetails: details,
      status: "Returned from RSB",
      currentHolder: "RCC",
      reminders: closePendingReminders(cycle),
      history: [...cycle.history, buildTimelineEntry("Returned from RSB", "Returned from RSB", user, details.returnNotes || "Returned")],
      updatedAt: new Date().toISOString(),
    };

    setCycles((prev) => prev.map((item) => (item.id === cycle.id ? updated : item)));
    generateLifecycleNotification(updated, "Returned from RSB");
    toast.success(`Return recorded for ${cycle.cycleId}.`);
  };

  const completeCycle = (cycle: HardDiskCycle, details: HardDiskCycle["completionDetails"], user: string) => {
    if (!details) return;
    const persisted = loadPersistedHardDiskCycles();
    const persistedCycle = persisted.activeCycles.find((item) => item.id === cycle.id);
    const alreadyCompleted = persisted.completedHistory.some((record) => record.cycleId === cycle.cycleId);
    if (cycle.status === "Cycle Completed" || persistedCycle?.status === "Cycle Completed" || alreadyCompleted || completionClaims.current.has(cycle.id)) {
      toast.info("Monthly cycle is already completed.");
      return;
    }
    if (!isDueDateTimeReached(cycle.expectedReturnDate)) {
      toast.error("Cannot complete before the scheduled due date.");
      return;
    }
    completionClaims.current.add(cycle.id);

    const completedRecord: HardDiskHistoryRecord = {
      id: makeId("history"),
      month: cycle.month,
      cycleId: cycle.cycleId,
      dispatchDate: cycle.dispatchDate,
      returnDate: details.returnDate,
      completedDate: `${details.returnDate} ${details.returnTime}`,
      completedBy: user,
      verifiedBy: details.verifiedBy,
      hardDiskCondition: details.hardDiskCondition,
      remarks: details.remarks,
      status: "Cycle Completed",
    };

    const completedCycle: HardDiskCycle = {
      ...cycle,
      status: "Cycle Completed",
      actualReturnDate: details.returnDate,
      reminderStatus: "Completed",
      reminders: closePendingReminders(cycle),
      completionDetails: details,
      history: [...cycle.history, buildTimelineEntry("Cycle Completed", "Cycle Completed", user, details.remarks)],
      updatedAt: new Date().toISOString(),
    };
    completedRecord.cycleSnapshot = completedCycle;

    setCycles((prev) => prev.filter((item) => item.id !== cycle.id));
    setCompletedHistory((prev) => [completedRecord, ...prev]);
    setShowCompletionModal(false);
    setShowDrawer(false);
    setSelectedCycle(null);

    const nextMonth = nextMonthLabel(cycle.month);
    const nextMonthKey = buildCycleId(nextMonth);
    const existingNext = [...persisted.activeCycles, ...persisted.completedHistory].some((entry) => (entry.month === nextMonth || entry.cycleId === nextMonthKey || (entry as HardDiskCycle).parentId === cycle.id));
    let generatedNextCycle: HardDiskCycle | null = null;
    if (!existingNext) {
      const nextDispatchDate = monthStartDateValue(nextMonth);
      const nextExpectedReturnDate = monthEndDateValue(nextMonth);
      generatedNextCycle = {
        id: makeId("cycle"),
        cycleId: nextMonthKey,
        month: nextMonth,
        dispatchDate: nextDispatchDate,
        expectedReturnDate: nextExpectedReturnDate,
        currentHolder: "RCC",
        status: "Created",
        priority: cycle.priority,
        preparedBy: cycle.preparedBy,
        responsiblePerson: cycle.responsiblePerson,
        remarks: `Auto-generated next monthly cycle for ${formatMonthLabel(nextMonth)}`,
        reminderBeforeReturn: cycle.reminderBeforeReturn,
        reminderStatus: "Pending",
        history: [buildTimelineEntry("Cycle Created", "Created", cycle.preparedBy, "Auto-generated next month cycle")],
        reminders: buildCycleReminders({
          id: makeId("cycle"),
          cycleId: nextMonthKey,
          month: nextMonth,
          dispatchDate: nextDispatchDate,
          expectedReturnDate: nextExpectedReturnDate,
          currentHolder: "RCC",
          status: "Created",
          priority: cycle.priority,
          preparedBy: cycle.preparedBy,
          responsiblePerson: cycle.responsiblePerson,
          remarks: `Auto-generated next monthly cycle for ${formatMonthLabel(nextMonth)}`,
          reminderBeforeReturn: cycle.reminderBeforeReturn,
          reminderStatus: "Pending",
          history: [],
          reminders: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        parentId: cycle.id,
        recurrenceId: cycle.recurrenceId || cycle.id,
      };

      setCycles((prev) => [generatedNextCycle as HardDiskCycle, ...prev]);
      generateInitialHardDiskNotifications(generatedNextCycle);
      addHardDiskNotification(generatedNextCycle, "Next Month Generated", "Next Month Cycle Generated", `The next cycle for ${formatMonthLabel(nextMonth)} has been created.`);
    }

    const persistedActive = (persisted.activeCycles.length > 0 ? persisted.activeCycles : cycles)
      .filter((item) => item.id !== cycle.id && item.month !== nextMonth);
    persistHardDiskCycles(
      generatedNextCycle ? [generatedNextCycle, ...persistedActive] : persistedActive,
      [completedRecord, ...persisted.completedHistory.filter((record) => record.cycleId !== cycle.cycleId)]
    );

    toast.success(`Cycle ${cycle.cycleId} completed and the next month cycle was generated.`);
  };

  const handleUndoCompletion = (record: HardDiskHistoryRecord) => {
    const snapshot = record.cycleSnapshot;
    if (!snapshot || record.status !== "Cycle Completed") {
      toast.error("This cycle cannot be safely restored because its completion snapshot is unavailable.");
      return;
    }
    const persisted = loadPersistedHardDiskCycles();
    const generatedNext = persisted.activeCycles.find((cycle) => cycle.parentId === snapshot.id);
    const restored = { ...snapshot, status: snapshot.history[snapshot.history.length - 2]?.status || "Returned from RSB" as const, completionDetails: undefined, reminderStatus: "Pending" as const, history: snapshot.history.slice(0, -1), updatedAt: new Date().toISOString() };
    completionClaims.current.delete(snapshot.id);
    const activeCycles = [restored, ...persisted.activeCycles.filter((cycle) => cycle.id !== snapshot.id && cycle.id !== generatedNext?.id)];
    persistHardDiskCycles(activeCycles, persisted.completedHistory.filter((item) => item.id !== record.id && item.cycleId !== record.cycleId));
    setCycles(activeCycles);
    setCompletedHistory((prev) => prev.filter((item) => item.id !== record.id && item.cycleId !== record.cycleId));
    removeHardDiskNotifications(snapshot.id);
    if (generatedNext) removeHardDiskNotifications(generatedNext.id);
    generateInitialHardDiskNotifications(restored);
    toast.success("Completion undone successfully.");
  };

  const removeCycle = (cycle: HardDiskCycle) => {
    setCycles((prev) => prev.filter((item) => item.id !== cycle.id));
    setCompletedHistory((prev) => prev.filter((item) => item.cycleId !== cycle.cycleId));
    toast.success(`Removed ${cycle.cycleId}.`);
  };

  const updateCycle = (cycle: HardDiskCycle, values: HardDiskCycleFormValues) => {
    const updated: HardDiskCycle = {
      ...cycle,
      month: values.month,
      dispatchDate: values.dispatchDate,
      expectedReturnDate: values.expectedReturnDate,
      reminderBeforeReturn: values.reminderBeforeReturn,
      priority: values.priority,
      preparedBy: values.preparedBy,
      responsiblePerson: values.responsiblePerson,
      remarks: values.remarks,
      updatedAt: new Date().toISOString(),
    };

    setCycles((prev) => prev.map((item) => (item.id === cycle.id ? updated : item)));
    setEditingCycle(null);
    setShowModal(false);
    toast.success(`Cycle ${cycle.cycleId} updated.`);
  };

  const exportFilteredCycles = () => {
    if (filteredCycles.length === 0) {
      toast.error("No cycles match the current filter set.");
      return;
    }

    filteredCycles.forEach((cycle) => {
      const baseUrl = window.URL.createObjectURL(new Blob([""], { type: "application/pdf" }));
      window.open(baseUrl, "_blank");
      void cycle;
    });
  };

  const kpis = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentCycle = cycles.find((cycle) => cycle.month === currentMonth) ?? cycles[0];
    const overdue = cycles.filter((cycle) => cycle.status !== "Cycle Completed" && cycle.expectedReturnDate < new Date().toISOString().split("T")[0]).length;
    const ready = cycles.filter((cycle) => cycle.status === "Created" || cycle.status === "Ready for Dispatch").length;
    const dispatched = cycles.filter((cycle) => cycle.status === "Dispatched from RCC").length;
    const atRsb = cycles.filter((cycle) => ["Received at RSB", "Monthly Backup Completed", "Return Pending"].includes(cycle.status)).length;
    const returnPending = cycles.filter((cycle) => cycle.status === "Return Pending").length;
    const returned = cycles.filter((cycle) => cycle.status === "Returned from RSB").length;
    const completed = completedHistory.length;
    const upcoming = cycles.filter((cycle) => cycle.month > currentMonth).length;
    return [
      { label: "Current Monthly Cycle", value: currentCycle ? formatMonthLabel(currentCycle.month) : "—" },
      { label: "Ready for Dispatch", value: String(ready) },
      { label: "Dispatched", value: String(dispatched) },
      { label: "At RSB", value: String(atRsb) },
      { label: "Return Pending", value: String(returnPending) },
      { label: "Returned", value: String(returned) },
      { label: "Completed", value: String(completed) },
      { label: "Overdue", value: String(overdue) },
      { label: "Upcoming Month", value: upcoming > 0 ? formatMonthLabel(cycles[0]?.month || currentMonth) : "—" },
    ];
  }, [cycles, completedHistory]);

  return {
    cycles,
    completedHistory,
    filteredCycles,
    selectedCycle,
    showModal,
    editingCycle,
    showCompletionModal,
    showDrawer,
    showHistory,
    searchQuery,
    showFilters,
    filters,
    kpis,
    setShowModal,
    setEditingCycle,
    setShowCompletionModal,
    setShowHistory,
    setSearchQuery,
    setShowFilters,
    setFilters,
    openCycle,
    closeDrawer,
    submitCycle,
    updateCycleStatus,
    completeCycle,
    handleUndoCompletion,
    removeCycle,
    updateCycle,
    markAccountabilityCompleted,
    recordReturn,
    exportFilteredCycles,
    setSelectedCycle,
  };
}
