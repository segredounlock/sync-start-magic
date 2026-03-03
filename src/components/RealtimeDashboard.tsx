import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { styledToast as toast } from "@/lib/toast";
import { playSuccessSound } from "@/lib/sounds";
import { getLocalDayBoundsUTC, formatTimeBR } from "@/lib/timezone";
import {
  Smartphone, Clock, CheckCircle2, XCircle, AlertTriangle,
  TrendingUp, Activity, Zap, RefreshCw,
} from "lucide-react";
import { AnimatedCounter, AnimatedInt } from "@/components/AnimatedCounter";

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

interface Props {
  userId?: string;
  fmt: (v: number) => string;
}

export default function RealtimeDashboard({ userId, fmt }: Props) {
  const [recargas, setRecargas] = useState<Recarga[]>([]);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [liveIndicator, setLiveIndicator] = useState(false);
  const audioRef = useRef(false);

  const fetchRecargas = useCallback(async () => {
    const { start, end } = getLocalDayBoundsUTC();
    let query = supabase
      .from("recargas")
      .select("id, telefone, operadora, valor, custo, custo_api, status, created_at, completed_at, user_id")
      .gte("created_at", start)
      .lte("created_at", end)
      .order("created_at", { ascending: false })
      .limit(100);
    if (userId) query = query.eq("user_id", userId);
    const { data } = await query;
    setRecargas(data || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchRecargas();
  }, [fetchRecargas]);

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
          toast.success(`✅ Recarga ${row.operadora || ""} R$ ${Number(row.valor).toFixed(2)} concluída!`);
          playSuccessSound();
        }
      })
      .subscribe();

    // Polling fallback every 15s to catch missed realtime events
    const pollInterval = setInterval(() => {
      fetchRecargas();
    }, 15000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [userId, fetchRecargas]);

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
    if (n.includes("oi")) return "text-yellow-400";
    return "text-primary";
  };

  // Group by operator for mini breakdown
  const opBreakdown = recargas.reduce((acc, r) => {
    const key = r.operadora || "Outros";
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
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">Feed em Tempo Real</h3>
          <span className="text-[10px] text-muted-foreground">{recargas.length} recargas hoje</span>
        </div>
        <div className="relative max-h-[420px] overflow-y-auto scroll-smooth" style={{ scrollbarWidth: "thin" }}>
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
            <AnimatePresence initial={false}>
              {recargas.map((r, i) => {
                const procTime = getProcessingTime(r);
                return (
                  <motion.div
                    key={r.id}
                    layout
                    initial={{ opacity: 0, y: 60, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -30, scale: 0.95 }}
                    transition={{ duration: 0.5, delay: Math.min(i * 0.04, 0.4), ease: "easeOut" }}
                    className="px-4 py-3 border-b border-border/50 hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {statusIcon(r.status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-sm ${opColor(r.operadora)}`}>{r.operadora || "—"}</span>
                          <span className="text-xs text-muted-foreground font-mono">{r.telefone}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-muted-foreground">{fmtTime(r.created_at)}</span>
                          {procTime && (
                            <span className="text-[10px] text-success font-medium">⚡ {procTime}</span>
                          )}
                          {!userId && userNames[r.user_id] && (
                            <span className="text-[10px] text-muted-foreground/60 truncate max-w-[100px]">• {userNames[r.user_id]}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-sm text-foreground">{fmt(r.valor)}</p>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${statusClass(r.status)}`}>
                          {statusLabel(r.status)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>
    </motion.div>
  );
}
