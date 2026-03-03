import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { appToast } from "@/lib/toast";

/**
 * Hook that monitors pending transactions in the background.
 * When a payment is confirmed (status = "completed"), it shows a toast
 * and calls onBalanceUpdated so the UI refreshes the balance.
 * Works even if the user navigates away from the deposit tab.
 */
export function useBackgroundPaymentMonitor(
  userId: string | undefined,
  onBalanceUpdated: () => void
) {
  const knownCompletedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!userId) return;

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

    // Subscribe to realtime changes on the transactions table for this user
    const channel = supabase
      .channel(`bg-payment-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "transactions",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new as {
            id: string;
            status: string;
            type: string;
            amount: number;
          };

          if (
            row.type === "deposit" &&
            row.status === "completed" &&
            !knownCompletedRef.current.has(row.id)
          ) {
            knownCompletedRef.current.add(row.id);
            appToast.depositConfirmed(
              `✅ Depósito de R$ ${Number(row.amount).toFixed(2)} confirmado! Saldo atualizado.`,
              { id: `deposit-${row.id}` }
            );
            onBalanceUpdated();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, onBalanceUpdated]);
}
