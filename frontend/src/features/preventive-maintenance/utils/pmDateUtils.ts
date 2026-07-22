// ─────────────────────────────────────────────────────────────────────────────
// Preventive Maintenance — Date Utilities
// Centralized date utilities used across all PM components.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculate the number of days between now and a target date.
 * Positive = future, Negative = past, Zero = today.
 */
export function daysUntil(dateStr: string): number {
  const due = new Date(dateStr);
  const now = new Date();
  // Reset time to midnight for accurate day comparison
  const dueMidnight = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((dueMidnight.getTime() - nowMidnight.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Format a date string to "23 Jul 2026" format (en-IN locale).
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return "\u2014";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

/**
 * Format a date string including time: "23 Jul 2026, 02:30 PM".
 */
export function formatDateTime(dateStr: string): string {
  if (!dateStr) return "\u2014";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Get a human-readable relative label for a date compared to today.
 *
 * Examples:
 *   - Same day as today  → "Today"
 *   - Tomorrow           → "Tomorrow"
 *   - Yesterday          → "Yesterday"
 *   - Future (1 day)     → "In 1 Day"
 *   - Future (2+ days)   → "In X Days"
 *   - Past (1 day)       → "1 Day Ago"
 *   - Past (2+ days)     → "X Days Ago"
 */
export function getRelativeLabel(dateStr: string): string {
  if (!dateStr) return "";
  const d = daysUntil(dateStr);

  if (d === 0) return "Today";
  if (d === 1) return "Tomorrow";
  if (d === -1) return "Yesterday";
  if (d > 1) return `In ${d} Days`;
  if (d < -1) return `${Math.abs(d)} Days Ago`;
  return "";
}

/**
 * Get the appropriate color class for a relative due date.
 */
export function getDueDateColor(days: number): string {
  if (days < 0) return "text-red-600";
  if (days === 0) return "text-blue-600";
  if (days <= 7) return "text-amber-600";
  return "text-slate-700";
}

export function getDueDateBg(days: number): string {
  if (days < 0) return "bg-red-50 border-red-100";
  if (days === 0) return "bg-blue-50 border-blue-100";
  return "bg-amber-50 border-amber-100";
}

export function getDueDateLabelColor(days: number): string {
  if (days < 0) return "text-red-600";
  if (days === 0) return "text-blue-600";
  return "text-amber-600";
}

export function getDueDateValueColor(days: number): string {
  if (days < 0) return "text-red-800";
  if (days === 0) return "text-blue-800";
  return "text-amber-800";
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

/**
 * Calculate the next due date based on last maintenance date and frequency.
 * Rules:
 * - Daily → +1 day
 * - Weekly → +7 days
 * - Bi-Weekly → +14 days
 * - Monthly → +1 month
 * - Quarterly → +3 months
 * - Half-Yearly → +6 months
 * - Yearly → +12 months
 */
export function calculateNextDue(lastMaintenance: string, frequency: string): string {
  const d = new Date(lastMaintenance);
  if (isNaN(d.getTime())) return "";

  switch (frequency) {
    case "Daily":
      d.setDate(d.getDate() + 1);
      break;
    case "Weekly":
      d.setDate(d.getDate() + 7);
      break;
    case "Bi-Weekly":
      d.setDate(d.getDate() + 14);
      break;
    case "Monthly":
      d.setMonth(d.getMonth() + 1);
      break;
    case "Quarterly":
      d.setMonth(d.getMonth() + 3);
      break;
    case "Half-Yearly":
      d.setMonth(d.getMonth() + 6);
      break;
    case "Yearly":
      d.setFullYear(d.getFullYear() + 1);
      break;
    default:
      // Daily or unknown frequency — default to +1 day
      d.setDate(d.getDate() + 1);
      break;
  }

  return d.toISOString().split("T")[0];
}
