/**
 * Central timezone utility for Brazil (America/Sao_Paulo).
 * ALL date/time formatting in the app MUST use these functions
 * to guarantee consistent display regardless of the user's system timezone.
 */

const BRAZIL_TZ = "America/Sao_Paulo";

// ─── Internal helpers ───────────────────────────────────────────

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

// ─── Day / Month bounds (for DB queries) ────────────────────────

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

export function getLocalDayStartUTC(date: Date = new Date()): string {
  return getLocalDayBoundsUTC(date).start;
}

export function getLocalMonthStartUTC(date: Date = new Date()): string {
  const p = getZonedParts(date);
  const monthStartGuess = new Date(Date.UTC(p.year, p.month - 1, 1, 0, 0, 0, 0));
  const offsetMin = getTimeZoneOffsetMinutes(monthStartGuess);
  return new Date(monthStartGuess.getTime() - offsetMin * 60_000).toISOString();
}

// ─── Date keys (YYYY-MM-DD) ────────────────────────────────────

export function toLocalDateKey(dateStr: string): string {
  const p = getZonedParts(new Date(dateStr));
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

export function getTodayLocalKey(): string {
  return toLocalDateKey(new Date().toISOString());
}

export function isTodayBR(dateInput: string | Date): boolean {
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return toLocalDateKey(d.toISOString()) === getTodayLocalKey();
}

// ─── Formatting functions (the single source of truth) ──────────

/** "14:30" or "14:30:05" */
export function formatTimeBR(dateInput: string | Date, withSeconds = false): string {
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: BRAZIL_TZ,
    hour: "2-digit",
    minute: "2-digit",
    ...(withSeconds ? { second: "2-digit" } : {}),
  }).format(d);
}

/** "03/03/26, 14:30" */
export function formatDateTimeBR(dateInput: string | Date): string {
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: BRAZIL_TZ,
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/** "03/03/2026, 14:30:05" */
export function formatFullDateTimeBR(dateInput: string | Date): string {
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: BRAZIL_TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(d);
}

/** "03/03/2026" */
export function formatDateFullBR(dateInput: string | Date): string {
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: BRAZIL_TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

/** "03 de mar." */
export function formatDateBR(dateInput: string | Date): string {
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: BRAZIL_TZ,
    day: "2-digit",
    month: "short",
  }).format(d);
}

/** "03/03" */
export function formatDateShortBR(dateInput: string | Date): string {
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: BRAZIL_TZ,
    day: "2-digit",
    month: "2-digit",
  }).format(d);
}

/** "seg." */
export function formatWeekdayShortBR(dateInput: string | Date): string {
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: BRAZIL_TZ,
    weekday: "short",
  }).format(d);
}

/** "3 DE MARÇO" */
export function formatDateLongUpperBR(dateInput: string | Date): string {
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: BRAZIL_TZ,
    day: "numeric",
    month: "long",
  }).format(d).toUpperCase();
}

/** "Sábado, 14 De Março De 2026" — title-case with weekday */
export function formatDateFullTitleBR(dateInput: string | Date): string {
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const raw = new Intl.DateTimeFormat("pt-BR", {
    timeZone: BRAZIL_TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
  // Title-case each word
  return raw.replace(/\b\w/g, c => c.toUpperCase());
}

/** "03/03/26, 14:30" with short weekday prefix: "seg. 03/03" */
export function formatWeekdayDateBR(dateInput: string | Date): string {
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: BRAZIL_TZ,
    weekday: "short",
  }).format(d);
}

/** Relative: "Hoje", "Ontem", or "03 de mar." */
export function formatRelativeDateBR(dateInput: string | Date): string {
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const inputKey = toLocalDateKey(d.toISOString());
  const todayKey = getTodayLocalKey();
  if (inputKey === todayKey) return "Hoje";

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (inputKey === toLocalDateKey(yesterday.toISOString())) return "Ontem";

  return formatDateBR(d);
}

/** Smart chat timestamp: "14:30", "Ontem", "seg.", or "03/03" */
export function formatChatTimestamp(dateInput: string | Date): string {
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const now = new Date();
  const inputKey = toLocalDateKey(d.toISOString());
  const todayKey = getTodayLocalKey();

  if (inputKey === todayKey) return formatTimeBR(d);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (inputKey === toLocalDateKey(yesterday.toISOString())) return "Ontem";

  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays < 7) return formatWeekdayShortBR(d);

  return formatDateShortBR(d);
}

/** "há 5min", "há 2h", or "03/03 14:30" */
export function formatLastSeenBR(dateInput: string | Date): string {
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `há ${diffMin}min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `há ${diffH}h`;
  return formatDateShortBR(d) + " " + formatTimeBR(d);
}

/**
 * Returns the most relevant timestamp for a recarga:
 * - completed_at for completed/concluida (with fallback to created_at)
 * - created_at for pending/falha
 */
export function getRecargaTime(r: { status: string; completed_at?: string | null; created_at: string }): string {
  if ((r.status === "completed" || r.status === "concluida") && r.completed_at) {
    return r.completed_at;
  }
  return r.created_at;
}
