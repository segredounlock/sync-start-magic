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

    const zip = new JSZip();

    // Discover all public tables dynamically
    let tables: string[] = [];
    if (includeDatabase) {
      const { data: tableRows, error: tableError } = await supabaseAdmin.rpc("get_public_tables");
      if (tableError) {
        console.error("Error discovering tables via RPC, using fallback query:", tableError.message);
        // Fallback: try raw query via PostgREST isn't possible, so use a known list as last resort
        tables = [];
      } else {
        tables = (tableRows || []).map((r: any) => r.table_name);
      }

      // If RPC didn't work or returned empty, try fetching from information_schema via a different approach
      if (tables.length === 0) {
        // Use supabaseAdmin to query each known table and discover dynamically
        // As a robust fallback, list all tables we can successfully query
        const candidateTables = [
          "operadoras", "system_config", "bot_settings", "notifications", "broadcast_progress",
          "telegram_users", "telegram_sessions", "profiles", "user_roles", "saldos",
          "pricing_rules", "reseller_pricing_rules", "reseller_config", "transactions", "recargas",
          "admin_notifications", "banners", "polls", "poll_votes", "follows", "audit_logs",
          "chat_conversations", "chat_members", "chat_messages", "chat_message_reads", "chat_reactions",
          "push_subscriptions", "update_history", "disabled_recharge_values", "referral_commissions",
        ];
        for (const t of candidateTables) {
          const { error } = await supabaseAdmin.from(t).select("id").limit(0);
          if (!error) tables.push(t);
        }
      }
    }

    // Metadata
    zip.file("backup-info.json", JSON.stringify({
      version: "2.0",
      created_at: new Date().toISOString(),
      created_by: user.email,
      include_database: includeDatabase,
      tables: tables,
    }, null, 2));

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
                error: error.message,
                rows: [],
                count: 0,
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
            table,
            count: allRows.length,
            exported_at: new Date().toISOString(),
            rows: allRows,
          }, null, 2));
        } catch (err: any) {
          dbFolder!.file(`${table}.json`, JSON.stringify({
            table,
            error: err.message,
            rows: [],
            count: 0,
          }, null, 2));
        }
      }
    }

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
