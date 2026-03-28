import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/** Sign a short-lived session token with HMAC-SHA256 */
async function signSessionToken(payload: Record<string, unknown>, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" })).replace(/=/g, "");
  const body = btoa(JSON.stringify(payload)).replace(/=/g, "");
  const data = `${header}.${body}`;
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  return `${data}.${sigB64}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const json = (obj: Record<string, unknown>, status = 200) =>
    new Response(JSON.stringify(obj), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Get license_key from this mirror's system_config
    const { data: keyConfig } = await supabaseAdmin
      .from("system_config")
      .select("value")
      .eq("key", "license_key")
      .maybeSingle();

    if (!keyConfig?.value) {
      return json({ valid: false, reason: "Nenhuma licença configurada", code: "NO_LICENSE" });
    }

    // 2. Get master URL
    const { data: masterUrlConfig } = await supabaseAdmin
      .from("system_config")
      .select("value")
      .eq("key", "license_master_url")
      .maybeSingle();

    const masterUrl = masterUrlConfig?.value || Deno.env.get("SUPABASE_URL")!;
    const domain = (await req.json().catch(() => ({}))).domain || "";

    // 3. Get install_domain for verification
    const { data: domainConfig } = await supabaseAdmin
      .from("system_config")
      .select("value")
      .eq("key", "install_domain")
      .maybeSingle();

    // 4. Call master server to validate
    const validateResp = await fetch(`${masterUrl}/functions/v1/license-validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        license_key: keyConfig.value,
        domain: domain || domainConfig?.value || "",
      }),
    });

    const result = await validateResp.json();

    if (!result.valid) {
      // Update local tracking
      await supabaseAdmin
        .from("system_config")
        .upsert({ key: "license_status", value: "invalid" }, { onConflict: "key" });

      return json({ valid: false, reason: result.reason, code: "INVALID" });
    }

    // 5. Update local tracking
    await supabaseAdmin
      .from("system_config")
      .upsert({ key: "license_validated_at", value: new Date().toISOString() }, { onConflict: "key" });
    await supabaseAdmin
      .from("system_config")
      .upsert({ key: "license_expires_at", value: result.expires_at }, { onConflict: "key" });
    await supabaseAdmin
      .from("system_config")
      .upsert({ key: "license_status", value: "valid" }, { onConflict: "key" });

    // 6. Generate install_secret if not exists (for HMAC proofs)
    let { data: secretConfig } = await supabaseAdmin
      .from("system_config")
      .select("value")
      .eq("key", "install_secret")
      .maybeSingle();

    if (!secretConfig?.value) {
      const newSecret = crypto.randomUUID() + "-" + crypto.randomUUID();
      await supabaseAdmin
        .from("system_config")
        .upsert({ key: "install_secret", value: newSecret }, { onConflict: "key" });
      secretConfig = { value: newSecret };
    }

    // 7. Create signed session token (1h validity)
    const sessionPayload = {
      iss: "license-check-server",
      dom: domainConfig?.value || domain,
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
      iat: Math.floor(Date.now() / 1000),
      lex: result.expires_at, // license expiration
      nonce: crypto.randomUUID(),
    };

    const sessionToken = await signSessionToken(sessionPayload, secretConfig!.value);

    return json({
      valid: true,
      expires_at: result.expires_at,
      session_token: sessionToken,
      session_expires: sessionPayload.exp,
      features: result.features,
    });
  } catch (err) {
    return json({ valid: false, reason: err.message, code: "ERROR" }, 500);
  }
});
