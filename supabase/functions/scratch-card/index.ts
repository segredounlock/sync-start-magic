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

interface Tier {
  chance: number; // 0-1
  min: number;
  max: number;
}

async function getConfig(supabaseAdmin: any) {
  const keys = [
    "scratchEnabled",
    // Legacy single-tier keys
    "scratchWinChance", "scratchMinPrize", "scratchMaxPrize",
    // New tiered keys
    "scratchTier1Chance", "scratchTier1Min", "scratchTier1Max",
    "scratchTier2Chance", "scratchTier2Min", "scratchTier2Max",
    "scratchTier3Chance", "scratchTier3Min", "scratchTier3Max",
  ];
  const { data } = await supabaseAdmin
    .from("system_config")
    .select("key, value")
    .in("key", keys);

  const c: Record<string, string> = {};
  (data || []).forEach((r: any) => {
    c[r.key] = r.value;
  });

  const enabled = (c.scratchEnabled ?? "true") === "true";

  // Build tiers – fall back to legacy single-tier config
  const tiers: Tier[] = [];

  if (c.scratchTier1Chance) {
    tiers.push({
      chance: Math.min(100, Math.max(0, parseFloat(c.scratchTier1Chance || "20"))) / 100,
      min: Math.max(0.01, parseFloat(c.scratchTier1Min || "0.10")),
      max: Math.max(0.01, parseFloat(c.scratchTier1Max || "1.00")),
    });
  }
  if (c.scratchTier2Chance) {
    tiers.push({
      chance: Math.min(100, Math.max(0, parseFloat(c.scratchTier2Chance || "5"))) / 100,
      min: Math.max(0.01, parseFloat(c.scratchTier2Min || "1.00")),
      max: Math.max(0.01, parseFloat(c.scratchTier2Max || "10.00")),
    });
  }
  if (c.scratchTier3Chance) {
    tiers.push({
      chance: Math.min(100, Math.max(0, parseFloat(c.scratchTier3Chance || "1"))) / 100,
      min: Math.max(0.01, parseFloat(c.scratchTier3Min || "10.00")),
      max: Math.max(0.01, parseFloat(c.scratchTier3Max || "100.00")),
    });
  }

  // Legacy fallback
  if (tiers.length === 0) {
    tiers.push({
      chance: Math.min(100, Math.max(0, parseFloat(c.scratchWinChance || "20"))) / 100,
      min: Math.max(0.01, parseFloat(c.scratchMinPrize || "0.10")),
      max: Math.max(0.01, parseFloat(c.scratchMaxPrize || "2.00")),
    });
  }

  return { enabled, tiers };
}

function rollPrize(tiers: Tier[]): { isWon: boolean; prizeAmount: number } {
  // Try each tier from highest to lowest (reverse order = rarest first)
  const sorted = [...tiers].sort((a, b) => a.chance - b.chance);

  for (const tier of sorted) {
    if (Math.random() < tier.chance) {
      // Won this tier – generate prize within range
      const rand = Math.pow(Math.random(), 2); // skew towards min
      const raw = tier.min + rand * (tier.max - tier.min);
      const prizeAmount = Math.round(raw * 100) / 100;
      return { isWon: true, prizeAmount };
    }
  }

  return { isWon: false, prizeAmount: 0 };
}

/** Get today's date in Brazil timezone (America/Sao_Paulo) */
function getTodayBR(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
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

    const body = await req.json();

    // Dual auth: try JWT user first, fallback to service_role + user_id
    let userId: string | null = null;

    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();

    if (!authError && user) {
      userId = user.id;
    } else if (body?.user_id) {
      // Verify it's a service_role call by checking the token matches service key
      const token = authHeader.replace("Bearer ", "");
      if (token === serviceKey) {
        userId = body.user_id;
      }
    }

    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: jsonHeaders });
    }

    const { action } = body;

    const { enabled, tiers } = await getConfig(supabaseAdmin);

    if (!enabled) {
      return new Response(
        JSON.stringify({ error: "disabled", message: "Raspadinha está desativada no momento." }),
        { status: 400, headers: jsonHeaders },
      );
    }

    // Check minimum spending requirement (R$50 in completed recharges)
    const MIN_SPENDING = 50;
    const { data: spendingData } = await supabaseAdmin
      .from("recargas")
      .select("custo")
      .eq("user_id", userId)
      .eq("status", "completed");

    const totalSpent = (spendingData || []).reduce((sum: number, r: any) => sum + Number(r.custo || 0), 0);

    if (totalSpent < MIN_SPENDING) {
      return new Response(
        JSON.stringify({
          error: "insufficient_spending",
          message: `Você precisa ter pelo menos R$ ${MIN_SPENDING.toFixed(2)} em recargas para acessar a raspadinha.`,
          total_spent: Math.round(totalSpent * 100) / 100,
          min_required: MIN_SPENDING,
        }),
        { status: 200, headers: jsonHeaders },
      );
    }

    if (action === "claim") {
      const today = getTodayBR();
      const { data: existing } = await supabaseAdmin
        .from("scratch_cards")
        .select("id, is_scratched, prize_amount, is_won")
        .eq("user_id", userId)
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

      const { isWon, prizeAmount } = rollPrize(tiers);

      const { data: card, error: insertError } = await supabaseAdmin
        .from("scratch_cards")
        .insert({
          user_id: userId,
          prize_amount: prizeAmount,
          is_won: isWon,
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
      const cardId = body?.card_id as string | undefined;
      const today = getTodayBR();

      let card: any = null;

      if (cardId) {
        const byId = await supabaseAdmin
          .from("scratch_cards")
          .select("*")
          .eq("id", cardId)
          .eq("user_id", userId)
          .eq("is_scratched", false)
          .maybeSingle();

        card = byId.data;
      }

      if (!card) {
        const byDate = await supabaseAdmin
          .from("scratch_cards")
          .select("*")
          .eq("user_id", user.id)
          .eq("card_date", today)
          .eq("is_scratched", false)
          .maybeSingle();

        card = byDate.data;
      }

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
