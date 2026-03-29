/**
 * License validation helpers for InstallWizard and LicenseGate.
 */

import { isValidHttpsUrl, normalizeUrl, MASTER_SUPABASE_URL } from "./licenseConfig";

/** Validate connectivity to the master server with timeout */
export async function validateMasterServerConnection(masterUrl: string): Promise<void> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`${masterUrl}/functions/v1/license-validate`, {
      method: "OPTIONS",
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!response) {
      throw new Error("Sem resposta do servidor principal.");
    }
  } catch (err: any) {
    clearTimeout(timeout);
    if (err?.name === "AbortError") {
      throw new Error("Tempo esgotado ao conectar ao servidor principal. Verifique sua conexão.");
    }
    // OPTIONS might fail with CORS but that's OK — it means server is reachable
    // Only throw on genuine network errors
    if (err?.message?.includes("Failed to fetch") || err?.message?.includes("NetworkError")) {
      throw new Error("Não foi possível conectar ao servidor principal. Verifique sua conexão e tente novamente.");
    }
  }
}

/** Validate that a license response has all required fields */
export function isValidLicenseResponse(payload: any): boolean {
  return Boolean(
    payload &&
    typeof payload === "object" &&
    payload.valid === true &&
    typeof payload.expires_at === "string" &&
    payload.expires_at.length > 0
  );
}

/** Validate mirror configuration integrity */
export function validateMirrorConfig(config: {
  licenseMasterUrl: string | null;
  masterProjectUrl: string | null;
  currentSupabaseUrl: string | undefined;
}): { valid: boolean; errorCode: string; message: string } {
  const { licenseMasterUrl, masterProjectUrl, currentSupabaseUrl } = config;

  // Must have license_master_url
  if (!licenseMasterUrl) {
    return {
      valid: false,
      errorCode: "MASTER_CONFIG_MISSING",
      message: "Configuração do servidor principal não encontrada. Execute a instalação novamente.",
    };
  }

  // Must be HTTPS
  if (!isValidHttpsUrl(licenseMasterUrl)) {
    return {
      valid: false,
      errorCode: "MASTER_CONFIG_INVALID",
      message: "URL do servidor principal é inválida. Reinstale o sistema.",
    };
  }

  // Must not point to localhost
  try {
    const parsed = new URL(licenseMasterUrl);
    if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
      return {
        valid: false,
        errorCode: "MASTER_CONFIG_LOCALHOST",
        message: "Configuração inválida: servidor principal não pode ser localhost.",
      };
    }
  } catch {
    return {
      valid: false,
      errorCode: "MASTER_CONFIG_INVALID",
      message: "URL do servidor principal é malformada.",
    };
  }

  // Must not be self-referencing
  if (currentSupabaseUrl && normalizeUrl(licenseMasterUrl) === normalizeUrl(currentSupabaseUrl)) {
    return {
      valid: false,
      errorCode: "MASTER_CONFIG_SELF_REFERENCE",
      message: "Configuração inválida: este espelho está apontando para si mesmo. Reinstale o sistema.",
    };
  }

  // Should have masterProjectUrl (warning, not blocking)
  // licenseMasterUrl is valid
  return { valid: true, errorCode: "", message: "" };
}
