import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function getSupabase() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

async function getBotToken(supabase: any): Promise<string> {
  const { data, error } = await supabase
    .from("system_config")
    .select("value")
    .eq("key", "telegramBotToken")
    .maybeSingle();
  if (error || !data?.value) throw new Error("Bot token não configurado");
  return data.value;
}

async function validateTelegramHash(params: Record<string, string>, botToken: string): Promise<boolean> {
  const { hash, ...rest } = params;
  if (!hash) return false;

  // Check auth_date is not too old (24h)
  const authDate = parseInt(rest.auth_date || "0");
  if (Date.now() / 1000 - authDate > 86400) return false;

  // Build data_check_string
  const dataCheckString = Object.keys(rest)
    .sort()
    .map((k) => `${k}=${rest[k]}`)
    .join("\n");

  // HMAC-SHA256 validation
  const encoder = new TextEncoder();
  const secretKeyData = await crypto.subtle.digest("SHA-256", encoder.encode(botToken));
  const secretKey = await crypto.subtle.importKey("raw", secretKeyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", secretKey, encoder.encode(dataCheckString));
  const hexHash = Array.from(new Uint8Array(signature)).map((b) => b.toString(16).padStart(2, "0")).join("");

  return hexHash === hash;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { id, first_name, last_name, username, photo_url, auth_date, hash } = body;

    if (!id || !hash || !auth_date) {
      return new Response(JSON.stringify({ error: "Dados incompletos" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = getSupabase();
    const botToken = await getBotToken(supabase);

    // Build params object for validation (only non-empty values)
    const params: Record<string, string> = {};
    if (id) params.id = String(id);
    if (first_name) params.first_name = first_name;
    if (last_name) params.last_name = last_name;
    if (username) params.username = username;
    if (photo_url) params.photo_url = photo_url;
    if (auth_date) params.auth_date = String(auth_date);
    params.hash = hash;

    const valid = await validateTelegramHash(params, botToken);
    if (!valid) {
      return new Response(JSON.stringify({ error: "Hash inválido ou expirado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const telegramId = String(id);
    const displayName = [first_name, last_name].filter(Boolean).join(" ") || username || `tg_${telegramId}`;

    // Check if profile with this telegram_id exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id, nome")
      .eq("telegram_id", telegramId)
      .maybeSingle();

    let userId: string;

    if (existingProfile) {
      // User exists - get their auth record
      userId = existingProfile.id;
    } else {
      // Create new user with random password
      const fakeEmail = `tg_${telegramId}@telegram.local`;
      const randomPassword = crypto.randomUUID() + crypto.randomUUID();

      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: fakeEmail,
        password: randomPassword,
        email_confirm: true,
        user_metadata: { nome: displayName, telegram_id: telegramId },
      });

      if (createError) {
        // Maybe user exists with that email but profile not linked
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const found = existingUsers?.users?.find((u: any) => u.email === fakeEmail);
        if (found) {
          userId = found.id;
        } else {
          throw createError;
        }
      } else {
        userId = newUser.user.id;
      }

      // Update or create profile
      await supabase
        .from("profiles")
        .upsert({
          id: userId,
          nome: displayName,
          telegram_id: telegramId,
          telegram_username: username || null,
        }, { onConflict: "id" });

      // Assign revendedor role if no role exists
      const { data: existingRole } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (!existingRole) {
        await supabase.from("user_roles").insert({ user_id: userId, role: "revendedor" });
      }
    }

    // Update telegram info on profile
    if (existingProfile) {
      await supabase
        .from("profiles")
        .update({ telegram_username: username || null })
        .eq("id", userId);
    }

    // Generate a session using admin API
    // We create a magic link and extract the token
    const fakeEmail = `tg_${telegramId}@telegram.local`;
    
    // Use generateLink to create an auth link
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: fakeEmail,
    });

    if (linkError || !linkData) {
      throw new Error("Falha ao gerar sessão: " + (linkError?.message || "unknown"));
    }

    // The hashed_token can be used to verify OTP
    const { data: sessionData, error: sessionError } = await supabase.auth.verifyOtp({
      type: "magiclink",
      token_hash: linkData.properties?.hashed_token,
    });

    if (sessionError || !sessionData?.session) {
      throw new Error("Falha ao verificar sessão: " + (sessionError?.message || "no session"));
    }

    return new Response(
      JSON.stringify({
        access_token: sessionData.session.access_token,
        refresh_token: sessionData.session.refresh_token,
        user: sessionData.session.user,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("telegram-login error:", err);
    return new Response(JSON.stringify({ error: err.message || "Erro interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
