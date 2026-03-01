import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
        .select("id, nome, email")
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
        .select("id, nome, email")
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

    // Action: operadoras - Get from RecargaExpress API catalog
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

        const catalogResp = await fetch("https://express.poeki.dev/api/v1/catalog", {
          headers: { "X-API-Key": configData.value, Accept: "application/json" },
        });
        const catalogData = await catalogResp.json();
        console.log("[telegram-miniapp] catalog response success:", catalogData?.success);

        if (catalogData?.success && catalogData.data) {
          const operadoras = catalogData.data.map((carrier: any) => ({
            id: carrier.carrierId,
            nome: carrier.name,
            carrierId: carrier.carrierId,
              valores: (carrier.values || []).map((v: any) => {
                const resolvedValue =
                  (Number(v?.value) > 0 ? Number(v.value) : 0) ||
                  (Number(v?.faceValue) > 0 ? Number(v.faceValue) : 0) ||
                  (Number(v?.amount) > 0 ? Number(v.amount) : 0) ||
                  (Number(v?.rechargeValue) > 0 ? Number(v.rechargeValue) : 0) ||
                  (() => {
                    const label = String(v?.label || "").replace(/,/g, ".");
                    const nums = label.match(/\d+(?:\.\d{1,2})?/g);
                    if (!nums?.length) return Number(v?.cost) || 0;
                    const parsed = Number(nums[nums.length - 1]);
                    return Number.isFinite(parsed) && parsed > 0 ? parsed : Number(v?.cost) || 0;
                  })();

                return {
                  valueId: v.valueId,
                  cost: Number(v.cost || 0),
                  value: resolvedValue,
                  label: v.label || `R$ ${resolvedValue || v.cost}`,
                };
              }),
          }));

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
