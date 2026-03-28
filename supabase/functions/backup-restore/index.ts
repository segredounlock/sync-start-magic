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
    const url = new URL(req.url);
    const safeMode = url.searchParams.get("mode") === "safe";

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

    // Get ALL existing auth user IDs via direct SQL
    const dbUrl = Deno.env.get("SUPABASE_DB_URL");
    let sqlConn: any = null;
    const validAuthUserIds = new Set<string>();

    if (dbUrl) {
      const { default: postgres } = await import("https://deno.land/x/postgresjs@v3.4.4/mod.js");
      sqlConn = postgres(dbUrl, { max: 1 });

      const existingUsers = await sqlConn`SELECT id FROM auth.users`;
      for (const u of existingUsers) validAuthUserIds.add(u.id);
    } else {
      // Fallback to Admin API if no DB URL
      let page = 1;
      while (true) {
        const { data: authPage } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
        const users = authPage?.users || [];
        for (const u of users) validAuthUserIds.add(u.id);
        if (users.length < 1000) break;
        page++;
      }
    }

    // ─── Restore auth.users from auth/users.json via SQL direto ───
    const authUsersFile = zip.file("auth/users.json");
    let authRestoreResult: { status: string; created: number; skipped: number; failed: number; errors: string[] } = {
      status: "not_found", created: 0, skipped: 0, failed: 0, errors: [],
    };

    if (safeMode) {
      authRestoreResult = { status: "skipped_safe_mode", created: 0, skipped: 0, failed: 0, errors: [] };
      console.log("Safe mode: skipping auth.users restore");
    } else if (authUsersFile) {
      try {
        const authUsersData = JSON.parse(await authUsersFile.async("string"));
        const authUsers = authUsersData.users || authUsersData || [];
        let created = 0, skipped = 0, failed = 0;
        const errors: string[] = [];

        if (sqlConn) {
          for (const au of authUsers) {
            if (!au.id || !au.email) { skipped++; continue; }
            if (validAuthUserIds.has(au.id)) { skipped++; continue; }

            try {
              await sqlConn`
                INSERT INTO auth.users (
                  id, email, encrypted_password, email_confirmed_at, confirmed_at,
                  created_at, updated_at, last_sign_in_at, banned_until,
                  raw_user_meta_data, raw_app_meta_data, phone,
                  aud, role, instance_id, is_sso_user
                ) VALUES (
                  ${au.id}::uuid,
                  ${au.email},
                  ${au.encrypted_password || ''},
                  ${au.email_confirmed_at || null},
                  ${au.confirmed_at || au.email_confirmed_at || null},
                  ${au.created_at || new Date().toISOString()},
                  ${au.updated_at || new Date().toISOString()},
                  ${au.last_sign_in_at || null},
                  ${au.banned_until || null},
                  ${JSON.stringify(au.raw_user_meta_data || {})}::jsonb,
                  ${JSON.stringify(au.raw_app_meta_data || au.app_metadata || { provider: "email", providers: ["email"] })}::jsonb,
                  ${au.phone || null},
                  ${au.aud || 'authenticated'},
                  ${au.role || 'authenticated'},
                  ${au.instance_id || '00000000-0000-0000-0000-000000000000'}::uuid,
                  ${au.is_sso_user || false}
                )
                ON CONFLICT (id) DO NOTHING
              `;
              validAuthUserIds.add(au.id);
              created++;
            } catch (err: any) {
              if (err.message?.includes("unique") || err.message?.includes("duplicate")) {
                skipped++;
              } else {
                failed++;
                if (errors.length < 10) errors.push(`${au.email}: ${err.message}`);
              }
            }
          }

          for (const au of authUsers) {
            if (!au.id || !au.email) continue;
            try {
              await sqlConn`
                INSERT INTO auth.identities (
                  id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at
                ) VALUES (
                  ${au.id}::uuid,
                  ${au.id}::uuid,
                  ${au.id},
                  'email',
                  ${JSON.stringify({ sub: au.id, email: au.email, email_verified: !!au.email_confirmed_at })}::jsonb,
                  ${au.last_sign_in_at || null},
                  ${au.created_at || new Date().toISOString()},
                  ${au.updated_at || new Date().toISOString()}
                )
                ON CONFLICT (provider, provider_id) DO NOTHING
              `;
            } catch (_err: any) {
              // Identity already exists, skip silently
            }
          }
        } else {
          for (const au of authUsers) {
            if (!au.id || !au.email) { skipped++; continue; }
            if (validAuthUserIds.has(au.id)) { skipped++; continue; }

            try {
              const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
                email: au.email,
                email_confirm: !!au.email_confirmed_at,
                phone: au.phone || undefined,
                user_metadata: au.raw_user_meta_data || au.user_metadata || {},
              });

              if (createErr) {
                if (createErr.message?.includes("already been registered") || createErr.message?.includes("already exists")) {
                  skipped++;
                } else {
                  failed++;
                  if (errors.length < 5) errors.push(`${au.email}: ${createErr.message}`);
                }
              } else if (newUser?.user) {
                validAuthUserIds.add(newUser.user.id);
                created++;
              }
            } catch (err: any) {
              failed++;
              if (errors.length < 5) errors.push(`${au.email}: ${err.message}`);
            }
          }
        }

        authRestoreResult = {
          status: created > 0 || skipped > 0 ? "restored" : "error",
          created, skipped, failed, errors,
        };

        console.log(`Auth users restore: ${created} created, ${skipped} skipped, ${failed} failed`);
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
      "mirror_sync_state", "mirror_file_state", "mirror_sync_logs",
      "licenses", "license_logs",
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

    // Tables to skip in safe mode
    const safeSkipTables = new Set(["system_config", "bot_settings"]);

    for (const table of restoreOrder) {
      // Safe mode: skip config tables
      if (safeMode && safeSkipTables.has(table)) {
        results.push({ table, status: "skipped_safe_mode", count: 0 });
        continue;
      }

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

        if (safeMode) {
          // Safe mode: INSERT only, ignore duplicates
          const batchSize = 100;
          let totalInserted = 0;
          for (let i = 0; i < rows.length; i += batchSize) {
            const batch = rows.slice(i, i + batchSize);
            const { error, count } = await supabaseAdmin.from(table).insert(batch, { count: "exact" } as any);
            if (error) {
              // Try row by row for conflicts
              for (const row of batch) {
                const { error: rowErr } = await supabaseAdmin.from(table).insert(row);
                if (!rowErr) totalInserted++;
                // Duplicate/conflict errors are silently ignored in safe mode
              }
            } else {
              totalInserted += count || batch.length;
            }
          }
          results.push({ table, status: "safe_restored", count: totalInserted, skipped });
          if (table === "profiles") validProfileIds = await getExistingProfileIds();
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

    // Close SQL connection if open
    if (sqlConn) {
      try { await sqlConn.end(); } catch (_) { /* ignore */ }
    }

    return new Response(JSON.stringify({
      success: true,
      mode: safeMode ? "safe" : "full",
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
