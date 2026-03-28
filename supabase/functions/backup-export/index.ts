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

    const body = await req.json().catch(() => ({}));
    const includeDatabase = body.includeDatabase !== false;
    const includeSchema = body.includeSchema === true;
    const includeAuth = body.includeAuth !== false;

    const zip = new JSZip();

    // Discover all public tables dynamically
    let tables: string[] = [];
    if (includeDatabase) {
      const { data: tableRows, error: tableError } = await supabaseAdmin.rpc("get_public_tables");
      if (tableError) {
        console.error("Error discovering tables via RPC, using fallback query:", tableError.message);
        tables = [];
      } else {
        tables = (tableRows || []).map((r: any) => r.table_name);
      }

      if (tables.length === 0) {
        const candidateTables = [
          "operadoras", "system_config", "bot_settings", "notifications", "broadcast_progress",
          "broadcast_messages", "telegram_users", "telegram_sessions", "terms_acceptance",
          "profiles", "user_roles", "saldos",
          "pricing_rules", "reseller_pricing_rules", "reseller_base_pricing_rules",
          "reseller_config", "reseller_deposit_fees",
          "disabled_recharge_values", "client_pricing_rules", "transactions", "recargas",
          "admin_notifications", "banners", "polls", "poll_votes", "follows", "audit_logs",
          "referral_commissions", "scratch_cards",
          "support_templates", "support_tickets", "support_messages",
          "chat_conversations", "chat_members", "chat_messages", "chat_message_reads", "chat_reactions",
          "push_subscriptions", "update_history",
          "login_fingerprints", "login_attempts", "banned_devices",
          "mirror_sync_state", "mirror_file_state", "mirror_sync_logs",
          "licenses", "license_logs",
        ];
        for (const t of candidateTables) {
          const { error } = await supabaseAdmin.from(t).select("id").limit(0);
          if (!error) tables.push(t);
        }
      }
    }


    // === DATABASE DATA ===
    if (includeDatabase && tables.length > 0) {
      const dbFolder = zip.folder("database");

      for (const table of tables) {
        try {
          let allRows: any[] = [];
          let from = 0;
          const batchSize = 1000;
          let hasMore = true;

          while (hasMore) {
            const { data, error } = await supabaseAdmin
              .from(table)
              .select("*")
              .range(from, from + batchSize - 1);

            if (error) {
              console.error(`Error fetching ${table}:`, error.message);
              dbFolder!.file(`${table}.json`, JSON.stringify({
                error: error.message, rows: [], count: 0,
              }, null, 2));
              hasMore = false;
              continue;
            }

            allRows = allRows.concat(data || []);
            if (!data || data.length < batchSize) {
              hasMore = false;
            } else {
              from += batchSize;
            }
          }

          dbFolder!.file(`${table}.json`, JSON.stringify({
            table, count: allRows.length,
            exported_at: new Date().toISOString(),
            rows: allRows,
          }, null, 2));
        } catch (err: any) {
          dbFolder!.file(`${table}.json`, JSON.stringify({
            table, error: err.message, rows: [], count: 0,
          }, null, 2));
        }
      }
    }

    // === AUTH USERS EXPORT (via SQL direto para capturar encrypted_password) ===
    let authUsersCount = 0;
    if (includeAuth) {
      const authFolder = zip.folder("auth");
      try {
        const dbUrl = Deno.env.get("SUPABASE_DB_URL");
        if (!dbUrl) {
          throw new Error("SUPABASE_DB_URL não configurado");
        }

        const { default: postgres } = await import("https://deno.land/x/postgresjs@v3.4.4/mod.js");
        const sql = postgres(dbUrl, { max: 1 });

        try {
          const users = await sql`
            SELECT id, email, encrypted_password, email_confirmed_at,
                   created_at, updated_at, last_sign_in_at, banned_until,
                   raw_user_meta_data, raw_app_meta_data, phone,
                   confirmation_token, recovery_token, aud, role,
                   instance_id, is_sso_user, confirmed_at
            FROM auth.users
            ORDER BY created_at
          `;

          const allUsers = users.map((u: any) => ({
            id: u.id,
            email: u.email,
            encrypted_password: u.encrypted_password || null,
            phone: u.phone || null,
            email_confirmed_at: u.email_confirmed_at || null,
            confirmed_at: u.confirmed_at || null,
            created_at: u.created_at,
            updated_at: u.updated_at || null,
            last_sign_in_at: u.last_sign_in_at || null,
            banned_until: u.banned_until || null,
            raw_user_meta_data: u.raw_user_meta_data || {},
            raw_app_meta_data: u.raw_app_meta_data || {},
            aud: u.aud || "authenticated",
            role: u.role || "authenticated",
            instance_id: u.instance_id || "00000000-0000-0000-0000-000000000000",
            is_sso_user: u.is_sso_user || false,
          }));

          authUsersCount = allUsers.length;
          authFolder!.file("users.json", JSON.stringify({
            count: allUsers.length,
            exported_at: new Date().toISOString(),
            export_method: "direct_sql",
            note: "Exportado via SQL direto. Inclui encrypted_password (bcrypt hash) para restauração completa.",
            users: allUsers,
          }, null, 2));
        } finally {
          await sql.end();
        }
      } catch (err: any) {
        console.error("Auth export error:", err.message);
        authFolder!.file("_error.txt", `Error: ${err.message}`);
      }
    }

    // === SCHEMA EXPORT (functions, RLS, triggers, enums) ===
    if (includeSchema) {
      const schemaFolder = zip.folder("schema");

      try {
        // Use the export_schema_info RPC
        const { data: schemaData, error: schemaError } = await supabaseUser.rpc("export_schema_info");

        if (schemaError) {
          console.error("Schema export error:", schemaError.message);
          schemaFolder!.file("_error.txt", `Error: ${schemaError.message}`);
        } else if (schemaData) {
          // Functions as individual SQL
          const funcs = schemaData.functions || [];
          let functionsSql = `-- Exported at: ${new Date().toISOString()}\n`;
          functionsSql += `-- Total functions: ${funcs.length}\n\n`;
          for (const fn of funcs) {
            functionsSql += `-- Function: ${fn.name}\n`;
            functionsSql += `${fn.source}\n\n`;
          }
          schemaFolder!.file("functions.sql", functionsSql);

          // RLS policies as JSON
          schemaFolder!.file("rls-policies.json", JSON.stringify(schemaData.rls_policies || [], null, 2));

          // Triggers
          schemaFolder!.file("triggers.json", JSON.stringify(schemaData.triggers || [], null, 2));

          // Enums
          schemaFolder!.file("enums.json", JSON.stringify(schemaData.enums || [], null, 2));

          // Full schema dump
          schemaFolder!.file("full-schema.json", JSON.stringify(schemaData, null, 2));
        }
      } catch (err: any) {
        console.error("Schema export error:", err.message);
        schemaFolder!.file("_error.txt", `Error: ${err.message}`);
      }

      // === CONFIG ===
      const configFolder = zip.folder("config");

      // Supabase config.toml content
      const { data: configData } = await supabaseAdmin
        .from("system_config")
        .select("key, value")
        .order("key");

      // env template
      const envTemplate = [
        "# Variáveis de ambiente necessárias para o projeto",
        "# Preencha com os valores do seu novo ambiente",
        "",
        "VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co",
        "VITE_SUPABASE_PUBLISHABLE_KEY=sua_anon_key_aqui",
        "VITE_SUPABASE_PROJECT_ID=seu_project_id",
        "",
        "# Edge Function secrets (configurar no dashboard):",
        "# SUPABASE_URL",
        "# SUPABASE_ANON_KEY",
        "# SUPABASE_SERVICE_ROLE_KEY",
        "# SUPABASE_DB_URL",
        "# LOVABLE_API_KEY",
      ].join("\n");
      configFolder!.file("env-template.env", envTemplate);

      // Secrets list (names only, no values)
      const secretsList = [
        { name: "SUPABASE_URL", description: "URL do projeto Supabase" },
        { name: "SUPABASE_ANON_KEY", description: "Chave anônima" },
        { name: "SUPABASE_SERVICE_ROLE_KEY", description: "Chave de serviço (admin)" },
        { name: "SUPABASE_DB_URL", description: "URL direta do PostgreSQL" },
        { name: "LOVABLE_API_KEY", description: "Chave do Lovable AI Gateway" },
        { name: "SUPABASE_PUBLISHABLE_KEY", description: "Chave pública" },
      ];
      configFolder!.file("secrets-list.json", JSON.stringify(secretsList, null, 2));

      // System config dump (gateway keys, feature flags etc)
      if (configData) {
        // Filter out sensitive values
        const safeConfig = configData.map((c: any) => ({
          key: c.key,
          value: c.key.toLowerCase().includes("token") || c.key.toLowerCase().includes("secret") || c.key.toLowerCase().includes("pat")
            ? "***REDACTED***"
            : c.value,
        }));
        configFolder!.file("system-config.json", JSON.stringify(safeConfig, null, 2));
      }
    }

    // Metadata (after all data collected)
    zip.file("backup-info.json", JSON.stringify({
      version: "3.4",
      created_at: new Date().toISOString(),
      created_by: user.email,
      include_database: includeDatabase,
      include_auth: includeAuth,
      include_schema: includeSchema,
      tables: tables,
      auth_users: authUsersCount,
    }, null, 2));

    const zipBlob = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });

    return new Response(zipBlob, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="backup-recargas-${new Date().toISOString().slice(0, 10)}.zip"`,
      },
    });
  } catch (error: any) {
    console.error("Backup error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
