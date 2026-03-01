import { supabase } from "@/integrations/supabase/client";

export type PixResult = {
  gateway: string;
  payment_id: string;
  qr_code: string | null;
  qr_code_base64: string | null;
  payment_link: string | null;
  amount: number;
  status: string;
};

export async function createPixDeposit(amount: number, email?: string, name?: string, useGlobal?: boolean, resellerUserId?: string, saldoTipo?: string): Promise<PixResult> {
  const { data, error } = await supabase.functions.invoke("create-pix", {
    body: { amount, email, name, use_global: useGlobal || false, reseller_user_id: resellerUserId, saldo_tipo: saldoTipo || "revenda" },
  });

  if (error) {
    console.error("Error creating PIX:", error);
    throw new Error(error.message || "Erro ao criar cobrança PIX");
  }

  if (!data?.success) {
    throw new Error(data?.error || "Falha ao gerar PIX");
  }

  return data.data as PixResult;
}

export async function checkPaymentStatus(paymentId: string): Promise<string> {
  const { data } = await supabase
    .from("transactions")
    .select("status")
    .eq("payment_id", paymentId)
    .single();

  return data?.status || "pending";
}
