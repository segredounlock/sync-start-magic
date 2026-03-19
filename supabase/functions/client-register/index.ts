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
    const { email, password, nome, reseller_id } = await req.json();
    if (!email || !password) throw new Error("E-mail e senha são obrigatórios");
    if (password.length < 6) throw new Error("Senha deve ter no mínimo 6 caracteres");
    if (!reseller_id) throw new Error("ID do revendedor é obrigatório");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Verify reseller exists (any authenticated user can have a referral network)
    const { data: resellerProfile, error: profileError } = await adminClient
      .from("profiles")
      .select("active")
      .eq("id", reseller_id)
      .single();

    if (profileError || !resellerProfile) {
      throw new Error("Revendedor não encontrado");
    }
    if (!resellerProfile.active) throw new Error("Revendedor inativo");

    // Create user
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nome: nome || "" },
    });
    if (createError) throw createError;

    // Set reseller_id on profile (trigger already created profile + saldo)
    await adminClient
      .from("profiles")
      .update({ reseller_id } as any)
      .eq("id", newUser.user.id);

    // Assign 'cliente' role
    const { error: roleError } = await adminClient
      .from("user_roles")
      .insert({ user_id: newUser.user.id, role: "usuario" });
    if (roleError) throw roleError;

    return new Response(JSON.stringify({ success: true, userId: newUser.user.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
