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
import { loadPersistedBackupJobs, persistBackupJobs } from "../utils/backupStorage";

export function useBackupActivities() {
  const [subTab, setSubTab] = useState<BackupSubTab>("jobs");
  const [viewMode, setViewMode] = useState<"table" | "card" | "calendar">("table");
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
    return persisted.length > 0 ? persisted : BACKUP_JOBS;
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
    persistBackupJobs(jobs);
  }, [jobs]);

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

  const completedJobs = useMemo(() => jobs.filter((job) => job.status === "Completed"), [jobs]);
  const filteredCompletedJobs = useMemo(() => completedJobs.filter((job) => matchesBackupJobSearchAndFilters(job, searchQuery, filters.status, filters.type, filters)), [completedJobs, searchQuery, filters]);

  const openJob = (j: BackupJob) => {
    const latest = jobs.find((jj) => jj.id === j.id) ?? j;
    setSelectedJob(latest);
    setShowDrawer(true);
  };
  const closeDrawer = () => setShowDrawer(false);

  const handleAddJob = (data: BackupJobFormData) => {
    const now = new Date();
    const nextDate = new Date(now);
    nextDate.setDate(nextDate.getDate() + 1);
    const nextBackup = `${nextDate.toISOString().split("T")[0]} ${data.backupTime}`;
    const reminderDate = calculateReminderDate(nextBackup, data.reminder);
    const newJob: BackupJob = {
      id: `BK-${Date.now()}`,
      name: data.name,
      server: "",
      backupType: data.backupType,
      frequency: data.frequency,
      lastBackup: "—",
      nextBackup,
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
    };
    setJobs((prev) => [...prev, newJob]);
    setShowAddModal(false);
    toast.success(`Backup job "${data.name}" created successfully.`);
  };

  const handleEditJob = (data: BackupJobFormData) => {
    if (!editingJob) return;
    const update = (j: BackupJob): BackupJob => (j.id !== editingJob.id ? j : {
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
      reminderDate: calculateReminderDate(j.nextBackup, data.reminder),
    });
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
    const shouldRecur = !!job.frequency && job.frequency !== "One Time";
    const nextBackup = shouldRecur ? calculateNextBackupDate(job.nextBackup, job.frequency, values.backupTime) : job.nextBackup;
    const nextReminderDate = shouldRecur ? calculateReminderDate(nextBackup, job.reminder) : undefined;
    const nextJob = shouldRecur ? buildRecurringBackupJob(job, completedAt, nextBackup, nextReminderDate, `BK-${Date.now() + 1}`) : null;
    const existingNext = jobs.some((candidate) => candidate.id !== job.id && candidate.recurringParentId === job.id && candidate.status !== "Completed");
    if (existingNext) {
      toast.error("A recurring backup activity for this cycle already exists.");
      setShowExecutionForm(false);
      setCompletingJob(null);
      return;
    }

    const historyEntry = {
      date: completedAt,
      status: "Completed" as const,
      duration: "12m",
      sizeGB: Number(sizeGB.toFixed(2)),
      executionDetails: {
        institutionName: values.institutionName,
        system: values.system,
        department: values.department,
        backupFrequency: values.backupFrequency,
        systemId: values.systemId,
        instrumentName: values.instrumentName,
        backupDate: values.backupDate,
        backupTime: values.backupTime,
        backupSize: Number(sizeValue.toFixed(2)),
        unit: values.unit,
        doneBy: values.doneBy,
        verifiedBy: values.verifiedBy,
        executionNotes: values.executionNotes,
      },
    };

    clearRemindersForBackup(job.id);
    setJobs((prev) => {
      const updated = prev.map((jj): BackupJob => (jj.id !== job.id ? jj : ({
        ...jj,
        status: "Completed",
        progress: 100,
        lastBackup: completedAt,
        nextBackup: job.nextBackup,
        sizeGB: Number(sizeGB.toFixed(2)),
        lastVerified: values.verifiedBy,
        history: [historyEntry, ...jj.history.slice(0, 9)],
      })));
      if (!nextJob) {
        return updated;
      }
      return [nextJob, ...updated.filter((candidate) => candidate.id !== nextJob.id)];
    });
    if (nextJob) {
      checkAndGenerateDueBackupReminders([nextJob]);
    }

    if (selectedJob?.id === job.id) {
      setSelectedJob((prev) => (prev ? {
        ...prev,
        status: "Completed",
        progress: 100,
        lastBackup: completedAt,
        nextBackup: job.nextBackup,
        sizeGB: Number(sizeGB.toFixed(2)),
        lastVerified: values.verifiedBy,
        history: [historyEntry, ...prev.history.slice(0, 9)],
      } : null));
    }

    setShowExecutionForm(false);
    setCompletingJob(null);
    setExecutionFormMode("complete");
    setShowHistory(true);
    toast.success(`"${job.name}" marked as completed successfully. A new recurring backup job was scheduled.`);
  };

  const handleDuplicate = (j: BackupJob) => {
    const newJob: BackupJob = { ...j, id: `BK-${Date.now()}`, name: `${j.name} (Copy)`, status: "Upcoming", progress: 0, lastBackup: "—", history: [] };
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
