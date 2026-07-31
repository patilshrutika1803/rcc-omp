import type { BackupJob } from "../src/features/backup/types/backup";
import {
  buildRecurringBackupJob,
  calculateNextBackupDate,
  calculateReminderDate,
  checkAndGenerateDueBackupReminders,
} from "../src/features/backup/utils/backupReminderUtils";
import {
  calculateNextDueDate as calculateSharedNextDueDate,
  calculateReminderDate as calculateSharedReminderDate,
} from "../src/features/shared/utils/recurringWorkflow";

function makeJob(id: string, frequency: string, dueDate: string, reminder: string) {
  return {
    id,
    name: `Backup ${frequency}`,
    server: "server-1",
    backupType: "Full",
    frequency,
    lastBackup: "—",
    nextBackup: `${dueDate} 02:00`,
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
    reminderDate: calculateReminderDate(`${dueDate} 02:00`, reminder),
    priority: "Medium",
    recurrenceId: `recur-${id}`,
  } as BackupJob;
}

function completeActualJob(job: BackupJob, backupDate: string, backupTime: string) {
  const completedAt = `${backupDate} ${backupTime}`;
  const shouldRecur = !!job.frequency && job.frequency !== "One Time";
  const nextBackup = shouldRecur ? calculateNextBackupDate(job.nextBackup, job.frequency, backupTime) : "";
  const nextReminderDate = shouldRecur ? calculateReminderDate(nextBackup, job.reminder) : undefined;
  const nextJob = shouldRecur && nextBackup ? buildRecurringBackupJob(job, completedAt, nextBackup, nextReminderDate, `${job.id}-next`) : null;

  const completedJob = {
    ...job,
    status: "Completed",
    progress: 100,
    lastBackup: completedAt,
    nextBackup: "",
    sizeGB: 20,
    lastVerified: "Bob",
    history: [
      {
        date: completedAt,
        status: "Completed",
        duration: "12m",
        sizeGB: 20,
        executionDetails: {
          institutionName: "SCADA",
          system: "Server1",
          department: job.department,
          backupFrequency: job.frequency,
          systemId: job.id,
          instrumentName: "Server",
          backupDate,
          backupTime,
          backupSize: 20,
          unit: "GB",
          doneBy: "Alice",
          verifiedBy: "Bob",
          executionNotes: "Test complete.",
        },
      },
    ],
  } as BackupJob;
  return { completedJob, nextJob };
}

function checkScenario(frequency: string, dueDate: string, reminder: string) {
  const job = makeJob(`BK-${frequency}`, frequency, dueDate, reminder);
  const { completedJob, nextJob } = completeActualJob(job, dueDate, "02:00");
  const nextReminder = nextJob?.reminderDate;
  const expectedNextDue = frequency === "One Time" ? "" : calculateSharedNextDueDate(dueDate, frequency);
  const expectedNextBackup = expectedNextDue ? `${expectedNextDue} 02:00` : "";
  const expectedNextReminder = expectedNextDue ? calculateSharedReminderDate(expectedNextDue, reminder) : undefined;
  const reminderNotifications = nextJob ? checkAndGenerateDueBackupReminders([nextJob]) : 0;

  return {
    frequency,
    initialUpcoming: job.status === "Upcoming",
    completedHistory: completedJob.status === "Completed",
    nextJobCreated: nextJob !== null,
    nextBackup: nextJob?.nextBackup || "",
    nextReminder: nextReminder || "",
    expectedNextBackup,
    expectedNextReminder,
    notificationGeneratedToday: reminderNotifications,
    recurrenceId: nextJob?.recurrenceId,
    parentId: nextJob?.parentId,
  };
}

for (const scenario of [
  { frequency: "Daily", dueDate: "2026-08-01", reminder: "1 Day Before" },
  { frequency: "Monthly", dueDate: "2026-08-01", reminder: "7 Days Before" },
  { frequency: "One Time", dueDate: "2026-08-01", reminder: "1 Day Before" },
]) {
  console.log(JSON.stringify(checkScenario(scenario.frequency, scenario.dueDate, scenario.reminder), null, 2));
}
