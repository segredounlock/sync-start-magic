import { useState, useEffect, useCallback } from "react";
import { createPixDeposit, checkPaymentStatus, type PixResult } from "@/lib/payment";
import { styledToast as toast } from "@/lib/toast";

interface UsePixDepositOptions {
  /** User email for PIX generation */
  userEmail?: string;
  /** User name for PIX generation */
  userName?: string;
  /** Use global gateway */
  useGlobal?: boolean;
  /** Reseller user ID */
  resellerId?: string;
  /** Saldo type (revenda/pessoal) */
  saldoTipo?: string;
  /** Polling interval in ms (default: 3000) */
  pollInterval?: number;
  /** Callback when payment is confirmed */
  onConfirmed?: () => void;
  /** Preset amounts to show */
  presetAmounts?: number[];
}

interface UsePixDepositReturn {
  // State
  depositAmount: string;
  setDepositAmount: (v: string) => void;
  generating: boolean;
  pixData: PixResult | null;
  pixError: string | null;
  copied: boolean;
  checking: boolean;
  paymentConfirmed: boolean;
  confirmedAmount: number;
  pollCount: number;
  presetAmounts: number[];

  // Actions
  generatePix: (amount?: number) => Promise<void>;
  copyCode: () => void;
  checkStatus: () => Promise<void>;
  reset: () => void;
}

/**
 * Hook global para fluxo de depósito PIX.
 * Substitui o estado duplicado em AdminDashboard, RevendedorPainel e TelegramMiniApp.
 */
export function usePixDeposit(options: UsePixDepositOptions = {}): UsePixDepositReturn {
  const {
    userEmail,
    userName,
    useGlobal = false,
    resellerId,
    saldoTipo = "revenda",
    pollInterval = 3000,
    onConfirmed,
    presetAmounts = [20, 50, 100, 200, 500, 1000],
  } = options;

  const [depositAmount, setDepositAmount] = useState("");
  const [generating, setGenerating] = useState(false);
  const [pixData, setPixData] = useState<PixResult | null>(null);
  const [pixError, setPixError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [confirmedAmount, setConfirmedAmount] = useState(0);
  const [pollCount, setPollCount] = useState(0);

  // Auto-poll payment status
  useEffect(() => {
    if (!pixData?.payment_id || paymentConfirmed) return;
    const interval = setInterval(async () => {
      try {
        const status = await checkPaymentStatus(pixData.payment_id);
        setPollCount(p => p + 1);
        if (status === "completed") {
          setPaymentConfirmed(true);
          setConfirmedAmount(pixData.amount);
          onConfirmed?.();
          clearInterval(interval);
        }
      } catch { /* silent */ }
    }, pollInterval);
    return () => clearInterval(interval);
  }, [pixData, paymentConfirmed, onConfirmed, pollInterval]);

  const generatePix = useCallback(async (amount?: number) => {
    const value = amount || parseFloat(depositAmount.replace(",", "."));
    if (!value || value <= 0) {
      toast.error("Informe um valor válido");
      return;
    }
    setGenerating(true);
    setPixError(null);
    setPixData(null);
    setPaymentConfirmed(false);
    setPollCount(0);
    try {
      const result = await createPixDeposit(value, userEmail, userName, useGlobal, resellerId, saldoTipo);
      setPixData(result);
    } catch (err: any) {
      const msg = err.message || "Erro ao gerar PIX";
      setPixError(msg);
      toast.error(msg);
    } finally {
      setGenerating(false);
    }
  }, [depositAmount, userEmail, userName, useGlobal, resellerId, saldoTipo]);

  const copyCode = useCallback(() => {
    if (!pixData?.qr_code) return;
    navigator.clipboard.writeText(pixData.qr_code);
    setCopied(true);
    toast.success("Código PIX copiado!");
    setTimeout(() => setCopied(false), 3000);
  }, [pixData]);

  const checkStatus = useCallback(async () => {
    if (!pixData?.payment_id) return;
    setChecking(true);
    try {
      const status = await checkPaymentStatus(pixData.payment_id);
      if (status === "completed") {
        setPaymentConfirmed(true);
        setConfirmedAmount(pixData.amount);
        onConfirmed?.();
      } else {
        toast.info("Pagamento ainda pendente. Aguarde a confirmação.");
      }
    } catch {
      toast.error("Erro ao verificar status");
    } finally {
      setChecking(false);
    }
  }, [pixData, onConfirmed]);

  const reset = useCallback(() => {
    setPixData(null);
    setDepositAmount("");
    setPaymentConfirmed(false);
    setPollCount(0);
    setConfirmedAmount(0);
    setPixError(null);
    setCopied(false);
  }, []);

  return {
    depositAmount,
    setDepositAmount,
    generating,
    pixData,
    pixError,
    copied,
    checking,
    paymentConfirmed,
    confirmedAmount,
    pollCount,
    presetAmounts,
    generatePix,
    copyCode,
    checkStatus,
    reset,
  };
}
