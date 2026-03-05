import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { appToast } from "@/lib/toast";
import { playCashRegisterSound } from "@/lib/sounds";

/**
 * Hook that monitors pending transactions in the background.
 * When a payment is confirmed (status = "completed"), it shows a toast
 * and calls onBalanceUpdated so the UI refreshes the balance.
 * Works even if the user navigates away from the deposit tab.
 *
 * @param showToast - Whether to show the confirmation toast (default true).
 *   Sound always plays regardless of this flag.
 */
export function useBackgroundPaymentMonitor(
  userId: string | undefined,
  onBalanceUpdated: () => void,
  showToast: boolean = true,
  playSound: boolean = true,
) {
  const knownCompletedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!userId) return;

    let isActive = true;
    let pollTimer: ReturnType<typeof setTimeout> | null = null;
    let lastPollAt = new Date().toISOString();

    // Auto-expire old pending deposits (>30 min) on mount
    const expireOldDeposits = async () => {
      const cutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      await supabase
        .from("transactions")
        .update({ status: "expired", updated_at: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("status", "pending")
        .eq("type", "deposit")
        .lt("created_at", cutoff);
    };
    expireOldDeposits();

    const handleCompletedDeposit = (row: { id: string; status: string; type: string; amount: number }) => {
      if (
        row.type === "deposit" &&
        row.status === "completed" &&
        !knownCompletedRef.current.has(row.id)
      ) {
        knownCompletedRef.current.add(row.id);
        if (playSound) { try { playCashRegisterSound(); } catch {} }
        if (showToast) {
          appToast.depositConfirmed(
            `✅ Depósito de R$ ${Number(row.amount).toFixed(2)} confirmado! Saldo atualizado.`,
            { id: `deposit-${row.id}` }
          );
        }
        onBalanceUpdated();
      }
    };

    // Setup realtime channel with reconnection
    let channel: ReturnType<typeof supabase.channel>;

    const setupChannel = () => {
      if (channel) {
        try { supabase.removeChannel(channel); } catch {}
      }
      channel = supabase
        .channel(`bg-payment-${userId}-${Date.now()}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "transactions",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            handleCompletedDeposit(payload.new as any);
          }
        )
        .subscribe((status) => {
          console.log("[BgPayment] channel:", status);
          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            setTimeout(() => { if (isActive) setupChannel(); }, 3000);
          }
        });
    };

    // Fallback polling every 10s
    const pollForCompleted = async () => {
      if (!isActive) return;
      try {
        const { data } = await supabase
          .from("transactions")
          .select("id, amount, status, type")
          .eq("user_id", userId)
          .eq("status", "completed")
          .eq("type", "deposit")
          .gt("updated_at", lastPollAt)
          .limit(5);

        lastPollAt = new Date().toISOString();

        if (data) {
          for (const row of data) {
            handleCompletedDeposit(row);
          }
        }
      } catch {}
      if (isActive) pollTimer = setTimeout(pollForCompleted, 10000);
    };

    // Reconnect on tab visibility change
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && isActive) {
        console.log("[BgPayment] Tab visible, reconnecting...");
        setupChannel();
        pollForCompleted();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    setupChannel();
    pollTimer = setTimeout(pollForCompleted, 10000);

    return () => {
      isActive = false;
      document.removeEventListener("visibilitychange", handleVisibility);
      if (pollTimer) clearTimeout(pollTimer);
      if (channel) supabase.removeChannel(channel);
    };
  }, [userId, onBalanceUpdated, showToast, playSound]);
}
