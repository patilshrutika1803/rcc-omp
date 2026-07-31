import { calculateNextDueDate as calculateSharedNextDueDate, calculateReminderDate as calculateSharedReminderDate } from "../src/features/shared/utils/recurringWorkflow";
import { buildRecurringBackupJob } from "../src/features/backup/utils/backupReminderUtils";
import type { BackupJob } from "../src/features/backup/types/backup";

function makeJob(id: string, name: string, frequency: string, dueDate: string, time = "02:00", reminder = "1 Day Before") {
  return {
    id,
    name,
    server: "server-1",
    backupType: "Full",
    frequency,
    lastBackup: "—",
    nextBackup: `${dueDate} ${time}`,
    status: "Upcoming",
    progress: 0,
    user: "Alice",
    sizeGB: 0,
    destination: "AWS S3",
    retention: "30 Days",
    duration: "—",
    department: "IT Department",
    lastVerified: "—",
    recoveryPoints: 0,
    compressionRatio: "—",
    quota: 100,
    description: "Test backup",
    history: [],
    reminder,
    reminderDate: calculateSharedReminderDate(dueDate, reminder),
    priority: "Medium",
    recurrenceId: `recur-${id}`,
    parentId: undefined,
  } as BackupJob;
}

function completeBackup(job: BackupJob, backupDate: string, backupTime: string, values: { institutionName: string; system: string; department: string; backupFrequency: string; systemId: string; instrumentName: string; backupSize: number; unit: string; doneBy: string; verifiedBy: string; executionNotes: string; }) {
  const completedAt = `${backupDate} ${backupTime}`;
  const completedCycleDueDate = job.nextBackup.split(" ")[0] || backupDate;
  const shouldRecur = !!job.frequency && job.frequency !== "One Time";
  const nextDueDate = shouldRecur ? calculateSharedNextDueDate(completedCycleDueDate, job.frequency) : "";
  const nextBackup = shouldRecur && nextDueDate ? `${nextDueDate} ${backupTime}` : "";
  const nextReminderDate = shouldRecur && nextDueDate && job.reminder ? calculateSharedReminderDate(nextDueDate, job.reminder) : undefined;
  const nextJob = shouldRecur && nextBackup ? buildRecurringBackupJob(job, completedAt, nextBackup, nextReminderDate, `${job.id}-next`) : null;

  const completedJob = {
    ...job,
    status: "Completed",
    progress: 100,
    lastBackup: completedAt,
    nextBackup: "",
    sizeGB: values.unit === "GB" ? values.backupSize : values.unit === "MB" ? values.backupSize / 1024 : values.unit === "TB" ? values.backupSize * 1024 : values.backupSize,
    lastVerified: values.verifiedBy,
    history: [
      {
        date: completedAt,
        status: "Completed",
        duration: "12m",
        sizeGB: Number(values.backupSize.toFixed(2)),
        executionDetails: {
          ...values,
          backupSize: Number(values.backupSize.toFixed(2)),
        },
      },
      ...job.history,
    ],
    completionDate: backupDate,
    lastBackupDate: backupDate,
    completionRemarks: values.executionNotes,
    completedBy: values.doneBy,
    verifiedBy: values.verifiedBy,
  } as BackupJob;

  return { completedJob, nextJob };
}

function verifyFlow(frequency: string, dueDate: string, reminder: string) {
  const id = `BK-${frequency}`;
  const job = makeJob(id, `Backup ${frequency}`, frequency, dueDate, "02:00", reminder);

  const jobs: BackupJob[] = [job];
  const completedJobs: BackupJob[] = [];

  // Verify initial upcoming job
  if (jobs.length !== 1 || jobs[0].status !== "Upcoming") {
    throw new Error(`Initial job setup failed for ${frequency}`);
  }

  const values = {
    institutionName: "SCADA",
    system: "Server1",
    department: "IT Department",
    backupFrequency: frequency,
    systemId: id,
    instrumentName: "Server",
    backupSize: 20,
    unit: "GB",
    doneBy: "Alice",
    verifiedBy: "Bob",
    executionNotes: "Completed successfully",
  };

  const { completedJob, nextJob } = completeBackup(job, dueDate, "02:00", values);

  const nextJobs = nextJob ? [nextJob] : [];
  const nextReminder = nextJob?.reminderDate;

  const expectedNextDue = frequency === "One Time" ? "" : calculateSharedNextDueDate(dueDate, frequency);
  const expectedNextBackup = expectedNextDue ? `${expectedNextDue} 02:00` : "";
  const expectedReminder = expectedNextDue ? calculateSharedReminderDate(expectedNextDue, reminder) : undefined;

  const errors: string[] = [];
  if (completedJob.status !== "Completed") errors.push("Completed job status is not Completed");
  if (frequency === "One Time" && nextJob !== null) errors.push("One Time created a next job");
  if (frequency !== "One Time" && nextJob === null) errors.push("Next job was not created");
  if (nextJob && nextJob.nextBackup !== expectedNextBackup) errors.push(`Next job due mismatch: expected ${expectedNextBackup}, got ${nextJob.nextBackup}`);
  if (nextJob && nextReminder !== expectedReminder) errors.push(`Next reminder mismatch: expected ${expectedReminder}, got ${nextReminder}`);
  if (nextJob && nextJob.status !== "Upcoming") errors.push(`Next job status is ${nextJob.status}, expected Upcoming`);
  if (frequency !== "One Time" && nextJobs.length !== 1) errors.push("More than one next job created");

  return {
    frequency,
    completedCount: 1,
    nextJobCount: nextJobs.length,
    nextBackup: nextJob?.nextBackup || "",
    nextReminder,
    errors,
  };
}

const scenarios = [
  { frequency: "Daily", dueDate: "2026-08-01", reminder: "1 Day Before" },
  { frequency: "Monthly", dueDate: "2026-08-01", reminder: "7 Days Before" },
  { frequency: "One Time", dueDate: "2026-08-01", reminder: "1 Day Before" },
];

for (const scenario of scenarios) {
  const result = verifyFlow(scenario.frequency, scenario.dueDate, scenario.reminder);
  console.log(JSON.stringify(result, null, 2));
  if (result.errors.length > 0) {
    console.error("ERRORS:", result.errors.join("; "));
    process.exit(1);
  }
}

console.log("All recurring flow scenarios passed.");
