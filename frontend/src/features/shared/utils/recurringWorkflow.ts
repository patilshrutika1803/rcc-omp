function parseDateLikeValue(value: string | undefined | null): Date | null {
  if (!value) return null;

  const trimmed = String(value).trim();
  if (!trimmed) return null;

  const hasTime = trimmed.includes(" ") || trimmed.includes("T");
  let datePart = trimmed;
  let timePart = "00:00";

  if (hasTime) {
    const [first, second] = trimmed.split(/\s+/);
    datePart = first;
    timePart = second || "00:00";
  }

  const [yearText, monthText, dayText] = datePart.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  if ([year, month, day].some((part) => Number.isNaN(part))) return null;

  const [hoursText, minutesText] = timePart.split(":");
  const hours = Number(hoursText || "0");
  const minutes = Number(minutesText || "0");

  if (hasTime) {
    return new Date(year, month - 1, day, hours, minutes, 0, 0);
  }

  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

function formatDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addMonthsPreserveDay(date: Date, months: number): Date {
  const currentDay = date.getDate();
  const targetMonthIndex = date.getMonth() + months;
  const targetYear = date.getFullYear() + Math.floor(targetMonthIndex / 12);
  const normalizedMonth = ((targetMonthIndex % 12) + 12) % 12;
  const lastDayOfTargetMonth = new Date(targetYear, normalizedMonth + 1, 0).getDate();
  const safeDay = Math.min(currentDay, lastDayOfTargetMonth);
  return new Date(targetYear, normalizedMonth, safeDay);
}

function addYearsPreserveDay(date: Date, years: number): Date {
  const currentDay = date.getDate();
  const targetYear = date.getFullYear() + years;
  const lastDayOfTargetMonth = new Date(targetYear, date.getMonth() + 1, 0).getDate();
  const safeDay = Math.min(currentDay, lastDayOfTargetMonth);
  return new Date(targetYear, date.getMonth(), safeDay);
}

export function calculateNextDueDate(currentDueDate: string, frequency: string): string {
  const parsed = parseDateLikeValue(currentDueDate);
  if (!parsed) return "";

  switch (frequency) {
    case "Daily":
      parsed.setDate(parsed.getDate() + 1);
      break;
    case "Weekly":
      parsed.setDate(parsed.getDate() + 7);
      break;
    case "Monthly":
      return formatDateOnly(addMonthsPreserveDay(parsed, 1));
    case "Quarterly":
      return formatDateOnly(addMonthsPreserveDay(parsed, 3));
    case "Half-Yearly":
    case "Half Yearly":
      return formatDateOnly(addMonthsPreserveDay(parsed, 6));
    case "Yearly":
      return formatDateOnly(addYearsPreserveDay(parsed, 1));
    case "One Time":
    case "":
    case undefined:
      return "";
    default:
      return "";
  }

  return formatDateOnly(parsed);
}

export function calculateReminderDate(dueDate: string, reminderOption: string | undefined): string | undefined {
  if (!reminderOption || !dueDate) return undefined;

  const parsed = parseDateLikeValue(dueDate);
  if (!parsed) return undefined;

  const reminderDays = {
    "Same Day": 0,
    "1 Day Before": 1,
    "3 Days Before": 3,
    "7 Days Before": 7,
    "15 Days Before": 15,
    "30 Days Before": 30,
  } as Record<string, number>;

  const days = reminderDays[reminderOption];
  if (days === undefined) return undefined;

  parsed.setDate(parsed.getDate() - days);
  return formatDateOnly(parsed);
}
