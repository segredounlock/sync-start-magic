import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Token inválido" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check admin
    const { data: isAdmin } = await adminClient.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Apenas administradores" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { user_id, reason } = await req.json();
    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user info
    const { data: profile } = await adminClient
      .from("profiles")
      .select("nome, email")
      .eq("id", user_id)
      .maybeSingle();

    // Get all fingerprints for this user
    const { data: fingerprints } = await adminClient
      .from("login_fingerprints")
      .select("fingerprint_hash, ip_address")
      .eq("user_id", user_id);

    if (!fingerprints || fingerprints.length === 0) {
      return new Response(JSON.stringify({ error: "Nenhum fingerprint encontrado para este usuário" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get unique fingerprints and IPs
    const uniqueHashes = [...new Set(fingerprints.map((f: any) => f.fingerprint_hash).filter(Boolean))];
    const uniqueIPs = [...new Set(fingerprints.map((f: any) => f.ip_address).filter(Boolean))];

    let bannedCount = 0;

    // Ban each unique fingerprint hash
    for (const hash of uniqueHashes) {
      const { data: existing } = await adminClient
        .from("banned_devices")
        .select("id")
        .eq("fingerprint_hash", hash)
        .eq("active", true)
        .maybeSingle();

      if (!existing) {
        await adminClient.from("banned_devices").insert({
          fingerprint_hash: hash,
          reason: reason || "Golpe/Fraude",
          banned_by: user.id,
          original_user_id: user_id,
          original_user_email: profile?.email,
          original_user_nome: profile?.nome,
        });
        bannedCount++;
      }
    }

    // Ban each unique IP
    for (const ip of uniqueIPs) {
      const { data: existing } = await adminClient
        .from("banned_devices")
        .select("id")
        .eq("ip_address", ip)
        .eq("active", true)
        .maybeSingle();

      if (!existing) {
        await adminClient.from("banned_devices").insert({
          ip_address: ip,
          reason: reason || "Golpe/Fraude",
          banned_by: user.id,
          original_user_id: user_id,
          original_user_email: profile?.email,
          original_user_nome: profile?.nome,
        });
        bannedCount++;
      }
    }

    // Deactivate the user
    await adminClient.from("profiles").update({ active: false }).eq("id", user_id);

    // Audit log
    await adminClient.from("audit_logs").insert({
      admin_id: user.id,
      action: "ban_user_devices",
      target_type: "user",
      target_id: user_id,
      details: {
        nome: profile?.nome,
        email: profile?.email,
        fingerprints_banned: uniqueHashes.length,
        ips_banned: uniqueIPs.length,
        total_entries: bannedCount,
        reason: reason || "Golpe/Fraude",
      },
    });

    return new Response(JSON.stringify({
      success: true,
      fingerprints_banned: uniqueHashes.length,
      ips_banned: uniqueIPs.length,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Error in ban-device:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
