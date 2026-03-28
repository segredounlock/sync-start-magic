import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Verify HMAC-SHA256 JWT signature
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

    // Restore base64 padding
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

  try {
    const body = await req.json();
    const { license_key, domain } = body;

    if (!license_key) {
      return new Response(JSON.stringify({ valid: false, reason: "Chave não fornecida" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const signingSecret = Deno.env.get("LICENSE_SIGNING_SECRET");
    if (!signingSecret) {
      return new Response(JSON.stringify({ valid: false, reason: "Servidor não configurado" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Verify JWT signature
    const { valid, payload, reason } = await verifyJWT(license_key, signingSecret);
    if (!valid) {
      return new Response(JSON.stringify({ valid: false, reason }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return new Response(JSON.stringify({ valid: false, reason: "Licença expirada" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Check domain if set
    if (payload.md && domain) {
      const licenseDomain = payload.md.replace(/^https?:\/\//, "").replace(/\/$/, "").toLowerCase();
      const requestDomain = domain.replace(/^https?:\/\//, "").replace(/\/$/, "").toLowerCase();
      if (licenseDomain !== requestDomain && !requestDomain.endsWith(`.${licenseDomain}`)) {
        return new Response(JSON.stringify({ valid: false, reason: "Domínio não autorizado" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // 4. Check database record
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: licenseRecord } = await supabaseAdmin
      .from("licenses")
      .select("is_active, expires_at, max_users, features")
      .eq("id", payload.lid)
      .maybeSingle();

    if (!licenseRecord) {
      return new Response(JSON.stringify({ valid: false, reason: "Licença não encontrada" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!licenseRecord.is_active) {
      return new Response(JSON.stringify({ valid: false, reason: "Licença revogada" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 5. Update heartbeat
    await supabaseAdmin
      .from("licenses")
      .update({ last_heartbeat_at: new Date().toISOString() })
      .eq("id", payload.lid);

    // 6. Return success
    return new Response(JSON.stringify({
      valid: true,
      expires_at: licenseRecord.expires_at,
      max_users: licenseRecord.max_users,
      features: licenseRecord.features,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ valid: false, reason: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
