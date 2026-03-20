/**
 * Password validation utilities — shared across client and referenced by edge functions
 */

// Common passwords blacklist
const COMMON_PASSWORDS = [
  "123456", "12345678", "123456789", "1234567890", "password", "qwerty",
  "abc123", "111111", "123123", "admin123", "letmein", "welcome",
  "monkey", "dragon", "master", "login", "princess", "football",
  "shadow", "sunshine", "trustno1", "iloveyou", "batman", "access",
  "hello123", "charlie", "donald", "password1", "qwerty123", "senha",
  "senha123", "mudar123", "brasil", "brasil123", "recargas", "recargas123",
];

export interface PasswordCheck {
  valid: boolean;
  score: number; // 0-4
  label: string;
  color: string;
  errors: string[];
}

export function validatePassword(password: string): PasswordCheck {
  const errors: string[] = [];
  let score = 0;

  if (password.length >= 8) score++;
  else errors.push("Mínimo 8 caracteres");

  if (/[A-Z]/.test(password)) score++;
  else errors.push("Pelo menos 1 letra maiúscula");

  if (/[0-9]/.test(password)) score++;
  else errors.push("Pelo menos 1 número");

  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) score++;
  else errors.push("Pelo menos 1 caractere especial (!@#$%...)");

  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    errors.push("Essa senha é muito comum e insegura");
    score = Math.max(0, score - 2);
  }

  const labels = ["Muito fraca", "Fraca", "Razoável", "Forte", "Muito forte"];
  const colors = ["text-destructive", "text-destructive", "text-warning", "text-primary", "text-success"];

  return {
    valid: errors.length === 0 && score >= 4,
    score: Math.min(score, 4),
    label: labels[Math.min(score, 4)],
    color: colors[Math.min(score, 4)],
    errors,
  };
}

/** Server-side common passwords list (for edge functions to import logic) */
export const COMMON_PASSWORDS_LIST = COMMON_PASSWORDS;
