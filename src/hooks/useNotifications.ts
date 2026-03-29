import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { appToast } from "@/lib/toast";
import { playSuccessSound, playWebSignupSound, playTelegramSignupSound, playCashRegisterSound } from "@/lib/sounds";
import { formatTimeBR } from "@/lib/timezone";
// ── System notification (plays device sound without user interaction) ──
let _notifPermission: NotificationPermission = typeof Notification !== "undefined" ? Notification.permission : "denied";

function requestNotifPermission() {
  if (typeof Notification === "undefined") return;
  if (_notifPermission === "default") {
    Notification.requestPermission().then((p) => { _notifPermission = p; }).catch(() => {});
  }
}

async function showSystemNotification(title: string, body: string) {
  try {
    if (typeof Notification === "undefined" || _notifPermission !== "granted") return;
    // Use ServiceWorker showNotification for background support
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.ready;
      (reg as any).showNotification(title, {
        body,
        icon: "/favicon.png",
        badge: "/favicon.png",
        tag: `notif-${Date.now()}`,
        renotify: true,
        vibrate: [200, 100, 200],
        requireInteraction: false,
      } as any);
    } else {
      new Notification(title, { body, icon: "/favicon.png", tag: body });
    }
  } catch { /* ignore */ }
}

export interface AppNotification {
  id: string;
  type: "deposit" | "recarga" | "new_user_web" | "new_user_telegram" | "debt_collected";
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

export interface NotifConfig {
  showDepositToast?: boolean;
  showRecargaToast?: boolean;
  showNewUserToast?: boolean;
}

interface UseNotificationsOptions {
  listenTo: ListenType[];
  revendedores?: { id: string; nome: string | null; email: string | null }[];
  notifConfig?: NotifConfig;
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

export function useNotifications({ listenTo, revendedores, notifConfig }: UseNotificationsOptions) {
  const showDeposit = notifConfig?.showDepositToast !== false;
  const showRecarga = notifConfig?.showRecargaToast !== false;
  const showNewUser = notifConfig?.showNewUserToast !== false;
  // Stabilize listenTo to prevent effect re-runs on every render
  const listenToKey = [...listenTo].sort().join(",");
  const stableListenTo = useMemo(() => listenTo, [listenToKey]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const profileCache = useRef<Record<string, { nome: string | null; email: string | null }>>({});
  const knownIds = useRef<Set<string>>(new Set());
  const revendedoresRef = useRef(revendedores);
  revendedoresRef.current = revendedores;
  // Keep toast/sound flags in refs so the realtime effect doesn't re-run when they change
  const showDepositRef = useRef(showDeposit);
  showDepositRef.current = showDeposit;
  const showRecargaRef = useRef(showRecarga);
  showRecargaRef.current = showRecarga;
  const showNewUserRef = useRef(showNewUser);
  showNewUserRef.current = showNewUser;

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
    const rev = revendedoresRef.current?.find(r => r.id === userId);
    if (rev) {
      profileCache.current[userId] = { nome: rev.nome, email: rev.email };
      return profileCache.current[userId];
    }
    const { data } = await supabase.from("profiles_public").select("nome").eq("id", userId).maybeSingle();
    const result = { nome: data?.nome || null, email: null };
    profileCache.current[userId] = result;
    return result;
  }, []);

  const addNotification = useCallback((notif: AppNotification) => {
    if (knownIds.current.has(notif.id)) return;
    knownIds.current.add(notif.id);
    setNotifications(prev => [notif, ...prev].slice(0, 100));
    setUnreadCount(prev => prev + 1);
    persistNotification(notif);
  }, []);

  // Realtime subscriptions with auto-reconnect and fallback polling
  useEffect(() => {
    let channels: ReturnType<typeof supabase.channel>[] = [];
    let pollTimer: ReturnType<typeof setTimeout> | null = null;
    let isActive = true;
    let lastPollAt = new Date().toISOString();

    const setupChannels = () => {
      // Clean up old channels first
      channels.forEach(ch => supabase.removeChannel(ch));
      channels = [];

      if (stableListenTo.includes("deposit")) {
        const ch = supabase.channel(`notif-deposits-${Date.now()}`)
          .on("postgres_changes", {
            event: "UPDATE", schema: "public", table: "transactions",
          }, async (payload) => {
            const newRow = payload.new as any;
            const oldRow = payload.old as any;
            // Only fire when status transitions TO completed (not if already completed)
            if (newRow.status === "completed" && oldRow?.status !== "completed") {
              // Deduplicate: skip if already known
              if (knownIds.current.has(newRow.id)) return;
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
                created_at: newRow.updated_at || newRow.created_at,
                is_read: false,
              });
              try { playCashRegisterSound(); } catch {}
              if (showDepositRef.current) {
                showSystemNotification("💰 Depósito confirmado", `R$ ${Number(newRow.amount).toFixed(2)} — ${profile.nome || profile.email || "Usuário"}`);
                appToast.depositConfirmed(`Depósito confirmado: R$ ${Number(newRow.amount).toFixed(2)}`, { id: `deposit-${newRow.id}`, description: `${profile.nome || profile.email || "Usuário"} · ${formatTimeBR(newRow.updated_at || newRow.created_at)}` });
              }
            }
          })
          .subscribe((status) => {
            console.log("[Notif] deposit channel:", status);
            if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
              setTimeout(() => { if (isActive) setupChannels(); }, 3000);
            }
          });
        channels.push(ch);
      }

      if (stableListenTo.includes("recarga")) {
        const ch = supabase.channel(`notif-recargas-${Date.now()}`)
          .on("postgres_changes", {
            event: "INSERT", schema: "public", table: "recargas",
          }, async (payload) => {
            const r = payload.new as any;
            // Skip INSERT toast for final statuses — the UPDATE handler will cover them
            const isFinal = ["completed", "concluida", "falha", "cancelled"].includes(r.status);
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
              message: `Recarga ${insertLabel} — ${(r.operadora || "").toUpperCase()} R$ ${Number(r.valor).toFixed(2)}`,
              amount: Number(r.valor),
              user_id: r.user_id,
              user_nome: profile.nome || undefined,
              user_email: profile.email || undefined,
              status: r.status,
              created_at: r.created_at,
              is_read: false,
            });
            // Only show toast/sound for non-final statuses (processing/pending)
            // Final statuses will be handled by the UPDATE listener to avoid duplicates
            if (!isFinal) {
              try { playSuccessSound(); } catch {}
              if (showRecargaRef.current) {
                showSystemNotification("📱 Recarga", `Processando — ${(r.operadora || "").toUpperCase()} R$ ${Number(r.valor).toFixed(2)}`);
                appToast.recargaProcessing(`Recarga Processando — ${(r.operadora || "").toUpperCase()} R$ ${Number(r.valor).toFixed(2)}`, { id: `recarga-${r.id}`, description: `${profile.nome || profile.email || "Usuário"} · ${formatTimeBR(r.created_at)}` });
              }
            }
          })
          .on("postgres_changes", {
            event: "UPDATE", schema: "public", table: "recargas",
          }, async (payload) => {
            const r = payload.new as any;
            const old = payload.old as any;
            // Guard: only process if status actually changed and we have valid data
            if (!r?.id || !r?.status || r.status === old?.status) return;
            
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
            const operadora = (r.operadora || "").toUpperCase();
            const valor = Number(r.valor || 0).toFixed(2);
            const updatedMsg = `Recarga ${label} — ${operadora} R$ ${valor}`;
            const originalTime = r.created_at;

            // Validate message is not empty before proceeding
            if (!updatedMsg || updatedMsg.trim().length === 0) {
              console.warn("[Notif] Skipping recarga update with empty message", r);
              return;
            }

            const originalId = r.id;

            if (knownIds.current.has(originalId)) {
              // Already known — just update the existing notification silently (no toast/sound)
              setNotifications(prev => prev.map(n =>
                n.id === originalId
                  ? { ...n, message: updatedMsg, status: r.status, created_at: originalTime }
                  : n
              ));
              supabase.from("admin_notifications" as any)
                .update({ message: updatedMsg, status: r.status, created_at: originalTime } as any)
                .eq("id", originalId)
                .then(() => {});
              // Only show toast for final status changes (completed/failed), not intermediate
              if (showRecargaRef.current && (r.status === "completed" || r.status === "concluida" || r.status === "falha" || r.status === "cancelled")) {
                const toastMethod = r.status === "completed" || r.status === "concluida"
                  ? appToast.recargaCompleted
                  : appToast.recargaFailed;
                toastMethod(updatedMsg, { id: `recarga-upd-${r.id}`, description: `${profile.nome || profile.email || "Usuário"} · ${formatTimeBR(r.updated_at || r.created_at)}` });
              }
            } else {
              // New notification — show toast and sound
              try { playSuccessSound(); } catch {}
              if (showRecargaRef.current) {
                showSystemNotification("📱 Recarga", `${label} — ${operadora} R$ ${valor}`);
                const toastMethod = r.status === "completed" || r.status === "concluida"
                  ? appToast.recargaCompleted
                  : r.status === "falha" || r.status === "cancelled"
                    ? appToast.recargaFailed
                    : appToast.recargaProcessing;
                toastMethod(updatedMsg, { id: `recarga-upd-${r.id}`, description: `${profile.nome || profile.email || "Usuário"} · ${formatTimeBR(r.updated_at || r.created_at)}` });
              }
              addNotification({
                id: originalId,
                type: "recarga",
                message: updatedMsg,
                amount: Number(r.valor || 0),
                user_id: r.user_id,
                user_nome: profile.nome || undefined,
                user_email: profile.email || undefined,
                status: r.status,
                created_at: originalTime,
                is_read: false,
              });
            }
          })
          .subscribe((status) => {
            console.log("[Notif] recarga channel:", status);
            if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
              setTimeout(() => { if (isActive) setupChannels(); }, 3000);
            }
          });
        channels.push(ch);
      }

      if (stableListenTo.includes("new_user")) {
        const ch = supabase.channel(`notif-new-users-all-${Date.now()}`)
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
              created_at: row.created_at,
              is_read: false,
            });
            try { playWebSignupSound(); } catch {}
            if (showNewUserRef.current) {
              showSystemNotification("🆕 Novo cadastro", label);
              appToast.newUserWeb(`Novo cadastro Web: ${label}`, { description: `${label} · ${formatTimeBR(row.created_at)}` });
            }
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
              created_at: row.created_at,
              is_read: false,
            });
            try { playTelegramSignupSound(); } catch {}
            if (showNewUserRef.current) {
              showSystemNotification("🤖 Novo Telegram", label);
              appToast.newUserTelegram(`Novo cadastro Telegram: ${label}`, { description: `${label} · ${formatTimeBR(row.created_at)}` });
            }
          })
          .on("postgres_changes", {
            event: "UPDATE", schema: "public", table: "telegram_users",
          }, (payload) => {
            const row = payload.new as any;
            const old = payload.old as any;
            // Only notify when is_registered changes from false→true
            // old must explicitly have is_registered=false (requires REPLICA IDENTITY FULL)
            if (!row?.is_registered) return;
            if (old?.is_registered !== false) return;
            // Use same ID as INSERT to deduplicate (tg- prefix)
            const dedupeId = `tg-${row.id}`;
            if (knownIds.current.has(dedupeId)) return;
            const label = row.username?.trim() ? `@${row.username}` : row.first_name?.trim() || `ID ${row.telegram_id}`;
            addNotification({
              id: dedupeId,
              type: "new_user_telegram",
              message: `Novo cadastro Telegram: ${label}`,
              amount: 0,
              user_id: row.id,
              user_nome: label,
              status: "new",
              created_at: row.updated_at || row.created_at,
              is_read: false,
            });
            try { playTelegramSignupSound(); } catch {}
            if (showNewUserRef.current) {
              showSystemNotification("🤖 Novo Telegram", label);
              appToast.newUserTelegram(`Novo cadastro Telegram: ${label}`, { description: `${label} · ${formatTimeBR(row.updated_at || row.created_at)}` });
            }
          })
          .subscribe((status) => {
            console.log("[Notif] new_user channel:", status);
            if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
              setTimeout(() => { if (isActive) setupChannels(); }, 3000);
            }
          });
        channels.push(ch);
      }
    };

    // Fallback polling: catch events missed by realtime
    const pollForMissedEvents = async () => {
      if (!isActive) return;
      try {
        const since = lastPollAt;
        lastPollAt = new Date().toISOString();

        // Poll for recent completed deposits
        if (stableListenTo.includes("deposit")) {
          const { data: deposits } = await supabase
            .from("transactions")
            .select("id, amount, user_id, status, type, updated_at, created_at")
            .eq("status", "completed")
            .eq("type", "deposit")
            .gt("updated_at", since)
            .order("updated_at", { ascending: false })
            .limit(10);

          if (deposits) {
            for (const dep of deposits) {
              if (!knownIds.current.has(dep.id)) {
                const profile = await getProfile(dep.user_id);
                addNotification({
                  id: dep.id,
                  type: "deposit",
                  message: `Depósito R$ ${Number(dep.amount).toFixed(2)} confirmado`,
                  amount: Number(dep.amount),
                  user_id: dep.user_id,
                  user_nome: profile.nome || undefined,
                  user_email: profile.email || undefined,
                  status: dep.status,
                  created_at: dep.updated_at || dep.created_at,
                  is_read: false,
                });
              }
            }
          }
        }

        // Poll for recent recargas
        if (stableListenTo.includes("recarga")) {
          const { data: recargas } = await supabase
            .from("recargas")
            .select("id, telefone, operadora, valor, custo, status, created_at, user_id, updated_at")
            .gt("updated_at", since)
            .order("updated_at", { ascending: false })
            .limit(10);

          if (recargas) {
            for (const r of recargas) {
              if (!knownIds.current.has(r.id)) {
                const profile = await getProfile(r.user_id);
                const statusMap: Record<string, string> = {
                  completed: "✅ Concluída", concluida: "✅ Concluída",
                  falha: "❌ Falhou", pending: "⏳ Processando",
                };
                const label = statusMap[r.status] || r.status;
                addNotification({
                  id: r.id,
                  type: "recarga",
                  message: `Recarga ${label} — ${(r.operadora || "").toUpperCase()} R$ ${Number(r.valor).toFixed(2)}`,
                  amount: Number(r.valor),
                  user_id: r.user_id,
                  user_nome: profile.nome || undefined,
                  user_email: profile.email || undefined,
                  status: r.status,
                  created_at: r.created_at,
                  is_read: false,
                });
              }
            }
          }
        }
      } catch (e) {
        console.warn("[Notif] Poll fallback error:", e);
      }

      if (isActive) {
        pollTimer = setTimeout(pollForMissedEvents, 15000); // Poll every 15s
      }
    };

    // Reconnect when tab becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isActive) {
        console.log("[Notif] Tab visible, reconnecting channels...");
        setupChannels();
        pollForMissedEvents(); // Immediate poll to catch missed events
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Initial setup
    setupChannels();
    pollTimer = setTimeout(pollForMissedEvents, 15000);

    return () => {
      isActive = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (pollTimer) clearTimeout(pollTimer);
      channels.forEach(ch => supabase.removeChannel(ch));
    };
  }, [stableListenTo, addNotification, getProfile]);

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
