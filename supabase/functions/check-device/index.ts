import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;

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

    // ── Rate limiting: check recent failed login attempts ──
    const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString();
    
    const { data: recentAttempts } = await adminClient
      .from("login_attempts")
      .select("id")
      .eq("email", user.email || "")
      .eq("success", false)
      .gte("created_at", windowStart);

    const { data: ipAttempts } = await adminClient
      .from("login_attempts")
      .select("id")
      .eq("ip_address", clientIP)
      .eq("success", false)
      .gte("created_at", windowStart);

    const failedByEmail = recentAttempts?.length || 0;
    const failedByIP = ipAttempts?.length || 0;

    if (failedByEmail >= MAX_ATTEMPTS || failedByIP >= MAX_ATTEMPTS * 2) {
      // Log the rate-limited attempt
      await adminClient.from("audit_logs").insert({
        admin_id: user.id,
        action: "rate_limited_login",
        target_type: "antifraud",
        target_id: user.id,
        details: {
          email: user.email,
          ip_address: clientIP,
          failed_by_email: failedByEmail,
          failed_by_ip: failedByIP,
        },
      });

      return new Response(JSON.stringify({
        banned: false,
        rate_limited: true,
        message: `Muitas tentativas falhas. Aguarde ${WINDOW_MINUTES} minutos.`,
      }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Record successful login attempt
    await adminClient.from("login_attempts").insert({
      email: user.email || "",
      ip_address: clientIP,
      success: true,
    });

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

    // ── New device detection ──
    const { data: knownFingerprints } = await adminClient
      .from("login_fingerprints")
      .select("id")
      .eq("user_id", user.id)
      .eq("fingerprint_hash", fingerprint.fingerprint_hash)
      .limit(1);

    const isNewDevice = !knownFingerprints || knownFingerprints.length === 0;

    // Registrar fingerprint
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

    // ── Alert admin on new device ──
    if (isNewDevice) {
      // Get user profile info
      const { data: profile } = await adminClient
        .from("profiles")
        .select("nome, email")
        .eq("id", user.id)
        .single();

      await adminClient.from("audit_logs").insert({
        admin_id: user.id,
        action: "new_device_detected",
        target_type: "antifraud",
        target_id: user.id,
        details: {
          user_nome: profile?.nome || user.email,
          user_email: profile?.email || user.email,
          fingerprint_hash: fingerprint.fingerprint_hash,
          ip_address: clientIP,
          platform: fingerprint.platform || "unknown",
          user_agent: fingerprint.user_agent?.slice(0, 100) || "unknown",
        },
      });

      // Create admin notification
      await adminClient.from("admin_notifications").insert({
        type: "security",
        message: `Novo dispositivo detectado para ${profile?.nome || user.email} (IP: ${clientIP})`,
        user_id: user.id,
        user_nome: profile?.nome || null,
        user_email: profile?.email || user.email,
        status: "new",
      });
    }

    if (isBanned) {
      // Deslogar o usuário e desativar conta
      await adminClient.from("profiles").update({ active: false }).eq("id", user.id);

      // Audit log
      await adminClient.from("audit_logs").insert({
        admin_id: user.id,
        action: "banned_device_login_blocked",
        target_type: "antifraud",
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

    return new Response(JSON.stringify({ banned: false, new_device: isNewDevice }), {
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
