import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const API_BASE = "https://express.poeki.dev/api/v2";

async function getApiKey(adminClient: any): Promise<string> {
  const { data } = await adminClient
    .from("system_config")
    .select("value")
    .eq("key", "apiKey")
    .single();
  if (!data?.value) throw new Error("API Key da Recarga Express não configurada");
  return data.value;
}

async function proxyGet(apiKey: string, path: string) {
  const url = `${API_BASE}${path}`;
  const resp = await fetch(url, {
    headers: { "X-API-Key": apiKey, Accept: "application/json" },
  });
  const text = await resp.text();
  try {
    return JSON.parse(text);
  } catch {
    console.error(`proxyGet ${path} status=${resp.status} non-JSON response (${text.length} bytes): ${text.slice(0, 500)}`);
    throw new Error(`API retornou resposta inválida (status ${resp.status})`);
  }
}

async function proxyPost(apiKey: string, path: string, body: unknown) {
  const url = `${API_BASE}${path}`;
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "X-API-Key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  const text = await resp.text();
  try {
    return JSON.parse(text);
  } catch {
    console.error(`proxyPost ${path} status=${resp.status} non-JSON response (${text.length} bytes): ${text.slice(0, 500)}`);
    throw new Error(`API retornou resposta inválida (status ${resp.status})`);
  }
}

// Normalize string for comparison
const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

// Map v2 catalog to v1-compatible format for frontend/bot consumption
function mapCatalogV2toV1(v2Data: any[]): any[] {
  return v2Data.map((carrier: any) => ({
    carrierId: carrier.operator,
    name: carrier.operator,
    operator: carrier.operator,
    values: (carrier.values || []).map((v: any) => ({
      valueId: `${carrier.operator}_${v.amount}`,
      value: v.amount,
      amount: v.amount,
      cost: v.cost,
      label: `R$ ${v.amount}`,
    })),
  }));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const isServiceRole = token === serviceRoleKey;

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      serviceRoleKey
    );

    // Parse body first (needed for both service role and normal auth)
    const body = await req.json();
    const { action, ...params } = body;

    let userId: string;

    if (isServiceRole) {
      userId = params.user_id;
      if (!userId) {
        return new Response(JSON.stringify({ error: "user_id obrigatório para chamadas internas" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user?.id) {
        return new Response(JSON.stringify({ error: "Token inválido" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      userId = user.id;
    }

    const apiKey = await getApiKey(adminClient);

    console.log(`recarga-express: action=${action} user=${userId}`);

    let result: unknown;

    switch (action) {
      case "catalog": {
        const rawResult = await proxyGet(apiKey, "/catalog");
        // Map v2 format to v1-compatible format
        if (rawResult?.success && rawResult.data) {
          result = { ...rawResult, data: mapCatalogV2toV1(rawResult.data) };
        } else {
          result = rawResult;
        }
        break;
      }

      case "balance": {
        result = await proxyGet(apiKey, "/me/balance");
        break;
      }

      case "profile": {
        result = await proxyGet(apiKey, "/me");
        break;
      }

      case "orders": {
        const page = params.page || 1;
        const limit = params.limit || 15;
        result = await proxyGet(apiKey, `/me/orders?page=${page}&limit=${limit}`);
        break;
      }

      case "order-status": {
        const { external_id } = params;
        if (!external_id) throw new Error("external_id é obrigatório");

        let order = null;
        for (let page = 1; page <= 3; page++) {
          const ordersResp = await proxyGet(apiKey, `/me/orders?page=${page}&limit=200`);
          if (!ordersResp?.success) break;
          const orders = Array.isArray(ordersResp.data) ? ordersResp.data : ordersResp.data?.data || [];
          order = orders.find((o: any) => o._id === external_id || o.id === external_id);
          if (order || orders.length < 200) break;
        }

        if (!order) {
          result = { success: false, error: "Pedido não encontrado na API" };
          break;
        }

        const localStatus = (order.status === "feita" || order.status === "completed") ? "completed"
          : (order.status === "falha" || order.status === "cancelada" || order.status === "expirada") ? "falha"
          : "pending";

        const updatePayload: Record<string, unknown> = { status: localStatus };
        if (localStatus === "completed") {
          updatePayload.completed_at = new Date().toISOString();
        }
        await adminClient
          .from("recargas")
          .update(updatePayload)
          .eq("external_id", external_id);

        result = { success: true, data: { ...order, localStatus } };
        break;
      }

      case "check-phone": {
        const { phoneNumber, carrierId } = params;
        if (!phoneNumber) throw new Error("phoneNumber é obrigatório");

        // v2 uses carrierName (string) instead of carrierId
        let carrierName = carrierId || undefined;
        if (carrierId && isUuid(carrierId)) {
          try {
            const { data: opData } = await adminClient.from("operadoras").select("nome").eq("id", carrierId).single();
            if (opData?.nome) carrierName = normalize(opData.nome);
          } catch { /* fallback to original */ }
        } else if (carrierId) {
          // Already a string name, normalize it
          carrierName = normalize(carrierId);
        }

        result = await proxyPost(apiKey, "/utils/check-phone", {
          phoneNumber,
          carrierName: carrierName || undefined,
        });
        break;
      }

      case "query-operator": {
        // v2: use native /detect-operator endpoint
        const { phoneNumber: qPhone } = params;
        if (!qPhone) throw new Error("phoneNumber é obrigatório");

        const detectResp = await proxyPost(apiKey, "/detect-operator", { phone: qPhone });
        console.log("detect-operator response:", JSON.stringify(detectResp));

        if (detectResp?.success && detectResp.data) {
          // Map to expected format for frontend compatibility
          result = {
            success: true,
            data: {
              operator: detectResp.data.operator,
              enabled: detectResp.data.enabled,
              carrier: { name: detectResp.data.operator },
            },
          };
        } else {
          result = detectResp;
        }
        break;
      }

      case "recharge": {
        // Accept both v1 params (carrierId/phoneNumber/valueId) and v2 params (operator/phone/amount)
        const rawCarrierId = params.operator || params.carrierId;
        const phoneNumber = params.phone || params.phoneNumber;
        const rawAmount = params.amount || null;
        const valueId = params.valueId || null;
        const { extraData, webhookUrl, saldo_tipo } = params;
        const saldoTipo = saldo_tipo || "revenda";

        if (!rawCarrierId || !phoneNumber) {
          throw new Error("operator/carrierId e phone/phoneNumber são obrigatórios");
        }

        // Resolve operator name and local operadora UUID
        let resolvedOperator = rawCarrierId;
        let operadoraId: string = rawCarrierId;

        if (isUuid(rawCarrierId)) {
          operadoraId = rawCarrierId;
          try {
            const { data: opData } = await adminClient.from("operadoras").select("nome").eq("id", rawCarrierId).single();
            if (opData?.nome) resolvedOperator = normalize(opData.nome);
          } catch { /* fallback */ }
        } else {
          // String operator name — find local operadora UUID
          const { data: allOps } = await adminClient.from("operadoras").select("id, nome").eq("ativo", true);
          if (allOps?.length) {
            const matched = allOps.find((op: any) => normalize(op.nome) === normalize(rawCarrierId));
            if (matched) operadoraId = matched.id;
          }
        }

        // Resolve amount (face value)
        let resolvedAmount = rawAmount ? Number(rawAmount) : 0;
        if (!resolvedAmount && valueId) {
          // Extract from synthetic valueId format: "operator_amount" or "uuid_amount"
          const match = String(valueId).match(/_(\d+(?:\.\d+)?)$/);
          if (match) resolvedAmount = Number(match[1]);
        }

        if (!resolvedAmount) throw new Error("amount ou valueId é obrigatório");

        console.log(`recharge: operator=${resolvedOperator} operadoraId=${operadoraId} amount=${resolvedAmount} phone=${phoneNumber}`);

        // Determine user role
        const { data: roleData } = await adminClient
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .maybeSingle();
        const userRole = roleData?.role || "cliente";

        // Get reseller_id if cliente
        let resellerId: string | null = null;
        if (userRole === "cliente") {
          const { data: profileData } = await adminClient
            .from("profiles")
            .select("reseller_id")
            .eq("id", userId)
            .single();
          resellerId = profileData?.reseller_id || null;
        }

        // Check user balance locally
        const { data: saldoData } = await adminClient
          .from("saldos")
          .select("valor")
          .eq("user_id", userId)
          .eq("tipo", saldoTipo)
          .single();

        const userBalance = Number(saldoData?.valor) || 0;

        // Get API catalog to find cost
        const catalogResp = await proxyGet(apiKey, "/catalog");
        let apiCost = 0;
        let catalogValue = resolvedAmount;

        if (catalogResp?.success && catalogResp.data) {
          const carrier = catalogResp.data.find((c: any) => normalize(c.operator) === normalize(resolvedOperator));
          if (carrier) {
            const val = carrier.values?.find((v: any) => Number(v.amount) === resolvedAmount);
            if (val) {
              apiCost = Number(val.cost) || 0;
              catalogValue = Number(val.amount) || resolvedAmount;
            }
          }
        }

        if (apiCost <= 0) throw new Error("Valor não encontrado no catálogo");

        // Determine the actual cost to charge the user based on pricing rules
        let chargedCost = apiCost;
        let pricingSource = "api_default";
        let pricingRuleDetails: { tipo_regra: string; regra_valor: number; custo: number } | null = null;

        const getGlobalRule = async () => {
          const { data: globalRule } = await adminClient
            .from("pricing_rules")
            .select("*")
            .eq("operadora_id", operadoraId)
            .eq("valor_recarga", catalogValue)
            .maybeSingle();
          return globalRule;
        };

        const applyRule = (rule: any, source: string) => {
          pricingSource = source;
          pricingRuleDetails = { tipo_regra: rule.tipo_regra, regra_valor: Number(rule.regra_valor), custo: Number(rule.custo) };
          return rule.tipo_regra === "fixo"
            ? Number(rule.regra_valor)
            : Number(rule.custo) * (1 + Number(rule.regra_valor) / 100);
        };

        if (userRole === "admin") {
          const globalRule = await getGlobalRule();
          if (globalRule) chargedCost = applyRule(globalRule, "pricing_rules");
        } else if (userRole === "revendedor") {
          const { data: resellerRule } = await adminClient
            .from("reseller_pricing_rules")
            .select("*")
            .eq("user_id", userId)
            .eq("operadora_id", operadoraId)
            .eq("valor_recarga", catalogValue)
            .maybeSingle();
          if (resellerRule) {
            chargedCost = applyRule(resellerRule, "reseller_pricing_rules");
          } else {
            const globalRule = await getGlobalRule();
            if (globalRule) chargedCost = applyRule(globalRule, "pricing_rules(fallback)");
          }
        } else if (userRole === "cliente" && resellerId) {
          const { data: resellerRule } = await adminClient
            .from("reseller_pricing_rules")
            .select("*")
            .eq("user_id", resellerId)
            .eq("operadora_id", operadoraId)
            .eq("valor_recarga", catalogValue)
            .maybeSingle();
          if (resellerRule) {
            chargedCost = applyRule(resellerRule, "reseller_pricing_rules(via_reseller)");
          } else {
            const globalRule = await getGlobalRule();
            if (globalRule) chargedCost = applyRule(globalRule, "pricing_rules(fallback)");
          }
        } else {
          const { data: ownRule } = await adminClient
            .from("reseller_pricing_rules")
            .select("*")
            .eq("user_id", userId)
            .eq("operadora_id", operadoraId)
            .eq("valor_recarga", catalogValue)
            .maybeSingle();
          if (ownRule) {
            chargedCost = applyRule(ownRule, "reseller_pricing_rules(own)");
          } else {
            const globalRule = await getGlobalRule();
            if (globalRule) chargedCost = applyRule(globalRule, "pricing_rules");
          }
        }

        const ruleLog = pricingRuleDetails
          ? `tipo=${(pricingRuleDetails as any).tipo_regra} | regra_valor=${(pricingRuleDetails as any).regra_valor} | custo_base=${(pricingRuleDetails as any).custo}`
          : "nenhuma regra encontrada";
        console.log(`pricing: role=${userRole} | source=${pricingSource} | ${ruleLog} | apiCost=${apiCost} | chargedCost=${chargedCost} | catalogValue=${catalogValue} | userId=${userId} | resellerId=${resellerId || "null"}`);

        if (userBalance < chargedCost) throw new Error("Saldo insuficiente");

        // Create recharge via v2 API
        const rechargeBody: Record<string, unknown> = {
          operator: resolvedOperator,
          phone: phoneNumber,
          amount: resolvedAmount,
        };
        if (webhookUrl) rechargeBody.webhookUrl = webhookUrl;

        let rechargeResult = await proxyPost(apiKey, "/recharges", rechargeBody);

        console.log("recharge API full response:", JSON.stringify(rechargeResult));

        if (!rechargeResult?.success) {
          const errMsg = rechargeResult?.message || rechargeResult?.error || "Erro ao criar recarga na API";
          console.error(`recharge FAILED: userId=${userId} phone=${phoneNumber} operator=${resolvedOperator} amount=${resolvedAmount} cost=${chargedCost} error="${errMsg}"`);

          // Alert admins when external API credit limit is exceeded
          const lowerErr = errMsg.toLowerCase();
          if (lowerErr.includes("limite de crédito") || lowerErr.includes("credit limit") || lowerErr.includes("saldo insuficiente") || lowerErr.includes("insufficient balance")) {
            console.warn("CRITICAL: External API credit limit exceeded — notifying admins");
            try {
              await adminClient.from("admin_notifications").insert({
                type: "alert",
                status: "critical",
                message: `⚠️ ALERTA: Saldo na API de recargas está baixo ou esgotado. Erro: "${errMsg}". Recargas podem falhar até que o saldo seja recarregado no provedor.`,
                user_id: userId,
                user_nome: null,
                user_email: null,
                amount: catalogValue,
              });

              const baseUrl = Deno.env.get("SUPABASE_URL")!;
              const svcKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
              const authH = { "Content-Type": "application/json", Authorization: `Bearer ${svcKey}` };

              const MASTER_TELEGRAM_ID = 1901426549;
              const alertMsg = `⚠️ <b>ALERTA CRÍTICO</b>\n\nSaldo na API de recargas baixo/esgotado.\n\n<b>Erro:</b> ${errMsg}\n\nRecarregue o saldo no provedor para evitar falhas nas recargas.`;

              fetch(`${baseUrl}/functions/v1/telegram-notify`, {
                method: "POST", headers: authH,
                body: JSON.stringify({
                  type: "admin_alert",
                  telegram_id: MASTER_TELEGRAM_ID,
                  data: { message: alertMsg },
                }),
              }).catch(() => {});

              const MASTER_ADMIN_ID = "f5501acc-79f3-460f-bc3e-493280ea84f0";
              fetch(`${baseUrl}/functions/v1/send-push`, {
                method: "POST", headers: authH,
                body: JSON.stringify({
                  title: "⚠️ Saldo API Baixo!",
                  body: `O provedor de recargas retornou "${errMsg}". Recarregue o saldo na API externa.`,
                  user_ids: [MASTER_ADMIN_ID],
                }),
              }).catch(() => {});
            } catch (notifErr) {
              console.error("Failed to send credit limit alert:", notifErr);
            }
          }

          throw new Error(errMsg);
        }

        // Server-side polling: try to get final status before returning
        const orderData0 = rechargeResult.data || {};
        const extId = orderData0.id || orderData0._id || orderData0.orderId || null;
        if (extId && orderData0.status !== "feita" && orderData0.status !== "completed") {
          const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
          for (let attempt = 0; attempt < 3; attempt++) {
            await sleep(5000);
            try {
              const pollResp = await proxyGet(apiKey, `/me/orders?page=1&limit=50`);
              if (pollResp?.success) {
                const pollOrders = Array.isArray(pollResp.data) ? pollResp.data : pollResp.data?.data || [];
                const found = pollOrders.find((o: any) => o._id === extId || o.id === extId);
                if (found && (found.status === "feita" || found.status === "completed")) {
                  rechargeResult = { ...rechargeResult, data: { ...rechargeResult.data, ...found } };
                  console.log(`recharge polling: found completed on attempt ${attempt + 1}`);
                  break;
                }
                if (found && (found.status === "falha" || found.status === "cancelada" || found.status === "expirada")) {
                  rechargeResult = { ...rechargeResult, data: { ...rechargeResult.data, ...found } };
                  console.log(`recharge polling: found failed on attempt ${attempt + 1}`);
                  break;
                }
              }
            } catch { /* continue polling */ }
          }
        }

        // Deduct balance
        const newBalance = userBalance - chargedCost;
        await adminClient
          .from("saldos")
          .update({ valor: newBalance })
          .eq("user_id", userId)
          .eq("tipo", saldoTipo);

        // Save recarga locally
        const orderData = rechargeResult.data || {};
        const externalId = orderData.id || orderData._id || orderData.orderId || null;
        console.log("external_id resolved:", externalId, "orderData keys:", Object.keys(orderData));

        const operadoraName = orderData.operator || orderData.carrier?.name || resolvedOperator;
        const isCompleted = (orderData.status === "feita" || orderData.status === "concluida" || orderData.status === "completed");
        await adminClient.from("recargas").insert({
          user_id: userId,
          telefone: phoneNumber,
          operadora: operadoraName,
          valor: catalogValue,
          custo: chargedCost,
          custo_api: apiCost,
          status: isCompleted ? "completed" : "pending",
          external_id: externalId,
          completed_at: isCompleted ? new Date().toISOString() : null,
        });

        // Telegram notification — only when API confirmed completion
        if (isCompleted) {
          try {
            const notifyUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/telegram-notify`;
            await fetch(notifyUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
              },
              body: JSON.stringify({
                type: "recarga_completed",
                user_id: userId,
                data: { telefone: phoneNumber, operadora: operadoraName, valor_recarga: catalogValue, custo: chargedCost, novo_saldo: newBalance, recarga_id: externalId || "" },
              }),
            });
          } catch { /* ignore */ }
        }

        result = {
          success: true,
          data: {
            ...orderData,
            // Map v2 response fields to v1-compatible for frontend
            _id: externalId,
            carrier: { name: operadoraName },
            value: catalogValue,
            localBalance: newBalance,
            cost: chargedCost,
          },
        };
        break;
      }

      default:
        throw new Error(`Ação "${action}" não suportada`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("recarga-express error:", error);
    const msg = error instanceof Error ? error.message : "Erro interno";
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
