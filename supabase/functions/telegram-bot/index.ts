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
    url: map["migration_old_site_url"] || "https://recargasbrasill.com",
  };
  migrationCache = { ...result, time: Date.now() };
  return result;
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
  return result.data.map((c: any) => ({
    operator: c.operator,
    carrierId: c.operator,
    name: c.operator,
    values: (c.values || []).map((v: any) => ({
      valueId: `${c.operator}_${v.amount}`,
      value: v.amount,
      amount: v.amount,
      cost: v.cost,
      label: `R$ ${v.amount}`,
    })),
  }));
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

        if (!message?.text) return;

        const chatId = message.chat.id;
        const text = message.text.trim();
        const telegramId = String(message.from.id);
        const telegramUsername = message.from.username || "";
        const chatIdStr = String(chatId);

        // Parallel: find user + session + register telegram_user
        const [linkedUser, session] = await Promise.all([
          findUserByTelegram(supabase, telegramId),
          getSession(supabase, chatIdStr),
          ensureTelegramUser(supabase, message.from.id, message.from.first_name, telegramUsername),
        ]);

          if (text === "/start" || text === "/menu" || text === "/vincular") {
          if (linkedUser) {
            // Send menu first for snappy UX, then send pending notifications in background
            await sendMainMenu(BOT_TOKEN, chatId, linkedUser, supabase);
            sendPendingNotifications(supabase, BOT_TOKEN, chatId, linkedUser.id).catch((e) =>
              console.error("[PENDING] Background send failed:", e)
            );
          } else {
            // Check migration config
            const migration = await getMigrationConfig(supabase);
            if (migration.enabled) {
              await sendMessageWithKeyboard(BOT_TOKEN, chatId,
                `👋 Bem-vindo ao <b>Recargas Brasil</b>!\n\n⚠️ <b>Aviso de Migração</b>\n\nEstamos migrando para um novo sistema! Se você possui créditos no site antigo, pode acessá-lo para utilizá-los.\n\nCaso contrário, prossiga para vincular sua conta ao novo bot.`,
                [
                  [{ text: "🔄 Usar créditos do site antigo", web_app: { url: migration.url } }],
                  [{ text: "▶️ Continuar para o bot", callback_data: "migration_continue" }],
                ]
              );
            } else {
              await setSession(supabase, chatIdStr, "awaiting_email", { telegram_id: telegramId, telegram_username: telegramUsername, msg_ids: [] });
              const botMsgId = await sendMessage(BOT_TOKEN, chatId,
                `👋 Bem-vindo ao <b>Recargas Brasil</b>!\n\nVamos vincular sua conta.\n\n📧 Por favor, digite seu <b>e-mail</b>:`
              );
              if (botMsgId) {
                await setSession(supabase, chatIdStr, "awaiting_email", { telegram_id: telegramId, telegram_username: telegramUsername, msg_ids: [botMsgId] });
              }
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

        // Linked user session flows (only if NOT a command)
        if (!isCommand && session?.step === "awaiting_deposit_amount") {
          await handleDepositAmount(supabase, BOT_TOKEN, chatId, chatIdStr, linkedUser, text, session, message.message_id);
          return;
        }

        if (!isCommand && session?.step === "awaiting_recarga_phone") {
          await handleRecargaPhone(supabase, BOT_TOKEN, chatId, chatIdStr, linkedUser, text, session, message.message_id);
          return;
        }

        if (text === "/saldo") {
          await handleSaldo(supabase, BOT_TOKEN, chatId, linkedUser);
        } else if (text === "/recargas" || text === "/historico") {
          await handleRecargas(supabase, BOT_TOKEN, chatId, linkedUser);
        } else if (text === "/recarga" || text.startsWith("/recarga ")) {
          await handleRecarga(supabase, BOT_TOKEN, chatId, linkedUser, text);
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
        } else if (text === "/ajuda" || text === "/help") {
          await handleAjuda(BOT_TOKEN, chatId);
        } else {
          const quickMatch = text.match(/^(\d{10,11})\s+([\d.,]+)$/);
          if (quickMatch) {
            await executeRecarga(supabase, BOT_TOKEN, chatId, linkedUser, quickMatch[1], quickMatch[2]);
          } else {
            await handleAjuda(BOT_TOKEN, chatId);
          }
        }
      } catch (err) {
        console.error(`[ERROR] processUpdate:`, err);
      }
    })();

    // Return 200 immediately to Telegram, but keep processing alive
    // Deno Deploy keeps the isolate alive while promises are pending
    (globalThis as any).__processPromise = processPromise;

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

async function handleRecarga(supabase: any, token: string, chatId: number, user: any, text: string) {
  const parts = text.replace("/recarga", "").trim().split(/\s+/);
  if (parts.length < 2 || !parts[0]) {
    await sendMessageWithKeyboard(token, chatId,
      "📱 <b>Como fazer recarga:</b>\n\nEnvie: <code>TELEFONE VALOR</code>\n\nExemplo: <code>11999998888 20</code>",
      [[{ text: "📖 Menu", callback_data: "menu_main" }]]
    );
    return;
  }
  await executeRecarga(supabase, token, chatId, user, parts[0], parts[1]);
}

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
  const { data: roleData } = await supabase.from("user_roles").select("role").eq("user_id", user.id).maybeSingle();
  const userRole = roleData?.role || "cliente";

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

  // Calculate user cost
  const rule = pricingRules.find((r: any) => Number(r.valor_recarga) === valor);
  let userCost: number;
  if (rule) {
    userCost = rule.tipo_regra === "fixo" ? (Number(rule.regra_valor) > 0 ? Number(rule.regra_valor) : Number(rule.custo)) : Number(rule.custo) * (1 + Number(rule.regra_valor) / 100);
  } else {
    userCost = matchedValue.cost || valor;
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

  let webAppUrl = "https://recargasbrasill.com/miniapp";
  const [migrationConfig, em, webAppConfig, btnConfigs] = await Promise.all([
    getMigrationConfig(supabase),
    getSeasonalEmojis(supabase),
    supabase.from("system_config").select("value").eq("key", "webAppUrl").maybeSingle(),
    supabase.from("system_config").select("key, value").like("key", "bot_btn_%"),
  ]);
  const migrationSiteUrl = migrationConfig.url || "https://recargasbrasill.com";
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
    if (btnMap.bot_btn_webapp) row3.push({ text: `${se(em, "webapp")} Abrir Web App`, web_app: { url: webAppUrl } });
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
    await handleAjuda(token, chatId);
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
    const { data: roleData } = await supabase
      .from("user_roles").select("role").eq("user_id", user.id).maybeSingle();
    const userRole = roleData?.role || "cliente";

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

    function getUserCost(apiCost: number, faceValue: number): number {
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

    // Check gateway in parallel
    const [resellerCfg, globalCfg] = await Promise.all([
      supabase.from("reseller_config").select("key, value").eq("user_id", user.id).eq("key", "paymentModule").maybeSingle(),
      supabase.from("system_config").select("value").eq("key", "paymentModule").maybeSingle(),
    ]);

    const hasGateway = !!resellerCfg?.data?.value || !!globalCfg?.data?.value;

    if (!hasGateway) {
      await editMessageWithKeyboard(token, chatId, msgId,
        "⚠️ <b>Gateway não configurada</b>\n\nNenhuma gateway de pagamento foi configurada.\n\nAcesse o painel web e vá em <b>Gateway de Pagamento</b> para configurar sua gateway antes de gerar PIX.",
        [[{ text: "📖 Voltar ao Menu", callback_data: "menu_main" }]]
      );
      return;
    }

    await setSession(supabase, String(chatId), "awaiting_deposit_amount", { user_id: user.id, bot_msg_id: msgId });
    await editMessageWithKeyboard(token, chatId, msgId,
      "💳 <b>Depósito PIX</b>\n\n💰 Valor mínimo: <b>R$ 10,00</b>\n\nEscolha um valor ou digite manualmente:",
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
  let webAppUrl = "https://recargasbrasill.com/miniapp";
  let migrationSiteUrl = "https://recargasbrasill.com";
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
  if (btnMap.bot_btn_webapp) row3.push({ text: `${se(em, "webapp")} Abrir Web App`, web_app: { url: webAppUrl } });
  if (row3.length) keyboard.push(row3);
  if (btnMap.bot_btn_migration && migrationEnabled) {
    keyboard.push([{ text: `${se(em, "migration")} Usar Saldo Antigo`, web_app: { url: migrationSiteUrl } }]);
  }
  if (btnMap.bot_btn_ajuda) {
    keyboard.push([{ text: "❓ Ajuda / Suporte", callback_data: "menu_ajuda" }]);
  }

  await sendMessageWithKeyboard(token, chatId,
    `👋 Olá, <b>${user.nome || user.email}</b>!\n💰 Saldo: <b>R$ ${saldoFmt}</b>\n\nEscolha uma opção:`,
    keyboard
  );
}

async function handleAjuda(token: string, chatId: number) {
  await sendMessageWithKeyboard(token, chatId,
    `❓ <b>Menu de Ajuda</b>\n\n<b>Atalho:</b> envie <code>telefone valor</code> diretamente!\n<b>Depósito:</b> /deposito`,
    [[
      { text: "💰 Ver Saldo", callback_data: "menu_saldo" },
      { text: "📱 Fazer Recarga", callback_data: "menu_recarga" },
    ], [
      { text: "📋 Histórico", callback_data: "menu_recargas" },
      { text: "💳 Depositar PIX", callback_data: "menu_deposito" },
    ], [
      { text: "📖 Menu", callback_data: "menu_main" },
    ]]
  );
}

// ===== DEPOSIT HANDLER =====

async function handleDepositAmount(supabase: any, token: string, chatId: number, chatIdStr: string, user: any, text: string, session: any, userMsgId: number) {
  deleteMessageFire(token, chatId, userMsgId);

  const valor = parseFloat(text.replace(",", "."));
  if (isNaN(valor) || valor < 10 || valor > 10000) {
    await sendMessage(token, chatId, "❌ Valor inválido. O valor mínimo é <b>R$ 10,00</b> e o máximo é R$ 10.000,00.\n\nDigite um valor válido:");
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
    const buttons = [
      [{ text: "💰 Ver Saldo", callback_data: "menu_saldo" }],
      [{ text: "📖 Menu", callback_data: "menu_main" }],
    ];

    if (pix.qr_code) {
      const qrUrl = generateQRCodeUrl(pix.qr_code);
      let caption = `💳 <b>PIX Gerado!</b>\n\n💰 Valor: <b>R$ ${valor.toFixed(2).replace(".", ",")}</b>\n🏦 Pagamento via PIX\n\n`;
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

    let msg = `💳 <b>PIX Gerado!</b>\n\n💰 Valor: <b>R$ ${valor.toFixed(2).replace(".", ",")}</b>\n🏦 Pagamento via PIX\n\n`;
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
