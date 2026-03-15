import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, serviceKey);

    // 1. Find completed recargas with custo=0 but custo_api > 0 (unpaid debts)
    const { data: debts, error: debtsErr } = await sb
      .from("recargas")
      .select("id, user_id, custo_api, operadora, telefone, valor")
      .eq("status", "completed")
      .eq("custo", 0)
      .gt("custo_api", 0);

    if (debtsErr) throw debtsErr;
    if (!debts || debts.length === 0) {
      return new Response(
        JSON.stringify({ collected: 0, message: "No pending debts" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 2. Group debts by user_id to handle users with multiple debts
    const userDebts = new Map<string, typeof debts>();
    for (const d of debts) {
      const existing = userDebts.get(d.user_id) || [];
      existing.push(d);
      userDebts.set(d.user_id, existing);
    }

    let totalCollected = 0;
    const collectedDetails: string[] = [];

    for (const [userId, userRecargaDebts] of userDebts) {
      // Get current balance
      const { data: saldo } = await sb
        .from("saldos")
        .select("valor")
        .eq("user_id", userId)
        .eq("tipo", "revenda")
        .single();

      if (!saldo || saldo.valor <= 0) continue;

      // Sort by custo_api ascending — pay smaller debts first
      const sorted = userRecargaDebts.sort(
        (a: any, b: any) => a.custo_api - b.custo_api,
      );

      let totalDeducted = 0;
      let availableBalance = saldo.valor;

      for (const debt of sorted) {
        if (availableBalance < debt.custo_api) continue; // not enough for this debt

        // Deduct atomically
        const { data: newBal } = await sb.rpc("increment_saldo", {
          p_user_id: userId,
          p_tipo: "revenda",
          p_amount: -debt.custo_api,
        });
        availableBalance = Number(newBal) || (availableBalance - debt.custo_api);
        totalDeducted += debt.custo_api;

        // Update recarga custo
        await sb
          .from("recargas")
          .update({ custo: debt.custo_api })
          .eq("id", debt.id);

        // Audit log
        await sb.from("audit_logs").insert({
          admin_id: "00000000-0000-0000-0000-000000000000",
          action: "auto_collect_debt",
          target_type: "saldo",
          target_id: userId,
          details: {
            recarga_id: debt.id,
            valor_cobrado: debt.custo_api,
            operadora: debt.operadora,
            telefone: debt.telefone,
            tipo: "cobrança_automática",
          },
        });
      }

      if (totalDeducted > 0) {
        // Get user name for notification
        const { data: profile } = await sb
          .from("profiles")
          .select("nome, email")
          .eq("id", userId)
          .single();

        const userName =
          profile?.nome || profile?.email || userId.slice(0, 8);

        totalCollected += totalDeducted;
        collectedDetails.push(`${userName}: R$ ${totalDeducted.toFixed(2)}`);

        // Admin notification (highlighted)
        await sb.from("admin_notifications").insert({
          type: "debt_collected",
          status: "new",
          message: `💰 Cobrança automática: R$ ${totalDeducted.toFixed(2)} descontado de ${userName} (custo API pendente)`,
          amount: totalDeducted,
          user_id: userId,
          user_nome: profile?.nome || null,
          user_email: profile?.email || null,
          is_read: false,
        });
      }
    }

    console.log(
      `[collect-pending-debts] Collected R$ ${totalCollected.toFixed(2)} from ${collectedDetails.length} users`,
    );

    return new Response(
      JSON.stringify({
        collected: totalCollected,
        users: collectedDetails.length,
        details: collectedDetails,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[collect-pending-debts] Error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
