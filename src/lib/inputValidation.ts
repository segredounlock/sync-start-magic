/**
 * Input validation utilities for support system
 */

export function validateTextInput(
  text: string,
  options: { min?: number; max?: number; label?: string } = {}
): { valid: boolean; error?: string } {
  const { min = 1, max = 4096, label = "Texto" } = options;
  const trimmed = text.trim();

  if (trimmed.length < min) {
    return { valid: false, error: `${label} deve ter pelo menos ${min} caracteres.` };
  }
  if (trimmed.length > max) {
    return { valid: false, error: `${label} deve ter no máximo ${max} caracteres.` };
  }
  return { valid: true };
}

export function sanitizeText(text: string): string {
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/on\w+\s*=\s*'[^']*'/gi, "")
    .trim();
}
