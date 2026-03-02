import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function uint8ArrayToBase64Url(arr: Uint8Array): string {
  let bin = "";
  for (const b of arr) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Check if keys already exist
    const { data: existing } = await supabase
      .from("system_config")
      .select("key, value")
      .in("key", ["vapid_public_key", "vapid_private_key"]);

    const existingMap = Object.fromEntries((existing || []).map((r: any) => [r.key, r.value]));

    if (existingMap.vapid_public_key && existingMap.vapid_private_key) {
      return new Response(
        JSON.stringify({ 
          status: "already_configured", 
          publicKey: existingMap.vapid_public_key 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate ECDSA P-256 key pair for VAPID
    const keyPair = await crypto.subtle.generateKey(
      { name: "ECDSA", namedCurve: "P-256" },
      true,
      ["sign", "verify"]
    );

    // Export public key as raw (uncompressed point, 65 bytes)
    const publicKeyRaw = new Uint8Array(await crypto.subtle.exportKey("raw", keyPair.publicKey));
    const publicKeyB64 = uint8ArrayToBase64Url(publicKeyRaw);

    // Export private key as PKCS8
    const privateKeyRaw = new Uint8Array(await crypto.subtle.exportKey("pkcs8", keyPair.privateKey));
    const privateKeyB64 = uint8ArrayToBase64Url(privateKeyRaw);

    // Store in system_config
    await supabase.from("system_config").upsert([
      { key: "vapid_public_key", value: publicKeyB64 },
      { key: "vapid_private_key", value: privateKeyB64 },
    ], { onConflict: "key" });

    return new Response(
      JSON.stringify({ 
        status: "created", 
        publicKey: publicKeyB64 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
