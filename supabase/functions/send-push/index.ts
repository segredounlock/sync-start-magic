import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Base64url helpers ──

function base64UrlToUint8Array(b64: string): Uint8Array {
  const base64 = b64.replace(/-/g, "+").replace(/_/g, "/");
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

// ── VAPID JWT ──

async function importVapidKeys(publicKeyB64: string, privateKeyB64: string) {
  const pubRaw = base64UrlToUint8Array(publicKeyB64);
  const privRaw = base64UrlToUint8Array(privateKeyB64);
  const publicKey = await crypto.subtle.importKey("raw", pubRaw, { name: "ECDSA", namedCurve: "P-256" }, true, []);
  const privateKey = await crypto.subtle.importKey("pkcs8", privRaw, { name: "ECDSA", namedCurve: "P-256" }, true, ["sign"]);
  return { publicKey, privateKey, publicKeyRaw: pubRaw };
}

async function createVapidJwt(
  endpoint: string, vapidPublicKey: CryptoKey, vapidPrivateKey: CryptoKey, subject: string
) {
  const aud = new URL(endpoint).origin;
  const exp = Math.floor(Date.now() / 1000) + 12 * 3600;
  const header = { typ: "JWT", alg: "ES256" };
  const payload = { aud, exp, sub: subject };
  const headerB64 = uint8ArrayToBase64Url(new TextEncoder().encode(JSON.stringify(header)));
  const payloadB64 = uint8ArrayToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;
  const signature = new Uint8Array(
    await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, vapidPrivateKey, new TextEncoder().encode(unsignedToken))
  );

  // Convert DER signature to raw r||s (64 bytes)
  let rawSig: Uint8Array;
  if (signature.length === 64) {
    rawSig = signature;
  } else {
    const r = signature.slice(4, 4 + signature[3]);
    const sOffset = 4 + signature[3] + 2;
    const s = signature.slice(sOffset, sOffset + signature[sOffset - 1]);
    rawSig = new Uint8Array(64);
    rawSig.set(r.length > 32 ? r.slice(r.length - 32) : r, 32 - Math.min(r.length, 32));
    rawSig.set(s.length > 32 ? s.slice(s.length - 32) : s, 64 - Math.min(s.length, 32));
  }

  const jwt = `${unsignedToken}.${uint8ArrayToBase64Url(rawSig)}`;
  const pubKeyRaw = new Uint8Array(await crypto.subtle.exportKey("raw", vapidPublicKey));
  const k = uint8ArrayToBase64Url(pubKeyRaw);
  return `vapid t=${jwt}, k=${k}`;
}

// ── RFC 8291 Web Push Encryption (aes128gcm) ──

async function hkdfSha256(salt: Uint8Array, ikm: Uint8Array, info: Uint8Array, length: number): Promise<Uint8Array> {
  // Extract
  const prkKey = await crypto.subtle.importKey("raw", salt, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const prk = new Uint8Array(await crypto.subtle.sign("HMAC", prkKey, ikm));
  // Expand
  const expandKey = await crypto.subtle.importKey("raw", prk, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const infoWithCounter = new Uint8Array([...info, 1]);
  const okm = new Uint8Array(await crypto.subtle.sign("HMAC", expandKey, infoWithCounter));
  return okm.slice(0, length);
}

function concat(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((s, a) => s + a.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const a of arrays) { result.set(a, offset); offset += a.length; }
  return result;
}

async function encryptPayload(
  subscriberPubB64: string,
  authSecretB64: string,
  payloadBytes: Uint8Array
): Promise<Uint8Array> {
  const subscriberPubRaw = base64UrlToUint8Array(subscriberPubB64);
  const authSecret = base64UrlToUint8Array(authSecretB64);

  // 1. Generate ephemeral ECDH key pair
  const serverECDH = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]
  );
  const serverPubRaw = new Uint8Array(await crypto.subtle.exportKey("raw", serverECDH.publicKey));

  // 2. Import subscriber public key for ECDH
  const subscriberKey = await crypto.subtle.importKey(
    "raw", subscriberPubRaw, { name: "ECDH", namedCurve: "P-256" }, false, []
  );

  // 3. ECDH shared secret
  const sharedSecret = new Uint8Array(
    await crypto.subtle.deriveBits({ name: "ECDH", public: subscriberKey }, serverECDH.privateKey, 256)
  );

  // 4. Generate salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // 5. Derive IKM: HKDF(auth_secret, shared_secret, "WebPush: info\0" || subscriber_pub || server_pub, 32)
  const infoIKM = concat(
    new TextEncoder().encode("WebPush: info\0"),
    subscriberPubRaw,
    serverPubRaw
  );
  const ikm = await hkdfSha256(authSecret, sharedSecret, infoIKM, 32);

  // 6. Derive CEK: HKDF(salt, ikm, "Content-Encoding: aes128gcm\0", 16)
  const cekInfo = new TextEncoder().encode("Content-Encoding: aes128gcm\0");
  const cek = await hkdfSha256(salt, ikm, cekInfo, 16);

  // 7. Derive nonce: HKDF(salt, ikm, "Content-Encoding: nonce\0", 12)
  const nonceInfo = new TextEncoder().encode("Content-Encoding: nonce\0");
  const nonce = await hkdfSha256(salt, ikm, nonceInfo, 12);

  // 8. Pad payload: payload || 0x02 (record delimiter)
  const padded = new Uint8Array(payloadBytes.length + 1);
  padded.set(payloadBytes);
  padded[payloadBytes.length] = 2;

  // 9. Encrypt with AES-128-GCM
  const aesKey = await crypto.subtle.importKey("raw", cek, { name: "AES-GCM" }, false, ["encrypt"]);
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, aesKey, padded)
  );

  // 10. Build aes128gcm body:
  // salt (16) || rs (4, big-endian) || idlen (1) || keyid (serverPubRaw, 65) || ciphertext
  const rs = 4096;
  const rsBytes = new Uint8Array(4);
  new DataView(rsBytes.buffer).setUint32(0, rs, false);
  const idlen = new Uint8Array([serverPubRaw.length]);

  return concat(salt, rsBytes, idlen, serverPubRaw, ciphertext);
}

// ── Send push to a single subscription ──

async function sendPush(
  sub: { endpoint: string; p256dh: string; auth: string },
  payload: {
    title: string;
    body: string;
    icon?: string;
    image?: string;
    url?: string;
    type?: string;
    tag?: string;
    id?: string;
    requireInteraction?: boolean;
    actions?: { action: string; title: string }[];
    timestamp?: string;
  },
  vapidPublicKey: CryptoKey, vapidPrivateKey: CryptoKey, vapidSubject: string
): Promise<Response> {
  const authorization = await createVapidJwt(sub.endpoint, vapidPublicKey, vapidPrivateKey, vapidSubject);
  const payloadBytes = new TextEncoder().encode(JSON.stringify(payload));
  const encrypted = await encryptPayload(sub.p256dh, sub.auth, payloadBytes);

  return fetch(sub.endpoint, {
    method: "POST",
    headers: {
      Authorization: authorization,
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "aes128gcm",
      TTL: "86400",
      Urgency: "high",
    },
    body: encrypted,
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

    // Read VAPID keys
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

    const { title, body: msgBody, icon, user_ids } = await req.json();
    if (!title || !msgBody) {
      return new Response(
        JSON.stringify({ error: "title and body required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get target subscriptions (admins by default, or specific user_ids)
    let targetIds: string[];
    if (user_ids && Array.isArray(user_ids) && user_ids.length > 0) {
      targetIds = user_ids;
    } else {
      const { data: adminRoles } = await supabase.from("user_roles").select("user_id").eq("role", "admin");
      targetIds = (adminRoles || []).map((r: any) => r.user_id);
    }

    if (targetIds.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: "No target users" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: subs } = await supabase.from("push_subscriptions").select("*").in("user_id", targetIds);
    if (!subs || subs.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: "No push subscriptions" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { publicKey, privateKey } = await importVapidKeys(configMap.vapid_public_key, configMap.vapid_private_key);
    const payload = { title, body: msgBody, icon: icon || "/favicon.png" };

    console.log(`[Push] Sending to ${subs.length} subscriptions for ${targetIds.length} users`);

    let sent = 0, failed = 0;
    const expiredEndpoints: string[] = [];

    // Send in parallel for speed
    const results = await Promise.allSettled(
      subs.map(async (sub: any) => {
        try {
          const res = await sendPush(
            { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
            payload, publicKey, privateKey, "mailto:noreply@example.com"
          );
          if (res.status === 201 || res.status === 200) {
            console.log(`[Push] ✅ Sent to user=${sub.user_id} endpoint=${sub.endpoint.slice(-20)}`);
            return "sent";
          } else if (res.status === 404 || res.status === 410) {
            console.warn(`[Push] ❌ Expired (${res.status}) user=${sub.user_id}`);
            expiredEndpoints.push(sub.endpoint);
            return "expired";
          } else {
            const errText = await res.text().catch(() => "");
            console.error(`[Push] ❌ Failed ${res.status} user=${sub.user_id}: ${errText}`);
            return "failed";
          }
        } catch (e) {
          console.error(`[Push] ❌ Error user=${sub.user_id}:`, e);
          return "failed";
        }
      })
    );

    for (const r of results) {
      if (r.status === "fulfilled" && r.value === "sent") sent++;
      else failed++;
    }

    if (expiredEndpoints.length > 0) {
      await supabase.from("push_subscriptions").delete().in("endpoint", expiredEndpoints);
    }

    return new Response(
      JSON.stringify({ sent, failed, total: subs.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[Push] Handler error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
