import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, Clock, CheckCircle, XCircle, Loader2, Signal, Plus, Wallet, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface UserRecargasModalProps {
  userId: string;
  userName: string;
  avatarUrl?: string | null;
  onClose: () => void;
}

interface Recarga {
  id: string;
  telefone: string;
  operadora: string | null;
  valor: number;
  custo: number;
  status: string;
  created_at: string;
}

export function UserRecargasModal({ userId, userName, avatarUrl, onClose }: UserRecargasModalProps) {
  const { role } = useAuth();
  const isAdmin = role === "admin";
  const [recargas, setRecargas] = useState<Recarga[]>([]);
  const [loading, setLoading] = useState(true);
  const [saldo, setSaldo] = useState<number>(0);
  const [showAddSaldo, setShowAddSaldo] = useState(false);
  const [addValue, setAddValue] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [recargasRes, saldoRes] = await Promise.all([
        supabase
          .from("recargas")
          .select("id, telefone, operadora, valor, custo, status, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("saldos")
          .select("valor")
          .eq("user_id", userId)
          .eq("tipo", "revenda")
          .maybeSingle(),
      ]);

      if (!recargasRes.error && recargasRes.data) setRecargas(recargasRes.data);
      if (!saldoRes.error && saldoRes.data) setSaldo(saldoRes.data.valor);
      setLoading(false);
    };
    fetchData();
  }, [userId]);

  const handleAddSaldo = async () => {
    const valor = parseFloat(addValue.replace(",", "."));
    if (!valor || valor <= 0) {
      toast.error("Insira um valor válido");
      return;
    }
    setAdding(true);
    try {
      const { data: current } = await supabase
        .from("saldos")
        .select("valor")
        .eq("user_id", userId)
        .eq("tipo", "revenda")
        .maybeSingle();

      const novoValor = (current?.valor || 0) + valor;
      const { error } = await supabase
        .from("saldos")
        .update({ valor: novoValor })
        .eq("user_id", userId)
        .eq("tipo", "revenda");

      if (error) throw error;
      setSaldo(novoValor);
      setAddValue("");
      setShowAddSaldo(false);
      toast.success(`R$ ${valor.toFixed(2)} adicionado ao saldo`);
    } catch {
      toast.error("Erro ao adicionar saldo");
    } finally {
      setAdding(false);
    }
  };

  const statusConfig: Record<string, { icon: typeof CheckCircle; color: string; label: string }> = {
    completed: { icon: CheckCircle, color: "text-emerald-400", label: "Concluída" },
    pending: { icon: Loader2, color: "text-yellow-400", label: "Pendente" },
    failed: { icon: XCircle, color: "text-red-400", label: "Falhou" },
    processing: { icon: Loader2, color: "text-blue-400", label: "Processando" },
  };

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) +
      " " + date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  const formatCurrency = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-card border border-border rounded-2xl shadow-2xl w-[95%] max-w-md max-h-[80vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/30">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-primary/30" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                {(userName[0] || "U").toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground truncate">{userName}</h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                  {formatCurrency(saldo)}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">Últimas 10 recargas</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* Quick actions bar (admin only) */}
          {isAdmin && (
            <div className="px-4 py-2 border-b border-border bg-muted/15">
              <AnimatePresence mode="wait">
                {showAddSaldo ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2"
                  >
                    <div className="flex-1 relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">R$</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="0,00"
                        value={addValue}
                        onChange={(e) => setAddValue(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        autoFocus
                        onKeyDown={(e) => e.key === "Enter" && handleAddSaldo()}
                      />
                    </div>
                    <button
                      onClick={handleAddSaldo}
                      disabled={adding}
                      className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 transition-colors disabled:opacity-50"
                    >
                      {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => { setShowAddSaldo(false); setAddValue(""); }}
                      className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Wallet className="h-3.5 w-3.5" />
                      <span className="text-[11px]">Saldo Revenda</span>
                    </div>
                    <button
                      onClick={() => setShowAddSaldo(true)}
                      className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                      Adicionar Saldo
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
              </div>
            ) : recargas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Signal className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">Nenhuma recarga encontrada</p>
              </div>
            ) : (
              recargas.map((r) => {
                const st = statusConfig[r.status] || statusConfig.pending;
                const StatusIcon = st.icon;
                return (
                  <div key={r.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      r.status === "completed" ? "bg-emerald-500/15" : r.status === "failed" ? "bg-red-500/15" : "bg-yellow-500/15"
                    }`}>
                      <StatusIcon className={`h-4 w-4 ${st.color} ${r.status === "pending" || r.status === "processing" ? "animate-spin" : ""}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-mono text-foreground">{r.telefone}</span>
                        {r.operadora && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-medium uppercase">{r.operadora}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Clock className="h-2.5 w-2.5 text-muted-foreground/60" />
                        <span className="text-[10px] text-muted-foreground">{formatDate(r.created_at)}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-bold text-foreground">{formatCurrency(r.valor)}</p>
                      <p className="text-[9px] text-muted-foreground">{st.label}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
