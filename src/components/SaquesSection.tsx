import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Currency } from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import { styledToast as toast } from "@/lib/toast";
import {
  Banknote, CheckCircle2, XCircle, Clock, Loader2, Search,
  ChevronDown, ChevronUp, RefreshCw, User, Calendar, DollarSign, AlertTriangle,
  Copy, Hash, Wallet,
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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [userBalances, setUserBalances] = useState<Record<string, number>>({});

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

      const userIds = [...new Set((data || []).map(t => t.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, nome, email, avatar_url")
        .in("id", userIds);

      const { data: pixConfigs } = await supabase
        .from("reseller_config")
        .select("user_id, key, value")
        .in("user_id", userIds)
        .in("key", ["pix_key_value", "pix_key_type"]);

      const profileMap = new Map((profiles || []).map(p => [p.id, p]));
      const pixValueMap = new Map<string, string>();
      const pixTypeMap = new Map<string, string>();
      for (const p of pixConfigs || []) {
        if (p.key === "pix_key_value") pixValueMap.set(p.user_id, p.value || "");
        if (p.key === "pix_key_type") pixTypeMap.set(p.user_id, p.value || "");
      }

      const enriched: SaqueTransaction[] = (data || []).map(t => {
        const profile = profileMap.get(t.user_id);
        const meta = t.metadata as any;
        return {
          ...t,
          user_nome: profile?.nome || profile?.email?.split("@")[0] || "Usuário",
          user_email: profile?.email || "",
          user_avatar: profile?.avatar_url || "",
          pix_key: pixValueMap.get(t.user_id) || meta?.pix_key || "",
          pix_key_type: pixTypeMap.get(t.user_id) || meta?.pix_key_type || "",
        };
      });

      setSaques(enriched);

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
      const { error } = await supabase
        .from("transactions")
        .update({ status: newStatus, updated_at: new Date().toISOString(), metadata: { ...(saque.metadata || {}), [`${newStatus}_at`]: new Date().toISOString() } } as any)
        .eq("id", saque.id);
      if (error) throw error;

      if (newStatus === "rejected") {
        await supabase.rpc("increment_saldo", { p_user_id: saque.user_id, p_tipo: "pessoal", p_amount: saque.amount });
      }

      await logAudit(`saque_${newStatus}`, "transaction", saque.id, { amount: saque.amount, user_nome: saque.user_nome, user_email: saque.user_email });

      supabase.functions.invoke("telegram-notify", {
        body: {
          type: `saque_${newStatus}`,
          user_id: saque.user_id,
          data: { amount: saque.amount, pix_key: saque.pix_key || "" },
        },
      }).catch(() => {});

      const pushLabels: Record<string, { title: string; body: string }> = {
        approved: { title: "✅ Saque Aprovado", body: `Seu saque de R$ ${saque.amount.toFixed(2)} foi aprovado!` },
        completed: { title: "🎉 Saque Pago!", body: `R$ ${saque.amount.toFixed(2)} enviado para sua chave PIX!` },
        rejected: { title: "❌ Saque Rejeitado", body: `Seu saque de R$ ${saque.amount.toFixed(2)} foi rejeitado. Saldo estornado.` },
      };
      if (pushLabels[newStatus]) {
        supabase.functions.invoke("send-push", {
          body: { ...pushLabels[newStatus], user_ids: [saque.user_id] },
        }).catch(() => {});
      }

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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => toast.success(`${label} copiado!`)).catch(() => toast.error("Erro ao copiar"));
  };

  const toggleExpand = async (saque: SaqueTransaction) => {
    if (expandedId === saque.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(saque.id);
    if (!(saque.user_id in userBalances)) {
      const { data } = await supabase.from("saldos").select("valor").eq("user_id", saque.user_id).eq("tipo", "pessoal").maybeSingle();
      setUserBalances(prev => ({ ...prev, [saque.user_id]: data?.valor ?? 0 }));
    }
  };

  const TimelineDot = ({ done, label, date, color }: { done: boolean; label: string; date?: string; color: string }) => (
    <div className="flex items-start gap-2">
      <div className={`mt-0.5 w-3 h-3 rounded-full border-2 shrink-0 ${done ? color : "border-muted-foreground/30"}`}
        style={done ? { backgroundColor: "currentColor" } : {}} />
      <div className="min-w-0">
        <p className={`text-xs font-semibold ${done ? "text-foreground" : "text-muted-foreground/50"}`}>{label}</p>
        {date && <p className="text-[10px] text-muted-foreground">{formatFullDateTimeBR(date)}</p>}
      </div>
    </div>
  );

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
              const isExpanded = expandedId === saque.id;
              const meta = (saque.metadata || {}) as any;

              return (
                <motion.div key={saque.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: i * 0.02 }}
                  className="glass-card rounded-xl overflow-hidden"
                >
                  {/* Main card — clickable */}
                  <div className="p-4 cursor-pointer" onClick={() => toggleExpand(saque)}>
                    <div className="flex items-start gap-3">
                      <div className="shrink-0">
                        {saque.user_avatar ? (
                          <img src={saque.user_avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                        )}
                      </div>

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
                        </div>
                      </div>

                      <div className="text-right shrink-0 flex flex-col items-end gap-1">
                        <p className="text-lg font-bold text-foreground">
                          <Currency value={saque.amount} duration={400} />
                        </p>
                        <div className="flex items-center gap-1">
                          <p className="text-[10px] text-muted-foreground">{saque.module || "comissões"}</p>
                          {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded detail panel */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-2 border-t border-border bg-muted/30 space-y-4">
                          {/* Timeline */}
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Timeline</p>
                            <div className="flex flex-col gap-1 pl-1">
                              <TimelineDot done label="Solicitado" date={saque.created_at} color="text-warning" />
                              <div className="ml-[5px] w-px h-3 bg-border" />
                              <TimelineDot done={!!meta.approved_at} label="Aprovado" date={meta.approved_at} color="text-[hsl(200,80%,55%)]" />
                              <div className="ml-[5px] w-px h-3 bg-border" />
                              {saque.status === "rejected" ? (
                                <TimelineDot done label="Rejeitado" date={meta.rejected_at} color="text-destructive" />
                              ) : (
                                <TimelineDot done={!!meta.completed_at} label="Pago" date={meta.completed_at} color="text-success" />
                              )}
                            </div>
                          </div>

                          {/* PIX Data */}
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Dados PIX</p>
                            {saque.pix_key ? (
                              <div className="flex items-center gap-2 bg-background/60 rounded-lg px-3 py-2 border border-border">
                                <div className="flex-1 min-w-0">
                                  {saque.pix_key_type && (
                                    <p className="text-[10px] uppercase text-muted-foreground font-semibold">{saque.pix_key_type}</p>
                                  )}
                                  <p className="text-sm font-mono font-bold text-foreground truncate">{saque.pix_key}</p>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); copyToClipboard(saque.pix_key!, "Chave PIX"); }}
                                  className="p-2 rounded-lg hover:bg-muted transition-colors shrink-0" title="Copiar chave PIX">
                                  <Copy className="h-4 w-4 text-primary" />
                                </button>
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground italic">Chave PIX não cadastrada</p>
                            )}
                          </div>

                          {/* Extra info grid */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-background/60 rounded-lg px-3 py-2 border border-border">
                              <p className="text-[10px] uppercase text-muted-foreground font-semibold flex items-center gap-1">
                                <Hash className="h-3 w-3" /> ID Transação
                              </p>
                              <div className="flex items-center gap-1">
                                <p className="text-[11px] font-mono text-foreground truncate">{saque.id.slice(0, 8)}…</p>
                                <button onClick={(e) => { e.stopPropagation(); copyToClipboard(saque.id, "ID"); }}
                                  className="p-1 rounded hover:bg-muted transition-colors shrink-0">
                                  <Copy className="h-3 w-3 text-muted-foreground" />
                                </button>
                              </div>
                            </div>

                            <div className="bg-background/60 rounded-lg px-3 py-2 border border-border">
                              <p className="text-[10px] uppercase text-muted-foreground font-semibold flex items-center gap-1">
                                <Wallet className="h-3 w-3" /> Saldo Pessoal
                              </p>
                              <p className="text-sm font-bold text-foreground">
                                {saque.user_id in userBalances ? (
                                  <Currency value={userBalances[saque.user_id]} duration={400} />
                                ) : (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground inline" />
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Actions */}
                  {saque.status === "pending" && (
                    <div className="flex gap-2 px-4 pb-4 pt-1">
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
                    <div className="flex gap-2 px-4 pb-4 pt-1">
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
