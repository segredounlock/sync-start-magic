/**
 * Local license date helpers — no remote server dependency.
 */

/** Decode a JWT payload without verifying the signature */
export function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const body = parts[1];
    const padded = body + "=".repeat((4 - body.length % 4) % 4);
    const decoded = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/** Extract license dates from a JWT license key */
export function extractLicenseFromKey(licenseKey: string): {
  valid: boolean;
  startDate: string;
  endDate: string;
  graceDays: number;
  mirrorName?: string;
  error?: string;
} {
  const payload = decodeJwtPayload(licenseKey);
  if (!payload) {
    return { valid: false, startDate: "", endDate: "", graceDays: 0, error: "Chave de licença inválida — formato não reconhecido." };
  }

  // iat = issued at (start), exp = expiration
  const iat = payload.iat;
  const exp = payload.exp;

  if (!exp || typeof exp !== "number") {
    return { valid: false, startDate: "", endDate: "", graceDays: 0, error: "Chave não contém data de expiração." };
  }

  const startDate = iat
    ? new Date(iat * 1000).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  const endDate = new Date(exp * 1000).toISOString().split("T")[0];

  return {
    valid: true,
    startDate,
    endDate,
    graceDays: payload.gd ?? 0,
    mirrorName: payload.mn || undefined,
  };
}

/** Check if a string is a valid ISO date */
export function isValidDateString(value: string | null | undefined): boolean {
  if (!value) return false;
  const d = new Date(value);
  return !isNaN(d.getTime());
}

/** Parse a date string safely, returns null if invalid */
export function parseSafeDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

/** Add days to a date */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/** Get start of day (00:00:00.000) in UTC */
export function startOfDayUTC(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
}

/** Get end of day (23:59:59.999) in UTC */
export function endOfDayUTC(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));
}

export type LicenseStateCode =
  | "VALID"
  | "LICENSE_MISSING"
  | "LICENSE_INACTIVE"
  | "LICENSE_NOT_STARTED"
  | "LICENSE_EXPIRED"
  | "LICENSE_MALFORMED";

export interface LicenseStateResult {
  valid: boolean;
  code: LicenseStateCode;
  message: string;
  /** Extra info for UI */
  startDate?: string;
  endDate?: string;
  graceDays?: number;
  status?: string;
}

const MESSAGES: Record<LicenseStateCode, string> = {
  VALID: "Licença válida.",
  LICENSE_MISSING: "Nenhuma configuração de licença encontrada.",
  LICENSE_INACTIVE: "Esta licença está inativa.",
  LICENSE_NOT_STARTED: "Esta licença ainda não está ativa.",
  LICENSE_EXPIRED: "Esta licença expirou.",
  LICENSE_MALFORMED: "A configuração da licença é inválida.",
};

/**
 * Evaluate the current license state based on locally stored config values.
 */
export function evaluateLicense(params: {
  licenseKey: string | null;
  licenseStatus: string | null;
  licenseStartDate: string | null;
  licenseEndDate: string | null;
  licenseGraceDays: string | null;
  now?: Date;
}): LicenseStateResult {
  const {
    licenseKey,
    licenseStatus,
    licenseStartDate,
    licenseEndDate,
    licenseGraceDays,
    now = new Date(),
  } = params;

  // 1. Missing required fields
  if (!licenseKey || !licenseKey.trim()) {
    return { valid: false, code: "LICENSE_MISSING", message: MESSAGES.LICENSE_MISSING };
  }

  if (!licenseStatus || !licenseStartDate || !licenseEndDate) {
    return { valid: false, code: "LICENSE_MISSING", message: MESSAGES.LICENSE_MISSING };
  }

  // 2. Parse dates
  const start = parseSafeDate(licenseStartDate);
  const end = parseSafeDate(licenseEndDate);

  if (!start || !end) {
    return { valid: false, code: "LICENSE_MALFORMED", message: MESSAGES.LICENSE_MALFORMED };
  }

  if (end <= start) {
    return { valid: false, code: "LICENSE_MALFORMED", message: "Data de expiração deve ser posterior à data de início." };
  }

  // 3. Status check
  if (licenseStatus !== "active") {
    return {
      valid: false,
      code: "LICENSE_INACTIVE",
      message: MESSAGES.LICENSE_INACTIVE,
      startDate: licenseStartDate,
      endDate: licenseEndDate,
      status: licenseStatus,
    };
  }

  // 4. Grace days
  const graceDays = Math.max(0, parseInt(licenseGraceDays || "0", 10) || 0);

  // 5. Not started yet — compare start of start day
  const startBoundary = startOfDayUTC(start);
  if (now < startBoundary) {
    return {
      valid: false,
      code: "LICENSE_NOT_STARTED",
      message: MESSAGES.LICENSE_NOT_STARTED,
      startDate: licenseStartDate,
      endDate: licenseEndDate,
      graceDays,
      status: licenseStatus,
    };
  }

  // 6. Expired — compare end of (end day + grace)
  const effectiveEnd = addDays(end, graceDays);
  const endBoundary = endOfDayUTC(effectiveEnd);
  if (now > endBoundary) {
    return {
      valid: false,
      code: "LICENSE_EXPIRED",
      message: MESSAGES.LICENSE_EXPIRED,
      startDate: licenseStartDate,
      endDate: licenseEndDate,
      graceDays,
      status: licenseStatus,
    };
  }

  // 7. Valid
  return {
    valid: true,
    code: "VALID",
    message: MESSAGES.VALID,
    startDate: licenseStartDate,
    endDate: licenseEndDate,
    graceDays,
    status: licenseStatus,
  };
}
