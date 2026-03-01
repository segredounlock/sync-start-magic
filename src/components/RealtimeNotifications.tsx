import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bell, X, DollarSign, Smartphone, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export interface Notification {
  id: string;
  type: "deposit" | "recarga";
  message: string;
  amount: number;
  user_id: string;
  user_nome?: string;
  user_email?: string;
  status: string;
  created_at: string;
}

interface Props {
  /** Which event types to listen for */
  listenTo: ("deposit" | "recarga")[];
  /** List of resellers for filtering (Principal page) */
  revendedores?: { id: string; nome: string | null; email: string | null }[];
  /** Show reseller filter dropdown */
  showFilter?: boolean;
}

export function RealtimeNotifications({ listenTo, revendedores, showFilter }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [filterUserId, setFilterUserId] = useState<string>("all");
  const [unreadCount, setUnreadCount] = useState(0);
  const profileCache = useRef<Record<string, { nome: string | null; email: string | null }>>({});
  const panelRef = useRef<HTMLDivElement>(null);

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

  // Fetch profile info for a user_id
  const getProfile = async (userId: string) => {
    if (profileCache.current[userId]) return profileCache.current[userId];
    // Check revendedores prop first
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

  useEffect(() => {
    const channels: ReturnType<typeof supabase.channel>[] = [];

    if (listenTo.includes("deposit")) {
      const ch = supabase.channel("notif-deposits")
        .on("postgres_changes", {
          event: "UPDATE",
          schema: "public",
          table: "transactions",
        }, async (payload) => {
          const newRow = payload.new as any;
          const oldRow = payload.old as any;
          // Only notify when status changes to completed
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
            setNotifications(prev => [notif, ...prev].slice(0, 50));
            setUnreadCount(prev => prev + 1);
            toast.success(`💰 Depósito confirmado: R$ ${Number(newRow.amount).toFixed(2)} — ${profile.nome || profile.email || "Usuário"}`);
          }
        })
        .subscribe();
      channels.push(ch);
    }

    if (listenTo.includes("recarga")) {
      const ch = supabase.channel("notif-recargas")
        .on("postgres_changes", {
          event: "INSERT",
          schema: "public",
          table: "recargas",
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
          setNotifications(prev => [notif, ...prev].slice(0, 50));
          setUnreadCount(prev => prev + 1);
          toast.info(`📱 Nova recarga: ${newRow.operadora || ""} R$ ${Number(newRow.valor).toFixed(2)} — ${profile.nome || profile.email || "Usuário"}`);
        })
        .on("postgres_changes", {
          event: "UPDATE",
          schema: "public",
          table: "recargas",
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
            setNotifications(prev => [notif, ...prev].slice(0, 50));
            setUnreadCount(prev => prev + 1);
          }
        })
        .subscribe();
      channels.push(ch);
    }

    return () => {
      channels.forEach(ch => supabase.removeChannel(ch));
    };
  }, [listenTo]);

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
        onClick={() => { setOpen(!open); if (!open) setUnreadCount(0); }}
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
            className="absolute right-0 top-full mt-2 w-[340px] max-h-[420px] rounded-xl border border-border bg-background shadow-xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Notificações</h3>
              <div className="flex items-center gap-1">
                {notifications.length > 0 && (
                  <button
                    onClick={() => setNotifications([])}
                    className="text-[10px] text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted transition-colors"
                  >
                    Limpar
                  </button>
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
              {filtered.length === 0 ? (
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
                    className="px-4 py-3 border-b border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        n.type === "deposit" ? "bg-success/15 text-success" : "bg-primary/15 text-primary"
                      }`}>
                        {n.type === "deposit" ? <DollarSign className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
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
                          : "bg-warning/15 text-warning"
                      }`}>
                        {n.status === "completed" || n.status === "concluida" || n.status === "paid" ? "✓" : n.status === "falha" ? "✗" : "⏳"}
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
