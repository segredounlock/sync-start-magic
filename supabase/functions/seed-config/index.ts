import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * Seeds essential license config keys into system_config.
 * Uses service_role so RLS is bypassed.
 * No auth required — only inserts predefined safe keys.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(supabaseUrl, serviceRoleKey);

  // Fixed values — cannot be overridden by caller
  const SEED_KEYS: { key: string; value: string }[] = [
    { key: "license_master_url", value: "https://xtkqyjruyuydlbvwduuy.supabase.co" },
    { key: "masterProjectUrl", value: "https://recargasbrasill.com" },
  ];

  try {
    // Prevent running on the master itself
    if (supabaseUrl.includes("xtkqyjruyuydlbvwduuy")) {
      return new Response(
        JSON.stringify({ success: false, error: "Este é o servidor mestre. Seeding não necessário." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: { key: string; status: string }[] = [];

    for (const item of SEED_KEYS) {
      const { error } = await admin
        .from("system_config")
        .upsert({ key: item.key, value: item.value }, { onConflict: "key" });

      results.push({ key: item.key, status: error ? `error: ${error.message}` : "ok" });
    }

    // Verify
    const failed = results.filter((r) => r.status !== "ok");
    if (failed.length > 0) {
      return new Response(
        JSON.stringify({ success: false, error: `Falha em: ${failed.map(f => f.key).join(", ")}`, results }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
