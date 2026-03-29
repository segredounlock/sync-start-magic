/**
 * License validation helpers — local date-based system (no remote server).
 */

export { evaluateLicense, isValidDateString, parseSafeDate, addDays } from "./licenseDates";
export type { LicenseStateResult, LicenseStateCode } from "./licenseDates";

/** Validate license dates before saving during installation */
export function validateLicenseDatesBeforeSave(params: {
  startDate: string;
  endDate: string;
  graceDays: number;
}): { valid: boolean; error: string } {
  const { startDate, endDate, graceDays } = params;

  if (!startDate) return { valid: false, error: "Data de início é obrigatória." };
  if (!endDate) return { valid: false, error: "Data de expiração é obrigatória." };

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime())) return { valid: false, error: "Data de início inválida." };
  if (isNaN(end.getTime())) return { valid: false, error: "Data de expiração inválida." };
  if (end <= start) return { valid: false, error: "Data de expiração deve ser posterior à data de início." };
  if (graceDays < 0) return { valid: false, error: "Dias de carência deve ser zero ou maior." };

  return { valid: true, error: "" };
}
