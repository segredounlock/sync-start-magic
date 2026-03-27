import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const projectId = supabaseUrl.replace("https://", "").split(".")[0];

    let payload: any = {};
    try {
      payload = await req.json();
    } catch {
      payload = {};
    }

    const bodyToken = typeof payload?.token === "string" ? payload.token.trim() : "";

    // Try DB for master token, fallback to env
    let dbToken = "";
    try {
      const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
      const sb = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      const { data: configRow } = await sb
        .from("system_config")
        .select("value")
        .eq("key", "telegramBotToken")
        .maybeSingle();
      dbToken = (configRow?.value ?? "").trim();
    } catch { /* fallback to env */ }

    const envToken = (Deno.env.get("TELEGRAM_BOT_TOKEN") ?? "").trim();
    const BOT_TOKEN = bodyToken || dbToken || envToken;

    if (!BOT_TOKEN) throw new Error("Telegram token não configurado");

    // Get bot ID to use as identifier in webhook URL
    const meResp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
    const meData = await meResp.json();
    if (!meData?.ok) throw new Error("Token inválido");
    const botId = String(meData.result.id);

    // Webhook URL includes bot_id so the handler knows which token to use
    const webhookUrl = `https://${projectId}.supabase.co/functions/v1/telegram-bot?bot_id=${botId}`;

    const action = payload?.action || "setup";

    // If reset, delete webhook first and drop pending updates
    if (action === "reset") {
      const delResp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drop_pending_updates: true }),
      });
      const delResult = await delResp.json();
      console.log("deleteWebhook result:", JSON.stringify(delResult));
      // Small delay to ensure Telegram processes the delete
      await new Promise(r => setTimeout(r, 500));
    }

    const resp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ["message", "callback_query"],
      }),
    });

    const result = await resp.json();
    if (!result?.ok) throw new Error(result?.description || "Falha ao configurar webhook no Telegram");

    const commandsResp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setMyCommands`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        commands: [
          { command: "start", description: "Iniciar o bot / Vincular conta" },
          { command: "menu", description: "Abrir menu principal" },
          { command: "saldo", description: "Consultar saldo" },
          { command: "recarga", description: "Fazer recarga" },
          { command: "deposito", description: "Depositar via PIX" },
          { command: "historico", description: "Histórico de recargas" },
          { command: "ajuda", description: "Lista de comandos" },
        ],
      }),
    });

    const commandsResult = await commandsResp.json();
    if (!commandsResult?.ok) throw new Error(commandsResult?.description || "Falha ao configurar comandos do bot");

    // Set bot short description (profile, 160 chars)
    try {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setMyShortDescription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          short_description: "Recargas de celular com os melhores preços do Brasil! 📱💰",
        }),
      });
    } catch (e) { console.log("setMyShortDescription error:", e); }

    // Set bot description (start screen, 512 chars)
    try {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setMyDescription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: "🇧🇷 Recargas Brasil — Bot Oficial\n\n📱 Recargas de celular para todas as operadoras\n💰 Melhores preços do mercado\n⚡ Recarga instantânea\n🔒 Pagamento seguro via PIX\n\n✅ Clique em INICIAR para começar!",
        }),
      });
    } catch (e) { console.log("setMyDescription error:", e); }

    return new Response(JSON.stringify({ success: true, webhook: webhookUrl, telegram: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
