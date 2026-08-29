import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { QAActivity, QAActivityFormState, QAColumnsState, QAFiltersState, QAViewMode } from "../types/qa";
import { DEFAULT_COLUMNS, DEFAULT_FILTERS, EMPTY_FORM, INITIAL_QA_ACTIVITIES } from "../constants/qaConstants";
import { calculateReminderDate, filterActivities, getDashboardMetrics, getDepartmentBreakdown, getTrendData } from "../utils/qaHelpers";
import { validateNewQAActivity } from "../utils/qaValidation";
import { loadPersistedQAActivities, persistQAActivities } from "../utils/qaStorage";
import { addNotification, hasNotificationForQA, removeQANotifications } from "../../notificataions/utils/notificationStorage";
import type { Notification } from "../../notificataions/types/notification";
import { getLocalTodayDateKey, isDueDateTimeReached } from "../../shared/utils/recurringWorkflow";

export function useQA() {
  const completionClaims = useRef(new Set<string>());
  const [viewMode, setViewMode] = useState<QAViewMode>("table");
  const [search, setSearch] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<QAActivity | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [editingRecord, setEditingRecord] = useState<QAActivity | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showColumns, setShowColumns] = useState(false);
  const [filters, setFilters] = useState<QAFiltersState>(DEFAULT_FILTERS);
  const [columns, setColumns] = useState<QAColumnsState>(DEFAULT_COLUMNS);
  const [newForm, setNewForm] = useState<QAActivityFormState>(EMPTY_FORM);
  const persistedActivities = useMemo(() => loadPersistedQAActivities(), []);
  const [activities, setActivities] = useState<QAActivity[]>(() => (persistedActivities.length > 0 ? persistedActivities : INITIAL_QA_ACTIVITIES));
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    persistQAActivities(activities);
  }, [activities]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const shouldOpen = window.sessionStorage.getItem("rcc_omp_qa_open_add");
      if (shouldOpen === "1") {
        setShowNew(true);
        window.sessionStorage.removeItem("rcc_omp_qa_open_add");
      }
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    const requestedId = window.sessionStorage.getItem("rcc_omp_qa_selected_id");
    if (requestedId) {
      const match = activities.find((activity) => activity.id === requestedId);
      if (match) {
        setSelectedRecord(match);
        setShowDrawer(true);
      }
      window.sessionStorage.removeItem("rcc_omp_qa_selected_id");
    }
  }, [activities, isHydrated]);

  const filteredActivities = useMemo(() => filterActivities(activities, search, filters), [activities, search, filters]);
  const { totalCount, pendingCount, completedCount, overdueCount } = useMemo(() => getDashboardMetrics(activities), [activities]);
  const trendData = useMemo(() => getTrendData(activities), [activities]);
  const departmentBreakdown = useMemo(() => getDepartmentBreakdown(activities), [activities]);

  const openRecord = (record: QAActivity | null) => {
    if (!record) return;
    const latest = activities.find((activity) => activity.id === record.id) ?? record;
    setSelectedRecord(latest);
    setShowDrawer(true);
  };

  const closeDrawer = () => {
    setShowDrawer(false);
    setSelectedRecord(null);
    setEditingRecord(null);
  };

  const createReminderNotification = (activity: QAActivity): Notification => {
    const dueDate = activity.dueDate || activity.targetDate;
    const now = new Date();
    const timeStr = now.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const severity = activity.priority === "Critical" || activity.priority === "High" ? "critical" : activity.priority === "Medium" ? "warning" : "info";
    const notificationKey = `qa-reminder-${activity.id}-${activity.reminderDate || dueDate}`;

    return {
      id: notificationKey,
      notificationKey,
      title: "QA Activity Reminder",
      message: `QMS Number:\n${activity.qmsNumber}\n\nQMS Type:\n${activity.qmsType}\n\nDepartment:\n${activity.department}\n\nDue Date:\n${dueDate}\n\nPriority:\n${activity.priority}\n\nReminder:\n${activity.reminder}\n\nNotification Type:\nQA Activity`,
      category: "qa",
      severity,
      time: timeStr,
      createdAt: new Date().toISOString(),
      read: false,
      archived: false,
      route: "/qa-activities",
      department: activity.department,
      assignedUser: activity.assignedUser,
      dueDate,
      notificationType: "QA Activity",
      priority: activity.priority,
      qaActivityId: activity.id,
      qaActivityNumber: activity.qmsNumber,
    } as Notification & { qaActivityId?: string; qaActivityNumber?: string };
  };

  const generateReminderIfDue = (activity: QAActivity) => {
    if (!activity.reminderDate || activity.status === "Completed") return false;
    if (activity.reminderDate > getLocalTodayDateKey()) return false;

    const notificationKey = `qa-reminder-${activity.id}-${activity.reminderDate}`;
    if (hasNotificationForQA(activity.id, notificationKey)) return false;

    const notification = createReminderNotification(activity);
    addNotification({ ...notification, id: notificationKey, notificationKey });
    return true;
  };

  useEffect(() => {
    if (!isHydrated) return;
    activities.forEach((activity) => generateReminderIfDue(activity));

    const interval = setInterval(() => {
      const current = loadPersistedQAActivities();
      current.forEach((activity) => generateReminderIfDue(activity));
    }, 1000 * 60 * 60);

    return () => clearInterval(interval);
  }, [activities, isHydrated]);

  const handleCreate = () => {
    const result = validateNewQAActivity(newForm);
    if (!result.valid) {
      toast.error(result.message);
      return;
    }

    const dueDate = newForm.dueDate || newForm.targetDate;
    const reminderDate = calculateReminderDate(dueDate, newForm.reminder);
    const createdAt = new Date().toISOString();
    const newActivity: QAActivity = {
      id: `QA-${Date.now()}`,
      qmsNumber: newForm.qmsNumber,
      qmsType: newForm.qmsType,
      qmsDescription: newForm.qmsDescription,
      department: newForm.department,
      targetDate: newForm.targetDate,
      dueDate,
      reminder: newForm.reminder,
      reminderDate,
      priority: newForm.priority,
      assignedUser: newForm.assignedUser,
      status: "Upcoming",
      actionHistory: [],
      actionNotes: "",
      createdAt,
      updatedAt: createdAt,
    };

    setActivities((prev) => [newActivity, ...prev]);
    setShowNew(false);
    setNewForm(EMPTY_FORM);
    generateReminderIfDue(newActivity);
    toast.success("QA Activity created successfully.");
  };

  const handleUpdateRecord = (updated: QAActivity, newActionNote?: string) => {
    const current = activities.find((activity) => activity.id === updated.id);
    const shouldClearReminder = current && (current.dueDate !== updated.dueDate || current.reminder !== updated.reminder);

    const base: QAActivity = { ...updated, updatedAt: new Date().toISOString() };
    const dueDate = base.dueDate || base.targetDate;
    const reminderDate = calculateReminderDate(dueDate, base.reminder);
    const withAction: QAActivity = newActionNote
      ? { ...base, reminderDate, actionHistory: [{ time: "Just now", note: newActionNote }, ...base.actionHistory], actionNotes: newActionNote }
      : { ...base, reminderDate };

    if (shouldClearReminder) {
      removeQANotifications(updated.id);
    }

    setActivities((prev) => prev.map((activity) => (activity.id === withAction.id ? withAction : activity)));
    setSelectedRecord(withAction);
    setEditingRecord(null);
    setShowDrawer(false);
    generateReminderIfDue(withAction);
    toast.success("QA Activity updated successfully.");
  };

  const handleEdit = (activity: QAActivity) => {
    setEditingRecord(activity);
    setSelectedRecord(activity);
    setShowDrawer(false);
  };

  const handleComplete = (activity: QAActivity, actionNote?: string, completedBy?: string) => {
    const persistedActivities = loadPersistedQAActivities();
    const persistedActivity = persistedActivities.find((item) => item.id === activity.id);
    if (activity.status === "Completed" || persistedActivity?.status === "Completed" || completionClaims.current.has(activity.id)) {
      toast.info("Activity is already completed.");
      return;
    }
    if (!isDueDateTimeReached(activity.dueDate || activity.targetDate)) {
      toast.error("Cannot complete before the scheduled due date.");
      return;
    }
    completionClaims.current.add(activity.id);

    const completedAt = new Date().toISOString();
    const dueDate = activity.dueDate || activity.targetDate;
    const completedActivity: QAActivity = {
      ...activity,
      status: "Completed",
      updatedAt: completedAt,
      completionDate: completedAt.split("T")[0],
      completionNotes: actionNote?.trim() || activity.actionNotes || "",
      completedBy: completedBy?.trim() || activity.completedBy || "Current User",
      actionHistory: actionNote ? [{ time: "Just now", note: actionNote }, ...activity.actionHistory] : activity.actionHistory,
      actionNotes: actionNote || activity.actionNotes || "",
    };

    removeQANotifications(activity.id);
    const nextActivities = (persistedActivities.length > 0 ? persistedActivities : activities)
      .map((item) => item.id === activity.id ? completedActivity : item);
    setActivities(nextActivities);
    persistQAActivities(nextActivities);

    setShowDrawer(false);
    setSelectedRecord(null);
    toast.success(`"${activity.qmsNumber}" marked as completed.`);
  };

  const handleUndoCompletion = (activity: QAActivity) => {
    if (activity.status !== "Completed") {
      toast.error("This QA completion cannot be undone in its current state.");
      return;
    }
    const restored: QAActivity = { ...activity, status: "Upcoming", completionDate: undefined, completionNotes: undefined, completedBy: undefined, updatedAt: new Date().toISOString() };
    completionClaims.current.delete(activity.id);
    const nextActivities = activities.map((item) => item.id === activity.id ? restored : item);
    setActivities(nextActivities);
    persistQAActivities(nextActivities);
    generateReminderIfDue(restored);
    toast.success("Completion undone successfully.");
  };

  const handleDuplicate = (record: QAActivity) => {
    const duplicate: QAActivity = {
      ...record,
      id: `QA-${Date.now()}`,
      qmsNumber: `${record.qmsNumber}-COPY`,
      status: "Upcoming",
      dueDate: record.dueDate,
      targetDate: record.targetDate,
      reminderDate: record.reminderDate,
      actionHistory: [],
      actionNotes: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setActivities((prev) => [duplicate, ...prev]);
    generateReminderIfDue(duplicate);
    toast.success("QA Activity duplicated.");
  };

  const handleDelete = (id: string) => {
    removeQANotifications(id);
    setActivities((prev) => prev.filter((activity) => activity.id !== id));
    if (selectedRecord?.id === id) {
      setShowDrawer(false);
      setSelectedRecord(null);
    }
    toast.success("QA Activity deleted.");
  };

  return {
    viewMode, setViewMode,
    search, setSearch,
    selectedRecord, setSelectedRecord,
    showDrawer, setShowDrawer,
    showNew, setShowNew, newForm, setNewForm,
    editingRecord, setEditingRecord,
    openMenuId, setOpenMenuId,
    showFilters, setShowFilters, showColumns, setShowColumns, filters, setFilters, columns, setColumns,
    activities, filteredActivities,
    totalCount, pendingCount, completedCount, overdueCount,
    trendData, departmentBreakdown,
    openRecord, closeDrawer, handleCreate, handleUpdateRecord, handleEdit, handleComplete, handleUndoCompletion, handleDuplicate, handleDelete,
  };
}

export type UseQAReturn = ReturnType<typeof useQA>;
