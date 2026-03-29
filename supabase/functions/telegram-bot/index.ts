import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TELEGRAM_API = "https://api.telegram.org/bot";

// Reuse supabase client across requests (connection pooling)
let _supabase: any = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
  }
  return _supabase;
}

// Token cache with longer TTL since token issue is resolved
const tokenCache: Map<string, { token: string; time: number }> = new Map();
const TOKEN_CACHE_TTL = 120_000; // 2 minutes

// Migration config cache
let migrationCache: { enabled: boolean; url: string; time: number } | null = null;
const MIGRATION_CACHE_TTL = 300_000; // 5 minutes

// Seasonal theme cache
let seasonalCache: { theme: string; emojis: Record<string, string>; time: number } | null = null;
const SEASONAL_CACHE_TTL = 60_000; // 1 minute

const SEASONAL_EMOJI_MAP: Record<string, Record<string, string>> = {
  none: {},
  ano_novo: { saldo: "🥂", recarga: "🎆", historico: "🎇", deposito: "✨", conta: "⭐", webapp: "🎉", migration: "🎇", menu: "🎉" },
  carnaval: { saldo: "🎭", recarga: "💃", historico: "🎊", deposito: "🪇", conta: "🌈", webapp: "🎉", migration: "🎊", menu: "🎭" },
  pascoa: { saldo: "🥚", recarga: "🐰", historico: "🐣", deposito: "🍫", conta: "🌸", webapp: "🌷", migration: "🐣", menu: "🐰" },
  dia_maes: { saldo: "💐", recarga: "🌹", historico: "🌸", deposito: "❤️", conta: "💕", webapp: "🌺", migration: "🌸", menu: "💐" },
  dia_namorados: { saldo: "💘", recarga: "💕", historico: "💖", deposito: "❤️", conta: "💝", webapp: "🥰", migration: "💕", menu: "💕" },
  festa_junina: { saldo: "🌽", recarga: "🔥", historico: "🪗", deposito: "🎪", conta: "⛺", webapp: "🎏", migration: "🌽", menu: "🎪" },
  dia_pais: { saldo: "👔", recarga: "⭐", historico: "🏆", deposito: "💪", conta: "🎖️", webapp: "💙", migration: "👔", menu: "👔" },
  dia_criancas: { saldo: "🎈", recarga: "🎮", historico: "🧸", deposito: "🍭", conta: "🌈", webapp: "🎠", migration: "🎈", menu: "🎈" },
  black_friday: { saldo: "💰", recarga: "⚡", historico: "🏷️", deposito: "💸", conta: "🤑", webapp: "🔥", migration: "💸", menu: "🏷️" },
  natal: { saldo: "🎁", recarga: "🎄", historico: "❄️", deposito: "🎅", conta: "☃️", webapp: "⭐", migration: "🎁", menu: "🎄" },
};

async function getSeasonalEmojis(supabase: any): Promise<Record<string, string>> {
  if (seasonalCache && (Date.now() - seasonalCache.time) < SEASONAL_CACHE_TTL) {
    return seasonalCache.emojis;
  }
  const { data } = await supabase
    .from("system_config")
    .select("value")
    .eq("key", "seasonalTheme")
    .maybeSingle();
  const theme = data?.value || "none";
  const emojis = SEASONAL_EMOJI_MAP[theme] || {};
  seasonalCache = { theme, emojis, time: Date.now() };
  return emojis;
}

// Default emojis (when no seasonal theme)
const DEFAULT_EMOJIS = { saldo: "💰", recarga: "📱", historico: "📋", deposito: "💳", conta: "👤", webapp: "🌐", migration: "💰", menu: "📖" };

function se(emojis: Record<string, string>, key: string): string {
  return emojis[key] || DEFAULT_EMOJIS[key] || "";
}

async function getMigrationConfig(supabase: any): Promise<{ enabled: boolean; url: string }> {
  if (migrationCache && (Date.now() - migrationCache.time) < MIGRATION_CACHE_TTL) {
    return { enabled: migrationCache.enabled, url: migrationCache.url };
  }
  const { data } = await supabase
    .from("system_config")
    .select("key, value")
    .in("key", ["migration_message_enabled", "migration_old_site_url"]);
  
  const map: Record<string, string> = {};
  for (const row of (data || [])) map[row.key] = row.value || "";
  
  const result = {
    enabled: map["migration_message_enabled"] === "true",
    url: map["migration_old_site_url"] || "",
  };
  migrationCache = { ...result, time: Date.now() };
  return result;
}

// ── Admin push notification for Telegram activity ──
async function notifyAdminTelegramActivity(supabase: any, type: string, message: string, extra: Record<string, any> = {}) {
  try {
    await supabase.from("admin_notifications").insert({
      type,
      message,
      amount: extra.amount || 0,
      user_id: extra.user_id || null,
      user_nome: extra.user_nome || null,
      user_email: extra.user_email || null,
      status: extra.status || "new",
    });
    // Also trigger web push to all admin subscriptions
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    fetch(`${supabaseUrl}/functions/v1/send-push`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${serviceKey}` },
      body: JSON.stringify({ title: "🤖 Telegram", body: message, topic: "telegram_activity" }),
    }).catch((error) => console.error("[TELEGRAM_ACTIVITY] push dispatch failed:", error));
  } catch (error) {
    console.error("[TELEGRAM_ACTIVITY] failed to notify admin:", error);
  }
}

// Default margin cache
let defaultMarginCache: { enabled: boolean; type: string; value: number; time: number } | null = null;
const DEFAULT_MARGIN_CACHE_TTL = 30_000; // 30s

async function getDefaultMarginConfig(supabase: any): Promise<{ enabled: boolean; type: string; value: number }> {
  if (defaultMarginCache && (Date.now() - defaultMarginCache.time) < DEFAULT_MARGIN_CACHE_TTL) {
    return {
      enabled: defaultMarginCache.enabled,
      type: defaultMarginCache.type,
      value: defaultMarginCache.value,
    };
  }

  const { data } = await supabase
    .from("system_config")
    .select("key, value")
    .in("key", ["defaultMarginEnabled", "defaultMarginType", "defaultMarginValue"]);

  const map: Record<string, string> = {};
  for (const row of (data || [])) map[row.key] = row.value || "";

  const result = {
    enabled: map.defaultMarginEnabled === "true",
    type: map.defaultMarginType || "fixo",
    value: parseFloat(map.defaultMarginValue || "0"),
  };

  defaultMarginCache = { ...result, time: Date.now() };
  return result;
}

async function resolveUserRole(
  supabase: any,
  userId: string,
  fallback: "admin" | "revendedor" | "cliente" | "usuario" = "usuario",
): Promise<string> {
  const { data: roleRows, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  if (error) {
    console.error(`[ROLE] failed to resolve roles for user=${userId}:`, error.message);
    return fallback;
  }

  const roles = new Set((roleRows || []).map((r: any) => String(r.role || "").toLowerCase()));
  if (roles.has("admin")) return "admin";
  if (roles.has("revendedor")) return "revendedor";
  if (roles.has("cliente")) return "cliente";
  if (roles.has("usuario")) return "usuario";
  return fallback;
}

async function resolveBotToken(supabase: any, botId?: string): Promise<string> {
  const cacheKey = botId || "__default__";
  const cached = tokenCache.get(cacheKey);
  if (cached && (Date.now() - cached.time) < TOKEN_CACHE_TTL) {
    return cached.token;
  }

  // 1. system_config (admin master)
  const { data: sysData } = await supabase
    .from("system_config")
    .select("value")
    .eq("key", "telegramBotToken")
    .maybeSingle();
  const sysToken = typeof sysData?.value === "string" ? sysData.value.trim() : "";
  if (sysToken) {
    tokenCache.set(cacheKey, { token: sysToken, time: Date.now() });
    return sysToken;
  }

  // 2. env variable
  const envToken = (Deno.env.get("TELEGRAM_BOT_TOKEN") ?? "").trim();
  if (envToken) {
    tokenCache.set(cacheKey, { token: envToken, time: Date.now() });
    return envToken;
  }

  // 3. reseller_config (reseller tokens)
  if (botId) {
    const { data: configs } = await supabase
      .from("reseller_config")
      .select("value")
      .eq("key", "telegram_bot_token")
      .like("value", `${botId}:%`);
    if (configs?.length) {
      const tkn = (configs[0].value || "").trim();
      if (tkn) {
        tokenCache.set(cacheKey, { token: tkn, time: Date.now() });
        return tkn;
      }
    }
  }

  throw new Error("Telegram token não configurado");
}

// ===== TELEGRAM API HELPERS (fire-and-forget where possible) =====

function generateQRCodeUrl(pixCode: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(pixCode)}&size=400x400&margin=20&format=png`;
}

async function fetchJsonWithTimeout(url: string, init: RequestInit, timeoutMs = 12000): Promise<any> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const resp = await fetch(url, { ...init, signal: controller.signal });
    const raw = await resp.text();
    let parsed: any = null;

    if (raw) {
      try {
        parsed = JSON.parse(raw);
      } catch {
        throw new Error("Resposta inválida do serviço de PIX");
      }
    }

    if (!resp.ok) {
      throw new Error(parsed?.error || parsed?.message || `HTTP ${resp.status}`);
    }

    return parsed;
  } catch (err: any) {
    if (err?.name === "AbortError") {
      throw new Error("Tempo limite ao gerar PIX. Tente novamente.");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function sendPhoto(token: string, chatId: number, photoSource: string, caption: string, keyboard?: any[][]): Promise<number | null> {
  const body: any = { chat_id: chatId, caption, parse_mode: "HTML" };
  if (keyboard) body.reply_markup = { inline_keyboard: keyboard };

  if (photoSource.startsWith("data:")) {
    const base64Data = photoSource.replace(/^data:image\/\w+;base64,/, "");
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    const formData = new FormData();
    formData.append("chat_id", String(chatId));
    formData.append("caption", caption);
    formData.append("parse_mode", "HTML");
    if (keyboard) formData.append("reply_markup", JSON.stringify({ inline_keyboard: keyboard }));
    formData.append("photo", new Blob([binaryData], { type: "image/png" }), "qrcode.png");
    const resp = await fetch(`${TELEGRAM_API}${token}/sendPhoto`, { method: "POST", body: formData });
    const result = await resp.json();
    return result?.result?.message_id || null;
  } else {
    body.photo = photoSource;
    const resp = await fetch(`${TELEGRAM_API}${token}/sendPhoto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = await resp.json();
    return result?.result?.message_id || null;
  }
}

async function sendMessage(token: string, chatId: number, text: string): Promise<number | null> {
  const resp = await fetch(`${TELEGRAM_API}${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
  const result = await resp.json();
  return result?.result?.message_id || null;
}

async function sendMessageWithKeyboard(token: string, chatId: number, text: string, keyboard: any[][]): Promise<number | null> {
  const resp = await fetch(`${TELEGRAM_API}${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId, text, parse_mode: "HTML",
      reply_markup: { inline_keyboard: keyboard },
    }),
  });
  const result = await resp.json();
  if (!result?.ok) {
    console.error(`[ERROR] sendMessageWithKeyboard failed: ${JSON.stringify(result)}`);
  }
  return result?.result?.message_id || null;
}

async function editMessageWithKeyboard(token: string, chatId: number, messageId: number, text: string, keyboard: any[][]) {
  await fetch(`${TELEGRAM_API}${token}/editMessageText`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId, message_id: messageId, text, parse_mode: "HTML",
      reply_markup: { inline_keyboard: keyboard },
    }),
  }).catch(() => {});
}

// Fire-and-forget delete - don't await
function deleteMessageFire(token: string, chatId: number, messageId: number) {
  fetch(`${TELEGRAM_API}${token}/deleteMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, message_id: messageId }),
  }).catch(() => {});
}

// Parallel delete - fire all at once
function deleteMessagesBatch(token: string, chatId: number, messageIds: number[]) {
  for (const id of messageIds) {
    deleteMessageFire(token, chatId, id);
  }
}

// Session helpers
async function getSession(supabase: any, chatId: string) {
  const { data } = await supabase
    .from("telegram_sessions")
    .select("*")
    .eq("chat_id", chatId)
    .maybeSingle();
  return data;
}

async function setSession(supabase: any, chatId: string, step: string, data: any = {}) {
  await supabase
    .from("telegram_sessions")
    .upsert({ chat_id: chatId, step, data, updated_at: new Date().toISOString() }, { onConflict: "chat_id" });
}

async function clearSession(supabase: any, chatId: string) {
  // Fire and forget
  supabase.from("telegram_sessions").delete().eq("chat_id", chatId).then(() => {});
}

// Register/update user in telegram_users table for broadcast counting
async function ensureTelegramUser(supabase: any, telegramId: number, firstName?: string, username?: string) {
  await supabase.from("telegram_users").upsert(
    {
      telegram_id: telegramId,
      first_name: firstName || null,
      username: username || null,
      is_registered: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "telegram_id" }
  );
}

// Fetch catalog from Recarga Express API v2
async function fetchCatalog(supabase: any): Promise<any[]> {
  const { data: apiKeyRow } = await supabase
    .from("system_config")
    .select("value")
    .eq("key", "apiKey")
    .single();
  
  if (!apiKeyRow?.value) return [];
  
  const resp = await fetch("https://express.poeki.dev/api/v2/catalog", {
    headers: { "X-API-Key": apiKeyRow.value, Accept: "application/json" },
  });
  const result = await resp.json();
  if (!result?.success || !result.data) return [];
  // Map v2 format to v1-compatible format
  return result.data.map((c: any) => {
    const name = (c.operator || "").toUpperCase();
    return {
      operator: name,
      carrierId: c.operator,
      name,
      values: (c.values || []).map((v: any) => ({
        valueId: `${c.operator}_${v.amount}`,
        value: v.amount,
        amount: v.amount,
        cost: v.cost,
        label: `R$ ${v.amount}`,
      })),
    };
  });
}

// Robust value resolution — v2 uses amount directly
function resolveValue(v: any): number {
  return Number(v?.amount) || Number(v?.value) || Number(v?.cost) || 0;
}

async function findUserByTelegram(supabase: any, telegramId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("id, nome, email, active, whatsapp_number")
    .eq("telegram_id", telegramId)
    .maybeSingle();
  return data ? { ...data, telefone: data.whatsapp_number } : null;
}

function generatePassword(): string {
  const chars = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#";
  let pass = "";
  for (let i = 0; i < 10; i++) pass += chars[Math.floor(Math.random() * chars.length)];
  return pass;
}

// ===== SITE NAME & URL (dynamic from system_config) =====
let siteNameCache: { value: string; url: string; time: number } | null = null;
const SITE_NAME_TTL = 300_000; // 5 minutes

async function getSiteName(supabase: any): Promise<string> {
  await loadSiteConfig(supabase);
  return siteNameCache?.value || "Sistema de Recargas";
}

async function getSiteUrl(supabase: any): Promise<string> {
  await loadSiteConfig(supabase);
  return siteNameCache?.url || "";
}

async function loadSiteConfig(supabase: any) {
  if (siteNameCache && Date.now() - siteNameCache.time < SITE_NAME_TTL) return;
  try {
    const { data } = await supabase.from("system_config").select("key, value").in("key", ["siteTitle", "siteUrl"]);
    const map: Record<string, string> = {};
    for (const r of data || []) map[r.key] = r.value || "";
    siteNameCache = {
      value: map.siteTitle || "Sistema de Recargas",
      url: (map.siteUrl || "").replace(/\/+$/, ""),
      time: Date.now(),
    };
  } catch {
    if (!siteNameCache) siteNameCache = { value: "Sistema de Recargas", url: "", time: Date.now() };
  }
}

// ===== TERMS OF SERVICE =====
const TERMS_VALIDITY_MS = 5 * 60 * 1000; // 5 minutes

function buildTermsText(siteName: string, siteUrl = ""): string {
  return `📜 <b>TERMOS DE UTILIZAÇÃO</b>
🌐 <b>${siteName}</b> — ${siteUrl}

Ao utilizar este bot e/ou o site, você concorda com as seguintes regras:

1️⃣ <b>Sobre o Serviço</b> — O <b>${siteName}</b> é uma plataforma de recargas de celular online, acessível via bot do Telegram e pelo site ${siteUrl}.

2️⃣ <b>Uso Responsável</b> — O sistema é destinado exclusivamente para recargas de celular. Qualquer uso indevido resultará em bloqueio imediato.

3️⃣ <b>Saldo e Pagamentos</b> — Depósitos via PIX são processados automaticamente. Recargas confirmadas <b>não podem ser estornadas</b>.

4️⃣ <b>Dados Pessoais</b> — Seus dados são armazenados de forma segura e utilizados apenas para operação do serviço, conforme a LGPD.

5️⃣ <b>Responsabilidade</b> — O usuário é responsável por informar corretamente o número e operadora. Recargas para números errados não serão reembolsadas.

6️⃣ <b>Disponibilidade</b> — O serviço pode sofrer interrupções para manutenção. Não nos responsabilizamos por indisponibilidades temporárias.

7️⃣ <b>Proibições</b> — É proibido o uso de bots, scripts ou automações para interagir com este sistema.

8️⃣ <b>Suporte</b> — Em caso de dúvidas, utilize o botão "Ajuda / Suporte" ou acesse ${siteUrl}.

9️⃣ <b>Alterações</b> — Os termos podem ser atualizados a qualquer momento. O uso continuado implica aceitação.

💠 <b>PERGUNTAS FREQUENTES</b> 💠

❶ <b>Qual o tempo máximo que a recarga pode cair?</b>
A recarga pode ser efetivada em até <b>24 horas</b> após o envio ao sistema.

❷ <b>Vocês fazem reembolso via PIX?</b>
Não. Há custos operacionais no sistema e o serviço é voltado para <b>revendedores</b>. O valor é devolvido em <b>saldo</b> caso a recarga seja cancelada.

❸ <b>O que fazer se minha recarga for cancelada?</b>
O saldo é devolvido automaticamente. Reembolse seu cliente e envie para outro número.

🛠 <b>POLÍTICA DE SUPORTE — LEIA COM ATENÇÃO</b>

Nós <b>não vendemos para o cliente final</b>. Vendemos para <b>você, revendedor</b>. O atendimento ao seu cliente é de <b>sua responsabilidade</b>.

Antes de acionar o suporte, <b>verifique no app da operadora</b>:

🔴 <b>Claro</b> — CPF + senha do app <b>Minha Claro</b>
🟣 <b>TIM</b> — Número da linha + senha do app <b>Meu TIM</b>

⚠️ Se o cliente se recusar a fornecer os dados, a verificação não poderá ser feita e o suporte <b>não prosseguirá</b>.

⏱️ As recargas geralmente aparecem no extrato da operadora em até <b>1 hora</b> após a conclusão. Informe esse prazo ao seu cliente <b>antes</b> de realizar a recarga.

⚠️ <b>Ao clicar em "Aceitar", você confirma que leu e concorda com todos os termos acima.</b>`;
}

const TERMS_IMAGE = "https://img.freepik.com/free-vector/terms-service-concept-illustration_114360-1095.jpg"; // kept for future optional use

async function checkTermsAccepted(supabase: any, telegramId: string): Promise<boolean> {
  const { data } = await supabase
    .from("terms_acceptance")
    .select("accepted_at")
    .eq("telegram_id", telegramId)
    .order("accepted_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return false;
  const elapsed = Date.now() - new Date(data.accepted_at).getTime();
  return elapsed < TERMS_VALIDITY_MS;
}

async function recordTermsAcceptance(supabase: any, telegramId: string) {
  await supabase.from("terms_acceptance").upsert(
    { telegram_id: telegramId, accepted_at: new Date().toISOString() },
    { onConflict: "telegram_id" }
  );
}

async function sendTermsMessage(token: string, chatId: number, siteName = "Sistema de Recargas", siteUrl = "") {
  await sendMessageWithKeyboard(token, chatId, buildTermsText(siteName, siteUrl), [
    [{ text: "✅ Aceitar Termos", callback_data: "terms_accept" }],
    [{ text: "❌ Recusar", callback_data: "terms_decline" }],
  ]);
}

// Send pending deposit notifications that weren't delivered yet
async function sendPendingNotifications(supabase: any, token: string, chatId: number, userId: string) {
  try {
    const { data: pending } = await supabase
      .from("transactions")
      .select("id, amount, created_at, metadata")
      .eq("user_id", userId)
      .eq("status", "completed")
      .eq("telegram_notified", false)
      .eq("type", "deposit")
      .order("created_at", { ascending: true })
      .limit(10);

    if (!pending || pending.length === 0) return;

    // Get current balance
    const { data: saldo } = await supabase
      .from("saldos")
      .select("valor")
      .eq("user_id", userId)
      .eq("tipo", "revenda")
      .maybeSingle();
    const currentBalance = saldo?.valor || 0;

    for (const tx of pending) {
      const valorFmt = Number(tx.amount).toFixed(2).replace(".", ",");
      const saldoFmt = Number(currentBalance).toFixed(2).replace(".", ",");
      const confirmedAt = tx.metadata?.confirmed_at
        ? new Date(tx.metadata.confirmed_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })
        : "";
      
      const msg = `🎉🎉🎉🎉🎉🎉🎉🎉\n\n✅ <b>Pagamento Confirmado!</b> ✅\n\n💸 Valor recebido: <b>R$ ${valorFmt}</b>\n💰 Saldo atual: <b>R$ ${saldoFmt}</b>${confirmedAt ? `\n🕐 Confirmado em: ${confirmedAt}` : ""}\n\n🚀 Seu saldo foi creditado!\n🎊 Bora fazer recarga! 🎊`;

      const resp = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: msg,
          parse_mode: "HTML",
          message_effect_id: "5046509860389126442",
          reply_markup: {
            inline_keyboard: [
              [{ text: "💰 Ver Saldo", callback_data: "menu_saldo" }, { text: "📱 Fazer Recarga", callback_data: "menu_recarga" }],
              [{ text: "📖 Menu", callback_data: "menu_main" }],
            ],
          },
        }),
      });
      const result = await resp.json();
      if (result?.ok) {
        await supabase.from("transactions").update({ telegram_notified: true }).eq("id", tx.id);
        console.log(`[PENDING] Sent delayed notification for tx ${tx.id}`);
      }
    }
  } catch (err) {
    console.error("[PENDING] Error sending pending notifications:", err);
  }
}

// ===== ADMIN CHECK =====
async function isAdminUser(supabase: any, telegramId: string): Promise<boolean> {
  // Check if this telegram user is master admin
  const { data: masterCfg } = await supabase.from("system_config").select("value").eq("key", "supportAdminTelegramId").maybeSingle();
  if (masterCfg?.value === telegramId) return true;

  // Check if linked profile has admin role
  const profile = await findUserByTelegram(supabase, telegramId);
  if (!profile) return false;
  const role = await resolveUserRole(supabase, profile.id, "usuario");
  return role === "admin";
}

// ===== BROADCAST VIA TELEGRAM =====
const BROADCAST_BATCH_SIZE = 25;
const BROADCAST_BATCH_DELAY = 1100;

function broadcastProgressBar(current: number, total: number): string {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  const filled = Math.round(pct / 5);
  return "▓".repeat(filled) + "░".repeat(20 - filled) + ` ${pct}%`;
}

async function executeTelegramBroadcast(
  supabase: any,
  token: string,
  adminChatId: number,
  originalMessage: any,
  filter: string
) {
  const filterText = filter === "all" ? "todos" : "registrados";

  // Detect media type
  const hasPhoto = !!originalMessage.photo;
  const hasVideo = !!originalMessage.video;
  const hasAudio = !!originalMessage.audio;
  const hasVoice = !!originalMessage.voice;
  const hasAnimation = !!originalMessage.animation;
  const hasDocument = !!originalMessage.document;
  const hasSticker = !!originalMessage.sticker;
  const hasVideoNote = !!originalMessage.video_note;
  const hasMedia = hasPhoto || hasVideo || hasAudio || hasVoice || hasAnimation || hasDocument || hasSticker || hasVideoNote;

  const mediaType = hasPhoto ? "📷 Foto"
    : hasVideo ? "🎬 Vídeo"
    : hasAudio ? "🎵 Áudio"
    : hasVoice ? "🎙️ Voz"
    : hasAnimation ? "🎞️ GIF"
    : hasDocument ? "📎 Documento"
    : hasSticker ? "🏷️ Sticker"
    : hasVideoNote ? "⏺️ Vídeo circular"
    : "💬 Texto";

  // Fetch ALL users with pagination to bypass 1000-row limit
  const allUsers: any[] = [];
  const FETCH_PAGE = 1000;
  let fetchPage = 0;
  let fetchMore = true;

  while (fetchMore) {
    let usersQuery = supabase
      .from("telegram_users")
      .select("telegram_id, first_name, is_blocked")
      .eq("is_blocked", false)
      .range(fetchPage * FETCH_PAGE, (fetchPage + 1) * FETCH_PAGE - 1);

    if (filter === "registered") {
      usersQuery = usersQuery.eq("is_registered", true);
    }

    const { data: pageData, error: pageError } = await usersQuery;

    if (pageError) {
      await sendMessage(token, adminChatId, `❌ Erro ao buscar usuários.`);
      return;
    }

    if (pageData && pageData.length > 0) {
      allUsers.push(...pageData);
      fetchMore = pageData.length === FETCH_PAGE;
      fetchPage++;
    } else {
      fetchMore = false;
    }
  }

  const users = allUsers;

  if (!users.length) {
    await sendMessage(token, adminChatId, `❌ Nenhum usuário encontrado para o filtro.`);
    return;
  }


  const total = users.length;

  // Send initial progress message
  const statusMsg = await sendMessage(token, adminChatId,
    `📡 <b>BROADCAST INICIADO</b>\n\n` +
    `${mediaType} → ${total} usuários (${filterText})\n\n` +
    `${broadcastProgressBar(0, total)}\n\n` +
    `⏳ Enviando...`
  );

  let sent = 0;
  let failed = 0;
  let blocked = 0;
  const startTime = Date.now();
  const UPDATE_INTERVAL = Math.max(5, Math.floor(total / 10));

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    try {
      let result: any;

      if (hasMedia) {
        // copyMessage preserves all media, captions, formatting
        const resp = await fetch(`${TELEGRAM_API}${token}/copyMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: user.telegram_id,
            from_chat_id: adminChatId,
            message_id: originalMessage.message_id,
          }),
        });
        result = await resp.json();
      } else if (originalMessage.text) {
        // Text only — sendMessage with HTML
        const resp = await fetch(`${TELEGRAM_API}${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: user.telegram_id,
            text: originalMessage.text,
            parse_mode: "HTML",
            entities: originalMessage.entities,
          }),
        });
        result = await resp.json();
      } else {
        failed++;
        continue;
      }

      if (result?.ok) {
        sent++;
      } else {
        failed++;
        const desc = (result?.description || "").toLowerCase();
        if (desc.includes("blocked") || desc.includes("deactivated") || desc.includes("chat not found")) {
          blocked++;
          // Mark as blocked
          supabase.from("telegram_users")
            .update({ is_blocked: true, block_reason: desc.includes("blocked") ? "telegram_blocked" : "user_deactivated" })
            .eq("telegram_id", user.telegram_id)
            .then(() => {});
        }
      }
    } catch {
      failed++;
    }

    // Rate limiting
    if ((sent + failed) % BROADCAST_BATCH_SIZE === 0 && i < users.length - 1) {
      await new Promise(resolve => setTimeout(resolve, BROADCAST_BATCH_DELAY));
    }

    // Update progress
    if (statusMsg && ((sent + failed) % UPDATE_INTERVAL === 0 || i === users.length - 1)) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
      const processed = sent + failed;
      try {
        await fetch(`${TELEGRAM_API}${token}/editMessageText`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: adminChatId,
            message_id: statusMsg,
            text:
              `📡 <b>BROADCAST EM ANDAMENTO</b>\n\n` +
              `${mediaType} → ${filterText}\n\n` +
              `${broadcastProgressBar(processed, total)}\n\n` +
              `✅ Enviados: <b>${sent}</b>\n` +
              `❌ Falhas: <b>${failed}</b>${blocked > 0 ? ` (🚫 ${blocked} bloqueados)` : ""}\n` +
              `📊 Processados: <b>${processed}/${total}</b>\n` +
              `⏱️ Tempo: <b>${elapsed}s</b>`,
            parse_mode: "HTML",
          }),
        }).catch(() => {});
      } catch { /* ignore edit errors */ }
    }
  }

  // Final summary
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  const successRate = total > 0 ? Math.round((sent / total) * 100) : 0;

  const finalText =
    `📢 <b>BROADCAST CONCLUÍDO!</b>\n\n` +
    `┌ ${mediaType}\n` +
    `├ 🎯 Audiência: <b>${filterText}</b>\n` +
    `├ ✅ Enviados: <b>${sent}</b>\n` +
    `├ ❌ Falhas: <b>${failed}</b>${blocked > 0 ? ` (🚫 ${blocked} bloqueados)` : ""}\n` +
    `├ 📊 Taxa: <b>${successRate}%</b>\n` +
    `└ ⏱️ Tempo: <b>${totalTime}s</b>\n\n` +
    `${broadcastProgressBar(total, total)}`;

  if (statusMsg) {
    try {
      await fetch(`${TELEGRAM_API}${token}/editMessageText`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: adminChatId,
          message_id: statusMsg,
          text: finalText,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [[{ text: "📖 Menu", callback_data: "menu_main" }]],
          },
        }),
      });
    } catch {
      await sendMessageWithKeyboard(token, adminChatId, finalText,
        [[{ text: "📖 Menu", callback_data: "menu_main" }]]
      );
    }
  }

  console.log(`[BROADCAST-TG] Done: sent=${sent} failed=${failed} blocked=${blocked} time=${totalTime}s`);

  // Sync broadcast to "Atualizações do Sistema" chat group AND "Novidades" (notifications table)
  try {
    const UPDATES_CONVERSATION_ID = '00000000-0000-0000-0000-000000000003';
    const SYSTEM_ADMIN_ID = 'f5501acc-79f3-460f-bc3e-493280ea84f0';

    // Extract text content from the original message
    const broadcastText = originalMessage.text || originalMessage.caption || '';
    if (broadcastText) {
      const chatContent = `📢 <b>Broadcast via Telegram</b>\n\n${broadcastText}`;

      // 1) Sync to chat group "Atualizações do Sistema"
      await supabase.from('chat_messages').insert({
        conversation_id: UPDATES_CONVERSATION_ID,
        sender_id: SYSTEM_ADMIN_ID,
        content: chatContent,
        type: 'text',
      });

      // Update conversation preview
      const previewText = `Admin: 📢 ${broadcastText.replace(/<[^>]*>/g, '').slice(0, 80)}`;
      await supabase.from('chat_conversations').update({
        last_message_text: previewText,
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq('id', UPDATES_CONVERSATION_ID);

      // 2) Sync to "Novidades" section (notifications table)
      const plainText = broadcastText.replace(/<[^>]*>/g, '');
      const titleMatch = plainText.match(/^(.{1,60})/);
      const notifTitle = titleMatch ? titleMatch[1].split('\n')[0].trim() : 'Broadcast';
      const notifTitleFull = `📢 ${notifTitle}`;

      // Check for duplicate before inserting
      const { data: existing } = await supabase.from('notifications')
        .select('id')
        .eq('title', notifTitleFull)
        .gte('created_at', new Date(Date.now() - 3600_000).toISOString())
        .limit(1);

      if (existing && existing.length > 0) {
        console.log('[BROADCAST-TG] Notification already exists, skipping duplicate:', notifTitleFull);
      } else {
        const { error: notifErr } = await supabase.from('notifications').insert({
          title: notifTitleFull,
          message: broadcastText,
          status: 'sent',
          sent_count: sent,
          failed_count: failed,
        });

        if (notifErr) {
          console.error('[BROADCAST-TG] Failed to insert notification:', JSON.stringify(notifErr));
        } else {
          console.log('[BROADCAST-TG] Synced to notifications (Novidades) ok');
        }
      }
    }

    // Post to news channel if configured
    try {
      const { data: channelConfig } = await supabase
        .from('system_config')
        .select('value')
        .eq('key', 'telegramNewsChannel')
        .maybeSingle();

      const channelId = channelConfig?.value?.trim();
      if (channelId && broadcastText) {
        // If original message had media, copy it to channel; otherwise send text
        if (originalMessage.photo || originalMessage.video || originalMessage.document || originalMessage.animation || originalMessage.audio || originalMessage.voice || originalMessage.sticker || originalMessage.video_note) {
          const copyResp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/copyMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: channelId, from_chat_id: adminChatId, message_id: originalMessage.message_id }),
          });
          const copyResult = await copyResp.json();
          if (copyResult.ok) {
            console.log(`[BROADCAST-TG] Copied to news channel ${channelId}`);
          } else {
            console.error(`[BROADCAST-TG] Failed to copy to channel: ${copyResult.description}`);
          }
        } else {
          const sendResp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: channelId, text: `📢 ${broadcastText}`, parse_mode: 'HTML', disable_web_page_preview: true }),
          });
          const sendResult = await sendResp.json();
          if (sendResult.ok) {
            console.log(`[BROADCAST-TG] Sent to news channel ${channelId}`);
          } else {
            console.error(`[BROADCAST-TG] Failed to send to channel: ${sendResult.description}`);
          }
        }
      }
    } catch (channelErr) {
      console.error('[BROADCAST-TG] News channel error:', channelErr);
    }
  } catch (err) {
    console.error('[BROADCAST-TG] Failed to sync broadcast:', err);
  }
}

// ===== MAIN HANDLER =====

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const t0 = Date.now();

  try {
    const supabase = getSupabase();


    // Extract bot_id from URL
    const url = new URL(req.url);
    const botIdParam = url.searchParams.get("bot_id") || undefined;

    // Resolve token (usually cached, ~0ms)
    const BOT_TOKEN = await resolveBotToken(supabase, botIdParam);

    let update: any = null;
    try {
      update = await req.json();
    } catch {
      return new Response("ok", { headers: corsHeaders });
    }

    const message = update?.message;
    const callbackQuery = update?.callback_query;

    // Process in background, return 200 immediately to Telegram
    // This prevents "Read timeout expired"
    const processPromise = (async () => {
      try {
        if (callbackQuery) {
          await handleCallback(supabase, BOT_TOKEN, callbackQuery);
          return;
        }

        // Allow messages with text, photo, video, audio, voice, animation, document, sticker, video_note
        const hasAnyContent = message?.text || message?.photo || message?.video || message?.audio || message?.voice || message?.animation || message?.document || message?.sticker || message?.video_note;
        if (!hasAnyContent) return;

        const chatId = message.chat.id;
        const text = (message.text || message.caption || "").trim();
        const telegramId = String(message.from.id);
        const telegramUsername = message.from.username || "";
        const chatIdStr = String(chatId);

        // Admin reply-to-ticket: when admin replies to a ticket notification, forward to user
        const { data: adminCfg } = await supabase.from("system_config").select("value").eq("key", "supportAdminTelegramId").maybeSingle();
        const ADMIN_CHAT_ID = Number(adminCfg?.value) || 1901426549;
        if (chatId === ADMIN_CHAT_ID && message.reply_to_message && text) {
          const repliedText = message.reply_to_message.text || message.reply_to_message.caption || "";
          if ((repliedText.includes("🆘") && repliedText.includes("Ticket de Suporte")) || (repliedText.includes("📩") && repliedText.includes("Suporte"))) {
            // Find the most recent open/in_progress ticket matching the username in the notification
            const usernameMatch = repliedText.match(/@(\w+)/);
            const nameMatch = repliedText.match(/👤\s*([^\n(]+)/);
            let ticket: any = null;

            if (usernameMatch) {
              const { data } = await supabase.from("support_tickets")
                .select("*").eq("telegram_username", usernameMatch[1])
                .in("status", ["open", "in_progress", "answered"])
                .order("created_at", { ascending: false }).limit(1);
              ticket = data?.[0];
            }
            if (!ticket && nameMatch) {
              const name = nameMatch[1].trim();
              const { data } = await supabase.from("support_tickets")
                .select("*").eq("telegram_first_name", name)
                .in("status", ["open", "in_progress", "answered"])
                .order("created_at", { ascending: false }).limit(1);
              ticket = data?.[0];
            }

            if (ticket) {
              // Send reply to user via Telegram
              await sendMessage(BOT_TOKEN, Number(ticket.telegram_chat_id),
                `💬 <b>Resposta do Suporte</b>\n\n${text}\n\n<i>💡 Você pode responder diretamente aqui.</i>`
              );
              // Reopen support session so user can reply back
              await setSession(supabase, ticket.telegram_chat_id, "awaiting_support_message", {
                telegram_username: ticket.telegram_username || "",
                telegram_first_name: ticket.telegram_first_name || "",
                user_id: ticket.user_id || null,
              });
              // ✅ Write admin reply to support_messages (unified history)
              // Resolve actual admin user by telegram_id
              let adminUserId = ticket.assigned_to || "00000000-0000-0000-0000-000000000001";
              const { data: adminProfile } = await supabase.from("profiles")
                .select("id")
                .eq("telegram_id", chatId)
                .maybeSingle();
              if (adminProfile?.id) adminUserId = adminProfile.id;
              await supabase.from("support_messages").insert({
                ticket_id: ticket.id,
                sender_id: adminUserId,
                sender_role: "admin",
                message: text,
                origin: "telegram",
              });
              // Update ticket status
              await supabase.from("support_tickets")
                .update({ status: "in_progress", updated_at: new Date().toISOString() })
                .eq("id", ticket.id);
              await sendMessage(BOT_TOKEN, chatId, "✅ Resposta enviada! Sessão de suporte reaberta para o usuário.");
              return;
            } else {
              await sendMessage(BOT_TOKEN, chatId, "❌ Não foi possível encontrar o ticket correspondente.");
              return;
            }
          }
        }

        // Parallel: find user + session + register telegram_user + site name + site url
        const [linkedUser, session, , botSiteName, botSiteUrl] = await Promise.all([
          findUserByTelegram(supabase, telegramId),
          getSession(supabase, chatIdStr),
          ensureTelegramUser(supabase, message.from.id, message.from.first_name, telegramUsername),
          getSiteName(supabase),
          getSiteUrl(supabase),
        ]);

          if (text === "/start" || text === "/menu" || text === "/vincular") {
          if (linkedUser) {
            // Always show terms on /start
            await sendTermsMessage(BOT_TOKEN, chatId, botSiteName, botSiteUrl);
          } else {
            // Check migration config
            const migration = await getMigrationConfig(supabase);
            if (migration.enabled) {
              await sendMessageWithKeyboard(BOT_TOKEN, chatId,
                `👋 Bem-vindo ao <b>${botSiteName}</b>!\n\n⚠️ <b>Aviso de Migração</b>\n\nEstamos migrando para um novo sistema! Se você possui créditos no site antigo, pode acessá-lo para utilizá-los.\n\nCaso contrário, prossiga para vincular sua conta ao novo bot.`,
                [
                  [{ text: "🔄 Usar créditos do site antigo", web_app: { url: migration.url } }],
                  [{ text: "▶️ Continuar para o bot", callback_data: "migration_continue" }],
                ]
              );
            } else {
              // Show terms first for new users too
              await sendTermsMessage(BOT_TOKEN, chatId, botSiteName, botSiteUrl);
            }
          }
          return;
        }

        // Onboarding flow
        if (!linkedUser && session) {
          const userMsgId = message.message_id;
          if (session.step === "awaiting_email") {
            await handleEmailStep(supabase, BOT_TOKEN, chatId, chatIdStr, telegramId, text, session, userMsgId);
            return;
          }
          if (session.step === "awaiting_password") {
            await handlePasswordStep(supabase, BOT_TOKEN, chatId, chatIdStr, telegramId, text, session, userMsgId);
            return;
          }
          if (session.step === "awaiting_new_password") {
            await handleNewPasswordStep(supabase, BOT_TOKEN, chatId, chatIdStr, telegramId, text, session, userMsgId);
            return;
          }
        }

        if (!linkedUser) {
          await sendMessage(BOT_TOKEN, chatId, "❌ Conta não vinculada. Use /start para começar.");
          return;
        }

        // Commands always take priority over active sessions
        const isCommand = text.startsWith("/");
        if (isCommand) {
          // Clear any active session when user sends a command
          clearSession(supabase, chatIdStr);
        }

        // Terms guard for linked users (except session flows)
        if (isCommand && text !== "/start" && text !== "/menu" && text !== "/vincular") {
          const termsOk = await checkTermsAccepted(supabase, telegramId);
          if (!termsOk) {
            await sendMessage(BOT_TOKEN, chatId, "⚠️ Você precisa aceitar os termos de utilização antes de continuar.");
            await sendTermsMessage(BOT_TOKEN, chatId, botSiteName, botSiteUrl);
            return;
          }
        }

        // Linked user session flows (only if NOT a command)
        if (!isCommand && session?.step === "awaiting_deposit_amount") {
          await handleDepositAmount(supabase, BOT_TOKEN, chatId, chatIdStr, linkedUser, text, session, message.message_id);
          return;
        }

        if (!isCommand && session?.step === "awaiting_recarga_phone") {
          await handleRecargaPhone(supabase, BOT_TOKEN, chatId, chatIdStr, linkedUser, text, session, message.message_id);
          return;
        }

        // Support message flow (text and/or photo)
        if (!isCommand && session?.step === "awaiting_support_message") {
          const photoFileId = message.photo?.length ? message.photo[message.photo.length - 1].file_id : null;
          await handleSupportMessage(supabase, BOT_TOKEN, chatId, chatIdStr, linkedUser, text, session, message.message_id, photoFileId);
          return;
        }

        // Broadcast message flow — admin sends content to broadcast
        if (!isCommand && session?.step === "awaiting_broadcast_message") {
          const isAdmin = await isAdminUser(supabase, telegramId);
          if (isAdmin) {
            await clearSession(supabase, chatIdStr);
            await executeTelegramBroadcast(supabase, BOT_TOKEN, chatId, message, session.data?.filter || "all");
            return;
          }
        }

        if (text === "/saldo") {
          await handleSaldo(supabase, BOT_TOKEN, chatId, linkedUser);
        } else if (text === "/recargas" || text === "/historico") {
          await handleRecargas(supabase, BOT_TOKEN, chatId, linkedUser);
        } else if (text === "/recarga" || text.startsWith("/recarga ")) {
          // Redirect to operator selection menu (same as menu_recarga callback)
          const catalog = await fetchCatalog(supabase);
          if (!catalog?.length) {
            await sendMessageWithKeyboard(BOT_TOKEN, chatId,
              "⚠️ Nenhuma operadora disponível no momento.",
              [[{ text: "📖 Voltar ao Menu", callback_data: "menu_main" }]]
            );
          } else {
            const opButtons = catalog.map((carrier: any) => [{ text: carrier.name || carrier.carrierId, callback_data: `rec_op_${carrier.carrierId}` }]);
            opButtons.push([{ text: "⬅️ Voltar ao Menu Principal", callback_data: "menu_main" }]);
            await sendMessageWithKeyboard(BOT_TOKEN, chatId,
              "📱 <b>VAMOS FAZER UMA RECARGA!</b>\n\nSelecione a operadora:",
              opButtons
            );
          }
        } else if (text === "/deposito") {
          await setSession(supabase, chatIdStr, "awaiting_deposit_amount", { user_id: linkedUser.id });
          await sendMessageWithKeyboard(BOT_TOKEN, chatId,
            "💳 <b>Depósito PIX</b>\n\nEscolha um valor ou digite manualmente:",
            [
              [{ text: "R$ 10", callback_data: "deposit_10" }, { text: "R$ 15", callback_data: "deposit_15" }, { text: "R$ 20", callback_data: "deposit_20" }],
              [{ text: "R$ 30", callback_data: "deposit_30" }, { text: "R$ 50", callback_data: "deposit_50" }, { text: "R$ 100", callback_data: "deposit_100" }],
              [{ text: "R$ 200", callback_data: "deposit_200" }],
              [{ text: "⬅️ Voltar", callback_data: "menu_main" }]
            ]
          );
        } else if (text === "/broadcast") {
          const isAdmin = await isAdminUser(supabase, telegramId);
          if (!isAdmin) {
            await sendMessage(BOT_TOKEN, chatId, "❌ Apenas administradores podem usar este comando.");
            return;
          }
          await sendMessageWithKeyboard(BOT_TOKEN, chatId,
            "📢 <b>BROADCAST</b>\n\n🎯 Selecione o público-alvo da mensagem:",
            [
              [{ text: "📢 Todos os Usuários", callback_data: "broadcast_all" }],
              [{ text: "✅ Apenas Registrados", callback_data: "broadcast_registered" }],
              [{ text: "❌ Cancelar", callback_data: "broadcast_cancel" }],
            ]
          );
        } else if (text === "/cancelar") {
          clearSession(supabase, chatIdStr);
          await sendMessageWithKeyboard(BOT_TOKEN, chatId,
            "❌ Operação cancelada.",
            [[{ text: "📖 Menu", callback_data: "menu_main" }]]
          );
        } else if (text === "/ajuda" || text === "/help") {
          await handleAjuda(supabase, BOT_TOKEN, chatId, telegramId);
        } else {
          await handleAjuda(supabase, BOT_TOKEN, chatId, telegramId);
        }
      } catch (err) {
        console.error(`[ERROR] processUpdate:`, err);
      }
    })();

    // Return 200 immediately to Telegram, but keep processing alive
    EdgeRuntime.waitUntil(processPromise);

    console.log(`[TIMING] response sent in ${Date.now() - t0}ms | update_id=${update?.update_id}`);
    return new Response("ok", { headers: corsHeaders });
  } catch (error: unknown) {
    console.error(`[ERROR] fatal (${Date.now() - t0}ms):`, error);
    return new Response("ok", { headers: corsHeaders });
  }
});

// ===== ONBOARDING HANDLERS =====

async function handleEmailStep(supabase: any, token: string, chatId: number, chatIdStr: string, telegramId: string, email: string, session: any, userMsgId: number) {
  const prevMsgIds: number[] = session.data?.msg_ids || [];
  const allMsgIds = [...prevMsgIds, userMsgId];
  const emailClean = email.toLowerCase().trim();

  if (!emailClean.includes("@") || !emailClean.includes(".")) {
    deleteMessageFire(token, chatId, userMsgId);
    const botMsgId = await sendMessage(token, chatId, "❌ E-mail inválido. Por favor, digite um e-mail válido:");
    await setSession(supabase, chatIdStr, "awaiting_email", { telegram_id: telegramId, telegram_username: session.data?.telegram_username, msg_ids: [...prevMsgIds, ...(botMsgId ? [botMsgId] : [])] });
    return;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, nome, email, telegram_id")
    .eq("email", emailClean)
    .maybeSingle();

  if (profile) {
    if (profile.telegram_id && profile.telegram_id !== telegramId) {
      deleteMessagesBatch(token, chatId, allMsgIds);
      await sendMessage(token, chatId, "⚠️ Este e-mail já está vinculado a outro Telegram.\n\nUse outro e-mail ou entre em contato com o suporte.");
      clearSession(supabase, chatIdStr);
      return;
    }

    if (profile.telegram_id === telegramId) {
      deleteMessagesBatch(token, chatId, allMsgIds);
      await sendMainMenu(token, chatId, { nome: profile.nome, email: profile.email }, supabase);
      clearSession(supabase, chatIdStr);
      return;
    }

    deleteMessageFire(token, chatId, userMsgId);
    const botMsgId = await sendMessage(token, chatId, `🔐 Para vincular, digite sua <b>senha</b>:`);
    await setSession(supabase, chatIdStr, "awaiting_password", {
      telegram_id: telegramId, telegram_username: session.data?.telegram_username, email: emailClean, user_id: profile.id,
      msg_ids: [...prevMsgIds, ...(botMsgId ? [botMsgId] : [])],
    });
  } else {
    deleteMessageFire(token, chatId, userMsgId);
    const botMsgId = await sendMessage(token, chatId, `🔐 Escolha uma <b>senha</b> para sua nova conta:`);
    await setSession(supabase, chatIdStr, "awaiting_new_password", {
      telegram_id: telegramId, telegram_username: session.data?.telegram_username, email: emailClean,
      msg_ids: [...prevMsgIds, ...(botMsgId ? [botMsgId] : [])],
    });
  }
}

async function handlePasswordStep(supabase: any, token: string, chatId: number, chatIdStr: string, telegramId: string, password: string, session: any, userMsgId: number) {
  const email = session.data?.email;
  const userId = session.data?.user_id;
  const prevMsgIds: number[] = session.data?.msg_ids || [];

  deleteMessageFire(token, chatId, userMsgId);

  if (!email || !userId) {
    deleteMessagesBatch(token, chatId, prevMsgIds);
    clearSession(supabase, chatIdStr);
    await sendMessage(token, chatId, "❌ Sessão expirada. Use /start para recomeçar.");
    return;
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const anonClient = createClient(supabaseUrl, anonKey);

  const { error } = await anonClient.auth.signInWithPassword({ email, password });

  if (error) {
    const botMsgId = await sendMessage(token, chatId, "❌ Senha incorreta. Tente novamente:");
    await setSession(supabase, chatIdStr, "awaiting_password", {
      ...session.data,
      msg_ids: [...prevMsgIds, ...(botMsgId ? [botMsgId] : [])],
    });
    return;
  }

  deleteMessagesBatch(token, chatId, prevMsgIds);
  const tgUsername = session.data?.telegram_username || "";
  await supabase.from("profiles").update({ telegram_id: telegramId, ...(tgUsername ? { telegram_username: tgUsername } : {}) }).eq("id", userId);
  clearSession(supabase, chatIdStr);

  await sendMessageWithKeyboard(token, chatId,
    `✅ <b>Conta vinculada com sucesso!</b>`,
    [[
      { text: "💰 Ver Saldo", callback_data: "menu_saldo" },
      { text: "📱 Fazer Recarga", callback_data: "menu_recarga" },
    ], [
      { text: "📋 Histórico", callback_data: "menu_recargas" },
      { text: "📖 Menu", callback_data: "menu_main" },
    ]]
  );
}

async function handleNewPasswordStep(supabase: any, token: string, chatId: number, chatIdStr: string, telegramId: string, password: string, session: any, userMsgId: number) {
  const prevMsgIds: number[] = session.data?.msg_ids || [];
  const email = session.data?.email;
  const telegramUsername = session.data?.telegram_username || "";

  deleteMessageFire(token, chatId, userMsgId);

  if (!email) {
    deleteMessagesBatch(token, chatId, prevMsgIds);
    clearSession(supabase, chatIdStr);
    await sendMessage(token, chatId, "❌ Sessão expirada. Use /start para recomeçar.");
    return;
  }

  if (password.length < 6) {
    const botMsgId = await sendMessage(token, chatId, "❌ A senha deve ter pelo menos <b>6 caracteres</b>. Tente novamente:");
    await setSession(supabase, chatIdStr, "awaiting_new_password", {
      ...session.data,
      msg_ids: [...prevMsgIds, ...(botMsgId ? [botMsgId] : [])],
    });
    return;
  }

  deleteMessagesBatch(token, chatId, prevMsgIds);
  await createAccountAndLink(supabase, token, chatId, chatIdStr, telegramId, email, password, telegramUsername);
}

async function createAccountAndLink(supabase: any, token: string, chatId: number, chatIdStr: string, telegramId: string, email: string, password: string, telegramUsername: string = "") {

  const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nome: email.split("@")[0] },
  });

  if (createError) {
    console.error("Create user error:", createError);
    await sendMessage(token, chatId, "❌ Erro ao criar conta. Tente novamente com /start.");
    clearSession(supabase, chatIdStr);
    return;
  }

  const userId = newUser.user.id;
  await supabase.from("user_roles").insert({ user_id: userId, role: "revendedor" });

  // Wait for trigger to create profile
  await new Promise((r) => setTimeout(r, 800));
  const tgUser = telegramUsername;
  await supabase.from("profiles").update({ telegram_id: telegramId, ...(tgUser ? { telegram_username: tgUser } : {}) }).eq("id", userId);

  clearSession(supabase, chatIdStr);

  await sendMessageWithKeyboard(token, chatId,
    `✅ <b>Conta criada e vinculada!</b>\n\n📧 E-mail: <code>${email}</code>\n\n🔐 Use sua senha para acessar o painel web.`,
    [[
      { text: "💰 Ver Saldo", callback_data: "menu_saldo" },
      { text: "📱 Fazer Recarga", callback_data: "menu_recarga" },
    ], [
      { text: "📋 Histórico", callback_data: "menu_recargas" },
      { text: "📖 Menu", callback_data: "menu_main" },
    ]]
  );
}

// ===== COMMAND HANDLERS =====

async function handleSaldo(supabase: any, token: string, chatId: number, user: any) {
  const { data: saldo } = await supabase.from("saldos").select("valor").eq("user_id", user.id).eq("tipo", "revenda").single();
  const valor = Number(saldo?.valor || 0);
  await sendMessageWithKeyboard(token, chatId,
    `💰 <b>Seu Saldo</b>\n\n<b>R$ ${valor.toFixed(2).replace(".", ",")}</b>`,
    [[
      { text: "📱 Fazer Recarga", callback_data: "menu_recarga" },
      { text: "📖 Menu", callback_data: "menu_main" },
    ]]
  );
}

function formatRecargaHistory(recargas: any[]): string {
  let msg = `📋 <b>Seus últimos ${recargas.length} pedidos:</b>\n\n`;
  for (const r of recargas) {
    const date = new Date(r.created_at).toLocaleDateString("pt-BR");
    const tel = (r.telefone || "").replace(/\D/g, "");
    const formattedPhone = tel.length === 11
      ? `(${tel.slice(0,2)}) ${tel.slice(2,7)}-${tel.slice(7)}`
      : tel.length === 10
        ? `(${tel.slice(0,2)}) ${tel.slice(2,6)}-${tel.slice(6)}`
        : r.telefone;
    const operadora = r.operadora || "—";
    const valor = Number(r.valor).toFixed(2).replace(".", ",");
    let statusIcon = "⏳";
    let statusText = "Processando";
    if (r.status === "completed") { statusIcon = "✅"; statusText = "Concluído"; }
    else if (r.status === "falha" || r.status === "canceled" || r.status === "cancelled") { statusIcon = "❌"; statusText = "Cancelado"; }
    msg += `<blockquote>📅 <b>${date}</b> — <i>${operadora}</i>\n📞 ${formattedPhone}\n💰 Valor: <b>R$ ${valor}</b>\n${statusIcon} Status: <b>${statusText}</b></blockquote>\n`;
  }
  return msg;
}

async function handleRecargas(supabase: any, token: string, chatId: number, user: any) {
  const { data: recargas } = await supabase
    .from("recargas")
    .select("telefone, valor, operadora, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  if (!recargas?.length) {
    await sendMessageWithKeyboard(token, chatId,
      "📋 Nenhuma recarga encontrada.",
      [[{ text: "📱 Fazer Recarga", callback_data: "menu_recarga" }, { text: "📖 Menu", callback_data: "menu_main" }]]
    );
    return;
  }

  await sendMessageWithKeyboard(token, chatId, formatRecargaHistory(recargas), [[
    { text: "⬅️ Voltar", callback_data: "menu_main" },
  ]]);
}

// handleRecarga removed — /recarga now redirects to operator selection menu

async function executeRecarga(supabase: any, token: string, chatId: number, user: any, phone: string, valorStr: string) {
  const telefone = phone.replace(/\D/g, "");
  if (telefone.length < 10 || telefone.length > 11) {
    await sendMessage(token, chatId, "❌ Telefone inválido. Use DDD + número (10 ou 11 dígitos).");
    return;
  }

  const valor = parseFloat(valorStr.replace(",", "."));
  if (isNaN(valor) || valor <= 0 || valor > 500) {
    await sendMessage(token, chatId, "❌ Valor inválido. Informe um valor entre R$ 1,00 e R$ 500,00.");
    return;
  }

  // Fetch catalog to find carrier and valueId
  const catalog = await fetchCatalog(supabase);
  let matchedCarrier: any = null;
  let matchedValue: any = null;
  for (const carrier of catalog) {
    const v = carrier.values?.find((val: any) => resolveValue(val) === valor);
    if (v) { matchedCarrier = carrier; matchedValue = v; break; }
  }

  if (!matchedCarrier || !matchedValue) {
    await sendMessage(token, chatId, `❌ Valor R$ ${valor.toFixed(2).replace(".", ",")} não encontrado no catálogo.`);
    return;
  }

  // Resolve user role and pricing rules (same logic as menu flow)
  const userRole = await resolveUserRole(supabase, user.id, "cliente");

  let resellerId: string | null = null;
  if (userRole === "cliente") {
    const { data: profileData } = await supabase.from("profiles").select("reseller_id").eq("id", user.id).single();
    resellerId = profileData?.reseller_id || null;
  }

  // Resolve operadora_id
  const normalize = (value?: string) => (value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  const { data: opsData } = await supabase.from("operadoras").select("id, nome").eq("ativo", true);
  const targetName = normalize(matchedCarrier.name);
  const matchedOp = (opsData || []).find((op: any) => {
    const dbName = normalize(op.nome);
    return dbName === targetName || dbName.includes(targetName) || targetName.includes(dbName);
  });
  const operadoraId = matchedOp?.id || null;

  // Fetch pricing rules
  let pricingRules: any[] = [];
  if (operadoraId) {
    if (userRole === "admin") {
      const { data: rules } = await supabase.from("pricing_rules").select("*").eq("operadora_id", operadoraId);
      pricingRules = rules || [];
    } else if (userRole === "revendedor" || (userRole === "cliente" && resellerId)) {
      const ruleUserId = userRole === "revendedor" ? user.id : resellerId;
      const [{ data: resellerRules }, { data: globalRules }] = await Promise.all([
        supabase.from("reseller_pricing_rules").select("*").eq("user_id", ruleUserId).eq("operadora_id", operadoraId),
        supabase.from("pricing_rules").select("*").eq("operadora_id", operadoraId),
      ]);
      const resellerMap = new Map((resellerRules || []).map((r: any) => [Number(r.valor_recarga), r]));
      const globalMap = new Map((globalRules || []).map((r: any) => [Number(r.valor_recarga), r]));
      const allValues = new Set([...resellerMap.keys(), ...globalMap.keys()]);
      for (const v of allValues) pricingRules.push(resellerMap.get(v) || globalMap.get(v));
    } else {
      const [{ data: ownRules }, { data: globalRules }] = await Promise.all([
        supabase.from("reseller_pricing_rules").select("*").eq("user_id", user.id).eq("operadora_id", operadoraId),
        supabase.from("pricing_rules").select("*").eq("operadora_id", operadoraId),
      ]);
      if (ownRules && ownRules.length > 0) {
        const ownMap = new Map(ownRules.map((r: any) => [Number(r.valor_recarga), r]));
        const gMap = new Map((globalRules || []).map((r: any) => [Number(r.valor_recarga), r]));
        const allValues = new Set([...ownMap.keys(), ...gMap.keys()]);
        for (const v of allValues) pricingRules.push(ownMap.get(v) || gMap.get(v));
      } else {
        pricingRules = globalRules || [];
      }
    }
  }

  // Calculate user cost — default margin OVERRIDES all rules when active
  const dmCfg = await getDefaultMarginConfig(supabase);
  let userCost: number;
  if (dmCfg.enabled && dmCfg.value > 0) {
    const baseCost = matchedValue.cost || valor;
    userCost = dmCfg.type === "fixo" ? baseCost + dmCfg.value : baseCost * (1 + dmCfg.value / 100);
  } else {
    const rule = pricingRules.find((r: any) => Number(r.valor_recarga) === valor);
    if (rule) {
      userCost = rule.tipo_regra === "fixo" ? (Number(rule.regra_valor) > 0 ? Number(rule.regra_valor) : Number(rule.custo)) : Number(rule.custo) * (1 + Number(rule.regra_valor) / 100);
    } else {
      userCost = matchedValue.cost || valor;
    }
  }

  // Check balance against REAL COST
  const { data: saldo } = await supabase.from("saldos").select("valor").eq("user_id", user.id).eq("tipo", "revenda").single();
  const saldoAtual = Number(saldo?.valor || 0);

  if (userCost > saldoAtual) {
    await sendMessageWithKeyboard(token, chatId,
      `❌ <b>Saldo insuficiente</b>\n\nSaldo: R$ ${saldoAtual.toFixed(2).replace(".", ",")}\nCusto da recarga: R$ ${userCost.toFixed(2).replace(".", ",")}`,
      [[{ text: "💳 Depositar", callback_data: "menu_deposito" }, { text: "📖 Menu", callback_data: "menu_main" }]]
    );
    return;
  }

  // Save confirmation in session and use rconfirm_yes flow
  await setSession(supabase, String(chatId), "awaiting_recarga_confirm", {
    user_id: user.id,
    carrier_id: matchedCarrier.carrierId,
    value_id: matchedValue.valueId,
    operadora_nome: matchedCarrier.name,
    valor: userCost,
    telefone,
    api_cost: matchedValue.cost,
    valor_facial: valor,
  });

  const formattedPhone = telefone.length === 11
    ? `(${telefone.slice(0,2)}) ${telefone.slice(2,7)}-${telefone.slice(7)}`
    : `(${telefone.slice(0,2)}) ${telefone.slice(2,6)}-${telefone.slice(6)}`;

  const costLine = valor !== userCost
    ? `\n💵 Custo: <b>R$ ${userCost.toFixed(2).replace(".", ",")}</b>`
    : "";

  await sendMessageWithKeyboard(token, chatId,
    `📱 <b>Confirmar Recarga</b>\n\n📡 Operadora: <b>${matchedCarrier.name}</b>\n📞 Telefone: <code>${formattedPhone}</code>\n💰 Valor da Recarga: <b>R$ ${valor.toFixed(2).replace(".", ",")}</b>${costLine}\n💳 Saldo atual: R$ ${saldoAtual.toFixed(2).replace(".", ",")}`,
    [[
      { text: "✅ Confirmar", callback_data: "rconfirm_yes" },
      { text: "❌ Cancelar", callback_data: "cancel" },
    ]]
  );
}

async function handleCallback(supabase: any, token: string, callback: any) {
  const chatId = callback.message.chat.id;
  const msgId = callback.message.message_id;
  const data = callback.data;
  const telegramId = String(callback.from.id);

  // Register telegram user (fire-and-forget)
  ensureTelegramUser(supabase, callback.from.id, callback.from.first_name, callback.from.username).catch(() => {});

  // Answer callback immediately (fire-and-forget) — except menu_saldo which sends its own popup
  if (data !== "menu_saldo") {
    fetch(`${TELEGRAM_API}${token}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callback_query_id: callback.id }),
    }).catch(() => {});
  }

  // ===== TERMS CALLBACKS =====
  if (data === "terms_accept") {
    await recordTermsAcceptance(supabase, telegramId);
    const user = await findUserByTelegram(supabase, telegramId);
    // Notify admin about terms acceptance
    const termsLabel = user
      ? (user.nome || user.email || `Telegram ID ${telegramId}`)
      : `Novo usuário Telegram (ID ${telegramId})`;
    notifyAdminTelegramActivity(supabase, "new_user_telegram", `🤖 Termos aceitos: ${termsLabel}`, {
      user_id: user?.id || null,
      user_nome: termsLabel,
      status: "new",
    }).catch(() => {});
    if (user) {
      await sendMessage(token, chatId, "✅ <b>Termos aceitos!</b> Bem-vindo de volta!");
      await sendMainMenu(token, chatId, user, supabase);
      sendPendingNotifications(supabase, token, chatId, user.id).catch(() => {});
    } else {
      // New user — start onboarding
      const chatIdStr = String(chatId);
      const telegramUsername = callback.from.username || "";
      await setSession(supabase, chatIdStr, "awaiting_email", { telegram_id: telegramId, telegram_username: telegramUsername, msg_ids: [] });
      const cbSiteName = await getSiteName(supabase);
      const botMsgId = await sendMessage(token, chatId,
        `✅ <b>Termos aceitos!</b>\n\n👋 Bem-vindo ao <b>${cbSiteName}</b>!\n\nVamos vincular sua conta.\n\n📧 Por favor, digite seu <b>e-mail</b>:`
      );
      if (botMsgId) {
        await setSession(supabase, chatIdStr, "awaiting_email", { telegram_id: telegramId, telegram_username: telegramUsername, msg_ids: [botMsgId] });
      }
    }
    return;
  }

  if (data === "terms_decline") {
    await sendMessage(token, chatId, "❌ Você precisa aceitar os termos para utilizar o bot.\n\nUse /start para tentar novamente.");
    return;
  }

  // ===== TERMS GUARD — check if accepted within 5 minutes =====
  const termsOk = await checkTermsAccepted(supabase, telegramId);
  if (!termsOk) {
    await sendMessage(token, chatId, "⚠️ Seus termos de utilização expiraram. Por favor, aceite novamente:");
    await sendTermsMessage(token, chatId, await getSiteName(supabase), await getSiteUrl(supabase));
    return;
  }

  const defaultSiteUrl = await getSiteUrl(supabase);
  let webAppUrl = `${defaultSiteUrl}/miniapp`;
  const [migrationConfig, em, webAppConfig, btnConfigs] = await Promise.all([
    getMigrationConfig(supabase),
    getSeasonalEmojis(supabase),
    supabase.from("system_config").select("value").eq("key", "webAppUrl").maybeSingle(),
    supabase.from("system_config").select("key, value").like("key", "bot_btn_%"),
  ]);
  const migrationSiteUrl = migrationConfig.url || defaultSiteUrl;
  if (webAppConfig?.data?.value) webAppUrl = webAppConfig.data.value;

  // Build button visibility map (default true except migration)
  const btnMap: Record<string, boolean> = {
    bot_btn_saldo: true, bot_btn_recarga: true, bot_btn_historico: true,
    bot_btn_deposito: true, bot_btn_conta: true, bot_btn_webapp: true,
    bot_btn_migration: false, bot_btn_ajuda: true,
  };
  for (const row of (btnConfigs?.data || [])) {
    btnMap[row.key] = row.value === "true";
  }

  const menuKb = (extra?: any[][]) => {
    const kb: any[][] = [...(extra || [])];
    // Row 1: Saldo + Recarga
    const row1: any[] = [];
    if (btnMap.bot_btn_saldo) row1.push({ text: `${se(em, "saldo")} Ver Saldo`, callback_data: "menu_saldo" });
    if (btnMap.bot_btn_recarga) row1.push({ text: `${se(em, "recarga")} Fazer Recarga`, callback_data: "menu_recarga" });
    if (row1.length) kb.push(row1);
    // Row 2: Histórico + Depositar
    const row2: any[] = [];
    if (btnMap.bot_btn_historico) row2.push({ text: `${se(em, "historico")} Histórico`, callback_data: "menu_recargas" });
    if (btnMap.bot_btn_deposito) row2.push({ text: `${se(em, "deposito")} Depositar PIX`, callback_data: "menu_deposito" });
    if (row2.length) kb.push(row2);
    // Row 3: Conta + Web App
    const row3: any[] = [];
    if (btnMap.bot_btn_conta) row3.push({ text: `${se(em, "conta")} Minha Conta`, callback_data: "menu_conta" });
    if (btnMap.bot_btn_webapp) row3.push({ text: `${se(em, "webapp")} Mini App`, web_app: { url: webAppUrl } });
    if (row3.length) kb.push(row3);
    // Migration row
    if (btnMap.bot_btn_migration && migrationConfig.enabled) {
      kb.push([{ text: `${se(em, "migration")} Usar Saldo Antigo`, web_app: { url: migrationSiteUrl } }]);
    }
    // Ajuda row
    if (btnMap.bot_btn_ajuda) {
      kb.push([{ text: "❓ Ajuda / Suporte", callback_data: "menu_ajuda" }]);
    }
    return kb;
  };

  // === Broadcast callbacks ===
  if (data === "broadcast_all" || data === "broadcast_registered") {
    const isAdmin = await isAdminUser(supabase, telegramId);
    if (!isAdmin) return;
    const filter = data === "broadcast_all" ? "all" : "registered";
    const filterText = filter === "all" ? "todos os usuários" : "apenas registrados";
    await setSession(supabase, String(chatId), "awaiting_broadcast_message", { filter });
    await sendMessageWithKeyboard(token, chatId,
      `📢 <b>BROADCAST</b>\n\n` +
      `🎯 <b>Público:</b> ${filterText}\n\n` +
      `📝 Agora envie a mensagem que deseja transmitir.\n\n` +
      `💡 <b>Você pode enviar:</b>\n` +
      `• Texto (com formatação HTML)\n` +
      `• 📷 Foto com legenda\n` +
      `• 🎬 Vídeo com legenda\n` +
      `• 🎵 Áudio / Voz\n` +
      `• 🎞️ GIF animado\n` +
      `• 📎 Documento\n\n` +
      `Use /cancelar para cancelar.`,
      [[{ text: "❌ Cancelar", callback_data: "broadcast_cancel" }]]
    );
    return;
  }

  if (data === "broadcast_cancel") {
    await clearSession(supabase, String(chatId));
    await editMessageWithKeyboard(token, chatId, msgId,
      "❌ Broadcast cancelado.",
      [[{ text: "📖 Menu", callback_data: "menu_main" }]]
    );
    return;
  }

  // === Migration callbacks ===
  if (data === "migration_continue") {
    const chatIdStr = String(chatId);
    const telegramUsername = callback.from.username || "";
    await setSession(supabase, chatIdStr, "awaiting_email", { telegram_id: telegramId, telegram_username: telegramUsername, msg_ids: [] });
    const botMsgId = await sendMessage(token, chatId,
      `👋 Ótimo! Vamos vincular sua conta.\n\n📧 Por favor, digite seu <b>e-mail</b>:`
    );
    if (botMsgId) {
      await setSession(supabase, chatIdStr, "awaiting_email", { telegram_id: telegramId, telegram_username: telegramUsername, msg_ids: [botMsgId] });
    }
    return;
  }

  if (data === "migration_old_site") {
    const migration = await getMigrationConfig(supabase);
    await sendMessageWithKeyboard(token, chatId,
      `🔄 <b>Site Antigo</b>\n\nAcesse o link abaixo para utilizar seus créditos restantes:\n\n🌐 ${migration.url}\n\nQuando terminar, volte aqui e clique em "Continuar" para vincular sua conta ao novo sistema.`,
      [
        [{ text: "🌐 Acessar Site Antigo", url: migration.url }],
        [{ text: "▶️ Continuar para o bot", callback_data: "migration_continue" }],
      ]
    );
    return;
  }

  if (data === "menu_ajuda") {
    await handleAjuda(supabase, token, chatId, telegramId);
    return;
  }

  // ===== ADMIN MENU (Master only) =====
  if (data === "menu_admin") {
    const { data: mCfg } = await supabase.from("system_config").select("value").eq("key", "supportAdminTelegramId").maybeSingle();
    const mIds = (mCfg?.value || "").split(",").map((s: string) => s.trim());
    if (!mIds.includes(telegramId)) {
      await sendMessage(token, chatId, "❌ Acesso negado.");
      return;
    }
    await editMessageWithKeyboard(token, chatId, msgId,
      "⚙️ <b>Painel de Administração</b>\n\nEscolha uma opção:",
      [
        [{ text: "📢 Enviar Broadcast", callback_data: "admin_broadcast" }],
        [{ text: "⬅️ Voltar ao Menu Principal", callback_data: "menu_main" }],
      ]
    );
    return;
  }

  if (data === "admin_broadcast") {
    const { data: mCfg2 } = await supabase.from("system_config").select("value").eq("key", "supportAdminTelegramId").maybeSingle();
    const mIds2 = (mCfg2?.value || "").split(",").map((s: string) => s.trim());
    if (!mIds2.includes(telegramId)) return;
    await editMessageWithKeyboard(token, chatId, msgId,
      "📢 <b>Broadcast</b>\n\nEscolha o público-alvo:",
      [
        [{ text: "📢 Todos os Usuários", callback_data: "broadcast_all" }],
        [{ text: "✅ Apenas Registrados", callback_data: "broadcast_registered" }],
        [{ text: "⬅️ Voltar", callback_data: "menu_admin" }],
      ]
    );
    return;
  }

  if (data === "support_talk") {
    // Check if support is enabled
    const { data: supportCfg } = await supabase.from("system_config").select("value").eq("key", "supportEnabled").maybeSingle();
    if (supportCfg?.value === "false") {
      await sendMessage(token, chatId, "⚠️ <b>Suporte Temporariamente Indisponível</b>\n\nO atendimento está pausado no momento. Por favor, tente novamente mais tarde.");
      return;
    }

    const chatIdStr = String(chatId);
    const user = await findUserByTelegram(supabase, telegramId);
    await setSession(supabase, chatIdStr, "awaiting_support_message", {
      user_id: user?.id || null,
      telegram_username: callback.from.username || "",
      telegram_first_name: callback.from.first_name || "",
    });
    await sendMessage(token, chatId, "📝 <b>Falar com Suporte</b>\n\nDigite sua mensagem abaixo. Ela será enviada diretamente ao administrador.\n\n<i>Para cancelar, use /menu</i>");
    return;
  }

  if (data === "menu_main") {
    const user = await findUserByTelegram(supabase, telegramId);
    if (user) {
      // Fetch balance for welcome message
      const { data: saldo } = await supabase.from("saldos").select("valor").eq("user_id", user.id).eq("tipo", "revenda").maybeSingle();
      const saldoFmt = Number(saldo?.valor || 0).toFixed(2).replace(".", ",");
      await editMessageWithKeyboard(token, chatId, msgId,
        `👋 Olá, <b>${user.nome || user.email}</b>!\n💰 Saldo: <b>R$ ${saldoFmt}</b>\n\nEscolha uma opção:`,
        menuKb()
      );
      sendPendingNotifications(supabase, token, chatId, user.id).catch((e) =>
        console.error("[PENDING] Background send failed:", e)
      );
    }
    return;
  }

  if (data === "menu_saldo") {
    const user = await findUserByTelegram(supabase, telegramId);
    if (!user) return;
    const { data: saldo } = await supabase.from("saldos").select("valor").eq("user_id", user.id).eq("tipo", "revenda").maybeSingle();
    const valor = Number(saldo?.valor || 0);
    const valorFmt = valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // Send as popup alert (showAlert: true shows a native Telegram popup)
    fetch(`${TELEGRAM_API}${token}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callback_query_id: callback.id,
        text: `💰 Seu saldo atual é de: R$ ${valorFmt}`,
        show_alert: true,
      }),
    }).catch(() => {});

    // Also update the message with buttons
    await editMessageWithKeyboard(token, chatId, msgId,
      `💰 Seu saldo atual é de: <b>R$ ${valorFmt}</b>`,
      [
        [{ text: "➕ Fazer Depósito", callback_data: "menu_deposito" }],
        [{ text: "⬅️ Voltar ao Menu Principal", callback_data: "menu_main" }],
      ]
    );
    return;
  }

  if (data === "menu_conta") {
    const user = await findUserByTelegram(supabase, telegramId);
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, nome, email, telefone, telegram_id, telegram_username, created_at")
      .eq("id", user.id)
      .single();

    if (!profile) return;

    const membroDesde = new Date(profile.created_at).toLocaleDateString("pt-BR", {
      day: "2-digit", month: "long", year: "numeric",
    });

    let msg = `👤 <b>Minha Conta</b>\n\n`;
    msg += `📛 <b>Nome:</b> ${profile.nome || "Não informado"}\n`;
    msg += `📧 <b>E-mail:</b> ${profile.email || "Não informado"}\n`;
    if (profile.telefone) msg += `📞 <b>Telefone:</b> ${profile.telefone}\n`;
    msg += `\n🆔 <b>ID Telegram:</b> <code>${profile.telegram_id || telegramId}</code>\n`;
    if (profile.telegram_username) msg += `👤 <b>Username:</b> @${profile.telegram_username}\n`;
    msg += `\n📅 <b>Membro desde:</b> ${membroDesde}`;

    await editMessageWithKeyboard(token, chatId, msgId, msg,
      [[{ text: "⬅️ Voltar ao Menu Principal", callback_data: "menu_main" }]]
    );
    return;
  }

  if (data === "menu_recarga") {
    // Fetch operators from Recarga Express API catalog
    const catalog = await fetchCatalog(supabase);

    if (!catalog?.length) {
      await editMessageWithKeyboard(token, chatId, msgId,
        "⚠️ Nenhuma operadora disponível no momento.",
        [[{ text: "📖 Voltar ao Menu", callback_data: "menu_main" }]]
      );
      return;
    }

    const opButtons = catalog.map((carrier: any) => [{ text: carrier.name || carrier.carrierId, callback_data: `rec_op_${carrier.carrierId}` }]);
    opButtons.push([{ text: "⬅️ Voltar ao Menu Principal", callback_data: "menu_main" }]);

    await editMessageWithKeyboard(token, chatId, msgId,
      "📱 <b>VAMOS FAZER UMA RECARGA!</b>\n\nSelecione a operadora:",
      opButtons
    );
    return;
  }

  // Recarga: operator selected → show values from API catalog with pricing
  if (data.startsWith("rec_op_")) {
    const carrierId = data.replace("rec_op_", "");
    const user = await findUserByTelegram(supabase, telegramId);
    if (!user) return;

    const catalog = await fetchCatalog(supabase);
    const carrier = catalog.find((c: any) => c.carrierId === carrierId);

    if (!carrier || !carrier.values?.length) {
      await editMessageWithKeyboard(token, chatId, msgId,
        "⚠️ Nenhum valor disponível para esta operadora.",
        [[{ text: "⬅️ Voltar", callback_data: "menu_recarga" }]]
      );
      return;
    }

    // Get user role and pricing rules
    const userRole = await resolveUserRole(supabase, user.id, "cliente");

    let resellerId: string | null = null;
    if (userRole === "cliente") {
      const { data: profileData } = await supabase
        .from("profiles").select("reseller_id").eq("id", user.id).single();
      resellerId = profileData?.reseller_id || null;
    }

    // Resolve operadora_id (API sometimes returns external non-UUID ids)
    const isUuid = (value: string) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

    const normalize = (value?: string) =>
      (value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

    let operadoraId: string | null = isUuid(carrierId) ? carrierId : null;

    if (!operadoraId) {
      const { data: opsData } = await supabase.from("operadoras").select("id, nome").eq("ativo", true);
      const targetName = normalize(carrier.name);
      const matchedOp = (opsData || []).find((op: any) => {
        const dbName = normalize(op.nome);
        return dbName === targetName || dbName.includes(targetName) || targetName.includes(dbName);
      });
      operadoraId = matchedOp?.id || null;
    }

    // Fetch applicable pricing rules (merge reseller + global fallback per value)
    let pricingRules: any[] = [];
    console.log(`[PRICING] role=${userRole} userId=${user.id} carrier=${carrier.name} carrierId=${carrierId} operadoraId=${operadoraId}`);

    if (!operadoraId) {
      console.log(`[PRICING] No operadoraId found — no pricing rules will be applied`);
      pricingRules = [];
    } else if (userRole === "admin") {
      const { data: rules } = await supabase.from("pricing_rules").select("*").eq("operadora_id", operadoraId);
      pricingRules = rules || [];
      console.log(`[PRICING] admin: loaded ${pricingRules.length} global rules`);
    } else if (userRole === "revendedor" || (userRole === "cliente" && resellerId)) {
      const ruleUserId = userRole === "revendedor" ? user.id : resellerId;
      const [{ data: resellerRules }, { data: globalRules }] = await Promise.all([
        supabase.from("reseller_pricing_rules").select("*").eq("user_id", ruleUserId).eq("operadora_id", operadoraId),
        supabase.from("pricing_rules").select("*").eq("operadora_id", operadoraId),
      ]);
      console.log(`[PRICING] reseller/cliente: ruleUserId=${ruleUserId} resellerRules=${(resellerRules||[]).length} globalRules=${(globalRules||[]).length}`);
      // Merge: use reseller rule if exists for that value, otherwise global
      const resellerMap = new Map((resellerRules || []).map((r: any) => [Number(r.valor_recarga), r]));
      const globalMap = new Map((globalRules || []).map((r: any) => [Number(r.valor_recarga), r]));
      const allValues = new Set([...resellerMap.keys(), ...globalMap.keys()]);
      for (const v of allValues) {
        pricingRules.push(resellerMap.get(v) || globalMap.get(v));
      }
    } else {
      // "usuario" or unknown role — check for own reseller rules first, then global fallback
      const [{ data: ownRules }, { data: globalRules }] = await Promise.all([
        supabase.from("reseller_pricing_rules").select("*").eq("user_id", user.id).eq("operadora_id", operadoraId),
        supabase.from("pricing_rules").select("*").eq("operadora_id", operadoraId),
      ]);
      if (ownRules && ownRules.length > 0) {
        const ownMap = new Map((ownRules).map((r: any) => [Number(r.valor_recarga), r]));
        const gMap = new Map((globalRules || []).map((r: any) => [Number(r.valor_recarga), r]));
        const allValues = new Set([...ownMap.keys(), ...gMap.keys()]);
        for (const v of allValues) {
          pricingRules.push(ownMap.get(v) || gMap.get(v));
        }
        console.log(`[PRICING] role=${userRole}: found ${ownRules.length} own reseller rules + ${(globalRules||[]).length} global (merged)`);
      } else {
        pricingRules = globalRules || [];
        console.log(`[PRICING] role=${userRole}: loaded ${pricingRules.length} global rules (fallback)`);
      }
    }

    console.log(`[PRICING] final rules count=${pricingRules.length} values=[${pricingRules.map((r:any) => `${r.valor_recarga}→${r.tipo_regra==='fixo'?r.regra_valor:r.custo+'*'+r.regra_valor+'%'}`).join(', ')}]`);

    // resolveValue is now global — defined before handleCallback

    // Filter out disabled values
    let filteredValues = carrier.values;
    if (operadoraId) {
      const { data: disabledRows } = await supabase.from("disabled_recharge_values").select("valor").eq("operadora_id", operadoraId);
      if (disabledRows?.length) {
        const disabledSet = new Set(disabledRows.map((d: any) => Number(d.valor)));
        filteredValues = carrier.values.filter((v: any) => !disabledSet.has(resolveValue(v)));
      }
    }

    if (!filteredValues.length) {
      await editMessageWithKeyboard(token, chatId, msgId,
        "⚠️ Nenhum valor disponível para esta operadora no momento.",
        [[{ text: "⬅️ Voltar", callback_data: "menu_recarga" }]]
      );
      return;
    }

    // Calculate user cost for each value
    const vals = filteredValues.sort((a: any, b: any) => resolveValue(a) - resolveValue(b));

    // Load default margin config once for this listing (cached)
    const dmCfg2 = await getDefaultMarginConfig(supabase);
    const dmEnabled2 = dmCfg2.enabled;
    const dmType2 = dmCfg2.type;
    const dmVal2 = dmCfg2.value;

    function getUserCost(apiCost: number, faceValue: number): number {
      // Default margin OVERRIDES all rules when active
      if (dmEnabled2 && dmVal2 > 0) {
        const cost = dmType2 === "fixo" ? apiCost + dmVal2 : apiCost * (1 + dmVal2 / 100);
        console.log(`[PRICING] getUserCost: faceValue=${faceValue} default_margin_override ${dmType2}=${dmVal2} → cost=${cost}`);
        return cost;
      }
      const rule = pricingRules.find((r: any) => Number(r.valor_recarga) === faceValue);
      if (rule) {
        const cost = rule.tipo_regra === "fixo"
          ? (Number(rule.regra_valor) > 0 ? Number(rule.regra_valor) : Number(rule.custo))
          : Number(rule.custo) * (1 + Number(rule.regra_valor) / 100);
        console.log(`[PRICING] getUserCost: faceValue=${faceValue} matched rule tipo=${rule.tipo_regra} → cost=${cost}`);
        return cost;
      }
      console.log(`[PRICING] getUserCost: faceValue=${faceValue} NO RULE MATCH → using apiCost=${apiCost}`);
      return apiCost;
    }

    // Build description — two lines per value, aligned vertically
    let msgText = `📱 <b>${carrier.name}</b>\n\nEscolha um dos valores abaixo:\n\n`;
    for (const v of vals) {
      const faceValue = resolveValue(v);
      const userCost = getUserCost(v.cost, faceValue);
      const faceStr = Number(faceValue).toFixed(2).replace(".", ",");
      const costStr = Number(userCost).toFixed(2).replace(".", ",");
      if (Number(faceValue) !== Number(userCost)) {
        msgText += `📦 Recarga: <b>R$ ${faceStr}</b>\n💵 Você paga: <b>R$ ${costStr}</b>\n\n`;
      } else {
        msgText += `📦 Recarga: <b>R$ ${faceStr}</b>\n\n`;
      }
    }

    const valButtons: any[][] = [];
    for (let i = 0; i < vals.length; i += 2) {
      const row = vals.slice(i, i + 2).map((v: any) => {
        const faceValue = resolveValue(v);
        const userCost = getUserCost(v.cost, faceValue);
        return {
          text: `R$ ${Number(faceValue).toFixed(2).replace(".", ",")}`,
          callback_data: `rec_val_${carrierId}_${v.valueId}|${userCost.toFixed(2)}`,
        };
      });
      valButtons.push(row);
    }
    valButtons.push([{ text: "⬅️ Voltar", callback_data: "menu_recarga" }]);

    await editMessageWithKeyboard(token, chatId, msgId, msgText, valButtons);
    return;
  }

  // Recarga: value selected → ask for phone number
  if (data.startsWith("rec_val_")) {
    // Format: rec_val_{carrierId}_{valueId}|{cost}
    const payload = data.replace("rec_val_", "");
    const pipeIdx = payload.lastIndexOf("|");
    const cost = pipeIdx >= 0 ? parseFloat(payload.slice(pipeIdx + 1)) : 0;
    const prefix = pipeIdx >= 0 ? payload.slice(0, pipeIdx) : payload;
    const firstUnderscore = prefix.indexOf("_");
    const carrierId = prefix.slice(0, firstUnderscore);
    const valueId = prefix.slice(firstUnderscore + 1);

    // Get carrier name and API cost from catalog
    const catalog = await fetchCatalog(supabase);
    const carrier = catalog.find((c: any) => c.carrierId === carrierId);
    const carrierName = carrier?.name || carrierId;
    const valueObj = carrier?.values?.find((v: any) => v.valueId === valueId);
    const apiCost = Number(valueObj?.cost || 0);
    const valorFacial = resolveValue(valueObj);

    const user = await findUserByTelegram(supabase, telegramId);
    if (!user) return;

    await setSession(supabase, String(chatId), "awaiting_recarga_phone", {
      user_id: user.id,
      carrier_id: carrierId,
      value_id: valueId,
      operadora_nome: carrierName,
      valor: cost,
      api_cost: apiCost,
      valor_facial: valorFacial,
      bot_msg_id: msgId,
    });

    await editMessageWithKeyboard(token, chatId, msgId,
      `📱 <b>Recarga ${carrierName}</b>\n💰 Valor: <b>R$ ${cost.toFixed(2).replace(".", ",")}</b>\n\nDigite o <b>número de telefone com DDD</b> (apenas 11 dígitos):`,
      [[{ text: "⬅️ Voltar", callback_data: `rec_op_${carrierId}` }, { text: "❌ Cancelar", callback_data: "cancel" }]]
    );
    return;
  }

  if (data === "menu_recargas") {
    const user = await findUserByTelegram(supabase, telegramId);
    if (!user) return;
    const { data: recargas } = await supabase
      .from("recargas")
      .select("telefone, valor, operadora, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    const msg = (!recargas?.length)
      ? "📋 Nenhuma recarga encontrada."
      : formatRecargaHistory(recargas);

    await editMessageWithKeyboard(token, chatId, msgId, msg,
      [[{ text: "⬅️ Voltar", callback_data: "menu_main" }]]
    );
    return;
  }

  if (data === "cancel") {
    await editMessageWithKeyboard(token, chatId, msgId,
      "❌ Operação cancelada.",
      [[{ text: "📖 Voltar ao Menu", callback_data: "menu_main" }]]
    );
    return;
  }

  // Deposit quick values
  if (data.startsWith("deposit_")) {
    const amount = data.replace("deposit_", "");
    const user = await findUserByTelegram(supabase, telegramId);
    if (!user) return;
    const session = await getSession(supabase, String(chatId));
    await handleDepositAmount(supabase, token, chatId, String(chatId), user, amount, session, msgId);
    return;
  }

  // Deposito PIX
  if (data === "menu_deposito") {
    const user = await findUserByTelegram(supabase, telegramId);
    if (!user) return;

    notifyAdminTelegramActivity(
      supabase,
      "telegram_activity",
      `🤖 Bot Telegram: ${user.nome || user.email || "Usuário"} abriu o menu de depósito`,
      {
        user_id: user.id,
        user_nome: user.nome || null,
        user_email: user.email || null,
        status: "clicked",
      },
    ).catch(() => {});

    // Check gateway + fee config in parallel
    const [resellerCfg, globalCfg, taxaTipoRow, taxaValorRow] = await Promise.all([
      supabase.from("reseller_config").select("key, value").eq("user_id", user.id).eq("key", "paymentModule").maybeSingle(),
      supabase.from("system_config").select("value").eq("key", "paymentModule").maybeSingle(),
      supabase.from("system_config").select("value").eq("key", "taxaTipo").maybeSingle(),
      supabase.from("system_config").select("value").eq("key", "taxaValor").maybeSingle(),
    ]);

    const hasGateway = !!resellerCfg?.data?.value || !!globalCfg?.data?.value;

    if (!hasGateway) {
      await editMessageWithKeyboard(token, chatId, msgId,
        "⚠️ <b>Gateway não configurada</b>\n\nNenhuma gateway de pagamento foi configurada.\n\nAcesse o painel web e vá em <b>Gateway de Pagamento</b> para configurar sua gateway antes de gerar PIX.",
        [[{ text: "📖 Voltar ao Menu", callback_data: "menu_main" }]]
      );
      return;
    }

    // Build fee info line for deposit menu
    const taxaTipo = taxaTipoRow?.data?.value || "";
    const taxaValor = parseFloat((taxaValorRow?.data?.value || "0").replace(",", ".")) || 0;
    let feeInfoLine = "";
    if (taxaTipo && taxaValor > 0) {
      const feeLabel = taxaTipo === "percentual" ? `${taxaValor}%` : `R$ ${taxaValor.toFixed(2).replace(".", ",")}`;
      feeInfoLine = `\n💸 <b>Taxa de depósito:</b> ${feeLabel}`;
    }

    await setSession(supabase, String(chatId), "awaiting_deposit_amount", { user_id: user.id, bot_msg_id: msgId });
    await editMessageWithKeyboard(token, chatId, msgId,
      `💳 <b>Depósito PIX</b>\n\n💰 Valor mínimo: <b>R$ 10,00</b>${feeInfoLine}\n\nEscolha um valor ou digite manualmente:`,
      [
        [{ text: "R$ 10", callback_data: "deposit_10" }, { text: "R$ 15", callback_data: "deposit_15" }, { text: "R$ 20", callback_data: "deposit_20" }],
        [{ text: "R$ 30", callback_data: "deposit_30" }, { text: "R$ 50", callback_data: "deposit_50" }, { text: "R$ 100", callback_data: "deposit_100" }],
        [{ text: "R$ 200", callback_data: "deposit_200" }],
        [{ text: "⬅️ Voltar", callback_data: "menu_main" }]
      ]
    );
    return;
  }

  if (data === "rconfirm_yes") {
    // Read confirmation data from session
    const confirmSession = await getSession(supabase, String(chatId));
    if (!confirmSession || confirmSession.step !== "awaiting_recarga_confirm") {
      await editMessageWithKeyboard(token, chatId, msgId, "❌ Sessão expirada. Tente novamente.", [[{ text: "📖 Menu", callback_data: "menu_main" }]]);
      return;
    }
    const { telefone, carrier_id: carrierId, value_id: valueId, valor: cost, user_id: userId, api_cost: apiCostFromSession, valor_facial: valorFacialFromSession } = confirmSession.data || {};
    clearSession(supabase, String(chatId));

    await editMessageWithKeyboard(token, chatId, msgId,
      "⏳ <b>Processando recarga...</b>\n\nAguarde um momento.",
      []
    );

    try {
      // Call the unified recarga-express Edge Function instead of direct API call
      const rechargeResp = await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/recarga-express`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({
            action: "recharge",
            user_id: userId,
            carrierId,
            phoneNumber: telefone,
            valueId,
            saldo_tipo: "revenda",
          }),
        }
      );
      const rechargeResult = await rechargeResp.json();

      console.log("Telegram recarga via edge function response:", JSON.stringify(rechargeResult));

      if (!rechargeResult?.success) {
        throw new Error(rechargeResult?.error || rechargeResult?.message || "Erro ao processar recarga");
      }

      const orderData = rechargeResult.data || {};
      const newBalance = orderData.localBalance ?? 0;
      const chargedCost = orderData.cost ?? cost;
      const externalId = orderData._id || orderData.id || orderData.orderId || null;
      const operadoraNome = orderData.operator || orderData.carrier?.name || carrierId;
      const valorFacial = Number(valorFacialFromSession || orderData.amount || orderData.value || orderData.valor || cost);

      const horario = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
      const formattedPhone = telefone.length === 11
        ? `(${telefone.slice(0,2)}) ${telefone.slice(2,7)}-${telefone.slice(7)}`
        : `(${telefone.slice(0,2)}) ${telefone.slice(2,6)}-${telefone.slice(6)}`;

      let msgSucesso = `✅ <b>Recarga realizada!</b>\n\n📡 Operadora: <b>${operadoraNome}</b>\n📞 Telefone: <code>${formattedPhone}</code>\n💰 Valor da Recarga: <b>R$ ${valorFacial.toFixed(2).replace(".", ",")}</b>\n💵 Custo: <b>R$ ${Number(chargedCost).toFixed(2).replace(".", ",")}</b>\n💳 Novo saldo: <b>R$ ${Number(newBalance).toFixed(2).replace(".", ",")}</b>\n🕐 Horário: ${horario}`;
      if (externalId) msgSucesso += `\n🔖 Pedido: <code>${externalId}</code>`;

      await editMessageWithKeyboard(token, chatId, msgId,
        msgSucesso,
        [[
          { text: "📱 Nova Recarga", callback_data: "menu_recarga" },
          { text: "📖 Menu", callback_data: "menu_main" },
        ]]
      );
    } catch (err: any) {
      console.error("Telegram recarga error:", err);
      await editMessageWithKeyboard(token, chatId, msgId,
        `❌ <b>Erro na recarga</b>\n\n${err?.message || "Erro interno. Tente novamente."}`,
        [[{ text: "📖 Voltar ao Menu", callback_data: "menu_main" }]]
      );
    }
  }
}

// ===== RECARGA PHONE HANDLER =====

async function handleRecargaPhone(supabase: any, token: string, chatId: number, chatIdStr: string, user: any, text: string, session: any, userMsgId: number) {
  deleteMessageFire(token, chatId, userMsgId);

  const telefone = text.replace(/\D/g, "");
  if (telefone.length < 10 || telefone.length > 11) {
    await sendMessage(token, chatId, "❌ Número inválido. Digite DDD + número (10 ou 11 dígitos):");
    return;
  }

  const { carrier_id, value_id, operadora_nome, valor, bot_msg_id, api_cost, valor_facial } = session.data || {};

  // Check cooldown/blacklist BEFORE proceeding
  try {
    const checkResp = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/functions/v1/recarga-express`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify({
          action: "check-phone",
          user_id: user.id,
          phoneNumber: telefone,
          carrierId: carrier_id,
        }),
      }
    );
    const checkResult = await checkResp.json();
    console.log(`[BOT] check-phone result for ${telefone}:`, JSON.stringify(checkResult));

    if (checkResult?.success && checkResult.data) {
      const phoneStatus = checkResult.data.status;
      if (phoneStatus === "BLACKLISTED") {
        clearSession(supabase, chatIdStr);
        if (bot_msg_id) deleteMessageFire(token, chatId, bot_msg_id);
        await sendMessageWithKeyboard(token, chatId,
          `🚫 <b>Número Bloqueado</b>\n\n${checkResult.data.message || "Este número está na blacklist e não pode receber recargas."}`,
          [[{ text: "📱 Tentar Outro Número", callback_data: `rec_op_${carrier_id}` }, { text: "📖 Menu", callback_data: "menu_main" }]]
        );
        return;
      }
      if (phoneStatus === "COOLDOWN") {
        // Format cooldown message with readable date
        let cooldownMsg = checkResult.data.message || "Cooldown ativo para este número.";
        const isoMatch = cooldownMsg.match(/(\d{4}-\d{2}-\d{2}T[\d:.]+Z?)/);
        if (isoMatch) {
          const d = new Date(isoMatch[1]);
          const formatted = d.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
          cooldownMsg = `⏳ Cooldown ativo! Nova recarga permitida após ${formatted}.`;
        }
        clearSession(supabase, chatIdStr);
        if (bot_msg_id) deleteMessageFire(token, chatId, bot_msg_id);
        await sendMessageWithKeyboard(token, chatId,
          `⏳ <b>Cooldown Ativo</b>\n\n${cooldownMsg}`,
          [[{ text: "📱 Tentar Outro Número", callback_data: `rec_op_${carrier_id}` }, { text: "📖 Menu", callback_data: "menu_main" }]]
        );
        return;
      }
    }
  } catch (checkErr) {
    console.error("[BOT] check-phone error:", checkErr);
    // Continue anyway — don't block recharge if check fails
  }

  // Check balance
  const { data: saldo } = await supabase.from("saldos").select("valor").eq("user_id", user.id).eq("tipo", "revenda").single();
  const saldoAtual = Number(saldo?.valor || 0);

  if (valor > saldoAtual) {
    clearSession(supabase, chatIdStr);
    if (bot_msg_id) deleteMessageFire(token, chatId, bot_msg_id);
    await sendMessageWithKeyboard(token, chatId,
      `❌ <b>Saldo insuficiente</b>\n\nSaldo: R$ ${saldoAtual.toFixed(2).replace(".", ",")}\nRecarga: R$ ${Number(valor).toFixed(2).replace(".", ",")}`,
      [[{ text: "💳 Depositar", callback_data: "menu_deposito" }, { text: "📖 Menu", callback_data: "menu_main" }]]
    );
    return;
  }

  // Save confirmation data in session so we can use a short callback_data
  await setSession(supabase, chatIdStr, "awaiting_recarga_confirm", {
    user_id: user.id,
    carrier_id,
    value_id,
    operadora_nome,
    valor,
    telefone,
    api_cost,
    valor_facial,
  });
  if (bot_msg_id) deleteMessageFire(token, chatId, bot_msg_id);

  const formattedPhone = telefone.length === 11
    ? `(${telefone.slice(0,2)}) ${telefone.slice(2,7)}-${telefone.slice(7)}`
    : `(${telefone.slice(0,2)}) ${telefone.slice(2,6)}-${telefone.slice(6)}`;

  const vfDisplay = valor_facial ? Number(valor_facial) : Number(valor);
  await sendMessageWithKeyboard(token, chatId,
    `📱 <b>Confirmar Recarga</b>\n\n📡 Operadora: <b>${operadora_nome}</b>\n📞 Telefone: <code>${formattedPhone}</code>\n💰 Valor da Recarga: <b>R$ ${vfDisplay.toFixed(2).replace(".", ",")}</b>\n💵 Custo: <b>R$ ${Number(valor).toFixed(2).replace(".", ",")}</b>\n💳 Saldo atual: R$ ${saldoAtual.toFixed(2).replace(".", ",")}`,
    [[
      { text: "✅ Confirmar", callback_data: "rconfirm_yes" },
      { text: "❌ Cancelar", callback_data: "cancel" },
    ]]
  );
}

// ===== MAIN MENU =====

async function sendMainMenu(token: string, chatId: number, user: any, supabase?: any) {
  const baseSiteUrl = await getSiteUrl(supabase);
  let webAppUrl = `${baseSiteUrl}/miniapp`;
  let migrationSiteUrl = baseSiteUrl;
  let migrationEnabled = false;
  let em: Record<string, string> = {};
  let saldoFmt = "0,00";
  const keyboard: any[][] = [];
  // Fetch migration config, seasonal emojis, webAppUrl config, balance, and button toggles in parallel
  const [migrationConfig, emojis, webAppConfig, saldoData, btnConfigs] = await Promise.all([
    getMigrationConfig(supabase),
    getSeasonalEmojis(supabase),
    supabase.from("system_config").select("value").eq("key", "webAppUrl").maybeSingle(),
    user.id ? supabase.from("saldos").select("valor").eq("user_id", user.id).eq("tipo", "revenda").maybeSingle() : Promise.resolve({ data: null }),
    supabase.from("system_config").select("key, value").like("key", "bot_btn_%"),
  ]);
  migrationSiteUrl = migrationConfig.url || migrationSiteUrl;
  migrationEnabled = migrationConfig.enabled;
  em = emojis;
  if (webAppConfig?.data?.value) webAppUrl = webAppConfig.data.value;
  const saldoVal = Number(saldoData?.data?.valor || 0);
  saldoFmt = saldoVal.toFixed(2).replace(".", ",");

  // Build button visibility map
  const btnMap: Record<string, boolean> = {
    bot_btn_saldo: true, bot_btn_recarga: true, bot_btn_historico: true,
    bot_btn_deposito: true, bot_btn_conta: true, bot_btn_webapp: true,
    bot_btn_migration: false, bot_btn_ajuda: true,
  };
  for (const row of (btnConfigs?.data || [])) {
    btnMap[row.key] = row.value === "true";
  }

  const row1: any[] = [];
  if (btnMap.bot_btn_saldo) row1.push({ text: `${se(em, "saldo")} Ver Saldo`, callback_data: "menu_saldo" });
  if (btnMap.bot_btn_recarga) row1.push({ text: `${se(em, "recarga")} Fazer Recarga`, callback_data: "menu_recarga" });
  if (row1.length) keyboard.push(row1);
  const row2: any[] = [];
  if (btnMap.bot_btn_historico) row2.push({ text: `${se(em, "historico")} Histórico`, callback_data: "menu_recargas" });
  if (btnMap.bot_btn_deposito) row2.push({ text: `${se(em, "deposito")} Depositar PIX`, callback_data: "menu_deposito" });
  if (row2.length) keyboard.push(row2);
  const row3: any[] = [];
  if (btnMap.bot_btn_conta) row3.push({ text: `${se(em, "conta")} Minha Conta`, callback_data: "menu_conta" });
  if (btnMap.bot_btn_webapp) row3.push({ text: `${se(em, "webapp")} Mini App`, web_app: { url: webAppUrl } });
  if (row3.length) keyboard.push(row3);
  if (btnMap.bot_btn_migration && migrationEnabled) {
    keyboard.push([{ text: `${se(em, "migration")} Usar Saldo Antigo`, web_app: { url: migrationSiteUrl } }]);
  }
  if (btnMap.bot_btn_ajuda) {
    keyboard.push([{ text: "❓ Ajuda / Suporte", callback_data: "menu_ajuda" }]);
  }

  // Master admin only: show admin button
  const telegramIdStr = String(chatId);
  const { data: masterTgCfg } = await supabase.from("system_config").select("value").eq("key", "supportAdminTelegramId").maybeSingle();
  const masterTgIds = (masterTgCfg?.value || "").split(",").map((s: string) => s.trim());
  if (masterTgIds.includes(telegramIdStr)) {
    keyboard.push([{ text: "⚙️ Administração", callback_data: "menu_admin" }]);
  }

  await sendMessageWithKeyboard(token, chatId,
    `👋 Olá, <b>${user.nome || user.email}</b>!\n💰 Saldo: <b>R$ ${saldoFmt}</b>\n\nEscolha uma opção:`,
    keyboard
  );
}

async function handleAjuda(supabase: any, token: string, chatId: number, telegramId: string) {
  await sendMessageWithKeyboard(token, chatId,
    `❓ <b>Ajuda & Suporte</b>\n\n💬 Precisa de ajuda? Fale diretamente com nossa equipe de suporte clicando no botão abaixo:`,
    [[
      { text: "💬 Falar com Suporte", callback_data: "support_talk" },
    ], [
      { text: "⬅️ Voltar ao Menu", callback_data: "menu_main" },
    ]]
  );
}

async function handleSupportMessage(supabase: any, token: string, chatId: number, chatIdStr: string, user: any, text: string, session: any, userMsgId: number, photoFileId?: string | null) {
  // DO NOT clear session — keep support mode open until user sends /menu or a command

  let imageUrl: string | null = null;

  // Download photo from Telegram and upload to Supabase storage
  if (photoFileId) {
    try {
      const fileResp = await fetch(`${TELEGRAM_API}${token}/getFile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_id: photoFileId }),
      });
      const fileData = await fileResp.json();
      if (fileData?.ok && fileData.result?.file_path) {
        const downloadResp = await fetch(`https://api.telegram.org/file/bot${token}/${fileData.result.file_path}`);
        if (downloadResp.ok) {
          const fileBytes = await downloadResp.arrayBuffer();
          const ext = fileData.result.file_path.split(".").pop() || "jpg";
          const fileName = `support/${chatIdStr}/${Date.now()}.${ext}`;
          const { error: upErr } = await supabase.storage.from("chat-images").upload(fileName, fileBytes, { contentType: `image/${ext}` });
          if (!upErr) {
            const { data: { publicUrl } } = supabase.storage.from("chat-images").getPublicUrl(fileName);
            imageUrl = publicUrl;
          }
        }
      }
    } catch (e) {
      console.error("[SUPPORT] Photo download/upload error:", e);
    }
  }

  const messageText = text || (imageUrl ? "[Imagem]" : "");
  if (!messageText && !imageUrl) {
    await sendMessage(token, chatId, "❌ Envie uma mensagem de texto ou imagem.");
    return;
  }

  // Find or create ticket
  const { data: existingTickets } = await supabase.from("support_tickets")
    .select("id, message, status")
    .eq("telegram_chat_id", chatIdStr)
    .in("status", ["open", "in_progress", "answered"])
    .order("created_at", { ascending: false })
    .limit(1);

  let ticketId: string;
  const existingTicket = existingTickets?.[0];

  if (existingTicket) {
    ticketId = existingTicket.id;
    // Reopen if answered and update timestamp
    await supabase.from("support_tickets").update({
      status: "open",
      updated_at: new Date().toISOString(),
    }).eq("id", ticketId);
  } else {
    // Create new ticket
    const { data: newTicket, error } = await supabase.from("support_tickets").insert({
      telegram_chat_id: chatIdStr,
      telegram_username: session.data?.telegram_username || null,
      telegram_first_name: session.data?.telegram_first_name || null,
      user_id: user?.id || null,
      message: messageText,
      subject: messageText.length > 100 ? messageText.slice(0, 100) + "…" : messageText,
      image_url: imageUrl,
      status: "open",
    }).select("id").single();
    if (error || !newTicket) {
      console.error("[SUPPORT] Error creating ticket:", error?.message);
      await sendMessage(token, chatId, "❌ Erro ao enviar mensagem. Tente novamente.");
      return;
    }
    ticketId = newTicket.id;
  }

  // ✅ Write message to support_messages (unified history)
  const senderId = user?.id || "00000000-0000-0000-0000-000000000000";

  // Determine sender role dynamically
  let senderRole = "client";
  if (user?.id) {
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (roleData) senderRole = "admin";
  }

  const { error: msgError } = await supabase.from("support_messages").insert({
    ticket_id: ticketId,
    sender_id: senderId,
    sender_role: senderRole,
    message: messageText,
    image_url: imageUrl,
    origin: "telegram",
  });
  if (msgError) {
    console.error("[SUPPORT] Error saving message:", msgError.message);
  }

  await sendMessageWithKeyboard(token, chatId,
    "✅ <b>Mensagem enviada ao suporte!</b>\n\nVocê pode continuar enviando mensagens ou fotos.\nPara sair do suporte, use /menu ou clique abaixo.",
    [[{ text: "❌ Sair do Suporte", callback_data: "menu_main" }, { text: "📖 Menu", callback_data: "menu_main" }]]
  );

  // Notify admin via Telegram (fire-and-forget)
  const { data: adminCfgRow } = await supabase.from("system_config").select("value").eq("key", "supportAdminTelegramId").maybeSingle();
  const adminChatId = Number(adminCfgRow?.value) || 1901426549;
  const userName = user?.nome || user?.email?.split("@")[0] || session.data?.telegram_first_name || session.data?.telegram_username || "Usuário";
  const userTag = session.data?.telegram_username ? ` (@${session.data.telegram_username})` : "";
  const photoTag = imageUrl ? "\n📷 <i>Com imagem anexada</i>" : "";
  const msgPreview = messageText.length > 300 ? messageText.slice(0, 300) + "…" : messageText;
  const ticketLabel = existingTicket ? "📩 <b>Nova mensagem no Suporte</b>" : "🆘 <b>Novo Ticket de Suporte</b>";
  sendMessage(token, adminChatId,
    `${ticketLabel}\n\n👤 ${userName}${userTag}\n\n💬 <i>${msgPreview}</i>${photoTag}`
  ).catch(() => {});
}

// ===== DEPOSIT HANDLER =====

async function handleDepositAmount(supabase: any, token: string, chatId: number, chatIdStr: string, user: any, text: string, session: any, userMsgId: number) {
  deleteMessageFire(token, chatId, userMsgId);

  // If user typed non-numeric text, exit deposit flow entirely
  const cleaned = text.replace(/[.,\s]/g, "");
  if (!/^\d+([.,]\d+)?$/.test(text.replace(/\s/g, "")) || cleaned.length === 0) {
    clearSession(supabase, chatIdStr);
    await sendMessageWithKeyboard(token, chatId,
      "❌ Depósito cancelado.\n\nDigite um comando ou use o menu.",
      [[{ text: "💳 Depositar", callback_data: "menu_deposito" }, { text: "📖 Menu", callback_data: "menu_main" }]]
    );
    return;
  }

  const valor = parseFloat(text.replace(",", "."));
  if (isNaN(valor) || valor < 10 || valor > 10000) {
    await sendMessageWithKeyboard(token, chatId,
      "❌ Valor inválido. O valor mínimo é <b>R$ 10,00</b> e o máximo é R$ 10.000,00.\n\nDigite um valor válido ou cancele:",
      [[{ text: "❌ Cancelar", callback_data: "menu_main" }]]
    );
    return;
  }

  clearSession(supabase, chatIdStr);

  const botMsgId = session?.data?.bot_msg_id;
  if (botMsgId) deleteMessageFire(token, chatId, botMsgId);

  const loadingMsg = await sendMessage(token, chatId, "⏳ Gerando PIX...");

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const result = await fetchJsonWithTimeout(
      `${supabaseUrl}/functions/v1/create-pix`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({
          amount: valor,
          email: user.email || "",
          name: user.nome || "",
          reseller_user_id: user.id,
        }),
      },
      12000,
    );

    if (loadingMsg) deleteMessageFire(token, chatId, loadingMsg);

    if (!result.success || !result.data) {
      await sendMessageWithKeyboard(token, chatId,
        `❌ <b>Erro ao gerar PIX</b>\n\n${result.error || "Tente novamente."}`,
        [[{ text: "🔄 Tentar Novamente", callback_data: "menu_deposito" }, { text: "📖 Menu", callback_data: "menu_main" }]]
      );
      return;
    }

    const pix = result.data;

    // Notify admin about Telegram deposit
    notifyAdminTelegramActivity(supabase, "deposit", `🤖 Depósito PIX via Telegram: R$ ${valor.toFixed(2)} — ${user.nome || user.email || "Usuário"}`, {
      amount: valor,
      user_id: user.id,
      user_nome: user.nome || null,
      user_email: user.email || null,
      status: "pending",
    }).catch(() => {});

    const buttons = [
      [{ text: "💰 Ver Saldo", callback_data: "menu_saldo" }],
      [{ text: "📖 Menu", callback_data: "menu_main" }],
    ];

    // Build fee info line
    const feeAmount = pix.fee_amount || 0;
    const netAmount = pix.net_amount ?? valor;
    const feeType = pix.fee_type || "";
    const feeValue = pix.fee_value || 0;
    let feeLine = "";
    if (feeAmount > 0) {
      const feeLabel = feeType === "percentual" && feeValue ? ` (${feeValue}%)` : "";
      feeLine = `\n💸 Taxa: <b>-R$ ${feeAmount.toFixed(2).replace(".", ",")}</b>${feeLabel}\n✅ Você receberá: <b>R$ ${netAmount.toFixed(2).replace(".", ",")}</b>`;
    }

    if (pix.qr_code) {
      const qrUrl = generateQRCodeUrl(pix.qr_code);
      let caption = `💳 <b>PIX Gerado!</b>\n\n💰 Valor: <b>R$ ${valor.toFixed(2).replace(".", ",")}</b>${feeLine}\n🏦 Pagamento via PIX\n\n`;
      caption += `📋 <b>Código Copia e Cola:</b>\n<code>${pix.qr_code}</code>\n\n`;
      if (pix.payment_link) caption += `🔗 <a href="${pix.payment_link}">Link de pagamento</a>\n\n`;
      caption += `⏱ Aguardando pagamento...`;

      const sent = await sendPhoto(token, chatId, qrUrl, caption, buttons);
      if (sent && pix.payment_id) {
        // Save message_id + chat_id in transaction metadata so webhook can delete it after payment
        await supabase.from("transactions").update({
          metadata: { ...((await supabase.from("transactions").select("metadata").eq("payment_id", pix.payment_id).maybeSingle()).data?.metadata || {}), telegram_pix_msg_id: sent, telegram_chat_id: chatId }
        }).eq("payment_id", pix.payment_id);
      }
      if (sent) return;
    }

    let msg = `💳 <b>PIX Gerado!</b>\n\n💰 Valor: <b>R$ ${valor.toFixed(2).replace(".", ",")}</b>${feeLine}\n🏦 Pagamento via PIX\n\n`;
    if (pix.qr_code) msg += `📋 <b>Copie o código PIX abaixo:</b>\n\n<code>${pix.qr_code}</code>\n\n`;
    if (pix.payment_link) msg += `🔗 <a href="${pix.payment_link}">Link de pagamento</a>\n\n`;
    msg += `⏱ Aguardando pagamento...`;

    const fallbackMsgId = await sendMessageWithKeyboard(token, chatId, msg, buttons);
    if (fallbackMsgId && pix.payment_id) {
      await supabase.from("transactions").update({
        metadata: { ...((await supabase.from("transactions").select("metadata").eq("payment_id", pix.payment_id).maybeSingle()).data?.metadata || {}), telegram_pix_msg_id: fallbackMsgId, telegram_chat_id: chatId }
      }).eq("payment_id", pix.payment_id);
    }
  } catch (err: any) {
    if (loadingMsg) deleteMessageFire(token, chatId, loadingMsg);
    console.error("Deposit error:", err);
    const errorMessage = err?.message || "Erro interno";
    await sendMessageWithKeyboard(token, chatId,
      `❌ <b>Erro ao gerar PIX</b>\n\n${errorMessage}`,
      [[{ text: "📖 Menu", callback_data: "menu_main" }]]
    );
  }
}
