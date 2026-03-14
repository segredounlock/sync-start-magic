import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "No auth" }), { status: 401, headers: corsHeaders });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);
    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const { action } = await req.json();

    if (action === "claim") {
      // Check if user already has a card today
      const today = new Date().toISOString().slice(0, 10);
      const { data: existing } = await supabaseAdmin
        .from("scratch_cards")
        .select("id")
        .eq("user_id", user.id)
        .eq("card_date", today)
        .maybeSingle();

      if (existing) {
        return new Response(JSON.stringify({ error: "already_claimed", message: "Você já resgatou sua raspadinha hoje!" }), { status: 400, headers: corsHeaders });
      }

      // Determine prize: 70% chance to win, amounts R$0.10 to R$2.00
      const isWin = Math.random() < 0.7;
      const prizeOptions = [0.10, 0.15, 0.20, 0.25, 0.30, 0.50, 0.75, 1.00, 1.50, 2.00];
      // Weighted: smaller prizes more likely
      const weights = [25, 20, 15, 12, 10, 8, 5, 3, 1.5, 0.5];
      let prizeAmount = 0;

      if (isWin) {
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        let rand = Math.random() * totalWeight;
        for (let i = 0; i < weights.length; i++) {
          rand -= weights[i];
          if (rand <= 0) { prizeAmount = prizeOptions[i]; break; }
        }
      }

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
        return new Response(JSON.stringify({ error: insertError.message }), { status: 500, headers: corsHeaders });
      }

      return new Response(JSON.stringify({ card: { id: card.id, card_date: card.card_date, is_scratched: false } }), { headers: corsHeaders });
    }

    if (action === "scratch") {
      const { card_id } = await req.json().catch(() => ({}));
      // Get card_id from body
      const body = JSON.parse(await new Response(req.body).text().catch(() => "{}"));
      
      // Re-parse since we already consumed the body above
      const today = new Date().toISOString().slice(0, 10);
      
      // Find today's unscratched card
      const { data: card, error: findError } = await supabaseAdmin
        .from("scratch_cards")
        .select("*")
        .eq("user_id", user.id)
        .eq("card_date", today)
        .eq("is_scratched", false)
        .maybeSingle();

      if (!card) {
        return new Response(JSON.stringify({ error: "no_card", message: "Nenhuma raspadinha para raspar" }), { status: 400, headers: corsHeaders });
      }

      // Mark as scratched
      await supabaseAdmin
        .from("scratch_cards")
        .update({ is_scratched: true, scratched_at: new Date().toISOString() })
        .eq("id", card.id);

      // Credit balance if won
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
            .update({ valor: saldo.valor + card.prize_amount })
            .eq("user_id", user.id)
            .eq("tipo", "revenda");
        }
      }

      return new Response(JSON.stringify({
        prize_amount: card.prize_amount,
        is_won: card.is_won,
      }), { headers: corsHeaders });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400, headers: corsHeaders });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
