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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify caller is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Não autorizado");

    const callerClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) throw new Error("Não autorizado");

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: roleData } = await adminClient.from("user_roles").select("role").eq("user_id", caller.id).eq("role", "admin").maybeSingle();
    if (!roleData) throw new Error("Acesso negado: apenas administradores");

    const { user_id, role, action } = await req.json();
    if (!user_id || !role) throw new Error("user_id e role são obrigatórios");

    if (action === "remove") {
      const { error } = await adminClient.from("user_roles").delete().eq("user_id", user_id).eq("role", role);
      if (error) throw error;
      await adminClient.from("audit_logs").insert({
        admin_id: caller.id,
        action: "remove_role",
        target_type: "role",
        target_id: user_id,
        details: { role },
      });
      return new Response(JSON.stringify({ success: true, action: "removed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      const { error } = await adminClient.from("user_roles").upsert({ user_id, role }, { onConflict: "user_id,role" });
      if (error) throw error;
      await adminClient.from("audit_logs").insert({
        admin_id: caller.id,
        action: "add_role",
        target_type: "role",
        target_id: user_id,
        details: { role },
      });
      return new Response(JSON.stringify({ success: true, action: "added" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
