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

// ── Receipt image generation (mirrors RecargaReceipt.tsx design) ─
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

  // Colors matching the web dark theme
  const colors = {
    bg: "#0f172a",
    card: "#1a2332",
    border: "#2a3a4e",
    primary: "#10b981",
    primaryLight: "#059669",
    text: "#e2e8f0",
    muted: "#94a3b8",
    mutedBg: "rgba(148,163,184,0.1)",
    successBg: "rgba(16,185,129,0.1)",
    successBorder: "rgba(16,185,129,0.2)",
  };

  const iconBox = (emoji: string, isSuccess = false) =>
    h("div", {
      style: {
        display: "flex",
        width: "36px",
        height: "36px",
        borderRadius: "8px",
        backgroundColor: isSuccess ? colors.successBg : colors.mutedBg,
        alignItems: "center",
        justifyContent: "center",
        fontSize: "16px",
        flexShrink: 0,
      },
    }, emoji);

  const row = (emoji: string, label: string, value: string, opts: { isSuccess?: boolean; large?: boolean; mono?: boolean } = {}) =>
    h("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
      },
    }, [
      iconBox(emoji, opts.isSuccess),
      h("div", { style: { display: "flex", flexDirection: "column", gap: "2px", flex: "1" } }, [
        h("span", {
          style: {
            fontSize: "9px",
            color: colors.muted,
            letterSpacing: "1.5px",
            textTransform: "uppercase" as const,
            fontWeight: "500",
          },
        }, label),
        h("span", {
          style: {
            fontSize: opts.large ? "20px" : "14px",
            fontWeight: "700",
            color: opts.isSuccess ? colors.primary : colors.text,
            fontFamily: opts.mono !== false ? "Inter, monospace" : "Inter, sans-serif",
          },
        }, value),
      ]),
    ]);

  // Format date
  const dateStr = data.created_at
    ? new Date(data.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })
    : new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });

  const nowStr = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });

  return h(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: colors.card,
        fontFamily: "Inter, sans-serif",
        borderRadius: "16px",
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
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight})`,
            padding: "24px 24px 32px",
          },
        },
        [
          // Checkmark circle
          h("div", {
            style: {
              display: "flex",
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.2)",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "12px",
            },
          }, h("span", { style: { fontSize: "28px" } }, "✓")),
          h("span", {
            style: { color: "white", fontSize: "18px", fontWeight: "800", letterSpacing: "-0.3px" },
          }, "Comprovante de Recarga"),
          h("span", {
            style: { color: "rgba(255,255,255,0.7)", fontSize: "11px", marginTop: "4px" },
          }, "Recargas Brasil"),
        ]
      ),

      // Notch decoration
      h("div", {
        style: {
          display: "flex",
          alignItems: "center",
          marginTop: "-16px",
          height: "32px",
          padding: "0",
        },
      }, [
        h("div", {
          style: {
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            backgroundColor: colors.bg,
            marginLeft: "-16px",
            flexShrink: 0,
          },
        }),
        h("div", {
          style: {
            flex: "1",
            borderBottom: `2px dashed ${colors.border}`,
            margin: "0 4px",
          },
        }),
        h("div", {
          style: {
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            backgroundColor: colors.bg,
            marginRight: "-16px",
            flexShrink: 0,
          },
        }),
      ]),

      // Details
      h(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
            padding: "20px 24px",
            gap: "16px",
            flex: "1",
          },
        },
        [
          row("📱", "Telefone", data.telefone, { mono: true }),
          row("📱", "Operadora", data.operadora || "—", { mono: false }),
          row("💲", "Valor da Recarga", fmt(data.valor), { isSuccess: true, large: true }),
          row("📅", "Data e Hora", dateStr, { mono: false }),
          row("#️⃣", "ID do Pedido", data.recarga_id ? data.recarga_id.slice(0, 8).toUpperCase() : "—"),

          // Status badge
          h("div", {
            style: {
              display: "flex",
              justifyContent: "center",
              paddingTop: "8px",
            },
          }, [
            h("span", {
              style: {
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: colors.successBg,
                border: `1.5px solid ${colors.successBorder}`,
                borderRadius: "20px",
                padding: "8px 20px",
                fontSize: "12px",
                fontWeight: "800",
                color: colors.primary,
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
          padding: "12px 24px 16px",
          borderTop: `1px solid ${colors.border}`,
        },
      }, [
        h("span", { style: { fontSize: "10px", color: "rgba(148,163,184,0.6)" } },
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
      width: 400,
      height: 600,
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
async function sendTelegramMessage(token: string, chatId: string | number, text: string) {
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
  // Inline keyboard with share button
  form.append("reply_markup", JSON.stringify({
    inline_keyboard: [[
      { text: "📤 Compartilhar comprovante", switch_inline_query: caption.replace(/<[^>]*>/g, "") }
    ]]
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

    const { type, user_id, data } = await req.json();

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

    // Get user profile
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
      const caption = [
        "✅ <b>Recarga Realizada!</b>",
        "",
        `📞 Telefone: <code>${data.telefone}</code>`,
        data.operadora ? `📡 Operadora: ${data.operadora}` : "",
        `📱 Recarga: <b>${fmt(data.valor_recarga || data.valor)}</b>`,
        `💰 Cobrado: <b>${fmt(data.custo || data.valor)}</b>`,
        "",
        `💳 Novo saldo: <b>${fmt(data.novo_saldo)}</b>`,
      ].filter(Boolean).join("\n");

      // Try to generate and send receipt image
      console.log(`Generating receipt image for user telegram_id=${profile.telegram_id}`);
      const imageData = await generateReceiptPng({
        telefone: data.telefone,
        operadora: data.operadora || "—",
        valor: data.valor_recarga || data.valor,
        custo: data.custo || data.valor,
        novo_saldo: data.novo_saldo,
        recarga_id: data.recarga_id || "",
        created_at: data.created_at || "",
      });

      if (imageData) {
        console.log(`Sending receipt photo (${imageData.length} bytes)`);
        const sent = await sendTelegramPhoto(BOT_TOKEN, profile.telegram_id, imageData, caption);
        if (sent) {
          return new Response(
            JSON.stringify({ success: true, method: "photo" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        console.warn("sendPhoto failed, falling back to sendMessage");
      } else {
        console.warn("Image generation failed, falling back to sendMessage");
      }

      // Fallback: text only
      message = caption;
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

    console.log(`Sending ${type} text notification to telegram_id=${profile.telegram_id}`);
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
