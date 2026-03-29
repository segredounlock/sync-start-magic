import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DEFAULT_CONFIGS: Record<string, string> = {
  // ── Identidade ──
  siteName: "Sistema de Recargas",
  siteTitle: "Sistema de Recargas",
  siteSubtitle: "Recargas rápidas e seguras",
  siteUrl: "",
  // ── Gateway / Pagamentos ──
  activeGateway: "none",
  paymentModule: "",
  pushinPayToken: "",
  // ── Taxas ──
  taxaTipo: "fixo",
  taxaValor: "0",
  // ── Segurança ──
  masterPin: "1234",
  adminPin: "",
  maintenanceMode: "false",
  // ── Chat & Suporte ──
  chat_enabled: "true",
  chat_new_conv_filter: "all",
  supportEnabled: "true",
  // ── Funcionalidades ──
  salesToolsEnabled: "true",
  requireReferralCode: "false",
  seasonalTheme: "",
  // ── Margem padrão ──
  defaultMarginEnabled: "false",
  defaultMarginType: "fixo",
  defaultMarginValue: "0",
  margemLucro: "",
  // ── API de Recargas ──
  apiBaseURL: "",
  apiKey: "",
  // ── Consulta Operadora ──
  consultaOperadoraURL: "",
  consultaOperadoraKey: "",
  // ── Alertas ──
  alertaSaldoBaixo: "",
  // ── Push Notifications (VAPID) ──
  vapid_public_key: "",
  vapid_private_key: "",
};

// Essential keys that MUST exist for the app to load without white screen
const CRITICAL_KEYS = ["siteTitle", "siteName", "maintenanceMode", "activeGateway"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const admin = createClient(supabaseUrl, serviceRoleKey);

  // Verify caller is admin
  const authHeader = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Token ausente" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: { user } } = await admin.auth.getUser(authHeader);
  if (!user) {
    return new Response(JSON.stringify({ error: "Token inválido" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: roleCheck } = await admin
    .from("user_roles")
    .select("id")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (!roleCheck) {
    return new Response(JSON.stringify({ error: "Apenas admins" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const results: { step: string; status: string; detail?: string }[] = [];
    const health: { key: string; ok: boolean; detail: string }[] = [];

    // ═══════════════════════════════════════════════════
    // Step 1: Insert ALL default configs (idempotent)
    // ═══════════════════════════════════════════════════
    let configsInserted = 0;
    let configsExisted = 0;
    for (const [key, value] of Object.entries(DEFAULT_CONFIGS)) {
      const { data: existing } = await admin
        .from("system_config")
        .select("id")
        .eq("key", key)
        .maybeSingle();

      if (!existing) {
        await admin.from("system_config").insert({ key, value });
        configsInserted++;
      } else {
        configsExisted++;
      }
    }
    results.push({
      step: "Configurações do sistema",
      status: "ok",
      detail: `${configsInserted} inseridas, ${configsExisted} já existiam (${Object.keys(DEFAULT_CONFIGS).length} total)`,
    });

    // ═══════════════════════════════════════════════════
    // Step 2: Health check — verify critical keys exist
    // ═══════════════════════════════════════════════════
    for (const key of CRITICAL_KEYS) {
      const { data } = await admin
        .from("system_config")
        .select("value")
        .eq("key", key)
        .maybeSingle();
      health.push({
        key,
        ok: !!data?.value !== undefined && data !== null,
        detail: data ? `"${data.value}"` : "AUSENTE ⚠️",
      });
    }

    // ═══════════════════════════════════════════════════
    // Step 3: Verify get_maintenance_mode RPC exists
    // ═══════════════════════════════════════════════════
    let rpcOk = false;
    try {
      const { error } = await admin.rpc("get_maintenance_mode");
      rpcOk = !error;
      health.push({
        key: "get_maintenance_mode()",
        ok: rpcOk,
        detail: rpcOk ? "Funcionando" : `Erro: ${error?.message}`,
      });
    } catch (e: any) {
      health.push({
        key: "get_maintenance_mode()",
        ok: false,
        detail: `Exceção: ${e.message}`,
      });
    }
    results.push({
      step: "Verificação de RPCs",
      status: rpcOk ? "ok" : "error",
      detail: rpcOk ? "get_maintenance_mode() respondeu corretamente" : "get_maintenance_mode() falhou — migrations podem não ter sido aplicadas",
    });

    // ═══════════════════════════════════════════════════
    // Step 4: Check operadoras table
    // ═══════════════════════════════════════════════════
    const { count: opCount } = await admin
      .from("operadoras")
      .select("id", { count: "exact", head: true });
    
    health.push({
      key: "operadoras",
      ok: (opCount || 0) > 0,
      detail: `${opCount || 0} operadora(s) cadastrada(s)`,
    });

    // ═══════════════════════════════════════════════════
    // Step 5: Try to sync catalog if apiKey exists
    // ═══════════════════════════════════════════════════
    const { data: apiKeyConfig } = await admin
      .from("system_config")
      .select("value")
      .eq("key", "apiKey")
      .maybeSingle();

    if (apiKeyConfig?.value) {
      try {
        const syncResp = await fetch(`${supabaseUrl}/functions/v1/sync-catalog`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${serviceRoleKey}`,
            "Content-Type": "application/json",
          },
        });
        const syncResult = await syncResp.json();
        results.push({
          step: "Catálogo de operadoras",
          status: syncResp.ok ? "ok" : "error",
          detail: syncResp.ok
            ? `${syncResult.synced} operadoras sincronizadas`
            : syncResult.error || "Erro ao sincronizar",
        });
      } catch (err: any) {
        results.push({
          step: "Catálogo de operadoras",
          status: "error",
          detail: err.message,
        });
      }
    } else {
      results.push({
        step: "Catálogo de operadoras",
        status: "skipped",
        detail: "apiKey não configurada — configure antes de sincronizar operadoras",
      });
    }

    // ═══════════════════════════════════════════════════
    // Step 6: Generate referral_code for profiles missing it
    // ═══════════════════════════════════════════════════
    const { data: profilesWithout } = await admin
      .from("profiles")
      .select("id")
      .is("referral_code", null);

    let codesGenerated = 0;
    if (profilesWithout?.length) {
      for (const p of profilesWithout) {
        const code = String(Math.floor(Math.random() * 1000000)).padStart(6, "0");
        await admin
          .from("profiles")
          .update({ referral_code: code })
          .eq("id", p.id);
        codesGenerated++;
      }
    }
    results.push({
      step: "Códigos de referência",
      status: "ok",
      detail: `${codesGenerated} código(s) gerado(s)`,
    });

    // ═══════════════════════════════════════════════════
    // Step 7: Check profiles & user_roles count
    // ═══════════════════════════════════════════════════
    const { count: profileCount } = await admin
      .from("profiles")
      .select("id", { count: "exact", head: true });
    const { count: rolesCount } = await admin
      .from("user_roles")
      .select("id", { count: "exact", head: true });
    const { count: adminCount } = await admin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");

    health.push({
      key: "profiles",
      ok: (profileCount || 0) > 0,
      detail: `${profileCount || 0} perfil(s)`,
    });
    health.push({
      key: "user_roles",
      ok: (rolesCount || 0) > 0,
      detail: `${rolesCount || 0} role(s), ${adminCount || 0} admin(s)`,
    });

    // ═══════════════════════════════════════════════════
    // Final: Determine overall readiness
    // ═══════════════════════════════════════════════════
    const criticalHealthOk = health.filter(h => CRITICAL_KEYS.includes(h.key)).every(h => h.ok);
    const rpcHealthOk = health.find(h => h.key === "get_maintenance_mode()")?.ok || false;
    const hasAdmin = (adminCount || 0) > 0;

    let readiness: "ready" | "partial" | "broken" = "ready";
    const issues: string[] = [];

    if (!criticalHealthOk) {
      readiness = "broken";
      issues.push("Configs críticas ausentes no system_config");
    }
    if (!rpcHealthOk) {
      readiness = "broken";
      issues.push("RPC get_maintenance_mode() não funciona — publique o projeto para aplicar migrations");
    }
    if (!hasAdmin) {
      readiness = readiness === "broken" ? "broken" : "partial";
      issues.push("Nenhum admin encontrado — crie um usuário admin");
    }
    if ((opCount || 0) === 0) {
      readiness = readiness === "broken" ? "broken" : "partial";
      issues.push("Tabela operadoras vazia — configure apiKey e sincronize o catálogo");
    }

    return new Response(
      JSON.stringify({
        success: true,
        readiness,
        issues,
        health,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
