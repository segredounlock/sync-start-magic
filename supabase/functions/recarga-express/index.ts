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
  if (!data?.value) throw new Error("API Key da Recarga Express não configurada");
  return data.value;
}

async function proxyGet(apiKey: string, path: string) {
  const resp = await fetch(`${API_BASE}${path}`, {
    headers: { "X-API-Key": apiKey, Accept: "application/json" },
  });
  return resp.json();
}

async function proxyPost(apiKey: string, path: string, body: unknown) {
  const resp = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "X-API-Key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  return resp.json();
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
      // Called internally (e.g. from telegram-bot) — user_id must be in the body
      userId = params.user_id;
      if (!userId) {
        return new Response(JSON.stringify({ error: "user_id obrigatório para chamadas internas" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      // Normal user auth via JWT
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );
      const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
      if (claimsError || !claimsData?.claims?.sub) {
        return new Response(JSON.stringify({ error: "Token inválido" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      userId = claimsData.claims.sub as string;
    }

    const apiKey = await getApiKey(adminClient);

    console.log(`recarga-express: action=${action} user=${userId}`);

    let result: unknown;

    switch (action) {
      case "catalog": {
        result = await proxyGet(apiKey, "/catalog");
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
        // Check status of a specific order by external_id and update local DB
        const { external_id } = params;
        if (!external_id) throw new Error("external_id é obrigatório");

        // Find order in API
        // Search across multiple pages with higher limit
        let order = null;
        for (let page = 1; page <= 3; page++) {
          const ordersResp = await proxyGet(apiKey, `/me/orders?page=${page}&limit=200`);
          if (!ordersResp?.success) break;
          const orders = Array.isArray(ordersResp.data) ? ordersResp.data : ordersResp.data?.data || [];
          order = orders.find((o: any) => o._id === external_id);
          if (order || orders.length < 200) break;
        }

        if (!order) {
          result = { success: false, error: "Pedido não encontrado na API" };
          break;
        }

        // Map API status to local status
        const localStatus = (order.status === "feita" || order.status === "completed") ? "completed"
          : order.status === "falha" ? "falha"
          : "pending";

        // Update local DB
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

        // Resolve carrierId: if it's a UUID (from local DB), find the API carrierId via catalog
        let resolvedCarrierId = carrierId;
        const isUuidCheck = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
        if (carrierId && isUuidCheck(carrierId)) {
          try {
            const { data: opData } = await adminClient.from("operadoras").select("nome").eq("id", carrierId).single();
            if (opData?.nome) {
              const catResp = await proxyGet(apiKey, "/catalog");
              if (catResp?.success && catResp.data) {
                const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
                const matched = catResp.data.find((c: any) => norm(c.name) === norm(opData.nome));
                if (matched) resolvedCarrierId = matched.carrierId;
              }
            }
          } catch { /* fallback to original */ }
        }

        result = await proxyPost(apiKey, "/utils/check-phone", {
          phoneNumber,
          carrierId: resolvedCarrierId || undefined,
        });
        break;
      }

      case "query-operator": {
        const { phoneNumber: qPhone } = params;
        if (!qPhone) throw new Error("phoneNumber é obrigatório");

        // Get consulta operadora URL and Key from system_config
        const { data: consultaUrl } = await adminClient
          .from("system_config")
          .select("value")
          .eq("key", "consultaOperadoraURL")
          .single();
        const { data: consultaKey } = await adminClient
          .from("system_config")
          .select("value")
          .eq("key", "consultaOperadoraKey")
          .single();

        if (!consultaUrl?.value || !consultaKey?.value) {
          throw new Error("API de consulta de operadora não configurada");
        }

        const queryResp = await fetch(consultaUrl.value, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": consultaKey.value,
          },
          body: JSON.stringify({ phoneNumber: qPhone }),
        });
        const queryData = await queryResp.json();
        console.log("query-operator response:", JSON.stringify(queryData));
        result = { success: true, data: queryData };
        break;
      }

      case "recharge": {
        const { carrierId, phoneNumber, valueId, extraData, webhookUrl, saldo_tipo } = params;
        const saldoTipo = saldo_tipo || "revenda";
        if (!carrierId || !phoneNumber || !valueId) {
          throw new Error("carrierId, phoneNumber e valueId são obrigatórios");
        }

        // Helper functions
        const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
        const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

        // Determine user role
        const { data: roleData } = await adminClient
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .maybeSingle();
        const userRole = roleData?.role || "cliente";

        // Get the user's reseller_id if cliente
        let resellerId: string | null = null;
        if (userRole === "cliente") {
          const { data: profileData } = await adminClient
            .from("profiles")
            .select("reseller_id")
            .eq("id", userId)
            .single();
          resellerId = profileData?.reseller_id || null;
        }

        // Check user balance locally first
        const { data: saldoData } = await adminClient
          .from("saldos")
          .select("valor")
          .eq("user_id", userId)
          .eq("tipo", saldoTipo)
          .single();

        const userBalance = Number(saldoData?.valor) || 0;

        // Get API catalog
        const catalogResp = await proxyGet(apiKey, "/catalog");

        // Resolve carrierId: if UUID (from local DB), convert to API carrierId
        let resolvedCarrierId = carrierId;
        let operadoraId: string = carrierId; // local DB operadora UUID
        
        if (isUuid(carrierId)) {
          // carrierId is a local UUID - resolve to API carrierId via name matching
          operadoraId = carrierId;
          try {
            const { data: opData } = await adminClient.from("operadoras").select("nome").eq("id", carrierId).single();
            if (opData?.nome && catalogResp?.success && catalogResp.data) {
              const matched = catalogResp.data.find((c: any) => normalize(c.name) === normalize(opData.nome));
              if (matched) resolvedCarrierId = matched.carrierId;
            }
          } catch { /* fallback to original */ }
        } else {
          // carrierId is already an API carrierId - find local operadora UUID
          const { data: allOps } = await adminClient.from("operadoras").select("id, nome").eq("ativo", true);
          if (allOps && allOps.length > 0) {
            let carrierName = carrierId;
            if (catalogResp?.success && catalogResp.data) {
              const matchedCarrier = catalogResp.data.find((c: any) => c.carrierId === carrierId);
              if (matchedCarrier?.name) carrierName = matchedCarrier.name;
            }
            const normalizedTarget = normalize(carrierName);
            const matched = allOps.find((op: any) => normalize(op.nome) === normalizedTarget);
            if (matched) operadoraId = matched.id;
          }
        }

        console.log(`recharge: carrierId=${carrierId} resolvedCarrierId=${resolvedCarrierId} operadoraId=${operadoraId} valueId=${valueId}`);

        // Get API catalog cost and recharge face value using resolved carrierId
        let apiCost = 0;
        let catalogValue = 0;
        let resolvedValueId = valueId; // may need to resolve local valueId to API valueId

        // Extract numeric value from local valueId format (e.g. "uuid_30" → 30)
        const localValueMatch = valueId.match(/_(\d+)$/);
        const localFaceValue = localValueMatch ? Number(localValueMatch[1]) : 0;

        if (catalogResp?.success && catalogResp.data) {
          for (const carrier of catalogResp.data) {
            if (carrier.carrierId === resolvedCarrierId) {
              // First try exact valueId match
              let valueObj = carrier.values?.find((v: any) => v.valueId === valueId);

              // If not found and valueId looks local (contains uuid), match by face value
              if (!valueObj && localFaceValue > 0 && carrier.values) {
                valueObj = carrier.values.find((v: any) => {
                  const fv = Number(v.value) || Number(v.faceValue) || Number(v.amount) || Number(v.rechargeValue) || 0;
                  return fv === localFaceValue;
                });
                // Also try matching by cost label
                if (!valueObj) {
                  valueObj = carrier.values.find((v: any) => {
                    const label = String(v.label || "").replace(/,/g, ".");
                    const nums = label.match(/\d+(?:\.\d{1,2})?/g);
                    if (!nums?.length) return false;
                    return nums.some((n: string) => Number(n) === localFaceValue);
                  });
                }
                if (valueObj) {
                  resolvedValueId = valueObj.valueId;
                  console.log(`Resolved local valueId ${valueId} → API valueId ${resolvedValueId} (face value: ${localFaceValue})`);
                }
              }

              if (valueObj) {
                apiCost = Number(valueObj.cost) || 0;
                catalogValue =
                  (Number(valueObj?.value) > 0 ? Number(valueObj.value) : 0) ||
                  (Number(valueObj?.faceValue) > 0 ? Number(valueObj.faceValue) : 0) ||
                  (Number(valueObj?.amount) > 0 ? Number(valueObj.amount) : 0) ||
                  (Number(valueObj?.rechargeValue) > 0 ? Number(valueObj.rechargeValue) : 0) ||
                  (() => {
                    const label = String(valueObj?.label || "").replace(/,/g, ".");
                    const nums = label.match(/\d+(?:\.\d{1,2})?/g);
                    if (!nums?.length) return Number(valueObj?.cost) || 0;
                    const parsed = Number(nums[nums.length - 1]);
                    return Number.isFinite(parsed) && parsed > 0 ? parsed : Number(valueObj?.cost) || 0;
                  })();
              }
              break;
            }
          }
        }

        if (apiCost <= 0) throw new Error("Valor não encontrado no catálogo");

        // Determine the actual cost to charge the user based on their role's pricing rules
        // First try role-specific rules, then ALWAYS fallback to global pricing
        let chargedCost = apiCost; // default to API cost
        let pricingSource = "api_default";
        let pricingRuleDetails: { tipo_regra: string; regra_valor: number; custo: number } | null = null;

        // Helper: get global pricing rule
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
          // User without role or cliente without reseller — use global pricing
          const globalRule = await getGlobalRule();
          if (globalRule) chargedCost = applyRule(globalRule, "pricing_rules");
        }

        const ruleLog = pricingRuleDetails
          ? `tipo=${(pricingRuleDetails as any).tipo_regra} | regra_valor=${(pricingRuleDetails as any).regra_valor} | custo_base=${(pricingRuleDetails as any).custo}`
          : "nenhuma regra encontrada";
        console.log(`pricing: role=${userRole} | source=${pricingSource} | ${ruleLog} | apiCost=${apiCost} | chargedCost=${chargedCost} | catalogValue=${catalogValue} | userId=${userId} | resellerId=${resellerId || "null"}`);

        if (userBalance < chargedCost) throw new Error("Saldo insuficiente");

        // Create recharge via API
        const rechargeBody: Record<string, unknown> = {
          carrierId: resolvedCarrierId,
          phoneNumber,
          valueId: resolvedValueId,
        };
        if (extraData) rechargeBody.extraData = extraData;
        if (webhookUrl) rechargeBody.webhookUrl = webhookUrl;

        let rechargeResult = await proxyPost(apiKey, "/recharges", rechargeBody);

        console.log("recharge API full response:", JSON.stringify(rechargeResult));

        if (!rechargeResult?.success) {
          throw new Error(rechargeResult?.message || rechargeResult?.error || "Erro ao criar recarga na API");
        }

        // Server-side polling: try to get final status before returning
        const orderData0 = rechargeResult.data || {};
        const extId = orderData0._id || orderData0.id || orderData0.orderId || rechargeResult._id || null;
        if (extId && orderData0.status !== "feita" && orderData0.status !== "completed") {
          const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
          for (let attempt = 0; attempt < 3; attempt++) {
            await sleep(5000);
            try {
              const pollResp = await proxyGet(apiKey, `/me/orders?page=1&limit=50`);
              if (pollResp?.success) {
                const pollOrders = Array.isArray(pollResp.data) ? pollResp.data : pollResp.data?.data || [];
                const found = pollOrders.find((o: any) => o._id === extId);
                if (found && (found.status === "feita" || found.status === "completed")) {
                  rechargeResult = { ...rechargeResult, data: { ...rechargeResult.data, ...found } };
                  console.log(`recharge polling: found completed on attempt ${attempt + 1}`);
                  break;
                }
                if (found && (found.status === "falha" || found.status === "cancelada")) {
                  rechargeResult = { ...rechargeResult, data: { ...rechargeResult.data, ...found } };
                  console.log(`recharge polling: found failed on attempt ${attempt + 1}`);
                  break;
                }
              }
            } catch { /* continue polling */ }
          }
        }

        // Deduct balance using the role-specific cost
        const newBalance = userBalance - chargedCost;
        await adminClient
          .from("saldos")
          .update({ valor: newBalance })
          .eq("user_id", userId)
          .eq("tipo", saldoTipo);

        // Save recarga locally
        const orderData = rechargeResult.data || {};
        const externalId = orderData._id || orderData.id || orderData.orderId || rechargeResult._id || null;
        console.log("external_id resolved:", externalId, "orderData keys:", Object.keys(orderData));
        
        const isCompleted = (orderData.status === "feita" || orderData.status === "concluida");
        await adminClient.from("recargas").insert({
          user_id: userId,
          telefone: phoneNumber,
          operadora: orderData.carrier?.name || carrierId,
          valor: catalogValue,
          custo: chargedCost,
          custo_api: apiCost,
          status: isCompleted ? "completed" : "pending",
          external_id: externalId,
          completed_at: isCompleted ? new Date().toISOString() : null,
        });

        // Telegram notification
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
              data: { telefone: phoneNumber, operadora: orderData.carrier?.name || carrierId, valor_recarga: catalogValue, custo: chargedCost, novo_saldo: newBalance, recarga_id: externalId || "" },
            }),
          });
        } catch { /* ignore */ }

        result = {
          success: true,
          data: {
            ...orderData,
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
