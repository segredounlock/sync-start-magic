import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Load config
    const { data: configRows } = await supabase
      .from("system_config")
      .select("key, value");
    const config: Record<string, string> = {};
    configRows?.forEach((r: { key: string; value: string | null }) => {
      config[r.key] = r.value || "";
    });

    const clientId = config.efiPayClientId;
    const clientSecret = config.efiPayClientSecret;
    if (!clientId || !clientSecret) {
      return new Response(JSON.stringify({ success: false, error: "Client ID e Client Secret são obrigatórios" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isSandbox = config.efiPaySandbox === "true";
    const baseUrl = isSandbox
      ? "https://pix-h.api.efipay.com.br"
      : "https://pix.api.efipay.com.br";

    // Authenticate
    const credentials = btoa(`${clientId}:${clientSecret}`);
    const authResp = await fetch(`${baseUrl}/oauth/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ grant_type: "client_credentials" }),
    });

    const authData = await authResp.json();
    if (!authResp.ok || !authData.access_token) {
      console.error("EfiPay auth error:", authData);
      return new Response(JSON.stringify({
        success: false,
        error: `Falha na autenticação: ${authData?.error_description || authData?.mensagem || "verifique credenciais"}`,
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const action = body.action || "status";
    const results: Record<string, unknown> = { authenticated: true, sandbox: isSandbox };

    // Action: list-keys — list EVP keys
    if (action === "list-keys" || action === "setup") {
      try {
        const keysResp = await fetch(`${baseUrl}/v2/gn/evp`, {
          headers: { Authorization: `Bearer ${authData.access_token}` },
        });
        if (keysResp.ok) {
          const keysData = await keysResp.json();
          results.keys = keysData.chaves || [];
        } else {
          const errData = await keysResp.json().catch(() => ({}));
          results.keys_error = errData?.mensagem || `HTTP ${keysResp.status}`;
        }
      } catch (e) {
        results.keys_error = String(e);
      }
    }

    // Action: create-key — create new EVP key
    if (action === "create-key" || (action === "setup" && !config.efiPayPixKey)) {
      try {
        const createResp = await fetch(`${baseUrl}/v2/gn/evp`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authData.access_token}`,
            "Content-Type": "application/json",
          },
        });
        const createData = await createResp.json();
        if (createResp.ok && createData.chave) {
          results.created_key = createData.chave;
          // Save to system_config
          await supabase.from("system_config").upsert(
            { key: "efiPayPixKey", value: createData.chave, updated_at: new Date().toISOString() },
            { onConflict: "key" }
          );
          results.key_saved = true;
        } else {
          results.create_key_error = createData?.mensagem || `HTTP ${createResp.status}`;
        }
      } catch (e) {
        results.create_key_error = String(e);
      }
    }

    // Action: register-webhook
    if (action === "register-webhook" || action === "setup") {
      const pixKey = config.efiPayPixKey || (results.created_key as string) || "";
      if (pixKey) {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const webhookUrl = `${supabaseUrl}/functions/v1/pix-webhook?gateway=efipay`;
        try {
          const whResp = await fetch(`${baseUrl}/v2/webhook/${pixKey}`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${authData.access_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ webhookUrl }),
          });
          if (whResp.ok) {
            results.webhook_registered = true;
            results.webhook_url = webhookUrl;
          } else {
            const whErr = await whResp.json().catch(() => ({}));
            results.webhook_error = whErr?.mensagem || `HTTP ${whResp.status}`;
            // If mTLS required, provide clear message
            if (whResp.status === 401 || whResp.status === 403) {
              results.webhook_error = "Webhook requer mTLS. Configure skip_mTLS na sua conta Efi Pay ou use ambiente sandbox.";
            }
          }
        } catch (e) {
          results.webhook_error = String(e);
        }
      } else {
        results.webhook_error = "Nenhuma chave PIX configurada";
      }
    }

    return new Response(JSON.stringify({ success: true, data: results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("efi-setup error:", error);
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Erro interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
