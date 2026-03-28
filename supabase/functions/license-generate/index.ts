import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// HMAC-SHA256 signing
async function signPayload(payload: object, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" })).replace(/=+$/, "");
  const body = btoa(JSON.stringify(payload)).replace(/=+$/, "");
  const data = `${header}.${body}`;

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");

  return `${header}.${body}.${sigB64}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Não autorizado");

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
    if (!user) throw new Error("Não autorizado");

    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleData) throw new Error("Acesso negado");

    // Check if this is the master admin
    const { data: masterConfig } = await supabaseAdmin
      .from("system_config")
      .select("value")
      .eq("key", "masterAdminId")
      .maybeSingle();
    if (masterConfig?.value !== user.id) {
      throw new Error("Apenas o admin master pode gerar licenças");
    }

    const body = await req.json();
    const { mirror_name, mirror_domain, expires_at, max_users, features } = body;

    if (!mirror_name || !mirror_domain || !expires_at) {
      throw new Error("mirror_name, mirror_domain e expires_at são obrigatórios");
    }

    const signingSecret = Deno.env.get("LICENSE_SIGNING_SECRET");
    if (!signingSecret) throw new Error("LICENSE_SIGNING_SECRET não configurado");

    const licenseId = crypto.randomUUID();
    const payload = {
      lid: licenseId,
      mn: mirror_name,
      md: mirror_domain || null,
      exp: Math.floor(new Date(expires_at).getTime() / 1000),
      mu: max_users || 100,
      ft: features || ["all"],
      iat: Math.floor(Date.now() / 1000),
      iss: Deno.env.get("SUPABASE_URL"),
    };

    const licenseKey = await signPayload(payload, signingSecret);

    // Save to database
    const { error: insertError } = await supabaseAdmin.from("licenses").insert({
      id: licenseId,
      license_key: licenseKey,
      mirror_name,
      mirror_domain: mirror_domain || null,
      expires_at,
      max_users: max_users || 100,
      features: features || ["all"],
      created_by: user.id,
    });

    if (insertError) throw new Error(`Erro ao salvar: ${insertError.message}`);

    return new Response(JSON.stringify({
      success: true,
      license_key: licenseKey,
      id: licenseId,
      expires_at,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
