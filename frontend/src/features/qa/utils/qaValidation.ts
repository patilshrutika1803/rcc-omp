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
  if (
    !form.qmsNumber ||
    !form.qmsType ||
    !form.qmsDescription ||
    !form.department ||
    !form.targetDate ||
    !form.reminder
  ) {
    return { valid: false, message: "Please fill in all required fields." };
  }
  return { valid: true };
}

export function validateNewQAActivity(form: QAActivityFormState): QAValidationResult {
  const result = validateRequiredFields(form);
  if (!result.valid) {
    return { valid: false, message: "Validation Failed: Please fill all required fields" };
  }
  return result;
}

export function validateEditQAActivity(form: QAActivityFormState): QAValidationResult {
  const result = validateRequiredFields(form);
  if (!result.valid) {
    return { valid: false, message: "Validation Failed: Please fill in all required fields." };
  }
  return result;
}

export function validateActionNote(note: string): QAValidationResult {
  if (!note.trim()) {
    return { valid: false, message: "Please enter an action / remark before saving." };
  }
  return { valid: true };
}
