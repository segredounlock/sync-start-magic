import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, Clock, CheckCircle, XCircle, Loader2, Signal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
  const [recargas, setRecargas] = useState<Recarga[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecargas = async () => {
      const { data, error } = await supabase
        .from("recargas")
        .select("id, telefone, operadora, valor, custo, status, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (!error && data) setRecargas(data);
      setLoading(false);
    };
    fetchRecargas();
  }, [userId]);

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
              <h3 className="text-sm font-bold text-foreground truncate">{userName}</h3>
              <p className="text-[10px] text-muted-foreground">Últimas 10 recargas</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

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
