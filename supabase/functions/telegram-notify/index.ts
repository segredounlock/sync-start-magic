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

// ── Receipt image generation ────────────────────────────
function buildReceiptElement(data: {
  telefone: string;
  operadora: string;
  valor: number;
  custo: number;
  novo_saldo: number;
  recarga_id?: string;
}) {
  const fmt = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;

  const row = (label: string, value: string, color = "#e0e0e0", size = 15) =>
    h("div", { style: { display: "flex", flexDirection: "column", gap: "2px" } }, [
      h("span", {
        style: { fontSize: "10px", color: "#777", letterSpacing: "1.5px", textTransform: "uppercase" as const },
      }, label),
      h("span", {
        style: { fontSize: `${size}px`, fontWeight: "700", color, fontFamily: "Inter, monospace" },
      }, value),
    ]);

  return h(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: "#0f172a",
        fontFamily: "Inter, sans-serif",
      },
    },
    [
      // Header
      h(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #10b981, #059669)",
            padding: "28px 24px 32px",
          },
        },
        [
          h("span", { style: { fontSize: "36px", marginBottom: "6px" } }, "✅"),
          h("span", {
            style: { color: "white", fontSize: "20px", fontWeight: "800", letterSpacing: "-0.5px" },
          }, "Comprovante de Recarga"),
          h("span", {
            style: { color: "rgba(255,255,255,0.65)", fontSize: "12px", marginTop: "4px" },
          }, "Recargas Brasil"),
        ]
      ),

      // Notch decoration
      h("div", {
        style: {
          display: "flex",
          alignItems: "center",
          padding: "0 4px",
          marginTop: "-1px",
          height: "24px",
          backgroundColor: "#0f172a",
        },
      }, [
        h("div", { style: { width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "#0f172a", marginLeft: "-10px" } }),
        h("div", { style: { flex: "1", borderBottom: "2px dashed #334155", margin: "0 8px" } }),
        h("div", { style: { width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "#0f172a", marginRight: "-10px" } }),
      ]),

      // Details
      h(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
            padding: "20px 28px",
            gap: "18px",
            flex: "1",
          },
        },
        [
          row("Telefone", data.telefone),
          row("Operadora", data.operadora || "—"),
          row("Valor da Recarga", fmt(data.valor), "#10b981", 24),
          h("div", { style: { display: "flex", gap: "24px" } }, [
            h("div", { style: { display: "flex", flexDirection: "column", gap: "2px", flex: "1" } }, [
              h("span", { style: { fontSize: "10px", color: "#777", letterSpacing: "1.5px", textTransform: "uppercase" as const } }, "Cobrado"),
              h("span", { style: { fontSize: "15px", fontWeight: "700", color: "#e0e0e0", fontFamily: "Inter, monospace" } }, fmt(data.custo)),
            ]),
            h("div", { style: { display: "flex", flexDirection: "column", gap: "2px", flex: "1" } }, [
              h("span", { style: { fontSize: "10px", color: "#777", letterSpacing: "1.5px", textTransform: "uppercase" as const } }, "Novo Saldo"),
              h("span", { style: { fontSize: "15px", fontWeight: "700", color: "#60a5fa", fontFamily: "Inter, monospace" } }, fmt(data.novo_saldo)),
            ]),
          ]),
        ]
      ),

      // Status badge
      h("div", {
        style: {
          display: "flex",
          justifyContent: "center",
          padding: "12px 28px 8px",
        },
      }, [
        h("span", {
          style: {
            background: "rgba(16,185,129,0.15)",
            border: "1.5px solid rgba(16,185,129,0.4)",
            borderRadius: "20px",
            padding: "8px 24px",
            fontSize: "12px",
            fontWeight: "800",
            color: "#10b981",
            letterSpacing: "0.5px",
          },
        }, "✅ Recarga Concluída"),
      ]),

      // Footer
      h("div", {
        style: {
          display: "flex",
          justifyContent: "center",
          padding: "10px 28px 16px",
          borderTop: "1px solid #1e293b",
          marginTop: "8px",
        },
      }, [
        h("span", { style: { fontSize: "10px", color: "#475569" } },
          data.recarga_id ? `ID: ${data.recarga_id.slice(0, 8).toUpperCase()}` : ""),
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
      height: 540,
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
