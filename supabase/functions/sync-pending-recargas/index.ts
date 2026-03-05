import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const API_BASE = "https://express.poeki.dev/api/v1";

async function getApiKey(adminClient: any): Promise<string> {
  const { data } = await adminClient
    .from("system_config")
    .select("value")
    .eq("key", "apiKey")
    .single();
  if (!data?.value) throw new Error("API Key não configurada");
  return data.value;
}

async function proxyGet(apiKey: string, path: string) {
  const resp = await fetch(`${API_BASE}${path}`, {
    headers: { "X-API-Key": apiKey, Accept: "application/json" },
  });
  return resp.json();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const adminClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const apiKey = await getApiKey(adminClient);

    // Fetch all pending recargas with external_id
    const { data: pendingRecargas, error: fetchError } = await adminClient
      .from("recargas")
      .select("id, external_id, user_id, telefone, operadora, valor, custo, created_at")
      .eq("status", "pending")
      .not("external_id", "is", null)
      .order("created_at", { ascending: true })
      .limit(100);

    if (fetchError) throw fetchError;

    if (!pendingRecargas || pendingRecargas.length === 0) {
      return new Response(JSON.stringify({ success: true, synced: 0, message: "Nenhuma recarga pendente" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`sync-pending: ${pendingRecargas.length} recargas pendentes encontradas`);

    // Fetch orders from API with pagination (up to 500)
    const allOrders: any[] = [];
    for (let page = 1; page <= 5; page++) {
      const resp = await proxyGet(apiKey, `/me/orders?page=${page}&limit=100`);
      if (!resp?.success) break;
      const orders = Array.isArray(resp.data) ? resp.data : resp.data?.data || [];
      if (orders.length === 0) break;
      allOrders.push(...orders);
      if (orders.length < 100) break;
    }

    console.log(`sync-pending: ${allOrders.length} orders fetched from API`);

    // Build lookup map
    const orderMap = new Map<string, any>();
    for (const o of allOrders) {
      if (o._id) orderMap.set(o._id, o);
    }

    let updated = 0;
    let failed = 0;
    let notFound = 0;
    const now = Date.now();
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

    for (const recarga of pendingRecargas) {
      const order = orderMap.get(recarga.external_id);

      if (order) {
        const apiStatus = order.status;
        let newStatus: string | null = null;

        if (apiStatus === "feita" || apiStatus === "completed") {
          newStatus = "completed";
        } else if (apiStatus === "falha" || apiStatus === "cancelada" || apiStatus === "cancelled" || apiStatus === "expirada" || apiStatus === "expired") {
          newStatus = "falha";
        }
        // else still pending, skip

        if (newStatus && newStatus !== "pending") {
          const updatePayload: Record<string, unknown> = { status: newStatus };
          if (newStatus === "completed") {
            updatePayload.completed_at = new Date().toISOString();
          }

          const { error: updateError } = await adminClient
            .from("recargas")
            .update(updatePayload)
            .eq("id", recarga.id);

          if (!updateError) {
            updated++;
            console.log(`sync-pending: ${recarga.id} → ${newStatus} (API: ${apiStatus})`);

            const baseUrl = Deno.env.get("SUPABASE_URL")!;
            const svcKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
            const authHeaders = { "Content-Type": "application/json", Authorization: `Bearer ${svcKey}` };

            // Send Telegram + Push notification for completed recargas
            if (newStatus === "completed") {
              try {
                const { data: saldoData } = await adminClient
                  .from("saldos")
                  .select("valor")
                  .eq("user_id", recarga.user_id)
                  .eq("tipo", "revenda")
                  .single();

                const notifyPayload = {
                  telefone: recarga.telefone,
                  operadora: recarga.operadora,
                  valor_recarga: recarga.valor,
                  custo: recarga.custo,
                  novo_saldo: Number(saldoData?.valor) || 0,
                  recarga_id: recarga.id,
                };

                // Telegram notification
                fetch(`${baseUrl}/functions/v1/telegram-notify`, {
                  method: "POST", headers: authHeaders,
                  body: JSON.stringify({ type: "recarga_completed", user_id: recarga.user_id, data: notifyPayload }),
                }).catch(() => {});

                // Push notification (PWA)
                fetch(`${baseUrl}/functions/v1/send-push`, {
                  method: "POST", headers: authHeaders,
                  body: JSON.stringify({
                    title: "✅ Recarga Concluída!",
                    body: `Recarga de R$ ${Number(recarga.valor).toFixed(2).replace(".", ",")} para ${recarga.telefone} foi realizada com sucesso.`,
                    user_ids: [recarga.user_id],
                  }),
                }).catch(() => {});
              } catch { /* ignore notification errors */ }
            }

            // Refund balance + Telegram + Push for failed recargas
            if (newStatus === "falha") {
              try {
                const { data: saldoData } = await adminClient
                  .from("saldos")
                  .select("valor")
                  .eq("user_id", recarga.user_id)
                  .eq("tipo", "revenda")
                  .single();

                let newBalance = Number(saldoData?.valor) || 0;
                if (saldoData) {
                  newBalance = Number(saldoData.valor) + Number(recarga.custo);
                  await adminClient
                    .from("saldos")
                    .update({ valor: newBalance })
                    .eq("user_id", recarga.user_id)
                    .eq("tipo", "revenda");
                  console.log(`sync-pending: refunded ${recarga.custo} to user ${recarga.user_id}`);
                }

                // Telegram notification for failure
                fetch(`${baseUrl}/functions/v1/telegram-notify`, {
                  method: "POST", headers: authHeaders,
                  body: JSON.stringify({
                    type: "recarga_failed",
                    user_id: recarga.user_id,
                    data: {
                      telefone: recarga.telefone,
                      operadora: recarga.operadora,
                      valor_recarga: recarga.valor,
                      custo: recarga.custo,
                      novo_saldo: newBalance,
                      recarga_id: recarga.id,
                    },
                  }),
                }).catch(() => {});

                // Push notification for failure (PWA)
                fetch(`${baseUrl}/functions/v1/send-push`, {
                  method: "POST", headers: authHeaders,
                  body: JSON.stringify({
                    title: "❌ Recarga Falhou",
                    body: `Recarga de R$ ${Number(recarga.valor).toFixed(2).replace(".", ",")} para ${recarga.telefone} falhou. Saldo estornado automaticamente.`,
                    user_ids: [recarga.user_id],
                  }),
                }).catch(() => {});
              } catch { /* ignore refund/notification errors */ }
            }
          } else {
            failed++;
          }
        }
      } else {
        // Order not found in API
        const createdAt = new Date(recarga.created_at).getTime();
        if (now - createdAt > TWENTY_FOUR_HOURS) {
          // Mark as failed after 24h
          await adminClient
            .from("recargas")
            .update({ status: "falha" })
            .eq("id", recarga.id);

          // Refund balance
          try {
            const { data: saldoData } = await adminClient
              .from("saldos")
              .select("valor")
              .eq("user_id", recarga.user_id)
              .eq("tipo", "revenda")
              .single();

            if (saldoData) {
              const newBalance = Number(saldoData.valor) + Number(recarga.custo);
              await adminClient
                .from("saldos")
                .update({ valor: newBalance })
                .eq("user_id", recarga.user_id)
                .eq("tipo", "revenda");
            }
          } catch { /* ignore */ }

          notFound++;
          console.log(`sync-pending: ${recarga.id} → falha (not found in API after 24h)`);
        }
      }
    }

    const summary = { success: true, total: pendingRecargas.length, updated, failed, notFound };
    console.log("sync-pending summary:", JSON.stringify(summary));

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("sync-pending error:", error);
    const msg = error instanceof Error ? error.message : "Erro interno";
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
