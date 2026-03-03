import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { playSuccessSound, playWebSignupSound, playTelegramSignupSound } from "@/lib/sounds";

// ── System notification (plays device sound without user interaction) ──
let _notifPermission: NotificationPermission = typeof Notification !== "undefined" ? Notification.permission : "denied";

function requestNotifPermission() {
  if (typeof Notification === "undefined") return;
  if (_notifPermission === "default") {
    Notification.requestPermission().then((p) => { _notifPermission = p; }).catch(() => {});
  }
}

function showSystemNotification(title: string, body: string) {
  try {
    if (typeof Notification === "undefined" || _notifPermission !== "granted") return;
    if (document.visibilityState === "visible") {
      // Page is visible — system notification with silent tag plays device sound
      new Notification(title, { body, icon: "/favicon.png", tag: body });
    }
  } catch { /* ignore */ }
}

export interface AppNotification {
  id: string;
  type: "deposit" | "recarga" | "new_user_web" | "new_user_telegram";
  message: string;
  amount: number;
  user_id: string;
  user_nome?: string;
  user_email?: string;
  status: string;
  created_at: string;
  is_read: boolean;
}

type ListenType = "deposit" | "recarga" | "new_user";

interface UseNotificationsOptions {
  listenTo: ListenType[];
  revendedores?: { id: string; nome: string | null; email: string | null }[];
}

async function persistNotification(n: Omit<AppNotification, "is_read">) {
  await supabase.from("admin_notifications" as any).insert({
    id: n.id,
    type: n.type,
    message: n.message,
    amount: n.amount,
    user_id: n.user_id,
    user_nome: n.user_nome || null,
    user_email: n.user_email || null,
    status: n.status,
    created_at: n.created_at,
  } as any);
}

export function useNotifications({ listenTo, revendedores }: UseNotificationsOptions) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const profileCache = useRef<Record<string, { nome: string | null; email: string | null }>>({});
  const knownIds = useRef<Set<string>>(new Set());

  // Load persisted notifications
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("admin_notifications" as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50) as any;

      if (data && Array.isArray(data)) {
        const mapped: AppNotification[] = data.map((r: any) => ({
          id: r.id,
          type: r.type,
          message: r.message,
          amount: Number(r.amount),
          user_id: r.user_id || "",
          user_nome: r.user_nome || undefined,
          user_email: r.user_email || undefined,
          status: r.status,
          created_at: r.created_at,
          is_read: r.is_read,
        }));
        setNotifications(mapped);
        setUnreadCount(mapped.filter(n => !n.is_read).length);
        mapped.forEach(n => knownIds.current.add(n.id));
      }
      setLoading(false);
    // Request system notification permission on mount
    requestNotifPermission();
    })();
  }, []);

  const getProfile = useCallback(async (userId: string) => {
    if (profileCache.current[userId]) return profileCache.current[userId];
    const rev = revendedores?.find(r => r.id === userId);
    if (rev) {
      profileCache.current[userId] = { nome: rev.nome, email: rev.email };
      return profileCache.current[userId];
    }
    const { data } = await supabase.from("profiles").select("nome, email").eq("id", userId).maybeSingle();
    const result = { nome: data?.nome || null, email: data?.email || null };
    profileCache.current[userId] = result;
    return result;
  }, [revendedores]);

  const addNotification = useCallback((notif: AppNotification) => {
    if (knownIds.current.has(notif.id)) return;
    knownIds.current.add(notif.id);
    setNotifications(prev => [notif, ...prev].slice(0, 100));
    setUnreadCount(prev => prev + 1);
    persistNotification(notif);
  }, []);

  // Realtime subscriptions
  useEffect(() => {
    const channels: ReturnType<typeof supabase.channel>[] = [];

    if (listenTo.includes("deposit")) {
      const ch = supabase.channel("notif-deposits")
        .on("postgres_changes", {
          event: "UPDATE", schema: "public", table: "transactions",
        }, async (payload) => {
          const newRow = payload.new as any;
          const oldRow = payload.old as any;
          if (newRow.status === "completed" && oldRow?.status !== "completed") {
            const profile = await getProfile(newRow.user_id);
            addNotification({
              id: newRow.id,
              type: "deposit",
              message: `Depósito R$ ${Number(newRow.amount).toFixed(2)} confirmado`,
              amount: Number(newRow.amount),
              user_id: newRow.user_id,
              user_nome: profile.nome || undefined,
              user_email: profile.email || undefined,
              status: newRow.status,
              created_at: newRow.updated_at || new Date().toISOString(),
              is_read: false,
            });
            try { playSuccessSound(); } catch {}
            showSystemNotification("💰 Depósito confirmado", `R$ ${Number(newRow.amount).toFixed(2)} — ${profile.nome || profile.email || "Usuário"}`);
            toast.success(`💰 Depósito confirmado: R$ ${Number(newRow.amount).toFixed(2)}`, { id: `deposit-${newRow.id}`, description: `${profile.nome || profile.email || "Usuário"} · ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}` });
          }
        })
        .subscribe();
      channels.push(ch);
    }

    if (listenTo.includes("recarga")) {
      const ch = supabase.channel("notif-recargas")
        .on("postgres_changes", {
          event: "INSERT", schema: "public", table: "recargas",
        }, async (payload) => {
          const r = payload.new as any;
          const profile = await getProfile(r.user_id);
          const insertStatusMap: Record<string, string> = {
            completed: "Concluída", concluida: "Concluída",
            falha: "Falhou", pending: "Processando", pendente: "Processando",
            processing: "Processando", cancelled: "Cancelada",
          };
          const insertLabel = insertStatusMap[r.status] || r.status;
          addNotification({
            id: r.id,
            type: "recarga",
            message: `Recarga ${insertLabel} — ${r.operadora || ""} R$ ${Number(r.valor).toFixed(2)}`,
            amount: Number(r.valor),
            user_id: r.user_id,
            user_nome: profile.nome || undefined,
            user_email: profile.email || undefined,
            status: r.status,
            created_at: r.created_at || new Date().toISOString(),
            is_read: false,
          });
          showSystemNotification("📱 Recarga", `Processando — ${r.operadora || ""} R$ ${Number(r.valor).toFixed(2)}`);
          toast.info(`Recarga Processando — ${r.operadora || ""} R$ ${Number(r.valor).toFixed(2)}`, { id: `recarga-${r.id}`, description: `${profile.nome || profile.email || "Usuário"} · ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}` });
        })
        .on("postgres_changes", {
          event: "UPDATE", schema: "public", table: "recargas",
        }, async (payload) => {
          const r = payload.new as any;
          const old = payload.old as any;
          if (r.status !== old?.status) {
            const profile = await getProfile(r.user_id);
            const statusMap: Record<string, string> = {
              completed: "✅ Concluída",
              concluida: "✅ Concluída",
              falha: "❌ Falhou",
              pending: "⏳ Processando",
              pendente: "⏳ Processando",
              processing: "⚙️ Processando",
              cancelled: "🚫 Cancelada",
            };
            const label = statusMap[r.status] || r.status;
            const updatedMsg = `Recarga ${label} — ${r.operadora || ""} R$ ${Number(r.valor).toFixed(2)}`;
            const updatedAt = r.updated_at || new Date().toISOString();

            // Update the existing INSERT notification in-place instead of creating a duplicate
            const originalId = r.id;
            if (knownIds.current.has(originalId)) {
              setNotifications(prev => prev.map(n =>
                n.id === originalId
                  ? { ...n, message: updatedMsg, status: r.status, created_at: updatedAt }
                  : n
              ));
              // Also update in the database
              supabase.from("admin_notifications" as any)
                .update({ message: updatedMsg, status: r.status, created_at: updatedAt } as any)
                .eq("id", originalId)
                .then(() => {});
            } else {
              addNotification({
                id: originalId,
                type: "recarga",
                message: updatedMsg,
                amount: Number(r.valor),
                user_id: r.user_id,
                user_nome: profile.nome || undefined,
                user_email: profile.email || undefined,
                status: r.status,
                created_at: updatedAt,
                is_read: false,
              });
            }
          }
        })
        .subscribe();
      channels.push(ch);
    }

    if (listenTo.includes("new_user")) {
      const ch = supabase.channel("notif-new-users-all")
        .on("postgres_changes", {
          event: "INSERT", schema: "public", table: "profiles",
        }, (payload) => {
          const row = payload.new as any;
          if (!row?.id) return;
          const label = row.nome?.trim() || row.email?.trim() || "Usuário";
          addNotification({
            id: `web-${row.id}`,
            type: "new_user_web",
            message: `Novo cadastro Web: ${label}`,
            amount: 0,
            user_id: row.id,
            user_nome: row.nome || undefined,
            user_email: row.email || undefined,
            status: "new",
            created_at: row.created_at || new Date().toISOString(),
            is_read: false,
          });
          try { playWebSignupSound(); } catch {}
          showSystemNotification("🆕 Novo cadastro", label);
          toast.success(`Novo cadastro Web: ${label}`, { description: `${label} · ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}` });
        })
        .on("postgres_changes", {
          event: "INSERT", schema: "public", table: "telegram_users",
        }, (payload) => {
          const row = payload.new as any;
          if (!row?.is_registered) return;
          const label = row.username?.trim() ? `@${row.username}` : row.first_name?.trim() || `ID ${row.telegram_id}`;
          addNotification({
            id: `tg-${row.id}`,
            type: "new_user_telegram",
            message: `Novo cadastro Telegram: ${label}`,
            amount: 0,
            user_id: row.id,
            user_nome: label,
            status: "new",
            created_at: row.created_at || new Date().toISOString(),
            is_read: false,
          });
          try { playTelegramSignupSound(); } catch {}
          showSystemNotification("🤖 Novo Telegram", label);
          toast.info(`Novo cadastro Telegram: ${label}`, { description: `${label} · ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}` });
        })
        .on("postgres_changes", {
          event: "UPDATE", schema: "public", table: "telegram_users",
        }, (payload) => {
          const row = payload.new as any;
          const old = payload.old as any;
          if (!row?.is_registered || old?.is_registered === row.is_registered) return;
          const label = row.username?.trim() ? `@${row.username}` : row.first_name?.trim() || `ID ${row.telegram_id}`;
          addNotification({
            id: `tg-upd-${row.id}`,
            type: "new_user_telegram",
            message: `Novo cadastro Telegram: ${label}`,
            amount: 0,
            user_id: row.id,
            user_nome: label,
            status: "new",
            created_at: row.updated_at || new Date().toISOString(),
            is_read: false,
          });
          try { playTelegramSignupSound(); } catch {}
          showSystemNotification("🤖 Novo Telegram", label);
          toast.info(`Novo cadastro Telegram: ${label}`, { description: `${label} · ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}` });
        })
        .subscribe();
      channels.push(ch);
    }

    return () => {
      channels.forEach(ch => supabase.removeChannel(ch));
    };
  }, [listenTo, addNotification, getProfile]);

  const markAllRead = useCallback(async () => {
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    await supabase
      .from("admin_notifications" as any)
      .update({ is_read: true } as any)
      .eq("is_read", false);
  }, []);

  const clearAll = useCallback(async () => {
    const ids = notifications.map(n => n.id);
    setNotifications([]);
    setUnreadCount(0);
    knownIds.current.clear();
    if (ids.length > 0) {
      await supabase.from("admin_notifications" as any).delete().in("id", ids);
    }
  }, [notifications]);

  return { notifications, unreadCount, loading, markAllRead, clearAll };
}
