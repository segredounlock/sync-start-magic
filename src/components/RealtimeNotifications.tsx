import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bell, X, DollarSign, Smartphone, Filter, UserPlus, Bot, CheckCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export interface Notification {
  id: string;
  type: "deposit" | "recarga" | "new_user_web" | "new_user_telegram";
  message: string;
  amount: number;
  user_id: string;
  user_nome?: string;
  user_email?: string;
  status: string;
  created_at: string;
  is_read?: boolean;
}

interface Props {
  listenTo: ("deposit" | "recarga" | "new_user")[];
  revendedores?: { id: string; nome: string | null; email: string | null }[];
  showFilter?: boolean;
}

async function persistNotification(n: Omit<Notification, "is_read">) {
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

export function RealtimeNotifications({ listenTo, revendedores, showFilter }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [filterUserId, setFilterUserId] = useState<string>("all");
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const profileCache = useRef<Record<string, { nome: string | null; email: string | null }>>({});
  const panelRef = useRef<HTMLDivElement>(null);
  const knownIds = useRef<Set<string>>(new Set());

  // Load persisted notifications on mount
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("admin_notifications" as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50) as any;

      if (data && Array.isArray(data)) {
        const mapped: Notification[] = data.map((r: any) => ({
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
    })();
  }, []);

  // Close panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const getProfile = async (userId: string) => {
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
  };

  const addNotification = useCallback((notif: Notification) => {
    if (knownIds.current.has(notif.id)) return;
    knownIds.current.add(notif.id);
    setNotifications(prev => [notif, ...prev].slice(0, 100));
    setUnreadCount(prev => prev + 1);
    persistNotification(notif);
  }, []);

  // Mark all as read
  const markAllRead = useCallback(async () => {
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    await supabase
      .from("admin_notifications" as any)
      .update({ is_read: true } as any)
      .eq("is_read", false);
  }, []);

  // Clear all
  const clearAll = useCallback(async () => {
    const ids = notifications.map(n => n.id);
    setNotifications([]);
    setUnreadCount(0);
    knownIds.current.clear();
    if (ids.length > 0) {
      await supabase.from("admin_notifications" as any).delete().in("id", ids);
    }
  }, [notifications]);

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
            const notif: Notification = {
              id: newRow.id,
              type: "deposit",
              message: `Depósito de R$ ${Number(newRow.amount).toFixed(2)} confirmado`,
              amount: Number(newRow.amount),
              user_id: newRow.user_id,
              user_nome: profile.nome || undefined,
              user_email: profile.email || undefined,
              status: newRow.status,
              created_at: newRow.updated_at || new Date().toISOString(),
            };
            addNotification(notif);
            toast.success(`💰 Depósito confirmado: R$ ${Number(newRow.amount).toFixed(2)} — ${profile.nome || profile.email || "Usuário"}`);
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
          const newRow = payload.new as any;
          const profile = await getProfile(newRow.user_id);
          const notif: Notification = {
            id: newRow.id,
            type: "recarga",
            message: `Recarga ${newRow.operadora || ""} R$ ${Number(newRow.valor).toFixed(2)} — ${newRow.telefone}`,
            amount: Number(newRow.valor),
            user_id: newRow.user_id,
            user_nome: profile.nome || undefined,
            user_email: profile.email || undefined,
            status: newRow.status,
            created_at: newRow.created_at || new Date().toISOString(),
          };
          addNotification(notif);
          toast.info(`📱 Nova recarga: ${newRow.operadora || ""} R$ ${Number(newRow.valor).toFixed(2)} — ${profile.nome || profile.email || "Usuário"}`);
        })
        .on("postgres_changes", {
          event: "UPDATE", schema: "public", table: "recargas",
        }, async (payload) => {
          const newRow = payload.new as any;
          const oldRow = payload.old as any;
          if (newRow.status !== oldRow?.status) {
            const profile = await getProfile(newRow.user_id);
            const statusLabel = newRow.status === "completed" || newRow.status === "concluida" ? "✅ Concluída" : newRow.status === "falha" ? "❌ Falhou" : newRow.status;
            const notif: Notification = {
              id: `${newRow.id}-update`,
              type: "recarga",
              message: `Recarga ${statusLabel} — ${newRow.operadora || ""} R$ ${Number(newRow.valor).toFixed(2)}`,
              amount: Number(newRow.valor),
              user_id: newRow.user_id,
              user_nome: profile.nome || undefined,
              user_email: profile.email || undefined,
              status: newRow.status,
              created_at: newRow.updated_at || new Date().toISOString(),
            };
            addNotification(notif);
          }
        })
        .subscribe();
      channels.push(ch);
    }

    if (listenTo.includes("new_user")) {
      const chWeb = supabase.channel("notif-new-web-users")
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
          });
        })
        .subscribe();
      channels.push(chWeb);

      const chTg = supabase.channel("notif-new-telegram-users")
        .on("postgres_changes", {
          event: "INSERT", schema: "public", table: "telegram_users",
        }, (payload) => {
          const row = payload.new as any;
          if (!row?.is_registered) return;
          const label = row.username?.trim() ? `@${row.username.trim()}` : row.first_name?.trim() || `ID ${row.telegram_id}`;
          addNotification({
            id: `tg-${row.id}`,
            type: "new_user_telegram",
            message: `Novo cadastro Telegram: ${label}`,
            amount: 0,
            user_id: row.id,
            user_nome: label,
            status: "new",
            created_at: row.created_at || new Date().toISOString(),
          });
        })
        .on("postgres_changes", {
          event: "UPDATE", schema: "public", table: "telegram_users",
        }, (payload) => {
          const row = payload.new as any;
          const oldRow = payload.old as any;
          if (!row?.is_registered || oldRow?.is_registered === row.is_registered) return;
          const label = row.username?.trim() ? `@${row.username.trim()}` : row.first_name?.trim() || `ID ${row.telegram_id}`;
          addNotification({
            id: `tg-upd-${row.id}`,
            type: "new_user_telegram",
            message: `Novo cadastro Telegram: ${label}`,
            amount: 0,
            user_id: row.id,
            user_nome: label,
            status: "new",
            created_at: row.updated_at || new Date().toISOString(),
          });
        })
        .subscribe();
      channels.push(chTg);
    }

    return () => {
      channels.forEach(ch => supabase.removeChannel(ch));
    };
  }, [listenTo, addNotification]);

  const filtered = filterUserId === "all"
    ? notifications
    : notifications.filter(n => n.user_id === filterUserId);

  const fmtTime = (d: string) => {
    try { return new Date(d).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }); }
    catch { return ""; }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => { setOpen(!open); if (!open) markAllRead(); }}
        className="relative p-2 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors"
        title="Notificações"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center px-1"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed right-2 left-2 top-14 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[340px] max-h-[70vh] sm:max-h-[420px] rounded-xl border border-border bg-background shadow-xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Notificações</h3>
              <div className="flex items-center gap-1">
                {notifications.length > 0 && (
                  <>
                    <button
                      onClick={markAllRead}
                      className="text-[10px] text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted transition-colors flex items-center gap-1"
                      title="Marcar todas como lidas"
                    >
                      <CheckCheck className="h-3 w-3" /> Lidas
                    </button>
                    <button
                      onClick={clearAll}
                      className="text-[10px] text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted transition-colors"
                    >
                      Limpar
                    </button>
                  </>
                )}
                <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-muted text-muted-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Filter */}
            {showFilter && revendedores && revendedores.length > 0 && (
              <div className="px-4 py-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <select
                    value={filterUserId}
                    onChange={e => setFilterUserId(e.target.value)}
                    className="flex-1 text-xs rounded-lg glass-input py-1.5 px-2 text-foreground bg-transparent focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="all">Todos os revendedores</option>
                    {revendedores.map(r => (
                      <option key={r.id} value={r.id}>{r.nome || r.email || r.id.slice(0, 8)}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-10 text-muted-foreground">
                  <p className="text-xs">Carregando...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                  <Bell className="h-8 w-8 mb-2 opacity-30" />
                  <p className="text-xs">Nenhuma notificação ainda</p>
                  <p className="text-[10px] mt-1">Notificações em tempo real aparecerão aqui</p>
                </div>
              ) : (
                filtered.map((n, i) => (
                  <motion.div
                    key={n.id + i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`px-4 py-3 border-b border-border/50 hover:bg-muted/30 transition-colors ${!n.is_read ? "bg-primary/5" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        n.type === "deposit" ? "bg-success/15 text-success"
                        : n.type === "new_user_web" ? "bg-emerald-500/15 text-emerald-500"
                        : n.type === "new_user_telegram" ? "bg-blue-500/15 text-blue-500"
                        : "bg-primary/15 text-primary"
                      }`}>
                        {n.type === "deposit" ? <DollarSign className="h-4 w-4" />
                        : n.type === "new_user_web" ? <UserPlus className="h-4 w-4" />
                        : n.type === "new_user_telegram" ? <Bot className="h-4 w-4" />
                        : <Smartphone className="h-4 w-4" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-foreground leading-tight">{n.message}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {n.user_nome || n.user_email || "Usuário"} • {fmtTime(n.created_at)}
                        </p>
                      </div>
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${
                        n.status === "completed" || n.status === "concluida" || n.status === "paid"
                          ? "bg-success/15 text-success"
                          : n.status === "falha" ? "bg-destructive/15 text-destructive"
                          : n.status === "new" ? "bg-blue-500/15 text-blue-500"
                          : "bg-warning/15 text-warning"
                      }`}>
                        {n.status === "completed" || n.status === "concluida" || n.status === "paid" ? "✓" : n.status === "falha" ? "✗" : n.status === "new" ? "🆕" : "⏳"}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
