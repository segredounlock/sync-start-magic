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

// Validate Brazilian phone numbers (10-11 digits, valid DDD 11-99, no obviously fake patterns)
function validatePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  // Remove country code 55 if present
  const phone = digits.startsWith("55") && digits.length >= 12 ? digits.slice(2) : digits;
  if (phone.length < 10 || phone.length > 11) {
    throw new Error(`Número de telefone inválido: deve ter 10 ou 11 dígitos (recebido ${phone.length})`);
  }
  const ddd = parseInt(phone.slice(0, 2), 10);
  if (ddd < 11 || ddd > 99) {
    throw new Error(`DDD inválido: ${ddd}. DDDs válidos são de 11 a 99`);
  }
  // Reject all-same-digit numbers (e.g. 00000000000, 11111111111)
  if (/^(\d)\1+$/.test(phone)) {
    throw new Error("Número de telefone inválido: dígitos repetidos");
  }
  // For 11-digit numbers, the 9th digit (mobile) must be 9
  if (phone.length === 11 && phone[2] !== "9") {
    throw new Error("Número de celular inválido: deve começar com 9 após o DDD");
  }
  return phone;
}

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
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      serviceRoleKey
    );

    // Parse body first (needed for routing and auth decisions)
    const body = await req.json();
    const { action, ...params } = body;

    // Auth
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : null;
    const isServiceRole = token === serviceRoleKey;
    const isPublicRecharge = action === "public-recharge";

    let userId: string;

    if (isPublicRecharge) {
      // Public recharge doesn't require JWT — uses reseller_id from body
      const resellerId = params.reseller_id;
      if (!resellerId) {
        return new Response(JSON.stringify({ error: "reseller_id obrigatório" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Validate reseller exists and is active
      const { data: resellerProfile } = await adminClient
        .from("profiles")
        .select("id, active")
        .eq("id", resellerId)
        .single();
      if (!resellerProfile?.active) {
        return new Response(JSON.stringify({ error: "Revendedor inativo ou não encontrado" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Validate reseller role
      const { data: roleCheck } = await adminClient
        .from("user_roles")
        .select("role")
        .eq("user_id", resellerId)
        .in("role", ["revendedor", "admin"])
        .maybeSingle();
      if (!roleCheck) {
        return new Response(JSON.stringify({ error: "Usuário não é revendedor" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      userId = resellerId;
    } else if (!token) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else if (isServiceRole) {
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
        { global: { headers: { Authorization: authHeader! } } }
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

        // Only update if status actually changed from pending
        const { data: currentRecarga } = await adminClient
          .from("recargas")
          .select("id, status, custo, user_id")
          .eq("external_id", external_id)
          .maybeSingle();

        const updatePayload: Record<string, unknown> = { status: localStatus };
        if (localStatus === "completed") {
          updatePayload.completed_at = new Date().toISOString();
        }
        await adminClient
          .from("recargas")
          .update(updatePayload)
          .eq("external_id", external_id);

        // Refund balance when status transitions to "falha" from "pending"
        if (localStatus === "falha" && currentRecarga && currentRecarga.status === "pending") {
          try {
            const { data: newBal } = await adminClient.rpc("increment_saldo", {
              p_user_id: currentRecarga.user_id,
              p_tipo: "revenda",
              p_amount: Number(currentRecarga.custo),
            });
            console.log(`order-status: refunded ${currentRecarga.custo} to user ${currentRecarga.user_id} via increment_saldo, new balance=${newBal}`);

            // Send failure notifications
            const baseUrl = Deno.env.get("SUPABASE_URL")!;
            const svcKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
            const authHeaders = { "Content-Type": "application/json", Authorization: `Bearer ${svcKey}` };

            fetch(`${baseUrl}/functions/v1/telegram-notify`, {
              method: "POST", headers: authHeaders,
              body: JSON.stringify({
                type: "recarga_failed",
                user_id: currentRecarga.user_id,
                data: { telefone: order.phone || "", operadora: order.operator || "", valor_recarga: order.amount || 0, custo: currentRecarga.custo, recarga_id: currentRecarga.id },
              }),
            }).catch(() => {});

            fetch(`${baseUrl}/functions/v1/send-push`, {
              method: "POST", headers: authHeaders,
              body: JSON.stringify({
                title: "❌ Recarga Falhou",
                body: `Recarga falhou. Saldo estornado automaticamente.`,
                user_ids: [currentRecarga.user_id],
              }),
            }).catch(() => {});
          } catch (refundErr) {
            console.error("order-status refund error:", refundErr);
          }
        }

        result = { success: true, data: { ...order, localStatus } };
        break;
      }

      case "check-phone": {
        const { phoneNumber: rawPhone, carrierId } = params;
        if (!rawPhone) throw new Error("phoneNumber é obrigatório");
        const phoneNumber = validatePhone(rawPhone);

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
        // v2: use native /detect-operator endpoint with fallback
        const { phoneNumber: rawQPhone } = params;
        if (!rawQPhone) throw new Error("phoneNumber é obrigatório");
        const qPhone = validatePhone(rawQPhone);

        let detectedOperator: string | null = null;
        let detectedEnabled = true;

        try {
          const detectResp = await proxyPost(apiKey, "/detect-operator", { phone: qPhone });
          console.log("detect-operator response:", JSON.stringify(detectResp));

          if (detectResp?.success && detectResp.data?.operator) {
            detectedOperator = detectResp.data.operator;
            detectedEnabled = detectResp.data.enabled !== false;
          } else {
            console.warn("detect-operator returned no operator:", JSON.stringify(detectResp));
          }
        } catch (apiErr: any) {
          console.error("detect-operator API failed:", apiErr.message);
        }

        // Local fallback using Brazilian mobile prefix rules
        if (!detectedOperator) {
          const digits = qPhone.replace(/\D/g, "");
          const num = digits.length === 11 ? digits : digits.length === 13 ? digits.slice(2) : digits;
          if (num.length === 11) {
            const prefix = parseInt(num.substring(2, 6));
            // ANATEL prefix ranges (approximate)
            if ((prefix >= 9611 && prefix <= 9699) || (prefix >= 9100 && prefix <= 9199)) {
              detectedOperator = "claro";
            } else if ((prefix >= 9700 && prefix <= 9799) || (prefix >= 9800 && prefix <= 9899)) {
              detectedOperator = "vivo";
            } else if ((prefix >= 9900 && prefix <= 9999) || (prefix >= 9200 && prefix <= 9299)) {
              detectedOperator = "tim";
            } else if (prefix >= 9300 && prefix <= 9399) {
              detectedOperator = "oi";
            }
            if (detectedOperator) {
              console.log(`detect-operator local fallback: ${num} → ${detectedOperator}`);
            }
          }
        }

        if (detectedOperator) {
          result = {
            success: true,
            data: {
              operator: detectedOperator,
              enabled: detectedEnabled,
              carrier: { name: detectedOperator },
              source: detectedOperator ? "api" : "local",
            },
          };
        } else {
          result = { success: false, error: "Não foi possível detectar a operadora" };
        }
        break;
      }

      case "recharge": {
        // Accept both v1 params (carrierId/phoneNumber/valueId) and v2 params (operator/phone/amount)
        const rawCarrierId = params.operator || params.carrierId;
        const rawPhone2 = params.phone || params.phoneNumber;
        const rawAmount = params.amount || null;
        const valueId = params.valueId || null;
        const { extraData, webhookUrl, saldo_tipo } = params;
        const saldoTipo = saldo_tipo || "revenda";

        if (!rawCarrierId || !rawPhone2) {
          throw new Error("operator/carrierId e phone/phoneNumber são obrigatórios");
        }
        const phoneNumber = validatePhone(rawPhone2);

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
            ? (Number(rule.regra_valor) > 0 ? Number(rule.regra_valor) : Number(rule.custo))
            : Number(rule.custo) * (1 + Number(rule.regra_valor) / 100);
        };

        // Default margin — OVERRIDES all rules when active
        const getDefaultMarginCost = async (baseCost: number): Promise<{ cost: number; applied: boolean }> => {
          const { data: cfgRows } = await adminClient
            .from("system_config")
            .select("key, value")
            .in("key", ["defaultMarginEnabled", "defaultMarginType", "defaultMarginValue"]);
          const cfg: Record<string, string> = {};
          (cfgRows || []).forEach((r: any) => { cfg[r.key] = r.value; });
          if (cfg.defaultMarginEnabled !== "true") return { cost: baseCost, applied: false };
          const marginType = cfg.defaultMarginType || "fixo";
          const marginValue = parseFloat(cfg.defaultMarginValue || "0");
          if (marginValue <= 0) return { cost: baseCost, applied: false };
          const finalCost = marginType === "fixo"
            ? baseCost + marginValue
            : baseCost * (1 + marginValue / 100);
          return { cost: Math.round(finalCost * 100) / 100, applied: true };
        };

        // Check if user has any custom pricing rules (if so, skip global margin)
        const hasCustomPricing = async (): Promise<boolean> => {
          if (userRole === "revendedor" || userRole === "admin") {
            const { count } = await adminClient
              .from("reseller_pricing_rules")
              .select("id", { count: "exact", head: true })
              .eq("user_id", userId);
            return (count || 0) > 0;
          }
          if (userRole === "cliente" && resellerId) {
            // Check if the reseller has custom rules
            const { count } = await adminClient
              .from("reseller_pricing_rules")
              .select("id", { count: "exact", head: true })
              .eq("user_id", resellerId);
            return (count || 0) > 0;
          }
          return false;
        };

        // Check default margin FIRST — but skip if user has custom pricing rules
        const userHasCustomPricing = await hasCustomPricing();
        const dmResult = !userHasCustomPricing ? await getDefaultMarginCost(apiCost) : { cost: apiCost, applied: false };
        if (dmResult.applied) {
          chargedCost = dmResult.cost;
          pricingSource = "default_margin_override";
        } else if (userRole === "admin") {
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
            if (globalRule) {
              chargedCost = applyRule(globalRule, "pricing_rules(fallback)");
            }
          }
        } else if (userRole === "cliente" && resellerId) {
          // Check client-specific pricing first
          const { data: clientRule } = await adminClient
            .from("client_pricing_rules")
            .select("*")
            .eq("reseller_id", resellerId)
            .eq("client_id", userId)
            .eq("operadora_id", operadoraId)
            .eq("valor_recarga", catalogValue)
            .maybeSingle();

          if (clientRule) {
            // Client pricing stores lucro (profit) — add to base cost
            const baseCost = apiCost;
            // Find base cost from global rules
            const globalRule = await getGlobalRule();
            const resolvedBase = globalRule
              ? (globalRule.tipo_regra === "fixo"
                ? (Number(globalRule.regra_valor) > 0 ? Number(globalRule.regra_valor) : Number(globalRule.custo))
                : Number(globalRule.custo) * (1 + Number(globalRule.regra_valor) / 100))
              : baseCost;
            chargedCost = resolvedBase + Number(clientRule.lucro);
            pricingSource = "client_pricing_rules";
          } else {
            // Fallback: reseller pricing → global
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
              if (globalRule) {
                chargedCost = applyRule(globalRule, "pricing_rules(fallback)");
              }
            }
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
            if (globalRule) {
              chargedCost = applyRule(globalRule, "pricing_rules");
            }
          }
        }

        const ruleLog = pricingRuleDetails
          ? `tipo=${(pricingRuleDetails as any).tipo_regra} | regra_valor=${(pricingRuleDetails as any).regra_valor} | custo_base=${(pricingRuleDetails as any).custo}`
          : "nenhuma regra encontrada";
        console.log(`pricing: role=${userRole} | source=${pricingSource} | ${ruleLog} | apiCost=${apiCost} | chargedCost=${chargedCost} | catalogValue=${catalogValue} | userId=${userId} | resellerId=${resellerId || "null"}`);

        // Safety: never allow cost below API cost (prevents loss)
        if (chargedCost <= 0 || chargedCost < apiCost) {
          console.warn(`PRICING SAFETY: chargedCost=${chargedCost} is below apiCost=${apiCost} for user=${userId} operator=${resolvedOperator} amount=${resolvedAmount}. Forcing apiCost as minimum.`);
          chargedCost = apiCost;
          pricingSource += "(safety_floor)";
        }

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
        let polledFailed = false;
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
                  polledFailed = true;
                  console.log(`recharge polling: found failed on attempt ${attempt + 1}`);
                  break;
                }
              }
            } catch { /* continue polling */ }
          }
        }

        // Determine final status
        const orderData = rechargeResult.data || {};
        const externalId = orderData.id || orderData._id || orderData.orderId || null;
        console.log("external_id resolved:", externalId, "orderData keys:", Object.keys(orderData));

        const operadoraName = orderData.operator || orderData.carrier?.name || resolvedOperator;
        const isFailed = polledFailed || orderData.status === "falha" || orderData.status === "cancelada" || orderData.status === "expirada";
        const isCompleted = !isFailed && (orderData.status === "feita" || orderData.status === "concluida" || orderData.status === "completed");

        // Only deduct balance if NOT failed (atomic)
        let newBalance = userBalance;
        if (!isFailed) {
          const { data: updatedBal } = await adminClient.rpc("increment_saldo", {
            p_user_id: userId,
            p_tipo: saldoTipo,
            p_amount: -chargedCost,
          });
          newBalance = Number(updatedBal) ?? (userBalance - chargedCost);
        } else {
          console.log(`recharge: NOT deducting balance — recharge failed. userId=${userId} chargedCost=${chargedCost}`);
        }

        // Save recarga locally
        const finalStatus = isFailed ? "falha" : (isCompleted ? "completed" : "pending");
        await adminClient.from("recargas").insert({
          user_id: userId,
          telefone: phoneNumber,
          operadora: operadoraName,
          valor: catalogValue,
          custo: chargedCost,
          custo_api: apiCost,
          status: finalStatus,
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

      case "public-recharge": {
        // Public recharge: reuses the "recharge" logic but userId is already set to reseller_id
        // We redirect to the recharge handler by re-dispatching with adjusted params
        const prOperator = params.operator;
        const prPhone = params.phone;
        const prAmount = params.amount ? Number(params.amount) : 0;

        if (!prOperator || !prPhone || !prAmount) {
          throw new Error("operator, phone e amount são obrigatórios");
        }

        // Resolve operator name and local operadora UUID
        let prResolvedOperator = prOperator;
        let prOperadoraId: string = prOperator;

        if (isUuid(prOperator)) {
          prOperadoraId = prOperator;
          try {
            const { data: opData } = await adminClient.from("operadoras").select("nome").eq("id", prOperator).single();
            if (opData?.nome) prResolvedOperator = normalize(opData.nome);
          } catch { /* fallback */ }
        } else {
          const { data: allOps } = await adminClient.from("operadoras").select("id, nome").eq("ativo", true);
          if (allOps?.length) {
            const matched = allOps.find((op: any) => normalize(op.nome) === normalize(prOperator));
            if (matched) prOperadoraId = matched.id;
          }
        }

        // Get API catalog cost
        const prCatalogResp = await proxyGet(apiKey, "/catalog");
        let prApiCost = 0;
        if (prCatalogResp?.success && prCatalogResp.data) {
          const carrier = prCatalogResp.data.find((c: any) => normalize(c.operator) === normalize(prResolvedOperator));
          if (carrier) {
            const val = carrier.values?.find((v: any) => Number(v.amount) === prAmount);
            if (val) prApiCost = Number(val.cost) || 0;
          }
        }
        if (prApiCost <= 0) throw new Error("Valor não encontrado no catálogo");

        // Resolve reseller pricing — check default margin first (like recharge action)
        let prChargedCost = prApiCost;
        let prPricingSource = "api_default";

        // Check if reseller has any custom pricing rules
        const { count: prCustomCount } = await adminClient
          .from("reseller_pricing_rules")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId);
        const prHasCustomPricing = (prCustomCount || 0) > 0;

        // Default margin — OVERRIDES when active and no custom pricing
        if (!prHasCustomPricing) {
          const { data: cfgRows } = await adminClient
            .from("system_config")
            .select("key, value")
            .in("key", ["defaultMarginEnabled", "defaultMarginType", "defaultMarginValue"]);
          const cfg: Record<string, string> = {};
          (cfgRows || []).forEach((r: any) => { cfg[r.key] = r.value; });
          if (cfg.defaultMarginEnabled === "true") {
            const marginType = cfg.defaultMarginType || "fixo";
            const marginValue = parseFloat(cfg.defaultMarginValue || "0");
            if (marginValue > 0) {
              prChargedCost = marginType === "fixo"
                ? prApiCost + marginValue
                : prApiCost * (1 + marginValue / 100);
              prChargedCost = Math.round(prChargedCost * 100) / 100;
              prPricingSource = "default_margin_override";
            }
          }
        }

        // If default margin didn't apply, check custom rules
        if (prPricingSource === "api_default") {
          const { data: resellerRule } = await adminClient
            .from("reseller_pricing_rules")
            .select("*")
            .eq("user_id", userId)
            .eq("operadora_id", prOperadoraId)
            .eq("valor_recarga", prAmount)
            .maybeSingle();
          if (resellerRule) {
            prChargedCost = resellerRule.tipo_regra === "fixo"
              ? (Number(resellerRule.regra_valor) > 0 ? Number(resellerRule.regra_valor) : Number(resellerRule.custo))
              : Number(resellerRule.custo) * (1 + Number(resellerRule.regra_valor) / 100);
            prPricingSource = "reseller_pricing_rules";
          } else {
            const { data: globalRule } = await adminClient
              .from("pricing_rules")
              .select("*")
              .eq("operadora_id", prOperadoraId)
              .eq("valor_recarga", prAmount)
              .maybeSingle();
            if (globalRule) {
              prChargedCost = globalRule.tipo_regra === "fixo"
                ? (Number(globalRule.regra_valor) > 0 ? Number(globalRule.regra_valor) : Number(globalRule.custo))
                : Number(globalRule.custo) * (1 + Number(globalRule.regra_valor) / 100);
              prPricingSource = "pricing_rules(fallback)";
            }
          }
        }

        // Safety floor: never charge below API cost
        if (prChargedCost <= 0 || prChargedCost < prApiCost) {
          console.warn(`PUBLIC-RECHARGE PRICING SAFETY: prChargedCost=${prChargedCost} is below prApiCost=${prApiCost}. Forcing apiCost as minimum.`);
          prChargedCost = prApiCost;
          prPricingSource += "(safety_floor)";
        }

        // Check reseller balance
        const { data: prSaldoData } = await adminClient
          .from("saldos")
          .select("valor")
          .eq("user_id", userId)
          .eq("tipo", "revenda")
          .single();
        const prBalance = Number(prSaldoData?.valor) || 0;

        console.log(`public-recharge: reseller=${userId} operator=${prResolvedOperator} amount=${prAmount} apiCost=${prApiCost} chargedCost=${prChargedCost} source=${prPricingSource} balance=${prBalance}`);

        if (prBalance < prChargedCost) throw new Error("Saldo insuficiente do revendedor");

        // Execute recharge via API
        const prRechargeBody: Record<string, unknown> = {
          operator: prResolvedOperator,
          phone: prPhone,
          amount: prAmount,
        };
        let prRechargeResult = await proxyPost(apiKey, "/recharges", prRechargeBody);
        console.log("public-recharge API response:", JSON.stringify(prRechargeResult));

        if (!prRechargeResult?.success) {
          throw new Error(prRechargeResult?.message || prRechargeResult?.error || "Erro ao criar recarga na API");
        }

        // Server-side polling
        const prOrderData0 = prRechargeResult.data || {};
        const prExtId = prOrderData0.id || prOrderData0._id || prOrderData0.orderId || null;
        let prPolledFailed = false;
        if (prExtId && prOrderData0.status !== "feita" && prOrderData0.status !== "completed") {
          const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
          for (let attempt = 0; attempt < 3; attempt++) {
            await sleep(5000);
            try {
              const pollResp = await proxyGet(apiKey, `/me/orders?page=1&limit=50`);
              if (pollResp?.success) {
                const pollOrders = Array.isArray(pollResp.data) ? pollResp.data : pollResp.data?.data || [];
                const found = pollOrders.find((o: any) => o._id === prExtId || o.id === prExtId);
                if (found && (found.status === "feita" || found.status === "completed")) {
                  prRechargeResult = { ...prRechargeResult, data: { ...prRechargeResult.data, ...found } };
                  break;
                }
                if (found && (found.status === "falha" || found.status === "cancelada" || found.status === "expirada")) {
                  prRechargeResult = { ...prRechargeResult, data: { ...prRechargeResult.data, ...found } };
                  prPolledFailed = true;
                  break;
                }
              }
            } catch { /* continue */ }
          }
        }

        // Save recarga
        const prOrderData = prRechargeResult.data || {};
        const prExternalId = prOrderData.id || prOrderData._id || prOrderData.orderId || null;
        const prOperadoraName = prOrderData.operator || prResolvedOperator;
        const prIsFailed = prPolledFailed || prOrderData.status === "falha" || prOrderData.status === "cancelada" || prOrderData.status === "expirada";
        const prIsCompleted = !prIsFailed && (prOrderData.status === "feita" || prOrderData.status === "concluida" || prOrderData.status === "completed");
        const prFinalStatus = prIsFailed ? "falha" : (prIsCompleted ? "completed" : "pending");

        // Only deduct balance if NOT failed (atomic)
        let prNewBalance = prBalance;
        if (!prIsFailed) {
          const { data: updatedBal } = await adminClient.rpc("increment_saldo", {
            p_user_id: userId,
            p_tipo: "revenda",
            p_amount: -prChargedCost,
          });
          prNewBalance = Number(updatedBal) ?? (prBalance - prChargedCost);
        } else {
          console.log(`public-recharge: NOT deducting balance — recharge failed. reseller=${userId} chargedCost=${prChargedCost}`);
        }

        await adminClient.from("recargas").insert({
          user_id: userId,
          telefone: prPhone,
          operadora: prOperadoraName,
          valor: prAmount,
          custo: prChargedCost,
          custo_api: prApiCost,
          status: prFinalStatus,
          external_id: prExternalId,
          completed_at: prIsCompleted ? new Date().toISOString() : null,
        });

        // Telegram notification
        if (prIsCompleted) {
          try {
            const notifyUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/telegram-notify`;
            await fetch(notifyUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}` },
              body: JSON.stringify({
                type: "recarga_completed",
                user_id: userId,
                data: { telefone: prPhone, operadora: prOperadoraName, valor_recarga: prAmount, custo: prChargedCost, novo_saldo: prNewBalance },
              }),
            });
          } catch { /* ignore */ }
        }

        result = {
          success: true,
          data: {
            ...prOrderData,
            _id: prExternalId,
            carrier: { name: prOperadoraName },
            value: prAmount,
            localBalance: prNewBalance,
            cost: prChargedCost,
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
