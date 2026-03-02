import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Helpers ──

function base64UrlToUint8Array(base64url: string): Uint8Array {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4 === 0 ? "" : "=".repeat(4 - (base64.length % 4));
  const bin = atob(base64 + pad);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

function uint8ArrayToBase64Url(arr: Uint8Array): string {
  let bin = "";
  for (const b of arr) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function importVapidKeys(publicKeyB64: string, privateKeyB64: string) {
  const pubRaw = base64UrlToUint8Array(publicKeyB64);
  const privRaw = base64UrlToUint8Array(privateKeyB64);
  const publicKey = await crypto.subtle.importKey("raw", pubRaw, { name: "ECDSA", namedCurve: "P-256" }, true, []);
  const privateKey = await crypto.subtle.importKey("pkcs8", privRaw, { name: "ECDSA", namedCurve: "P-256" }, true, ["sign"]);
  return { publicKey, privateKey };
}

async function createVapidAuthHeader(
  endpoint: string, vapidPublicKey: CryptoKey, vapidPrivateKey: CryptoKey, subject: string
) {
  const aud = new URL(endpoint).origin;
  const exp = Math.floor(Date.now() / 1000) + 12 * 3600;
  const header = { typ: "JWT", alg: "ES256" };
  const payload = { aud, exp, sub: subject };
  const headerB64 = uint8ArrayToBase64Url(new TextEncoder().encode(JSON.stringify(header)));
  const payloadB64 = uint8ArrayToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;
  const signature = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, vapidPrivateKey, new TextEncoder().encode(unsignedToken));
  const sigArray = new Uint8Array(signature);
  let rawSig: Uint8Array;
  if (sigArray.length === 64) {
    rawSig = sigArray;
  } else {
    const r = sigArray.slice(4, 4 + sigArray[3]);
    const sOffset = 4 + sigArray[3] + 2;
    const s = sigArray.slice(sOffset, sOffset + sigArray[sOffset - 1]);
    rawSig = new Uint8Array(64);
    rawSig.set(r.length > 32 ? r.slice(r.length - 32) : r, 32 - Math.min(r.length, 32));
    rawSig.set(s.length > 32 ? s.slice(s.length - 32) : s, 64 - Math.min(s.length, 32));
  }
  const jwt = `${unsignedToken}.${uint8ArrayToBase64Url(rawSig)}`;
  const pubKeyRaw = await crypto.subtle.exportKey("raw", vapidPublicKey);
  const k = uint8ArrayToBase64Url(new Uint8Array(pubKeyRaw));
  return { authorization: `vapid t=${jwt}, k=${k}` };
}

async function sendPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: { title: string; body: string; icon?: string },
  vapidPublicKey: CryptoKey, vapidPrivateKey: CryptoKey, vapidSubject: string
) {
  const { authorization } = await createVapidAuthHeader(subscription.endpoint, vapidPublicKey, vapidPrivateKey, vapidSubject);
  const payloadStr = JSON.stringify(payload);
  return await fetch(subscription.endpoint, {
    method: "POST",
    headers: { Authorization: authorization, "Content-Type": "application/octet-stream", TTL: "86400", Urgency: "high" },
    body: new TextEncoder().encode(payloadStr),
  });
}

// ── Main handler ──

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Read VAPID keys from system_config (auto-generated)
    const { data: configRows } = await supabase
      .from("system_config")
      .select("key, value")
      .in("key", ["vapid_public_key", "vapid_private_key"]);

    const configMap = Object.fromEntries((configRows || []).map((r: any) => [r.key, r.value]));
    if (!configMap.vapid_public_key || !configMap.vapid_private_key) {
      return new Response(
        JSON.stringify({ error: "VAPID keys not configured. Call vapid-setup first." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { title, body: msgBody, icon } = await req.json();
    if (!title || !msgBody) {
      return new Response(
        JSON.stringify({ error: "title and body required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get admin push subscriptions
    const { data: adminRoles } = await supabase.from("user_roles").select("user_id").eq("role", "admin");
    const adminIds = (adminRoles || []).map((r: any) => r.user_id);
    if (adminIds.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: "No admins found" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: subs } = await supabase.from("push_subscriptions").select("*").in("user_id", adminIds);
    if (!subs || subs.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: "No push subscriptions found" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { publicKey, privateKey } = await importVapidKeys(configMap.vapid_public_key, configMap.vapid_private_key);
    const payload = { title, body: msgBody, icon: icon || "/favicon.png" };

    let sent = 0, failed = 0;
    const expiredEndpoints: string[] = [];

    for (const sub of subs) {
      try {
        const res = await sendPushNotification(
          { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
          payload, publicKey, privateKey, "mailto:admin@recargasbrasill.com"
        );
        if (res.status === 201 || res.status === 200) sent++;
        else if (res.status === 404 || res.status === 410) { expiredEndpoints.push(sub.endpoint); failed++; }
        else failed++;
      } catch { failed++; }
    }

    if (expiredEndpoints.length > 0) {
      await supabase.from("push_subscriptions").delete().in("endpoint", expiredEndpoints);
    }

    return new Response(
      JSON.stringify({ sent, failed, total: subs.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
