import { supabase } from "@/integrations/supabase/client";

/**
 * Registra uma ação administrativa no log de auditoria.
 * Falhas são silenciosas para não interromper o fluxo principal.
 */
export async function logAudit(
  action: string,
  targetType: string,
  targetId?: string | null,
  details?: Record<string, any>,
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("audit_logs" as any).insert({
      admin_id: user.id,
      action,
      target_type: targetType,
      target_id: targetId ?? null,
      details: details ?? {},
    } as any);
  } catch {
    // silencioso — não bloqueia a ação principal
  }
}
