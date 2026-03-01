import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import JSZip from "https://esm.sh/jszip@3.10.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabaseUser.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Acesso negado. Apenas admins." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Read ZIP from request body
    const zipData = new Uint8Array(await req.arrayBuffer());
    const zip = await JSZip.loadAsync(zipData);

    // Read backup info
    const infoFile = zip.file("backup-info.json");
    if (!infoFile) {
      return new Response(JSON.stringify({ error: "Arquivo de backup inválido. Falta backup-info.json" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const backupInfo = JSON.parse(await infoFile.async("string"));
    const results: { table: string; status: string; count: number; error?: string }[] = [];

    // Restore order matters due to foreign keys
    const restoreOrder = [
      "operadoras",
      "system_config",
      "profiles",
      "user_roles",
      "saldos",
      "pricing_rules",
      "reseller_pricing_rules",
      "reseller_config",
      "telegram_sessions",
      "transactions",
      "recargas",
    ];

    for (const table of restoreOrder) {
      const file = zip.file(`database/${table}.json`);
      if (!file) {
        results.push({ table, status: "skipped", count: 0 });
        continue;
      }

      try {
        const content = JSON.parse(await file.async("string"));
        const rows = content.rows || [];

        if (rows.length === 0) {
          results.push({ table, status: "empty", count: 0 });
          continue;
        }

        // For system_config, use key as conflict target
        if (table === "system_config") {
          for (const row of rows) {
            await supabaseAdmin
              .from("system_config")
              .upsert(row, { onConflict: "key" });
          }
          results.push({ table, status: "restored", count: rows.length });
          continue;
        }

        // For telegram_sessions, use chat_id as conflict target
        if (table === "telegram_sessions") {
          for (const row of rows) {
            await supabaseAdmin
              .from("telegram_sessions")
              .upsert(row, { onConflict: "chat_id" });
          }
          results.push({ table, status: "restored", count: rows.length });
          continue;
        }

        // For all other tables, upsert in batches by id
        const batchSize = 100;
        for (let i = 0; i < rows.length; i += batchSize) {
          const batch = rows.slice(i, i + batchSize);

          // Determine conflict column
          let onConflict = "id";
          if (table === "saldos") {
            // saldos has unique on (user_id, tipo)
            for (const row of batch) {
              await supabaseAdmin
                .from("saldos")
                .upsert(row, { onConflict: "user_id,tipo" });
            }
            continue;
          }

          const { error } = await supabaseAdmin
            .from(table)
            .upsert(batch, { onConflict });

          if (error) {
            console.error(`Error restoring ${table} batch:`, error.message);
            results.push({ table, status: "error", count: rows.length, error: error.message });
            break;
          }
        }

        if (!results.find(r => r.table === table)) {
          results.push({ table, status: "restored", count: rows.length });
        }
      } catch (err: any) {
        console.error(`Error restoring ${table}:`, err.message);
        results.push({ table, status: "error", count: 0, error: err.message });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      backup_date: backupInfo.created_at,
      backup_by: backupInfo.created_by,
      results,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Restore error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
