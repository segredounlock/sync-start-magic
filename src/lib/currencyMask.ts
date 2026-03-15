/**
 * Máscara de moeda brasileira para inputs.
 * Recebe o valor bruto digitado e retorna formatado com vírgula e 2 decimais.
 * Ex: "1" → "0,01", "10" → "0,10", "1000" → "10,00"
 */
export function applyCurrencyMask(raw: string): string {
  // Remove tudo que não é dígito
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";

  // Converte para centavos
  const cents = parseInt(digits, 10);
  if (isNaN(cents) || cents === 0) return "";

  // Formata como reais
  const value = (cents / 100).toFixed(2);
  return value.replace(".", ",");
}

/**
 * Converte valor mascarado (ex: "10,50") para número.
 */
export function parseCurrencyMask(masked: string): number {
  if (!masked) return 0;
  return parseFloat(masked.replace(",", ".")) || 0;
}
