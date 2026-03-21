import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COMMON_PASSWORDS = [
  "123456", "12345678", "123456789", "1234567890", "password", "qwerty",
  "abc123", "111111", "123123", "admin123", "letmein", "welcome",
  "monkey", "dragon", "master", "login", "princess", "football",
  "shadow", "sunshine", "trustno1", "iloveyou", "batman", "access",
  "hello123", "charlie", "donald", "password1", "qwerty123", "senha",
  "senha123", "mudar123", "brasil", "brasil123", "recargas", "recargas123",
];

// Admin-create-user does NOT block reserved names since only admins call this function

function validateStrongPassword(password: string): string | null {
  if (password.length < 8) return "Senha deve ter no mínimo 8 caracteres";
  if (!/[A-Z]/.test(password)) return "Senha deve conter pelo menos 1 letra maiúscula";
  if (!/[0-9]/.test(password)) return "Senha deve conter pelo menos 1 número";
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) return "Senha deve conter pelo menos 1 caractere especial";
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) return "Essa senha é muito comum e insegura";
  return null;
}

Deno.serve(async (req) => {
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

    // Check admin role
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: roleData } = await adminClient.from("user_roles").select("role").eq("user_id", caller.id).eq("role", "admin").maybeSingle();
    if (!roleData) throw new Error("Acesso negado: apenas administradores");

    const { email, password, nome, role, saldo } = await req.json();
    if (!email || !password) throw new Error("E-mail e senha são obrigatórios");

    // Strong password validation
    const pwError = validateStrongPassword(password);
    if (pwError) throw new Error(pwError);

    const validRoles = ["admin", "revendedor", "usuario"];
    const assignRole = validRoles.includes(role) ? role : "usuario";

    // Create user via admin API
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nome: nome || "" },
    });
    if (createError) throw createError;

    // Assign role
    const { error: roleError } = await adminClient.from("user_roles").insert({
      user_id: newUser.user.id,
      role: assignRole,
    });
    if (roleError) throw roleError;

    // Set initial saldo if provided
    if (saldo && Number(saldo) > 0) {
      await adminClient.from("saldos").update({ valor: Number(saldo) }).eq("user_id", newUser.user.id).eq("tipo", "revenda");
    }

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
