/**
 * Centralized license configuration constants and helpers.
 * Single source of truth for master server identification.
 */

export const MASTER_SUPABASE_URL = "https://xtkqyjruyuydlbvwduuy.supabase.co";
export const MASTER_PROJECT_URL = "https://recargasbrasill.com";
export const MASTER_PROJECT_ID = "b6fd7b54-3351-4e9b-b4be-76be551257a7";

export const MASTER_DOMAINS = ["recargasbrasill.com"];

export const APPROVED_MASTER_ORIGINS = [
  "https://recargasbrasill.com",
  "https://www.recargasbrasill.com",
];

/** Normalize a URL to its lowercase origin without trailing slash */
export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.origin.toLowerCase().replace(/\/$/, "");
  } catch {
    return "";
  }
}

/** Check if a string is a valid HTTPS URL */
export function isValidHttpsUrl(value: string | null | undefined): boolean {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/** Check if the given URL is the approved master Supabase URL */
export function isApprovedMasterUrl(masterUrl: string | null | undefined): boolean {
  if (!masterUrl) return false;
  return normalizeUrl(masterUrl) === normalizeUrl(MASTER_SUPABASE_URL);
}

/** Determine if the current environment is the master (not a mirror) */
export function isMasterEnvironment(): boolean {
  const currentSupabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const currentHost = window.location.hostname.toLowerCase();

  // Check Supabase URL match
  if (currentSupabaseUrl && normalizeUrl(currentSupabaseUrl) === normalizeUrl(MASTER_SUPABASE_URL)) {
    return true;
  }

  // Check domain match
  if (MASTER_DOMAINS.some(d => currentHost === d || currentHost.endsWith(`.${d}`))) {
    return true;
  }

  // Check Lovable preview/published
  if (currentHost.includes(MASTER_PROJECT_ID) || currentHost === "recargas-brasil-v2.lovable.app") {
    return true;
  }

  return false;
}

/** Read a single value from system_config */
export async function getSystemConfigValue(
  supabase: any,
  key: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from("system_config")
    .select("value")
    .eq("key", key)
    .maybeSingle();

  if (error) throw error;
  return data?.value ?? null;
}
