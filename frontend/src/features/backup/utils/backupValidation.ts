import type { BackupJobFormData } from "../types/backup";

// Required-field validation used by the Add/Edit Backup Job modal's Save button.
export function isBackupJobFormValid(form: BackupJobFormData): boolean {
  return Boolean(
    form.name.trim() &&
    form.user.trim() &&
    form.destination.trim() &&
    form.systemId.trim() &&
    form.initialDueDate && String(form.initialDueDate).trim()
  );
}
