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

    // Get ALL existing auth user IDs (paginated)
    const existingAuthUsers = new Map<string, boolean>();
    {
      let page = 1;
      while (true) {
        const { data: authPage } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
        const users = authPage?.users || [];
        for (const u of users) existingAuthUsers.set(u.id, true);
        if (users.length < 1000) break;
        page++;
      }
    }
    const validAuthUserIds = new Set(existingAuthUsers.keys());

    // ─── Restore auth.users from auth/users.json (BEFORE database tables) ───
    const authUsersFile = zip.file("auth/users.json");
    let authRestoreResult: { status: string; created: number; skipped: number; failed: number; errors: string[] } = {
      status: "not_found", created: 0, skipped: 0, failed: 0, errors: [],
    };

    if (authUsersFile) {
      try {
        const authUsersData = JSON.parse(await authUsersFile.async("string"));
        const authUsers = authUsersData.users || authUsersData || [];
        let created = 0, skipped = 0, failed = 0;
        const errors: string[] = [];

        for (const au of authUsers) {
          if (!au.id || !au.email) { skipped++; continue; }

          // Skip if user already exists
          if (validAuthUserIds.has(au.id)) { skipped++; continue; }

          try {
            const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
              email: au.email,
              email_confirm: !!au.email_confirmed_at,
              phone: au.phone || undefined,
              user_metadata: au.raw_user_meta_data || au.user_metadata || {},
              // password not available — user will need to reset
            });

            if (createErr) {
              // If user exists by email (duplicate), just skip
              if (createErr.message?.includes("already been registered") || createErr.message?.includes("already exists")) {
                skipped++;
              } else {
                failed++;
                if (errors.length < 5) errors.push(`${au.email}: ${createErr.message}`);
              }
            } else if (newUser?.user) {
              validAuthUserIds.add(newUser.user.id);
              created++;

              // If the backup user had a different ID than the newly created one,
              // we can't easily reconcile. Log it but the profiles will reference the old ID.
              // Best case: Supabase assigns a new UUID, which won't match profiles.
              // To avoid this, we need to check if createUser allows specifying the ID.
              // Unfortunately the Admin API doesn't allow setting a custom UUID.
              // So we track the mapping but can't force the ID.
              if (newUser.user.id !== au.id) {
                console.warn(`Auth user ${au.email} created with new ID ${newUser.user.id} (backup ID: ${au.id}). Profile FK may not match.`);
              }
            }
          } catch (err: any) {
            failed++;
            if (errors.length < 5) errors.push(`${au.email}: ${err.message}`);
          }
        }

        authRestoreResult = {
          status: created > 0 || skipped > 0 ? "restored" : "error",
          created, skipped, failed, errors,
        };

        console.log(`Auth users restore: ${created} created, ${skipped} skipped, ${failed} failed`);

        // Refresh valid auth user IDs after creating new users
        if (created > 0) {
          validAuthUserIds.clear();
          let page = 1;
          while (true) {
            const { data: authPage } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
            const users = authPage?.users || [];
            for (const u of users) validAuthUserIds.add(u.id);
            if (users.length < 1000) break;
            page++;
          }
        }
      } catch (err: any) {
        console.error("Error restoring auth users:", err.message);
        authRestoreResult = { status: "error", created: 0, skipped: 0, failed: 0, errors: [err.message] };
      }
    }

    // Tables that have user_id referencing profiles.id
    const profileFkTables = new Set([
      "user_roles", "saldos", "recargas", "reseller_pricing_rules", "reseller_base_pricing_rules",
      "reseller_config", "transactions", "disabled_recharge_values", "referral_commissions",
      "scratch_cards", "client_pricing_rules", "push_subscriptions",
      "support_tickets", "support_messages", "reseller_deposit_fees",
      "login_fingerprints", "poll_votes",
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
      "broadcast_messages", "telegram_users", "telegram_sessions", "terms_acceptance",
      "profiles", "user_roles", "saldos",
      "pricing_rules", "reseller_pricing_rules", "reseller_base_pricing_rules",
      "reseller_config", "reseller_deposit_fees",
      "disabled_recharge_values", "client_pricing_rules", "transactions", "recargas",
      "referral_commissions", "admin_notifications", "banners", "polls", "poll_votes",
      "follows", "audit_logs", "login_attempts", "support_templates", "support_tickets", "support_messages",
      "chat_conversations", "chat_members", "chat_messages", "chat_message_reads", "chat_reactions",
      "push_subscriptions", "update_history", "scratch_cards",
      "login_fingerprints", "banned_devices",
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
      auth_users: authRestoreResult,
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
