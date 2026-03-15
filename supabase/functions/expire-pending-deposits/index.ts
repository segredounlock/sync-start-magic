import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const cutoff = new Date(Date.now() - 45 * 60 * 1000).toISOString();

    const { data: expired, error } = await supabase
      .from("transactions")
      .update({ status: "expired", updated_at: new Date().toISOString() })
      .eq("status", "pending")
      .eq("type", "deposit")
      .lt("created_at", cutoff)
      .select("id");

    if (error) {
      console.error("Error expiring deposits:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const count = expired?.length || 0;
    console.log(`Expired ${count} pending deposits older than 45 min`);

    return new Response(JSON.stringify({ success: true, expired_count: count }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Expire deposits error:", err);
    return new Response(JSON.stringify({ error: "internal" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
