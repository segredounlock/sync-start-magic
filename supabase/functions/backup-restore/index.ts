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
    const results: { table: string; status: string; count: number; skipped?: number; error?: string }[] = [];

    // Get existing auth user IDs to filter profiles rows (profiles.id -> auth users)
    const { data: authUsersPage } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const validAuthUserIds = new Set((authUsersPage?.users || []).map(u => u.id));

    // Tables that have user_id referencing profiles.id
    const profileFkTables = new Set([
      "user_roles",
      "saldos",
      "recargas",
      "reseller_pricing_rules",
      "reseller_config",
      "transactions",
    ]);

    const getExistingProfileIds = async () => {
      const ids = new Set<string>();
      const batchSize = 1000;
      let from = 0;

      while (true) {
        const { data, error } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .range(from, from + batchSize - 1);

        if (error) {
          console.error("Error loading profile IDs:", error.message);
          break;
        }

        const rows = data || [];
        for (const row of rows as { id: string }[]) ids.add(row.id);

        if (rows.length < batchSize) break;
        from += batchSize;
      }

      return ids;
    };

    let validProfileIds = await getExistingProfileIds();

    // Restore order matters due to foreign keys
    const restoreOrder = [
      "operadoras",
      "system_config",
      "bot_settings",
      "notifications",
      "broadcast_progress",
      "telegram_users",
      "telegram_sessions",
      "profiles",
      "user_roles",
      "saldos",
      "pricing_rules",
      "reseller_pricing_rules",
      "reseller_config",
      "transactions",
      "recargas",
      "admin_notifications",
      "banners",
      "polls",
      "poll_votes",
      "chat_conversations",
      "chat_messages",
      "chat_message_reads",
      "chat_reactions",
      "push_subscriptions",
      "update_history",
    ];

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
          // profiles.id must exist in auth users
          rows = rows.filter((row: any) => row?.id && validAuthUserIds.has(row.id));
        } else if (profileFkTables.has(table)) {
          // dependent tables user_id must exist in profiles.id
          rows = rows.filter((row: any) => row?.user_id && validProfileIds.has(row.user_id));
        }

        const skipped = originalCount - rows.length;

        if (rows.length === 0) {
          results.push({ table, status: "skipped_fk", count: 0, skipped, error: `Todos os ${skipped} registros referenciavam usuários inexistentes` });
          continue;
        }

        // For system_config, use key as conflict target
        if (table === "system_config" || table === "bot_settings") {
          for (const row of rows) {
            await supabaseAdmin
              .from(table)
              .upsert(row, { onConflict: "key" });
          }
          results.push({ table, status: "restored", count: rows.length, skipped });
          if (table === "profiles") {
            validProfileIds = await getExistingProfileIds();
          }
          continue;
        }

        // For telegram_sessions, use chat_id as conflict target
        if (table === "telegram_sessions") {
          for (const row of rows) {
            await supabaseAdmin
              .from("telegram_sessions")
              .upsert(row, { onConflict: "chat_id" });
          }
          results.push({ table, status: "restored", count: rows.length, skipped });
          if (table === "profiles") {
            validProfileIds = await getExistingProfileIds();
          }
          continue;
        }

        // For saldos, unique on (user_id, tipo)
        if (table === "saldos") {
          let successCount = 0;
          for (const row of rows) {
            const { error } = await supabaseAdmin
              .from("saldos")
              .upsert(row, { onConflict: "user_id,tipo" });
            if (!error) successCount++;
          }
          results.push({ table, status: "restored", count: successCount, skipped });
          if (table === "profiles") {
            validProfileIds = await getExistingProfileIds();
          }
          continue;
        }

        // For all other tables, upsert in batches by id
        const batchSize = 100;
        let totalRestored = 0;
        let lastError: string | undefined;

        for (let i = 0; i < rows.length; i += batchSize) {
          const batch = rows.slice(i, i + batchSize);
          const { error } = await supabaseAdmin
            .from(table)
            .upsert(batch, { onConflict: "id" });

          if (error) {
            console.error(`Error restoring ${table} batch:`, error.message);
            // Try row by row on error
            for (const row of batch) {
              const { error: rowError } = await supabaseAdmin
                .from(table)
                .upsert(row, { onConflict: "id" });
              if (!rowError) {
                totalRestored++;
              } else {
                lastError = rowError.message;
              }
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
          error: lastError && totalRestored < rows.length ? `${rows.length - totalRestored} registros falharam: ${lastError}` : undefined
        });

        if (table === "profiles") {
          validProfileIds = await getExistingProfileIds();
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
