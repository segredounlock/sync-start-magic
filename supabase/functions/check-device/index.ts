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

    const body = await req.json();
    const fingerprint = body.fingerprint;
    if (!fingerprint?.fingerprint_hash) {
      return new Response(JSON.stringify({ error: "Fingerprint inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Capturar IP do request
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("cf-connecting-ip")
      || req.headers.get("x-real-ip")
      || "unknown";

    // Verificar banimento por fingerprint
    const { data: bannedByHash } = await adminClient
      .from("banned_devices")
      .select("id, reason")
      .eq("fingerprint_hash", fingerprint.fingerprint_hash)
      .eq("active", true)
      .limit(1);

    // Verificar banimento por IP
    const { data: bannedByIP } = await adminClient
      .from("banned_devices")
      .select("id, reason")
      .eq("ip_address", clientIP)
      .eq("active", true)
      .limit(1);

    const isBanned = (bannedByHash && bannedByHash.length > 0) || (bannedByIP && bannedByIP.length > 0);
    const banReason = bannedByHash?.[0]?.reason || bannedByIP?.[0]?.reason || "Dispositivo banido";

    // Registrar fingerprint independentemente do banimento
    await adminClient.from("login_fingerprints").insert({
      user_id: user.id,
      fingerprint_hash: fingerprint.fingerprint_hash,
      ip_address: clientIP,
      user_agent: fingerprint.user_agent || null,
      platform: fingerprint.platform || null,
      screen_resolution: fingerprint.screen_resolution || null,
      timezone: fingerprint.timezone || null,
      language: fingerprint.language || null,
      canvas_hash: fingerprint.canvas_hash || null,
      webgl_renderer: fingerprint.webgl_renderer || null,
      installed_plugins: fingerprint.installed_plugins || null,
      touch_support: fingerprint.touch_support ?? false,
      device_memory: fingerprint.device_memory || null,
      hardware_concurrency: fingerprint.hardware_concurrency || null,
      color_depth: fingerprint.color_depth || null,
      pixel_ratio: fingerprint.pixel_ratio || null,
      latitude: fingerprint.latitude || null,
      longitude: fingerprint.longitude || null,
      geolocation_accuracy: fingerprint.geolocation_accuracy || null,
      raw_data: fingerprint.raw_data || {},
    });

    if (isBanned) {
      // Deslogar o usuário e desativar conta
      await adminClient.from("profiles").update({ active: false }).eq("id", user.id);

      // Audit log
      await adminClient.from("audit_logs").insert({
        admin_id: user.id,
        action: "banned_device_login_blocked",
        target_type: "user",
        target_id: user.id,
        details: {
          fingerprint_hash: fingerprint.fingerprint_hash,
          ip_address: clientIP,
          reason: banReason,
          email: user.email,
        },
      });

      return new Response(JSON.stringify({ 
        banned: true, 
        reason: banReason 
      }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ banned: false }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Error in check-device:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
