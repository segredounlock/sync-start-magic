import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const API_BASE = "https://express.poeki.dev/api/v2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  try {
    // 1. Get API key from system_config
    const { data: configData } = await adminClient
      .from("system_config")
      .select("value")
      .eq("key", "apiKey")
      .single();
    if (!configData?.value) {
      return new Response(JSON.stringify({ error: "API Key não configurada" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const apiKey = configData.value;

    // 2. Fetch catalog from v2 API
    const resp = await fetch(`${API_BASE}/catalog`, {
      headers: { "X-API-Key": apiKey, Accept: "application/json" },
    });
    const catalogText = await resp.text();
    let catalog: any;
    try {
      catalog = JSON.parse(catalogText);
    } catch {
      console.error(`Catalog parse error: ${catalogText.slice(0, 500)}`);
      throw new Error("API retornou resposta inválida");
    }

    if (!catalog?.data?.length) {
      return new Response(JSON.stringify({ success: true, message: "Catálogo vazio", synced: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const carriers = catalog.data;
    const syncedNames: string[] = [];

    // 3. Sync each carrier (v2 format: operator, values[].amount/cost)
    for (const carrier of carriers) {
      const nome = (carrier.operator || carrier.name || "unknown").toUpperCase();
      const values = carrier.values || [];
      const valores = values.map((v: any) => v.amount || v.value || v.cost).filter((v: number) => v > 0);

      // Upsert operadora (case-insensitive match to prevent duplicates)
      const { data: existing } = await adminClient
        .from("operadoras")
        .select("id, valores, nome")
        .ilike("nome", nome)
        .maybeSingle();

      let opId: string;
      const prevValores = new Set<number>(
        ((existing?.valores as number[]) || []).map(Number)
      );

      if (existing) {
        await adminClient
          .from("operadoras")
          .update({ valores, ativo: true, updated_at: new Date().toISOString() })
          .eq("id", existing.id);
        opId = existing.id;
      } else {
        const { data: inserted } = await adminClient
          .from("operadoras")
          .insert({ nome, valores, ativo: true })
          .select("id")
          .single();
        opId = inserted?.id || "";
      }

      if (!opId) continue;
      syncedNames.push(nome);

      // Sync pricing_rules — always update custo from API, preserve custom pricing
      const apiValores = new Set<number>();
      for (const v of values) {
        const faceValue = v.amount || v.value || v.cost;
        const apiCost = v.cost || 0;
        if (faceValue > 0 && apiCost > 0) {
          apiValores.add(Number(faceValue));
          const { data: existingRule } = await adminClient
            .from("pricing_rules")
            .select("id, custo, tipo_regra, regra_valor")
            .eq("operadora_id", opId)
            .eq("valor_recarga", faceValue)
            .maybeSingle();

          if (existingRule) {
            // Only update API cost, preserve tipo_regra and regra_valor (admin customizations)
            if (Number(existingRule.custo) !== Number(apiCost)) {
              await adminClient
                .from("pricing_rules")
                .update({ custo: apiCost })
                .eq("id", existingRule.id);
              console.log(`[Sync] Custo: ${nome} R$${faceValue} → R$${apiCost}`);
            }
          } else {
            await adminClient.from("pricing_rules").insert({
              operadora_id: opId,
              valor_recarga: faceValue,
              custo: apiCost,
              tipo_regra: "fixo",
              regra_valor: 0,
            });
            console.log(`[Sync] Nova regra: ${nome} R$${faceValue}`);

            // Auto-propagate to users with existing reseller_base_pricing_rules for this carrier
            const { data: usersWithRules } = await adminClient
              .from("reseller_base_pricing_rules")
              .select("user_id")
              .eq("operadora_id", opId);

            if (usersWithRules?.length) {
              const distinctUsers = [...new Set(usersWithRules.map((r: any) => r.user_id))];
              for (const uid of distinctUsers) {
                // Check if user already has a rule for this value
                const { data: existing } = await adminClient
                  .from("reseller_base_pricing_rules")
                  .select("id")
                  .eq("user_id", uid)
                  .eq("operadora_id", opId)
                  .eq("valor_recarga", faceValue)
                  .maybeSingle();

                if (!existing) {
                  // Calculate average margin from user's existing rules for this carrier
                  const { data: userRules } = await adminClient
                    .from("reseller_base_pricing_rules")
                    .select("regra_valor, custo")
                    .eq("user_id", uid)
                    .eq("operadora_id", opId);

                  let avgMargin = 0.5; // fallback
                  if (userRules?.length) {
                    const margins = userRules.map((r: any) => Number(r.regra_valor) - Number(r.custo));
                    avgMargin = margins.reduce((a: number, b: number) => a + b, 0) / margins.length;
                    if (avgMargin <= 0) avgMargin = 0.5;
                  }

                  await adminClient.from("reseller_base_pricing_rules").insert({
                    user_id: uid,
                    operadora_id: opId,
                    valor_recarga: faceValue,
                    custo: apiCost,
                    tipo_regra: "fixo",
                    regra_valor: apiCost + avgMargin,
                  });
                  console.log(`[Sync] Auto-propagado: ${nome} R$${faceValue} → user ${uid} (margem R$${avgMargin.toFixed(2)})`);
                }
              }
            }
          }
        }
      }

      // Orphan pricing_rules: keep them so admin customizations are preserved
      // When the value returns to the API, the existing rule (with custom pricing) will be reused
      const { data: existingRules } = await adminClient
        .from("pricing_rules")
        .select("id, valor_recarga")
        .eq("operadora_id", opId);
      if (existingRules) {
        for (const rule of existingRules) {
          if (!apiValores.has(Number(rule.valor_recarga))) {
            console.log(`[Sync] Regra órfã preservada: ${nome} R$${rule.valor_recarga}`);
          }
        }
      }

      // Sync disabled_recharge_values
      // Auto-disable values removed from API
      for (const pv of prevValores) {
        if (!apiValores.has(pv)) {
          const { data: alreadyDisabled } = await adminClient
            .from("disabled_recharge_values")
            .select("id")
            .eq("operadora_id", opId)
            .eq("valor", pv)
            .maybeSingle();
          if (!alreadyDisabled) {
            await adminClient.from("disabled_recharge_values").insert({
              operadora_id: opId,
              valor: pv,
              disabled_by: "00000000-0000-0000-0000-000000000000",
            });
            console.log(`[Sync] Auto-desativado: ${nome} R$${pv}`);
          }
        }
      }
      // Re-enable values that returned to API
      for (const av of apiValores) {
        await adminClient
          .from("disabled_recharge_values")
          .delete()
          .eq("operadora_id", opId)
          .eq("valor", av);
      }
    }

    // 4. Deactivate operadoras not in API
    const apiNamesLower = carriers.map((c: any) =>
      (c.operator || c.name)?.toLowerCase?.()
    );
    const { data: allLocalOps } = await adminClient
      .from("operadoras")
      .select("id, nome")
      .eq("ativo", true);
    if (allLocalOps) {
      for (const localOp of allLocalOps) {
        if (!apiNamesLower.includes(localOp.nome?.toLowerCase?.())) {
          await adminClient
            .from("operadoras")
            .update({ ativo: false, updated_at: new Date().toISOString() })
            .eq("id", localOp.id);
          console.log(`[Sync] Operadora desativada: ${localOp.nome}`);
        }
      }
    }

    const result = {
      success: true,
      synced: syncedNames.length,
      carriers: syncedNames,
      timestamp: new Date().toISOString(),
    };
    console.log(`[Sync] Concluído: ${syncedNames.length} operadora(s)`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[Sync] Erro:", err.message);
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
