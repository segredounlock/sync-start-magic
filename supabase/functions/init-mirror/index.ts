import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DEFAULT_CONFIGS: Record<string, string> = {
  siteName: "Sistema de Recargas",
  activeGateway: "none",
  taxaTipo: "fixo",
  taxaValor: "0",
  masterPin: "1234",
  maintenanceMode: "false",
  chat_enabled: "true",
  supportEnabled: "true",
  salesToolsEnabled: "true",
  requireReferralCode: "false",
  seasonalTheme: "",
  defaultMarginEnabled: "false",
  defaultMarginType: "fixo",
  defaultMarginValue: "0",
  chat_new_conv_filter: "all",
};

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

    // Step 1: Insert default configs (ON CONFLICT DO NOTHING via upsert ignoreDuplicates)
    let configsInserted = 0;
    for (const [key, value] of Object.entries(DEFAULT_CONFIGS)) {
      const { data: existing } = await admin
        .from("system_config")
        .select("id")
        .eq("key", key)
        .maybeSingle();

      if (!existing) {
        await admin.from("system_config").insert({ key, value });
        configsInserted++;
      }
    }
    results.push({
      step: "system_config",
      status: "ok",
      detail: `${configsInserted} configs inseridas (${Object.keys(DEFAULT_CONFIGS).length - configsInserted} já existiam)`,
    });

    // Step 2: Try to sync catalog if apiKey exists
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
          step: "sync-catalog",
          status: syncResp.ok ? "ok" : "error",
          detail: syncResp.ok
            ? `${syncResult.synced} operadoras sincronizadas`
            : syncResult.error || "Erro ao sincronizar",
        });
      } catch (err: any) {
        results.push({
          step: "sync-catalog",
          status: "error",
          detail: err.message,
        });
      }
    } else {
      results.push({
        step: "sync-catalog",
        status: "skipped",
        detail: "apiKey não configurada em system_config — configure antes de sincronizar operadoras",
      });
    }

    // Step 3: Generate referral_code for profiles missing it
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
      step: "referral_codes",
      status: "ok",
      detail: `${codesGenerated} código(s) gerado(s)`,
    });

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
