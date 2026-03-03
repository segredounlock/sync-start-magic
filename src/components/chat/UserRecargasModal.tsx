import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, Clock, CheckCircle, XCircle, Loader2, Signal, Plus, Minus, Target, Wallet, Check, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { VerificationBadge, BadgeType } from "@/components/VerificationBadge";

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

type SaldoAction = "add" | "remove" | "set" | null;

export function UserRecargasModal({ userId, userName, avatarUrl, onClose }: UserRecargasModalProps) {
  const { role, user: currentUser } = useAuth();
  const isAdmin = role === "admin";
  const [recargas, setRecargas] = useState<Recarga[]>([]);
  const [loading, setLoading] = useState(true);
  const [saldo, setSaldo] = useState<number>(0);
  const [activeAction, setActiveAction] = useState<SaldoAction>(null);
  const [actionValue, setActionValue] = useState("");
  const [processing, setProcessing] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userBadge, setUserBadge] = useState<string | null>(null);
  const [showBadgePicker, setShowBadgePicker] = useState(false);

  const badgeOptions: { value: string | null; label: string; icon: string }[] = [
    { value: null, label: "Nenhum", icon: "❌" },
    { value: "verificado", label: "Verificado", icon: "✅" },
    { value: "diamante", label: "Diamante", icon: "💎" },
    { value: "top", label: "Top", icon: "🔥" },
    { value: "elite", label: "Elite", icon: "🏆" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      const [recargasRes, saldoRes, profileRes] = await Promise.all([
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
        supabase
          .from("profiles")
          .select("email, verification_badge")
          .eq("id", userId)
          .maybeSingle(),
      ]);

      if (!recargasRes.error && recargasRes.data) setRecargas(recargasRes.data);
      if (!saldoRes.error && saldoRes.data) setSaldo(saldoRes.data.valor);
      if (!profileRes.error && profileRes.data) {
        setUserEmail(profileRes.data.email);
        setUserBadge(profileRes.data.verification_badge);
      }
      setLoading(false);
    };
    fetchData();
  }, [userId]);

  const handleBadgeChange = async (badge: string | null) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ verification_badge: badge })
        .eq("id", userId);
      if (error) throw error;
      setUserBadge(badge);
      setShowBadgePicker(false);
      toast.success(badge ? `Selo ${badge} atribuído` : "Selo removido");
    } catch {
      toast.error("Erro ao atualizar selo");
    }
  };

  const handleSaldoAction = async () => {
    if (!activeAction || !currentUser) return;
    const valor = parseFloat(actionValue.replace(",", "."));
    if (isNaN(valor) || valor < 0 || (activeAction !== "set" && valor <= 0)) {
      toast.error("Insira um valor válido");
      return;
    }
    setProcessing(true);
    try {
      const { data: current } = await supabase
        .from("saldos")
        .select("valor")
        .eq("user_id", userId)
        .eq("tipo", "revenda")
        .maybeSingle();

      const saldoAtual = current?.valor || 0;
      let novoValor: number;
      let transactionType: string;
      let transactionAmount: number;

      switch (activeAction) {
        case "add":
          novoValor = saldoAtual + valor;
          transactionType = "admin_credit";
          transactionAmount = valor;
          break;
        case "remove":
          novoValor = Math.max(0, saldoAtual - valor);
          transactionType = "admin_debit";
          transactionAmount = Math.min(valor, saldoAtual);
          break;
        case "set":
          novoValor = valor;
          transactionType = valor >= saldoAtual ? "admin_credit" : "admin_debit";
          transactionAmount = Math.abs(valor - saldoAtual);
          break;
        default:
          return;
      }

      const { error } = await supabase
        .from("saldos")
        .update({ valor: novoValor })
        .eq("user_id", userId)
        .eq("tipo", "revenda");

      if (error) throw error;

      // Register transaction for audit
      if (transactionAmount > 0) {
        await supabase.from("transactions").insert({
          user_id: userId,
          type: transactionType,
          amount: transactionAmount,
          status: "completed",
          module: "chat_balance",
          metadata: {
            action: activeAction,
            previous_balance: saldoAtual,
            new_balance: novoValor,
            performed_by: currentUser.id,
          },
        });
      }

      setSaldo(novoValor);
      setActionValue("");
      setActiveAction(null);

      const labels = { add: "adicionado", remove: "removido", set: "definido" };
      toast.success(`Saldo ${labels[activeAction]} com sucesso`);
    } catch {
      toast.error("Erro ao atualizar saldo");
    } finally {
      setProcessing(false);
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

  const actionLabels: Record<string, { label: string; placeholder: string }> = {
    add: { label: "Adicionar", placeholder: "Valor a adicionar" },
    remove: { label: "Remover", placeholder: "Valor a remover" },
    set: { label: "Definir", placeholder: "Novo saldo" },
  };

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
                {userBadge && <VerificationBadge badge={userBadge as BadgeType} size="sm" />}
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                  {formatCurrency(saldo)}
                </span>
              </div>
              {userEmail && (
                <p className="text-[10px] text-muted-foreground truncate">{userEmail}</p>
              )}
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-[10px] text-muted-foreground">Últimas 10 recargas</p>
                {isAdmin && (
                  <div className="relative">
                    <button
                      onClick={() => setShowBadgePicker(!showBadgePicker)}
                      className="flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded-md bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                    >
                      <Shield className="h-2.5 w-2.5" />
                      Selo
                    </button>
                    {showBadgePicker && (
                      <div className="absolute left-0 top-full mt-1 z-50 bg-card border border-border rounded-xl shadow-lg p-1.5 min-w-[140px]">
                        {badgeOptions.map((opt) => (
                          <button
                            key={opt.label}
                            onClick={() => handleBadgeChange(opt.value)}
                            className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-[11px] rounded-lg hover:bg-muted/60 transition-colors ${userBadge === opt.value ? "bg-primary/10 text-primary font-semibold" : "text-foreground"}`}
                          >
                            <span>{opt.icon}</span>
                            <span>{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* Quick actions bar (admin only) */}
          {isAdmin && (
            <div className="px-4 py-2 border-b border-border bg-muted/15">
              <AnimatePresence mode="wait">
                {activeAction ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                        {actionLabels[activeAction].label} Saldo
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">R$</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          placeholder={actionLabels[activeAction].placeholder}
                          value={actionValue}
                          onChange={(e) => setActionValue(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          autoFocus
                          onKeyDown={(e) => e.key === "Enter" && handleSaldoAction()}
                        />
                      </div>
                      <button
                        onClick={handleSaldoAction}
                        disabled={processing}
                        className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 transition-colors disabled:opacity-50"
                      >
                        {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => { setActiveAction(null); setActionValue(""); }}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="btns" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Wallet className="h-3.5 w-3.5" />
                      <span className="text-[11px]">Saldo Revenda</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setActiveAction("add")}
                        className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                        title="Adicionar saldo"
                      >
                        <Plus className="h-3 w-3" />
                        Adicionar
                      </button>
                      <button
                        onClick={() => setActiveAction("remove")}
                        className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                        title="Remover saldo"
                      >
                        <Minus className="h-3 w-3" />
                        Remover
                      </button>
                      <button
                        onClick={() => setActiveAction("set")}
                        className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors"
                        title="Definir saldo"
                      >
                        <Target className="h-3 w-3" />
                        Definir
                      </button>
                    </div>
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
