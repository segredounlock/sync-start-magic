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
      const nome = carrier.operator || carrier.name || "unknown";
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

      // Sync pricing_rules — always update custo from API
      const apiValores = new Set<number>();
      for (const v of values) {
        const faceValue = v.amount || v.value || v.cost;
        const apiCost = v.cost || 0;
        if (faceValue > 0 && apiCost > 0) {
          apiValores.add(Number(faceValue));
          const { data: existingRule } = await adminClient
            .from("pricing_rules")
            .select("id, custo")
            .eq("operadora_id", opId)
            .eq("valor_recarga", faceValue)
            .maybeSingle();

          if (existingRule) {
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
          }
        }
      }

      // Remove orphan pricing_rules
      const { data: existingRules } = await adminClient
        .from("pricing_rules")
        .select("id, valor_recarga")
        .eq("operadora_id", opId);
      if (existingRules) {
        for (const rule of existingRules) {
          if (!apiValores.has(Number(rule.valor_recarga))) {
            await adminClient.from("pricing_rules").delete().eq("id", rule.id);
            console.log(`[Sync] Regra removida: ${nome} R$${rule.valor_recarga}`);
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
