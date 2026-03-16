import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

    const url = new URL(req.url);
    const gateway = url.searchParams.get("gateway") || "auto";

    let body: Record<string, unknown>;
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      body = await req.json();
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const text = await req.text();
      body = Object.fromEntries(new URLSearchParams(text));
    } else {
      body = await req.json().catch(() => ({}));
    }

    console.log(`PIX webhook received (gateway=${gateway}):`, JSON.stringify(body).substring(0, 500));

    let paymentId: string | null = null;
    let status: string | null = null;
    let detectedGateway = gateway;
    let payerInfo: Record<string, unknown> = {};

    // ===== MERCADO PAGO =====
    // MP sends notifications to notification_url
    // We need to fetch the payment to check status
    if (gateway === "mercadopago" || body.type === "payment" || body.action === "payment.updated") {
      detectedGateway = "mercadopago";
      const mpPaymentId = body.data && typeof body.data === "object" && "id" in body.data
        ? String((body.data as Record<string, unknown>).id)
        : null;

      if (mpPaymentId) {
        // Load config to get token
        const { data: configRows } = await supabase.from("system_config").select("key, value");
        const config: Record<string, string> = {};
        configRows?.forEach((r: { key: string; value: string | null }) => {
          config[r.key] = r.value || "";
        });

        const modo = config.mercadoPagoModo || "prod";
        const token = modo === "test" ? config.mercadoPagoKeyTest : config.mercadoPagoKeyProd;

        if (token) {
          const resp = await fetch(`https://api.mercadopago.com/v1/payments/${mpPaymentId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (resp.ok) {
            const paymentData = await resp.json();
            paymentId = String(paymentData.id);
            status = paymentData.status === "approved" ? "paid" : paymentData.status;
            // Extract payer info from MP
            const payer = paymentData.payer || {};
            const td = paymentData.point_of_interaction?.transaction_data || {};
            payerInfo = {
              payer_name: payer.first_name || payer.last_name ? `${payer.first_name || ""} ${payer.last_name || ""}`.trim() : null,
              payer_email: payer.email || null,
              payer_document: payer.identification?.number || null,
              end_to_end_id: td.e2eid || paymentData.transaction_details?.external_resource_url || null,
              bank_name: td.bank_info?.payer?.name || null,
            };
          }
        }
      }
    }

    // ===== PUSHINPAY =====
    // Webhook: { id, value, status: "paid"|"canceled", end_to_end_id }
    if (gateway === "pushinpay" || (body.end_to_end_id && body.value)) {
      detectedGateway = "pushinpay";
      paymentId = String(body.id || "");
      status = String(body.status || "");
      payerInfo = {
        end_to_end_id: body.end_to_end_id || null,
        payer_name: body.payer_name || body.debitParty?.name || null,
        payer_document: body.payer_document || body.debitParty?.document || null,
        bank_name: body.debitParty?.bankName || null,
      };
    }

    // ===== VIRTUALPAY =====
    if (gateway === "virtualpay" || body.operation === "cashin") {
      detectedGateway = "virtualpay";
      paymentId = String(body.id || body.transaction_id || "");
      status = String(body.status || "");
      payerInfo = {
        payer_name: body.payer_name || body.client_name || null,
        payer_document: body.payer_document || null,
        end_to_end_id: body.end_to_end_id || body.e2eid || null,
      };
    }

    // ===== EFI PAY =====
    if (gateway === "efipay" || body.pix) {
      detectedGateway = "efipay";
      const pixArray = body.pix as Array<Record<string, unknown>> | undefined;
      if (pixArray && pixArray.length > 0) {
        paymentId = String(pixArray[0].txid || "");
        status = "paid";
        payerInfo = {
          end_to_end_id: pixArray[0].endToEndId || null,
          payer_name: pixArray[0].pagador && typeof pixArray[0].pagador === "object" ? (pixArray[0].pagador as Record<string, unknown>).nome || null : null,
          payer_document: pixArray[0].pagador && typeof pixArray[0].pagador === "object" ? (pixArray[0].pagador as Record<string, unknown>).cpf || null : null,
        };
      }
    }

    // ===== PIXGO =====
    if (gateway === "pixgo" || body.event?.toString().startsWith("payment.")) {
      detectedGateway = "pixgo";
      const eventData = body.data as Record<string, unknown> | undefined;
      if (eventData) {
        paymentId = String(eventData.external_id || eventData.payment_id || "");
        const eventName = String(body.event || "");
        if (eventName === "payment.completed" || eventData.status === "completed") {
          status = "paid";
        } else if (eventName === "payment.expired" || eventData.status === "expired") {
          status = "expired";
        } else {
          status = String(eventData.status || "pending");
        }
        payerInfo = {
          payer_name: eventData.payer_name || null,
          payer_document: eventData.payer_cpf || null,
          end_to_end_id: eventData.end_to_end_id || null,
        };
      }
    }

    // ===== MISTICPAY =====
    if (gateway === "misticpay" || (body.transactionType === "DEPOSITO" && body.transactionMethod === "PIX" && body.transactionId)) {
      detectedGateway = "misticpay";
      paymentId = String(body.transactionId || "");
      const mpStatus = String(body.status || "");
      if (mpStatus === "COMPLETO") {
        status = "paid";
      } else if (mpStatus === "FALHA") {
        status = "failed";
      } else {
        status = "pending";
      }
      payerInfo = {
        payer_name: body.clientName || null,
        payer_document: body.clientDocument || null,
        fee: body.fee || null,
      };
    }

    // ===== AUTO-DETECT =====
    if (!paymentId && body.id) {
      paymentId = String(body.id);
      status = String(body.status || "pending");
    }

    console.log(`Detected gateway=${detectedGateway}, paymentId=${paymentId}, status=${status}`);

    if (!paymentId) {
      console.warn("No payment ID found in webhook payload");
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isPaid = status === "paid" || status === "approved" || status === "accredited";

    if (isPaid) {
      // Find the transaction - try by payment_id first, then by metadata reference (for PixGo external_id)
      let { data: transactions } = await supabase
        .from("transactions")
        .select("*")
        .eq("payment_id", paymentId)
        .eq("status", "pending")
        .limit(1);

      // If not found and this is PixGo, the paymentId might be our external_id/reference
      if ((!transactions || transactions.length === 0) && detectedGateway === "pixgo") {
        const { data: txByRef } = await supabase
          .from("transactions")
          .select("*")
          .eq("status", "pending")
          .limit(500);
        // Search in metadata.reference
        const match = txByRef?.find((t: any) => {
          const meta = t.metadata as Record<string, unknown> | null;
          return meta?.reference === paymentId;
        });
        if (match) transactions = [match];
      }

      const tx = transactions?.[0];

      if (tx) {
        console.log(`Approving transaction ${tx.id} for user ${tx.user_id}, amount ${tx.amount}`);

        // Atomically claim the transaction (prevents double-processing)
        const existingMeta = (tx.metadata as Record<string, unknown>) || {};
        const updatedMeta = { ...existingMeta, ...payerInfo, confirmed_at: new Date().toISOString() };
        
        const { data: claimed } = await supabase.rpc("claim_transaction", {
          p_tx_id: tx.id,
          p_from_status: "pending",
          p_to_status: "completed",
          p_metadata: updatedMeta,
        });

        if (!claimed) {
          console.warn(`Transaction ${tx.id} already processed, skipping`);
          return new Response(JSON.stringify({ received: true, status: "already_processed" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Determine which saldo type to credit from transaction metadata
        const txMeta = (tx.metadata as Record<string, unknown>) || {};
        const saldoTipo = (txMeta.saldo_tipo as string) || "revenda";

        // Resolve fee using RPC (reseller-specific → global fallback)
        const { data: feeRows } = await supabase.rpc("get_deposit_fee_for_user", { _user_id: tx.user_id });
        let fee = 0;
        const taxaTipo = feeRows?.[0]?.fee_type || "fixo";
        const taxaValor = Number(feeRows?.[0]?.fee_value) || 0;
        if (taxaValor > 0) {
          if (taxaTipo === "percentual") {
            fee = Number(tx.amount) * (taxaValor / 100);
          } else {
            fee = taxaValor;
          }
          fee = Math.round(fee * 100) / 100;
        }

        const creditAmount = Math.max(0, Number(tx.amount) - fee);

        // Atomically credit user balance
        const { data: newBalance } = await supabase.rpc("increment_saldo", {
          p_user_id: tx.user_id,
          p_tipo: saldoTipo,
          p_amount: creditAmount,
        });

        // Store fee info in transaction metadata
        if (fee > 0) {
          const feeUpdatedMeta = { ...updatedMeta, fee_applied: fee, fee_type: taxaTipo, fee_rate: taxaValor, credited_amount: creditAmount };
          await supabase
            .from("transactions")
            .update({ metadata: feeUpdatedMeta })
            .eq("id", tx.id);
        }

        console.log(
          `Balance updated atomically (${saldoTipo}): +${creditAmount} = ${newBalance} for user ${tx.user_id} (fee: R$${fee.toFixed(2)})`
        );

        // ===== TELEGRAM NOTIFICATION =====
        try {
          // Get bot token from system_config
          const { data: botTokenRow } = await supabase
            .from("system_config")
            .select("value")
            .eq("key", "telegramBotToken")
            .maybeSingle();
          const botToken = botTokenRow?.value?.trim();

          // Get user's telegram_id
          const { data: profile } = await supabase
            .from("profiles")
            .select("telegram_id, nome")
            .eq("id", tx.user_id)
            .maybeSingle();

          if (botToken && profile?.telegram_id) {
            const chatIdTg = Number(profile.telegram_id);

            // Delete the original PIX QR code message if we have the message_id
            const pixMsgId = updatedMeta.telegram_pix_msg_id;
            const pixChatId = updatedMeta.telegram_chat_id || chatIdTg;
            if (pixMsgId) {
              try {
                const delResp = await fetch(`https://api.telegram.org/bot${botToken}/deleteMessage`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ chat_id: Number(pixChatId), message_id: Number(pixMsgId) }),
                });
                const delResult = await delResp.json();
                console.log(`Delete PIX msg ${pixMsgId} in chat ${pixChatId}:`, delResult?.ok ? "OK" : delResult?.description);
              } catch (delErr) {
                console.warn("Failed to delete PIX message:", delErr);
              }
            } else {
              console.log("No telegram_pix_msg_id found in metadata, skipping delete");
            }

            const nome = profile.nome || "Usuário";
            const valorFmt = Number(tx.amount).toFixed(2).replace(".", ",");
            const saldoFmt = Number(newBalance || 0).toFixed(2).replace(".", ",");
            const feeNote = fee > 0 ? `\n💸 Taxa: <b>R$ ${fee.toFixed(2).replace(".", ",")}</b>\n💵 Creditado: <b>R$ ${creditAmount.toFixed(2).replace(".", ",")}</b>` : "";
            const msg = `✅ <b>Pagamento Confirmado!</b>\n\n💰 Valor: <b>R$ ${valorFmt}</b>${feeNote}\n💳 Novo saldo: <b>R$ ${saldoFmt}</b>\n👤 ${nome}\n\n🎉 Saldo creditado com sucesso!`;

            const tgResp = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: chatIdTg,
                text: msg,
                parse_mode: "HTML",
                reply_markup: {
                  inline_keyboard: [
                    [{ text: "💰 Ver Saldo", callback_data: "menu_saldo" }, { text: "📱 Fazer Recarga", callback_data: "menu_recarga" }],
                    [{ text: "📖 Menu", callback_data: "menu_main" }],
                  ],
                },
              }),
            });
            const tgResult = await tgResp.json();
            if (tgResult?.ok) {
              // Mark as notified
              await supabase.from("transactions").update({ telegram_notified: true }).eq("id", tx.id);
              console.log(`Telegram notification sent for tx ${tx.id}`);
            } else {
              console.warn(`Telegram send failed for tx ${tx.id}:`, tgResult?.description);
            }
          } else {
            // No telegram linked - can't notify now, leave telegram_notified=false
            console.log(`No telegram for user ${tx.user_id}, notification pending`);
          }
        } catch (notifyErr) {
          console.error("Telegram notification error (will retry on next interaction):", notifyErr);
        }
        // ===== PUSH NOTIFICATION (PWA) =====
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
              title: "✅ Depósito Confirmado",
              body: `Depósito de R$ ${Number(tx.amount).toFixed(2).replace(".", ",")} confirmado! Saldo atualizado.`,
              user_ids: [tx.user_id],
            }),
          }).catch(() => {});
        } catch (pushErr) {
          console.warn("Push notification error:", pushErr);
        }
      } else {
        console.warn(`No pending transaction found for payment_id=${paymentId}`);
      }
    }

    return new Response(JSON.stringify({ received: true, status }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    // Always return 200 to avoid retries
    return new Response(JSON.stringify({ received: true, error: "internal" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
