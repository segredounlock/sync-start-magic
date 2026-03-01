import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

function formatWebUserLabel(row: { nome?: string | null; email?: string | null }) {
  return row.nome?.trim() || row.email?.trim() || "Usuário";
}

function formatTelegramUserLabel(row: { username?: string | null; first_name?: string | null; telegram_id?: number | null }) {
  if (row.username?.trim()) return `@${row.username.trim()}`;
  if (row.first_name?.trim()) return row.first_name.trim();
  if (row.telegram_id) return `ID ${row.telegram_id}`;
  return "Usuário Telegram";
}

export function usePrincipalNewUserToasts() {
  const seenEventsRef = useRef<Set<string>>(new Set());

  const markAsSeen = (key: string) => {
    if (seenEventsRef.current.has(key)) return false;
    seenEventsRef.current.add(key);

    if (seenEventsRef.current.size > 500) {
      const firstKey = seenEventsRef.current.values().next().value;
      if (firstKey) seenEventsRef.current.delete(firstKey);
    }

    return true;
  };

  useEffect(() => {
    const channel = supabase
      .channel("principal-new-users-toast")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "profiles" },
        (payload) => {
          const row = payload.new as { id?: string; nome?: string | null; email?: string | null };
          if (!row?.id) return;

          const eventKey = `web:${row.id}`;
          if (!markAsSeen(eventKey)) return;

          toast.success(`🆕 Novo cadastro Web: ${formatWebUserLabel(row)}`);
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "telegram_users" },
        (payload) => {
          const row = payload.new as {
            id?: string;
            telegram_id?: number | null;
            username?: string | null;
            first_name?: string | null;
            is_registered?: boolean;
          };

          if (!row?.is_registered) return;

          const eventKey = `telegram-insert:${row.telegram_id ?? row.id}`;
          if (!markAsSeen(eventKey)) return;

          toast.info(`🤖 Novo cadastro Telegram: ${formatTelegramUserLabel(row)}`);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "telegram_users" },
        (payload) => {
          const row = payload.new as {
            id?: string;
            telegram_id?: number | null;
            username?: string | null;
            first_name?: string | null;
            is_registered?: boolean;
          };
          const oldRow = payload.old as { is_registered?: boolean };

          if (!row?.is_registered || oldRow?.is_registered === row.is_registered) return;

          const eventKey = `telegram-update:${row.telegram_id ?? row.id}`;
          if (!markAsSeen(eventKey)) return;

          toast.info(`🤖 Novo cadastro Telegram: ${formatTelegramUserLabel(row)}`);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
}
