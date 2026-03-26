import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const COMMON_PASSWORDS = [
  "123456", "12345678", "123456789", "1234567890", "password", "qwerty",
  "abc123", "111111", "123123", "admin123", "letmein", "welcome",
  "monkey", "dragon", "master", "login", "princess", "football",
  "shadow", "sunshine", "trustno1", "iloveyou", "batman", "access",
  "hello123", "charlie", "donald", "password1", "qwerty123", "senha",
  "senha123", "mudar123", "brasil", "brasil123", "recargas", "recargas123",
];

const RESERVED_NAME_KEYWORDS = [
  "adm", "admin", "administrador", "administradora",
  "suporte", "support", "staff", "moderador", "moderadora",
  "oficial", "official", "sistema", "system", "bot",
  "equipe", "team", "gerente", "manager", "dono", "owner",
  
];

function isReservedName(name: string): boolean {
  const normalized = name.toLowerCase().replace(/[^a-z0-9\s]/g, " ").trim();
  return RESERVED_NAME_KEYWORDS.some((kw) => normalized.includes(kw));
}

function validateStrongPassword(password: string): string | null {
  if (password.length < 8) return "Senha deve ter no mínimo 8 caracteres";
  if (!/[A-Z]/.test(password)) return "Senha deve conter pelo menos 1 letra maiúscula";
  if (!/[0-9]/.test(password)) return "Senha deve conter pelo menos 1 número";
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) return "Senha deve conter pelo menos 1 caractere especial";
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) return "Essa senha é muito comum e insegura";
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password, nome, reseller_id } = await req.json();
    if (!email || !password) throw new Error("E-mail e senha são obrigatórios");
    if (!reseller_id) throw new Error("ID do revendedor é obrigatório");
    if (nome && isReservedName(nome)) throw new Error("Este nome não é permitido. Nomes como 'admin', 'suporte' são reservados.");

    // Strong password validation
    const pwError = validateStrongPassword(password);
    if (pwError) throw new Error(pwError);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Verify reseller exists
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
