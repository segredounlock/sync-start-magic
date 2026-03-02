import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
            toast.success(
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
