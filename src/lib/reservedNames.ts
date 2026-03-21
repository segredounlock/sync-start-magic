/**
 * Reserved name validation — blocks users from using names
 * that impersonate administrators, support, or staff.
 */

const RESERVED_KEYWORDS = [
  "adm", "admin", "administrador", "administradora",
  "suporte", "support", "staff", "moderador", "moderadora",
  "oficial", "official", "sistema", "system", "bot",
  "equipe", "team", "gerente", "manager", "dono", "owner",
  "recargas brasil", "recargasbrasil",
];

export function isReservedName(name: string): boolean {
  const normalized = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9\s]/g, " ")   // keep only alphanum + spaces
    .trim();

  return RESERVED_KEYWORDS.some((kw) => normalized.includes(kw));
}

export const RESERVED_NAME_ERROR =
  "Este nome não é permitido. Nomes como 'admin', 'suporte', 'administrador' são reservados.";
