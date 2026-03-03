const BRAZIL_TZ = "America/Sao_Paulo";

function getZonedParts(date: Date, timeZone: string = BRAZIL_TZ) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const pick = (type: string) => Number(parts.find((p) => p.type === type)?.value || 0);
  return {
    year: pick("year"),
    month: pick("month"),
    day: pick("day"),
    hour: pick("hour"),
    minute: pick("minute"),
    second: pick("second"),
  };
}

function getTimeZoneOffsetMinutes(date: Date, timeZone: string = BRAZIL_TZ): number {
  const p = getZonedParts(date, timeZone);
  const asUTC = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return (asUTC - date.getTime()) / 60000;
}

/**
 * Returns UTC ISO strings for start/end of the Brazil local day.
 */
export function getLocalDayBoundsUTC(date: Date = new Date()): { start: string; end: string } {
  const p = getZonedParts(date);
  const midnightGuess = new Date(Date.UTC(p.year, p.month - 1, p.day, 0, 0, 0, 0));
  const startOffsetMin = getTimeZoneOffsetMinutes(midnightGuess);
  const startMs = midnightGuess.getTime() - startOffsetMin * 60_000;

  const nextMidnightGuess = new Date(Date.UTC(p.year, p.month - 1, p.day + 1, 0, 0, 0, 0));
  const nextOffsetMin = getTimeZoneOffsetMinutes(nextMidnightGuess);
  const nextStartMs = nextMidnightGuess.getTime() - nextOffsetMin * 60_000;

  return {
    start: new Date(startMs).toISOString(),
    end: new Date(nextStartMs - 1).toISOString(),
  };
}

/**
 * Returns Brazil date key (YYYY-MM-DD) for a timestamp.
 */
export function toLocalDateKey(dateStr: string): string {
  const p = getZonedParts(new Date(dateStr));
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

export function getTodayLocalKey(): string {
  return toLocalDateKey(new Date().toISOString());
}

export function getLocalDayStartUTC(date: Date = new Date()): string {
  return getLocalDayBoundsUTC(date).start;
}

export function getLocalMonthStartUTC(date: Date = new Date()): string {
  const p = getZonedParts(date);
  const monthStartGuess = new Date(Date.UTC(p.year, p.month - 1, 1, 0, 0, 0, 0));
  const offsetMin = getTimeZoneOffsetMinutes(monthStartGuess);
  return new Date(monthStartGuess.getTime() - offsetMin * 60_000).toISOString();
}

export function formatTimeBR(dateInput: string | Date, withSeconds = false): string {
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: BRAZIL_TZ,
    hour: "2-digit",
    minute: "2-digit",
    ...(withSeconds ? { second: "2-digit" } : {}),
  }).format(d);
}

export function formatDateBR(dateInput: string | Date): string {
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: BRAZIL_TZ,
    day: "2-digit",
    month: "short",
  }).format(d);
}

export function isTodayBR(dateInput: string | Date): boolean {
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return toLocalDateKey(d.toISOString()) === getTodayLocalKey();
}
