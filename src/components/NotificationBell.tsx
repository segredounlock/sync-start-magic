import { useState, useRef, useEffect } from "react";
import { Bell, X, DollarSign, Smartphone, UserPlus, Bot, CheckCheck, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications, AppNotification } from "@/hooks/useNotifications";

interface NotificationBellProps {
  listenTo: ("deposit" | "recarga" | "new_user")[];
  revendedores?: { id: string; nome: string | null; email: string | null }[];
}

const ICON_MAP: Record<AppNotification["type"], typeof DollarSign> = {
  deposit: DollarSign,
  recarga: Smartphone,
  new_user_web: UserPlus,
  new_user_telegram: Bot,
};

const COLOR_MAP: Record<AppNotification["type"], string> = {
  deposit: "bg-success/15 text-success",
  recarga: "bg-primary/15 text-primary",
  new_user_web: "bg-accent/15 text-accent-foreground",
  new_user_telegram: "bg-primary/15 text-primary",
};

const STATUS_LABEL: Record<string, { icon: string; cls: string }> = {
  completed: { icon: "✓", cls: "bg-success/15 text-success" },
  concluida: { icon: "✓", cls: "bg-success/15 text-success" },
  paid: { icon: "✓", cls: "bg-success/15 text-success" },
  falha: { icon: "✗", cls: "bg-destructive/15 text-destructive" },
  new: { icon: "●", cls: "bg-primary/15 text-primary" },
};

function fmtTime(d: string) {
  try {
    return new Date(d).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function fmtDate(d: string) {
  try {
    const date = new Date(d);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return "Hoje";
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return "Ontem";
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  } catch {
    return "";
  }
}

export function NotificationBell({ listenTo, revendedores }: NotificationBellProps) {
  const { notifications, unreadCount, loading, markAllRead, clearAll } = useNotifications({
    listenTo,
    revendedores,
  });

  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Group by date
  const grouped = notifications.reduce<Record<string, AppNotification[]>>((acc, n) => {
    const key = fmtDate(n.created_at);
    if (!acc[key]) acc[key] = [];
    acc[key].push(n);
    return acc;
  }, {});

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => {
          setOpen(!open);
          if (!open) markAllRead();
        }}
        className="relative p-2 rounded-xl hover:bg-muted/60 text-muted-foreground transition-all duration-200 active:scale-95"
        aria-label="Notificações"
      >
        <Bell className="h-5 w-5" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center px-1 shadow-sm"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Mobile backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/40 z-40 sm:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ type: "spring", damping: 24, stiffness: 300 }}
              className="fixed inset-x-3 top-14 bottom-auto z-50 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[380px] max-h-[75vh] sm:max-h-[480px] rounded-2xl border border-border bg-background/95 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between bg-muted/20">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">Notificações</h3>
                  {notifications.length > 0 && (
                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                      {notifications.length}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {notifications.length > 0 && (
                    <>
                      <button
                        onClick={markAllRead}
                        className="text-[10px] text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-muted transition-colors flex items-center gap-1"
                        title="Marcar todas como lidas"
                      >
                        <CheckCheck className="h-3 w-3" />
                        <span className="hidden sm:inline">Lidas</span>
                      </button>
                      <button
                        onClick={clearAll}
                        className="text-[10px] text-muted-foreground hover:text-destructive px-2 py-1 rounded-lg hover:bg-destructive/10 transition-colors flex items-center gap-1"
                        title="Limpar tudo"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto overscroll-contain">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-2">
                    <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <p className="text-xs text-muted-foreground">Carregando...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
                      <Bell className="h-6 w-6 opacity-40" />
                    </div>
                    <p className="text-sm font-medium">Tudo limpo!</p>
                    <p className="text-xs mt-1 opacity-70">Notificações em tempo real aparecerão aqui</p>
                  </div>
                ) : (
                  Object.entries(grouped).map(([dateLabel, items]) => (
                    <div key={dateLabel}>
                      {/* Date separator */}
                      <div className="sticky top-0 bg-background/90 backdrop-blur-sm px-4 py-1.5 border-b border-border/30">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                          {dateLabel}
                        </span>
                      </div>

                      {/* Items */}
                      {items.map((n, i) => {
                        const Icon = ICON_MAP[n.type] || Smartphone;
                        const colorCls = COLOR_MAP[n.type] || "bg-muted text-foreground";
                        const statusInfo = STATUS_LABEL[n.status] || { icon: "⏳", cls: "bg-warning/15 text-warning" };

                        return (
                          <motion.div
                            key={n.id}
                            initial={{ opacity: 0, x: 8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.02, duration: 0.15 }}
                            className={`px-4 py-3 border-b border-border/20 hover:bg-muted/30 transition-colors cursor-default ${
                              !n.is_read ? "bg-primary/[0.03]" : ""
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {/* Icon */}
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${colorCls}`}>
                                <Icon className="h-4 w-4" />
                              </div>

                              {/* Content */}
                              <div className="min-w-0 flex-1">
                                <p className="text-[13px] font-medium text-foreground leading-snug">
                                  {n.message}
                                </p>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <span className="text-[11px] text-muted-foreground truncate">
                                    {n.user_nome || n.user_email || "Usuário"}
                                  </span>
                                  <span className="text-muted-foreground/40">·</span>
                                  <span className="text-[11px] text-muted-foreground/70 tabular-nums shrink-0">
                                    {fmtTime(n.created_at)}
                                  </span>
                                </div>
                              </div>

                              {/* Status badge */}
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${statusInfo.cls}`}>
                                {statusInfo.icon}
                              </span>

                              {/* Unread dot */}
                              {!n.is_read && (
                                <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
