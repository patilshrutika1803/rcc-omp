import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { HardDiskCycle, HardDiskCycleFormValues, HardDiskFilters, HardDiskHistoryRecord, HardDiskReminderStatus } from "../types/hardDisk";
import { HDD_DEFAULT_FORM_VALUES } from "../constants/hardDiskConstants";
import { loadPersistedHardDiskCycles, persistHardDiskCycles } from "../utils/hardDiskStorage";
import { addHardDiskNotification, buildCycleReminders, calculateHardDiskReminderDate, closePendingReminders, generateInitialHardDiskNotifications, generateLifecycleNotification } from "../utils/hardDiskReminderUtils";

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

function nextMonthLabel(baseMonth: string): string {
  const [yearText, monthText] = baseMonth.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const next = new Date(year, month, 1);
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

  useEffect(() => {
    if (!isHydrated) return;
    if (cycles.length === 0) {
      const initialCycle: HardDiskCycle = {
        id: makeId("cycle"),
        cycleId: buildCycleId(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`),
        month: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`,
        dispatchDate: new Date().toISOString().split("T")[0],
        expectedReturnDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split("T")[0],
        currentHolder: "RCC",
        status: "Created",
        priority: "Medium",
        preparedBy: "Operations Team",
        responsiblePerson: "Backup Team",
        remarks: "Initial monthly hard disk tracker cycle",
        reminderBeforeReturn: "5 Days Before",
        reminderStatus: "Pending",
        history: [buildTimelineEntry("Cycle Created", "Created", "Operations Team", "Monthly hard disk cycle created")],
        reminders: buildCycleReminders({
          id: makeId("cycle"),
          cycleId: "",
          month: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`,
          dispatchDate: new Date().toISOString().split("T")[0],
          expectedReturnDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split("T")[0],
          currentHolder: "RCC",
          status: "Created",
          priority: "Medium",
          preparedBy: "Operations Team",
          responsiblePerson: "Backup Team",
          remarks: "Initial monthly hard disk tracker cycle",
          reminderBeforeReturn: "5 Days Before",
          reminderStatus: "Pending",
          history: [],
          reminders: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setCycles([initialCycle]);
      generateInitialHardDiskNotifications(initialCycle);
    }
  }, [cycles.length, isHydrated]);

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
      dispatchDate: values.dispatchDate,
      expectedReturnDate: values.expectedReturnDate,
      currentHolder: "RCC",
      status: "Created",
      priority: values.priority,
      preparedBy: values.preparedBy,
      responsiblePerson: values.responsiblePerson,
      remarks: values.remarks,
      reminderBeforeReturn: values.reminderBeforeReturn,
      reminderStatus: "Pending",
      history: [buildTimelineEntry("Cycle Created", "Created", values.preparedBy, values.remarks || "Cycle created")],
      reminders: buildCycleReminders({
        id: makeId("cycle"),
        cycleId: buildCycleId(monthKey),
        month: monthKey,
        dispatchDate: values.dispatchDate,
        expectedReturnDate: values.expectedReturnDate,
        currentHolder: "RCC",
        status: "Created",
        priority: values.priority,
        preparedBy: values.preparedBy,
        responsiblePerson: values.responsiblePerson,
        remarks: values.remarks,
        reminderBeforeReturn: values.reminderBeforeReturn,
        reminderStatus: "Pending",
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

  const completeCycle = (cycle: HardDiskCycle, details: HardDiskCycle["completionDetails"], user: string) => {
    if (!details) return;

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

    setCycles((prev) => prev.filter((item) => item.id !== cycle.id));
    setCompletedHistory((prev) => [completedRecord, ...prev]);
    setShowCompletionModal(false);
    setShowDrawer(false);
    setSelectedCycle(null);

    const nextMonth = nextMonthLabel(cycle.month);
    const existingNext = cycles.some((item) => item.month === nextMonth) || completedHistory.some((record) => record.month === nextMonth);
    if (!existingNext) {
      const nextCycle: HardDiskCycle = {
        id: makeId("cycle"),
        cycleId: buildCycleId(nextMonth),
        month: nextMonth,
        dispatchDate: new Date().toISOString().split("T")[0],
        expectedReturnDate: new Date(new Date().getFullYear(), new Date().getMonth() + 2, 0).toISOString().split("T")[0],
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
          cycleId: buildCycleId(nextMonth),
          month: nextMonth,
          dispatchDate: new Date().toISOString().split("T")[0],
          expectedReturnDate: new Date(new Date().getFullYear(), new Date().getMonth() + 2, 0).toISOString().split("T")[0],
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

      setCycles((prev) => [nextCycle, ...prev]);
      generateInitialHardDiskNotifications(nextCycle);
      addHardDiskNotification(nextCycle, "Next Month Generated", "Next Month Cycle Generated", `The next cycle for ${formatMonthLabel(nextMonth)} has been created.`);
    }

    toast.success(`Cycle ${cycle.cycleId} completed and the next month cycle was generated.`);
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
    removeCycle,
    updateCycle,
    exportFilteredCycles,
    setSelectedCycle,
  };
}
