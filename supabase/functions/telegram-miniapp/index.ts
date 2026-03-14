import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const API_BASE = "https://express.poeki.dev/api/v2";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, telegram_id, user_id } = body;
    console.log(`[telegram-miniapp] action=${action || "lookup"} telegram_id=${telegram_id || "-"} user_id=${user_id || "-"}`);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Action: lookup - Find user by telegram_id
    if (action === "lookup" || !action) {
      if (!telegram_id) {
        return new Response(JSON.stringify({ error: "telegram_id required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, nome, email, avatar_url")
        .eq("telegram_id", String(telegram_id))
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        return new Response(JSON.stringify({ found: false }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: saldoData } = await supabase
        .from("saldos")
        .select("valor")
        .eq("user_id", profile.id)
        .eq("tipo", "revenda")
        .maybeSingle();

      return new Response(JSON.stringify({
        found: true,
        user_id: profile.id,
        nome: profile.nome || profile.email || "",
        saldo: Number(saldoData?.valor || 0),
        avatar_url: profile.avatar_url || null,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: lookup_by_user_id - Find user by auth user_id
    if (action === "lookup_by_user_id") {
      if (!user_id) {
        return new Response(JSON.stringify({ error: "user_id required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, nome, email, avatar_url")
        .eq("id", user_id)
        .maybeSingle();

      if (!profile) {
        return new Response(JSON.stringify({ found: false }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: saldoData } = await supabase
        .from("saldos")
        .select("valor")
        .eq("user_id", profile.id)
        .eq("tipo", "revenda")
        .maybeSingle();

      return new Response(JSON.stringify({
        found: true,
        user_id: profile.id,
        nome: profile.nome || profile.email || "",
        saldo: Number(saldoData?.valor || 0),
        avatar_url: profile.avatar_url || null,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: saldo - Refresh balance
    if (action === "saldo") {
      if (!user_id) {
        return new Response(JSON.stringify({ error: "user_id required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: saldoData } = await supabase
        .from("saldos")
        .select("valor")
        .eq("user_id", user_id)
        .eq("tipo", "revenda")
        .maybeSingle();

      return new Response(JSON.stringify({
        saldo: Number(saldoData?.valor || 0),
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: recargas - Get history
    if (action === "recargas") {
      if (!user_id) {
        return new Response(JSON.stringify({ error: "user_id required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: recargas } = await supabase
        .from("recargas")
        .select("id, telefone, valor, operadora, status, created_at, external_id")
        .eq("user_id", user_id)
        .order("created_at", { ascending: false })
        .limit(20);

      return new Response(JSON.stringify({ recargas: recargas || [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: operadoras - Get from RecargaExpress API v2 catalog with pricing rules applied
    if (action === "operadoras") {
      try {
        const { data: configData } = await supabase
          .from("system_config")
          .select("value")
          .eq("key", "apiKey")
          .single();

        if (!configData?.value) {
          return new Response(JSON.stringify({ operadoras: [], error: "API Key não configurada" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const catalogResp = await fetch(`${API_BASE}/catalog`, {
          headers: { "X-API-Key": configData.value, Accept: "application/json" },
        });
        const catalogData = await catalogResp.json();
        console.log("[telegram-miniapp] catalog response success:", catalogData?.success);

        if (catalogData?.success && catalogData.data) {
          const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
          let userRole = "usuario";
          let resellerId: string | null = null;
          let resellerRules: any[] = [];
          let globalRules: any[] = [];

          if (user_id) {
            const { data: roleData } = await supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", user_id)
              .maybeSingle();
            userRole = roleData?.role || "usuario";

            if (userRole === "cliente") {
              const { data: profileData } = await supabase
                .from("profiles")
                .select("reseller_id")
                .eq("id", user_id)
                .single();
              resellerId = profileData?.reseller_id || null;
            }

            // Load pricing rules
            const { data: gRules } = await supabase.from("pricing_rules").select("*");
            globalRules = gRules || [];

            const pricingUserId = (userRole === "cliente" && resellerId) ? resellerId : user_id;
            const { data: rRules } = await supabase
              .from("reseller_pricing_rules")
              .select("*")
              .eq("user_id", pricingUserId);
            resellerRules = rRules || [];
          }

          // Load local operadoras to map carrier names to UUIDs
          const { data: localOps } = await supabase.from("operadoras").select("id, nome").eq("ativo", true);
          const localOpsList = localOps || [];

          const applyRule = (rule: any) => {
            return rule.tipo_regra === "fixo"
              ? Number(rule.regra_valor)
              : Number(rule.custo) * (1 + Number(rule.regra_valor) / 100);
          };

          // Load disabled values
          const { data: disabledRows } = await supabase.from("disabled_recharge_values").select("operadora_id, valor");
          const disabledSet = new Set((disabledRows || []).map((d: any) => `${d.operadora_id}-${Number(d.valor)}`));

          // Map v2 catalog format
          const operadoras = catalogData.data.map((carrier: any) => {
            const operatorName = carrier.operator || carrier.name;
            const localOp = localOpsList.find((op: any) => normalize(op.nome) === normalize(operatorName));
            const operadoraId = localOp?.id || null;

            return {
              id: operatorName,
              nome: operatorName,
              carrierId: operatorName,
              valores: (carrier.values || []).map((v: any) => {
                const faceValue = v.amount || v.value || 0;
                const apiCost = Number(v.cost || 0);
                let userCost = apiCost;

                // Apply pricing rules if we have operadoraId
                if (operadoraId && user_id) {
                  const rRule = resellerRules.find((r: any) => r.operadora_id === operadoraId && Number(r.valor_recarga) === faceValue);
                  if (rRule) {
                    userCost = applyRule(rRule);
                  } else {
                    const gRule = globalRules.find((r: any) => r.operadora_id === operadoraId && Number(r.valor_recarga) === faceValue);
                    if (gRule) {
                      userCost = applyRule(gRule);
                    }
                  }
                }

                return {
                  valueId: `${operatorName}_${faceValue}`,
                  cost: apiCost,
                  userCost,
                  value: faceValue,
                  amount: faceValue,
                  label: `R$ ${faceValue || apiCost}`,
                  _disabled: operadoraId ? disabledSet.has(`${operadoraId}-${faceValue}`) : false,
                };
              }).filter((v: any) => !v._disabled),
            };
          });

          return new Response(JSON.stringify({ operadoras }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ operadoras: [], error: "Falha ao buscar catálogo" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (catalogErr: any) {
        console.error("[telegram-miniapp] catalog error:", catalogErr);
        return new Response(JSON.stringify({ operadoras: [], error: catalogErr.message }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("telegram-miniapp error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
