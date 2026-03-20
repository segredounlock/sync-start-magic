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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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

    const { user_id, new_password } = await req.json();
    if (!user_id || !new_password) throw new Error("user_id e new_password são obrigatórios");

    // Strong password validation
    const pwError = validateStrongPassword(new_password);
    if (pwError) throw new Error(pwError);

    const { error } = await adminClient.auth.admin.updateUserById(user_id, {
      password: new_password,
    });
    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
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
