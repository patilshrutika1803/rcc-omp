import type { QAActivityFormState } from "../types/qa";

// ─────────────────────────────────────────────────────────────────────────────
// QA MODULE — VALIDATION
// ─────────────────────────────────────────────────────────────────────────────

export interface QAValidationResult {
  valid: boolean;
  message?: string;
}

// Shared required-field check used by both the "New QA Activity" modal and
// the drawer's "Edit QA Activity" form — mirrors the original inline checks.
function validateRequiredFields(form: QAActivityFormState): QAValidationResult {
  const missing: string[] = [];
  if (!form.qmsNumber) missing.push("QMS Number");
  if (!form.qmsType) missing.push("QMS Type");
  if (!form.qmsDescription) missing.push("QMS Description");
  if (!form.department) missing.push("Department");
  // Accept either targetDate or dueDate as the date field
  if (!form.dueDate && !form.targetDate) missing.push("Due Date");
  if (!form.reminder) missing.push("Reminder");

  if (missing.length > 0) {
    return { valid: false, message: `Missing: ${missing.join(", ")}` };
  }
  return { valid: true };
}

export function getMissingFields(form: QAActivityFormState): string[] {
  const missing: string[] = [];
  if (!form.qmsNumber) missing.push("qmsNumber");
  if (!form.qmsType) missing.push("qmsType");
  if (!form.qmsDescription) missing.push("qmsDescription");
  if (!form.department) missing.push("department");
  if (!form.dueDate && !form.targetDate) missing.push("dueDate");
  if (!form.reminder) missing.push("reminder");
  return missing;
}

export function validateNewQAActivity(form: QAActivityFormState): QAValidationResult {
  const result = validateRequiredFields(form);
  if (!result.valid) {
    return { valid: false, message: `Validation Failed: ${result.message}` };
  }
  return result;
}

export function validateEditQAActivity(form: QAActivityFormState): QAValidationResult {
  const result = validateRequiredFields(form);
  if (!result.valid) {
    return { valid: false, message: `Validation Failed: ${result.message}` };
  }
  return result;
}

export function validateActionNote(note: string): QAValidationResult {
  if (!note.trim()) {
    return { valid: false, message: "Please enter an action / remark before saving." };
  }
  return { valid: true };
}
