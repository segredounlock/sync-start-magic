/**
 * Timezone utilities for Brazil (UTC-3).
 * Ensures date filtering matches the user's local "today" instead of UTC midnight.
 */

/**
 * Returns UTC ISO strings for the start and end of the local day.
 * Example: If user is in UTC-3 at 2026-03-03 06:00 local:
 *   start = "2026-03-03T03:00:00.000Z" (midnight local = 03:00 UTC)
 *   end   = "2026-03-04T02:59:59.999Z" (23:59:59 local = next day 02:59 UTC)
 */
export function getLocalDayBoundsUTC(date: Date = new Date()): { start: string; end: string } {
  const localStart = new Date(date);
  localStart.setHours(0, 0, 0, 0);

  const localEnd = new Date(date);
  localEnd.setHours(23, 59, 59, 999);

  return {
    start: localStart.toISOString(),
    end: localEnd.toISOString(),
  };
}

/**
 * Returns local date key (YYYY-MM-DD) for a UTC timestamp string,
 * converting to the user's local timezone first.
 */
export function toLocalDateKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Returns today's local date key.
 */
export function getTodayLocalKey(): string {
  return toLocalDateKey(new Date().toISOString());
}

/**
 * Returns the start of a local day as UTC ISO string.
 */
export function getLocalDayStartUTC(date: Date = new Date()): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

/**
 * Returns the start of the current local month as UTC ISO string.
 */
export function getLocalMonthStartUTC(date: Date = new Date()): string {
  const d = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
  return d.toISOString();
}
