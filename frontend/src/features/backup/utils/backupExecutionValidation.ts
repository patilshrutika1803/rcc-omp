export interface BackupExecutionFormValues {
  institutionName: string;
  system: string;
  department: string;
  backupFrequency: string;
  systemId: string;
  instrumentName: string;
  backupDate: string;
  backupTime: string;
  backupSize: string;
  unit: string;
  doneBy: string;
  verifiedBy: string;
  executionNotes: string;
}

export type BackupExecutionFormErrors = Partial<Record<keyof BackupExecutionFormValues, string>>;

export function validateBackupExecutionForm(values: BackupExecutionFormValues): BackupExecutionFormErrors {
  const errors: BackupExecutionFormErrors = {};

  if (!values.institutionName.trim()) {
    errors.institutionName = "Institution name is required.";
  }

  if (!values.instrumentName.trim()) {
    errors.instrumentName = "Instrument name is required.";
  }

  if (!values.backupDate) {
    errors.backupDate = "Backup date is required.";
  }

  if (!values.backupTime) {
    errors.backupTime = "Backup time is required.";
  }

  if (!values.backupSize.trim()) {
    errors.backupSize = "Backup size is required.";
  } else {
    const parsedSize = Number(values.backupSize);
    if (Number.isNaN(parsedSize) || parsedSize <= 0) {
      errors.backupSize = "Backup size must be a positive number.";
    }
  }

  if (!values.unit.trim()) {
    errors.unit = "Unit is required.";
  }

  if (!values.doneBy.trim()) {
    errors.doneBy = "Done by is required.";
  }

  if (!values.verifiedBy.trim()) {
    errors.verifiedBy = "Verified by is required.";
  }

  if (!values.executionNotes.trim()) {
    errors.executionNotes = "Execution notes are required.";
  }

  return errors;
}
