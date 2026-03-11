import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ======= GATEWAY HANDLERS =======

async function createMercadoPago(
  amount: number,
  config: Record<string, string>,
  meta: { email: string; name: string; reference: string; webhookUrl: string }
) {
  const modo = config.mercadoPagoModo || "prod";
  const token =
    modo === "test"
      ? config.mercadoPagoKeyTest
      : config.mercadoPagoKeyProd;

  if (!token) throw new Error("Token do Mercado Pago não configurado");

  const body = {
    transaction_amount: amount,
    payment_method_id: "pix",
    description: `Depósito R$ ${amount.toFixed(2)}`,
    payer: {
      email: meta.email || "cliente@recarga.com",
      first_name: meta.name || "Cliente",
    },
    notification_url: meta.webhookUrl || undefined,
    external_reference: meta.reference,
  };

  const resp = await fetch("https://api.mercadopago.com/v1/payments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": meta.reference,
    },
    body: JSON.stringify(body),
  });

  const data = await resp.json();
  if (!resp.ok) {
    console.error(`[create-pix][mercadopago] HTTP ${resp.status} response:`, JSON.stringify(data));
    throw new Error(data.message || `MercadoPago error ${resp.status}`);
  }

  const td = data.point_of_interaction?.transaction_data || data.transaction_data || {};

  return {
    gateway: "mercadopago",
    payment_id: String(data.id),
    qr_code: td.qr_code || null,
    qr_code_base64: td.qr_code_base64 || null,
    payment_link: td.ticket_url || null,
    amount,
    status: data.status === "approved" ? "paid" : "pending",
  };
}

async function createPushinPay(
  amount: number,
  config: Record<string, string>,
  meta: { reference: string; webhookUrl: string }
) {
  const token = config.pushinPayToken;
  if (!token) throw new Error("Token do PushinPay não configurado");

  const valueCents = Math.round(amount * 100);

  const body: Record<string, unknown> = {
    value: valueCents,
    webhook_url: meta.webhookUrl || undefined,
  };

  const resp = await fetch("https://api.pushinpay.com.br/api/pix/cashIn", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await resp.json();
  if (!resp.ok) {
    console.error(`[create-pix][pushinpay] HTTP ${resp.status} response:`, JSON.stringify(data));
    throw new Error(data.message || data.error || `PushinPay error ${resp.status}`);
  }

  return {
    gateway: "pushinpay",
    payment_id: data.id || data.transaction_id || "",
    qr_code: data.qr_code || null,
    qr_code_base64: data.qr_code_base64 || null,
    payment_link: null,
    amount,
    status: "pending",
  };
}

async function createVirtualPay(
  amount: number,
  config: Record<string, string>,
  meta: { email: string; name: string; reference: string }
) {
  const clientId = config.virtualPayClientId;
  const clientSecret = config.virtualPayClientSecret;
  if (!clientId || !clientSecret) throw new Error("Credenciais VirtualPay não configuradas");

  // Auth - get bearer token
  const authResp = await fetch("https://api.virtualpay.com.br/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  const authData = await authResp.json();
  if (!authResp.ok || !authData.access_token) {
    console.error(`[create-pix][virtualpay] auth HTTP ${authResp.status} response:`, JSON.stringify(authData));
    throw new Error("Falha na autenticação VirtualPay");
  }

  const platform = config.virtualPayPlatformId || "";

  const body = {
    name: meta.name || "Cliente",
    email: meta.email || "cliente@recarga.com",
    phone: "00000000000",
    description: `Depósito R$ ${amount.toFixed(2)}`,
    document: "00000000000",
    amount: amount,
    platform,
    reference: meta.reference,
  };

  const resp = await fetch(
    "https://api.virtualpay.com.br/api/v1/transaction/pix/cashin",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authData.access_token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  const data = await resp.json();
  if (!resp.ok) {
    console.error("VirtualPay error:", data);
    throw new Error(data.message || `VirtualPay error ${resp.status}`);
  }

  const tx = data.transaction?.[0] || data;

  return {
    gateway: "virtualpay",
    payment_id: tx.id || "",
    qr_code: tx.qr_code || null,
    qr_code_base64: tx.qr_code_image || null,
    payment_link: tx.payment_link || null,
    amount,
    status: "pending",
  };
}

async function createEfiPay(
  amount: number,
  config: Record<string, string>,
  meta: { reference: string; webhookUrl: string }
) {
  const clientId = config.efiPayClientId;
  const clientSecret = config.efiPayClientSecret;
  if (!clientId || !clientSecret) throw new Error("Credenciais Efi Pay não configuradas");

  const isSandbox = config.efiPaySandbox === "true";
  // Sandbox: pix-h.api.efipay.com.br | Produção: pix.api.efipay.com.br
  const baseUrl = isSandbox
    ? "https://pix-h.api.efipay.com.br"
    : "https://pix.api.efipay.com.br";

  // OAuth2 token
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
    console.error("EfiPay auth error:", JSON.stringify(authData));
    const detail = authData?.error_description || authData?.mensagem || authData?.error || "";
    throw new Error(
      `Falha na autenticação Efi Pay: ${detail || "verifique Client ID/Secret"}. ${
        !isSandbox ? "Em produção requer certificado mTLS (.p12)." : ""
      }`
    );
  }

  // txid must be 26-35 alphanumeric chars
  const rawTxid = meta.reference.replace(/[^a-zA-Z0-9]/g, "");
  const txid = rawTxid.length >= 26 ? rawTxid.substring(0, 35) : rawTxid.padEnd(26, "0");

  const pixKey = config.efiPayPixKey || "";
  if (!pixKey) throw new Error("Chave PIX do Efi Pay não configurada. Configure na aba Automação PIX.");

  const cobBody: Record<string, unknown> = {
    calendario: { expiracao: 3600 },
    valor: { original: amount.toFixed(2) },
    chave: pixKey,
    solicitacaoPagador: `Depósito R$ ${amount.toFixed(2)}`,
    infoAdicionais: [{ nome: "ref", valor: meta.reference }],
  };

  console.log(`EfiPay creating cob: txid=${txid}, amount=${amount}, sandbox=${isSandbox}`);

  const cobResp = await fetch(`${baseUrl}/v2/cob/${txid}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${authData.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cobBody),
  });

  const cobData = await cobResp.json();
  if (!cobResp.ok) {
    console.error("EfiPay cob error:", JSON.stringify(cobData));
    const errMsg = cobData?.mensagem || cobData?.erros?.[0]?.mensagem || cobData?.message || "";
    throw new Error(`Efi Pay erro ao criar cobrança: ${errMsg || `HTTP ${cobResp.status}`}`);
  }

  // Get QR code
  const locId = cobData.loc?.id;
  let qrCode = cobData.pixCopiaECola || null;
  let qrCodeBase64 = null;

  if (locId) {
    try {
      const qrResp = await fetch(`${baseUrl}/v2/loc/${locId}/qrcode`, {
        headers: { Authorization: `Bearer ${authData.access_token}` },
      });
      if (qrResp.ok) {
        const qrData = await qrResp.json();
        qrCode = qrData.qrcode || qrCode;
        qrCodeBase64 = qrData.imagemQrcode || null;
      }
    } catch (qrErr) {
      console.warn("EfiPay QR code fetch failed (non-critical):", qrErr);
    }
  }

  return {
    gateway: "efipay",
    payment_id: cobData.txid || txid,
    qr_code: qrCode,
    qr_code_base64: qrCodeBase64,
    payment_link: null,
    amount,
    status: "pending",
  };
}

async function createPixGo(
  amount: number,
  config: Record<string, string>,
  meta: { reference: string; webhookUrl: string }
) {
  const apiKey = config.pixGoApiKey;
  if (!apiKey) throw new Error("API Key do PixGo não configurada");

  const body = {
    amount,
    description: `Depósito PIX - ${meta.reference}`,
    external_id: meta.reference,
    webhook_url: `${meta.webhookUrl}?gateway=pixgo`,
  };

  const resp = await fetch("https://pixgo.org/api/v1/payment/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
    },
    body: JSON.stringify(body),
  });

  const data = await resp.json();
  if (!resp.ok || !data.success) {
    console.error("PixGo error:", data);
    throw new Error(data.message || data.error || `PixGo error ${resp.status}`);
  }

  return {
    gateway: "pixgo",
    payment_id: data.data?.payment_id || "",
    qr_code: data.data?.qr_code || null,
    qr_code_base64: data.data?.qr_image_url || null,
    payment_link: null,
    amount,
    status: "pending",
  };
}

async function createMisticPay(
  amount: number,
  config: Record<string, string>,
  meta: { name: string; reference: string; webhookUrl: string }
) {
  const clientId = config.misticPayClientId;
  const clientSecret = config.misticPayClientSecret;
  if (!clientId || !clientSecret) throw new Error("Credenciais MisticPay não configuradas");

  const body = {
    amount,
    payerName: meta.name || "Cliente",
    payerDocument: "00000000000",
    transactionId: meta.reference,
    description: `Depósito R$ ${amount.toFixed(2)}`,
    projectWebhook: `${meta.webhookUrl}?gateway=misticpay`,
  };

  const resp = await fetch("https://api.misticpay.com/api/transactions/create", {
    method: "POST",
    headers: {
      "ci": clientId,
      "cs": clientSecret,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await resp.json();
  if (!resp.ok) {
    console.error("MisticPay error:", data);
    throw new Error(data.message || `MisticPay error ${resp.status}`);
  }

  const tx = data.data || {};

  return {
    gateway: "misticpay",
    payment_id: String(tx.transactionId || ""),
    qr_code: tx.copyPaste || null,
    qr_code_base64: tx.qrCodeBase64 || null,
    payment_link: tx.qrcodeUrl || null,
    amount,
    status: "pending",
  };
}

// ======= MAIN HANDLER =======

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const isServiceRole = token === serviceRoleKey;

    let userId: string;

    if (isServiceRole) {
      // Called internally (e.g. from telegram-bot) — userId will come from body
      const body = await req.json();
      const { amount, email: bodyEmail, name: bodyName, reseller_user_id } = body;
      userId = reseller_user_id || "";
      if (!userId) {
        return new Response(JSON.stringify({ error: "user_id obrigatório para chamadas internas" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Re-assign req body by storing parsed values
      (req as any).__parsedBody = body;
    } else {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );

      // Get authenticated user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (!userError && userData?.user?.id) {
        userId = userData.user.id;
      } else {
        // Fallback: parse body to check for reseller_user_id (e.g. Telegram Mini App)
        const body = await req.json();
        (req as any).__parsedBody = body;
        const fallbackUserId = body.reseller_user_id;
        if (fallbackUserId) {
          // Validate user exists
          const adminClient = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
          );
          const { data: profile } = await adminClient
            .from("profiles")
            .select("id")
            .eq("id", fallbackUserId)
            .single();
          if (!profile) {
            return new Response(JSON.stringify({ error: "Usuário não encontrado" }), {
              status: 401,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          userId = fallbackUserId;
        } else {
          return new Response(JSON.stringify({ error: "Token inválido" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
    }

    const parsedBody = (req as any).__parsedBody || await req.json();
    const { amount, email, name, reseller_user_id, use_global, saldo_tipo } = parsedBody;
    const saldoType = saldo_tipo || "revenda";
    if (!amount || amount <= 0) {
      return new Response(JSON.stringify({ error: "Valor inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Load config from system_config (admin-only table but we use service role for reading)
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Try to load individual reseller config first (unless use_global is true)
    const configUserId = reseller_user_id || userId;
    let useIndividualGateway = false;
    const config: Record<string, string> = {};

    if (!use_global) {
      // Check reseller_config for individual gateway
      const { data: resellerRows } = await adminClient
        .from("reseller_config")
        .select("key, value")
        .eq("user_id", configUserId);

      const resellerConfig: Record<string, string> = {};
      resellerRows?.forEach((r: { key: string; value: string | null }) => {
        resellerConfig[r.key] = r.value || "";
      });

      if (resellerConfig.paymentModule) {
        // Validate that the reseller actually has credentials for their chosen gateway
        const gw = resellerConfig.paymentModule;
        const hasValidCredentials =
          (gw === "mercadopago" && (resellerConfig.mercadoPagoKeyProd?.length > 30 || resellerConfig.mercadoPagoKeyTest?.length > 30)) ||
          (gw === "pushinpay" && resellerConfig.pushinPayToken?.length > 10) ||
          (gw === "virtualpay" && resellerConfig.virtualPayClientId && resellerConfig.virtualPayClientSecret) ||
          (gw === "efipay" && resellerConfig.efiPayClientId && resellerConfig.efiPayClientSecret && resellerConfig.efiPayPixKey) ||
          (gw === "pixgo" && resellerConfig.pixGoApiKey?.length > 10) ||
          (gw === "misticpay" && resellerConfig.misticPayClientId && resellerConfig.misticPayClientSecret);

        if (hasValidCredentials) {
          useIndividualGateway = true;
          Object.assign(config, resellerConfig);
          console.log(`Using individual gateway: ${gw} for user ${configUserId}`);
        } else {
          console.log(`Reseller ${configUserId} has gateway ${gw} but invalid/missing credentials, falling back to global`);
        }
      }
    }

    if (!useIndividualGateway) {
      // Fallback to global system_config
      const { data: configRows } = await adminClient
        .from("system_config")
        .select("key, value");
      configRows?.forEach((r: { key: string; value: string | null }) => {
        config[r.key] = r.value || "";
      });
    }

    const gateway = config.paymentModule || "";
    if (!gateway) {
      return new Response(JSON.stringify({
        success: false,
        error: "⚠️ Nenhuma gateway de pagamento configurada. Configure sua gateway na aba 'Gateway de Pagamento' do painel de revendedor.",
        no_gateway: true,
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Enforce gateway-specific deposit limits
    const depositMin = Number(config[`${gateway}DepositMin`] || config.depositMin || 0);
    const depositMax = Number(config[`${gateway}DepositMax`] || config.depositMax || 0);
    if (depositMin > 0 && amount < depositMin) {
      return new Response(JSON.stringify({
        success: false,
        error: `Valor mínimo para depósito é R$ ${depositMin.toFixed(2)}`,
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (depositMax > 0 && amount > depositMax) {
      return new Response(JSON.stringify({
        success: false,
        error: `Valor máximo para depósito é R$ ${depositMax.toFixed(2)}`,
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Enforce max pending PIX limit
    const maxPendingPix = Number(config.maxPendingPix || 0);
    if (maxPendingPix > 0) {
      const { count, error: countErr } = await adminClient
        .from("transactions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("status", "pending")
        .eq("type", "deposit");

      if (!countErr && (count || 0) >= maxPendingPix) {
        return new Response(JSON.stringify({
          success: false,
          error: `Você já possui ${count} PIX pendente(s). Aguarde a confirmação antes de gerar outro.`,
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }
    const reference = `DEP_${userId.substring(0, 8)}_${Date.now()}`;

    // Build webhook URL
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const webhookUrl = `${supabaseUrl}/functions/v1/pix-webhook`;
    console.log(`Creating PIX via ${gateway} for user ${userId}, amount ${amount}, individual=${useIndividualGateway}`);

    let result;
    const meta = { email: email || "", name: name || "", reference, webhookUrl };

    switch (gateway) {
      case "mercadopago":
        result = await createMercadoPago(amount, config, meta);
        break;
      case "pushinpay":
        result = await createPushinPay(amount, config, meta);
        break;
      case "virtualpay":
        result = await createVirtualPay(amount, config, meta);
        break;
      case "efipay":
        result = await createEfiPay(amount, config, meta);
        break;
      case "pixgo":
        result = await createPixGo(amount, config, meta);
        break;
      case "misticpay":
        result = await createMisticPay(amount, config, meta);
        break;
      default:
        throw new Error(`Gateway "${gateway}" não suportado`);
    }

    // Save transaction in DB
    await adminClient.from("transactions").insert({
      user_id: userId,
      type: "deposit",
      amount,
      status: "pending",
      module: gateway,
      payment_id: result.payment_id,
      metadata: { reference, gateway, qr_code: result.qr_code || null, saldo_tipo: saldoType },
    });

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating PIX:", error);
    const msg = error instanceof Error ? error.message : "Erro interno";
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
