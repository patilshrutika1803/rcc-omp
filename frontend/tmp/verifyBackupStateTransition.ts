import type { BackupJob, BackupJobFormData } from "../src/features/backup/types/backup";
import type { BackupExecutionFormValues } from "../src/features/backup/utils/backupExecutionValidation";
import { calculateReminderDate, calculateNextBackupDate, buildRecurringBackupJob, checkAndGenerateDueBackupReminders, clearRemindersForBackup } from "../src/features/backup/utils/backupReminderUtils";
import { calculateNextDueDate as calculateSharedNextDueDate, calculateReminderDate as calculateSharedReminderDate } from "../src/features/shared/utils/recurringWorkflow";

function handleAddJob(data: BackupJobFormData, existingJobs: BackupJob[]): BackupJob {
  const now = new Date();
  const nextDate = new Date(now);
  nextDate.setDate(nextDate.getDate() + 1);
  const dueDate = data.dueDate && data.dueDate.trim() ? data.dueDate : nextDate.toISOString().split("T")[0];
  const nextBackup = `${dueDate} ${data.backupTime}`;
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
    recurrenceId: `recur-${Date.now()}`,
    originalDueDate: dueDate,
  };
  return newJob;
}

function submitCompletionForm(values: BackupExecutionFormValues, job: BackupJob, jobs: BackupJob[], selectedJob: BackupJob | null) {
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
  const shouldRecur = !!job.frequency && job.frequency !== "One Time";
  const completedCycleDueDate = job.nextBackup.split(" ")[0] || (job.lastBackup || values.backupDate) || new Date().toISOString().split("T")[0];
  const nextDueDate = shouldRecur ? calculateSharedNextDueDate(completedCycleDueDate, job.frequency) : "";
  const nextBackup = shouldRecur && nextDueDate ? `${nextDueDate} ${values.backupTime}` : "";
  const nextReminderDate = shouldRecur && nextDueDate && job.reminder ? calculateSharedReminderDate(nextDueDate, job.reminder) : undefined;
  const nextJob = shouldRecur && nextBackup ? buildRecurringBackupJob(job, completedAt, nextBackup, nextReminderDate, `BK-${Date.now() + 1}`) : null;
  const recurrenceKey = job.recurrenceId;
  const existingNext = recurrenceKey
    ? jobs.some((candidate) => candidate.id !== job.id && candidate.recurrenceId === recurrenceKey && candidate.status !== "Completed")
    : jobs.some((candidate) => candidate.id !== job.id && candidate.name === job.name && candidate.server === job.server && candidate.frequency === job.frequency && candidate.status !== "Completed");
  if (existingNext) {
    throw new Error("A recurring backup activity for this cycle already exists.");
  }

  clearRemindersForBackup(job.id);

  const completedBackup: BackupJob = {
    ...job,
    status: "Completed",
    progress: 100,
    lastBackup: completedAt,
    nextBackup: "",
    sizeGB: Number(sizeGB.toFixed(2)),
    lastVerified: values.verifiedBy,
    history: [
      {
        date: completedAt,
        status: "Completed",
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
      },
      ...job.history.slice(0, 9),
    ],
    originalDueDate: originalDueDate,
    completionDate: values.backupDate,
    lastBackupDate: values.backupDate,
    completionRemarks: values.executionNotes,
    completedBy: values.doneBy,
    verifiedBy: values.verifiedBy,
  };

  const nextJobs = jobs.filter((jj) => jj.id !== job.id);
  const completedJobs = [completedBackup];
  if (nextJob) {
    nextJobs.unshift(nextJob);
    checkAndGenerateDueBackupReminders([nextJob]);
  }
  return { nextJobs, completedJobs, completedBackup, nextJob };
}

function runScenario(frequency: string, dueDate: string) {
  const formData: BackupJobFormData = {
    name: `Backup ${frequency}`,
    department: "IT Department",
    backupType: "Full",
    frequency,
    dueDate,
    destination: "AWS S3",
    backupTime: "02:00",
    user: "Alice",
    quota: 100,
    description: "Test backup",
    priority: "Medium",
    reminder: frequency === "One Time" ? "1 Day Before" : "7 Days Before",
  };

  const initialJobs: BackupJob[] = [];
  const newJob = handleAddJob(formData, initialJobs);
  let jobs = [newJob];
  const selectedJob = newJob;

  if (jobs.length !== 1 || jobs[0].status !== "Upcoming") {
    throw new Error(`Initial upcoming job missing for ${frequency}`);
  }

  const executionValues: BackupExecutionFormValues = {
    institutionName: "SCADA",
    system: "Server1",
    department: "IT Department",
    backupFrequency: frequency,
    systemId: newJob.id,
    instrumentName: "Server",
    backupDate: dueDate,
    backupTime: "02:00",
    backupSize: "20",
    unit: "GB",
    doneBy: "Alice",
    verifiedBy: "Bob",
    executionNotes: "Completed successfully",
  };

  const { nextJobs, completedJobs, nextJob } = submitCompletionForm(executionValues, selectedJob, jobs, selectedJob);

  return {
    frequency,
    initialUpcomingCount: jobs.length,
    completedCount: completedJobs.length,
    nextUpcomingCount: nextJobs.filter((j) => j.status === "Upcoming").length,
    nextJob: nextJob ? { id: nextJob.id, nextBackup: nextJob.nextBackup, reminderDate: nextJob.reminderDate, recurrenceId: nextJob.recurrenceId, parentId: nextJob.parentId } : null,
    nextJobCount: nextJob ? 1 : 0,
  };
}

for (const scenario of [
  { frequency: "Daily", dueDate: "2026-08-01" },
  { frequency: "Monthly", dueDate: "2026-08-01" },
  { frequency: "One Time", dueDate: "2026-08-01" },
]) {
  console.log(JSON.stringify(runScenario(scenario.frequency, scenario.dueDate), null, 2));
}
