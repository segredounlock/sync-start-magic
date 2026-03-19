import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find pending deposits created in the last 45 minutes
    const cutoff = new Date(Date.now() - 45 * 60 * 1000).toISOString();

    const { data: pending, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("status", "pending")
      .eq("type", "deposit")
      .gt("created_at", cutoff)
      .limit(50);

    if (error) {
      console.error("Error fetching pending transactions:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!pending || pending.length === 0) {
      return new Response(JSON.stringify({ checked: 0, confirmed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Load system config for gateway keys
    const { data: configRows } = await supabase
      .from("system_config")
      .select("key, value");
    const config: Record<string, string> = {};
    configRows?.forEach((r: { key: string; value: string | null }) => {
      config[r.key] = r.value || "";
    });

    let confirmed = 0;
    let checked = 0;

    for (const tx of pending) {
      const meta = (tx.metadata as Record<string, unknown>) || {};
      const gateway = (meta.gateway as string) || "";

      // ===== PIXGO =====
      if (gateway === "pixgo") {
        const apiKey =
          (meta.reseller_pixGoApiKey as string) || config.pixGoApiKey;
        if (!apiKey) continue;

        checked++;
        try {
          const paymentId = tx.payment_id;
          const resp = await fetch(
            `https://pixgo.org/api/v1/payment/${paymentId}`,
            {
              headers: {
                Authorization: `Bearer ${apiKey}`,
                Accept: "application/json",
              },
            }
          );

          if (!resp.ok) {
            console.warn(
              `PixGo check ${paymentId}: HTTP ${resp.status}`
            );
            continue;
          }

          const data = await resp.json();
          const pixStatus =
            data.data?.status || data.status || "";

          if (
            pixStatus === "completed" ||
            pixStatus === "paid" ||
            pixStatus === "approved"
          ) {
            console.log(
              `PixGo payment ${paymentId} confirmed! Crediting user ${tx.user_id}`
            );

            // Resolve fee per user (reseller-specific → global fallback)
            const { data: feeRows } = await supabase.rpc("get_deposit_fee_for_user", { _user_id: tx.user_id });
            const taxaTipo = feeRows?.[0]?.fee_type || "fixo";
            const taxaValor = Number(feeRows?.[0]?.fee_value) || 0;
            let fee = 0;
            if (taxaValor > 0) {
              fee =
                taxaTipo === "percentual"
                  ? Number(tx.amount) * (taxaValor / 100)
                  : taxaValor;
              fee = Math.round(fee * 100) / 100;
            }
            const creditAmount = Math.max(0, Number(tx.amount) - fee);

            // Collect payer info from PixGo response
            const payerInfo: Record<string, unknown> = {
              payer_name: data.data?.payer_name || null,
              payer_document: data.data?.payer_cpf || null,
              end_to_end_id: data.data?.end_to_end_id || null,
              confirmed_at: new Date().toISOString(),
              confirmed_by: "check-pending-pix",
            };
            if (fee > 0) {
              payerInfo.fee_applied = fee;
              payerInfo.fee_type = taxaTipo;
              payerInfo.fee_rate = taxaValor;
              payerInfo.credited_amount = creditAmount;
            }

            const updatedMeta = { ...meta, ...payerInfo };

            // Atomically claim the transaction (prevents double-processing)
            const { data: claimed } = await supabase.rpc("claim_transaction", {
              p_tx_id: tx.id,
              p_from_status: "pending",
              p_to_status: "completed",
              p_metadata: updatedMeta,
            });

            if (!claimed) {
              console.log(`Transaction ${tx.id} already processed by webhook, skipping`);
              continue;
            }

            // Credit balance atomically
            // ALWAYS credit to "revenda" — never allow override
            const saldoTipo = "revenda";

            const { data: newBalance } = await supabase.rpc("increment_saldo", {
              p_user_id: tx.user_id,
              p_tipo: saldoTipo,
              p_amount: creditAmount,
            });

            console.log(
              `Balance updated atomically (${saldoTipo}): +${creditAmount} = ${newBalance} for user ${tx.user_id} (fee: R$${fee.toFixed(2)})`
            );

            // ===== TELEGRAM NOTIFICATION =====
            try {
              const botToken = config.telegramBotToken?.trim();
              const { data: profile } = await supabase
                .from("profiles")
                .select("telegram_id, nome")
                .eq("id", tx.user_id)
                .maybeSingle();

              if (botToken && profile?.telegram_id) {
                const chatIdTg = Number(profile.telegram_id);

                // Delete original PIX QR message if available
                const pixMsgId = updatedMeta.telegram_pix_msg_id;
                const pixChatId =
                  updatedMeta.telegram_chat_id || chatIdTg;
                if (pixMsgId) {
                  try {
                    await fetch(
                      `https://api.telegram.org/bot${botToken}/deleteMessage`,
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          chat_id: Number(pixChatId),
                          message_id: Number(pixMsgId),
                        }),
                      }
                    );
                  } catch {}
                }

                const nome = profile.nome || "Usuário";
                const valorFmt = Number(tx.amount)
                  .toFixed(2)
                  .replace(".", ",");
                const saldoFmt = Number(newBalance || 0)
                  .toFixed(2)
                  .replace(".", ",");
                const feeNote =
                  fee > 0
                    ? `\n💸 Taxa: <b>R$ ${fee.toFixed(2).replace(".", ",")}</b>\n💵 Creditado: <b>R$ ${creditAmount.toFixed(2).replace(".", ",")}</b>`
                    : "";
                const msg = `✅ <b>Pagamento Confirmado!</b>\n\n💰 Valor: <b>R$ ${valorFmt}</b>${feeNote}\n💳 Novo saldo: <b>R$ ${saldoFmt}</b>\n👤 ${nome}\n\n🎉 Saldo creditado com sucesso!`;

                const tgResp = await fetch(
                  `https://api.telegram.org/bot${botToken}/sendMessage`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      chat_id: chatIdTg,
                      text: msg,
                      parse_mode: "HTML",
                      reply_markup: {
                        inline_keyboard: [
                          [
                            {
                              text: "💰 Ver Saldo",
                              callback_data: "menu_saldo",
                            },
                            {
                              text: "📱 Fazer Recarga",
                              callback_data: "menu_recarga",
                            },
                          ],
                          [
                            {
                              text: "📖 Menu",
                              callback_data: "menu_main",
                            },
                          ],
                        ],
                      },
                    }),
                  }
                );
                const tgResult = await tgResp.json();
                if (tgResult?.ok) {
                  await supabase
                    .from("transactions")
                    .update({ telegram_notified: true })
                    .eq("id", tx.id);
                }
              }
            } catch (notifyErr) {
              console.warn("Telegram notification error:", notifyErr);
            }

            // ===== PUSH NOTIFICATION =====
            try {
              const baseUrl = Deno.env.get("SUPABASE_URL")!;
              const serviceKey =
                Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
              fetch(`${baseUrl}/functions/v1/send-push`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${serviceKey}`,
                },
                body: JSON.stringify({
                  title: "✅ Depósito Confirmado",
                  body: `Depósito de R$ ${Number(tx.amount).toFixed(2).replace(".", ",")} confirmado! Saldo atualizado.`,
                  user_ids: [tx.user_id],
                }),
              }).catch(() => {});
            } catch {}

            confirmed++;
          } else if (
            pixStatus === "expired" ||
            pixStatus === "cancelled" ||
            pixStatus === "canceled"
          ) {
            // Mark as expired
            await supabase
              .from("transactions")
              .update({
                status: "expired",
                updated_at: new Date().toISOString(),
                metadata: {
                  ...meta,
                  expired_by: "check-pending-pix",
                  expired_at: new Date().toISOString(),
                },
              })
              .eq("id", tx.id);
            console.log(
              `PixGo payment ${paymentId} expired/cancelled, marked as expired`
            );
          }
        } catch (err) {
          console.error(`Error checking PixGo payment ${tx.payment_id}:`, err);
        }
      }

      // ===== MERCADO PAGO =====
      if (gateway === "mercadopago") {
        const modo = config.mercadoPagoModo || "prod";
        const token =
          modo === "test"
            ? config.mercadoPagoKeyTest
            : config.mercadoPagoKeyProd;
        if (!token) continue;

        checked++;
        try {
          const resp = await fetch(
            `https://api.mercadopago.com/v1/payments/${tx.payment_id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (!resp.ok) continue;

          const data = await resp.json();
          if (data.status === "approved") {
            // Trigger webhook processing by calling pix-webhook
            const baseUrl = Deno.env.get("SUPABASE_URL")!;
            const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
            await fetch(
              `${baseUrl}/functions/v1/pix-webhook?gateway=mercadopago`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${serviceKey}`,
                },
                body: JSON.stringify({
                  type: "payment",
                  action: "payment.updated",
                  data: { id: tx.payment_id },
                }),
              }
            );
            confirmed++;
          }
        } catch (err) {
          console.warn(`Error checking MP payment ${tx.payment_id}:`, err);
        }
      }
    }

    // ===== DELAY NOTIFICATION SYSTEM =====
    let delayNotified = 0;
    try {
      // Read configurable threshold (default 5 min)
      const thresholdMin = Number(config.pixDelayThresholdMinutes) || 5;
      const supportLink = config.supportGroupLink || "";

      const delayCutoff = new Date(Date.now() - thresholdMin * 60 * 1000).toISOString();

      // Find pending deposits older than threshold that haven't been notified
      const { data: delayedTxs } = await supabase
        .from("transactions")
        .select("id, user_id, amount, created_at, payment_id, metadata")
        .eq("status", "pending")
        .eq("type", "deposit")
        .eq("delay_notified", false)
        .lt("created_at", delayCutoff)
        .gt("created_at", cutoff) // still within the 45min window
        .limit(20);

      if (delayedTxs && delayedTxs.length > 0) {
        const botToken = config.telegramBotToken?.trim();

        for (const dtx of delayedTxs) {
          try {
            const valorFmt = Number(dtx.amount).toFixed(2).replace(".", ",");
            const createdAt = new Date(dtx.created_at);
            const minutesWaiting = Math.floor((Date.now() - createdAt.getTime()) / 60000);

            // Get user profile for Telegram notification
            const { data: profile } = await supabase
              .from("profiles")
              .select("telegram_id, nome")
              .eq("id", dtx.user_id)
              .maybeSingle();

            const nome = profile?.nome || "Usuário";
            const supportNote = supportLink
              ? `\n\n📢 Grupo de Suporte: ${supportLink}`
              : "\n\n💬 Se precisar de ajuda, entre em contato com o suporte.";

            const delayMsg =
              `⏳ <b>Processando seu PIX...</b>\n\n` +
              `Olá ${nome}! Seu pagamento de <b>R$ ${valorFmt}</b> foi identificado ` +
              `e está sendo processado pelo nosso sistema.\n\n` +
              `⏱ Aguardando há <b>${minutesWaiting} minutos</b>\n` +
              `✅ Seu saldo será creditado automaticamente\n\n` +
              `Em momentos de alta demanda, pode haver um pequeno atraso na confirmação. ` +
              `Caso demore mais que 30 minutos, entre em contato com nosso suporte.` +
              supportNote;

            // Send Telegram notification
            if (botToken && profile?.telegram_id) {
              try {
                await fetch(
                  `https://api.telegram.org/bot${botToken}/sendMessage`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      chat_id: Number(profile.telegram_id),
                      text: delayMsg,
                      parse_mode: "HTML",
                    }),
                  }
                );
              } catch (tgErr) {
                console.warn(`Delay TG notify error for ${dtx.id}:`, tgErr);
              }
            }

            // Send Push notification
            try {
              const baseUrl = Deno.env.get("SUPABASE_URL")!;
              const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
              fetch(`${baseUrl}/functions/v1/send-push`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${serviceKey}`,
                },
                body: JSON.stringify({
                  title: "⏳ Processando seu PIX...",
                  body: `Seu pagamento de R$ ${valorFmt} está sendo processado. Aguarde a confirmação automática.`,
                  user_ids: [dtx.user_id],
                }),
              }).catch(() => {});
            } catch {}

            // Mark as notified
            await supabase
              .from("transactions")
              .update({ delay_notified: true })
              .eq("id", dtx.id);

            delayNotified++;
            console.log(
              `Delay notification sent for tx ${dtx.id} (user ${dtx.user_id}, waiting ${minutesWaiting}min)`
            );
          } catch (dtxErr) {
            console.warn(`Error processing delay notification for ${dtx.id}:`, dtxErr);
          }
        }
      }
    } catch (delayErr) {
      console.warn("Delay notification system error:", delayErr);
    }

    console.log(
      `check-pending-pix: checked=${checked}, confirmed=${confirmed}, delay_notified=${delayNotified}, total_pending=${pending.length}`
    );

    return new Response(
      JSON.stringify({
        success: true,
        checked,
        confirmed,
        delay_notified: delayNotified,
        total_pending: pending.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("check-pending-pix error:", err);
    return new Response(JSON.stringify({ error: "internal" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
