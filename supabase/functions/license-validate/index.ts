import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function verifyJWT(token: string, secret: string): Promise<{ valid: boolean; payload?: any; reason?: string }> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return { valid: false, reason: "Formato inválido" };

    const [header, body, sig] = parts;
    const encoder = new TextEncoder();
    const data = `${header}.${body}`;

    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const sigB64 = sig.replace(/-/g, "+").replace(/_/g, "/");
    const sigPadded = sigB64 + "=".repeat((4 - sigB64.length % 4) % 4);
    const sigBytes = Uint8Array.from(atob(sigPadded), c => c.charCodeAt(0));

    const isValid = await crypto.subtle.verify("HMAC", key, sigBytes, encoder.encode(data));
    if (!isValid) return { valid: false, reason: "Assinatura inválida" };

    const bodyPadded = body + "=".repeat((4 - body.length % 4) % 4);
    const payload = JSON.parse(atob(bodyPadded));

    return { valid: true, payload };
  } catch (err) {
    return { valid: false, reason: `Erro de verificação: ${err.message}` };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Helper to log events
  async function logEvent(event_type: string, result: string, extra: Record<string, any> = {}) {
    try {
      await supabaseAdmin.from("license_logs").insert({
        event_type,
        license_id: extra.license_id || null,
        mirror_name: extra.mirror_name || null,
        domain: extra.domain || null,
        ip_address: extra.ip_address || null,
        result,
        reason: extra.reason || null,
        details: extra.details || null,
      });
    } catch (_) { /* silent */ }
  }

  try {
    const body = await req.json();
    const { license_key, domain } = body;
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown";

    if (!license_key) {
      await logEvent("validation", "error", { domain, ip_address: ip, reason: "Chave não fornecida" });
      return new Response(JSON.stringify({ valid: false, reason: "Chave não fornecida" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const signingSecret = Deno.env.get("LICENSE_SIGNING_SECRET");
    if (!signingSecret) {
      await logEvent("validation", "error", { domain, ip_address: ip, reason: "Servidor não configurado (LICENSE_SIGNING_SECRET ausente)" });
      return new Response(JSON.stringify({ valid: false, reason: "Servidor não configurado" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Verify JWT signature
    const { valid, payload, reason } = await verifyJWT(license_key, signingSecret);
    if (!valid) {
      await logEvent("validation", "rejected", { domain, ip_address: ip, reason: reason || "Assinatura inválida", details: { key_prefix: license_key.slice(0, 20) } });
      return new Response(JSON.stringify({ valid: false, reason }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      await logEvent("validation", "expired", { license_id: payload.lid, domain, ip_address: ip, reason: "Licença expirada" });
      return new Response(JSON.stringify({ valid: false, reason: "Licença expirada" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Check domain if set
    if (payload.md && domain) {
      const licenseDomain = payload.md.replace(/^https?:\/\//, "").replace(/\/$/, "").toLowerCase();
      const requestDomain = domain.replace(/^https?:\/\//, "").replace(/\/$/, "").toLowerCase();
      if (licenseDomain !== requestDomain && !requestDomain.endsWith(`.${licenseDomain}`)) {
        await logEvent("validation", "domain_mismatch", {
          license_id: payload.lid, domain, ip_address: ip,
          reason: `Domínio não autorizado: ${requestDomain} ≠ ${licenseDomain}`,
          details: { expected: licenseDomain, received: requestDomain },
        });
        return new Response(JSON.stringify({ valid: false, reason: "Domínio não autorizado" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // 4. Check database record
    const { data: licenseRecord } = await supabaseAdmin
      .from("licenses")
      .select("is_active, expires_at, max_users, features, mirror_name")
      .eq("id", payload.lid)
      .maybeSingle();

    if (!licenseRecord) {
      await logEvent("validation", "not_found", { license_id: payload.lid, domain, ip_address: ip, reason: "Licença não encontrada no banco" });
      return new Response(JSON.stringify({ valid: false, reason: "Licença não encontrada" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!licenseRecord.is_active) {
      await logEvent("validation", "revoked", { license_id: payload.lid, mirror_name: licenseRecord.mirror_name, domain, ip_address: ip, reason: "Licença revogada" });
      return new Response(JSON.stringify({ valid: false, reason: "Licença revogada" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 5. Update heartbeat
    await supabaseAdmin
      .from("licenses")
      .update({ last_heartbeat_at: new Date().toISOString() })
      .eq("id", payload.lid);

    // 6. Log success
    await logEvent("validation", "success", {
      license_id: payload.lid, mirror_name: licenseRecord.mirror_name, domain, ip_address: ip,
      details: { expires_at: licenseRecord.expires_at },
    });

    // 7. Return success
    return new Response(JSON.stringify({
      valid: true,
      expires_at: licenseRecord.expires_at,
      max_users: licenseRecord.max_users,
      features: licenseRecord.features,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    await logEvent("validation", "error", { reason: err.message });
    return new Response(JSON.stringify({ valid: false, reason: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
