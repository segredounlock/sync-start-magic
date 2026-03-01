import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TELEGRAM_API = "https://api.telegram.org/bot";

async function sendTelegramMessage(token: string, chatId: string, text: string) {
  const resp = await fetch(`${TELEGRAM_API}${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
  if (!resp.ok) {
    const errBody = await resp.text();
    console.error(`Telegram sendMessage failed [${resp.status}]:`, errBody);
  }
  return resp.ok;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { type, user_id, data } = await req.json();

    // Resolve bot token: prefer system_config, fallback to env
    const { data: tokenRow } = await supabase
      .from("system_config")
      .select("value")
      .eq("key", "telegramBotToken")
      .single();

    const BOT_TOKEN = tokenRow?.value || Deno.env.get("TELEGRAM_BOT_TOKEN");
    if (!BOT_TOKEN) {
      console.error("No Telegram bot token found in system_config or env");
      return new Response(
        JSON.stringify({ success: false, reason: "no_bot_token" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user profile with telegram_id
    const { data: profile } = await supabase
      .from("profiles")
      .select("nome, email, telegram_id")
      .eq("id", user_id)
      .single();

    if (!profile?.telegram_id) {
      return new Response(
        JSON.stringify({ success: false, reason: "no_telegram_linked" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let message = "";
    const fmt = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;

    if (type === "recarga_completed") {
      message = [
        "✅ <b>Recarga Realizada!</b>",
        "",
        `📞 Telefone: <code>${data.telefone}</code>`,
        data.operadora ? `📡 Operadora: ${data.operadora}` : "",
        `💰 Valor: <b>${fmt(data.valor)}</b>`,
        "",
        `💳 Novo saldo: <b>${fmt(data.novo_saldo)}</b>`,
      ].filter(Boolean).join("\n");
    } else if (type === "saldo_added") {
      message = [
        "💰 <b>Saldo Adicionado!</b>",
        "",
        `➕ Valor: <b>${fmt(data.valor)}</b>`,
        `💳 Novo saldo: <b>${fmt(data.novo_saldo)}</b>`,
        "",
        "📱 Use /recarga para recarregar!",
      ].join("\n");
    } else if (type === "saldo_set") {
      message = [
        "💰 <b>Saldo Atualizado!</b>",
        "",
        `💳 Novo saldo: <b>${fmt(data.novo_saldo)}</b>`,
        "",
        "📱 Use /recarga para recarregar!",
      ].join("\n");
    } else {
      return new Response(
        JSON.stringify({ success: false, reason: "unknown_type" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Sending ${type} notification to telegram_id=${profile.telegram_id}`);
    const sent = await sendTelegramMessage(BOT_TOKEN, profile.telegram_id, message);

    return new Response(
      JSON.stringify({ success: sent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Telegram notify error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
