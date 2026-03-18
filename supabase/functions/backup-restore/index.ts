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

    const zipData = new Uint8Array(await req.arrayBuffer());
    const zip = await JSZip.loadAsync(zipData);

    const infoFile = zip.file("backup-info.json");
    if (!infoFile) {
      return new Response(JSON.stringify({ error: "Arquivo de backup inválido. Falta backup-info.json" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const backupInfo = JSON.parse(await infoFile.async("string"));
    const results: { table: string; status: string; count: number; skipped?: number; error?: string }[] = [];

    // Discover tables dynamically from the ZIP's database/ folder
    const tablesInZip: string[] = [];
    for (const [path] of Object.entries(zip.files)) {
      if (path.startsWith("database/") && path.endsWith(".json")) {
        const tableName = path.replace("database/", "").replace(".json", "");
        if (tableName) tablesInZip.push(tableName);
      }
    }

    // Get existing auth user IDs
    const { data: authUsersPage } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const validAuthUserIds = new Set((authUsersPage?.users || []).map(u => u.id));

    // Tables that have user_id referencing profiles.id
    const profileFkTables = new Set([
      "user_roles", "saldos", "recargas", "reseller_pricing_rules", "reseller_config",
      "transactions", "disabled_recharge_values", "referral_commissions",
      "scratch_cards", "client_pricing_rules", "push_subscriptions",
      "support_tickets", "support_messages", "reseller_deposit_fees",
    ]);

    const getExistingProfileIds = async () => {
      const ids = new Set<string>();
      const batchSize = 1000;
      let from = 0;
      while (true) {
        const { data, error } = await supabaseAdmin.from("profiles").select("id").range(from, from + batchSize - 1);
        if (error) { console.error("Error loading profile IDs:", error.message); break; }
        const rows = data || [];
        for (const row of rows as { id: string }[]) ids.add(row.id);
        if (rows.length < batchSize) break;
        from += batchSize;
      }
      return ids;
    };

    let validProfileIds = await getExistingProfileIds();

    // Define restore order: known tables first in dependency order, then any new/unknown tables
    const knownOrder = [
      "operadoras", "system_config", "bot_settings", "notifications", "broadcast_progress",
      "telegram_users", "telegram_sessions", "terms_acceptance", "profiles", "user_roles", "saldos",
      "pricing_rules", "reseller_pricing_rules", "reseller_config", "reseller_deposit_fees",
      "disabled_recharge_values", "client_pricing_rules", "transactions", "recargas",
      "referral_commissions", "admin_notifications", "banners", "polls", "poll_votes",
      "follows", "audit_logs", "support_templates", "support_tickets", "support_messages",
      "chat_conversations", "chat_members", "chat_messages", "chat_message_reads", "chat_reactions",
      "push_subscriptions", "update_history", "scratch_cards",
    ];

    // Build final restore order: known tables that exist in ZIP first, then unknown tables from ZIP
    const knownInZip = knownOrder.filter(t => tablesInZip.includes(t));
    const unknownInZip = tablesInZip.filter(t => !knownOrder.includes(t));
    const restoreOrder = [...knownInZip, ...unknownInZip];

    // Special conflict targets
    const conflictTargets: Record<string, string> = {
      system_config: "key",
      bot_settings: "key",
      telegram_sessions: "chat_id",
      saldos: "user_id,tipo",
    };

    for (const table of restoreOrder) {
      const file = zip.file(`database/${table}.json`);
      if (!file) {
        results.push({ table, status: "skipped", count: 0 });
        continue;
      }

      try {
        const content = JSON.parse(await file.async("string"));
        let rows = content.rows || [];

        if (rows.length === 0) {
          results.push({ table, status: "empty", count: 0 });
          continue;
        }

        const originalCount = rows.length;

        // Filter out rows with invalid foreign-key references
        if (table === "profiles") {
          rows = rows.filter((row: any) => row?.id && validAuthUserIds.has(row.id));
        } else if (profileFkTables.has(table)) {
          rows = rows.filter((row: any) => row?.user_id && validProfileIds.has(row.user_id));
        }

        const skipped = originalCount - rows.length;

        if (rows.length === 0) {
          results.push({ table, status: "skipped_fk", count: 0, skipped, error: `Todos os ${skipped} registros referenciavam usuários inexistentes` });
          continue;
        }

        // Use special conflict target if defined
        const specialConflict = conflictTargets[table];
        if (specialConflict) {
          let successCount = 0;
          for (const row of rows) {
            const { error } = await supabaseAdmin.from(table).upsert(row, { onConflict: specialConflict });
            if (!error) successCount++;
          }
          results.push({ table, status: "restored", count: successCount, skipped });
          if (table === "profiles") validProfileIds = await getExistingProfileIds();
          continue;
        }

        // Default: upsert in batches by id
        const batchSize = 100;
        let totalRestored = 0;
        let lastError: string | undefined;

        for (let i = 0; i < rows.length; i += batchSize) {
          const batch = rows.slice(i, i + batchSize);
          const { error } = await supabaseAdmin.from(table).upsert(batch, { onConflict: "id" });

          if (error) {
            console.error(`Error restoring ${table} batch:`, error.message);
            for (const row of batch) {
              const { error: rowError } = await supabaseAdmin.from(table).upsert(row, { onConflict: "id" });
              if (!rowError) totalRestored++;
              else lastError = rowError.message;
            }
          } else {
            totalRestored += batch.length;
          }
        }

        results.push({
          table,
          status: totalRestored > 0 ? "restored" : "error",
          count: totalRestored,
          skipped,
          error: lastError && totalRestored < rows.length ? `${rows.length - totalRestored} registros falharam: ${lastError}` : undefined,
        });

        if (table === "profiles") validProfileIds = await getExistingProfileIds();
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
