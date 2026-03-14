import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const jsonHeaders = {
  ...corsHeaders,
  "Content-Type": "application/json",
};

async function getConfig(supabaseAdmin: any) {
  const keys = ["scratchEnabled", "scratchWinChance", "scratchMinPrize", "scratchMaxPrize"];
  const { data } = await supabaseAdmin
    .from("system_config")
    .select("key, value")
    .in("key", keys);

  const config: Record<string, string> = {};
  (data || []).forEach((r: any) => {
    config[r.key] = r.value;
  });

  return {
    enabled: (config.scratchEnabled ?? "true") === "true",
    winChance: Math.min(100, Math.max(0, parseFloat(config.scratchWinChance || "70"))) / 100,
    minPrize: Math.max(0.01, parseFloat(config.scratchMinPrize || "0.10")),
    maxPrize: Math.max(0.01, parseFloat(config.scratchMaxPrize || "2.00")),
  };
}

function generatePrize(min: number, max: number): number {
  const rand = Math.pow(Math.random(), 2);
  const raw = min + rand * (max - min);
  return Math.round(raw * 100) / 100;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No auth" }), { status: 401, headers: jsonHeaders });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);
    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authError,
    } = await supabaseUser.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: jsonHeaders });
    }

    const body = await req.json();
    const { action } = body;

    const config = await getConfig(supabaseAdmin);

    if (!config.enabled) {
      return new Response(
        JSON.stringify({ error: "disabled", message: "Raspadinha está desativada no momento." }),
        { status: 400, headers: jsonHeaders },
      );
    }

    if (action === "claim") {
      const today = new Date().toISOString().slice(0, 10);
      const { data: existing } = await supabaseAdmin
        .from("scratch_cards")
        .select("id, is_scratched, prize_amount, is_won")
        .eq("user_id", user.id)
        .eq("card_date", today)
        .maybeSingle();

      if (existing) {
        return new Response(
          JSON.stringify({
            error: "already_claimed",
            card: {
              id: existing.id,
              card_date: today,
              is_scratched: existing.is_scratched,
              prize_amount: existing.is_scratched ? existing.prize_amount : undefined,
              is_won: existing.is_scratched ? existing.is_won : undefined,
            },
          }),
          { status: 200, headers: jsonHeaders },
        );
      }

      const isWin = Math.random() < config.winChance;
      const prizeAmount = isWin ? generatePrize(config.minPrize, config.maxPrize) : 0;

      const { data: card, error: insertError } = await supabaseAdmin
        .from("scratch_cards")
        .insert({
          user_id: user.id,
          prize_amount: prizeAmount,
          is_won: isWin,
          card_date: today,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Insert error:", insertError);
        return new Response(JSON.stringify({ error: insertError.message }), { status: 500, headers: jsonHeaders });
      }

      return new Response(
        JSON.stringify({
          card: { id: card.id, card_date: card.card_date, is_scratched: false },
        }),
        { headers: jsonHeaders },
      );
    }

    if (action === "scratch") {
      const today = new Date().toISOString().slice(0, 10);

      const { data: card } = await supabaseAdmin
        .from("scratch_cards")
        .select("*")
        .eq("user_id", user.id)
        .eq("card_date", today)
        .eq("is_scratched", false)
        .maybeSingle();

      if (!card) {
        return new Response(
          JSON.stringify({ error: "no_card", message: "Nenhuma raspadinha para raspar" }),
          { status: 400, headers: jsonHeaders },
        );
      }

      await supabaseAdmin
        .from("scratch_cards")
        .update({ is_scratched: true, scratched_at: new Date().toISOString() })
        .eq("id", card.id);

      if (card.is_won && card.prize_amount > 0) {
        const { data: saldo } = await supabaseAdmin
          .from("saldos")
          .select("valor")
          .eq("user_id", user.id)
          .eq("tipo", "revenda")
          .single();

        if (saldo) {
          await supabaseAdmin
            .from("saldos")
            .update({ valor: Number(saldo.valor) + Number(card.prize_amount) })
            .eq("user_id", user.id)
            .eq("tipo", "revenda");
        }
      }

      return new Response(
        JSON.stringify({
          prize_amount: card.prize_amount,
          is_won: card.is_won,
        }),
        { headers: jsonHeaders },
      );
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400, headers: jsonHeaders });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Erro interno" }),
      { status: 500, headers: jsonHeaders },
    );
  }
});
