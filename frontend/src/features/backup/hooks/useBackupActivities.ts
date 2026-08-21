import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { BackupJob, BackupJobFormData, BackupSubTab } from "../types/backup";
import { BACKUP_JOBS } from "../constants/backupConstants";
import type { BackupExecutionFormValues } from "../utils/backupExecutionValidation";
import { matchesBackupJobSearchAndFilters, type BackupJobFilters } from "../utils/backupHelpers";
import {
  buildRecurringBackupJob,
  calculateNextBackupDate,
  calculateReminderDate,
  checkAndGenerateDueBackupReminders,
  clearRemindersForBackup,
} from "../utils/backupReminderUtils";
import { calculateNextDueDate as calculateSharedNextDueDate, calculateReminderDate as calculateSharedReminderDate } from "../../shared/utils/recurringWorkflow";
import { loadPersistedBackupJobs, persistBackupJobs } from "../utils/backupStorage";

export function useBackupActivities() {
  const [subTab, setSubTab] = useState<BackupSubTab>("jobs");
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [showHistory, setShowHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<BackupJobFilters>({
    status: "",
    type: "",
    department: "",
    frequency: "",
    priority: "",
    institutionName: "",
    dueDate: "",
  });
  const [jobs, setJobs] = useState<BackupJob[]>(() => {
    const persisted = loadPersistedBackupJobs();
    return persisted.activeJobs.length > 0 ? persisted.activeJobs : BACKUP_JOBS;
  });
  const [completedJobs, setCompletedJobs] = useState<BackupJob[]>(() => {
    const persisted = loadPersistedBackupJobs();
    return persisted.completedJobs;
  });
  const [selectedJob, setSelectedJob] = useState<BackupJob | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingJob, setEditingJob] = useState<BackupJob | null>(null);
  const [showExecutionForm, setShowExecutionForm] = useState(false);
  const [completingJob, setCompletingJob] = useState<BackupJob | null>(null);
  const [executionFormMode, setExecutionFormMode] = useState<"complete" | "view">("complete");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    persistBackupJobs(jobs, completedJobs);
  }, [jobs, completedJobs]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const shouldOpen = window.sessionStorage.getItem("rcc_omp_backup_open_add");
      if (shouldOpen === "1") {
        setShowAddModal(true);
        window.sessionStorage.removeItem("rcc_omp_backup_open_add");
      }
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    const requestedId = window.sessionStorage.getItem("rcc_omp_backup_selected_id");
    if (requestedId) {
      const match = jobs.find((job) => job.id === requestedId);
      if (match) {
        setSelectedJob(match);
        setShowDrawer(true);
      }
    }
    checkAndGenerateDueBackupReminders(jobs);
  }, [isHydrated, jobs]);

  const filteredJobs = useMemo(() => jobs.filter((job) => matchesBackupJobSearchAndFilters(job, searchQuery, filters.status, filters.type, filters)), [jobs, searchQuery, filters]);

  const filteredCompletedJobs = useMemo(() => completedJobs.filter((job) => matchesBackupJobSearchAndFilters(job, searchQuery, filters.status, filters.type, filters)), [completedJobs, searchQuery, filters]);

  const openJob = (j: BackupJob) => {
    const latest = [...jobs, ...completedJobs].find((jj) => jj.id === j.id) ?? j;
    setSelectedJob(latest);
    setShowDrawer(true);
  };
  const closeDrawer = () => setShowDrawer(false);

  const handleAddJob = (data: BackupJobFormData) => {
    const now = new Date();
    const nextDate = new Date(now);
    nextDate.setDate(nextDate.getDate() + 1);
    // If user provided an initial due date use it, otherwise default to tomorrow
    const initialDueDate = data.initialDueDate && data.initialDueDate.trim() ? data.initialDueDate : nextDate.toISOString().split("T")[0];
    const nextBackup = `${initialDueDate} ${data.backupTime}`;
    const reminderDate = calculateReminderDate(initialDueDate, data.reminder);
    const newJob: BackupJob = {
      id: `backup-${Date.now()}`,
      createdAt: now.toISOString(),
      name: data.name,
      server: "",
      backupType: data.backupType,
      frequency: data.frequency,
      dueDate: initialDueDate,
      lastDueDate: data.lastBackupDate?.trim() ? data.lastBackupDate : undefined,
      nextDueDate: initialDueDate,
      nextBackup,
      backupTime: data.backupTime,
      status: "Upcoming",
      progress: 0,
      user: data.user,
      sizeGB: 0,
      destination: data.destination,
      retention: "30 Days",
      duration: "—",
      department: data.department,
      lastVerified: "—",
      recoveryPoints: 0,
      compressionRatio: "—",
      quota: data.quota,
      description: data.description,
      history: [],
      reminder: data.reminder,
      reminderDate,
      priority: data.priority,
      recurrenceId: `recur-${Date.now()}`,
      originalDueDate: initialDueDate,
      lastBackupDate: data.lastBackupDate?.trim() ? data.lastBackupDate : undefined,
    };
    setJobs((prev) => [...prev, newJob]);
    setShowAddModal(false);
    toast.success(`Backup job "${data.name}" created successfully.`);
  };

  const handleEditJob = (data: BackupJobFormData) => {
    if (!editingJob) return;
    const update = (j: BackupJob): BackupJob => {
      const updatedDueDate = data.initialDueDate ? data.initialDueDate : j.nextDueDate || j.dueDate;
      const updatedNextBackup = `${updatedDueDate} ${data.backupTime}`;
      return j.id !== editingJob.id ? j : {
        ...j,
        name: data.name,
        department: data.department,
        backupType: data.backupType,
        frequency: data.frequency,
        destination: data.destination,
        user: data.user,
        quota: data.quota,
        description: data.description,
        priority: data.priority,
        reminder: data.reminder,
        backupTime: data.backupTime,
        dueDate: updatedDueDate,
        nextDueDate: updatedDueDate,
        nextBackup: updatedNextBackup,
        scheduledNextBackup: updatedDueDate,
        originalDueDate: data.initialDueDate ? data.initialDueDate : j.originalDueDate,
        reminderDate: calculateReminderDate(updatedDueDate, data.reminder),
        lastDueDate: data.lastBackupDate?.trim() ? data.lastBackupDate : j.lastDueDate,
        lastBackupDate: data.lastBackupDate?.trim() ? data.lastBackupDate : j.lastBackupDate,
      };
    };
    setJobs((prev) => prev.map(update));
    if (selectedJob?.id === editingJob.id) setSelectedJob((prev) => (prev ? update(prev) : null));
    setEditingJob(null);
    toast.success("Backup job updated successfully.");
  };

  const openCompletionForm = (j: BackupJob) => {
    setShowDrawer(false);
    setExecutionFormMode("complete");
    setCompletingJob(j);
    setShowExecutionForm(true);
  };

  const openExecutionReview = (j: BackupJob) => {
    setShowDrawer(false);
    setExecutionFormMode("view");
    setCompletingJob(j);
    setShowExecutionForm(true);
  };

  const cancelCompletionForm = () => {
    setShowExecutionForm(false);
    setCompletingJob(null);
    setExecutionFormMode("complete");
  };

  const submitCompletionForm = (values: BackupExecutionFormValues, job: BackupJob) => {
    const sizeValue = Number(values.backupSize);
    let sizeGB = Number.isNaN(sizeValue) ? 0 : sizeValue;

    if (values.unit === "MB") {
      sizeGB = sizeGB / 1024;
    } else if (values.unit === "KB") {
      sizeGB = sizeGB / (1024 * 1024);
    } else if (values.unit === "TB") {
      sizeGB = sizeGB * 1024;
    }

    const completedAt = `${values.backupDate} ${values.backupTime}`;
    const originalDueDate = job.nextBackup.split(" ")[0] || values.backupDate;

    // Follow PM completion flow exactly: determine recurrence, previous due, next due using shared helpers
    const shouldRecur = !!job.frequency && job.frequency !== "One Time";
    const completedCycleDueDate = job.nextBackup.split(" ")[0] || (job.lastBackup || values.backupDate) || new Date().toISOString().split("T")[0];
    const nextDueDate = shouldRecur ? calculateSharedNextDueDate(completedCycleDueDate, job.frequency) : "";
    const nextBackup = shouldRecur && nextDueDate ? `${nextDueDate} ${values.backupTime}` : "";
    const nextReminderDate = shouldRecur && nextDueDate && job.reminder ? calculateSharedReminderDate(nextDueDate, job.reminder) : undefined;

    const nextJob = shouldRecur && nextBackup ? buildRecurringBackupJob(job, completedAt, nextBackup, nextReminderDate, `backup-${Date.now() + 1}`) : null;

    // Duplicate detection using recurrenceId (stable) or fallback to legacy fields (mirror PM)
    const recurrenceKey = job.recurrenceId;
    const existingNext = recurrenceKey
      ? jobs.some((candidate) => candidate.id !== job.id && candidate.recurrenceId === recurrenceKey && candidate.status !== "Completed")
      : jobs.some((candidate) => candidate.id !== job.id && candidate.name === job.name && candidate.server === job.server && candidate.frequency === job.frequency && candidate.status !== "Completed");
    if (existingNext) {
      toast.error("A recurring backup activity for this cycle already exists.");
      setShowExecutionForm(false);
      setCompletingJob(null);
      return;
    }

    const historyEntry = {
      date: completedAt,
      previousDueDate: completedCycleDueDate,
      nextDueDate: nextDueDate || undefined,
      status: "Completed" as const,
      duration: "12m",
      sizeGB: Number(sizeGB.toFixed(2)),
      executionDetails: {
        institutionName: values.institutionName,
        system: values.system,
        department: values.department,
        backupFrequency: values.backupFrequency,
        instrumentName: values.instrumentName,
        backupDate: values.backupDate,
        backupTime: values.backupTime,
        backupSize: Number(sizeValue.toFixed(2)),
        unit: values.unit,
        doneBy: values.doneBy,
        verifiedBy: values.verifiedBy,
        executionNotes: values.executionNotes,
        completedAt,
        verifiedAt: completedAt,
      },
    };

    clearRemindersForBackup(job.id);

    const completedBackup: BackupJob = {
      ...job,
      status: "Completed",
      progress: 100,
      institutionName: values.institutionName || job.institutionName || "",
      lastDueDate: values.backupDate,
      lastBackup: completedAt,
      nextBackup: "",
      sizeGB: Number(sizeGB.toFixed(2)),
      lastVerified: values.verifiedBy,
      history: [historyEntry, ...job.history.slice(0, 9)],
      originalDueDate: originalDueDate,
      completionDate: values.backupDate,
      lastBackupDate: values.backupDate,
      completionRemarks: values.executionNotes,
      completedBy: values.doneBy,
      verifiedBy: values.verifiedBy,
      executionData: {
        institutionName: values.institutionName,
        system: values.system,
        department: values.department,
        backupFrequency: values.backupFrequency,
        instrumentName: values.instrumentName,
        backupDate: values.backupDate,
        backupTime: values.backupTime,
        backupSize: Number(sizeValue.toFixed(2)),
        unit: values.unit,
        doneBy: values.doneBy,
        verifiedBy: values.verifiedBy,
        executionNotes: values.executionNotes,
        completedAt,
        verifiedAt: completedAt,
      },
    };

    if (nextJob) {
      nextJob.institutionName = values.institutionName || job.institutionName;
      nextJob.lastVerified = values.verifiedBy || job.lastVerified;
      nextJob.verifiedBy = values.verifiedBy || job.verifiedBy;
      nextJob.sizeGB = completedBackup.sizeGB;
      nextJob.executionData = completedBackup.executionData;
    }

    setJobs((prev) => prev.filter((jj) => jj.id !== job.id));
    setCompletedJobs((prev) => [completedBackup, ...prev]);

    if (nextJob) {
      setJobs((prev) => [nextJob, ...prev.filter((candidate) => candidate.id !== nextJob.id)]);
      checkAndGenerateDueBackupReminders([nextJob]);
    }

    if (selectedJob?.id === job.id) {
      setSelectedJob(completedBackup);
    }

    setShowExecutionForm(false);
    setCompletingJob(null);
    setExecutionFormMode("complete");
    setShowHistory(true);
    toast.success(`"${job.name}" marked as completed successfully. A new recurring backup job was scheduled.`);
  };

  const handleDuplicate = (j: BackupJob) => {
    const newJob: BackupJob = { ...j, id: `backup-copy-${Date.now()}`, name: `${j.name} (Copy)`, status: "Upcoming", progress: 0, lastBackup: "—", history: [] };
    setJobs((prev) => [...prev, newJob]);
    toast.success(`Duplicated "${j.name}".`);
  };

  const handleSnooze = (j: BackupJob) => {
    setJobs((prev) => prev.map((job) => (job.id !== j.id ? job : { ...job, status: "Paused" })));
    toast.success(`"${j.name}" has been snoozed.`);
  };

  const handleDelete = (j: BackupJob) => {
    clearRemindersForBackup(j.id);
    setJobs((prev) => prev.filter((jj) => jj.id !== j.id));
    setCompletedJobs((prev) => prev.filter((jj) => jj.id !== j.id));
    if (selectedJob?.id === j.id) setShowDrawer(false);
    toast.success(`Backup job "${j.name}" deleted.`);
  };

  return {
    subTab, setSubTab,
    viewMode, setViewMode,
    showHistory, setShowHistory,
    searchQuery, setSearchQuery,
    showFilters, setShowFilters,
    filters, setFilters,
    filteredJobs,
    completedJobs,
    filteredCompletedJobs,
    jobs, setJobs,
    selectedJob, showDrawer, openJob, closeDrawer,
    showAddModal, setShowAddModal,
    editingJob, setEditingJob,
    showExecutionForm, completingJob, executionFormMode, openCompletionForm, openExecutionReview, submitCompletionForm, cancelCompletionForm,
    handleAddJob, handleEditJob, handleDuplicate, handleSnooze, handleDelete,
  };
}
