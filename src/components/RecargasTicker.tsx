import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Clock, XCircle, Smartphone } from "lucide-react";

interface TickerRecarga {
  id: string;
  telefone: string;
  operadora: string | null;
  valor: number;
  status: string;
  created_at: string;
  user_id: string;
  userName?: string;
}

export default function RecargasTicker() {
  const [recargas, setRecargas] = useState<TickerRecarga[]>([]);

  const fetchRecargas = useCallback(async () => {
    const { data } = await supabase
      .from("recargas")
      .select("id, telefone, operadora, valor, status, created_at, user_id")
      .order("created_at", { ascending: false })
      .limit(30);
    if (!data || data.length === 0) { setRecargas([]); return; }

    // Fetch user names
    const userIds = [...new Set(data.map(r => r.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, nome")
      .in("id", userIds);
    const nameMap = new Map((profiles || []).map(p => [p.id, p.nome || "Usuário"]));

    setRecargas(data.map(r => ({ ...r, userName: nameMap.get(r.user_id) || "Usuário" })));
  }, []);

  useEffect(() => { fetchRecargas(); }, [fetchRecargas]);

  useEffect(() => {
    const ch = supabase
      .channel("ticker-global")
      .on("postgres_changes", { event: "*", schema: "public", table: "recargas" }, () => fetchRecargas())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [fetchRecargas]);

  const statusIcon = (s: string) => {
    if (s === "completed" || s === "concluida") return <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />;
    if (s === "pending") return <Clock className="h-3.5 w-3.5 text-warning shrink-0 animate-pulse" />;
    if (s === "falha") return <XCircle className="h-3.5 w-3.5 text-destructive shrink-0" />;
    return null;
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

  const fmtTime = (d: string) => {
    try { return new Date(d).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }); } catch { return ""; }
  };

  if (recargas.length === 0) {
    return (
      <div className="sticky top-[57px] md:top-0 left-0 right-0 z-[19] bg-card backdrop-blur-md border-b border-border">
        <div className="flex items-center h-8">
          <div className="shrink-0 flex items-center gap-1 px-3 border-r border-border bg-primary/10 h-full">
            <Smartphone className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Live</span>
          </div>
          <div className="flex-1 px-3">
            <span className="text-xs text-muted-foreground">Aguardando recargas em tempo real...</span>
          </div>
        </div>
      </div>
    );
  }

  const items = recargas.map((r) => (
    <span key={r.id} className="inline-flex items-center gap-1.5 px-3 whitespace-nowrap">
      <span className="text-xs font-semibold text-primary">{r.userName} recarregou</span>
      {statusIcon(r.status)}
      <span className={`font-semibold text-xs ${opColor(r.operadora)}`}>{r.operadora || "—"}</span>
      <span className="text-xs text-muted-foreground font-mono">{r.telefone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-****")}</span>
      <span className="text-xs font-bold text-foreground">R$ {Number(r.valor).toFixed(2)}</span>
      <span className="text-[10px] text-muted-foreground">{fmtTime(r.created_at)}</span>
    </span>
  ));

  const shouldAnimate = recargas.length >= 5;

  return (
    <div className="sticky top-[57px] md:top-0 left-0 right-0 z-[19] bg-card backdrop-blur-md border-b border-border overflow-hidden">
      <div className="flex items-center h-8">
        <div className="shrink-0 flex items-center gap-1 px-3 border-r border-border bg-primary/10 h-full">
          <Smartphone className="h-3.5 w-3.5 text-primary" />
          <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Live</span>
        </div>
        <div className="overflow-hidden flex-1">
          <div className={`flex items-center ${shouldAnimate ? "ticker-scroll" : ""}`}>
            {items}
            {shouldAnimate && items}
          </div>
        </div>
      </div>
    </div>
  );
}
