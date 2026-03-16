import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Currency } from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import { styledToast as toast } from "@/lib/toast";
import {
  Banknote, CheckCircle2, XCircle, Clock, Loader2, Search, Filter,
  ChevronDown, RefreshCw, User, Calendar, DollarSign, AlertTriangle,
} from "lucide-react";
import { formatFullDateTimeBR } from "@/lib/timezone";
import { confirm } from "@/lib/confirm";
import { logAudit } from "@/lib/auditLog";

interface SaqueTransaction {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  type: string;
  module: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
  // joined
  user_nome?: string;
  user_email?: string;
  user_avatar?: string;
  pix_key?: string;
  pix_key_type?: string;
}

type SaqueFilter = "pending" | "approved" | "completed" | "rejected" | "all";

export function SaquesSection({ onCountUpdate }: { onCountUpdate?: (count: number) => void }) {
  const [saques, setSaques] = useState<SaqueTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<SaqueFilter>("pending");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const fetchSaques = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("transactions")
        .select("*")
        .eq("type", "saque")
        .order("created_at", { ascending: false })
        .limit(200);

      if (filter !== "all") {
        query = query.eq("status", filter);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch user profiles
      const userIds = [...new Set((data || []).map(t => t.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, nome, email, avatar_url")
        .in("id", userIds);

      // Fetch pix keys from reseller_config
      const { data: pixConfigs } = await supabase
        .from("reseller_config")
        .select("user_id, value")
        .in("user_id", userIds)
        .eq("key", "pix_key_value");

      const profileMap = new Map((profiles || []).map(p => [p.id, p]));
      const pixMap = new Map((pixConfigs || []).map(p => [p.user_id, p.value]));

      const enriched: SaqueTransaction[] = (data || []).map(t => {
        const profile = profileMap.get(t.user_id);
        return {
          ...t,
          user_nome: profile?.nome || profile?.email?.split("@")[0] || "Usuário",
          user_email: profile?.email || "",
          user_avatar: profile?.avatar_url || "",
          pix_key: pixMap.get(t.user_id) || (t.metadata as any)?.pix_key || "",
        };
      });

      setSaques(enriched);

      // Update pending count
      const pendingCount = filter === "pending"
        ? enriched.length
        : (await supabase.from("transactions").select("*", { count: "exact", head: true }).eq("type", "saque").eq("status", "pending")).count || 0;
      onCountUpdate?.(pendingCount);
    } catch {
      toast.error("Erro ao carregar saques");
    } finally {
      setLoading(false);
    }
  }, [filter, onCountUpdate]);

  useEffect(() => { fetchSaques(); }, [fetchSaques]);

  const handleAction = async (saque: SaqueTransaction, newStatus: "approved" | "completed" | "rejected") => {
    const labels: Record<string, string> = { approved: "aprovar", completed: "marcar como pago", rejected: "rejeitar" };
    const ok = await confirm(`${labels[newStatus]?.replace(/^\w/, c => c.toUpperCase())} saque de ${saque.user_nome} — R$ ${saque.amount.toFixed(2)}?`);
    if (!ok) return;

    setActionLoading(prev => ({ ...prev, [saque.id]: true }));
    try {
      // Update transaction status
      const { error } = await supabase
        .from("transactions")
        .update({ status: newStatus, updated_at: new Date().toISOString(), metadata: { ...(saque.metadata || {}), [`${newStatus}_at`]: new Date().toISOString() } } as any)
        .eq("id", saque.id);
      if (error) throw error;

      // If rejected, refund the balance
      if (newStatus === "rejected") {
        await supabase.rpc("increment_saldo", { p_user_id: saque.user_id, p_tipo: "pessoal", p_amount: saque.amount });
      }

      await logAudit(`saque_${newStatus}`, "transaction", saque.id, { amount: saque.amount, user_nome: saque.user_nome, user_email: saque.user_email });

      toast.success(`Saque ${newStatus === "completed" ? "pago" : newStatus === "approved" ? "aprovado" : "rejeitado"} com sucesso!`);
      fetchSaques();
    } catch {
      toast.error("Erro ao processar saque");
    } finally {
      setActionLoading(prev => ({ ...prev, [saque.id]: false }));
    }
  };

  const filtered = saques.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.user_nome?.toLowerCase().includes(q) || s.user_email?.toLowerCase().includes(q) || s.amount.toString().includes(q);
  });

  const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
    pending: { label: "Pendente", color: "text-warning", bg: "bg-warning/10", icon: Clock },
    approved: { label: "Aprovado", color: "text-[hsl(200,80%,55%)]", bg: "bg-[hsl(200,80%,55%)]/10", icon: CheckCircle2 },
    completed: { label: "Pago", color: "text-success", bg: "bg-success/10", icon: CheckCircle2 },
    rejected: { label: "Rejeitado", color: "text-destructive", bg: "bg-destructive/10", icon: XCircle },
  };

  const totalPending = saques.filter(s => s.status === "pending").reduce((a, s) => a + s.amount, 0);
  const totalCompleted = saques.filter(s => s.status === "completed").reduce((a, s) => a + s.amount, 0);

  return (
    <div className="space-y-4">
      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Pendentes", value: saques.filter(s => s.status === "pending").length, color: "text-warning", icon: Clock },
          { label: "Valor Pendente", value: totalPending, isCurrency: true, color: "text-warning", icon: AlertTriangle },
          { label: "Total Pagos", value: saques.filter(s => s.status === "completed").length, color: "text-success", icon: CheckCircle2 },
          { label: "Valor Pago", value: totalCompleted, isCurrency: true, color: "text-success", icon: DollarSign },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{stat.label}</p>
            </div>
            <p className={`text-xl font-bold ${stat.color}`}>
              {stat.isCurrency ? <Currency value={stat.value as number} duration={600} /> : stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {(["pending", "approved", "completed", "rejected", "all"] as SaqueFilter[]).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                filter === f ? "bg-primary text-primary-foreground" : "bg-muted/60 text-muted-foreground hover:bg-muted"
              }`}>
              {f === "all" ? "Todos" : statusConfig[f]?.label || f}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nome, email..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <button onClick={fetchSaques} className="p-2 rounded-lg border border-input hover:bg-muted/60 transition-colors">
            <RefreshCw className={`h-4 w-4 text-muted-foreground ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center">
          <Banknote className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Nenhuma solicitação de saque encontrada.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((saque, i) => {
              const sc = statusConfig[saque.status] || statusConfig.pending;
              const StatusIcon = sc.icon;
              const isProcessing = actionLoading[saque.id];

              return (
                <motion.div key={saque.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: i * 0.02 }}
                  className="glass-card rounded-xl p-4"
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="shrink-0">
                      {saque.user_avatar ? (
                        <img src={saque.user_avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-foreground truncate">{saque.user_nome}</p>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${sc.color} ${sc.bg}`}>
                          <StatusIcon className="h-3 w-3" /> {sc.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{saque.user_email}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatFullDateTimeBR(saque.created_at)}
                        </span>
                        {saque.pix_key && (
                          <span className="flex items-center gap-1 text-primary font-medium">
                            🔑 {saque.pix_key}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-foreground">
                        <Currency value={saque.amount} duration={400} />
                      </p>
                      <p className="text-[10px] text-muted-foreground">{saque.module || "comissões"}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  {saque.status === "pending" && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                      <button onClick={() => handleAction(saque, "approved")} disabled={isProcessing}
                        className="flex-1 py-2 rounded-lg bg-[hsl(200,80%,55%)]/10 text-[hsl(200,80%,55%)] text-xs font-bold hover:bg-[hsl(200,80%,55%)]/20 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50">
                        {isProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                        Aprovar
                      </button>
                      <button onClick={() => handleAction(saque, "completed")} disabled={isProcessing}
                        className="flex-1 py-2 rounded-lg bg-success/10 text-success text-xs font-bold hover:bg-success/20 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50">
                        {isProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Banknote className="h-3.5 w-3.5" />}
                        Pagar
                      </button>
                      <button onClick={() => handleAction(saque, "rejected")} disabled={isProcessing}
                        className="flex-1 py-2 rounded-lg bg-destructive/10 text-destructive text-xs font-bold hover:bg-destructive/20 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50">
                        {isProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                        Rejeitar
                      </button>
                    </div>
                  )}
                  {saque.status === "approved" && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                      <button onClick={() => handleAction(saque, "completed")} disabled={isProcessing}
                        className="flex-1 py-2 rounded-lg bg-success/10 text-success text-xs font-bold hover:bg-success/20 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50">
                        {isProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Banknote className="h-3.5 w-3.5" />}
                        Marcar como Pago
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
