import { useMemo, useState } from "react";
import { toast } from "sonner";
import type {
  QAActivity,
  QAActivityFormState,
  QAColumnsState,
  QAFiltersState,
  QASubTab,
} from "../types/qa";
import { DEFAULT_COLUMNS, DEFAULT_FILTERS, EMPTY_FORM, INITIAL_QA_ACTIVITIES } from "../constants/qaConstants";
import { filterActivities, getDashboardMetrics, getDepartmentBreakdown, getTrendData } from "../utils/qaHelpers";
import { apiCreateQAActivity, apiDeleteQAActivity, apiUpdateQAActivity } from "../services/qaService";
import { validateNewQAActivity } from "../utils/qaValidation";

// ─────────────────────────────────────────────────────────────────────────────
// useQA — centralizes all QA module state, derived data and CRUD handlers.
// QAPage (and its child components) should mostly render JSX and consume
// the values/handlers returned here.
// ─────────────────────────────────────────────────────────────────────────────

export function useQA() {
  const [subTab, setSubTab] = useState<QASubTab>("dashboard");
  const [activities, setActivities] = useState<QAActivity[]>(INITIAL_QA_ACTIVITIES);
  const [search, setSearch] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<QAActivity | null>(null);

  // Loaders
  const [isLoading, setIsLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // New QA Activity State
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState<QAActivityFormState>(EMPTY_FORM);

  // Filter & Columns State
  const [showFilters, setShowFilters] = useState(false);
  const [showColumns, setShowColumns] = useState(false);
  const [filters, setFilters] = useState<QAFiltersState>(DEFAULT_FILTERS);
  const [columns, setColumns] = useState<QAColumnsState>(DEFAULT_COLUMNS);

  // Filtered Data
  const filteredActivities = useMemo(
    () => filterActivities(activities, search, filters),
    [activities, search, filters]
  );

  // Dashboard metrics
  const { totalCount, pendingCount, completedCount, overdueCount, upcomingCount } = useMemo(
    () => getDashboardMetrics(activities),
    [activities]
  );

  const trendData = useMemo(() => getTrendData(activities), [activities]);
  const departmentBreakdown = useMemo(() => getDepartmentBreakdown(activities), [activities]);

  // ───────────────────────────────────────────────────────────────────────
  // Handlers — currently operate on local state, wired through the API
  // layer above so the swap to a real AWS backend is a small, isolated change.
  // ───────────────────────────────────────────────────────────────────────

  const handleUpdateRecord = (updated: QAActivity, newActionNote?: string) => {
    setIsLoading(true);
    const withAction: QAActivity = newActionNote
      ? { ...updated, actionHistory: [{ time: "Just now", note: newActionNote }, ...updated.actionHistory] }
      : updated;

    apiUpdateQAActivity(withAction)
      .then(saved => {
        setActivities(prev => prev.map(p => (p.id === saved.id ? saved : p)));
        setSelectedRecord(prev => (prev && prev.id === saved.id ? saved : prev));
        toast.success("QA Activity Updated Successfully");
      })
      .catch(() => toast.error("Failed to update QA Activity"))
      .finally(() => setIsLoading(false));
  };

  const handleCreate = () => {
    const result = validateNewQAActivity(newForm);
    if (!result.valid) {
      toast.error(result.message);
      return;
    }
    setIsLoading(true);
    const payload: Omit<QAActivity, "id" | "createdAt" | "updatedAt"> = {
      qmsNumber: newForm.qmsNumber,
      qmsType: newForm.qmsType,
      qmsDescription: newForm.qmsDescription,
      department: newForm.department,
      targetDate: newForm.targetDate,
      reminder: newForm.reminder,
      completed: newForm.completed,
      actionHistory: newForm.action.trim() ? [{ time: "Just now", note: newForm.action.trim() }] : [],
    };

    apiCreateQAActivity(payload)
      .then(created => {
        setActivities(prev => [created, ...prev]);
        setShowNew(false);
        setNewForm(EMPTY_FORM);
        toast.success("QA Activity Created Successfully");
      })
      .catch(() => toast.error("Failed to create QA Activity"))
      .finally(() => setIsLoading(false));
  };

  const handleDelete = (id: string) => {
    apiDeleteQAActivity(id)
      .then(() => {
        setActivities(prev => prev.filter(p => p.id !== id));
        toast.success("QA Activity Deleted");
      })
      .catch(() => toast.error("Failed to delete QA Activity"));
  };

  const handleDuplicate = (rec: QAActivity) => {
    const payload: Omit<QAActivity, "id" | "createdAt" | "updatedAt"> = {
      qmsNumber: `${rec.qmsNumber}-COPY`,
      qmsType: rec.qmsType,
      qmsDescription: rec.qmsDescription,
      department: rec.department,
      targetDate: rec.targetDate,
      reminder: rec.reminder,
      completed: "Pending",
      actionHistory: [],
    };
    apiCreateQAActivity(payload)
      .then(created => {
        setActivities(prev => [created, ...prev]);
        toast.success("QA Activity Duplicated");
      })
      .catch(() => toast.error("Failed to duplicate QA Activity"));
  };

  const handleGlobalExport = () => {
    // Placeholder – Word export will be implemented in a future release
  };

  return {
    // Tabs
    subTab, setSubTab,

    // Data
    activities, filteredActivities,

    // Search
    search, setSearch,

    // Drawer
    selectedRecord, setSelectedRecord,

    // Loading / menus
    isLoading, openMenuId, setOpenMenuId,

    // New activity modal
    showNew, setShowNew, newForm, setNewForm,

    // Filters / columns
    showFilters, setShowFilters, showColumns, setShowColumns, filters, setFilters, columns, setColumns,

    // Dashboard metrics
    totalCount, pendingCount, completedCount, overdueCount, upcomingCount,
    trendData, departmentBreakdown,

    // Handlers
    handleUpdateRecord, handleCreate, handleDelete, handleDuplicate, handleGlobalExport,
  };
}

export type UseQAReturn = ReturnType<typeof useQA>;
