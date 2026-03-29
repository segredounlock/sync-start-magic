import { useEffect, useState, useCallback, useRef, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { styledToast as toast } from "@/lib/toast";
import { playSuccessSound } from "@/lib/sounds";
import { getLocalDayBoundsUTC, formatTimeBR } from "@/lib/timezone";
import {
  Smartphone, Clock, CheckCircle2, XCircle, AlertTriangle, Bot,
  TrendingUp, Activity, Zap, RefreshCw,
} from "lucide-react";
import { AnimatedCounter, AnimatedInt } from "@/components/AnimatedCounter";
import { safeValor } from "@/lib/utils";

interface Recarga {
  id: string;
  telefone: string;
  operadora: string | null;
  valor: number;
  custo: number;
  custo_api: number;
  status: string;
  created_at: string;
  completed_at: string | null;
  user_id: string;
}

interface DashboardStats {
  total: number;
  completed: number;
  pending: number;
  failed: number;
  totalValue: number;
  totalCost: number;
}

interface TelegramActivityItem {
  id: string;
  type: string;
  message: string;
  status: string;
  created_at: string;
}

interface Props {
  userId?: string;
  fmt: (v: number) => string;
}

/* ── Credits-style scrolling feed ── */
function CreditsFeed({
  recargas, loading, userId, userNames, fmt, fmtTime,
  getProcessingTime, statusIcon, statusLabel, statusClass, opColor,
}: {
  recargas: Recarga[];
  loading: boolean;
  userId?: string;
  userNames: Record<string, string>;
  fmt: (v: number) => string;
  fmtTime: (d: string) => string;
  getProcessingTime: (r: Recarga) => string | null;
  statusIcon: (s: string) => ReactNode;
  statusLabel: (s: string) => string;
  statusClass: (s: string) => string;
  opColor: (op: string | null) => string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const offsetRef = useRef(0);
  const pausedRef = useRef(false);
  const [paused, setPaused] = useState(false);

  const SPEED = 0.4; // px per frame (~24px/s at 60fps)

  useEffect(() => {
    const container = scrollRef.current;
    const inner = innerRef.current;
    if (!container || !inner || recargas.length === 0) return;

    const animate = () => {
      if (!pausedRef.current && inner) {
        offsetRef.current += SPEED;
        const contentH = inner.scrollHeight / 2; // we duplicate content
        if (contentH > 0 && offsetRef.current >= contentH) {
          offsetRef.current -= contentH;
        }
        inner.style.transform = `translateY(-${offsetRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [recargas.length]);

  const handlePause = () => { pausedRef.current = true; setPaused(true); };
  const handleResume = () => { pausedRef.current = false; setPaused(false); };

  const renderRow = (r: Recarga, key: string) => {
    const procTime = getProcessingTime(r);
    return (
      <div key={key} className="px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-3">
          {statusIcon(r.status)}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`font-bold text-sm ${opColor(r.operadora)}`}>{(r.operadora || "—").toUpperCase()}</span>
              <span className="text-xs text-muted-foreground font-mono">{r.telefone}</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-muted-foreground">{fmtTime(r.created_at)}</span>
              {procTime && <span className="text-[10px] text-success font-medium">⚡ {procTime}</span>}
              {!userId && userNames[r.user_id] && (
                <span className="text-[10px] text-muted-foreground/60 truncate max-w-[100px]">• {userNames[r.user_id]}</span>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="font-bold text-sm text-foreground">{fmt(safeValor(r))}</p>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${statusClass(r.status)}`}>
              {statusLabel(r.status)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">Feed em Tempo Real</h3>
        <div className="flex items-center gap-2">
          {paused && <span className="text-[10px] text-warning font-medium">⏸ Pausado</span>}
          <span className="text-[10px] text-muted-foreground">{recargas.length} recargas hoje</span>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="relative overflow-hidden"
        style={{ height: recargas.length > 0 ? Math.min(420, recargas.length * 68) : 140 }}
        onMouseEnter={handlePause}
        onMouseLeave={handleResume}
        onTouchStart={handlePause}
        onTouchEnd={handleResume}
      >
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 opacity-50" />
            <p className="text-sm">Carregando...</p>
          </div>
        ) : recargas.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Smartphone className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nenhuma recarga hoje</p>
            <p className="text-[10px] mt-1">Novas recargas aparecerão aqui automaticamente</p>
          </div>
        ) : (
          <div ref={innerRef} className="will-change-transform">
            {recargas.map((r) => renderRow(r, r.id))}
            {/* Duplicate for seamless loop */}
            {recargas.map((r) => renderRow(r, `dup-${r.id}`))}
          </div>
        )}
      </div>
      {/* Fade edges */}
      {recargas.length > 3 && (
        <>
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent" style={{ position: 'relative', marginTop: '-48px' }} />
        </>
      )}
    </div>
  );
}

export default function RealtimeDashboard({ userId, fmt }: Props) {
  const [recargas, setRecargas] = useState<Recarga[]>([]);
  const [telegramActivity, setTelegramActivity] = useState<TelegramActivityItem[]>([]);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [liveIndicator, setLiveIndicator] = useState(false);
  const audioRef = useRef(false);

  const fetchRecargas = useCallback(async () => {
    try {
      const { start, end } = getLocalDayBoundsUTC();
      let query = supabase
        .from("recargas")
        .select("id, telefone, operadora, valor, custo, custo_api, status, created_at, completed_at, user_id")
        .gte("created_at", start)
        .lte("created_at", end)
        .order("created_at", { ascending: false })
        .limit(100);
      if (userId) query = query.eq("user_id", userId);

      const result = await Promise.race([
        query,
        new Promise<{ data: null }>((resolve) =>
          setTimeout(() => resolve({ data: null }), 10000)
        ),
      ]);

      if (result.data) setRecargas(result.data as any[]);
    } catch (err) {
      console.error("RealtimeDashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const isTelegramActivity = useCallback((row: any) => {
    const message = String(row?.message || "").toLowerCase();
    return row?.type === "new_user_telegram" || row?.type === "telegram_activity" || message.includes("telegram");
  }, []);

  const fetchTelegramActivity = useCallback(async () => {
    try {
      const { data } = await supabase
        .from("admin_notifications" as any)
        .select("id, type, message, status, created_at")
        .order("created_at", { ascending: false })
        .limit(30);

      if (data) {
        setTelegramActivity((data as TelegramActivityItem[]).filter(isTelegramActivity).slice(0, 8));
      }
    } catch (err) {
      console.error("RealtimeDashboard telegram activity error:", err);
    }
  }, [isTelegramActivity]);

  useEffect(() => {
    fetchRecargas();
    fetchTelegramActivity();
  }, [fetchRecargas, fetchTelegramActivity]);

  // Fetch user names for display
  useEffect(() => {
    if (!userId) {
      // Admin view: fetch all profile names
      supabase.from("profiles").select("id, nome").then(({ data }) => {
        if (data) {
          const map: Record<string, string> = {};
          data.forEach((p: any) => { if (p.nome) map[p.id] = p.nome; });
          setUserNames(map);
        }
      });
    }
  }, [userId]);

  // Realtime subscription + polling fallback
  useEffect(() => {
    const channelConfig: any = {
      event: "INSERT" as const,
      schema: "public",
      table: "recargas",
      ...(userId ? { filter: `user_id=eq.${userId}` } : {}),
    };
    const updateConfig: any = {
      event: "UPDATE" as const,
      schema: "public",
      table: "recargas",
      ...(userId ? { filter: `user_id=eq.${userId}` } : {}),
    };
    const channel = supabase
      .channel(`dashboard-recargas-${userId || "all"}`)
      .on("postgres_changes", channelConfig, (payload: any) => {
        const row = payload.new as any;
        setRecargas(prev => {
          if (prev.some(r => r.id === row.id)) return prev;
          return [row, ...prev].slice(0, 100);
        });
        blinkLive();
      })
      .on("postgres_changes", updateConfig, (payload: any) => {
        const row = payload.new as any;
        setRecargas(prev => prev.map(r => r.id === row.id ? { ...r, ...row } : r));
        blinkLive();
        if (row.status === "completed" || row.status === "concluida") {
          toast.success(`✅ Recarga ${(row.operadora || "").toUpperCase()} R$ ${Number(row.valor).toFixed(2)} concluída!`);
          playSuccessSound();
        }
      })
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "admin_notifications",
      }, (payload: any) => {
        const row = payload.new as any;
        if (!isTelegramActivity(row)) return;

        setTelegramActivity(prev => [row, ...prev.filter(item => item.id !== row.id)].slice(0, 8));
        blinkLive();
        toast.success(row.message || "Nova atividade no bot do Telegram");
        try { playSuccessSound(); } catch {}
      })
      .subscribe();

    // Polling fallback every 15s to catch missed realtime events
    const pollInterval = setInterval(() => {
      fetchRecargas();
      fetchTelegramActivity();
    }, 15000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [userId, fetchRecargas, fetchTelegramActivity, isTelegramActivity]);

  const blinkLive = () => {
    setLiveIndicator(true);
    setTimeout(() => setLiveIndicator(false), 1500);
  };

  const stats: DashboardStats = {
    total: recargas.length,
    completed: recargas.filter(r => r.status === "completed" || r.status === "concluida").length,
    pending: recargas.filter(r => r.status === "pending").length,
    failed: recargas.filter(r => r.status === "falha").length,
    totalValue: recargas.reduce((sum, r) => sum + Number(r.custo), 0),
    totalCost: recargas.reduce((sum, r) => sum + Number(r.custo_api), 0),
  };

  const fmtTime = (d: string) => {
    try {
      return formatTimeBR(d, true);
    } catch { return ""; }
  };

  const getProcessingTime = (r: Recarga) => {
    if (!r.completed_at) return null;
    const ms = new Date(r.completed_at).getTime() - new Date(r.created_at).getTime();
    if (ms <= 0) return null;
    const secs = Math.round(ms / 1000);
    return secs >= 60 ? `${Math.floor(secs / 60)}m ${secs % 60}s` : `${secs}s`;
  };

  const statusIcon = (status: string) => {
    if (status === "completed" || status === "concluida") return <CheckCircle2 className="h-4 w-4 text-success" />;
    if (status === "pending") return <Clock className="h-4 w-4 text-warning animate-pulse" />;
    if (status === "falha") return <XCircle className="h-4 w-4 text-destructive" />;
    return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
  };

  const statusLabel = (status: string) => {
    if (status === "completed" || status === "concluida") return "Concluída";
    if (status === "pending") return "Processando";
    if (status === "falha") return "Falha";
    return status;
  };

  const statusClass = (status: string) => {
    if (status === "completed" || status === "concluida") return "bg-success/15 text-success";
    if (status === "pending") return "bg-warning/15 text-warning";
    if (status === "falha") return "bg-destructive/15 text-destructive";
    return "bg-muted/50 text-muted-foreground";
  };

  const opColor = (op: string | null) => {
    if (!op) return "text-muted-foreground";
    const n = op.toLowerCase();
    if (n.includes("claro")) return "text-red-400";
    if (n.includes("tim")) return "text-blue-400";
    if (n.includes("vivo")) return "text-purple-400";
    
    return "text-primary";
  };

  // Group by operator for mini breakdown
  const opBreakdown = recargas.reduce((acc, r) => {
    const key = (r.operadora || "Outros").toUpperCase();
    if (!acc[key]) acc[key] = { count: 0, value: 0, completed: 0 };
    acc[key].count++;
    acc[key].value += Number(r.valor);
    if (r.status === "completed" || r.status === "concluida") acc[key].completed++;
    return acc;
  }, {} as Record<string, { count: number; value: number; completed: number }>);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Dashboard em Tempo Real
          </h2>
          <p className="text-xs text-muted-foreground">Recargas de hoje • Atualização automática</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
            liveIndicator ? "bg-success/20 text-success scale-105" : "bg-success/10 text-success/70"
          }`}>
            <span className={`w-2.5 h-2.5 rounded-full bg-success`} style={{ animation: "rec-blink 1.2s ease-in-out infinite" }} />
            LIVE
          </div>
          <button onClick={fetchRecargas} className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors" title="Atualizar">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Zap, label: "Total Hoje", value: String(stats.total), color: "text-primary", bg: "bg-primary/10" },
          { icon: CheckCircle2, label: "Concluídas", value: String(stats.completed), color: "text-success", bg: "bg-success/10" },
          { icon: Clock, label: "Processando", value: String(stats.pending), color: "text-warning", bg: "bg-warning/10" },
          { icon: XCircle, label: "Falhas", value: String(stats.failed), color: "text-destructive", bg: "bg-destructive/10" },
        ].map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center`}>
                <c.icon className={`h-4 w-4 ${c.color}`} />
              </div>
              <span className="text-xs text-muted-foreground">{c.label}</span>
            </div>
            <AnimatedInt value={Number(c.value)} className="text-2xl font-black text-foreground" />
          </motion.div>
        ))}
      </div>

      {/* Financial summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-success" />
            <span className="text-xs text-muted-foreground">Vendas Hoje (Cobrado)</span>
          </div>
          <AnimatedCounter value={stats.totalValue} prefix="R$&nbsp;" className="text-xl font-bold text-success" />
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Lucro Estimado (Cobrado - Custo API)</span>
          </div>
          <AnimatedCounter value={stats.totalValue - stats.totalCost} prefix="R$&nbsp;" className="text-xl font-bold text-primary" />
        </div>
      </div>

      <div className="glass-card rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" />
              Bot do Telegram em Tempo Real
            </h3>
            <p className="text-xs text-muted-foreground">Termos aceitos, entrada no fluxo de depósito e eventos críticos</p>
          </div>
          <span className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary font-semibold">
            {telegramActivity.length} eventos
          </span>
        </div>

        {telegramActivity.length === 0 ? (
          <div className="rounded-lg bg-muted/30 px-3 py-4 text-xs text-muted-foreground">
            As interações importantes do bot aparecerão aqui em tempo real.
          </div>
        ) : (
          <div className="space-y-2">
            {telegramActivity.map((item) => (
              <div key={item.id} className="rounded-lg border border-border/60 bg-muted/20 px-3 py-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground break-words">{item.message}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">{fmtTime(item.created_at)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Operator breakdown */}
      {Object.keys(opBreakdown).length > 0 && (
        <div className="glass-card rounded-xl p-4">
          <h3 className="text-sm font-bold text-foreground mb-3">Por Operadora</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Object.entries(opBreakdown).sort((a, b) => b[1].count - a[1].count).map(([op, data]) => (
              <div key={op} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Smartphone className={`h-5 w-5 ${opColor(op)} shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-sm ${opColor(op)}`}>{op}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {data.count} recargas • {data.completed} concluídas
                  </p>
                </div>
                <p className="font-bold text-sm text-foreground shrink-0">{fmt(data.value)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Feed — credits-style scroll */}
      <CreditsFeed
        recargas={recargas}
        loading={loading}
        userId={userId}
        userNames={userNames}
        fmt={fmt}
        fmtTime={fmtTime}
        getProcessingTime={getProcessingTime}
        statusIcon={statusIcon}
        statusLabel={statusLabel}
        statusClass={statusClass}
        opColor={opColor}
      />
    </motion.div>
  );
}
