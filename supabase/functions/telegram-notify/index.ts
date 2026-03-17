import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import React from "https://esm.sh/react@18.2.0";
import { ImageResponse } from "https://deno.land/x/og_edge/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TELEGRAM_API = "https://api.telegram.org/bot";
const h = React.createElement;

// ── Font cache ──────────────────────────────────────────
let cachedFont: ArrayBuffer | null = null;
async function getFont(): Promise<ArrayBuffer> {
  if (cachedFont) return cachedFont;
  const resp = await fetch(
    "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZg.ttf"
  );
  cachedFont = await resp.arrayBuffer();
  return cachedFont;
}

// ── Receipt image generation (HD – mirrors RecargaReceipt.tsx) ──
function buildReceiptElement(data: {
  telefone: string;
  operadora: string;
  valor: number;
  custo: number;
  novo_saldo: number;
  recarga_id?: string;
  created_at?: string;
}) {
  const fmt = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;

  const c = {
    bg: "#0f172a",
    card: "#1a2332",
    border: "#2a3a4e",
    primary: "#10b981",
    primaryLight: "#059669",
    text: "#e2e8f0",
    muted: "#94a3b8",
    mutedBg: "rgba(148,163,184,0.12)",
    successBg: "rgba(16,185,129,0.12)",
    successBorder: "rgba(16,185,129,0.25)",
  };

  const iconBox = (emoji: string, isSuccess = false) =>
    h("div", {
      style: {
        display: "flex",
        width: "72px",
        height: "72px",
        borderRadius: "16px",
        backgroundColor: isSuccess ? c.successBg : c.mutedBg,
        alignItems: "center",
        justifyContent: "center",
        fontSize: "32px",
        flexShrink: 0,
      },
    }, emoji);

  const row = (emoji: string, label: string, value: string, opts: { isSuccess?: boolean; large?: boolean; mono?: boolean } = {}) =>
    h("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: "24px",
      },
    }, [
      iconBox(emoji, opts.isSuccess),
      h("div", { style: { display: "flex", flexDirection: "column", gap: "4px", flex: "1" } }, [
        h("span", {
          style: {
            fontSize: "18px",
            color: c.muted,
            letterSpacing: "3px",
            textTransform: "uppercase" as const,
            fontWeight: "500",
          },
        }, label),
        h("span", {
          style: {
            fontSize: opts.large ? "40px" : "28px",
            fontWeight: "700",
            color: opts.isSuccess ? c.primary : c.text,
            fontFamily: opts.mono !== false ? "Inter, monospace" : "Inter, sans-serif",
          },
        }, value),
      ]),
    ]);

  const dateFmtOpts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "America/Sao_Paulo" };
  const dateStr = data.created_at && data.created_at.length > 0
    ? new Date(data.created_at).toLocaleDateString("pt-BR", dateFmtOpts)
    : new Date().toLocaleDateString("pt-BR", dateFmtOpts);

  const nowStr = new Date().toLocaleDateString("pt-BR", dateFmtOpts);

  return h(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: c.card,
        fontFamily: "Inter, sans-serif",
        borderRadius: "32px",
        overflow: "hidden",
      },
    },
    [
      // Header gradient
      h(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: `linear-gradient(135deg, ${c.primary}, ${c.primaryLight})`,
            padding: "48px 48px 64px",
          },
        },
        [
          h("div", {
            style: {
              display: "flex",
              width: "112px",
              height: "112px",
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.2)",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "24px",
            },
          }, h("span", { style: { fontSize: "56px", color: "white" } }, "✓")),
          h("span", {
            style: { color: "white", fontSize: "36px", fontWeight: "800", letterSpacing: "-0.5px" },
          }, "Comprovante de Recarga"),
        ]
      ),

      // Notch decoration
      h("div", {
        style: {
          display: "flex",
          alignItems: "center",
          marginTop: "-32px",
          height: "64px",
        },
      }, [
        h("div", {
          style: { width: "64px", height: "64px", borderRadius: "50%", backgroundColor: c.bg, marginLeft: "-32px", flexShrink: 0 },
        }),
        h("div", {
          style: { flex: "1", borderBottom: `3px dashed ${c.border}`, margin: "0 8px" },
        }),
        h("div", {
          style: { width: "64px", height: "64px", borderRadius: "50%", backgroundColor: c.bg, marginRight: "-32px", flexShrink: 0 },
        }),
      ]),

      // Details
      h(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
            padding: "40px 48px",
            gap: "32px",
            flex: "1",
          },
        },
        [
          row("📱", "Telefone", data.telefone, { mono: true }),
          row("📱", "Operadora", (data.operadora || "—").toUpperCase(), { mono: false }),
          row("💲", "Valor da Recarga", fmt(data.valor), { isSuccess: true, large: true }),
          row("📅", "Data e Hora", dateStr, { mono: false }),
          row("#️⃣", "ID do Pedido", data.recarga_id ? data.recarga_id.slice(0, 8).toUpperCase() : "—"),

          // Status badge
          h("div", {
            style: { display: "flex", justifyContent: "center", paddingTop: "16px" },
          }, [
            h("span", {
              style: {
                display: "flex",
                alignItems: "center",
                gap: "12px",
                background: c.successBg,
                border: `3px solid ${c.successBorder}`,
                borderRadius: "40px",
                padding: "16px 40px",
                fontSize: "24px",
                fontWeight: "800",
                color: c.primary,
              },
            }, "✅ Recarga Concluída"),
          ]),
        ]
      ),

      // Footer
      h("div", {
        style: {
          display: "flex",
          justifyContent: "center",
          padding: "24px 48px 32px",
          borderTop: `2px solid ${c.border}`,
        },
      }, [
        h("span", { style: { fontSize: "20px", color: "rgba(148,163,184,0.6)" } },
          `Comprovante gerado em ${nowStr}`),
      ]),
    ]
  );
}

async function generateReceiptPng(data: any): Promise<Uint8Array | null> {
  try {
    const font = await getFont();
    const element = buildReceiptElement(data);

    const response = new ImageResponse(element, {
      width: 800,
      height: 1200,
      fonts: [
        { name: "Inter", data: font, style: "normal" as const, weight: 700 },
      ],
    });

    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
  } catch (e) {
    console.error("Receipt image generation failed:", e);
    return null;
  }
}

// ── Telegram helpers ────────────────────────────────────
async function sendTelegramMessage(token: string, chatId: string | number, text: string, opts?: { message_effect_id?: string; reply_markup?: any }) {
  const body: any = { chat_id: chatId, text, parse_mode: "HTML" };
  if (opts?.message_effect_id) body.message_effect_id = opts.message_effect_id;
  if (opts?.reply_markup) body.reply_markup = opts.reply_markup;
  const resp = await fetch(`${TELEGRAM_API}${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const errBody = await resp.text();
    console.error(`Telegram sendMessage failed [${resp.status}]:`, errBody);
  }
  return resp.ok;
}

async function sendTelegramPhoto(
  token: string,
  chatId: string | number,
  imageData: Uint8Array,
  caption: string
): Promise<boolean> {
  const form = new FormData();
  form.append("chat_id", String(chatId));
  form.append("photo", new Blob([imageData], { type: "image/png" }), "comprovante.png");
  form.append("caption", caption);
  form.append("parse_mode", "HTML");
  // Share button — opens Telegram's native share/forward picker
  const shareText = caption.replace(/<[^>]*>/g, "");
  form.append("reply_markup", JSON.stringify({
    inline_keyboard: [
      [
        { text: "📋 Copiar texto", copy_text: { text: shareText } },
        { text: "📤 Compartilhar", url: `https://t.me/share/url?url=&text=${encodeURIComponent(shareText)}` }
      ]
    ]
  }));
  const resp = await fetch(`${TELEGRAM_API}${token}/sendPhoto`, {
    method: "POST",
    body: form,
  });
  if (!resp.ok) {
    const errBody = await resp.text();
    console.error(`Telegram sendPhoto failed [${resp.status}]:`, errBody);
  }
  return resp.ok;
}

// ── Main handler ────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const body = await req.json();
    const { type, user_id, telegram_id: direct_telegram_id, data, chat_id: direct_chat_id, message: direct_message, message_effect_id: direct_effect_id } = body;

    // Resolve bot token
    const { data: tokenRow } = await supabase
      .from("system_config")
      .select("value")
      .eq("key", "telegramBotToken")
      .single();

    const BOT_TOKEN = tokenRow?.value || Deno.env.get("TELEGRAM_BOT_TOKEN");
    if (!BOT_TOKEN) {
      console.error("No Telegram bot token found");
      return new Response(
        JSON.stringify({ success: false, reason: "no_bot_token" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Support direct telegram_id or lookup from user profile
    let targetTelegramId = direct_telegram_id || null;
    let profileName = "";

    if (!targetTelegramId && user_id) {
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
      targetTelegramId = profile.telegram_id;
      profileName = profile.nome || "";
    }

    if (!targetTelegramId) {
      return new Response(
        JSON.stringify({ success: false, reason: "no_telegram_id" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let message = "";
    const fmt = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;

    if (type === "recarga_completed") {
      const caption = [
        "✅ <b>Recarga Realizada!</b>",
        "",
        `📞 Telefone: <code>${data.telefone}</code>`,
        data.operadora ? `📡 Operadora: ${data.operadora.toUpperCase()}` : "",
        `📱 Valor: <b>${fmt(data.valor_recarga || data.valor)}</b>`,
      ].filter(Boolean).join("\n");

      // Priority 1: Use pre-generated image from storage (same as website receipt)
      if (data.image_url) {
        console.log(`Downloading receipt image from storage: ${data.image_url}`);
        try {
          const imgResp = await fetch(data.image_url);
          if (imgResp.ok) {
            const imageData = new Uint8Array(await imgResp.arrayBuffer());
            console.log(`Sending stored receipt photo (${imageData.length} bytes)`);
            const sent = await sendTelegramPhoto(BOT_TOKEN, targetTelegramId, imageData, caption);
            if (sent) {
              return new Response(
                JSON.stringify({ success: true, method: "photo_stored" }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
              );
            }
            console.warn("sendPhoto with stored image failed, trying Satori fallback");
          }
        } catch (e) {
          console.warn("Failed to fetch stored image:", e);
        }
      }

      // Priority 2: Generate image with Satori (fallback)
      console.log(`Generating receipt image for user telegram_id=${targetTelegramId}`);
      const imageData = await generateReceiptPng({
        telefone: data.telefone,
        operadora: (data.operadora || "—").toUpperCase(),
        valor: data.valor_recarga || data.valor,
        custo: data.custo || data.valor,
        novo_saldo: data.novo_saldo,
        recarga_id: data.recarga_id || "",
        created_at: data.created_at || "",
      });

      if (imageData) {
        console.log(`Sending Satori receipt photo (${imageData.length} bytes)`);
        const sent = await sendTelegramPhoto(BOT_TOKEN, targetTelegramId, imageData, caption);
        if (sent) {
          return new Response(
            JSON.stringify({ success: true, method: "photo_satori" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        console.warn("sendPhoto failed, falling back to sendMessage");
      } else {
        console.warn("Image generation failed, falling back to sendMessage");
      }

      // Fallback: text only
      message = caption;
    } else if (type === "recarga_failed") {
      message = [
        "❌ <b>Recarga Falhou!</b>",
        "",
        `📞 Telefone: <code>${data.telefone}</code>`,
        data.operadora ? `📡 Operadora: ${data.operadora.toUpperCase()}` : "",
        `📱 Valor: <b>${fmt(data.valor_recarga || data.valor)}</b>`,
        "",
        "💰 <b>Saldo estornado automaticamente</b>",
        `💳 Novo saldo: <b>${fmt(data.novo_saldo)}</b>`,
        "",
        "📱 Tente novamente com /recarga",
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
    } else if (type === "custom_message") {
      message = data.message || "Mensagem do sistema";
    } else if (type === "saque_approved") {
      message = [
        "✅ <b>Saque Aprovado!</b>",
        "",
        `💰 Valor: <b>${fmt(data.amount)}</b>`,
        "",
        "⏳ Seu saque foi aprovado e será processado em breve.",
        "Você receberá uma notificação quando o pagamento for efetuado.",
      ].join("\n");
    } else if (type === "saque_completed") {
      message = [
        "🎉 <b>Saque Pago!</b>",
        "",
        `💰 Valor: <b>${fmt(data.amount)}</b>`,
        data.pix_key ? `🔑 Chave PIX: <code>${data.pix_key}</code>` : "",
        "",
        "✅ O valor foi enviado para sua conta PIX.",
        "Confira seu extrato bancário!",
      ].filter(Boolean).join("\n");
    } else if (type === "saque_rejected") {
      message = [
        "❌ <b>Saque Rejeitado</b>",
        "",
        `💰 Valor: <b>${fmt(data.amount)}</b>`,
        "",
        "💳 <b>Saldo estornado automaticamente</b>",
        "Entre em contato com o suporte para mais informações.",
      ].join("\n");
    } else if (type === "admin_alert") {
      message = data.message || "⚠️ Alerta do sistema";
    } else {
      return new Response(
        JSON.stringify({ success: false, reason: "unknown_type" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Sending ${type} text notification to telegram_id=${targetTelegramId}`);
    const sent = await sendTelegramMessage(BOT_TOKEN, targetTelegramId, message);

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
