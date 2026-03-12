import { supabase } from "@/integrations/supabase/client";
import { styledToast as toast } from "@/lib/toast";

let isRedirecting = false;

/**
 * Detecta sessão expirada (401/403 session_not_found) e redireciona para login.
 * Chamado uma vez no boot do app para interceptar erros do Supabase.
 */
export function installSessionGuard() {
  // Listen for auth state changes — SIGNED_OUT while user expected to be logged in
  supabase.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") {
      // Only redirect if we were previously authenticated (not initial load)
      // This is handled naturally since SIGNED_OUT fires when token refresh fails
    }
  });
}

export function handleExpiredSession() {
  if (isRedirecting) return;
  isRedirecting = true;

  toast.error("Sessão expirada. Faça login novamente.");

  // Clear local session
  supabase.auth.signOut().catch(() => {});

  setTimeout(() => {
    window.location.href = "/auth";
  }, 1500);
}

/**
 * Wrapper for supabase.functions.invoke that detects 401 and triggers session guard.
 */
export async function invokeWithSessionGuard<T = any>(
  functionName: string,
  options?: { body?: Record<string, unknown> }
): Promise<{ data: T | null; error: any }> {
  const result = await supabase.functions.invoke(functionName, options);

  // Supabase client wraps non-2xx as FunctionsHttpError
  if (result.error) {
    const msg = result.error?.message || "";
    const status = (result.error as any)?.status || (result.error as any)?.context?.status;

    if (status === 401 || status === 403 || msg.includes("session_not_found") || msg.includes("Invalid JWT")) {
      handleExpiredSession();
    }
  }

  return result;
}
