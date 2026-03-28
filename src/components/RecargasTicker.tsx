import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Clock, XCircle, Smartphone, Sparkles } from "lucide-react";
import { formatTimeBR } from "@/lib/timezone";

interface TickerItem {
  id: string;
  type: "recarga" | "scratch";
  // recarga fields
  telefone?: string;
  operadora?: string | null;
  valor: number;
  status?: string;
  created_at: string;
  user_id?: string;
  userName?: string;
  // scratch fields
  nome?: string;
}

async function fetchAllRecargas(): Promise<TickerItem[]> {
  const { data, error } = await supabase.rpc("get_ticker_recargas");
  if (error) {
    console.error("Ticker fetch error:", error.message);
    return [];
  }
  return (data || []).map((r: any) => ({ ...r, type: "recarga" as const }));
}

async function fetchScratchWinners(): Promise<TickerItem[]> {
  const { data, error } = await supabase.rpc("get_scratch_recent_winners");
  if (error) return [];
  return (data || []).map((w: any, i: number) => ({
    id: `scratch-${i}-${w.card_date}`,
    type: "scratch" as const,
    nome: w.nome,
    valor: Number(w.prize_amount),
    created_at: w.card_date,
    userName: w.nome,
  }));
}

export default function RecargasTicker() {
  const navigate = useNavigate();
  const [items, setItems] = useState<TickerItem[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const nameCache = useRef<Map<string, string>>(new Map());
  const scrollRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number | null>(null);
  const offsetRef = useRef(0);
  const isPaused = useRef(false);
  const speedPx = 1.2;

  const fetchAll = useCallback(async () => {
    try {
      const [recargas, winners] = await Promise.all([fetchAllRecargas(), fetchScratchWinners()]);

      // Resolve names for recargas
      const userIds = [...new Set(recargas.filter(r => r.user_id).map(r => r.user_id!))];
      const uncachedIds = userIds.filter(id => !nameCache.current.has(id));

      for (let i = 0; i < uncachedIds.length; i += 50) {
        const batch = uncachedIds.slice(i, i + 50);
        const { data: profiles } = await supabase
          .from("profiles_public")
          .select("id, nome")
          .in("id", batch);
        (profiles || []).forEach(p => { if (p.id) nameCache.current.set(p.id, p.nome || "Usuário"); });
      }

      const recargasWithNames = recargas.map(r => ({
        ...r,
        userName: nameCache.current.get(r.user_id!) || "Usuário",
      }));

      // Intercale winners entre as recargas (a cada ~15 itens)
      const merged: TickerItem[] = [];
      let wi = 0;
      for (let i = 0; i < recargasWithNames.length; i++) {
        merged.push(recargasWithNames[i]);
        if ((i + 1) % 15 === 0 && wi < winners.length) {
          merged.push(winners[wi++]);
        }
      }
      // Adiciona winners restantes no final
      while (wi < winners.length) {
        merged.push(winners[wi++]);
      }

      setItems(merged);
    } catch {
      // silent
    }
    setInitialLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    const ch = supabase
      .channel("ticker-global")
      .on("postgres_changes", { event: "*", schema: "public", table: "recargas" }, () => fetchAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "scratch_cards" }, () => fetchAll())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [fetchAll]);

  // JS-based smooth infinite scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || items.length < 3) return;

    const animate = () => {
      if (!isPaused.current && el) {
        offsetRef.current += speedPx;
        const halfWidth = el.scrollWidth / 2;
        if (offsetRef.current >= halfWidth) {
          offsetRef.current -= halfWidth;
        }
        el.style.transform = `translateX(-${offsetRef.current}px)`;
      }
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [items]);

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
    return "text-primary";
  };

  const fmtTime = (d: string) => {
    try { return formatTimeBR(d); } catch { return ""; }
  };

  if (initialLoading) {
    return (
      <div className="bg-card backdrop-blur-md border-b border-border">
        <div className="flex items-center h-8">
          <div className="shrink-0 flex items-center gap-1 px-3 border-r border-border bg-primary/10 h-full">
            <Smartphone className="h-3.5 w-3.5 text-primary animate-pulse" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Live</span>
          </div>
          <div className="flex-1 px-3 flex items-center gap-2">
            <div className="h-3 w-20 bg-muted rounded animate-pulse" />
            <div className="h-3 w-16 bg-muted rounded animate-pulse hidden sm:block" />
            <div className="h-3 w-24 bg-muted rounded animate-pulse hidden sm:block" />
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-card backdrop-blur-md border-b border-border">
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

  const renderItem = (item: TickerItem, suffix = "") => {
    if (item.type === "scratch") {
      return (
        <span key={item.id + suffix} className="inline-flex items-center gap-1.5 px-3 whitespace-nowrap">
          <span className="inline-flex items-center gap-1 bg-amber-500/15 text-amber-400 rounded-full px-2 py-0.5">
            <Sparkles className="h-3 w-3 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Raspadinha</span>
          </span>
          <span className="text-xs font-semibold text-amber-400">
            {item.userName}
          </span>
          <span className="text-xs text-muted-foreground">ganhou</span>
          <span className="text-xs font-bold text-amber-300">R$ {Number(item.valor).toFixed(2)}</span>
          <span className="text-[10px] text-amber-400/60">🎉</span>
        </span>
      );
    }

    return (
      <span key={item.id + suffix} className="inline-flex items-center gap-1.5 px-3 whitespace-nowrap">
        <button
          onClick={(e) => { e.stopPropagation(); isPaused.current = false; navigate(`/perfil/${item.user_id}`); }}
          className="text-xs font-semibold text-primary hover:underline cursor-pointer"
        >
          {item.userName} recarregou
        </button>
        {statusIcon(item.status || "")}
        <span className={`font-semibold text-xs ${opColor(item.operadora || null)}`}>{(item.operadora || "—").toUpperCase()}</span>
        <span className="text-xs text-muted-foreground font-mono">{(item.telefone || "").replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-****")}</span>
        <span className="text-xs font-bold text-foreground">R$ {Number(item.valor).toFixed(2)}</span>
        <span className="text-[10px] text-muted-foreground">{fmtTime(item.created_at)}</span>
      </span>
    );
  };

  return (
    <div
      className="bg-card backdrop-blur-md border-b border-border overflow-hidden"
      onMouseEnter={() => { isPaused.current = true; }}
      onMouseLeave={() => { isPaused.current = false; }}
      onTouchStart={() => { isPaused.current = true; }}
      onTouchEnd={() => { isPaused.current = false; }}
    >
      <div className="flex items-center h-8">
        <div className="shrink-0 flex items-center gap-1.5 px-3 border-r border-border bg-primary/10 h-full z-10">
          <Smartphone className="h-3.5 w-3.5 text-primary animate-soft-pulse" />
          <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Live</span>
        </div>
        <div className="overflow-hidden flex-1">
          <div ref={scrollRef} className="flex items-center will-change-transform" style={{ width: "max-content" }}>
            {items.map(r => renderItem(r))}
            {items.map(r => renderItem(r, "-dup"))}
          </div>
        </div>
      </div>
    </div>
  );
}